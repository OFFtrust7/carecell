-- ============ REALTIME ENABLEMENT ============
ALTER TABLE public.emergency_requests REPLICA IDENTITY FULL;
ALTER TABLE public.notifications REPLICA IDENTITY FULL;
ALTER TABLE public.donor_responses REPLICA IDENTITY FULL;
ALTER TABLE public.blood_requests REPLICA IDENTITY FULL;

DO $$
BEGIN
  BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE public.emergency_requests; EXCEPTION WHEN duplicate_object THEN NULL; END;
  BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications; EXCEPTION WHEN duplicate_object THEN NULL; END;
  BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE public.donor_responses; EXCEPTION WHEN duplicate_object THEN NULL; END;
  BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE public.blood_requests; EXCEPTION WHEN duplicate_object THEN NULL; END;
END $$;

-- ============ HAVERSINE HELPER ============
CREATE OR REPLACE FUNCTION public.haversine_km(lat1 double precision, lon1 double precision, lat2 double precision, lon2 double precision)
RETURNS double precision
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT 2 * 6371 * asin(sqrt(
    sin(radians((lat2 - lat1) / 2)) ^ 2 +
    cos(radians(lat1)) * cos(radians(lat2)) * sin(radians((lon2 - lon1) / 2)) ^ 2
  ));
$$;

-- ============ MATCH DONORS V2 ============
CREATE OR REPLACE FUNCTION public.match_donors_v2(
  p_blood_group text,
  p_city text DEFAULT NULL,
  p_lat double precision DEFAULT NULL,
  p_lng double precision DEFAULT NULL,
  p_emergency boolean DEFAULT false,
  p_limit integer DEFAULT 30
)
RETURNS TABLE(
  user_id uuid, full_name text, blood_group blood_group, city text, state text,
  donor_score integer, donation_count integer, is_available boolean,
  next_eligible_date date, last_donation_date date, accepts_emergency_calls boolean,
  distance_km double precision, match_score integer, match_label text
)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  WITH scored AS (
    SELECT
      p.user_id, p.full_name, p.blood_group, p.city, p.state,
      p.donor_score, p.donation_count, p.is_available,
      de.next_eligible_date, p.last_donation_date, p.accepts_emergency_calls,
      CASE WHEN p_lat IS NOT NULL AND p_lng IS NOT NULL AND p.latitude IS NOT NULL AND p.longitude IS NOT NULL
           THEN public.haversine_km(p_lat, p_lng, p.latitude, p.longitude) END AS distance_km,
      (
        (CASE WHEN p.is_available THEN 40 ELSE 0 END)
        + (CASE WHEN de.next_eligible_date IS NULL OR de.next_eligible_date <= CURRENT_DATE THEN 30 ELSE 0 END)
        + (CASE WHEN p_city IS NOT NULL AND p.city ILIKE '%' || p_city || '%' THEN 15 ELSE 0 END)
        + (CASE WHEN p_emergency AND p.accepts_emergency_calls THEN 25 ELSE 0 END)
        + LEAST(p.donor_score, 30)
        + LEAST(p.donation_count * 2, 20)
        + (CASE
            WHEN p_lat IS NOT NULL AND p.latitude IS NOT NULL THEN
              GREATEST(0, 30 - (public.haversine_km(p_lat, p_lng, p.latitude, p.longitude))::int)
            ELSE 0 END)
      )::integer AS match_score
    FROM public.profiles p
    LEFT JOIN public.donor_eligibility de ON de.user_id = p.user_id
    WHERE p.role = 'donor'
      AND p.blood_group::text = p_blood_group
      AND (de.is_eligible IS NULL OR de.is_eligible = true)
  ),
  ranked AS (
    SELECT *, ROW_NUMBER() OVER (ORDER BY match_score DESC, distance_km ASC NULLS LAST) AS rn
    FROM scored
  )
  SELECT user_id, full_name, blood_group, city, state, donor_score, donation_count,
    is_available, next_eligible_date, last_donation_date, accepts_emergency_calls,
    distance_km, match_score,
    CASE
      WHEN rn = 1 THEN 'Top Match'
      WHEN rn <= 3 AND is_available AND (next_eligible_date IS NULL OR next_eligible_date <= CURRENT_DATE) THEN 'Fastest Available'
      ELSE 'Backup'
    END AS match_label
  FROM ranked
  ORDER BY rn
  LIMIT p_limit;
