import { NextRequest, NextResponse } from "next/server";
import sqlite3 from "sqlite3";
import { open } from "sqlite";
import path from "path";

// Database path - uses the same database as the Flask app
const DB_PATH = path.resolve(process.cwd(), "../restaurant.db");

async function getDatabase() {
  return open({
    filename: DB_PATH,
    driver: sqlite3.Database,
  });
}

// German weekday order for proper sorting
const WEEKDAY_ORDER: { [key: string]: number } = {
  Montag: 1,
  Dienstag: 2,
  Mittwoch: 3,
  Donnerstag: 4,
  Freitag: 5,
  Samstag: 6,
  Sonntag: 7,
};

export async function GET() {
  try {
    const db = await getDatabase();

    // Get opening hours
    const openingHours = await db.all(`
      SELECT
        id,
        day,
        open_time_1,
        close_time_1,
        open_time_2,
        close_time_2,
        closed,
        vacation_start,
        vacation_end,
        vacation_active
      FROM opening_hours
    `);

    // Sort by weekday order and check for vacation status
    const sortedHours = openingHours
      .map((hours) => ({
        ...hours,
        is_on_vacation: isOnVacation(hours),
        is_today: isToday(hours.day),
      }))
      .sort(
        (a, b) => (WEEKDAY_ORDER[a.day] || 999) - (WEEKDAY_ORDER[b.day] || 999),
      );

    await db.close();

    return NextResponse.json({
      success: true,
      data: sortedHours,
    });
  } catch (error) {
    console.error("Database error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch opening hours",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const db = await getDatabase();

    // Validate required fields
    if (!body.id || !body.day) {
      return NextResponse.json(
        {
          success: false,
          message: "Missing required fields",
        },
        { status: 400 },
      );
    }

    // Update the opening hours
    await db.run(
      `UPDATE opening_hours
       SET open_time_1 = ?,
           close_time_1 = ?,
           open_time_2 = ?,
           close_time_2 = ?,
           closed = ?,
           vacation_start = ?,
           vacation_end = ?,
           vacation_active = ?
       WHERE id = ?`,
      [
        body.open_time_1 || null,
        body.close_time_1 || null,
        body.open_time_2 || null,
        body.close_time_2 || null,
        body.closed ? 1 : 0,
        body.vacation_start || null,
        body.vacation_end || null,
        body.vacation_active ? 1 : 0,
        body.id,
      ],
    );

    await db.close();

    return NextResponse.json({
      success: true,
      message: "Öffnungszeiten erfolgreich aktualisiert",
    });
  } catch (error) {
    console.error("Database error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Fehler beim Aktualisieren der Öffnungszeiten",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}

interface VacationHours {
  vacation_active?: number | boolean | null;
  vacation_start?: string | null;
  vacation_end?: string | null;
}

function isOnVacation(hours: VacationHours): boolean {
  if (!hours.vacation_active || !hours.vacation_start || !hours.vacation_end) {
    return false;
  }

  const currentDate = new Date();
  const startDate = new Date(hours.vacation_start);
  const endDate = new Date(hours.vacation_end);

  return currentDate >= startDate && currentDate <= endDate;
}

function isToday(dayName: string): boolean {
  const days = [
    "Sonntag",
    "Montag",
    "Dienstag",
    "Mittwoch",
    "Donnerstag",
    "Freitag",
    "Samstag",
  ];
  const today = new Date().getDay();
  return days[today] === dayName;
}
