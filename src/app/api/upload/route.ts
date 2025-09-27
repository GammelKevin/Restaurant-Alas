import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

const DB_PATH = path.resolve(process.cwd(), '../restaurant.db');

async function getDatabase() {
  return open({
    filename: DB_PATH,
    driver: sqlite3.Database,
  });
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const itemId = formData.get('itemId') as string;

    if (!file || !itemId) {
      return NextResponse.json(
        { success: false, error: 'File and itemId are required' },
        { status: 400 }
      );
    }

    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      return NextResponse.json(
        { success: false, error: 'Only JPEG, PNG and WebP images are allowed' },
        { status: 400 }
      );
    }

    // Generate unique filename
    const timestamp = Date.now();
    const extension = path.extname(file.name);
    const filename = `menu_${itemId}_${timestamp}${extension}`;

    // Ensure upload directory exists
    const uploadsDir = path.join(process.cwd(), 'public', 'static', 'uploads');
    await mkdir(uploadsDir, { recursive: true });

    // Save file
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const filepath = path.join(uploadsDir, filename);
    await writeFile(filepath, buffer);

    // Update database
    const db = await getDatabase();
    await db.run(
      'UPDATE menu_item SET image_path = ? WHERE id = ?',
      [filename, parseInt(itemId)]
    );
    await db.close();

    return NextResponse.json({
      success: true,
      message: 'Image uploaded successfully',
      filename: filename,
      path: `/static/uploads/${filename}`
    });

  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to upload image',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// Delete image
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const itemId = searchParams.get('itemId');

    if (!itemId) {
      return NextResponse.json(
        { success: false, error: 'ItemId is required' },
        { status: 400 }
      );
    }

    // Update database to remove image path
    const db = await getDatabase();
    await db.run(
      'UPDATE menu_item SET image_path = NULL WHERE id = ?',
      [parseInt(itemId)]
    );
    await db.close();

    return NextResponse.json({
      success: true,
      message: 'Image removed successfully'
    });

  } catch (error) {
    console.error('Delete image error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to remove image',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

