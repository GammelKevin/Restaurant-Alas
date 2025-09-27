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

export async function PUT(request: NextRequest) {
  try {
    const data = await request.json();
    const {
      id,
      name,
      description,
      price,
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

    if (!id || !name || price === undefined) {
      return NextResponse.json(
        { success: false, error: 'ID, Name and Price are required' },
        { status: 400 }
      );
    }

    const db = await getDatabase();
    
    await db.run(
      `UPDATE menu_item SET 
        name = ?,
        description = ?,
        price = ?,
        vegetarian = ?,
        vegan = ?,
        spicy = ?,
        gluten_free = ?,
        lactose_free = ?,
        kid_friendly = ?,
        alcohol_free = ?,
        contains_alcohol = ?,
        homemade = ?,
        sugar_free = ?,
        recommended = ?
      WHERE id = ?`,
      [
        name,
        description || '',
        price,
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
        recommended ? 1 : 0,
        id
      ]
    );
    
    await db.close();
    
    return NextResponse.json({
      success: true,
      message: 'Menu item updated successfully'
    });
    
  } catch (error) {
    console.error('Update error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to update menu item',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// Delete menu item
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const itemId = searchParams.get('id');

    if (!itemId) {
      return NextResponse.json(
        { success: false, error: 'Item ID is required' },
        { status: 400 }
      );
    }

    const db = await getDatabase();
    
    await db.run(
      'DELETE FROM menu_item WHERE id = ?',
      [parseInt(itemId)]
    );
    
    await db.close();
    
    return NextResponse.json({
      success: true,
      message: 'Menu item deleted successfully'
    });
    
  } catch (error) {
    console.error('Delete error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to delete menu item',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

