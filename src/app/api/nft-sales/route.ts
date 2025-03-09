import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const ticker = searchParams.get('ticker');
    
    const globalStatsResponse = await fetch('https://api.kaspa.com/krc721-data/trade-stats');
    let globalStats = null;
    if (globalStatsResponse.ok) {
      globalStats = await globalStatsResponse.json();
    } else {
      return NextResponse.json({ error: 'Failed to fetch global NFT stats' }, { status: globalStatsResponse.status });
    }
    
    const stats24hResponse = await fetch('https://api.kaspa.com/krc721-data/trade-stats?timeframe=1d');
    let stats24h = null;
    if (stats24hResponse.ok) {
      stats24h = await stats24hResponse.json();
    }
    
    interface Order {
      fulfillmentTimestamp: string;
      ticker: string;
      tokenId: string;
      totalPrice: number;
    }

    let ordersData: { orders: Order[] } = { orders: [] };
    let collectionData = null;
    let specificStats = null;
    let specific24hStats = null;
    
    if (ticker) {
      const ordersResponse = await fetch(`https://api.kaspa.com/krc721-data/sold-orders`);
      if (ordersResponse.ok) {
        ordersData = await ordersResponse.json();
      }
      
      const collectionResponse = await fetch(`https://api.kaspa.com/krc721/${ticker}`);
      if (collectionResponse.ok) {
        collectionData = await collectionResponse.json();
      }
      
      if (globalStats && globalStats.collections) {
        specificStats = globalStats.collections.find((collection: any) => collection.ticker === ticker);
      }
      
      if (stats24h && stats24h.collections) {
        specific24hStats = stats24h.collections.find((collection: any) => collection.ticker === ticker);
      }
    } else {
      if (globalStats && globalStats.collections && globalStats.collections.length > 0) {
        const topCollection = globalStats.collections[0];
        const topOrdersResponse = await fetch(`https://api.kaspa.com/krc721-data/sold-orders?ticker=${topCollection.ticker}`);
        if (topOrdersResponse.ok) {
          ordersData = await topOrdersResponse.json();
        }
      }
    }
    
    const processedSales = ordersData.orders.slice(0, 5).map((order: any) => {
      const fulfillmentDate = new Date(order.fulfillmentTimestamp);
      const now = new Date();
      const diffSeconds = Math.floor((now.getTime() - fulfillmentDate.getTime()) / 1000);
      
      let timeAgo;
      if (diffSeconds < 60) {
        timeAgo = `${diffSeconds}s ago`;
      } else if (diffSeconds < 3600) {
        timeAgo = `${Math.floor(diffSeconds / 60)}m ago`;
      } else if (diffSeconds < 86400) {
        timeAgo = `${Math.floor(diffSeconds / 3600)}h ago`;
      } else {
        timeAgo = `${Math.floor(diffSeconds / 86400)}d ago`;
      }
      
      return {
        collection: order.ticker,
        tokenId: order.tokenId,
        price: order.totalPrice,
        timeAgo: timeAgo
      };
    });

    const salesByDate: { [key: string]: { date: string; volume: number; sales: number } } = {};
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
    
    const salesTrends = Object.values(salesByDate);
    
    const topCollections = globalStats.collections
      .sort((a: any, b: any) => b.totalVolumeKAS - a.totalVolumeKAS)
      .slice(0, 10)
      .map((collection: any) => ({
        ticker: collection.ticker,
        totalTrades: collection.totalTrades,
        totalVolume: collection.totalVolumeKAS,
        totalVolumeUsd: collection.totalVolumeUsd
      }));
    const top24hCollections = stats24h?.collections
      .sort((a: any, b: any) => b.totalVolumeKAS - a.totalVolumeKAS)
      .slice(0, 10)
      .map((collection: any) => ({
        ticker: collection.ticker,
        totalTrades: collection.totalTrades,
        totalVolume: collection.totalVolumeKAS,
        totalVolumeUsd: collection.totalVolumeUsd
      })) || [];
    
    return NextResponse.json({
      sales: processedSales,
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