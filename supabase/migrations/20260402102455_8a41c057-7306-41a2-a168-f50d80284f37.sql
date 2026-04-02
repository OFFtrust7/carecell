-- Fix: Set view to SECURITY INVOKER (runs with querying user's permissions)
ALTER VIEW public.blood_requests_safe SET (security_invoker = on);