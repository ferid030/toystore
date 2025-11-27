-- Create buckets
INSERT INTO storage.buckets (id, name, public) VALUES ('toys', 'toys', true);
INSERT INTO storage.buckets (id, name, public) VALUES ('receipts', 'receipts', false);

-- Helper function to check admin role
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Policy for 'toys' bucket
-- Allow public read
CREATE POLICY "Public Access Toys" ON storage.objects FOR SELECT USING ( bucket_id = 'toys' );

-- Allow admin insert/update/delete
CREATE POLICY "Admin Insert Toys" ON storage.objects FOR INSERT WITH CHECK ( bucket_id = 'toys' AND public.is_admin() );
CREATE POLICY "Admin Update Toys" ON storage.objects FOR UPDATE USING ( bucket_id = 'toys' AND public.is_admin() );
CREATE POLICY "Admin Delete Toys" ON storage.objects FOR DELETE USING ( bucket_id = 'toys' AND public.is_admin() );

-- Policy for 'receipts' bucket
-- Allow authenticated users to upload
CREATE POLICY "Users Upload Receipts" ON storage.objects FOR INSERT WITH CHECK ( bucket_id = 'receipts' AND auth.role() = 'authenticated' );

-- Allow users to view their own receipts
CREATE POLICY "Users View Own Receipts" ON storage.objects FOR SELECT USING ( bucket_id = 'receipts' AND auth.uid() = owner );

-- Allow admin to view all receipts
CREATE POLICY "Admin View Receipts" ON storage.objects FOR SELECT USING ( bucket_id = 'receipts' AND public.is_admin() );
