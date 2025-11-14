-- ProtectMyMobile Supabase Database Schema
-- Run this in Supabase SQL Editor

-- IMEI Records Table - REMOVED (users should save locally instead)

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

-- News/Blog Posts Table
CREATE TABLE IF NOT EXISTS news_posts (
  id BIGSERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  excerpt TEXT NOT NULL,
  content TEXT NOT NULL,
  author_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  author_name TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('arrest', 'seizure', 'law_change', 'statistics', 'prevention_tip', 'other')),
  source_url TEXT,
  source_name TEXT,
  featured_image_url TEXT,
  published BOOLEAN NOT NULL DEFAULT false,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Enable RLS
ALTER TABLE news_posts ENABLE ROW LEVEL SECURITY;

-- Policies for news_posts
CREATE POLICY "Anyone can view published news posts"
  ON news_posts FOR SELECT
  USING (published = true);

CREATE POLICY "Admins can view all news posts"
  ON news_posts FOR SELECT
  USING (
    auth.jwt() ->> 'role' = 'admin' OR 
    auth.jwt() ->> 'role' = 'super_admin'
  );

CREATE POLICY "Admins can create news posts"
  ON news_posts FOR INSERT
  WITH CHECK (
    auth.jwt() ->> 'role' = 'admin' OR 
    auth.jwt() ->> 'role' = 'super_admin'
  );

CREATE POLICY "Admins can update news posts"
  ON news_posts FOR UPDATE
  USING (
    auth.jwt() ->> 'role' = 'admin' OR 
    auth.jwt() ->> 'role' = 'super_admin'
  );

CREATE POLICY "Super admins can delete news posts"
  ON news_posts FOR DELETE
  USING (auth.jwt() ->> 'role' = 'super_admin');

-- Theft Data Points Table (for timelapse)
CREATE TABLE IF NOT EXISTS theft_data_points (
  id BIGSERIAL PRIMARY KEY,
  date DATE NOT NULL,
  location_name TEXT NOT NULL,
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  theft_count INTEGER NOT NULL DEFAULT 1,
  data_source TEXT NOT NULL DEFAULT 'met_police',
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE(date, location_name, data_source)
);

-- Enable RLS
ALTER TABLE theft_data_points ENABLE ROW LEVEL SECURITY;

-- Policies for theft_data_points (read-only for public)
CREATE POLICY "Anyone can view theft data"
  ON theft_data_points FOR SELECT
  USING (true);

CREATE POLICY "Admins can insert theft data"
  ON theft_data_points FOR INSERT
  WITH CHECK (
    auth.jwt() ->> 'role' = 'admin' OR 
    auth.jwt() ->> 'role' = 'super_admin'
  );

-- Met Police Data Requests Table (admin tool)
CREATE TABLE IF NOT EXISTS met_police_requests (
  id BIGSERIAL PRIMARY KEY,
  request_date TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  request_type TEXT NOT NULL CHECK (request_type IN ('foi_request', 'data_update', 'statistics')),
  date_range_start DATE NOT NULL,
  date_range_end DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'submitted', 'received', 'processed')),
  request_details TEXT,
  response_received_at TIMESTAMPTZ,
  response_notes TEXT,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Enable RLS
ALTER TABLE met_police_requests ENABLE ROW LEVEL SECURITY;

-- Policies for met_police_requests
CREATE POLICY "Admins can manage police requests"
  ON met_police_requests FOR ALL
  USING (
    auth.jwt() ->> 'role' = 'admin' OR 
    auth.jwt() ->> 'role' = 'super_admin'
  );

-- Create indexes for better performance
CREATE INDEX idx_news_posts_published ON news_posts(published, published_at DESC);
CREATE INDEX idx_news_posts_slug ON news_posts(slug);
CREATE INDEX idx_news_posts_category ON news_posts(category);
CREATE INDEX idx_news_posts_created_at ON news_posts(created_at DESC);
CREATE INDEX idx_theft_data_date ON theft_data_points(date DESC);
CREATE INDEX idx_theft_data_location ON theft_data_points(location_name);
CREATE INDEX idx_experience_reports_approved ON experience_reports(approved);
CREATE INDEX idx_experience_reports_created_at ON experience_reports(created_at DESC);
CREATE INDEX idx_contact_submissions_responded ON contact_submissions(responded);
CREATE INDEX idx_contact_submissions_created_at ON contact_submissions(created_at DESC);
CREATE INDEX idx_admin_action_history_admin_id ON admin_action_history(admin_id);
CREATE INDEX idx_admin_action_history_created_at ON admin_action_history(created_at DESC);

-- Grant permissions
GRANT ALL ON news_posts TO authenticated;
GRANT ALL ON theft_data_points TO authenticated;
GRANT ALL ON met_police_requests TO authenticated;
GRANT ALL ON experience_reports TO authenticated;
GRANT ALL ON contact_submissions TO authenticated;
GRANT ALL ON admin_action_history TO authenticated;

-- Allow anonymous access for public features
GRANT SELECT ON news_posts TO anon;
GRANT SELECT ON theft_data_points TO anon;
GRANT SELECT ON experience_reports TO anon;
GRANT INSERT ON experience_reports TO anon;
GRANT INSERT ON contact_submissions TO anon;
