-- Drop the open SELECT policy on profiles
DROP POLICY IF EXISTS "Profiles are viewable by authenticated users" ON public.profiles;

-- Users can read their own full profile only
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Security-definer function for donor discovery (non-sensitive fields only)
CREATE OR REPLACE FUNCTION public.get_donor_profiles(
  p_blood_group text DEFAULT NULL,
  p_city text DEFAULT NULL
)
RETURNS TABLE (
  id uuid,
  user_id uuid,
  full_name text,
  blood_group public.blood_group,
  city text,
  state text,
  is_available boolean,
  platelet_donor boolean,
  donation_count integer,
  donor_score integer,
  last_donation_date date,
  avatar_url text
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    p.id, p.user_id, p.full_name, p.blood_group, p.city, p.state,
    p.is_available, p.platelet_donor, p.donation_count, p.donor_score,
    p.last_donation_date, p.avatar_url
  FROM public.profiles p
  WHERE p.role = 'donor'
    AND (p_blood_group IS NULL OR p.blood_group::text = p_blood_group)
    AND (p_city IS NULL OR p.city ILIKE '%' || p_city || '%');
$$;

-- Function to get contact phone only for authorized users
CREATE OR REPLACE FUNCTION public.get_request_contact_phone(p_request_id uuid)
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT br.contact_phone
  FROM public.blood_requests br
  WHERE br.id = p_request_id
    AND (
      br.patient_id = auth.uid()
      OR EXISTS (
        SELECT 1 FROM public.donor_responses dr
        WHERE dr.request_id = br.id
          AND dr.donor_id = auth.uid()
          AND dr.status IN ('accepted', 'confirmed')
      )
    );
$$;