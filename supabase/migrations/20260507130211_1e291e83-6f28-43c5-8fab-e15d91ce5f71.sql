-- Drop the security-definer view and replace with a function that returns
-- only safe columns. This avoids exposing contact_phone/patient_name while
-- still letting any signed-in donor browse active requests.
DROP VIEW IF EXISTS public.blood_requests_safe;

CREATE OR REPLACE FUNCTION public.list_active_blood_requests()
RETURNS TABLE (
  id uuid, blood_group blood_group, city text, created_at timestamptz,
  donation_type donation_type, expires_at timestamptz, fulfilled_at timestamptz,
  hospital_address text, hospital_name text, latitude double precision,
  longitude double precision, notes text, patient_id uuid, state text,
  status request_status, units_needed integer, updated_at timestamptz,
  urgency request_urgency
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT id, blood_group, city, created_at, donation_type, expires_at,
         fulfilled_at, hospital_address, hospital_name, latitude, longitude,
         notes, patient_id, state, status, units_needed, updated_at, urgency
  FROM public.blood_requests
  WHERE status = 'active';
$$;

REVOKE ALL ON FUNCTION public.list_active_blood_requests() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.list_active_blood_requests() TO authenticated;

-- Revoke anon EXECUTE on all SECURITY DEFINER helper functions
REVOKE EXECUTE ON FUNCTION public.accept_caregiver_invite(text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.accept_caregiver_invite(text) TO authenticated;

REVOKE EXECUTE ON FUNCTION public.is_active_caregiver(uuid, uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.is_active_caregiver(uuid, uuid) TO authenticated;

REVOKE EXECUTE ON FUNCTION public.is_active_caregiver_with_edit(uuid, uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.is_active_caregiver_with_edit(uuid, uuid) TO authenticated;

REVOKE EXECUTE ON FUNCTION public.match_donors(text, text, integer) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.match_donors(text, text, integer) TO authenticated;

REVOKE EXECUTE ON FUNCTION public.match_donors_v2(text, text, double precision, double precision, boolean, integer) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.match_donors_v2(text, text, double precision, double precision, boolean, integer) TO authenticated;

REVOKE EXECUTE ON FUNCTION public.get_donor_profiles(text, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_donor_profiles(text, text) TO authenticated;

REVOKE EXECUTE ON FUNCTION public.get_request_contact_phone(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_request_contact_phone(uuid) TO authenticated;