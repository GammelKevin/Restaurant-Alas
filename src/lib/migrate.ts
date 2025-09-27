import { query } from './db';
import bcrypt from 'bcryptjs';
import fs from 'fs';
import path from 'path';

async function migrate() {
  console.log('Starting database migration to PostgreSQL...');

  try {
    // Read SQL file
    const sqlPath = path.join(__dirname, 'init-database.sql');
    const sqlContent = fs.readFileSync(sqlPath, 'utf-8');

    // Split by semicolons but be careful with functions
    const statements = sqlContent
      .split(/;\s*$/gm)
      .filter(stmt => stmt.trim().length > 0)
      .map(stmt => stmt.trim() + ';');

    // Execute each statement
    for (const statement of statements) {
      if (statement.includes('$2a$10$YourHashHere')) {
        // Replace with actual bcrypt hash
        const hashedPassword = await bcrypt.hash('Admin2024!', 10);
        const finalStatement = statement.replace('$2a$10$YourHashHere', hashedPassword);
        await query(finalStatement);
      } else {
        await query(statement);
      }
      console.log('Executed:', statement.substring(0, 50) + '...');
    }

    console.log('✅ Database migration completed successfully!');
    console.log('');
    console.log('Default admin credentials:');
    console.log('Email: admin@restaurant-alas.de');
    console.log('Password: Admin2024!');
    console.log('⚠️  PLEASE CHANGE THIS PASSWORD IMMEDIATELY!');

    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

// Run migration if this file is executed directly
if (require.main === module) {
  migrate();
}

export default migrate;