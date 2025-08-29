-- Fix function security by setting search_path
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER 
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.generate_tracking_number()
RETURNS TEXT 
LANGUAGE plpgsql
SECURITY DEFINER 
SET search_path = public
AS $$
BEGIN
  RETURN 'SL' || TO_CHAR(NOW(), 'YYYYMMDD') || LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0');
END;
$$;
-- // ==========================
/*
Run this migration in Supabase SQL editor or via CLI
*/
alter table public.shipments
add column if not exists sender_email text,
add column if not exists receiver_email text,
add column if not exists shipping_fee numeric,
add column if not exists sending_date date,
add column if not exists delivery_date date;


-- (Optional) basic RLS policies if table has RLS enabled
-- adjust roles/conditions to your app needs
-- enable row level security;
-- create policy "allow insert for authenticated" on public.shipments
-- for insert to authenticated using (true) with check (auth.uid() = created_by);
-- create policy "allow select for all" on public.shipments
-- for select using (true);
-- create policy "allow update by creator" on public.shipments
-- for update to authenticated using (auth.uid() = created_by);