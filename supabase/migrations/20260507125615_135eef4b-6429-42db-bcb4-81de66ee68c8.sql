DROP POLICY IF EXISTS "Authenticated can view blood requests" ON public.blood_requests;

CREATE POLICY "Owner and responding donors view requests"
ON public.blood_requests
FOR SELECT
TO authenticated
USING (
  auth.uid() = patient_id
  OR EXISTS (
    SELECT 1 FROM public.donor_responses dr
    WHERE dr.request_id = blood_requests.id AND dr.donor_id = auth.uid()
  )
);

DROP VIEW IF EXISTS public.blood_requests_safe;
CREATE VIEW public.blood_requests_safe
WITH (security_invoker = off) AS
SELECT
  id, blood_group, city, created_at, donation_type,
  expires_at, fulfilled_at, hospital_address, hospital_name,
  latitude, longitude, notes, patient_id, state,
  status, units_needed, updated_at, urgency
FROM public.blood_requests;

GRANT SELECT ON public.blood_requests_safe TO authenticated, anon;

CREATE POLICY "Participants can delete responses"
ON public.donor_responses
FOR DELETE
TO authenticated
USING (
  auth.uid() = donor_id
  OR auth.uid() IN (SELECT patient_id FROM public.blood_requests WHERE id = donor_responses.request_id)
);