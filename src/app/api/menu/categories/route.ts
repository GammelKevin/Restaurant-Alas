import { NextRequest, NextResponse } from 'next/server';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import path from 'path';

const DB_PATH = path.resolve(process.cwd(), '../restaurant.db');

async function getDatabase() {
  return open({
    filename: DB_PATH,
    driver: sqlite3.Database,
  });
}

// Create a new category
export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const { name, display_name, description, order, is_drink_category } = data;

    // Validation
    if (!name || !display_name) {
      return NextResponse.json(
        { success: false, error: 'Name and display name are required' },
        { status: 400 }
      );
    }

    const db = await getDatabase();

    // Check if category with same name already exists
    const existing = await db.get(
      'SELECT id FROM menu_category WHERE name = ?',
      [name]
    );

    if (existing) {
      await db.close();
      return NextResponse.json(
        { success: false, error: 'Category with this name already exists' },
        { status: 409 }
      );
    }

    // Insert the new category
    const result = await db.run(
      `INSERT INTO menu_category (name, display_name, description, "order", is_drink_category)
       VALUES (?, ?, ?, ?, ?)`,
      [
        name,
        display_name,
        description || null,
        order || 0,
        is_drink_category ? 1 : 0
      ]
    );

    await db.close();

    return NextResponse.json({
      success: true,
      data: {
        id: result.lastID,
        name,
        display_name,
        description,
        order: order || 0,
        is_drink_category: !!is_drink_category
      }
    });

  } catch (error) {
    console.error('Error creating category:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create category' },
      { status: 500 }
    );
  }
}