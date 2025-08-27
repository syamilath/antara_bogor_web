import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET() {
  try {
    // Test a simple query
    const [result] = await query('SELECT 1 + 1 AS solution');
    return NextResponse.json({ 
      success: true, 
      message: 'Database connection successful',
      data: result 
    });
  } catch (error) {
    console.error('Database connection test failed:', error);
    return NextResponse.json({
      success: false,
      error: error.message,
      code: error.code,
      sqlMessage: error.sqlMessage
    }, { status: 500 });
  }
}
