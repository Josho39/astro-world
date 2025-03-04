import { NextRequest, NextResponse } from 'next/server';

const BASE_API_URL = 'https://new-mints-server.vercel.app';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const tick = body.tick;
    
    const scanUrl = new URL('/api/scan', BASE_API_URL);
    if (tick) scanUrl.searchParams.append('tick', tick);
    
    const response = await fetch(scanUrl.toString(), {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Scan API responded with status: ${response.status}`);
    }

    const scanResult = await response.json();
    
    return NextResponse.json({
      success: true,
      scanResult
    });
  } catch (error) {
    console.error('Error in POST scan endpoint:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error occurred' 
      },
      { status: 500 }
    );
  }
}