'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Search, BarChart3, ArrowUpRight, Clock, TrendingUp, Coins, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DataTable } from "@/components/ui/data-table";
import { ColumnDef } from "@tanstack/react-table";

interface NFTCollection {
    ticker: string;
    totalSupply: number;
    totalMinted: number;
    totalMintedPercent: number;
    creationDate: number;
    totalHolders: number;
    mintPrice: number;
    volume24h: number;
    totalVolume: number;
    price: number;
    changePrice: number;
    changeVolume24h: number;
    thumbnail_url?: string;
}

interface PriceHistoryItem {
    _id: string;
    totalTrades: number;
    totalVolumeKAS: number;
    avgSalePrice: number;
    parsedDate: string;
}

interface SoldOrder {
    ticker: string;
    totalPrice: number;
    tokenId: string;
    fulfillmentTimestamp: number;
    timeAgo?: string;
    buri?: string;
}

interface HolderInfo {
    owner: string;
    count: number;
}

interface TraitInfo {
    total: number;
    rarity: number;
    rarityScore: number;
}

interface CollectionDetail {
    ticker: string;
    totalSupply: number;
    totalMinted: number;
    totalMintedPercent: number;
    totalHolders: number;
    holders: HolderInfo[];
    metadata: {
        description: string;
        isVerified: boolean;
        website: string;
        xUrl: string;
        discordUrl: string;
        telegramUrl: string;
        traits?: Record<string, Record<string, TraitInfo>>;
    };
}

interface NFTMarketData {
    kaspacom: NFTCollection[];
    ksperbot: Record<string, {
        floor_price: number;
        total_volume: number;
        volume_24h: number;
        change_24h: number;
    }>;
    allTimeVolume: number;
}

interface SalesTrend {
    date: string;
    volume: number;
    sales: number;
}

const formatNumber = (num: number): string => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
};

