-- Run this in Supabase SQL Editor after registering the user
UPDATE public.users 
SET role = 'admin' 
WHERE email = 'abbaslif89@gmail.com';
