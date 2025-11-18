-- Create table for simple page view analytics
CREATE TABLE IF NOT EXISTS page_views (
  id BIGSERIAL PRIMARY KEY,
  path TEXT NOT NULL,
  referrer TEXT,
  user_agent TEXT,
  ip_hash TEXT, -- Optional: hashed IP for unique visitor estimation (privacy preserving)
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Enable RLS
ALTER TABLE page_views ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can insert (to log views)
CREATE POLICY "Anyone can insert page views"
  ON page_views FOR INSERT
  WITH CHECK (true);

-- Policy: Only admin can read
CREATE POLICY "Admins can read page views"
  ON page_views FOR SELECT
  USING (
    auth.jwt() ->> 'role' = 'admin' OR 
    auth.jwt() ->> 'role' = 'super_admin'
  );

-- Analytics Query Function
CREATE OR REPLACE FUNCTION get_page_view_stats(time_range INTERVAL DEFAULT '30 days')
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'total_views', COUNT(*),
    'unique_visitors', COUNT(DISTINCT ip_hash),
    'top_pages', (
      SELECT json_agg(row_to_json(t))
      FROM (
        SELECT path, COUNT(*) as views 
        FROM page_views 
        WHERE created_at > NOW() - time_range
        GROUP BY path 
        ORDER BY views DESC 
        LIMIT 10
      ) t
    ),
    'recent_views', (
      SELECT json_agg(row_to_json(r))
      FROM (
        SELECT path, created_at 
        FROM page_views 
        ORDER BY created_at DESC 
        LIMIT 20
      ) r
    )
  ) INTO result
  FROM page_views
  WHERE created_at > NOW() - time_range;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
