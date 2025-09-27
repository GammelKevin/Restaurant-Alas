import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import path from 'path';
import bcrypt from 'bcryptjs';

const DB_PATH = path.resolve(process.cwd(), '../restaurant.db');

export async function initAuthTables() {
  const db = await open({
    filename: DB_PATH,
    driver: sqlite3.Database,
  });

  // Create users table
  await db.exec(`
    CREATE TABLE IF NOT EXISTS admin_users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      name TEXT NOT NULL,
      role TEXT DEFAULT 'admin',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      last_login TIMESTAMP,
      is_active BOOLEAN DEFAULT 1
    )
  `);

  // Create sessions table
  await db.exec(`
    CREATE TABLE IF NOT EXISTS user_sessions (
      id TEXT PRIMARY KEY,
      user_id INTEGER NOT NULL,
      expires_at TIMESTAMP NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES admin_users(id)
    )
  `);

  // Check if default admin exists
  const adminExists = await db.get(
    'SELECT id FROM admin_users WHERE email = ?',
    ['admin@restaurant-alas.de']
  );

  if (!adminExists) {
    // Create default admin user
    const defaultPassword = 'Admin2024!';
    const hashedPassword = await bcrypt.hash(defaultPassword, 10);
    
    await db.run(
      `INSERT INTO admin_users (email, password_hash, name, role)
       VALUES (?, ?, ?, ?)`,
      ['admin@restaurant-alas.de', hashedPassword, 'Administrator', 'super_admin']
    );
    
    console.log('Default admin created:');
    console.log('Email: admin@restaurant-alas.de');
    console.log('Password: Admin2024!');
    console.log('⚠️ PLEASE CHANGE THIS PASSWORD IMMEDIATELY!');
  }

  await db.close();
}

// Initialize tables on module load
initAuthTables().catch(console.error);
