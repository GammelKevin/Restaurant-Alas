-- =====================================================
-- Restaurant ALAS - Neon PostgreSQL Database Schema
-- =====================================================
-- This script initializes all tables for the restaurant management system
-- Including: Authentication, Menu Management, Opening Hours, and Visitor Tracking

-- Drop existing tables (in correct order due to foreign keys)
DROP TABLE IF EXISTS user_sessions CASCADE;
DROP TABLE IF EXISTS menu_items CASCADE;
DROP TABLE IF EXISTS menu_categories CASCADE;
DROP TABLE IF EXISTS admin_users CASCADE;
DROP TABLE IF EXISTS opening_hours CASCADE;
DROP TABLE IF EXISTS visitor_stats CASCADE;
DROP TABLE IF EXISTS daily_stats CASCADE;

-- =====================================================
-- 1. AUTHENTICATION TABLES
-- =====================================================

-- Admin users table
CREATE TABLE admin_users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  name VARCHAR(255) NOT NULL,
  role VARCHAR(50) DEFAULT 'admin',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_login TIMESTAMP,
  is_active BOOLEAN DEFAULT true
);

-- User sessions table
CREATE TABLE user_sessions (
  id VARCHAR(255) PRIMARY KEY,
  user_id INTEGER NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES admin_users(id) ON DELETE CASCADE
);

-- =====================================================
-- 2. MENU MANAGEMENT TABLES
-- =====================================================

-- Menu categories table
CREATE TABLE menu_categories (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Menu items table
CREATE TABLE menu_items (
  id SERIAL PRIMARY KEY,
  category_id INTEGER NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  is_vegetarian BOOLEAN DEFAULT false,
  is_vegan BOOLEAN DEFAULT false,
  is_gluten_free BOOLEAN DEFAULT false,
  is_spicy BOOLEAN DEFAULT false,
  allergens TEXT,
  image_url TEXT,
  display_order INTEGER DEFAULT 0,
  is_available BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (category_id) REFERENCES menu_categories(id) ON DELETE CASCADE
);

-- =====================================================
-- 3. OPENING HOURS TABLE
-- =====================================================

CREATE TABLE opening_hours (
  id SERIAL PRIMARY KEY,
  day_of_week INTEGER UNIQUE NOT NULL, -- 0=Monday, 6=Sunday
  day_name VARCHAR(20) NOT NULL,
  open_time_1 TIME,
  close_time_1 TIME,
  open_time_2 TIME,
  close_time_2 TIME,
  is_closed BOOLEAN DEFAULT false,
  special_note TEXT,
  vacation_start DATE,
  vacation_end DATE,
  vacation_active BOOLEAN DEFAULT false,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- 4. VISITOR TRACKING TABLES
-- =====================================================

-- Individual visitor statistics
CREATE TABLE visitor_stats (
  id SERIAL PRIMARY KEY,
  ip_address VARCHAR(45),
  user_agent TEXT,
  page_visited VARCHAR(255),
  referrer TEXT,
  session_id VARCHAR(255),
  visit_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Aggregated daily statistics
CREATE TABLE daily_stats (
  id SERIAL PRIMARY KEY,
  date DATE UNIQUE NOT NULL,
  total_visits INTEGER DEFAULT 0,
  unique_visitors INTEGER DEFAULT 0,
  gallery_views INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- 5. INDEXES FOR PERFORMANCE
-- =====================================================

-- Menu indexes
CREATE INDEX idx_menu_items_category ON menu_items(category_id);
CREATE INDEX idx_menu_items_available ON menu_items(is_available);
CREATE INDEX idx_menu_categories_order ON menu_categories(display_order);

-- Visitor stats indexes
CREATE INDEX idx_visitor_stats_ip ON visitor_stats(ip_address);
CREATE INDEX idx_visitor_stats_time ON visitor_stats(visit_time);
CREATE INDEX idx_visitor_stats_session ON visitor_stats(session_id);
CREATE INDEX idx_visitor_stats_page ON visitor_stats(page_visited);

-- Daily stats indexes
CREATE INDEX idx_daily_stats_date ON daily_stats(date);

-- Session indexes
CREATE INDEX idx_sessions_user ON user_sessions(user_id);
CREATE INDEX idx_sessions_expires ON user_sessions(expires_at);

-- =====================================================
-- 6. TRIGGERS & FUNCTIONS
-- =====================================================

-- Function to auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at columns
CREATE TRIGGER update_menu_categories_updated_at
  BEFORE UPDATE ON menu_categories
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_menu_items_updated_at
  BEFORE UPDATE ON menu_items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_opening_hours_updated_at
  BEFORE UPDATE ON opening_hours
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_daily_stats_updated_at
  BEFORE UPDATE ON daily_stats
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 7. INITIAL DATA
-- =====================================================

-- Default admin user (Password will be set by migration script)
-- Email: admin@restaurant-alas.de
-- Password: Admin2024!
INSERT INTO admin_users (email, password_hash, name, role)
VALUES (
  'admin@restaurant-alas.de',
  '$2a$10$PLACEHOLDER', -- Will be replaced by migration script
  'Administrator',
  'super_admin'
);

-- Default opening hours (German restaurant hours)
INSERT INTO opening_hours (day_of_week, day_name, open_time_1, close_time_1, open_time_2, close_time_2, is_closed) VALUES
(0, 'Montag', '17:00', '22:00', NULL, NULL, false),
(1, 'Dienstag', NULL, NULL, NULL, NULL, true),
(2, 'Mittwoch', '11:00', '14:00', '17:00', '22:00', false),
(3, 'Donnerstag', '11:00', '14:00', '17:00', '22:00', false),
(4, 'Freitag', '11:00', '14:00', '17:00', '22:00', false),
(5, 'Samstag', '11:00', '14:00', '17:00', '22:00', false),
(6, 'Sonntag', '11:00', '14:00', '17:00', '21:00', false);

-- Sample menu categories
INSERT INTO menu_categories (name, description, display_order) VALUES
('Vorspeisen', 'Köstliche Vorspeisen zum Start', 1),
('Hauptgerichte', 'Unsere Hauptspeisen', 2),
('Desserts', 'Süße Versuchungen', 3),
('Getränke', 'Erfrischende Getränke', 4);

-- =====================================================
-- 8. COMMENTS FOR DOCUMENTATION
-- =====================================================

COMMENT ON TABLE admin_users IS 'Admin user accounts with authentication';
COMMENT ON TABLE user_sessions IS 'Active user sessions for authentication';
COMMENT ON TABLE menu_categories IS 'Menu categories for organizing dishes';
COMMENT ON TABLE menu_items IS 'Individual menu items/dishes';
COMMENT ON TABLE opening_hours IS 'Restaurant opening hours by day of week';
COMMENT ON TABLE visitor_stats IS 'Individual visitor page views';
COMMENT ON TABLE daily_stats IS 'Aggregated daily visitor statistics';

COMMENT ON COLUMN admin_users.password_hash IS 'bcrypt hashed password';
COMMENT ON COLUMN opening_hours.day_of_week IS '0=Monday through 6=Sunday';
COMMENT ON COLUMN visitor_stats.ip_address IS 'Visitor IP address (IPv4 or IPv6)';
