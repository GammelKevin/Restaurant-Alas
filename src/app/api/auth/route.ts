import { NextRequest, NextResponse } from 'next/server';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import path from 'path';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import './init-db';

const DB_PATH = path.resolve(process.cwd(), '../restaurant.db');

async function getDatabase() {
  return open({
    filename: DB_PATH,
    driver: sqlite3.Database,
  });
}

// Login
export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: 'Email und Passwort erforderlich' },
        { status: 400 }
      );
    }

    const db = await getDatabase();
    
    // Get user
    const user = await db.get(
      'SELECT * FROM admin_users WHERE email = ? AND is_active = 1',
      [email]
    );

    if (!user) {
      await db.close();
      return NextResponse.json(
        { success: false, error: 'Ungültige Anmeldedaten' },
        { status: 401 }
      );
    }

    // Verify password
    const isValid = await bcrypt.compare(password, user.password_hash);

    if (!isValid) {
      await db.close();
      return NextResponse.json(
        { success: false, error: 'Ungültige Anmeldedaten' },
        { status: 401 }
      );
    }

    // Create session
    const sessionId = uuidv4();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    await db.run(
      `INSERT INTO user_sessions (id, user_id, expires_at)
       VALUES (?, ?, ?)`,
      [sessionId, user.id, expiresAt.toISOString()]
    );

    // Update last login
    await db.run(
      'UPDATE admin_users SET last_login = CURRENT_TIMESTAMP WHERE id = ?',
      [user.id]
    );

    await db.close();

    // Create response with session cookie
    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      }
    });

    // Set secure HTTP-only cookie
    response.cookies.set('session', sessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60, // 24 hours
      path: '/'
    });

    return response;

  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { success: false, error: 'Login fehlgeschlagen' },
      { status: 500 }
    );
  }
}

// Get current user
export async function GET(request: NextRequest) {
  try {
    const sessionId = request.cookies.get('session')?.value;

    if (!sessionId) {
      return NextResponse.json(
        { success: false, error: 'Nicht angemeldet' },
        { status: 401 }
      );
    }

    const db = await getDatabase();

    // Get session with user
    const session = await db.get(
      `SELECT u.* FROM user_sessions s
       JOIN admin_users u ON s.user_id = u.id
       WHERE s.id = ? AND s.expires_at > datetime('now')`,
      [sessionId]
    );

    await db.close();

    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Sitzung abgelaufen' },
        { status: 401 }
      );
    }

    return NextResponse.json({
      success: true,
      user: {
        id: session.id,
        email: session.email,
        name: session.name,
        role: session.role
      }
    });

  } catch (error) {
    console.error('Auth check error:', error);
    return NextResponse.json(
      { success: false, error: 'Authentifizierung fehlgeschlagen' },
      { status: 500 }
    );
  }
}

// Logout
export async function DELETE(request: NextRequest) {
  try {
    const sessionId = request.cookies.get('session')?.value;

    if (sessionId) {
      const db = await getDatabase();
      await db.run('DELETE FROM user_sessions WHERE id = ?', [sessionId]);
      await db.close();
    }

    const response = NextResponse.json({
      success: true,
      message: 'Erfolgreich abgemeldet'
    });

    // Clear session cookie
    response.cookies.delete('session');

    return response;

  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json(
      { success: false, error: 'Logout fehlgeschlagen' },
      { status: 500 }
    );
  }
}

