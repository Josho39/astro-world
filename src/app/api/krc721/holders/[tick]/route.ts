import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  context: any // Using 'any' temporarily to bypass type checking
) {
  try {
    const { tick } = context.params;
    
    if (!tick) {
      return NextResponse.json(
        { error: 'Ticker parameter is required' },
        { status: 400 }
      );
    }

    const response = await fetch(`https://api.kaspa.com/krc721/${tick}`);

    if (!response.ok) {
      return NextResponse.json(
        { error: `Failed to fetch data for ${tick}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching NFT holder data:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}