$$;

-- ============ EMERGENCY → NOTIFICATIONS ============
CREATE OR REPLACE FUNCTION public.notify_donors_on_emergency()
RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.notifications (user_id, title, body, type, reference_id)
  SELECT p.user_id,
    '🚨 Emergency: ' || NEW.blood_group || ' needed',
    NEW.patient_name || ' needs help — ' || NEW.reason || COALESCE(' (' || NEW.city || ')', ''),
    'emergency',
    NEW.id
  FROM public.profiles p
  LEFT JOIN public.donor_eligibility de ON de.user_id = p.user_id
  WHERE p.role = 'donor'
    AND p.blood_group::text = NEW.blood_group::text
    AND p.accepts_emergency_calls = true
    AND p.is_available = true
    AND (de.is_eligible IS NULL OR de.is_eligible = true)
    AND p.user_id <> NEW.patient_id;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_notify_donors_on_emergency ON public.emergency_requests;
CREATE TRIGGER trg_notify_donors_on_emergency
AFTER INSERT ON public.emergency_requests
FOR EACH ROW EXECUTE FUNCTION public.notify_donors_on_emergency();

-- ============ REQUEST STATUS → PATIENT NOTIFICATION ============
CREATE OR REPLACE FUNCTION public.notify_on_request_status_change()
RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  IF NEW.status IS DISTINCT FROM OLD.status THEN
    INSERT INTO public.notifications (user_id, title, body, type, reference_id)
    VALUES (
      NEW.patient_id,
      'Request status: ' || NEW.status,
      'Your blood request for ' || NEW.blood_group || ' is now "' || NEW.status || '".',
      'request_status',
      NEW.id
    );
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_notify_on_request_status_change ON public.blood_requests;
CREATE TRIGGER trg_notify_on_request_status_change
AFTER UPDATE ON public.blood_requests
FOR EACH ROW EXECUTE FUNCTION public.notify_on_request_status_change();

-- ============ ACCEPT CAREGIVER INVITE ============
CREATE OR REPLACE FUNCTION public.accept_caregiver_invite(p_invite_code text)
RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  v_link RECORD;
  v_uid uuid := auth.uid();
BEGIN
  IF v_uid IS NULL THEN
    RETURN jsonb_build_object('ok', false, 'error', 'not_authenticated');
  END IF;

  SELECT * INTO v_link FROM public.caregiver_links
  WHERE invite_code = p_invite_code AND status = 'pending'
  LIMIT 1;

  IF v_link IS NULL THEN
    RETURN jsonb_build_object('ok', false, 'error', 'invalid_code');
  END IF;

  IF v_link.patient_id = v_uid THEN
    RETURN jsonb_build_object('ok', false, 'error', 'cannot_accept_own_invite');
  END IF;

  UPDATE public.caregiver_links
  SET caregiver_id = v_uid, status = 'active', accepted_at = now()
  WHERE id = v_link.id;

  -- Notify patient
  INSERT INTO public.notifications (user_id, title, body, type, reference_id)
  VALUES (
    v_link.patient_id,
    'Caregiver joined',
    'A caregiver has accepted your invite and now has ' ||
      CASE WHEN v_link.access_scope = 'view_edit' THEN 'view + edit' ELSE 'view-only' END ||
      ' access.',
    'caregiver_accepted',
    v_link.id
  );

  RETURN jsonb_build_object('ok', true, 'patient_id', v_link.patient_id, 'access_scope', v_link.access_scope);
END;
$$;

-- ============ ALLOW PATIENT TO LIST CAREGIVING-LINKED PATIENTS ============
-- Caregivers need to read the patient's profile (limited fields via policy).
DROP POLICY IF EXISTS "Caregivers view linked patient profile" ON public.profiles;
CREATE POLICY "Caregivers view linked patient profile"
ON public.profiles FOR SELECT TO authenticated
USING (public.is_active_caregiver(user_id, auth.uid()));