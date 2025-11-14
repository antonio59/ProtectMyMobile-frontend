-- ProtectMyMobile Supabase Database Schema

-- Enable Row Level Security
ALTER DATABASE postgres SET "app.jwt_secret" TO 'your-jwt-secret';

-- IMEI Records Table
CREATE TABLE IF NOT EXISTS imei_records (
  id BIGSERIAL PRIMARY KEY,
  imei_number TEXT NOT NULL,
  device_name TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Enable RLS
ALTER TABLE imei_records ENABLE ROW LEVEL SECURITY;

-- Policies for imei_records
CREATE POLICY "Users can view their own IMEI records"
  ON imei_records FOR SELECT
  USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Anyone can create IMEI records"
  ON imei_records FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can delete their own IMEI records"
  ON imei_records FOR DELETE
  USING (auth.uid() = user_id);

-- Experience Reports Table
CREATE TABLE IF NOT EXISTS experience_reports (
  id BIGSERIAL PRIMARY KEY,
  has_experienced_theft BOOLEAN NOT NULL DEFAULT true,
  "when" TEXT NOT NULL,
  "where" TEXT NOT NULL,
  what_happened TEXT NOT NULL,
  doing_differently TEXT,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  approved BOOLEAN NOT NULL DEFAULT false,
  approved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Enable RLS
ALTER TABLE experience_reports ENABLE ROW LEVEL SECURITY;

-- Policies for experience_reports
CREATE POLICY "Anyone can view approved experiences"
  ON experience_reports FOR SELECT
  USING (approved = true);

CREATE POLICY "Admins can view all experiences"
  ON experience_reports FOR SELECT
  USING (
    auth.jwt() ->> 'role' = 'admin' OR 
    auth.jwt() ->> 'role' = 'super_admin'
  );

CREATE POLICY "Anyone can submit experiences"
  ON experience_reports FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Admins can update experiences"
  ON experience_reports FOR UPDATE
  USING (
    auth.jwt() ->> 'role' = 'admin' OR 
    auth.jwt() ->> 'role' = 'super_admin'
  );

CREATE POLICY "Super admins can delete experiences"
  ON experience_reports FOR DELETE
  USING (auth.jwt() ->> 'role' = 'super_admin');

-- Contact Submissions Table
CREATE TABLE IF NOT EXISTS contact_submissions (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  responded BOOLEAN NOT NULL DEFAULT false,
  response_message TEXT,
  responded_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Enable RLS
ALTER TABLE contact_submissions ENABLE ROW LEVEL SECURITY;

-- Policies for contact_submissions
CREATE POLICY "Admins can view contact submissions"
  ON contact_submissions FOR SELECT
  USING (
    auth.jwt() ->> 'role' = 'admin' OR 
    auth.jwt() ->> 'role' = 'super_admin'
  );

CREATE POLICY "Anyone can submit contact forms"
  ON contact_submissions FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Admins can update contact submissions"
  ON contact_submissions FOR UPDATE
  USING (
    auth.jwt() ->> 'role' = 'admin' OR 
    auth.jwt() ->> 'role' = 'super_admin'
  );

-- Admin Action History Table
CREATE TABLE IF NOT EXISTS admin_action_history (
  id BIGSERIAL PRIMARY KEY,
  admin_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  admin_username TEXT NOT NULL,
  action_type TEXT NOT NULL CHECK (action_type IN ('approve_experience', 'unapprove_experience', 'respond_contact', 'mark_spam')),
  target_id BIGINT NOT NULL,
  metadata TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Enable RLS
ALTER TABLE admin_action_history ENABLE ROW LEVEL SECURITY;

-- Policies for admin_action_history
CREATE POLICY "Admins can view action history"
  ON admin_action_history FOR SELECT
  USING (
    auth.jwt() ->> 'role' = 'admin' OR 
    auth.jwt() ->> 'role' = 'super_admin'
  );

CREATE POLICY "Admins can create action history"
  ON admin_action_history FOR INSERT
  WITH CHECK (
    auth.jwt() ->> 'role' = 'admin' OR 
    auth.jwt() ->> 'role' = 'super_admin'
  );

-- Create indexes for better performance
CREATE INDEX idx_imei_records_user_id ON imei_records(user_id);
CREATE INDEX idx_imei_records_created_at ON imei_records(created_at DESC);
CREATE INDEX idx_experience_reports_approved ON experience_reports(approved);
CREATE INDEX idx_experience_reports_created_at ON experience_reports(created_at DESC);
CREATE INDEX idx_contact_submissions_responded ON contact_submissions(responded);
CREATE INDEX idx_contact_submissions_created_at ON contact_submissions(created_at DESC);
CREATE INDEX idx_admin_action_history_admin_id ON admin_action_history(admin_id);
CREATE INDEX idx_admin_action_history_created_at ON admin_action_history(created_at DESC);

-- Grant permissions
GRANT ALL ON imei_records TO authenticated;
GRANT ALL ON experience_reports TO authenticated;
GRANT ALL ON contact_submissions TO authenticated;
GRANT ALL ON admin_action_history TO authenticated;

-- Allow anonymous access for public features
GRANT SELECT ON experience_reports TO anon;
GRANT INSERT ON experience_reports TO anon;
GRANT INSERT ON contact_submissions TO anon;
GRANT INSERT ON imei_records TO anon;
