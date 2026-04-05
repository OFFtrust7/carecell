
-- Create notifications table
CREATE TABLE public.notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'donor_response',
  reference_id UUID,
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Users can only view their own notifications
CREATE POLICY "Users can view own notifications"
  ON public.notifications FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Users can update (mark read) their own notifications
CREATE POLICY "Users can update own notifications"
  ON public.notifications FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- Allow system inserts via trigger (security definer function)
-- No direct INSERT policy needed since trigger runs as definer

-- Create trigger function to auto-notify patient on donor response
CREATE OR REPLACE FUNCTION public.notify_patient_on_donor_response()
  RETURNS trigger
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path TO 'public'
AS $$
DECLARE
  v_patient_id UUID;
  v_blood_group TEXT;
  v_donor_name TEXT;
BEGIN
  -- Get patient_id and blood_group from the blood request
  SELECT patient_id, blood_group::text INTO v_patient_id, v_blood_group
  FROM public.blood_requests
  WHERE id = NEW.request_id;

  -- Get donor name
  SELECT full_name INTO v_donor_name
  FROM public.profiles
  WHERE user_id = NEW.donor_id
  LIMIT 1;

  -- Insert notification for the patient
  INSERT INTO public.notifications (user_id, title, body, type, reference_id)
  VALUES (
    v_patient_id,
    'New Donor Response',
    COALESCE(v_donor_name, 'A donor') || ' has offered to donate ' || v_blood_group || ' blood for your request.',
    'donor_response',
    NEW.request_id
  );

  RETURN NEW;
END;
$$;

-- Attach trigger
CREATE TRIGGER on_donor_response_notify
  AFTER INSERT ON public.donor_responses
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_patient_on_donor_response();
