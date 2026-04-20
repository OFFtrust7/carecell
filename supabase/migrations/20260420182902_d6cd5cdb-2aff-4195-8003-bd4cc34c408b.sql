
-- ============================================================
-- 1. PROFILE ADDITIONS (donor matching + emergency)
-- ============================================================
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS weight_kg numeric,
  ADD COLUMN IF NOT EXISTS chronic_conditions text,
  ADD COLUMN IF NOT EXISTS medications text,
  ADD COLUMN IF NOT EXISTS last_health_check date,
  ADD COLUMN IF NOT EXISTS accepts_emergency_calls boolean NOT NULL DEFAULT true;

-- ============================================================
-- 2. CAREGIVER LINKS (needed early — RLS on docs/treatments references it)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.caregiver_links (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id uuid NOT NULL,
  caregiver_id uuid,                       -- nullable until invite is accepted
  caregiver_email text NOT NULL,
  relationship text,                       -- e.g. "spouse", "parent"
  access_scope text NOT NULL DEFAULT 'view' CHECK (access_scope IN ('view','view_edit')),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','active','revoked')),
  invite_code text UNIQUE DEFAULT encode(gen_random_bytes(8), 'hex'),
  created_at timestamptz NOT NULL DEFAULT now(),
  accepted_at timestamptz,
  UNIQUE(patient_id, caregiver_email)
);

ALTER TABLE public.caregiver_links ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_caregiver_links_patient ON public.caregiver_links(patient_id);
CREATE INDEX IF NOT EXISTS idx_caregiver_links_caregiver ON public.caregiver_links(caregiver_id);

-- Security-definer helper used by RLS policies on documents & timeline
CREATE OR REPLACE FUNCTION public.is_active_caregiver(p_patient uuid, p_caregiver uuid)
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.caregiver_links
    WHERE patient_id = p_patient
      AND caregiver_id = p_caregiver
      AND status = 'active'
  );
$$;

CREATE OR REPLACE FUNCTION public.is_active_caregiver_with_edit(p_patient uuid, p_caregiver uuid)
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.caregiver_links
    WHERE patient_id = p_patient
      AND caregiver_id = p_caregiver
      AND status = 'active'
      AND access_scope = 'view_edit'
  );
$$;

-- Patient can manage their invitations
CREATE POLICY "Patient manages own caregiver links"
  ON public.caregiver_links
  FOR ALL TO authenticated
  USING (auth.uid() = patient_id)
  WITH CHECK (auth.uid() = patient_id);

-- Caregiver can view + accept their own invite (by user_id once linked)
CREATE POLICY "Caregiver views own link"
  ON public.caregiver_links
  FOR SELECT TO authenticated
  USING (auth.uid() = caregiver_id);

CREATE POLICY "Caregiver accepts own link"
  ON public.caregiver_links
  FOR UPDATE TO authenticated
  USING (auth.uid() = caregiver_id)
  WITH CHECK (auth.uid() = caregiver_id);

-- ============================================================
-- 3. REQUEST STATUS HISTORY
-- ============================================================
CREATE TABLE IF NOT EXISTS public.request_status_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id uuid NOT NULL REFERENCES public.blood_requests(id) ON DELETE CASCADE,
  changed_by uuid,
  old_status text,
  new_status text NOT NULL,
  note text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.request_status_history ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS idx_rsh_request ON public.request_status_history(request_id);

-- Patient (owner) and any donor who responded can see history
CREATE POLICY "Participants view request history"
  ON public.request_status_history
  FOR SELECT TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.blood_requests br WHERE br.id = request_id AND br.patient_id = auth.uid())
    OR EXISTS (SELECT 1 FROM public.donor_responses dr WHERE dr.request_id = request_id AND dr.donor_id = auth.uid())
  );

-- Trigger to auto-log status changes
CREATE OR REPLACE FUNCTION public.log_request_status_change()
RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.request_status_history (request_id, changed_by, old_status, new_status, note)
    VALUES (NEW.id, NEW.patient_id, NULL, NEW.status::text, 'Request created');
    RETURN NEW;
  END IF;

  IF NEW.status IS DISTINCT FROM OLD.status THEN
    INSERT INTO public.request_status_history (request_id, changed_by, old_status, new_status)
    VALUES (NEW.id, auth.uid(), OLD.status::text, NEW.status::text);
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_log_request_status_insert ON public.blood_requests;
CREATE TRIGGER trg_log_request_status_insert
  AFTER INSERT ON public.blood_requests
  FOR EACH ROW EXECUTE FUNCTION public.log_request_status_change();

