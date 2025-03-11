import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const address = searchParams.get('address');
    
    if (address) {
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
        console.error('Error fetching holdings data:', error);
        return NextResponse.json(
          { error: 'Failed to fetch NFT holdings' },
          { status: 500 }
        );
      }
    } 
    else {
      try {
        const kaspaComRes = await fetch(
          'https://api.kaspa.com/krc721?skip=0&limit=20&timeInterval=1d&order=volume24h&direction=desc',
          { next: { revalidate: 3600 } }
        );
        
        const ksperBotRes = await fetch(
          'https://markets.krc20.stream/krc721/mainnet/markets',
          { next: { revalidate: 3600 } }
        );
        
        if (!kaspaComRes.ok || !ksperBotRes.ok) {
          throw new Error('Failed to fetch NFT market data');
        }
        
        const kaspaComData = await kaspaComRes.json();
        const ksperBotData = await ksperBotRes.json();
        
        let allTimeVolume = 0;
        
        if (kaspaComData.items && Array.isArray(kaspaComData.items)) {
          kaspaComData.items.forEach((item: any) => {
            allTimeVolume += item.totalVolume || 0;
          });
        }
        
        if (ksperBotData) {
          Object.values(ksperBotData).forEach((market: any) => {
            allTimeVolume += market.total_volume || 0;
          });
        }
        
        const combinedData = {
          kaspacom: kaspaComData.items || [],
          ksperbot: ksperBotData || {},
          allTimeVolume
        };
        
        return NextResponse.json(combinedData);
      } catch (error) {
        console.error('Error fetching market data:', error);
        return NextResponse.json(
          { error: 'Failed to fetch NFT market data' },
          { status: 500 }
        );
      }
    }
  } catch (error) {
    console.error('Error in NFT holdings API route:', error);
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    );
  }
}