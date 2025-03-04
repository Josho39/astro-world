import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const ticker = searchParams.get('ticker');
    const timeRange = searchParams.get('timeRange') || '1d';
    
    if (!ticker) {
      return NextResponse.json({ 
        success: false, 
        error: 'Ticker parameter is required' 
      }, { status: 400 });
    }
    
    const apiInterval = timeRange;
    
    const apiUrl = `https://api-v2-do.kas.fyi/token/krc20/${ticker}/charts?type=candles&interval=${apiInterval}`;
    
    const response = await fetch(apiUrl, {
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store'
    });

    if (!response.ok) {
      return NextResponse.json({ 
        success: false, 
        error: `Failed to fetch data: ${response.statusText}` 
      }, { status: response.status });
    }

    const data = await response.json();
    
    if (!data.candles || !Array.isArray(data.candles)) {
      return NextResponse.json({ 
        success: false, 
        error: 'Invalid data format received from API' 
      }, { status: 500 });
    }
    
    if (data.candles.length === 0) {
      return NextResponse.json({
        success: true,
        candles: [],
        message: 'No candle data available for this ticker and time range'
      });
    }
    
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'An unknown error occurred' 
    }, { status: 500 });
  }
}