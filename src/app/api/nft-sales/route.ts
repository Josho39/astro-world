import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const ticker = searchParams.get('ticker');
    
    // Use the sample NFT sales data from the paste
    const ordersData = {
      orders: [
        {"ticker":"KANGO","totalPrice":2999,"tokenId":"695","fulfillmentTimestamp":1741700461568},
        {"ticker":"BULLCLUB","totalPrice":750,"tokenId":"1956","fulfillmentTimestamp":1741699837019},
        {"ticker":"BULLCLUB","totalPrice":650,"tokenId":"232","fulfillmentTimestamp":1741693628477},
        {"ticker":"KASPUNKS","totalPrice":5000,"buri":"ipfs://bafybeigohvmbcjeyqsnamrjomamiscn62u3ibmprbe4oen2bamoqeiqub4","tokenId":"918","fulfillmentTimestamp":1741690256539},
        {"ticker":"SKETCHES","totalPrice":50,"tokenId":"37","fulfillmentTimestamp":1741686006236},
        {"ticker":"KASBULLS","totalPrice":499,"tokenId":"492","fulfillmentTimestamp":1741682461461},
        {"ticker":"KASBULLS","totalPrice":439,"tokenId":"524","fulfillmentTimestamp":1741682414481},
        {"ticker":"KASBULLS","totalPrice":499,"tokenId":"49","fulfillmentTimestamp":1741682384192},
        {"ticker":"KASBULLS","totalPrice":750,"tokenId":"124","fulfillmentTimestamp":1741682326163},
        {"ticker":"KASBULLS","totalPrice":420,"tokenId":"33","fulfillmentTimestamp":1741682201512},
        {"ticker":"KASBULLS","totalPrice":420,"tokenId":"211","fulfillmentTimestamp":1741682163246},
        {"ticker":"KASBULLS","totalPrice":500,"tokenId":"542","fulfillmentTimestamp":1741682121244},
        {"ticker":"KASBULLS","totalPrice":439,"tokenId":"710","fulfillmentTimestamp":1741682030081},
        {"ticker":"KASBULLS","totalPrice":439,"tokenId":"764","fulfillmentTimestamp":1741681477800},
        {"ticker":"KASBULLS","totalPrice":499,"tokenId":"611","fulfillmentTimestamp":1741681430595},
        {"ticker":"KASBULLS","totalPrice":420,"tokenId":"154","fulfillmentTimestamp":1741681389915},
        {"ticker":"KASPUNKS","totalPrice":11000,"tokenId":"173","fulfillmentTimestamp":1741677283315},
        {"ticker":"KASPUNKS","totalPrice":3250,"tokenId":"314","fulfillmentTimestamp":1741676416207},
        {"ticker":"KASPUNKS","totalPrice":19000,"tokenId":"612","fulfillmentTimestamp":1741674591099},
        {"ticker":"BULLCLUB","totalPrice":649,"tokenId":"1703","fulfillmentTimestamp":1741667601886},
      ]
    };
    
    let filteredOrders = ordersData.orders;
    if (ticker) {
      filteredOrders = ordersData.orders.filter(order => order.ticker === ticker);
    }
    
    // Mock global stats data
    const globalStats = {
      totalTrades: 5000,
      totalVolumeKAS: 2500000,
      collections: [
        { ticker: 'KASPUNKS', totalTrades: 1200, totalVolumeKAS: 750000, totalVolumeUsd: 75000 },
        { ticker: 'KASBULLS', totalTrades: 950, totalVolumeKAS: 500000, totalVolumeUsd: 50000 },
        { ticker: 'BULLCLUB', totalTrades: 800, totalVolumeKAS: 400000, totalVolumeUsd: 40000 },
        { ticker: 'KANGO', totalTrades: 600, totalVolumeKAS: 300000, totalVolumeUsd: 30000 },
      ]
    };
    
    // Mock 24h stats data
    const stats24h = {
      totalTrades: 250,
      totalVolumeKAS: 120000,
      collections: [
        { ticker: 'KASPUNKS', totalTrades: 80, totalVolumeKAS: 50000, totalVolumeUsd: 5000 },
        { ticker: 'KASBULLS', totalTrades: 60, totalVolumeKAS: 30000, totalVolumeUsd: 3000 },
        { ticker: 'BULLCLUB', totalTrades: 40, totalVolumeKAS: 20000, totalVolumeUsd: 2000 },
        { ticker: 'KANGO', totalTrades: 30, totalVolumeKAS: 15000, totalVolumeUsd: 1500 },
      ]
    };
    
    // Find stats for a specific collection if requested
    let specificStats = null;
    let specific24hStats = null;
    let collectionData = null;
    
    if (ticker) {
      specificStats = globalStats.collections.find((collection) => collection.ticker === ticker);
      specific24hStats = stats24h.collections.find((collection) => collection.ticker === ticker);
      
      // Mock collection data
      collectionData = {
        ticker: ticker,
        totalSupply: 1000,
        totalMinted: 950,
        totalMintedPercent: 95,
        totalHolders: 450,
        holders: Array(20).fill(0).map((_, i) => ({
          owner: `kaspa:qr${Math.random().toString(36).substring(2, 15)}`,
          count: Math.floor(Math.random() * 30) + 1
        })),
        metadata: {
          description: `${ticker} is a collection of unique NFTs on the Kaspa blockchain.`,
          isVerified: true,
          website: `https://${ticker.toLowerCase()}.io`,
          xUrl: `https://x.com/${ticker.toLowerCase()}`,
          discordUrl: `https://discord.com/${ticker.toLowerCase()}`,
          telegramUrl: `https://t.me/${ticker.toLowerCase()}`,
        }
      };
    }
    
    // Keep the raw orders data for use in the detailed view
    // We'll add timeAgo directly in the React component for display purposes

    // Create sales trends data from the orders
    const salesByDate: { [key: string]: { date: string; volume: number; sales: number } } = {};
    
    // Generate data for the last 7 days to ensure we have chart data
    const today = new Date();
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      const dateStr = `${date.getMonth() + 1}/${date.getDate()}`;
      
      salesByDate[dateStr] = {
        date: dateStr,
        volume: 0,
        sales: 0
      };
    }
    
    // Add actual sales data
    ordersData.orders.forEach(order => {
      const date = new Date(order.fulfillmentTimestamp);
      const dateStr = `${date.getMonth() + 1}/${date.getDate()}`;
      
      if (!salesByDate[dateStr]) {
        salesByDate[dateStr] = {
          date: dateStr,
          volume: 0,
          sales: 0
        };
      }
      
      salesByDate[dateStr].volume += order.totalPrice;
      salesByDate[dateStr].sales += 1;
    });
    
    // Convert to array and ensure it's sorted by date
    const salesTrends = Object.values(salesByDate).sort((a, b) => {
      const dateA = new Date(`2024/${a.date}`);
      const dateB = new Date(`2024/${b.date}`);
      return dateA.getTime() - dateB.getTime();
    });
    
    // Process collections for the top collections charts
    const topCollections = globalStats.collections
      .sort((a, b) => b.totalVolumeKAS - a.totalVolumeKAS)
      .slice(0, 10)
      .map(collection => ({
        ticker: collection.ticker,
        totalTrades: collection.totalTrades,
        totalVolume: collection.totalVolumeKAS,
        totalVolumeUsd: collection.totalVolumeUsd
      }));
      
    const top24hCollections = stats24h.collections
      .sort((a, b) => b.totalVolumeKAS - a.totalVolumeKAS)
      .slice(0, 10)
      .map(collection => ({
        ticker: collection.ticker,
        totalTrades: collection.totalTrades,
        totalVolume: collection.totalVolumeKAS,
        totalVolumeUsd: collection.totalVolumeUsd
      }));
    
    // Return the complete response with all data needed for UI
    return NextResponse.json({
      sales: ordersData.orders,  // Return raw orders data
      globalStats: globalStats,
      stats24h: stats24h,
      specificStats: specificStats,
      specific24hStats: specific24hStats,
      collection: collectionData,
      salesTrends: salesTrends,
      topCollections: topCollections,
      top24hCollections: top24hCollections
    });
  } catch (error) {
    console.error('Error fetching NFT sales:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}