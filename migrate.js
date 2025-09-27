const { Pool } = require('pg');
const bcrypt = require('bcryptjs');

const DATABASE_URL = 'postgresql://neondb_owner:npg_bJtkjTyL52Fe@ep-calm-unit-agzzazuh-pooler.c-2.eu-central-1.aws.neon.tech/neondb?sslmode=require';

const pool = new Pool({
  connectionString: DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

async function migrate() {
  console.log('Starting database migration to PostgreSQL...');

  try {
    // Drop existing tables
    await pool.query('DROP TABLE IF EXISTS user_sessions CASCADE');
    await pool.query('DROP TABLE IF EXISTS menu_items CASCADE');
    await pool.query('DROP TABLE IF EXISTS menu_categories CASCADE');
    await pool.query('DROP TABLE IF EXISTS admin_users CASCADE');
    await pool.query('DROP TABLE IF EXISTS opening_hours CASCADE');
    await pool.query('DROP TABLE IF EXISTS visitor_stats CASCADE');
    await pool.query('DROP TABLE IF EXISTS daily_stats CASCADE');

    console.log('✅ Dropped existing tables');

    // Create admin_users table
    await pool.query(`
      CREATE TABLE admin_users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        name VARCHAR(255) NOT NULL,
        role VARCHAR(50) DEFAULT 'admin',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        last_login TIMESTAMP,
        is_active BOOLEAN DEFAULT true
      )
    `);

    // Create user_sessions table
    await pool.query(`
      CREATE TABLE user_sessions (
        id VARCHAR(255) PRIMARY KEY,
        user_id INTEGER NOT NULL,
        expires_at TIMESTAMP NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES admin_users(id) ON DELETE CASCADE
      )
    `);

    // Create menu_categories table
    await pool.query(`
      CREATE TABLE menu_categories (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        display_order INTEGER DEFAULT 0,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create menu_items table
    await pool.query(`
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
      )
    `);

    // Create opening_hours table
    await pool.query(`
      CREATE TABLE opening_hours (
        id SERIAL PRIMARY KEY,
        day_of_week INTEGER UNIQUE NOT NULL,
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
      )
    `);

    // Create visitor_stats table
    await pool.query(`
      CREATE TABLE visitor_stats (
        id SERIAL PRIMARY KEY,
        ip_address VARCHAR(45),
        user_agent TEXT,
        page_visited VARCHAR(255),
        referrer TEXT,
        session_id VARCHAR(255),
        visit_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create daily_stats table
    await pool.query(`
      CREATE TABLE daily_stats (
        id SERIAL PRIMARY KEY,
        date DATE UNIQUE NOT NULL,
        total_visits INTEGER DEFAULT 0,
        unique_visitors INTEGER DEFAULT 0,
        gallery_views INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    console.log('✅ Created all tables');

    // Create indexes
    await pool.query('CREATE INDEX idx_menu_items_category ON menu_items(category_id)');
    await pool.query('CREATE INDEX idx_visitor_stats_ip ON visitor_stats(ip_address)');
    await pool.query('CREATE INDEX idx_visitor_stats_time ON visitor_stats(visit_time)');
    await pool.query('CREATE INDEX idx_daily_stats_date ON daily_stats(date)');

    console.log('✅ Created indexes');

    // Insert default admin user
    const hashedPassword = await bcrypt.hash('Admin2024!', 10);
    await pool.query(
      'INSERT INTO admin_users (email, password_hash, name, role) VALUES ($1, $2, $3, $4)',
      ['admin@restaurant-alas.de', hashedPassword, 'Administrator', 'super_admin']
    );

    // Insert opening hours
    const openingHours = [
      [0, 'Montag', '17:00', '22:00', null, null, false],
      [1, 'Dienstag', null, null, null, null, true],
      [2, 'Mittwoch', '11:00', '14:00', '17:00', '22:00', false],
      [3, 'Donnerstag', '11:00', '14:00', '17:00', '22:00', false],
      [4, 'Freitag', '11:00', '14:00', '17:00', '22:00', false],
      [5, 'Samstag', '11:00', '14:00', '17:00', '22:00', false],
      [6, 'Sonntag', '11:00', '14:00', '17:00', '21:00', false]
    ];

    for (const [day_of_week, day_name, open_time_1, close_time_1, open_time_2, close_time_2, is_closed] of openingHours) {
      await pool.query(
        'INSERT INTO opening_hours (day_of_week, day_name, open_time_1, close_time_1, open_time_2, close_time_2, is_closed) VALUES ($1, $2, $3, $4, $5, $6, $7)',
        [day_of_week, day_name, open_time_1, close_time_1, open_time_2, close_time_2, is_closed]
      );
    }

    // Insert sample menu categories
    const categories = [
      ['Vorspeisen', 'Köstliche Vorspeisen zum Start', 1],
      ['Hauptgerichte', 'Unsere Hauptspeisen', 2],
      ['Desserts', 'Süße Versuchungen', 3],
      ['Getränke', 'Erfrischende Getränke', 4]
    ];

    for (const [name, description, display_order] of categories) {
      await pool.query(
        'INSERT INTO menu_categories (name, description, display_order) VALUES ($1, $2, $3)',
        [name, description, display_order]
      );
    }

    console.log('✅ Inserted initial data');

    console.log('\n🎉 Database migration completed successfully!');
    console.log('\nDefault admin credentials:');
    console.log('Email: admin@restaurant-alas.de');
    console.log('Password: Admin2024!');
    console.log('⚠️  PLEASE CHANGE THIS PASSWORD IMMEDIATELY!');

  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

migrate().catch(console.error);