DROP TRIGGER IF EXISTS trg_log_request_status_update ON public.blood_requests;
CREATE TRIGGER trg_log_request_status_update
  AFTER UPDATE ON public.blood_requests
  FOR EACH ROW EXECUTE FUNCTION public.log_request_status_change();

-- ============================================================
-- 4. DONOR ELIGIBILITY
-- ============================================================
CREATE TABLE IF NOT EXISTS public.donor_eligibility (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  is_eligible boolean NOT NULL DEFAULT true,
  ineligibility_reason text,
  recent_illness boolean NOT NULL DEFAULT false,
  recent_travel boolean NOT NULL DEFAULT false,
  on_medication boolean NOT NULL DEFAULT false,
  next_eligible_date date,
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.donor_eligibility ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS idx_donor_eligibility_user ON public.donor_eligibility(user_id);

CREATE POLICY "Donor manages own eligibility"
  ON public.donor_eligibility
  FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Recompute next_eligible_date when last_donation_date or platelet flag changes on profiles
CREATE OR REPLACE FUNCTION public.recompute_next_eligible_date()
RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  v_next date;
BEGIN
  IF NEW.last_donation_date IS NULL THEN
    v_next := NULL;
  ELSIF NEW.platelet_donor THEN
    v_next := NEW.last_donation_date + INTERVAL '14 days';
  ELSE
    v_next := NEW.last_donation_date + INTERVAL '90 days';
  END IF;

  INSERT INTO public.donor_eligibility (user_id, next_eligible_date)
  VALUES (NEW.user_id, v_next)
  ON CONFLICT (user_id) DO UPDATE
    SET next_eligible_date = EXCLUDED.next_eligible_date,
        updated_at = now();

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_recompute_next_eligible ON public.profiles;
CREATE TRIGGER trg_recompute_next_eligible
  AFTER INSERT OR UPDATE OF last_donation_date, platelet_donor ON public.profiles
  FOR EACH ROW
  WHEN (NEW.role = 'donor')
  EXECUTE FUNCTION public.recompute_next_eligible_date();

-- ============================================================
-- 5. DONOR MATCHING FUNCTION
-- ============================================================
CREATE OR REPLACE FUNCTION public.match_donors(
  p_blood_group text,
  p_city text DEFAULT NULL,
  p_limit integer DEFAULT 20
)
RETURNS TABLE (
  user_id uuid,
  full_name text,
  blood_group blood_group,
  city text,
  state text,
  donor_score integer,
  donation_count integer,
  is_available boolean,
  next_eligible_date date,
  last_donation_date date,
  match_score integer
)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT
    p.user_id,
    p.full_name,
    p.blood_group,
    p.city,
    p.state,
    p.donor_score,
    p.donation_count,
    p.is_available,
    de.next_eligible_date,
    p.last_donation_date,
    (
      (CASE WHEN p.is_available THEN 50 ELSE 0 END)
      + (CASE WHEN de.next_eligible_date IS NULL OR de.next_eligible_date <= CURRENT_DATE THEN 30 ELSE 0 END)
      + (CASE WHEN p_city IS NOT NULL AND p.city ILIKE '%' || p_city || '%' THEN 20 ELSE 0 END)
      + LEAST(p.donor_score, 50)
    )::integer AS match_score
  FROM public.profiles p
  LEFT JOIN public.donor_eligibility de ON de.user_id = p.user_id
  WHERE p.role = 'donor'
    AND p.blood_group::text = p_blood_group
    AND (de.is_eligible IS NULL OR de.is_eligible = true)
  ORDER BY match_score DESC, p.donor_score DESC, p.last_donation_date ASC NULLS FIRST
  LIMIT p_limit;
$$;

-- ============================================================
-- 6. MEDICAL DOCUMENTS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.medical_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id uuid NOT NULL,
  uploaded_by uuid NOT NULL,
  doc_type text NOT NULL CHECK (doc_type IN ('lab_report','prescription','scan','discharge_summary','other')),
  title text NOT NULL,
  notes text,
  file_path text NOT NULL,
  file_size_kb integer,
  mime_type text,
  document_date date,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.medical_documents ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS idx_medical_docs_patient ON public.medical_documents(patient_id);

CREATE POLICY "Patient manages own documents"
  ON public.medical_documents
  FOR ALL TO authenticated
  USING (auth.uid() = patient_id)
  WITH CHECK (auth.uid() = patient_id);

CREATE POLICY "Active caregivers view documents"
  ON public.medical_documents
  FOR SELECT TO authenticated
  USING (public.is_active_caregiver(patient_id, auth.uid()));

CREATE POLICY "Edit-caregivers can upload documents"
  ON public.medical_documents
  FOR INSERT TO authenticated
  WITH CHECK (
    public.is_active_caregiver_with_edit(patient_id, auth.uid())
    AND uploaded_by = auth.uid()
  );

-- ============================================================
-- 7. TREATMENT TIMELINE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.treatment_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id uuid NOT NULL,
  event_type text NOT NULL CHECK (event_type IN ('chemo_cycle','surgery','lab_test','follow_up','medication','milestone','other')),
  title text NOT NULL,
  description text,
  event_date date NOT NULL,
  doctor_name text,
  hospital_name text,
  status text NOT NULL DEFAULT 'planned' CHECK (status IN ('planned','completed','missed','cancelled')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.treatment_events ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS idx_treatment_events_patient ON public.treatment_events(patient_id);
CREATE INDEX IF NOT EXISTS idx_treatment_events_date ON public.treatment_events(event_date);

CREATE POLICY "Patient manages own treatment events"
  ON public.treatment_events
  FOR ALL TO authenticated
  USING (auth.uid() = patient_id)
  WITH CHECK (auth.uid() = patient_id);

CREATE POLICY "Active caregivers view treatment events"
  ON public.treatment_events
  FOR SELECT TO authenticated
  USING (public.is_active_caregiver(patient_id, auth.uid()));

CREATE POLICY "Edit-caregivers manage treatment events"
  ON public.treatment_events
  FOR INSERT TO authenticated
  WITH CHECK (public.is_active_caregiver_with_edit(patient_id, auth.uid()));

CREATE POLICY "Edit-caregivers update treatment events"
  ON public.treatment_events
  FOR UPDATE TO authenticated
  USING (public.is_active_caregiver_with_edit(patient_id, auth.uid()));

CREATE TRIGGER trg_treatment_events_updated
  BEFORE UPDATE ON public.treatment_events
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================================
-- 8. EMERGENCY REQUESTS (fast SOS)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.emergency_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id uuid NOT NULL,
  patient_name text NOT NULL,
  blood_group blood_group NOT NULL,
  reason text NOT NULL,
  hospital_name text,
  city text,
  contact_phone text NOT NULL,
  latitude double precision,
  longitude double precision,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active','resolved','cancelled')),
  resolved_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.emergency_requests ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS idx_emergency_requests_status ON public.emergency_requests(status);

CREATE POLICY "Patient manages own emergencies"
  ON public.emergency_requests
  FOR ALL TO authenticated
  USING (auth.uid() = patient_id)
  WITH CHECK (auth.uid() = patient_id);

CREATE POLICY "All authenticated see active emergencies"
  ON public.emergency_requests
  FOR SELECT TO authenticated
  USING (status = 'active');

-- ============================================================
-- 9. STORAGE BUCKET FOR MEDICAL DOCUMENTS
-- ============================================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('medical-documents', 'medical-documents', false)
ON CONFLICT (id) DO NOTHING;

-- Patient owns folder named after their user_id; can read/write inside it
CREATE POLICY "Patients read own medical files"
  ON storage.objects FOR SELECT TO authenticated
  USING (
    bucket_id = 'medical-documents'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Patients upload own medical files"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'medical-documents'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Patients update own medical files"
  ON storage.objects FOR UPDATE TO authenticated
  USING (
    bucket_id = 'medical-documents'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Patients delete own medical files"
  ON storage.objects FOR DELETE TO authenticated
  USING (
    bucket_id = 'medical-documents'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Active caregivers can read patient's medical files
CREATE POLICY "Caregivers read patient medical files"
  ON storage.objects FOR SELECT TO authenticated
  USING (
    bucket_id = 'medical-documents'
    AND public.is_active_caregiver(
      ((storage.foldername(name))[1])::uuid,
      auth.uid()
    )
  );
