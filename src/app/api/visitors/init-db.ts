import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import path from 'path';
import { migrateVisitorTables } from './migrate';

const DB_PATH = path.resolve(process.cwd(), '../restaurant.db');

export async function initVisitorTable() {
  const db = await open({
    filename: DB_PATH,
    driver: sqlite3.Database,
  });

  // Create visitor statistics table if not exists
  await db.exec(`
    CREATE TABLE IF NOT EXISTS visitor_stats (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      ip_address TEXT NOT NULL,
      user_agent TEXT,
      page_visited TEXT,
      referrer TEXT,
      country TEXT,
      city TEXT,
      visit_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      session_id TEXT
    )
  `);

  // Create daily stats table
  await db.exec(`
    CREATE TABLE IF NOT EXISTS daily_stats (
      date DATE PRIMARY KEY,
      total_visits INTEGER DEFAULT 0,
      unique_visitors INTEGER DEFAULT 0,
      gallery_views INTEGER DEFAULT 0
    )
  `);

  await db.close();
}

// Initialize the table on module load
Promise.all([
  initVisitorTable(),
  migrateVisitorTables()
]).catch(console.error);
