import { NextRequest, NextResponse } from 'next/server';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import path from 'path';
import bcrypt from 'bcryptjs';

const DB_PATH = path.resolve(process.cwd(), '../restaurant.db');

async function getDatabase() {
  return open({
    filename: DB_PATH,
    driver: sqlite3.Database,
  });
}

// Get all users
export async function GET(request: NextRequest) {
  try {
    // Check if user is authenticated and has permission
    const sessionId = request.cookies.get('session')?.value;
    
    if (!sessionId) {
      return NextResponse.json(
        { success: false, error: 'Nicht autorisiert' },
        { status: 401 }
      );
    }

    const db = await getDatabase();
    
    // Verify user has admin rights
    const session = await db.get(
      `SELECT u.role FROM user_sessions s
       JOIN admin_users u ON s.user_id = u.id
       WHERE s.id = ? AND s.expires_at > datetime('now')`,
      [sessionId]
    );

    if (!session || (session.role !== 'admin' && session.role !== 'super_admin')) {
      await db.close();
      return NextResponse.json(
        { success: false, error: 'Keine Berechtigung' },
        { status: 403 }
      );
    }

    // Get all users
    const users = await db.all(
      `SELECT id, email, name, role, created_at, last_login, is_active
       FROM admin_users
       ORDER BY created_at DESC`
    );

    await db.close();

    return NextResponse.json({
      success: true,
      users
    });

  } catch (error) {
    console.error('Get users error:', error);
    return NextResponse.json(
      { success: false, error: 'Fehler beim Laden der Benutzer' },
      { status: 500 }
    );
  }
}

// Create new user
export async function POST(request: NextRequest) {
  try {
    // Check if user is authenticated and has permission
    const sessionId = request.cookies.get('session')?.value;
    
    if (!sessionId) {
      return NextResponse.json(
        { success: false, error: 'Nicht autorisiert' },
        { status: 401 }
      );
    }

    const db = await getDatabase();
    
    // Verify user has admin rights
    const session = await db.get(
      `SELECT u.role FROM user_sessions s
       JOIN admin_users u ON s.user_id = u.id
       WHERE s.id = ? AND s.expires_at > datetime('now')`,
      [sessionId]
    );

    if (!session || (session.role !== 'admin' && session.role !== 'super_admin')) {
      await db.close();
      return NextResponse.json(
        { success: false, error: 'Keine Berechtigung' },
        { status: 403 }
      );
    }

    const { email, password, name, role = 'admin' } = await request.json();

    if (!email || !password || !name) {
      await db.close();
      return NextResponse.json(
        { success: false, error: 'Alle Felder sind erforderlich' },
        { status: 400 }
      );
    }

    // Check if email already exists
    const existingUser = await db.get(
      'SELECT id FROM admin_users WHERE email = ?',
      [email]
    );

    if (existingUser) {
      await db.close();
      return NextResponse.json(
        { success: false, error: 'E-Mail bereits vergeben' },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const result = await db.run(
      `INSERT INTO admin_users (email, password_hash, name, role)
       VALUES (?, ?, ?, ?)`,
      [email, hashedPassword, name, role]
    );

    await db.close();

    return NextResponse.json({
      success: true,
      message: 'Benutzer erfolgreich erstellt',
      userId: result.lastID
    });

  } catch (error) {
    console.error('Create user error:', error);
    return NextResponse.json(
      { success: false, error: 'Fehler beim Erstellen des Benutzers' },
      { status: 500 }
    );
  }
}

// Update user
export async function PUT(request: NextRequest) {
  try {
    const sessionId = request.cookies.get('session')?.value;
    
    if (!sessionId) {
      return NextResponse.json(
        { success: false, error: 'Nicht autorisiert' },
        { status: 401 }
      );
    }

    const db = await getDatabase();
    
    // Verify user has admin rights
    const session = await db.get(
      `SELECT u.role FROM user_sessions s
       JOIN admin_users u ON s.user_id = u.id
       WHERE s.id = ? AND s.expires_at > datetime('now')`,
      [sessionId]
    );

    if (!session || (session.role !== 'admin' && session.role !== 'super_admin')) {
      await db.close();
      return NextResponse.json(
        { success: false, error: 'Keine Berechtigung' },
        { status: 403 }
      );
    }

    const { id, email, name, role, is_active, password } = await request.json();

    if (!id) {
      await db.close();
      return NextResponse.json(
        { success: false, error: 'Benutzer-ID erforderlich' },
        { status: 400 }
      );
    }

    // Build update query
    const updates = [];
    const values = [];

    if (email) {
      updates.push('email = ?');
      values.push(email);
    }
    if (name) {
      updates.push('name = ?');
      values.push(name);
    }
    if (role) {
      updates.push('role = ?');
      values.push(role);
    }
    if (is_active !== undefined) {
      updates.push('is_active = ?');
      values.push(is_active ? 1 : 0);
    }
    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      updates.push('password_hash = ?');
      values.push(hashedPassword);
    }

    values.push(id);

    await db.run(
      `UPDATE admin_users SET ${updates.join(', ')} WHERE id = ?`,
      values
    );

    await db.close();

    return NextResponse.json({
      success: true,
      message: 'Benutzer erfolgreich aktualisiert'
    });

  } catch (error) {
    console.error('Update user error:', error);
    return NextResponse.json(
      { success: false, error: 'Fehler beim Aktualisieren des Benutzers' },
      { status: 500 }
    );
  }
}

// Delete user
export async function DELETE(request: NextRequest) {
  try {
    const sessionId = request.cookies.get('session')?.value;
    
    if (!sessionId) {
      return NextResponse.json(
        { success: false, error: 'Nicht autorisiert' },
        { status: 401 }
      );
    }

    const db = await getDatabase();
    
    // Verify user has super_admin rights
    const session = await db.get(
      `SELECT u.role FROM user_sessions s
       JOIN admin_users u ON s.user_id = u.id
       WHERE s.id = ? AND s.expires_at > datetime('now')`,
      [sessionId]
    );

    if (!session || session.role !== 'super_admin') {
      await db.close();
      return NextResponse.json(
        { success: false, error: 'Keine Berechtigung' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('id');

    if (!userId) {
      await db.close();
      return NextResponse.json(
        { success: false, error: 'Benutzer-ID erforderlich' },
        { status: 400 }
      );
    }

    // Don't allow deleting the last super_admin
    const superAdminCount = await db.get(
      'SELECT COUNT(*) as count FROM admin_users WHERE role = ?',
      ['super_admin']
    );

    const userToDelete = await db.get(
      'SELECT role FROM admin_users WHERE id = ?',
      [userId]
    );

    if (userToDelete?.role === 'super_admin' && superAdminCount?.count === 1) {
      await db.close();
      return NextResponse.json(
        { success: false, error: 'Der letzte Super-Admin kann nicht gelöscht werden' },
        { status: 400 }
      );
    }

    await db.run('DELETE FROM admin_users WHERE id = ?', [userId]);
    await db.close();

    return NextResponse.json({
      success: true,
      message: 'Benutzer erfolgreich gelöscht'
    });

  } catch (error) {
    console.error('Delete user error:', error);
    return NextResponse.json(
      { success: false, error: 'Fehler beim Löschen des Benutzers' },
      { status: 500 }
    );
  }
}

