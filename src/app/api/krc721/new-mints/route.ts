import { NextRequest, NextResponse } from 'next/server';

const BASE_API_URL = 'https://new-mints-server.vercel.app';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const tick = searchParams.get('tick') || searchParams.get('TICK');
    const limit = searchParams.get('limit');
    const all = searchParams.get('all');
    
    const url = new URL('/api/collections', BASE_API_URL);
    if (tick) url.searchParams.append('tick', tick);
    if (limit) url.searchParams.append('limit', limit);
    if (all) url.searchParams.append('all', all);
    
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
    console.error('Error in GET /api/krc721/new-mints:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error occurred' 
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const tick = body.tick;
    
    const scanUrl = new URL('/api/scan', BASE_API_URL);
    if (tick) scanUrl.searchParams.append('tick', tick);
    
    const scanResponse = await fetch(scanUrl.toString(), {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!scanResponse.ok) {
      throw new Error(`Scan API responded with status: ${scanResponse.status}`);
    }

    const mintsUrl = new URL('/api/mints', BASE_API_URL);
    if (tick) mintsUrl.searchParams.append('tick', tick);
    
    const mintsResponse = await fetch(mintsUrl.toString(), {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!mintsResponse.ok) {
      throw new Error(`Mints API responded with status: ${mintsResponse.status}`);
    }

    const scanResult = await scanResponse.json();
    const mintsData = await mintsResponse.json();
    
    return NextResponse.json({
      success: true,
      scanResult,
      newMints: mintsData.data || [],
      count: mintsData.count || 0
    });
  } catch (error) {
    console.error('Error in POST /api/krc721/new-mints:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error occurred' 
      },
      { status: 500 }
    );
  }
}