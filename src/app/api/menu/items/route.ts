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

// Create a new menu item
export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const {
      name,
      description,
      price,
      category_id,
      image_path,
      vegetarian,
      vegan,
      spicy,
      gluten_free,
      lactose_free,
      kid_friendly,
      alcohol_free,
      contains_alcohol,
      homemade,
      sugar_free,
      recommended
    } = data;

    // Validation
    if (!name || !price || !category_id) {
      return NextResponse.json(
        { success: false, error: 'Name, price, and category are required' },
        { status: 400 }
      );
    }

    const db = await getDatabase();

    // Check if category exists
    const category = await db.get(
      'SELECT id FROM menu_category WHERE id = ?',
      [category_id]
    );

    if (!category) {
      await db.close();
      return NextResponse.json(
        { success: false, error: 'Category not found' },
        { status: 404 }
      );
    }

    // Insert the new menu item
    const result = await db.run(
      `INSERT INTO menu_item (
        name, description, price, category_id, image_path,
        vegetarian, vegan, spicy, gluten_free, lactose_free,
        kid_friendly, alcohol_free, contains_alcohol, homemade,
        sugar_free, recommended
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        name,
        description || null,
        price,
        category_id,
        image_path || null,
        vegetarian ? 1 : 0,
        vegan ? 1 : 0,
        spicy ? 1 : 0,
        gluten_free ? 1 : 0,
        lactose_free ? 1 : 0,
        kid_friendly ? 1 : 0,
        alcohol_free ? 1 : 0,
        contains_alcohol ? 1 : 0,
        homemade ? 1 : 0,
        sugar_free ? 1 : 0,
        recommended ? 1 : 0
      ]
    );

    await db.close();

    return NextResponse.json({
      success: true,
      data: {
        id: result.lastID,
        name,
        description,
        price,
        category_id,
        image_path,
        vegetarian: !!vegetarian,
        vegan: !!vegan,
        spicy: !!spicy,
        gluten_free: !!gluten_free,
        lactose_free: !!lactose_free,
        kid_friendly: !!kid_friendly,
        alcohol_free: !!alcohol_free,
        contains_alcohol: !!contains_alcohol,
        homemade: !!homemade,
        sugar_free: !!sugar_free,
        recommended: !!recommended
      }
    });

  } catch (error) {
    console.error('Error creating menu item:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create menu item' },
      { status: 500 }
    );
  }
}