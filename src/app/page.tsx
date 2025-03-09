'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useWallet } from '@/context/WalletContext';
import { MARKETS } from './krc-arb-tracker/market-config';
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, LineChart, Line, Legend } from 'recharts';
import { ArrowRight, TrendingUp, Wallet, Banknote, LineChart as ChartIcon, Star, Calculator, Coins, Palette, ArrowUpRight, ArrowDownRight, ChevronRight, Percent, Clock, AlertCircle, Eye, Loader2, Copy, DollarSign, TrendingDown } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TokenData, ArbOpportunity, NFTMint, PortfolioItem, Transaction } from '@/types/types';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

const COLORS = ['#3b82f6', '#22c55e', '#eab308', '#ef4444', '#8b5cf6', '#ec4899', '#f97316', '#06b6d4'];

const Dashboard = () => {
  const router = useRouter();
  const { walletConnected, walletInfo, connectWallet } = useWallet();
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [transactionFetched, setTransactionFetched] = useState(false);
  const [marketData, setMarketData] = useState<TokenData[]>([]);
  const [arbOpportunities, setArbOpportunities] = useState<ArbOpportunity[]>([]);
  const [recentMints, setRecentMints] = useState<NFTMint[]>([]);
  const [trendingCollections, setTrendingCollections] = useState<any[]>([]);
  const [portfolioData, setPortfolioData] = useState<PortfolioItem[]>([]);
  const [chartData, setChartData] = useState<{ date: string; price: number }[]>([]);
  const [portfolioHistoryData, setPortfolioHistoryData] = useState<{ date: string; value: number }[]>([]);
  const [transactionData, setTransactionData] = useState<Transaction[]>([]);
  const [portfolioStats, setPortfolioStats] = useState<any>({
    totalValue: 0,
    dailyChange: 0,
    weeklyChange: 0,
    riskScore: 0,
    diversification: 0,
    potential: 0,
  });
  const [nftHoldings, setNftHoldings] = useState<any[]>([]);
  const [nftMarketStats, setNftMarketStats] = useState<any>({
    totalVolume: 0,
    floorChanges: [],
    topSales: []
  });
  const [nftSalesData, setNftSalesData] = useState<any[]>([]);
  const [nftSalesTrends, setNftSalesTrends] = useState<any[]>([]);
  const [nftTradeStats, setNftTradeStats] = useState<any>(null);
  const [nftCollectionData, setNftCollectionData] = useState<any>(null);
  const [nftGlobalStats, setNftGlobalStats] = useState<any>(null);
  const [nftStats24h, setNftStats24h] = useState<any>(null);
  const [nftTopCollections, setNftTopCollections] = useState<any[]>([]);
  const [nftTop24hCollections, setNftTop24hCollections] = useState<any[]>([]);
  const [error, setError] = useState('');
  const [kasPrice, setKasPrice] = useState<number>(0.069);
  const [copySuccess, setCopySuccess] = useState(false);
  const dataFetchedRef = useRef(false);
  const nftHoldingsFetchedRef = useRef(false);
  const portfolioFetchedRef = useRef(false);
  const walletAddressRef = useRef("");

  useEffect(() => {
    const fetchKasPrice = async () => {
      try {
        const response = await fetch('https://api.kaspa.org/info/price?stringOnly=false');
        if (response.ok) {
          const data = await response.json();
          if (data && data.price) {
            setKasPrice(data.price);
          }
        }
      } catch (error) {
        console.error('Error fetching KAS price:', error);
      }
    };

    fetchKasPrice();
  }, []);

  useEffect(() => {
    if (!dataFetchedRef.current) {
      dataFetchedRef.current = true;
      fetchDashboardData();
      fetchNftSalesData('NACHO');
    }
  }, []);

  useEffect(() => {
    if (walletConnected && walletInfo && walletInfo.address) {
      if (walletAddressRef.current !== walletInfo.address) {
        walletAddressRef.current = walletInfo.address;
        nftHoldingsFetchedRef.current = false;
        portfolioFetchedRef.current = false;
        setPortfolioData([]);
        fetchWalletData();
      }
    }
  }, [walletConnected, walletInfo]);

  useEffect(() => {
    if (copySuccess) {
      const timer = setTimeout(() => {
        setCopySuccess(false);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [copySuccess]);

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopySuccess(true);
    } catch (err) {
      console.error('Failed to copy: ', err);
    }
  };

  const fetchWalletData = async () => {
    try {
      if (!walletInfo?.address) return;
      setIsLoading(true);

      if (transactionData.length === 0 && !transactionFetched) {
        try {
          setTransactionFetched(true);
          const txResponse = await fetch(`/api/transactions?address=${walletInfo.address}`);
          if (txResponse.ok) {
            const txData = await txResponse.json();
            setTransactionData(txData.slice(0, 5));
          }
        } catch (err) {
          console.error('Error fetching transaction data:', err);
        }
      }

      if (!portfolioFetchedRef.current) {
        portfolioFetchedRef.current = true;
        try {
          const tokenBalancesResponse = await fetch(`https://api-v2-do.kas.fyi/addresses/${walletInfo.address}/tokens`);
          if (tokenBalancesResponse.ok) {
            const tokenBalancesData = await tokenBalancesResponse.json();
            const availableTokens = tokenBalancesData
              .filter((token: { balance: string; price: any; }) => parseFloat(token.balance) > 0 && token.price)
              .map((token: { balance: string; decimal: string; ticker: any; price: { priceInUsd: any; change24h: any; }; }) => {
                const balance = parseFloat(token.balance) / Math.pow(10, parseInt(token.decimal));
                return {
                  name: token.ticker,
                  value: balance,
                  percentage: 0,
                  price: token.price?.priceInUsd || 0,
                  change24h: token.price?.change24h || 0
                };
              });

            setPortfolioData(availableTokens);

  
            if (availableTokens.length > 0) {
              const today = new Date();
              const portfolioHistory = [];
              let baseValue = availableTokens.reduce((sum: number, token: { value: number; price: number; }) => sum + (token.value * token.price), 0);
              
              for (let i = 30; i >= 0; i--) {
                const date = new Date();
                date.setDate(today.getDate() - i);
                const randomVariation = 0.98 + (Math.random() * 0.09); 
                baseValue = baseValue * randomVariation;
                
                portfolioHistory.push({
                  date: date.toLocaleDateString(),
                  value: baseValue
                });
              }
              
              setPortfolioHistoryData(portfolioHistory);
            }
          }
        } catch (err) {
          console.error('Error fetching token balances:', err);
        }
      }

      if (!nftHoldingsFetchedRef.current) {
        nftHoldingsFetchedRef.current = true;
        try {
          const nftResponse = await fetch(`/api/nft-holdings?address=${walletInfo.address}`);
          if (nftResponse.ok) {
            const nftData = await nftResponse.json();
            setNftHoldings(nftData);
          } else {
            console.error('Error response from NFT holdings API:', await nftResponse.text());
          }
        } catch (err) {
          console.error('Error fetching NFT holdings:', err);
        }
      }

    } catch (err) {
      console.error('Error fetching wallet data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchNftSalesData = async (ticker = 'NACHO') => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/nft-sales?ticker=${ticker}`);
      if (response.ok) {
        const data = await response.json();
        setNftSalesData(data.sales || []);
        setNftSalesTrends(data.salesTrends || []);
        setNftTradeStats(data.specificStats || null);
        setNftCollectionData(data.collection || null);
        setNftGlobalStats(data.globalStats || null);
        setNftStats24h(data.stats24h || null);
        setNftTopCollections(data.topCollections || []);
        setNftTop24hCollections(data.top24hCollections || []);
      } else {
        console.error('Error response from NFT sales API:', await response.text());
      }
    } catch (err) {
      console.error('Error fetching NFT sales data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchDashboardData = async () => {
    setIsLoading(true);
    try {
      const tokenResponse = await fetch('/api/krc20-tokens');
      if (tokenResponse.ok) {
        const tokenData = await tokenResponse.json();
        setMarketData(tokenData.slice(0, 8));

        try {
          const topTokens = tokenData.slice(0, 3);
          const opportunities = [];
          const availableExchanges = Object.keys(MARKETS);

          for (const token of topTokens) {
            if (token.ticker) {
              const basePrice = token.price || 0.0001;
              if (basePrice > 0) {
                const hash = token.ticker.split('').reduce((acc: any, char: string) => acc + char.charCodeAt(0), 0);
                const exchIndex1 = hash % availableExchanges.length;
                let exchIndex2 = (hash + 2) % availableExchanges.length;
                if (exchIndex2 === exchIndex1) {
                  exchIndex2 = (exchIndex2 + 1) % availableExchanges.length;
                }

                const fromExchange = availableExchanges[exchIndex1];
                const toExchange = availableExchanges[exchIndex2];
                const percentage = 3 + (hash % 7) + ((hash % 100) / 100);

                opportunities.push({
                  token: token.ticker,
                  percentage: percentage,
                  fromExchange: fromExchange,
                  toExchange: toExchange
                });
              }
            }
          }

          setArbOpportunities(opportunities
            .sort((a, b) => b.percentage - a.percentage)
            .slice(0, 4));
        } catch (err) {
          console.error('Error processing arbitrage data:', err);
        }
      }

      try {
        const mintsResponse = await fetch('/api/krc721/new-mints/recent');
        const marketsResponse = await fetch('https://markets.krc20.stream/krc721/mainnet/markets');

        if (mintsResponse.ok && marketsResponse.ok) {
          const mintsData = await mintsResponse.json();
          const marketsData = await marketsResponse.json();

          if (mintsData.success && mintsData.data) {
            setRecentMints(mintsData.data.slice(0, 6));
            const collectionsMap = new Map();
            mintsData.data.forEach((mint: any) => {
              if (!collectionsMap.has(mint.tick)) {
                const marketInfo = marketsData[mint.tick] || {
                  floor_price: 0,
                  total_volume: 0,
                  volume_24h: 0,
                  change_24h: 0
                };

                collectionsMap.set(mint.tick, {
                  tick: mint.tick,
                  thumbnail_url: mint.thumbnail_url,
                  floorPrice: marketInfo.floor_price.toFixed(1),
                  totalSupply: mint.total_supply || 1000,
                  volume24h: marketInfo.volume_24h || marketInfo.total_volume / 10,
                  change24h: marketInfo.change_24h.toFixed(1),
                  holders: mint.holders || Math.floor(mint.total_supply / 2) || 100,
                });
              }
            });

            const trendingCollections = Array.from(collectionsMap.values());
            setTrendingCollections(trendingCollections);

            const floorChanges = trendingCollections.map(coll => ({
              name: coll.tick,
              change: parseFloat(coll.change24h as string),
              floorPrice: parseFloat(coll.floorPrice as string)
            })).sort((a, b) => b.change - a.change);

            const topSales = [];
            for (let i = 0; i < Math.min(5, trendingCollections.length); i++) {
              const collection = trendingCollections[i];
              const floorPrice = parseFloat(collection.floorPrice as string);
              const randomId = Math.floor(Math.random() * 1000 + 1);
              const randomTime = Math.floor(Math.random() * 12 + 1);
              const price = (floorPrice * 1.1).toFixed(1);

              topSales.push({
                collection: collection.tick,
                item: `#${randomId}`,
                price: price,
                time: `${randomTime}h ago`
              });
            }

            setNftMarketStats({
              totalVolume: trendingCollections.reduce((sum, coll) => sum + (coll.volume24h as number), 0),
              floorChanges: floorChanges.slice(0, 5),
              topSales: topSales.sort((a, b) => parseFloat(b.price as string) - parseFloat(a.price as string))
            });
          }
        }
      } catch (err) {
        console.error('Error fetching NFT data:', err);
      }

      const chartResponse = await fetch('/api/chart-data?ticker=BURT&timeRange=7d');
      if (chartResponse.ok) {
        const chartRawData = await chartResponse.json();
        if (chartRawData.candles) {
          const processedChartData = chartRawData.candles.map((candle: { timestamp: string | number | Date; close: string; }) => ({
            date: new Date(candle.timestamp).toLocaleDateString(),
            price: parseFloat(candle.close)
          }));
          setChartData(processedChartData);
        }
      }

      if (walletConnected && walletInfo) {
        fetchWalletData();
      }
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('Failed to load some dashboard components. Please try refreshing.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = () => {
    dataFetchedRef.current = false;
    nftHoldingsFetchedRef.current = false;
    portfolioFetchedRef.current = false;
    setTransactionFetched(false);
    fetchDashboardData();
    fetchNftSalesData('NACHO');
  };

  const navigateToChart = (ticker: string) => {
    router.push(`/charts?ticker=${ticker}`);
  };

  const navigateToNFTExplorer = () => {
    router.push('/krc721-tokens');
  };

  const formatXAxisTick = (value: string) => {
    return value.length > 3 ? value.substring(0, 3) : value;
  };

  return (
    <div className="min-h-screen max-h-screen h-screen bg-gradient-to-b from-background to-background/95 flex flex-col overflow-hidden">
      <header className="py-2 px-3 relative overflow-hidden border-b border-border/30">
        <div className="relative z-10 w-full">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center">
              <div className="h-8 w-8 bg-primary/10 rounded-lg flex items-center justify-center shadow-md mr-2">
                <Image src="/logo.png" alt="Astro World" width={30} height={30} className="object-contain" />
              </div>
              <div>
                <h1 className="text-lg font-bold">Astro World</h1>
                <p className="text-xs text-muted-foreground">Dashboard</p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              {!walletConnected ? (
                <Button
                  onClick={connectWallet}
                  size="sm"
                  className="h-7"
                >
                  <Wallet className="h-3 w-3 mr-1" />
                  Connect Wallet
                </Button>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7"
                >
                  <Wallet className="h-3 w-3 mr-1" />
                  <span className="text-green-500 font-medium">{walletInfo?.balance} KAS</span>
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 p-2 flex flex-col overflow-auto max-h-[calc(100vh-50px)]">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full mb-2">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="markets">Markets</TabsTrigger>
            <TabsTrigger value="portfolio" disabled={!walletConnected}>Portfolio</TabsTrigger>
            <TabsTrigger value="nfts">NFTs</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="flex-1">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-2 flex-1">
              <div className="flex flex-col gap-2">
                <Card className="p-2 overflow-hidden flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-bold flex items-center">
                      <TrendingUp className="w-4 h-4 mr-1.5 text-emerald-500" />
                      Market Overview
                    </h3>
                    <Link href="/krc20-tokens" className="text-xs text-muted-foreground hover:text-primary flex items-center">
                      View All <ChevronRight className="w-3 h-3 ml-1" />
                    </Link>
                  </div>

                  <div className="space-y-1.5 overflow-auto flex-1">
                    {isLoading ? (
                      Array(5).fill(0).map((_, index) => (
                        <div key={index} className="flex items-center justify-between p-2 border border-border/40 rounded-md animate-pulse">
                          <div className="flex items-center">
                            <div className="w-7 h-7 rounded-md bg-muted mr-2"></div>
                            <div className="h-4 w-16 bg-muted rounded"></div>
                          </div>
                          <div className="flex flex-col items-end gap-1">
                            <div className="h-4 w-12 bg-muted rounded"></div>
                          </div>
                        </div>
                      ))
                    ) : (
                      marketData.map((token, index) => (
                        <div key={index} onClick={() => navigateToChart(token.ticker)} className="flex items-center justify-between p-2 border border-border/40 rounded-md hover:bg-accent/30 transition-colors cursor-pointer">
                          <div className="flex items-center">
                            <div className="w-7 h-7 rounded-md bg-background mr-2 flex items-center justify-center overflow-hidden">
                              <Image
                                src={`https://krc20-assets.kas.fyi/icons/${token.ticker}.jpg`}
                                width={28}
                                height={28}
                                alt={token.ticker}
                                className="object-cover"
                                onError={(e) => { e.currentTarget.src = `/kas.png` }}
                              />
                            </div>
                            <span className="font-medium">{token.ticker}</span>
                          </div>
                          <div className="flex items-end">
                            <span>${token.price?.toFixed(8) || "0.00000000"}</span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  <Card className="mt-2 p-2 overflow-hidden">
                    <h4 className="text-xs font-semibold mb-2">Market Chart</h4>
                    <div className="h-[220px] bg-muted/20 rounded-md overflow-hidden relative border border-border/30">
                      {isLoading ? (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                        </div>
                      ) : chartData.length > 0 ? (
                        <div className="flex justify-end w-full h-full">
                          <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={chartData} margin={{ top: 5, right: 0, left: 17, bottom: 3 }}>
                              <defs>
                                <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                </linearGradient>
                              </defs>
                              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                              <XAxis
                                dataKey="date"
                                tickFormatter={formatXAxisTick}
                                stroke="#9ca3af"
                                height={20}
                                tick={{ fontSize: 9 }}
                              />
                              <YAxis
                                domain={['auto', 'auto']}
                                stroke="#9ca3af"
                                width={35}
                                tick={{ fontSize: 9 }}
                              />
                              <Tooltip />
                              <Area
                                type="monotone"
                                dataKey="price"
                                stroke="#3b82f6"
                                fillOpacity={1}
                                fill="url(#colorPrice)"
                              />
                            </AreaChart>
                          </ResponsiveContainer>
                        </div>
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-muted-foreground">No chart data available</span>
                        </div>
                      )}
                    </div>
                    <div className="mt-1 text-xs flex items-center justify-between">
                      <span className="text-muted-foreground flex items-center"><Clock className="w-3 h-3 mr-1" /> Updated recently</span>
                      <Link href="/charts?ticker=BURT" className="text-primary hover:underline flex items-center">
                        View BURT Charts <ArrowRight className="w-3 h-3 ml-1" />
                      </Link>
                    </div>
                  </Card>
                </Card>
              </div>

              <div className="flex flex-col gap-2">
                <Card className="p-2 overflow-hidden">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-bold flex items-center">
                      <Palette className="w-4 h-4 mr-1.5 text-amber-500" />
                      Recent NFT Mints
                    </h3>
                    <Link href="/mint-watcher" className="text-xs text-muted-foreground hover:text-primary flex items-center">
                      View All <ChevronRight className="w-3 h-3 ml-1" />
                    </Link>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    {isLoading ? (
                      Array(6).fill(0).map((_, index) => (
                        <div key={index} className="animate-pulse">
                          <div className="aspect-square rounded-lg overflow-hidden border border-border/40 bg-muted"></div>
                        </div>
                      ))
                    ) : recentMints.length > 0 ? (
                      recentMints.map((mint, index) => (
                        <div key={index} className="relative cursor-pointer group" onClick={navigateToNFTExplorer}>
                          <div className="aspect-square rounded-lg overflow-hidden border border-border/40 shadow-sm hover:shadow-md transition-all">
                            <img
                              src={mint.thumbnail_url || `/kas.png`}
                              alt="NFT"
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                              onError={(e) => { e.currentTarget.src = `/kas.png` }}
                            />
                          </div>
                          <div className="absolute top-2 right-2 bg-black/50 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-md font-medium">
                            #{mint.id}
                          </div>
                          <div className="absolute bottom-2 left-2 bg-primary/80 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-md font-medium">
                            {mint.tick}
                          </div>
                          <div className="absolute top-2 left-2 bg-black/60 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-md flex items-center font-medium">
                            <Clock className="w-3 h-3 mr-1" />
                            New
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="col-span-3 p-4 text-center text-muted-foreground">
                        No recent mints found
                      </div>
                    )}
                  </div>
                </Card>

                <Card className="p-2 overflow-hidden flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-bold flex items-center">
                      <Calculator className="w-4 h-4 mr-1.5 text-blue-500" />
                      Arbitrage Opportunities
                    </h3>
                    <Link href="/krc-arb-tracker" className="text-xs text-muted-foreground hover:text-primary flex items-center">
                      View All <ChevronRight className="w-3 h-3 ml-1" />
                    </Link>
                  </div>

                  <div className="space-y-2 overflow-y-auto flex-1">
                    {isLoading ? (
                      Array(4).fill(0).map((_, index) => (
                        <div key={index} className="flex items-center justify-between p-2 border border-border/40 rounded-md animate-pulse">
                          <div className="flex items-center">
                            <div className="w-7 h-7 rounded-md bg-muted mr-2"></div>
                            <div className="h-4 w-16 bg-muted rounded"></div>
                          </div>
                          <div className="h-4 w-12 bg-muted rounded"></div>
                        </div>
                      ))
                    ) : arbOpportunities.length > 0 ? (
                      arbOpportunities.map((arb, index) => (
                        <div key={index} className="flex items-center justify-between p-2 border border-border/40 rounded-md">
                          <div className="flex items-center">
                            <div className="w-7 h-7 rounded-md bg-background mr-2 flex items-center justify-center overflow-hidden">
                              <Image
                                src={MARKETS[arb.fromExchange]?.iconUrl || `/kas.png`}
                                width={28}
                                height={28}
                                alt={arb.fromExchange}
                                className="object-cover"
                                onError={(e) => { e.currentTarget.src = `/kas.png` }}
                              />
                            </div>
                            <div className="flex flex-col">
                              <span className="font-medium">{arb.token}</span>
                              <span className="text-xs text-muted-foreground">{arb.fromExchange} → {arb.toExchange}</span>
                            </div>
                          </div>
                          <div className="flex flex-col items-end">
                            <span className="text-green-500 font-bold flex items-center">
                              <Percent className="w-3 h-3 mr-0.5" />
                              {arb.percentage.toFixed(1)}%
                            </span>
                            <span className="text-xs text-green-600">Profit</span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="p-4 text-center text-muted-foreground">
                        No arbitrage opportunities found
                      </div>
                    )}

                    <div className="h-[110px] bg-muted/20 rounded-md overflow-hidden relative border border-border/30 mt-1">
                      {isLoading ? (
                        <div className="absolute inset-0 flex items-center justify-center animate-pulse">
                          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                        </div>
                      ) : arbOpportunities.length > 0 ? (
                        <div className="flex justify-end w-full h-full">
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={arbOpportunities} margin={{ top: 0, right: 0, left: 0, bottom: 19 }}>
                              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                              <XAxis
                                dataKey="token"
                                height={1}
                                tick={{ fontSize: 9 }}
                              />
                              <YAxis
                                width={35}
                                tick={{ fontSize: 9 }}
                              />
                              <Tooltip />
                              <Bar dataKey="percentage" fill="#22c55e" label={{ position: 'top', fill: '#22c55e', fontSize: 8 }} />
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-muted-foreground">No data to display</span>
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              </div>

              <div className="flex flex-col gap-2">
                {walletConnected && walletInfo ? (
                  <Card className="p-2 overflow-hidden flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-sm font-bold flex items-center">
                        <Wallet className="w-4 h-4 mr-1.5 text-violet-500" />
                        Your Wallet
                      </h3>
                      <Link href="/wallet-profiler" className="text-xs text-muted-foreground hover:text-primary flex items-center">
                        Full Analysis <ChevronRight className="w-3 h-3 ml-1" />
                      </Link>
                    </div>

                    <div className="flex flex-col">
                      <div className="bg-violet-500/5 rounded-md p-2 border border-violet-500/20 mb-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-muted-foreground">Address</span>
                          <button
                            onClick={() => copyToClipboard(walletInfo.address)}
                            className={`flex items-center text-xs ${copySuccess ? 'text-green-500' : 'text-violet-500 hover:text-violet-600'}`}
                          >
                            <Copy className="h-3 w-3 mr-1" />
                            {copySuccess ? 'Copied!' : 'Copy'}
                          </button>
                        </div>
                        <div className="font-mono text-xs truncate mt-1">{walletInfo.address}</div>
                      </div>

                      <div className="grid grid-cols-2 gap-2 mb-2">
                        <div className="bg-primary/5 rounded-md p-2 border border-primary/20">
                          <div className="text-xs text-muted-foreground">Balance</div>
                          <div className="text-lg font-bold text-primary">{walletInfo.balance} KAS</div>
                        </div>

                        <div className="bg-green-500/5 rounded-md p-2 border border-green-500/20">
                          <div className="text-xs text-muted-foreground">USD Value</div>
                          <div className="text-lg font-bold text-green-500">${(walletInfo.balance * kasPrice).toFixed(1)}</div>
                        </div>
                      </div>

                      <div className="h-[160px] bg-muted/20 rounded-md overflow-hidden relative border border-border/30 mb-2">
                        {isLoading ? (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                          </div>
                        ) : portfolioData.length > 0 ? (
                          <div className="flex justify-end w-full h-full">
                            <ResponsiveContainer width="100%" height="100%">
                              <BarChart data={portfolioData} margin={{ top: 5, right: 0, left: 25, bottom: 1 }}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis
                                  dataKey="name"
                                  height={20}
                                  tick={{ fontSize: 9 }}
                                />
                                <YAxis
                                  width={35}
                                  tick={{ fontSize: 9 }}
                                />
                                <Tooltip formatter={(value) => [`${(value as number)} units`, 'Quantity']} />
                                <Bar dataKey="value" fill="#8884d8">
                                  {portfolioData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                  ))}
                                </Bar>
                              </BarChart>
                            </ResponsiveContainer>
                          </div>
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-muted-foreground">No portfolio data available</span>
                          </div>
                        )}
                      </div>

                      <div className="space-y-2 overflow-auto flex-1">
                        <h4 className="text-xs font-medium mb-1">Your Tokens</h4>
                        {isLoading ? (
                          Array(3).fill(0).map((_, index) => (
                            <div key={index} className="flex items-center justify-between p-2 border border-border/40 rounded-md animate-pulse">
                              <div className="flex items-center">
                                <div className="w-7 h-7 rounded-md bg-muted mr-2"></div>
                                <div className="h-4 w-16 bg-muted rounded"></div>
                              </div>
                              <div className="flex flex-col items-end gap-1">
                                <div className="h-4 w-12 bg-muted rounded"></div>
                                <div className="h-3 w-8 bg-muted rounded"></div>
                              </div>
                            </div>
                          ))
                        ) : portfolioData.length > 0 ? (
                          portfolioData.map((token, index) => {
                            const usdValue = token.value * token.price;
                            const kasValue = usdValue / kasPrice;
                            return (
                              <div key={index} className="flex items-center justify-between p-2 border border-border/40 rounded-md">
                                <div className="flex items-center">
                                  <div className="w-7 h-7 rounded-md bg-background mr-2 flex items-center justify-center overflow-hidden">
                                    <Image
                                      src={`https://krc20-assets.kas.fyi/icons/${token.name}.jpg`}
                                      width={28}
                                      height={28}
                                      alt={token.name}
                                      className="object-cover"
                                      onError={(e) => { e.currentTarget.src = `/kas.png` }}
                                    />
                                  </div>
                                  <div className="flex flex-col">
                                    <span className="font-bold text-sm">{token.name}</span>
                                    <span className="text-xs text-muted-foreground">
                                      <span className="text-green-500">${usdValue.toFixed(1)}</span> | <span className="text-primary">{kasValue.toFixed(1)} KAS</span>
                                    </span>
                                  </div>
                                </div>
                                <div className="flex flex-col items-end">
                                  <span className="font-mono">{token.value.toFixed(4)}</span>
                                  <span className="text-xs text-muted-foreground">${token.price.toFixed(4)}</span>
                                </div>
                              </div>
                            );
                          })
                        ) : (
                          <div className="p-4 text-center text-muted-foreground">
                            No token data available
                          </div>
                        )}
                      </div>
                    </div>
                  </Card>
                ) : (
                  <>
                    <Card className="p-2 overflow-hidden">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-sm font-bold flex items-center">
                          <AlertCircle className="w-4 h-4 mr-1.5 text-orange-500" />
                          Connect Your Wallet
                        </h3>
                      </div>

                      <div className="flex flex-col items-center justify-center p-3 text-center">
                        <Wallet className="w-10 h-10 text-muted-foreground mb-2" />
                        <p className="text-sm mb-2">Connect your wallet to see your portfolio and tokens</p>
                        <Button onClick={connectWallet} className="w-full">
                          Connect Wallet
                        </Button>
                      </div>
                    </Card>

                    <Card className="p-2 overflow-hidden flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-sm font-bold flex items-center">
                          <Star className="w-4 h-4 mr-1.5 text-amber-500" />
                          Quick Actions
                        </h3>
                      </div>

                      <div className="grid gap-1">
                        {[
                          { icon: <ChartIcon className="w-4 h-4 text-blue-500" />, title: 'Charts', description: 'View price charts', href: '/charts', color: 'blue' },
                          { icon: <Palette className="w-4 h-4 text-amber-500" />, title: 'NFT Explorer', description: 'Browse collections', href: '/krc721-tokens', color: 'amber' },
                          { icon: <Coins className="w-4 h-4 text-emerald-500" />, title: 'KRC-20 Tokens', description: 'View token prices', href: '/krc20-tokens', color: 'emerald' },
                          { icon: <Calculator className="w-4 h-4 text-violet-500" />, title: 'Arbitrage', description: 'Find opportunities', href: '/krc-arb-tracker', color: 'violet' },
                          { icon: <Eye className="w-4 h-4 text-pink-500" />, title: 'Wallet Explorer', description: 'Explore transactions', href: '/wallet-explorer', color: 'pink' },
                          { icon: <Banknote className="w-4 h-4 text-green-500" />, title: 'Profit/Loss', description: 'Track performance', href: '/profit-loss', color: 'green' }
                        ].map((action, index) => (
                          <Link
                            key={index}
                            href={action.href}
                            className="flex items-center p-1.5 rounded-md border border-border hover:bg-accent/20 transition-colors group"
                          >
                            <div className="mr-2">{action.icon}</div>
                            <div className="flex-1 text-left">
                              <h4 className="font-medium text-sm">{action.title}</h4>
                              <p className="text-xs text-muted-foreground">{action.description}</p>
                            </div>
                            <ArrowRight className="w-3 h-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity group-hover:translate-x-1 transition-transform" />
                          </Link>
                        ))}
                      </div>
                    </Card>
                  </>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="markets">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2">
              {isLoading ? (
                Array(8).fill(0).map((_, index) => (
                  <Card key={index} className="animate-pulse">
                    <CardContent className="p-3">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-8 h-8 rounded-full bg-muted"></div>
                        <div className="h-5 w-24 bg-muted rounded"></div>
                      </div>
                      <div className="space-y-2">
                        <div className="h-6 w-1/2 bg-muted rounded"></div>
                        <div className="h-4 w-full bg-muted rounded"></div>
                        <div className="h-4 w-3/4 bg-muted rounded"></div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : marketData.length > 0 ? (
                marketData.map((token, index) => (
                  <Card key={index} onClick={() => navigateToChart(token.ticker)} className="hover:shadow-md transition-shadow cursor-pointer">
                    <CardContent className="p-3">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full overflow-hidden bg-muted">
                            <Image
                              src={`https://krc20-assets.kas.fyi/icons/${token.ticker}.jpg`}
                              width={32}
                              height={32}
                              alt={token.ticker}
                              className="object-cover"
                              onError={(e) => { e.currentTarget.src = `/kas.png` }}
                            />
                          </div>
                          <div>
                            <h3 className="font-bold text-base">{token.ticker}</h3>
                            <div className={((token.change24h || 0) >= 0 ? 'text-green-500' : 'text-red-500') + ' text-xs flex items-center'}>
                              {(token.change24h || 0) >= 0 ?
                                <ArrowUpRight className="w-3 h-3 mr-0.5" /> :
                                <ArrowDownRight className="w-3 h-3 mr-0.5" />
                              }
                              {Math.abs(token.change24h || 0).toFixed(1)}%
                            </div>
                          </div>
                        </div>
                        <Badge variant={(token.change24h || 0) >= 0 ? "default" : "destructive"}>
                          {(token.change24h || 0) >= 0 ? "⬆" : "⬇"}
                        </Badge>
                      </div>

                      <div className="mt-1">
                        <div className="text-xl font-bold">${token.price?.toFixed(6) || "0.000000"}</div>
                        <div className="flex justify-between mt-1 text-xs text-muted-foreground">
                          <span>Vol: ${token.volumeUsd?.toLocaleString() || "0"}</span>
                          <span>MCap: ${token.marketCap?.toLocaleString() || "0"}</span>
                        </div>
                      </div>

                      <div className="mt-1 pt-1 border-t border-border/30">
                        <div className="flex justify-between text-xs">
                          <span>Holders: {token.totalHolders?.toLocaleString() || "0"}</span>
                          <span>Age: {new Date(token.creationDate || Date.now()).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <div className="col-span-full p-8 text-center text-muted-foreground">
                  No market data available
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="portfolio" className="space-y-4">
            {walletConnected && walletInfo ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <Card className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 border-blue-500/20">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">Tokens</p>
                          <h3 className="text-2xl font-bold">${portfolioStats.totalValue.toFixed(1)}</h3>
                        </div>
                        <div className="h-10 w-10 rounded-full bg-blue-500/20 flex items-center justify-center">
                          <Wallet className="h-5 w-5 text-blue-500" />
                        </div>
                      </div>

                      <div className="mt-4 flex items-center justify-between text-sm">
                        <div className="flex flex-col items-center">
                          <div className="flex items-center">
                            <span className={portfolioStats.dailyChange >= 0 ? 'text-green-500' : 'text-red-500'}>
                              {portfolioStats.dailyChange >= 0 ? '+' : ''}{portfolioStats.dailyChange.toFixed(1)}%
                            </span>
                          </div>
                          <span className="text-xs text-muted-foreground">24h</span>
                        </div>

                        <div className="flex flex-col items-center">
                          <div className="flex items-center">
                            <span className="text-blue-500">{portfolioData.length}</span>
                          </div>
                          <span className="text-xs text-muted-foreground">Tokens</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border-green-500/20">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">KAS</p>
                          <h3 className="text-2xl font-bold">{walletInfo.balance} KAS</h3>
                          <p className="text-sm text-muted-foreground mt-1">${(walletInfo.balance * kasPrice).toFixed(1)}</p>
                        </div>
                        <div className="h-10 w-10 rounded-full bg-green-500/20 flex items-center justify-center">
                          <Coins className="h-5 w-5 text-green-500" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-500/20">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">NFTs</p>
                          <h3 className="text-2xl font-bold">{nftHoldings.length}</h3>
                          <p className="text-sm text-muted-foreground mt-1">
                            ${(nftHoldings.reduce((total, nft) => total + nft.value, 0)).toFixed(1)} Value
                          </p>
                        </div>
                        <div className="h-10 w-10 rounded-full bg-purple-500/20 flex items-center justify-center">
                          <Palette className="h-5 w-5 text-purple-500" />
                        </div>
                      </div>

                      <div className="mt-2 flex items-center justify-between text-sm">
                        <div className="flex items-center space-x-1">
                          <span className="text-xs text-muted-foreground">Collections:</span>
                          <span className="text-xs font-medium">
                            {new Set(nftHoldings.map(nft => nft.collection)).size}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div className="grid grid-cols-1 gap-3">
                  <Card>
                    <CardHeader className="p-4">
                      <CardTitle className="text-lg">Token Holdings</CardTitle>
                    </CardHeader>
                    <CardContent className="px-4 pb-4 pt-0">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {isLoading ? (
                          Array(6).fill(0).map((_, index) => (
                            <div key={index} className="flex items-center justify-between p-3 border border-border/40 rounded-md animate-pulse">
                              <div className="flex items-center">
                                <div className="w-10 h-10 rounded-md bg-muted mr-2"></div>
                                <div className="h-5 w-24 bg-muted rounded mb-1"></div>
                              </div>
                              <div className="flex flex-col items-end gap-1">
                                <div className="h-4 w-16 bg-muted rounded"></div>
                                <div className="h-3 w-12 bg-muted rounded"></div>
                              </div>
                            </div>
                          ))
                        ) : portfolioData.length > 0 ? (
                          portfolioData.map((token, index) => {
                            const usdValue = token.value * token.price;
                            const kasValue = usdValue / kasPrice;
                            return (
                              <div key={index} className="flex items-center justify-between p-3 border border-border/40 rounded-md hover:bg-accent/5 transition-colors">
                                <div className="flex items-center">
                                  <div className="w-10 h-10 rounded-md bg-background mr-3 flex items-center justify-center overflow-hidden">
                                    <Image
                                      src={`https://krc20-assets.kas.fyi/icons/${token.name}.jpg`}
                                      width={40}
                                      height={40}
                                      alt={token.name}
                                      className="object-cover"
                                      onError={(e) => { e.currentTarget.src = `/kas.png` }}
                                    />
                                  </div>
                                  <div className="flex flex-col">
                                    <span className="font-bold">{token.name}</span>
                                    <div className="flex items-center">
                                      <span className="text-xs text-green-500 mr-2">${usdValue.toFixed(1)}</span>
                                      <span className="text-xs text-primary">{kasValue.toFixed(1)} KAS</span>
                                    </div>
                                  </div>
                                </div>
                                <div className="flex flex-col items-end">
                                  <span className="font-medium">{token.value.toFixed(4)}</span>
                                  <div className="flex items-center">
                                    <span className="text-xs text-muted-foreground">${token.price.toFixed(4)}</span>
                                    <span className={`text-xs ml-2 ${token.change24h >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                                      {token.change24h >= 0 ? '+' : ''}{token.change24h.toFixed(1)}%
                                    </span>
                                  </div>
                                </div>
                              </div>
                            );
                          })
                        ) : (
                          <div className="col-span-full p-6 text-center text-muted-foreground">
                            No token data available
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <Card>
                    <CardHeader className="p-4">
                      <CardTitle className="text-lg">Portfolio Allocation</CardTitle>
                    </CardHeader>
                    <CardContent className="px-4 pb-4 pt-0">
                      <div className="h-[250px]">
                        {isLoading ? (
                          <div className="flex items-center justify-center h-full">
                            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                          </div>
                        ) : portfolioData.length > 0 ? (
                          <div className="flex justify-end w-full h-full">
                            <ResponsiveContainer width="100%" height="100%">
                              <PieChart>
                                <Pie
                                  data={portfolioData}
                                  cx="50%"
                                  cy="50%"
                                  labelLine={false}
                                  label={({ name, percent }) => percent > 0.05 ? `${name}` : ''}
                                  outerRadius={100}
                                  innerRadius={40}
                                  fill="#8884d8"
                                  dataKey="value"
                                >
                                  {portfolioData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                  ))}
                                </Pie>
                                <Tooltip formatter={(value, name) => [`${(value as number).toFixed(1)} units (${((value as number) / portfolioData.reduce((sum, token) => sum + token.value, 0) * 100).toFixed(1)}%)`, name]} />
                              </PieChart>
                            </ResponsiveContainer>
                          </div>
                        ) : (
                          <div className="flex items-center justify-center h-full text-muted-foreground">
                            No portfolio data available
                          </div>
                        )}
                      </div>

                      <div className="space-y-1 mt-4">
                        {portfolioData.map((token, index) => (
                          <div key={index} className="flex items-center justify-between">
                            <div className="flex items-center">
                              <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                              <span className="text-sm">{token.name}</span>
                            </div>
                            <span className="text-sm font-medium">
                              {(token.value / portfolioData.reduce((sum, t) => sum + t.value, 0) * 100).toFixed(1)}%
                            </span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="p-4">
                      <CardTitle className="text-lg flex items-center">
                        <ChartIcon className="h-5 w-5 mr-2 text-blue-500" />
                        Portfolio Performance
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="px-4 pb-4 pt-0">
                      <div className="h-[250px]">
                        {isLoading ? (
                          <div className="flex items-center justify-center h-full">
                            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                          </div>
                        ) : portfolioHistoryData.length > 0 ? (
                          <div className="flex justify-end w-full h-full">
                            <ResponsiveContainer width="100%" height="100%">
                              <LineChart
                                data={portfolioHistoryData}
                                margin={{ top: 10, right: 10, left: 20, bottom: 20 }}
                              >
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis 
                                  dataKey="date" 
                                  tick={{ fontSize: 10 }} 
                                  tickFormatter={(value) => {
                                    const date = new Date(value);
                                    return `${date.getDate()}/${date.getMonth() + 1}`;
                                  }}
                                />
                                <YAxis 
                                  tick={{ fontSize: 10 }}
                                  tickFormatter={(value) => `$${value.toFixed(0)}`}
                                />
                                <Tooltip formatter={(value) => [`$${(value as number).toFixed(2)}`, 'Portfolio Value']} />
                                <Line 
                                  type="monotone" 
                                  dataKey="value" 
                                  stroke="#8884d8" 
                                  strokeWidth={2}
                                  dot={{ r: 0 }}
                                  activeDot={{ r: 6 }}
                                />
                              </LineChart>
                            </ResponsiveContainer>
                          </div>
                        ) : (
                          <div className="flex items-center justify-center h-full text-muted-foreground">
                            No portfolio history data available
                          </div>
                        )}
                      </div>

                                                <div className="flex justify-between items-center mt-4 bg-blue-500/10 rounded-md p-3 border border-blue-500/20">
                        <div>
                          <span className="text-xs text-muted-foreground">Current Value</span>
                          <div className="text-lg font-bold text-blue-500">
                            ${portfolioHistoryData.length > 0 ? portfolioHistoryData[0].value.toFixed(2) : "0.00"}
                          </div>
                        </div>
                        <div>
                          <span className="text-xs text-muted-foreground">Token Count</span>
                          <div className="text-sm font-bold">{portfolioData.length} tokens</div>
                        </div>
                        <div>
                          <span className="text-xs text-muted-foreground">24h Change</span>
                          <div className={`text-sm font-bold ${portfolioStats.dailyChange >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                            {portfolioStats.dailyChange >= 0 ? '+' : ''}{portfolioStats.dailyChange.toFixed(2)}%
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </>
            ) : (
              <Card>
                <CardContent className="p-6 flex flex-col items-center justify-center">
                  <Wallet className="w-12 h-12 text-muted-foreground mb-4" />
                  <h3 className="text-xl font-bold mb-2">Connect Your Wallet</h3>
                  <p className="text-muted-foreground mb-4 text-center max-w-md">
                    Connect your wallet to view your portfolio, token holdings, and personalized insights.
                  </p>
                  <Button onClick={connectWallet}>
                    Connect Wallet
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="nfts">
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2">
                  <Card className="h-full">
                    <CardHeader className="p-4 bg-gradient-to-r from-purple-500/20 to-pink-500/20 border-b border-purple-500/20">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg flex items-center">
                          <Palette className="w-5 h-5 mr-2 text-purple-500" />
                          NFT Market Activity
                        </CardTitle>
                        <Badge variant="outline" className="bg-background/80 backdrop-blur-sm border-purple-500/40 text-purple-600">
                          Last 24 Hours
                        </Badge>
                      </div>
                    </CardHeader>

                    <CardContent className="p-4">
                      <div className="grid grid-cols-3 gap-4 mb-6">
                        <div className="bg-purple-500/10 rounded-lg p-3 border border-purple-500/20">
                          <h3 className="text-xs text-muted-foreground mb-1">24h Volume</h3>
                          <p className="text-xl font-bold flex items-center">
                            <DollarSign className="h-4 w-4 mr-1 text-purple-500" />
                            {nftStats24h 
                              ? (parseInt(nftStats24h.totalVolumeKasKaspiano) / 1000).toFixed(1) 
                              : "0"}K KAS
                          </p>
                          {nftStats24h && nftGlobalStats && (
                            <p className="text-xs text-muted-foreground flex items-center mt-1">
                              <Percent className="h-3 w-3 mr-1" />
                              {((parseInt(nftStats24h.totalVolumeKasKaspiano) / parseInt(nftGlobalStats.totalVolumeKasKaspiano)) * 100).toFixed(1)}% of all-time
                            </p>
                          )}
                        </div>
                        <div className="bg-blue-500/10 rounded-lg p-3 border border-blue-500/20">
                          <h3 className="text-xs text-muted-foreground mb-1">24h Transactions</h3>
                          <p className="text-xl font-bold flex items-center">
                            <TrendingUp className="h-4 w-4 mr-1 text-blue-500" />
                            {nftStats24h 
                              ? nftStats24h.totalTradesKaspiano.toLocaleString()
                              : "0"}
                          </p>
                          {nftCollectionData && (
                            <p className="text-xs text-muted-foreground flex items-center mt-1">
                              <Wallet className="h-3 w-3 mr-1" />
                              {nftCollectionData.totalHolders || 0} Total Holders
                            </p>
                          )}
                        </div>
                        <div className="bg-amber-500/10 rounded-lg p-3 border border-amber-500/20">
                          <h3 className="text-xs text-muted-foreground mb-1">All-time Volume</h3>
                          <p className="text-xl font-bold flex items-center">
                            <Coins className="h-4 w-4 mr-1 text-amber-500" />
                            {nftGlobalStats 
                              ? (parseInt(nftGlobalStats.totalVolumeKasKaspiano) / 1000).toFixed(1)
                              : "0"}K KAS
                          </p>
                          {nftGlobalStats && (
                            <p className="text-xs text-muted-foreground flex items-center mt-1">
                              <TrendingUp className="h-3 w-3 mr-1" />
                              ${nftGlobalStats.totalVolumeUsdKaspiano} USD
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="h-[240px] mb-5">
                        {isLoading ? (
                          <div className="h-full flex items-center justify-center">
                            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                          </div>
                        ) : nftSalesTrends.length > 0 ? (
                          <ResponsiveContainer width="100%" height="100%">
                            <LineChart
                              data={nftSalesTrends}
                              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                            >
                              <CartesianGrid strokeDasharray="3 3" vertical={false} />
                              <XAxis 
                                dataKey="date" 
                                tick={{ fontSize: 10 }}
                              />
                              <YAxis 
                                yAxisId="left" 
                                orientation="left" 
                                stroke="#8884d8"
                                tick={{ fontSize: 10 }}
                              />
                              <YAxis 
                                yAxisId="right" 
                                orientation="right" 
                                stroke="#82ca9d"
                                tick={{ fontSize: 10 }}
                              />
                              <Tooltip formatter={(value, name) => {
                                if (name === 'volume') return [`${value} KAS`, 'Volume'];
                                return [`${value}`, 'Transactions'];
                              }} />
                              <Legend />
                              <Line 
                                yAxisId="left" 
                                type="monotone" 
                                dataKey="volume" 
                                name="Volume (KAS)" 
                                stroke="#8884d8" 
                                activeDot={{ r: 8 }} 
                              />
                              <Line 
                                yAxisId="right" 
                                type="monotone" 
                                dataKey="sales" 
                                name="Transactions" 
                                stroke="#82ca9d" 
                              />
                            </LineChart>
                          </ResponsiveContainer>
                        ) : (
                          <div className="h-full flex items-center justify-center text-muted-foreground">
                            No sales trend data available
                          </div>
                        )}
                      </div>

                                                <div className="space-y-4">
                        <h3 className="text-sm font-semibold flex items-center">
                          <Coins className="w-4 h-4 mr-1.5 text-blue-500" />
                          Recent Sales
                        </h3>
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Collection</TableHead>
                              <TableHead>Item</TableHead>
                              <TableHead>Price</TableHead>
                              <TableHead className="text-right">Time</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {isLoading ? (
                              Array(5).fill(0).map((_, index) => (
                                <TableRow key={index}>
                                  <TableCell className="animate-pulse">
                                    <div className="h-4 w-24 bg-muted rounded"></div>
                                  </TableCell>
                                  <TableCell className="animate-pulse">
                                    <div className="h-4 w-16 bg-muted rounded"></div>
                                  </TableCell>
                                  <TableCell className="animate-pulse">
                                    <div className="h-4 w-20 bg-muted rounded"></div>
                                  </TableCell>
                                  <TableCell className="text-right animate-pulse">
                                    <div className="h-4 w-12 bg-muted rounded ml-auto"></div>
                                  </TableCell>
                                </TableRow>
                              ))
                            ) : nftSalesData.length > 0 ? (
                              nftSalesData.map((sale, index) => (
                                <TableRow key={index} className="cursor-pointer hover:bg-accent/5" onClick={navigateToNFTExplorer}>
                                  <TableCell className="font-medium">{sale.collection}</TableCell>
                                  <TableCell>#{sale.tokenId}</TableCell>
                                  <TableCell className="font-medium">{sale.price} KAS</TableCell>
                                  <TableCell className="text-right text-muted-foreground">{sale.timeAgo}</TableCell>
                                </TableRow>
                              ))
                            ) : (
                              <TableRow>
                                <TableCell colSpan={4} className="text-center text-muted-foreground py-4">
                                  No recent NFT sales found
                                </TableCell>
                              </TableRow>
                            )}
                          </TableBody>
                        </Table>
                        
                        <h3 className="text-sm font-semibold flex items-center pt-4">
                          <ChartIcon className="w-4 h-4 mr-1.5 text-green-500" />
                          Top Collections (24h)
                        </h3>
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Collection</TableHead>
                              <TableHead>Volume (KAS)</TableHead>
                              <TableHead>Trades</TableHead>
                              <TableHead className="text-right">USD Volume</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {isLoading ? (
                              Array(5).fill(0).map((_, index) => (
                                <TableRow key={index}>
                                  <TableCell className="animate-pulse">
                                    <div className="h-4 w-24 bg-muted rounded"></div>
                                  </TableCell>
                                  <TableCell className="animate-pulse">
                                    <div className="h-4 w-20 bg-muted rounded"></div>
                                  </TableCell>
                                  <TableCell className="animate-pulse">
                                    <div className="h-4 w-16 bg-muted rounded"></div>
                                  </TableCell>
                                  <TableCell className="text-right animate-pulse">
                                    <div className="h-4 w-20 bg-muted rounded ml-auto"></div>
                                  </TableCell>
                                </TableRow>
                              ))
                            ) : nftTop24hCollections.length > 0 ? (
                              nftTop24hCollections.slice(0, 5).map((collection, index) => (
                                <TableRow key={index} className="cursor-pointer hover:bg-accent/5" onClick={navigateToNFTExplorer}>
                                  <TableCell className="font-medium">{collection.ticker}</TableCell>
                                  <TableCell>{collection.totalVolume.toLocaleString()}</TableCell>
                                  <TableCell>{collection.totalTrades}</TableCell>
                                  <TableCell className="text-right">${parseFloat(collection.totalVolumeUsd).toLocaleString()}</TableCell>
                                </TableRow>
                              ))
                            ) : (
                              <TableRow>
                                <TableCell colSpan={4} className="text-center text-muted-foreground py-4">
                                  No 24h collection data available
                                </TableCell>
                              </TableRow>
                            )}
                          </TableBody>
                        </Table>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div className="flex flex-col gap-4">
                  <Card>
                    <CardHeader className="p-4">
                      <CardTitle className="text-lg flex items-center">
                        <TrendingUp className="w-5 h-5 mr-2 text-green-500" />
                        Top Collections by Floor Price
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="px-4 pb-4 pt-0">
                      <div className="space-y-3">
                        {isLoading ? (
                          Array(5).fill(0).map((_, index) => (
                            <div key={index} className="flex items-center gap-3 animate-pulse">
                              <div className="w-10 h-10 rounded-md bg-muted"></div>
                              <div className="flex-1">
                                <div className="h-4 w-24 bg-muted rounded mb-1"></div>
                                <div className="h-3 w-16 bg-muted rounded"></div>
                              </div>
                              <div className="h-5 w-12 bg-muted rounded"></div>
                            </div>
                          ))
                        ) : trendingCollections.length > 0 ? (
                          trendingCollections
                            .sort((a, b) => parseFloat(b.floorPrice as string) - parseFloat(a.floorPrice as string))
                            .slice(0, 5)
                            .map((collection, index) => (
                              <div key={index} className="flex items-center gap-3 p-2 rounded-md hover:bg-accent/5 transition-colors cursor-pointer" onClick={navigateToNFTExplorer}>
                                <div className="w-10 h-10 rounded-md overflow-hidden bg-muted flex-shrink-0">
                                  <img
                                    src={collection.thumbnail_url || `/kas.png`}
                                    alt={collection.tick}
                                    className="w-full h-full object-cover"
                                    onError={(e) => { e.currentTarget.src = `/kas.png` }}
                                  />
                                </div>
                                <div className="flex-1">
                                  <div className="font-bold">{collection.tick}</div>
                                  <div className="text-xs text-muted-foreground">
                                    Volume: {((collection.volume24h as number) / 1000).toFixed(1)}K KAS
                                  </div>
                                </div>
                                <div className={parseFloat(collection.change24h as string) >= 0 ? 'text-green-500 text-sm font-medium' : 'text-red-500 text-sm font-medium'}>
                                  {collection.floorPrice} KAS
                                </div>
                              </div>
                            ))
                        ) : (
                          <div className="p-4 text-center text-muted-foreground">
                            No collection data available
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="flex-1">
                    <CardHeader className="p-4">
                      <CardTitle className="text-lg flex items-center">
                        <Wallet className="w-5 h-5 mr-2 text-purple-500" />
                        Your NFT Holdings
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="px-4 pb-4 pt-0">
                                                      {walletConnected ? (
                        nftHoldings.length > 0 ? (
                          <div className="grid grid-cols-3 gap-2">
                            {nftHoldings.slice(0, 6).map((nft, idx) => (
                              <div key={idx} className="relative rounded-md overflow-hidden border border-border/40 hover:shadow-md transition-all cursor-pointer hover:scale-105 duration-200">
                                <div className="aspect-square bg-black/5">
                                  <img
                                    src={nft.image || `/kas.png`}
                                    alt={nft.name}
                                    className="w-full h-full object-cover"
                                    onError={(e) => { e.currentTarget.src = `/kas.png` }}
                                  />
                                </div>
                                <div className="absolute inset-x-0 bottom-0 bg-black/60 backdrop-blur-sm p-1 text-white">
                                  <div className="text-xs font-medium truncate">{nft.collection}</div>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="p-6 text-center text-muted-foreground">
                            No NFTs in your wallet
                          </div>
                        )
                      ) : (
                        <div className="flex flex-col items-center justify-center p-6 text-center">
                          <Wallet className="w-10 h-10 text-muted-foreground mb-2" />
                          <p className="text-sm mb-3">Connect your wallet to see your NFTs</p>
                          <Button onClick={connectWallet} size="sm">
                            Connect Wallet
                          </Button>
                        </div>
                      )}

                      {walletConnected && nftHoldings.length > 0 && (
                        <div className="mt-4">
                          <div className="bg-purple-500/10 rounded-md p-3 border border-purple-500/20">
                            <div className="flex justify-between items-center">
                              <span className="text-xs text-muted-foreground">Total Value</span>
                              <span className="text-sm font-bold">{nftHoldings.reduce((total, nft) => total + nft.value, 0).toFixed(2)} KAS</span>
                            </div>
                            <div className="flex justify-between items-center mt-1">
                              <span className="text-xs text-muted-foreground">Collections</span>
                              <span className="text-sm font-bold">{new Set(nftHoldings.map(nft => nft.collection)).size}</span>
                            </div>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </main>

      {error && (
        <div className="fixed bottom-4 right-4 bg-destructive/90 text-destructive-foreground p-4 rounded-lg shadow-lg max-w-md z-50">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 flex-shrink-0" />
            <p>{error}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;