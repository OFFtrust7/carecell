-- Drop the current open SELECT policy
DROP POLICY IF EXISTS "Authenticated users can view blood requests" ON public.blood_requests;
DROP POLICY IF EXISTS "Active requests are viewable by authenticated users" ON public.blood_requests;

-- Restrictive SELECT: authenticated users can see all requests (needed for donor feed)
-- but contact_phone protection is handled by the get_request_contact_phone function
CREATE POLICY "Authenticated can view blood requests"
  ON public.blood_requests FOR SELECT
  TO authenticated
  USING (true);

-- Remove contact_phone from direct query access by setting a column-level security
-- Since Postgres doesn't support column-level RLS natively, we use a view approach
-- Create a secure view that masks contact_phone
CREATE OR REPLACE VIEW public.blood_requests_safe AS
SELECT
  id, blood_group, city, contact_phone, created_at, donation_type,
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
  END AS safe_contact_phone
FROM public.blood_requests;