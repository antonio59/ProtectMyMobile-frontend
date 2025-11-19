-- FIX FOR CONTACT FORM ERROR (500 Internal Server Error)
-- The error "new row violates row-level security policy" indicates that the database is blocking the insert.
-- Execute the following SQL in your Supabase SQL Editor to fix it.

-- 1. Ensure the table allows Row Level Security
ALTER TABLE contact_submissions ENABLE ROW LEVEL SECURITY;

-- 2. Drop the policy if it exists to avoid conflicts
DROP POLICY IF EXISTS "Anyone can submit contact forms" ON contact_submissions;

-- 3. Create the policy that allows anyone (including unauthenticated users) to insert data
CREATE POLICY "Anyone can submit contact forms"
  ON contact_submissions FOR INSERT
  WITH CHECK (true);

-- 4. Explicitly grant INSERT permissions to the 'anon' (public) role
GRANT INSERT ON contact_submissions TO anon;

-- 5. Verify it also works for logged-in users
GRANT INSERT ON contact_submissions TO authenticated;
