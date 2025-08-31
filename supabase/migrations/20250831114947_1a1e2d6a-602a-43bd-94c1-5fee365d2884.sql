-- Insert a profile for the current user if it doesn't exist
INSERT INTO public.profiles (user_id, email, full_name, role) 
VALUES ('aa829a07-c0ce-47cf-b4be-64eba61d9be9', 'ekpenisirapadhael@gmail.com', 'Ekpenisi Erue Raphael', 'admin')
ON CONFLICT (user_id) DO NOTHING;