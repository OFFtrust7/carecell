DROP VIEW IF EXISTS public.blood_requests_safe;

CREATE VIEW public.blood_requests_safe
WITH (security_invoker = on) AS
SELECT
  id, blood_group, city, created_at, donation_type,
  expires_at, fulfilled_at, hospital_address, hospital_name,
  latitude, longitude, notes, patient_id, patient_name, state,
  status, units_needed, updated_at, urgency,
  CASE
    WHEN patient_id = auth.uid() THEN contact_phone
    WHEN EXISTS (
      SELECT 1 FROM public.donor_responses dr
      WHERE dr.request_id = blood_requests.id
        AND dr.donor_id = auth.uid()
        AND dr.status IN ('accepted', 'confirmed')
    ) THEN contact_phone
    ELSE NULL
  END AS contact_phone
FROM public.blood_requests;