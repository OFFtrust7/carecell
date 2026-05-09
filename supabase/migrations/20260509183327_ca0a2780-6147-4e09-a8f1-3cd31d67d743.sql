
-- 1) Fix broken policy on request_status_history
DROP POLICY IF EXISTS "Participants view request history" ON public.request_status_history;
CREATE POLICY "Participants view request history"
ON public.request_status_history
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.blood_requests br
    WHERE br.id = request_status_history.request_id
      AND br.patient_id = auth.uid()
  )
  OR EXISTS (
    SELECT 1 FROM public.donor_responses dr
    WHERE dr.request_id = request_status_history.request_id
      AND dr.donor_id = auth.uid()
  )
);

-- 2) Restrict emergency_requests SELECT to owner only
DROP POLICY IF EXISTS "All authenticated see active emergencies" ON public.emergency_requests;

-- 3) Safe list function (no contact_phone, no patient_name)
CREATE OR REPLACE FUNCTION public.list_active_emergencies()
RETURNS TABLE(
  id uuid,
  blood_group blood_group,
  reason text,
  hospital_name text,
  city text,
  latitude double precision,
  longitude double precision,
  status text,
  created_at timestamptz,
  patient_id uuid
)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT id, blood_group, reason, hospital_name, city, latitude, longitude,
         status, created_at, patient_id
  FROM public.emergency_requests
  WHERE status = 'active'
  ORDER BY created_at DESC
  LIMIT 50;
$$;

REVOKE ALL ON FUNCTION public.list_active_emergencies() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.list_active_emergencies() TO authenticated;

-- 4) Contact reveal: only owner or donor with matching blood group
CREATE OR REPLACE FUNCTION public.get_emergency_contact(p_id uuid)
RETURNS TABLE(patient_name text, contact_phone text)
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_uid uuid := auth.uid();
  v_caller_bg text;
  v_emerg RECORD;
BEGIN
  IF v_uid IS NULL THEN
    RETURN;
  END IF;

  SELECT * INTO v_emerg FROM public.emergency_requests WHERE id = p_id AND status = 'active';
  IF v_emerg IS NULL THEN
    RETURN;
  END IF;

  IF v_emerg.patient_id = v_uid THEN
    RETURN QUERY SELECT v_emerg.patient_name, v_emerg.contact_phone;
    RETURN;
  END IF;

  SELECT blood_group::text INTO v_caller_bg FROM public.profiles WHERE user_id = v_uid;
  IF v_caller_bg IS NOT NULL AND v_caller_bg = v_emerg.blood_group::text THEN
    RETURN QUERY SELECT v_emerg.patient_name, v_emerg.contact_phone;
  END IF;
END;
$$;

REVOKE ALL ON FUNCTION public.get_emergency_contact(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_emergency_contact(uuid) TO authenticated;
