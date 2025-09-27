import { NextRequest, NextResponse } from 'next/server';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import path from 'path';

// Database path - uses the same database as the Flask app
const DB_PATH = path.resolve(process.cwd(), '../restaurant.db');

async function getDatabase() {
  return open({
    filename: DB_PATH,
    driver: sqlite3.Database,
  });
}

export async function GET(request: NextRequest) {
  try {
    const db = await getDatabase();
    
    // Get menu categories and items
    const categories = await db.all(`
      SELECT 
        c.id,
        c.name,
        c.display_name,
        c.description,
        c."order",
        c.is_drink_category
      FROM menu_category c
      ORDER BY c."order" ASC
    `);
    
    const menuItems = await db.all(`
      SELECT 
        m.id,
        m.name,
        m.description,
        m.price,
        m.category_id,
        m.image_path,
        m.vegetarian,
        m.vegan,
        m.spicy,
        m.gluten_free,
        m.lactose_free,
        m.kid_friendly,
        m.alcohol_free,
        m.contains_alcohol,
        m.homemade,
        m.sugar_free,
        m.recommended,
        m."order"
      FROM menu_item m
      ORDER BY m.category_id ASC, m."order" ASC, m.name ASC
    `);
    
    // Group items by category
    const categoriesWithItems = categories.map(category => ({
      ...category,
      items: menuItems.filter(item => item.category_id === category.id)
    }));
    
    await db.close();
    
    return NextResponse.json({
      success: true,
      data: {
        categories: categoriesWithItems,
        total_items: menuItems.length
      }
    }, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      }
    });
    
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch menu data',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
