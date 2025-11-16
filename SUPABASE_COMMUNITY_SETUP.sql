-- ============================================
-- Community Analytics - Supabase Setup Script
-- ============================================
-- Run this in your Supabase SQL Editor

-- 1. Create community_responses table
CREATE TABLE IF NOT EXISTS community_responses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  
  -- Core Questions
  had_phone_stolen TEXT NOT NULL CHECK (had_phone_stolen IN ('yes', 'no', 'someone_i_know')),
  phone_recovered TEXT CHECK (phone_recovered IN ('yes_fully', 'partially', 'no', 'investigating') OR phone_recovered IS NULL),
  replacement_method TEXT CHECK (replacement_method IN ('new_outright', 'second_hand', 'insurance', 'contract', 'not_yet', 'backup_phone') OR replacement_method IS NULL),
  theft_location TEXT CHECK (theft_location IN ('public_transport', 'restaurant', 'street', 'event', 'shop', 'other') OR theft_location IS NULL),
  security_measures TEXT[], -- Array: ['pin', 'biometric', 'find_my_device', 'sim_pin', 'none']
  reported_to_police TEXT CHECK (reported_to_police IN ('yes_crime_ref', 'yes_no_followup', 'no', 'network_only') OR reported_to_police IS NULL),
  
  -- Metadata
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  user_ip_hash TEXT, -- SHA-256 hash of IP (privacy-first)
  user_agent TEXT,
  session_id UUID, -- Prevent duplicate submissions
  
  -- Constraints
  CONSTRAINT valid_response CHECK (had_phone_stolen IS NOT NULL)
);

-- 2. Create indexes for faster analytics queries
CREATE INDEX IF NOT EXISTS idx_responses_stolen ON community_responses(had_phone_stolen);
CREATE INDEX IF NOT EXISTS idx_responses_recovered ON community_responses(phone_recovered);
CREATE INDEX IF NOT EXISTS idx_responses_location ON community_responses(theft_location);
CREATE INDEX IF NOT EXISTS idx_responses_date ON community_responses(submitted_at DESC);
CREATE INDEX IF NOT EXISTS idx_responses_session ON community_responses(session_id);

-- 3. Enable Row Level Security (RLS)
ALTER TABLE community_responses ENABLE ROW LEVEL SECURITY;

-- 4. Create RLS Policies

-- Allow anyone to insert (anonymous submissions)
CREATE POLICY "Allow anonymous insert" ON community_responses
  FOR INSERT 
  WITH CHECK (true);

-- Allow anyone to read (for analytics)
CREATE POLICY "Public read access" ON community_responses
  FOR SELECT 
  USING (true);

-- Only allow service role to delete (admin only)
CREATE POLICY "Admin only delete" ON community_responses
  FOR DELETE 
  USING (auth.role() = 'service_role');

