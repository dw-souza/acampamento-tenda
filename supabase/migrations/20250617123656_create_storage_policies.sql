-- Create storage bucket for blog images
INSERT INTO storage.buckets (id, name, public) 
VALUES ('blog-images', 'blog-images', true)
ON CONFLICT (id) DO NOTHING;

-- Policy for public read access to blog images
CREATE POLICY "Public read access for blog images" ON storage.objects
    FOR SELECT USING (bucket_id = 'blog-images');

-- Policy for authenticated users to upload blog images
CREATE POLICY "Authenticated users can upload blog images" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'blog-images' 
        AND auth.role() = 'authenticated'
    );

-- Policy for authenticated users to update their own blog images
CREATE POLICY "Authenticated users can update blog images" ON storage.objects
    FOR UPDATE USING (
        bucket_id = 'blog-images' 
        AND auth.role() = 'authenticated'
    );

-- Policy for authenticated users to delete blog images
CREATE POLICY "Authenticated users can delete blog images" ON storage.objects
    FOR DELETE USING (
        bucket_id = 'blog-images' 
        AND auth.role() = 'authenticated'
    ); 