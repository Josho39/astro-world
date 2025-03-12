import { NextResponse } from 'next/server';

const API_URL = 'https://api.kaspa.com/krc20?skip=0&limit=100&timeInterval=1d';

export async function GET() {
    try {
        const response = await fetch(API_URL, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            return NextResponse.json({ error: 'Failed to fetch data' }, { status: response.status });
        }

        const data = await response.json();
        const processedData = data.map((token: any) => ({
            ...token,
            change24h: token.changePrice || 0,
        }));

        return NextResponse.json(processedData, {
            status: 200,
            headers: {
                'Cache-Control': 's-maxage=60, stale-while-revalidate'
            }
        });
    } catch (error) {
        console.error('Error fetching KRC20 data:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}