-- 5. Create function to get analytics summary
CREATE OR REPLACE FUNCTION get_community_stats()
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'totalResponses', COUNT(*),
    'totalStolen', COUNT(*) FILTER (WHERE had_phone_stolen = 'yes'),
    'neverStolen', COUNT(*) FILTER (WHERE had_phone_stolen = 'no'),
    'someoneIKnow', COUNT(*) FILTER (WHERE had_phone_stolen = 'someone_i_know'),
    
    'recoveryStats', json_build_object(
      'fullyRecovered', COUNT(*) FILTER (WHERE phone_recovered = 'yes_fully'),
      'partiallyRecovered', COUNT(*) FILTER (WHERE phone_recovered = 'partially'),
      'notRecovered', COUNT(*) FILTER (WHERE phone_recovered = 'no'),
      'investigating', COUNT(*) FILTER (WHERE phone_recovered = 'investigating'),
      'recoveryRate', ROUND(
        (COUNT(*) FILTER (WHERE phone_recovered = 'yes_fully')::DECIMAL / 
         NULLIF(COUNT(*) FILTER (WHERE phone_recovered IS NOT NULL), 0)) * 100, 
        1
      )
    ),
    
    'locationStats', json_build_object(
      'publicTransport', COUNT(*) FILTER (WHERE theft_location = 'public_transport'),
      'restaurant', COUNT(*) FILTER (WHERE theft_location = 'restaurant'),
      'street', COUNT(*) FILTER (WHERE theft_location = 'street'),
      'event', COUNT(*) FILTER (WHERE theft_location = 'event'),
      'shop', COUNT(*) FILTER (WHERE theft_location = 'shop'),
      'other', COUNT(*) FILTER (WHERE theft_location = 'other')
    ),
    
    'replacementStats', json_build_object(
      'newOutright', COUNT(*) FILTER (WHERE replacement_method = 'new_outright'),
      'secondHand', COUNT(*) FILTER (WHERE replacement_method = 'second_hand'),
      'insurance', COUNT(*) FILTER (WHERE replacement_method = 'insurance'),
      'contract', COUNT(*) FILTER (WHERE replacement_method = 'contract'),
      'notYet', COUNT(*) FILTER (WHERE replacement_method = 'not_yet'),
      'backupPhone', COUNT(*) FILTER (WHERE replacement_method = 'backup_phone')
    ),
    
    'securityStats', json_build_object(
      'usingPin', COUNT(*) FILTER (WHERE 'pin' = ANY(security_measures)),
      'usingBiometric', COUNT(*) FILTER (WHERE 'biometric' = ANY(security_measures)),
      'usingFindMyDevice', COUNT(*) FILTER (WHERE 'find_my_device' = ANY(security_measures)),
      'usingSimPin', COUNT(*) FILTER (WHERE 'sim_pin' = ANY(security_measures)),
      'noSecurity', COUNT(*) FILTER (WHERE 'none' = ANY(security_measures))
    ),
    
    'policeStats', json_build_object(
      'yesCrimeRef', COUNT(*) FILTER (WHERE reported_to_police = 'yes_crime_ref'),
      'yesNoFollowup', COUNT(*) FILTER (WHERE reported_to_police = 'yes_no_followup'),
      'no', COUNT(*) FILTER (WHERE reported_to_police = 'no'),
      'networkOnly', COUNT(*) FILTER (WHERE reported_to_police = 'network_only'),
      'reportingRate', ROUND(
        (COUNT(*) FILTER (WHERE reported_to_police IN ('yes_crime_ref', 'yes_no_followup'))::DECIMAL / 
         NULLIF(COUNT(*) FILTER (WHERE reported_to_police IS NOT NULL), 0)) * 100, 
        1
      )
    ),
    
    'lastUpdated', NOW()
  ) INTO result
  FROM community_responses;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. Create function to check for duplicate session
CREATE OR REPLACE FUNCTION has_voted(session_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM community_responses 
    WHERE session_id = session_uuid
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. Insert sample data for testing (optional - remove in production)
INSERT INTO community_responses (
  had_phone_stolen,
  phone_recovered,
  replacement_method,
  theft_location,
  security_measures,
  reported_to_police,
  session_id
) VALUES 
  ('yes', 'no', 'new_outright', 'public_transport', ARRAY['pin', 'biometric'], 'yes_crime_ref', gen_random_uuid()),
  ('yes', 'yes_fully', 'insurance', 'street', ARRAY['pin', 'find_my_device'], 'yes_crime_ref', gen_random_uuid()),
  ('no', NULL, NULL, NULL, ARRAY['biometric', 'find_my_device'], NULL, gen_random_uuid()),
  ('yes', 'no', 'second_hand', 'restaurant', ARRAY['pin'], 'no', gen_random_uuid()),
  ('yes', 'partially', 'insurance', 'public_transport', ARRAY['biometric'], 'yes_no_followup', gen_random_uuid()),
  ('someone_i_know', NULL, NULL, NULL, ARRAY['pin', 'biometric', 'find_my_device'], NULL, gen_random_uuid()),
  ('yes', 'no', 'new_outright', 'event', ARRAY['none'], 'no', gen_random_uuid()),
  ('yes', 'no', 'contract', 'street', ARRAY['pin', 'biometric'], 'yes_crime_ref', gen_random_uuid()),
  ('no', NULL, NULL, NULL, ARRAY['pin', 'biometric', 'sim_pin'], NULL, gen_random_uuid()),
  ('yes', 'investigating', 'not_yet', 'shop', ARRAY['find_my_device'], 'yes_crime_ref', gen_random_uuid());

-- 8. Test the analytics function
SELECT get_community_stats();

-- ============================================
-- Setup Complete! 
-- Now you can:
-- 1. Insert responses via API
-- 2. Query stats with: SELECT get_community_stats()
-- 3. Check duplicates with: SELECT has_voted('session-uuid')
-- ============================================
