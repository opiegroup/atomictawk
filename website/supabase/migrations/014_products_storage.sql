-- Create storage buckets for products and documents
-- Migration: 014_products_storage.sql

-- =============================================
-- PRODUCTS BUCKET (images)
-- =============================================
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'products',
  'products',
  true,
  5242880, -- 5MB
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp']
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 5242880,
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

-- =============================================
-- DOCUMENTS BUCKET (PDFs, docs)
-- =============================================
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'documents',
  'documents',
  true,
  10485760, -- 10MB
  ARRAY['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 10485760,
  allowed_mime_types = ARRAY['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];

-- =============================================
-- POLICIES FOR PRODUCTS BUCKET
-- =============================================
DROP POLICY IF EXISTS "Public read access for products" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload products" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update products" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete products" ON storage.objects;
DROP POLICY IF EXISTS "Allow all uploads to products" ON storage.objects;
DROP POLICY IF EXISTS "Allow all updates to products" ON storage.objects;
DROP POLICY IF EXISTS "Allow all deletes from products" ON storage.objects;

CREATE POLICY "Public read access for products"
ON storage.objects FOR SELECT
USING (bucket_id = 'products');

CREATE POLICY "Allow all uploads to products"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'products');

CREATE POLICY "Allow all updates to products"
ON storage.objects FOR UPDATE
USING (bucket_id = 'products');

CREATE POLICY "Allow all deletes from products"
ON storage.objects FOR DELETE
USING (bucket_id = 'products');

-- =============================================
-- POLICIES FOR DOCUMENTS BUCKET
-- =============================================
DROP POLICY IF EXISTS "Public read access for documents" ON storage.objects;
DROP POLICY IF EXISTS "Allow all uploads to documents" ON storage.objects;
DROP POLICY IF EXISTS "Allow all updates to documents" ON storage.objects;
DROP POLICY IF EXISTS "Allow all deletes from documents" ON storage.objects;

CREATE POLICY "Public read access for documents"
ON storage.objects FOR SELECT
USING (bucket_id = 'documents');

CREATE POLICY "Allow all uploads to documents"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'documents');

CREATE POLICY "Allow all updates to documents"
ON storage.objects FOR UPDATE
USING (bucket_id = 'documents');

CREATE POLICY "Allow all deletes from documents"
ON storage.objects FOR DELETE
USING (bucket_id = 'documents');
