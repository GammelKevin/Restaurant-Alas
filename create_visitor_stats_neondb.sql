-- NeonDB (PostgreSQL) Schema for Visitor Statistics
-- Compatible with Neon's serverless PostgreSQL

-- Drop existing tables if they exist (be careful in production!)
DROP TABLE IF EXISTS visitor_stats CASCADE;
DROP TABLE IF EXISTS daily_stats CASCADE;

-- Create visitor_stats table for individual visits
CREATE TABLE visitor_stats (
    id SERIAL PRIMARY KEY,
    ip_address VARCHAR(45) NOT NULL, -- Supports IPv4 and IPv6
    user_agent TEXT,
    page_visited VARCHAR(255) NOT NULL,
    referrer TEXT,
    session_id VARCHAR(100),
    visit_time TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    device_type VARCHAR(50) GENERATED ALWAYS AS (
        CASE
            WHEN user_agent LIKE '%Mobile%' THEN 'Mobile'
            WHEN user_agent LIKE '%Tablet%' THEN 'Tablet'
            ELSE 'Desktop'
        END
    ) STORED,

    -- Indexes for performance
    INDEX idx_visit_time (visit_time),
    INDEX idx_ip_address (ip_address),
    INDEX idx_page_visited (page_visited),
    INDEX idx_session_id (session_id)
);

-- Create daily_stats table for aggregated statistics
CREATE TABLE daily_stats (
    id SERIAL PRIMARY KEY,
    date DATE NOT NULL UNIQUE,
    total_visits INTEGER DEFAULT 0,
    unique_visitors INTEGER DEFAULT 0,
    gallery_views INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    -- Index for date-based queries
    INDEX idx_date (date)
);

-- Create a function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for updated_at
CREATE TRIGGER update_daily_stats_updated_at
    BEFORE UPDATE ON daily_stats
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Create a function to automatically update daily stats
CREATE OR REPLACE FUNCTION update_daily_stats()
RETURNS TRIGGER AS $$
DECLARE
    today_date DATE;
    is_new_visitor BOOLEAN;
BEGIN
    today_date := DATE(NEW.visit_time);

    -- Check if this IP has visited today
    SELECT NOT EXISTS (
        SELECT 1 FROM visitor_stats
        WHERE ip_address = NEW.ip_address
        AND DATE(visit_time) = today_date
        AND id < NEW.id
    ) INTO is_new_visitor;

    -- Insert or update daily stats
    INSERT INTO daily_stats (date, total_visits, unique_visitors, gallery_views)
    VALUES (
        today_date,
        1,
        CASE WHEN is_new_visitor THEN 1 ELSE 0 END,
        CASE WHEN NEW.page_visited = '/gallery' THEN 1 ELSE 0 END
    )
    ON CONFLICT (date) DO UPDATE SET
        total_visits = daily_stats.total_visits + 1,
        unique_visitors = daily_stats.unique_visitors +
            CASE WHEN is_new_visitor THEN 1 ELSE 0 END,
        gallery_views = daily_stats.gallery_views +
            CASE WHEN NEW.page_visited = '/gallery' THEN 1 ELSE 0 END;

    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to update daily stats automatically
CREATE TRIGGER update_daily_stats_on_visit
    AFTER INSERT ON visitor_stats
    FOR EACH ROW
    EXECUTE FUNCTION update_daily_stats();

-- Create view for hourly statistics (for today)
CREATE OR REPLACE VIEW hourly_stats AS
SELECT
    EXTRACT(HOUR FROM visit_time) as hour,
    COUNT(*) as visits
FROM visitor_stats
WHERE DATE(visit_time) = CURRENT_DATE
GROUP BY EXTRACT(HOUR FROM visit_time)
ORDER BY hour;

-- Create view for top pages
CREATE OR REPLACE VIEW top_pages AS
SELECT
    page_visited,
    COUNT(*) as visits
FROM visitor_stats
WHERE page_visited NOT LIKE '/admin%'
    AND page_visited != '/login'
GROUP BY page_visited
ORDER BY visits DESC
LIMIT 10;

-- Create view for recent visitors (excluding admin)
CREATE OR REPLACE VIEW recent_visitors AS
SELECT
    ip_address,
    page_visited,
    visit_time,
    device_type
FROM visitor_stats
WHERE page_visited NOT LIKE '/admin%'
    AND page_visited != '/login'
ORDER BY visit_time DESC
LIMIT 50;

-- Insert some sample data (optional, remove in production)
-- INSERT INTO visitor_stats (ip_address, user_agent, page_visited, referrer, session_id)
-- VALUES
-- ('192.168.1.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/91.0', '/', 'https://google.com', 'session123'),
-- ('192.168.1.2', 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_6 like Mac OS X) Mobile/15E148', '/speisekarte', '', 'session456');

-- Grant permissions (adjust as needed for your database user)
-- GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO your_db_user;
-- GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO your_db_user;

-- Comments for documentation
COMMENT ON TABLE visitor_stats IS 'Stores individual visitor statistics and page views';
COMMENT ON TABLE daily_stats IS 'Aggregated daily statistics for quick reporting';
COMMENT ON COLUMN visitor_stats.ip_address IS 'Visitor IP address (IPv4 or IPv6)';
COMMENT ON COLUMN visitor_stats.device_type IS 'Auto-generated based on user agent';
COMMENT ON COLUMN daily_stats.unique_visitors IS 'Count of unique IP addresses per day';