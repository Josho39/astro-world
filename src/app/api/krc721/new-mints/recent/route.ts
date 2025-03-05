import { NextRequest, NextResponse } from 'next/server';

const BASE_API_URL = 'https://new-mints-server.vercel.app';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const tick = searchParams.get('tick');
    const limit = searchParams.get('limit') || '1000';
    
    const url = new URL('/api/mints', BASE_API_URL);
    if (tick) url.searchParams.append('tick', tick);
    url.searchParams.append('limit', limit);
    
    const response = await fetch(url.toString(), {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`API responded with status: ${response.status}`);
    }

    const data = await response.json();
    
    return NextResponse.json({
      success: true,
      data: data.data || [],
      count: data.count || 0
    });
  } catch (error) {
    console.error('Error in GET recent mints:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error occurred' 
      },
      { status: 500 }
    );
  }
}