const NFTInsightsPage = () => {
    const [collections, setCollections] = useState<NFTCollection[]>([]);
    const [filteredCollections, setFilteredCollections] = useState<NFTCollection[]>([]);
    const [markets, setMarkets] = useState<Record<string, any>>({});
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCollection, setSelectedCollection] = useState<string | null>(null);
    const [collectionDetail, setCollectionDetail] = useState<CollectionDetail | null>(null);
    const [priceHistory, setPriceHistory] = useState<PriceHistoryItem[]>([]);
    const [recentSales, setRecentSales] = useState<SoldOrder[]>([]);
    const [salesTrends, setSalesTrends] = useState<SalesTrend[]>([]);
    const [timeframe, setTimeframe] = useState<string>("7d");
    const [currentPage, setCurrentPage] = useState(1);
    const [totalMarketVolume, setTotalMarketVolume] = useState<number>(0);
    const [combinedVolume24h, setCombinedVolume24h] = useState<number>(0);
    const [globalStats, setGlobalStats] = useState<any>(null);
    const [stats24h, setStats24h] = useState<any>(null);
    const [topCollections, setTopCollections] = useState<any[]>([]);
    const [top24hCollections, setTop24hCollections] = useState<any[]>([]);
    const pageSize = 10;

    useEffect(() => {
        fetchMarketData();
        fetchSalesData();

        const defaultDates = [];
        const today = new Date();
        for (let i = 6; i >= 0; i--) {
            const date = new Date();
            date.setDate(today.getDate() - i);
            const dateStr = `${date.getMonth() + 1}/${date.getDate()}`;
            defaultDates.push({
                date: dateStr,
                volume: Math.floor(Math.random() * 5000) + 1000,
                sales: Math.floor(Math.random() * 10) + 5
            });
        }
        setSalesTrends(defaultDates);
    }, []);

    useEffect(() => {
        if (!collections) return;

        let filtered = [...collections];
        if (searchQuery) {
            filtered = filtered.filter(c =>
                c.ticker.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        setFilteredCollections(filtered);
    }, [collections, searchQuery]);

    useEffect(() => {
        if (selectedCollection) {
            fetchCollectionDetails(selectedCollection);
            fetchCollectionSales(selectedCollection);
        }
    }, [selectedCollection, timeframe]);

    const fetchSalesData = async () => {
        try {
            console.log('Fetching sales data from /api/nft-sales');
            const response = await fetch('/api/nft-sales');

            if (!response.ok) {
                console.error(`Sales data fetch failed: ${response.status} ${response.statusText}`);
                return;
            }

            const data = await response.json();
            console.log('Received sales data', {
                salesCount: data.sales?.length || 0,
                trendsCount: data.salesTrends?.length || 0
            });

            if (data.sales && Array.isArray(data.sales)) {
                const processedSales = data.sales.map((sale: { fulfillmentTimestamp: string | number | Date; }) => {
                    const fulfillmentDate = new Date(sale.fulfillmentTimestamp);
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
                        ...sale,
                        timeAgo
                    };
                });

                setRecentSales(processedSales);
            }

            if (data.salesTrends && data.salesTrends.length > 0) {
                setSalesTrends(data.salesTrends);
            }

            setGlobalStats(data.globalStats);
            setStats24h(data.stats24h);
            setTopCollections(data.topCollections || []);
            setTop24hCollections(data.top24hCollections || []);
        } catch (error) {
            console.error('Error fetching sales data:', error);
        }
    };

    const fetchCollectionSales = async (ticker: string) => {
        try {
            console.log(`Fetching sales data for collection: ${ticker}`);
            const response = await fetch(`/api/nft-sales?ticker=${ticker}`);

            if (!response.ok) {
                console.error(`Collection sales fetch failed: ${response.status} ${response.statusText}`);
                return;
            }

            const data = await response.json();
            setSalesTrends(data.salesTrends || []);
        } catch (error) {
            console.error(`Error fetching sales for ${ticker}:`, error);
        }
    };

    const fetchMarketData = async () => {
        try {
            setLoading(true);
            console.log('Fetching market data from /api/nft-holdings');
            const response = await fetch('/api/nft-holdings');

            if (!response.ok) {
                console.error(`Fetch failed with status: ${response.status} ${response.statusText}`);
                throw new Error(`Failed to fetch NFT market data: ${response.status}`);
            }

            const data: NFTMarketData = await response.json();
            console.log('Received market data:', {
                collectionsCount: data.kaspacom?.length || 0,
                marketCount: Object.keys(data.ksperbot || {}).length,
                allTimeVolume: data.allTimeVolume
            });

            if (data.kaspacom) {
                const enhancedCollections = data.kaspacom.map(collection => ({
                    ...collection,
                    thumbnail_url: `https://cache.krc721.stream/krc721/mainnet/thumbnail/${collection.ticker}/1`
                }));
                setCollections(enhancedCollections);
                setFilteredCollections(enhancedCollections);
            }

            if (data.ksperbot) {
                setMarkets(data.ksperbot);
            }

            if (data.allTimeVolume) {
                setTotalMarketVolume(data.allTimeVolume);
            }

            let volume24h = 0;
            if (data.kaspacom) {
                volume24h += data.kaspacom.reduce((sum, item) => sum + (item.volume24h || 0), 0);
            }
            if (data.ksperbot) {
                volume24h += Object.values(data.ksperbot).reduce((sum: number, market: any) =>
                    sum + (market.volume_24h || 0), 0);
            }
            setCombinedVolume24h(volume24h);

            if (data.kaspacom && data.kaspacom.length > 0) {
                setSelectedCollection(data.kaspacom[0].ticker);
            }
        } catch (error) {
            console.error('Error fetching market data:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchCollectionDetails = async (ticker: string) => {
        try {
            console.log(`Fetching details for collection: ${ticker}`);
            const detailRes = await fetch(`https://api.kaspa.com/krc721/${ticker}`);

            if (!detailRes.ok) {
                console.error(`Collection detail fetch failed: ${detailRes.status} ${detailRes.statusText}`);
                throw new Error(`Failed to fetch collection details: ${detailRes.status}`);
            }

            const detailData = await detailRes.json();
            setCollectionDetail(detailData);

            const historyUrl = timeframe !== 'all'
                ? `https://api.kaspa.com/krc721/price-history/${ticker}?timeframe=${timeframe}`
                : `https://api.kaspa.com/krc721/price-history/${ticker}`;

            console.log(`Fetching price history from: ${historyUrl}`);
            const historyRes = await fetch(historyUrl);

            if (!historyRes.ok) {
                console.error(`Price history fetch failed: ${historyRes.status} ${historyRes.statusText}`);
                throw new Error(`Failed to fetch price history: ${historyRes.status}`);
            }

            const historyData = await historyRes.json();
            setPriceHistory(historyData);

        } catch (error) {
            console.error('Error fetching collection details:', error);
        }
    };

    const collectionsColumns: ColumnDef<NFTCollection>[] = [
        {
            accessorKey: "ticker",
            header: () => <div className="text-left">Collection</div>,
            cell: ({ row }) => {
                const collection = row.original;
                return (
                    <div className="flex items-center gap-2 cursor-pointer" onClick={() => setSelectedCollection(collection.ticker)}>
                        <div className="w-8 h-8 rounded-md overflow-hidden bg-muted flex-shrink-0">
                            <img
                                src={collection.thumbnail_url || `https://cache.krc721.stream/krc721/mainnet/thumbnail/${collection.ticker}/1`}
                                alt={collection.ticker}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                    const target = e.target as HTMLImageElement;
                                    target.src = '/kas.png';
                                }}
                            />
                        </div>
                        <div>
                            <span className="font-medium">{collection.ticker}</span>
                        </div>
                    </div>
                );
            }
        },
        {
            accessorKey: "price",
            header: () => <div className="text-right">Floor</div>,
            cell: ({ row }) => {
                const price = parseFloat(row.getValue("price"));
                return <div className="text-right">{price.toLocaleString()} KAS</div>;
            }
        },
        {
            accessorKey: "volume24h",
            header: () => <div className="text-right">24h Volume</div>,
            cell: ({ row }) => {
                const volume = parseFloat(row.getValue("volume24h"));
                return <div className="text-right">{volume.toLocaleString()} KAS</div>;
            }
        },
        {
            accessorKey: "changePrice",
            header: () => <div className="text-right">24h %</div>,
            cell: ({ row }) => {
                const change = parseFloat(row.getValue("changePrice"));
                return (
                    <div className={`text-right ${change >= 0 ? "text-green-500" : "text-red-500"}`}>
                        {change >= 0 ? "+" : ""}{change.toFixed(2)}%
                    </div>
                );
            }
        },
        {
            accessorKey: "totalVolume",
            header: () => <div className="text-right">Total Volume</div>,
            cell: ({ row }) => {
                const volume = parseFloat(row.getValue("totalVolume"));
                return <div className="text-right">{volume.toLocaleString()} KAS</div>;
            }
        },
        {
            accessorKey: "totalHolders",
            header: () => <div className="text-right">Holders</div>,
            cell: ({ row }) => {
                const holders = parseFloat(row.getValue("totalHolders"));
                return <div className="text-right">{holders.toLocaleString()}</div>;
            }
        }
    ];

    const recentSalesColumns: ColumnDef<SoldOrder>[] = [
        {
            accessorKey: "ticker",
            header: () => <div className="text-left">Collection</div>,
            cell: ({ row }) => (
                <div className="font-medium flex items-center">
                    <img
                        src={`https://cache.krc721.stream/krc721/mainnet/thumbnail/${row.getValue("ticker")}/1`}
                        alt={`${row.getValue("ticker")}`}
                        className="w-6 h-6 rounded-sm mr-2 object-cover"
                        onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = '/kas.png';
                        }}
                    />
                    {row.getValue("ticker")}
                </div>
            )
        },
        {
            accessorKey: "tokenId",
            header: () => <div className="text-center">Token ID</div>,
            cell: ({ row }) => <div className="text-center">#{row.getValue("tokenId")}</div>
        },
        {
            accessorKey: "totalPrice",
            header: () => <div className="text-right">Price</div>,
            cell: ({ row }) => <div className="text-right font-medium">{parseFloat(row.getValue("totalPrice")).toLocaleString()} KAS</div>
        },
        {
            accessorKey: "timeAgo",
            header: () => <div className="text-right">Time</div>,
            cell: ({ row }) => <div className="text-right text-muted-foreground">{row.getValue("timeAgo")}</div>
        }
    ];

    const paginatedCollections = filteredCollections.slice(
        (currentPage - 1) * pageSize,
        currentPage * pageSize
    );

    const totalPages = Math.ceil(filteredCollections.length / pageSize);

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    const getNFTImageUrl = (collection: string, tokenId: string) => {
        return `https://cache.krc721.stream/krc721/mainnet/thumbnail/${collection}/${tokenId}`;
    };

    const COLORS = ['#3b82f6', '#22c55e', '#eab308', '#ef4444', '#8b5cf6', '#ec4899'];

    return (
        <div className="py-1">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
            >
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-2 gap-2 px-2">
                    <div>
                        <h3 className="text-xl font-medium">NFT Insights</h3>
                        <p className="text-muted-foreground text-sm">Explore NFT collections and market trends on Kaspa</p>
                    </div>
                </div>

                <div className="px-2">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-2">
                        <Card>
                            <CardHeader className="pb-1">
                                <CardTitle className="flex items-center text-base font-medium">
                                    <Coins className="w-4 h-4 mr-2 text-primary" />
                                    Total Market Volume
                                </CardTitle>
                                <CardDescription>All-time volume across platforms</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="text-xl font-bold">{totalMarketVolume.toLocaleString()} KAS</div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="pb-">
                                <CardTitle className="flex items-center text-base font-medium">
                                    <TrendingUp className="w-4 h-4 mr-2 text-green-500" />
                                    24h Trading Volume
                                </CardTitle>
                                <CardDescription>Volume in the last 24 hours</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="text-xl font-bold">{combinedVolume24h.toLocaleString()} KAS</div>
                            </CardContent>
                        </Card>
                    </div>

                    {selectedCollection && collectionDetail && (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mb-2">
                            <Card className="md:col-span-2">
                                <CardHeader className="flex flex-row items-center justify-between">
                                    <div>
                                        <CardTitle className="flex items-center gap-2">
                                            <img
                                                src={`https://cache.krc721.stream/krc721/mainnet/thumbnail/${selectedCollection}/1`}
                                                alt={selectedCollection}
                                                className="w-8 h-8 rounded-md mr-2 object-cover"
                                                onError={(e) => {
                                                    const target = e.target as HTMLImageElement;
                                                    target.src = '/kas.png';
                                                }}
                                            />
                                            {selectedCollection}
                                            {collectionDetail.metadata.isVerified && (
                                                <Badge variant="outline" className="bg-blue-100">Verified</Badge>
                                            )}
                                        </CardTitle>
                                        <CardDescription>{collectionDetail.metadata.description}</CardDescription>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {collectionDetail.metadata.xUrl && (
                                            <a href={collectionDetail.metadata.xUrl} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:text-blue-700">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                                                    <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723 10.055 10.055 0 01-3.127 1.195 4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.937 4.937 0 004.604 3.417 9.868 9.868 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.054 0 13.999-7.496 13.999-13.986 0-.209 0-.42-.015-.63a10.025 10.025 0 002.46-2.548l-.047-.02z" />
                                                </svg>
                                            </a>
                                        )}
                                        {collectionDetail.metadata.telegramUrl && (
                                            <a href={collectionDetail.metadata.telegramUrl} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:text-blue-700">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                                                    <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.963 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
                                                </svg>
                                            </a>
                                        )}
                                        {collectionDetail.metadata.website && (
                                            <a href={collectionDetail.metadata.website} target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-gray-700">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                    <circle cx="12" cy="12" r="10"></circle>
                                                    <line x1="2" y1="12" x2="22" y2="12"></line>
                                                    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
                                                </svg>
                                            </a>
                                        )}
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <Tabs defaultValue="price-history">
                                        <TabsList className="mb-2">
                                            <TabsTrigger value="price-history">Price History</TabsTrigger>
                                            <TabsTrigger value="traits">Traits</TabsTrigger>
                                            <TabsTrigger value="holders">Holders</TabsTrigger>
                                        </TabsList>

                                        <TabsContent value="price-history">
                                            <div className="flex justify-end mb-2">
                                                <div className="flex items-center space-x-2">
                                                    <Button
                                                        onClick={() => setTimeframe("1d")}
                                                        variant={timeframe === "1d" ? "default" : "outline"}
                                                        size="sm"
                                                    >
                                                        24h
                                                    </Button>
                                                    <Button
                                                        onClick={() => setTimeframe("7d")}
                                                        variant={timeframe === "7d" ? "default" : "outline"}
                                                        size="sm"
                                                    >
                                                        7d
                                                    </Button>
                                                    <Button
                                                        onClick={() => setTimeframe("30d")}
                                                        variant={timeframe === "30d" ? "default" : "outline"}
                                                        size="sm"
                                                    >
                                                        30d
                                                    </Button>
                                                    <Button
                                                        onClick={() => setTimeframe("all")}
                                                        variant={timeframe === "all" ? "default" : "outline"}
                                                        size="sm"
                                                    >
                                                        All
                                                    </Button>
                                                </div>
                                            </div>

                                            {(priceHistory || []).length > 0 ? (
                                                <ResponsiveContainer width="100%" height={300}>
                                                    <LineChart data={priceHistory} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                                                        <CartesianGrid strokeDasharray="3 3" />
                                                        <XAxis
                                                            dataKey="parsedDate"
                                                            tickFormatter={(date) => new Date(date).toLocaleDateString()}
                                                        />
                                                        <YAxis />
                                                        <Tooltip
                                                            formatter={(value: number) => [`${value.toLocaleString()} KAS`, 'Avg. Price']}
                                                            labelFormatter={(date) => new Date(date).toLocaleDateString()}
                                                        />
                                                        <Legend />
                                                        <Line type="monotone" dataKey="avgSalePrice" stroke="#8884d8" name="Avg. Price" />
                                                    </LineChart>
                                                </ResponsiveContainer>
                                            ) : (
                                                <div className="text-center py-2 text-gray-500">No price history available</div>
                                            )}

                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mt-2">
                                                <div className="bg-secondary rounded-lg p-2">
                                                    <div className="text-sm text-gray-500">Floor Price</div>
                                                    <div className="text-2xl font-bold">{collections.find(c => c.ticker === selectedCollection)?.price.toLocaleString()} KAS</div>
                                                </div>

                                                <div className="bg-secondary rounded-lg p-2">
                                                    <div className="text-sm text-gray-500">Total Supply</div>
                                                    <div className="text-2xl font-bold">{collectionDetail.totalSupply.toLocaleString()}</div>
                                                </div>

                                                <div className="bg-secondary rounded-lg p-2">
                                                    <div className="text-sm text-gray-500">Total Holders</div>
                                                    <div className="text-2xl font-bold">{collectionDetail.totalHolders.toLocaleString()}</div>
                                                </div>
                                            </div>
                                        </TabsContent>

                                        <TabsContent value="traits">
                                            <div className="space-y-1">
                                                {collectionDetail.metadata.traits && Object.entries(collectionDetail.metadata.traits).map(([category, traits]) => (
                                                    <div key={category} className="space-y-1">
                                                        <h3 className="text-lg font-semibold">{category}</h3>
                                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                                                            {Object.entries(traits)
                                                                .sort(([, a], [, b]) => b.rarity - a.rarity)
                                                                .slice(0, 8)
                                                                .map(([trait, info]) => (
                                                                    <div key={trait} className="bg-secondary p-3 rounded-lg">
                                                                        <div className="font-medium">{trait}</div>
                                                                        <div className="text-sm text-gray-500">
                                                                            {info.total} items ({info.rarity.toFixed(1)}%)
                                                                        </div>
                                                                        <div className="text-xs">
                                                                            Rarity score: {info.rarityScore.toFixed(2)}
                                                                        </div>
                                                                    </div>
                                                                ))}
                                                        </div>
                                                    </div>
                                                ))}

                                                {!collectionDetail.metadata.traits && (
                                                    <div className="text-center py-2 text-gray-500">No trait data available</div>
                                                )}
                                            </div>
                                        </TabsContent>

                                        <TabsContent value="holders">
                                            <div className="space-y-1">
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                                    <div className="bg-secondary rounded-lg p-2">
                                                        <div className="text-sm text-gray-500">Total Holders</div>
                                                        <div className="text-2xl font-bold">{collectionDetail.totalHolders.toLocaleString()}</div>
                                                    </div>

                                                    <div className="bg-secondary rounded-lg p-2">
                                                        <div className="text-sm text-gray-500">Unique Ownership Percentage</div>
                                                        <div className="text-2xl font-bold">
                                                            {((collectionDetail.totalHolders / collectionDetail.totalSupply) * 100).toFixed(2)}%
                                                        </div>
                                                    </div>
                                                </div>

                                                <h3 className="text-lg font-semibold">Top Holders</h3>
                                                <div className="space-y-1">
                                                    {(collectionDetail.holders || [])
                                                        .sort((a, b) => b.count - a.count)
                                                        .slice(0, 10)
                                                        .map((holder, index) => (
                                                            <div key={index} className="flex justify-between p-2 rounded-lg bg-secondary">
                                                                <div className="truncate w-3/4">
                                                                    {holder.owner.substring(0, 12)}...{holder.owner.substring(holder.owner.length - 12)}
                                                                </div>
                                                                <div>
                                                                    {holder.count} NFTs ({((holder.count / collectionDetail.totalSupply) * 100).toFixed(2)}%)
                                                                </div>
                                                            </div>
                                                        ))}
                                                </div>
                                            </div>
                                        </TabsContent>
                                    </Tabs>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center text-base font-medium">
                                        <Clock className="w-4 h-4 mr-2 text-amber-500" />
                                        Recent Sales
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    {(recentSales || []).filter(s => s.ticker === selectedCollection).length > 0 ? (
                                        <div className="space-y-1">
                                            {recentSales
                                                .filter(s => s.ticker === selectedCollection)
                                                .slice(0, 7)
                                                .map((sale, index) => (
                                                    <div key={index} className="flex justify-between border-b pb-2">
                                                        <div>
                                                            <span className="font-medium">{selectedCollection} #{sale.tokenId}</span>
                                                            <div className="text-xs text-gray-500">
                                                                {sale.timeAgo}
                                                            </div>
                                                        </div>
                                                        <div className="font-medium">{sale.totalPrice.toLocaleString()} KAS</div>
                                                    </div>
                                                ))}
                                        </div>
                                    ) : (
                                        <div className="text-center py-1 text-gray-500">No recent sales</div>
                                    )}

                                    <div className="mt-2 pt-2 border-t">
                                        <div className="text-center">
                                            <Card className="bg-muted/20 border border-dashed">
                                                <CardContent className="p-2 flex items-center justify-center">
                                                    <img
                                                        src={getNFTImageUrl(selectedCollection, "1")}
                                                        alt={`${selectedCollection} #1`}
                                                        className="w-24 h-24 object-cover rounded-md"
                                                        onError={(e) => {
                                                            const target = e.target as HTMLImageElement;
                                                            target.src = '/kas.png';
                                                        }}
                                                    />
                                                </CardContent>
                                            </Card>
                                            <div className="mt-2 text-sm text-muted-foreground">
                                                Example NFT from collection
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 gap-2">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center text-base font-medium">
                                    <TrendingUp className="w-4 h-4 mr-2 text-green-500" />
                                    Top Collections by Volume
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                {loading ? (
                                    <div className="space-y-1">
                                        {Array(5).fill(0).map((_, index) => (
                                            <div key={index} className="flex items-center justify-between p-2 border rounded-md animate-pulse">
                                                <div className="flex items-center gap-2">
                                                    <Skeleton className="h-8 w-8 rounded-md" />
                                                    <Skeleton className="h-4 w-32" />
                                                </div>
                                                <Skeleton className="h-4 w-20" />
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="space-y-1">
                                        {collections
                                            .sort((a, b) => b.totalVolume - a.totalVolume)
                                            .slice(0, 7)
                                            .map((collection, index) => (
                                                <div
                                                    key={index}
                                                    className={`flex items-center justify-between p-2 border rounded-md cursor-pointer hover:bg-muted/50 ${selectedCollection === collection.ticker ? 'bg-primary/5 border-primary/20' : ''}`}
                                                    onClick={() => setSelectedCollection(collection.ticker)}
                                                >
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-8 h-8 rounded-md overflow-hidden bg-muted">
                                                            <img
                                                                src={`https://cache.krc721.stream/krc721/mainnet/thumbnail/${collection.ticker}/1`}
                                                                alt={collection.ticker}
                                                                className="w-full h-full object-cover"
                                                                onError={(e) => {
                                                                    const target = e.target as HTMLImageElement;
                                                                    target.src = '/kas.png';
                                                                }}
                                                            />
                                                        </div>
                                                        <span className="font-medium">{collection.ticker}</span>
                                                    </div>
                                                    <span className="font-medium">{formatNumber(collection.totalVolume)} KAS</span>
                                                </div>
                                            ))
                                        }
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center text-base font-medium">
                                    <ArrowUpRight className="w-4 h-4 mr-2 text-green-500" />
                                    Biggest 24h Gainers
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                {loading ? (
                                    <div className="space-y-1">
                                        {Array(5).fill(0).map((_, index) => (
                                            <div key={index} className="flex items-center justify-between p-2 border rounded-md animate-pulse">
                                                <div className="flex items-center gap-2">
                                                    <Skeleton className="h-8 w-8 rounded-md" />
                                                    <Skeleton className="h-4 w-32" />
                                                </div>
                                                <Skeleton className="h-4 w-20" />
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="space-y-1">
                                        {collections
                                            .filter(c => c.changePrice > 0)
                                            .sort((a, b) => b.changePrice - a.changePrice)
                                            .slice(0, 7)
                                            .map((collection, index) => (
                                                <div
                                                    key={index}
                                                    className={`flex items-center justify-between p-2 border rounded-md cursor-pointer hover:bg-muted/50 ${selectedCollection === collection.ticker ? 'bg-primary/5 border-primary/20' : ''}`}
                                                    onClick={() => setSelectedCollection(collection.ticker)}
                                                >
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-8 h-8 rounded-md overflow-hidden bg-muted">
                                                            <img
                                                                src={`https://cache.krc721.stream/krc721/mainnet/thumbnail/${collection.ticker}/1`}
                                                                alt={collection.ticker}
                                                                className="w-full h-full object-cover"
                                                                onError={(e) => {
                                                                    const target = e.target as HTMLImageElement;
                                                                    target.src = '/kas.png';
                                                                }}
                                                            />
                                                        </div>
                                                        <span className="font-medium">{collection.ticker}</span>
                                                    </div>
                                                    <span className="text-green-500 font-medium">+{collection.changePrice.toFixed(2)}%</span>
                                                </div>
                                            ))
                                        }

                                        {collections.filter(c => c.changePrice > 0).length === 0 && (
                                            <div className="text-center py-1 text-gray-500">No collections with positive gains</div>
                                        )}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    <Card className="gap-2">
                        <CardHeader>
                            <CardTitle className="flex items-center text-base font-medium">
                                <Clock className="w-4 h-4 mr-2 text-blue-500" />
                                Recent Sales
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {loading ? (
                                <div className="space-y-1">
                                    {Array(8).fill(0).map((_, index) => (
                                        <div key={index} className="flex items-center justify-between p-2 border rounded-md animate-pulse">
                                            <div className="flex items-center gap-2">
                                                <Skeleton className="h-8 w-8 rounded-md" />
                                                <Skeleton className="h-4 w-32" />
                                            </div>
                                            <Skeleton className="h-4 w-20" />
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="overflow-auto">
                                    <table className="w-full">
                                        <thead>
                                            <tr className="border-b text-sm">
                                                <th className="text-left p-2">Collection</th>
                                                <th className="text-left p-2">Token ID</th>
                                                <th className="text-right p-2">Price</th>
                                                <th className="text-right p-2">Time</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {recentSales.map((sale, index) => (
                                                <tr key={index} className="border-b hover:bg-muted/50 text-sm">
                                                    <td className="p-2">
                                                        <div className="flex items-center gap-2">
                                                            <div className="w-8 h-8 rounded-md overflow-hidden bg-muted">
                                                                <img
                                                                    src={`https://cache.krc721.stream/krc721/mainnet/thumbnail/${sale.ticker}/${sale.tokenId}`}
                                                                    alt={`${sale.ticker} #${sale.tokenId}`}
                                                                    className="w-full h-full object-cover"
                                                                    onError={(e) => {
                                                                        const target = e.target as HTMLImageElement;
                                                                        target.src = '/kas.png';
                                                                    }}
                                                                />
                                                            </div>
                                                            <span className="font-medium">{sale.ticker}</span>
                                                        </div>
                                                    </td>
                                                    <td className="p-2">#{sale.tokenId}</td>
                                                    <td className="p-2 text-right font-medium">{sale.totalPrice.toLocaleString()} KAS</td>
                                                    <td className="p-2 text-right text-muted-foreground">
                                                        {(() => {
                                                            const time = new Date(sale.fulfillmentTimestamp);
                                                            const now = new Date();
                                                            const diffSeconds = Math.floor((now.getTime() - time.getTime()) / 1000);

                                                            if (diffSeconds < 60) return `${diffSeconds}s ago`;
                                                            if (diffSeconds < 3600) return `${Math.floor(diffSeconds / 60)}m ago`;
                                                            if (diffSeconds < 86400) return `${Math.floor(diffSeconds / 3600)}h ago`;
                                                            return `${Math.floor(diffSeconds / 86400)}d ago`;
                                                        })()}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base font-medium">NFT Collections</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {loading ? (
                                <div className="space-y-1">
                                    {Array(8).fill(0).map((_, index) => (
                                        <div key={index} className="flex items-center justify-between p-1 border rounded-md animate-pulse">
                                            <div className="flex items-center gap-1">
                                                <Skeleton className="h-10 w-10 rounded-md" />
                                                <Skeleton className="h-4 w-32" />
                                            </div>
                                            <Skeleton className="h-4 w-20" />
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <>
                                    <DataTable
                                        columns={collectionsColumns}
                                        data={paginatedCollections}
                                        showPagination={false}
                                        searchColumn="ticker"
                                    />

                                    <div className="flex justify-center mt-2">
                                        <div className="flex items-center gap-2">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handlePageChange(1)}
                                                disabled={currentPage === 1}
                                            >
                                                <ChevronsLeft className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handlePageChange(currentPage - 1)}
                                                disabled={currentPage === 1}
                                            >
                                                <ChevronLeft className="h-4 w-4" />
                                            </Button>

                                            <span className="mx-2">
                                                Page {currentPage} of {totalPages}
                                            </span>

                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handlePageChange(currentPage + 1)}
                                                disabled={currentPage === totalPages}
                                            >
                                                <ChevronRight className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handlePageChange(totalPages)}
                                                disabled={currentPage === totalPages}
                                            >
                                                <ChevronsRight className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                </>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </motion.div>
        </div>
    );
};

export default NFTInsightsPage;