import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const address = searchParams.get('address');

    if (!address) {
      return NextResponse.json(
        { error: 'Address parameter is required' },
        { status: 400 }
      );
    }

    try {
      const holdingsUrl = `https://mainnet.krc721.stream/api/v1/krc721/mainnet/address/${address}`;
      const holdingsResponse = await fetch(holdingsUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!holdingsResponse.ok) {
        throw new Error(`Holdings API returned ${holdingsResponse.status}: ${holdingsResponse.statusText}`);
      }

      const holdingsData = await holdingsResponse.json();
      
      if (!holdingsData.result || !Array.isArray(holdingsData.result)) {
        throw new Error('Unexpected response format from holdings API');
      }

      const marketsUrl = 'https://markets.krc20.stream/krc721/mainnet/markets';
      const marketsResponse = await fetch(marketsUrl);
      const marketsData = marketsResponse.ok ? await marketsResponse.json() : {};
      const processedData = holdingsData.result.map((nft: any) => {
        const tick = nft.tick || '';
        const tokenId = nft.tokenId || '';
        const floorPrice = marketsData[tick]?.floor_price || 0;
        
        return {
          id: tokenId,
          name: `${tick} #${tokenId}`,
          collection: tick,
          value: floorPrice,
          image: `https://cache.krc721.stream/krc721/mainnet/thumbnail/${tick}/${tokenId}`
        };
      });

      return NextResponse.json(processedData);
    } catch (error) {
      console.error('Error fetching data from external API:', error);
    }
  } catch (error) {
    console.error('Error in NFT holdings API route:', error);
    return NextResponse.json(
      { error: 'Failed to fetch NFT holdings' },
      { status: 500 }
    );
  }
}