
-- Create enums
CREATE TYPE public.user_role AS ENUM ('patient', 'donor');
CREATE TYPE public.blood_group AS ENUM ('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-');
CREATE TYPE public.request_urgency AS ENUM ('critical', 'urgent', 'normal');
CREATE TYPE public.request_status AS ENUM ('active', 'fulfilled', 'expired', 'cancelled');
CREATE TYPE public.donation_type AS ENUM ('whole_blood', 'platelets', 'plasma');
CREATE TYPE public.donor_response_status AS ENUM ('offered', 'accepted', 'declined', 'confirmed');

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Profiles table
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  role user_role NOT NULL DEFAULT 'donor',
  full_name TEXT NOT NULL DEFAULT '',
  phone TEXT,
  blood_group blood_group,
  date_of_birth DATE,
  gender TEXT,
  city TEXT,
  state TEXT,
  pin_code TEXT,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  avatar_url TEXT,
  -- Donor-specific fields
  is_available BOOLEAN NOT NULL DEFAULT true,
  platelet_donor BOOLEAN NOT NULL DEFAULT false,
  last_donation_date DATE,
  donation_count INTEGER NOT NULL DEFAULT 0,
  donor_score INTEGER NOT NULL DEFAULT 0,
  -- Patient-specific fields
  cancer_type TEXT,
  cancer_stage TEXT,
  hospital_name TEXT,
  doctor_name TEXT,
  allergies TEXT,
  emergency_contact_name TEXT,
  emergency_contact_phone TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Profiles are viewable by authenticated users" ON public.profiles
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can insert their own profile" ON public.profiles
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE TO authenticated USING (auth.uid() = user_id);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', ''));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Blood requests table
CREATE TABLE public.blood_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  patient_name TEXT NOT NULL,
  blood_group blood_group NOT NULL,
  donation_type donation_type NOT NULL DEFAULT 'whole_blood',
  units_needed INTEGER NOT NULL DEFAULT 1,
  urgency request_urgency NOT NULL DEFAULT 'normal',
  status request_status NOT NULL DEFAULT 'active',
  hospital_name TEXT NOT NULL,
  hospital_address TEXT,
  city TEXT,
  state TEXT,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  notes TEXT,
  contact_phone TEXT,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  fulfilled_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.blood_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Active requests are viewable by authenticated users" ON public.blood_requests
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Patients can create requests" ON public.blood_requests
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = patient_id);

CREATE POLICY "Patients can update their own requests" ON public.blood_requests
  FOR UPDATE TO authenticated USING (auth.uid() = patient_id);

CREATE POLICY "Patients can delete their own requests" ON public.blood_requests
  FOR DELETE TO authenticated USING (auth.uid() = patient_id);

CREATE TRIGGER update_blood_requests_updated_at
  BEFORE UPDATE ON public.blood_requests
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Donor responses table
CREATE TABLE public.donor_responses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  request_id UUID NOT NULL REFERENCES public.blood_requests(id) ON DELETE CASCADE,
  donor_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status donor_response_status NOT NULL DEFAULT 'offered',
  message TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(request_id, donor_id)
);

ALTER TABLE public.donor_responses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Request owner and donor can view responses" ON public.donor_responses
  FOR SELECT TO authenticated USING (
    auth.uid() = donor_id OR
    auth.uid() IN (SELECT patient_id FROM public.blood_requests WHERE id = request_id)
  );

CREATE POLICY "Donors can create responses" ON public.donor_responses
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = donor_id);

CREATE POLICY "Response participants can update" ON public.donor_responses
  FOR UPDATE TO authenticated USING (
    auth.uid() = donor_id OR
    auth.uid() IN (SELECT patient_id FROM public.blood_requests WHERE id = request_id)
  );

CREATE TRIGGER update_donor_responses_updated_at
  BEFORE UPDATE ON public.donor_responses
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Indexes
CREATE INDEX idx_blood_requests_status ON public.blood_requests(status);
CREATE INDEX idx_blood_requests_blood_group ON public.blood_requests(blood_group);
CREATE INDEX idx_blood_requests_patient_id ON public.blood_requests(patient_id);
CREATE INDEX idx_donor_responses_request_id ON public.donor_responses(request_id);
CREATE INDEX idx_donor_responses_donor_id ON public.donor_responses(donor_id);
CREATE INDEX idx_profiles_blood_group ON public.profiles(blood_group);
CREATE INDEX idx_profiles_role ON public.profiles(role);

-- Enable realtime for requests
ALTER PUBLICATION supabase_realtime ADD TABLE public.blood_requests;
ALTER PUBLICATION supabase_realtime ADD TABLE public.donor_responses;
