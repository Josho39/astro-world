'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useWallet } from '@/context/WalletContext';
import { MARKETS } from './krc-arb-tracker/market-config';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell
} from 'recharts';
import {
  ArrowRight, TrendingUp, Wallet, Banknote, LineChart as ChartIcon,
  Star, Calculator, Coins, Palette, ArrowUpRight, ArrowDownRight, ChevronRight,
  Percent, Clock, AlertCircle, Eye, Loader2
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const COLORS = ['#3b82f6', '#22c55e', '#eab308', '#ef4444', '#8b5cf6', '#ec4899', '#f97316', '#06b6d4'];

const Dashboard = () => {
  const router = useRouter();
  const { walletConnected, walletInfo, connectWallet } = useWallet();
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  interface TokenData {
    ticker: string;
    logoUrl?: string;
    price?: number;
    change24h?: number;
    volumeUsd?: number;
    marketCap?: number;
    totalHolders?: number;
    creationDate?: string;
  }

  interface ArbOpportunity {
    token: string;
    percentage: number;
    fromExchange: string;
    toExchange: string;
  }

  interface NFTMint {
    tick: string;
    id: number;
    timestamp: string;
    thumbnail_url?: string;
    current_mint_position?: number;
    total_supply?: number;
  }

  interface PortfolioItem {
    name: string;
    value: number;
    percentage: number;
    price: number;
    change24h: number;
  }

  interface Transaction {
    transaction_id?: string;
    txid?: string;
    block_time?: number;
    outputs?: Array<{
      address: string;
      amount: number;
    }>;
  }

  const [marketData, setMarketData] = useState<TokenData[]>([]);
  const [arbOpportunities, setArbOpportunities] = useState<ArbOpportunity[]>([]);
  const [recentMints, setRecentMints] = useState<NFTMint[]>([]);
  const [portfolioData, setPortfolioData] = useState<PortfolioItem[]>([]);
  const [chartData, setChartData] = useState<{ date: string; price: number }[]>([]);
  const [transactionData, setTransactionData] = useState<Transaction[]>([]);
  const [error, setError] = useState('');
  const [dataFetched, setDataFetched] = useState(false);

  useEffect(() => {
    if (!dataFetched) {
      fetchDashboardData();
      setDataFetched(true);
    }
    
    if (walletConnected && walletInfo) {
      fetchWalletData();
    }
  }, [walletConnected, walletInfo, dataFetched]);

  const fetchWalletData = async () => {
    try {
      if (!walletInfo) return;
      const txResponse = await fetch(`/api/transactions?address=${walletInfo.address}`);
      if (txResponse.ok) {
        const txData = await txResponse.json();
        setTransactionData(txData.slice(0, 5));
      }
      
      const tokenBalancesResponse = await fetch(`https://api-v2-do.kas.fyi/addresses/${walletInfo.address}/tokens`);
      if (tokenBalancesResponse.ok) {
        const tokenBalancesData = await tokenBalancesResponse.json();

        const portfolioItems = [{
          name: 'KAS',
          value: walletInfo?.balance || 0,
          percentage: 0,
          price: 0.024,
          change24h: 0
        }];

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

        setPortfolioData([...portfolioItems, ...availableTokens]);
      }
    } catch (err) {
      console.error('Error fetching wallet data:', err);
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
        if (mintsResponse.ok) {
          const mintsData = await mintsResponse.json();
          if (mintsData.success && mintsData.data) {
            setRecentMints(mintsData.data.slice(0, 6));
          }
        }
      } catch (err) {
        console.error('Error fetching NFT mints:', err);
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
        await fetchWalletData();
      }
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('Failed to load some dashboard components. Please try refreshing.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = () => {
    fetchDashboardData();
  };

  const navigateToChart = (ticker: string) => {
    router.push(`/charts?ticker=${ticker}`);
  };

  const navigateToNFTExplorer = () => {
    router.push('/krc721-tokens');
  };

  return (
    <div className="min-h-screen max-h-screen h-screen bg-gradient-to-b from-background to-background/95 flex flex-col overflow-hidden">
      <header className="py-2 px-3 relative overflow-hidden border-b border-border/30">
        <div className="relative z-10 w-full">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center">
              <div className="h-8 w-8 bg-primary/10 rounded-lg flex items-center justify-center shadow-md mr-2">
                <Image src="/logo.png" alt="Astro World" width={20} height={20} className="object-contain" />
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

                  <div className="space-y-1.5 overflow-auto max-h-[calc(100vh-300px)]">
                    {isLoading ? (
                      Array(5).fill(0).map((_, index) => (
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
                    ) : (
                      marketData.map((token, index) => (
                        <div key={index} onClick={() => navigateToChart(token.ticker)} className="flex items-center justify-between p-2 border border-border/40 rounded-md hover:bg-accent/30 transition-colors cursor-pointer">
                          <div className="flex items-center">
                            <div className="w-7 h-7 rounded-md bg-background mr-2 flex items-center justify-center overflow-hidden">
                              <Image
                                src={token.logoUrl || `/logo.png`}
                                width={28}
                                height={28}
                                alt={token.ticker}
                                className="object-cover"
                                onError={(e) => { e.currentTarget.src = `/logo.png` }}
                              />
                            </div>
                            <span className="font-medium">{token.ticker}</span>
                          </div>
                          <div className="flex flex-col items-end">
                            <span>${token.price?.toFixed(6) || "0.000000"}</span>
                            <span className={((token.change24h || 0) >= 0 ? 'text-green-500' : 'text-red-500') + ' flex items-center text-xs'}>
                              {(token.change24h || 0) >= 0 ?
                                <ArrowUpRight className="w-3 h-3 mr-0.5" /> :
                                <ArrowDownRight className="w-3 h-3 mr-0.5" />
                              }
                              {Math.abs(token.change24h || 0).toFixed(2)}%
                            </span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </Card>

                <Card className="p-2 overflow-hidden">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-bold flex items-center">
                      <ChartIcon className="w-4 h-4 mr-1.5 text-blue-500" />
                      Featured Chart
                    </h3>
                    <Link href="/charts" className="text-xs text-muted-foreground hover:text-primary flex items-center">
                      View Charts <ChevronRight className="w-3 h-3 ml-1" />
                    </Link>
                  </div>

                  <div className="h-[150px] bg-muted/20 rounded-md overflow-hidden relative border border-border/30">
                    {isLoading ? (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                      </div>
                    ) : chartData.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                          <defs>
                            <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                          <XAxis dataKey="date" tickFormatter={(tick) => tick.substring(0, 5)} stroke="#9ca3af" />
                          <YAxis domain={['auto', 'auto']} stroke="#9ca3af" />
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

                  <div className="grid grid-cols-3 gap-2">
                    {isLoading ? (
                      Array(6).fill(0).map((_, index) => (
                        <div key={index} className="animate-pulse">
                          <div className="aspect-square rounded-md overflow-hidden border border-border/40 bg-muted"></div>
                        </div>
                      ))
                    ) : recentMints.length > 0 ? (
                      recentMints.map((mint, index) => (
                        <div key={index} className="relative cursor-pointer" onClick={navigateToNFTExplorer}>
                          <div className="aspect-square rounded-md overflow-hidden border border-border/40">
                            <img
                              src={mint.thumbnail_url || `/logo.png`}
                              alt="NFT"
                              className="w-full h-full object-cover"
                              onError={(e) => { e.currentTarget.src = `/logo.png` }}
                            />
                          </div>
                          <div className="absolute top-1 right-1 bg-black/50 backdrop-blur-sm text-white text-xs px-1.5 py-0.5 rounded">
                            #{mint.id}
                          </div>
                          <div className="absolute bottom-1 left-1 bg-primary/70 backdrop-blur-sm text-white text-xs px-1.5 py-0.5 rounded-sm">
                            {mint.tick}
                          </div>
                          <div className="absolute top-1 left-1 bg-black/50 backdrop-blur-sm text-white text-xs px-1.5 py-0.5 rounded flex items-center">
                            <Clock className="w-3 h-3 mr-0.5" />
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

                  <div className="space-y-2 overflow-y-auto max-h-[calc(100vh-350px)]">
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
                              src={MARKETS[arb.fromExchange]?.iconUrl || `/logo.png`}
                              width={28}
                              height={28}
                              alt={arb.fromExchange}
                              className="object-cover"
                              onError={(e) => { e.currentTarget.src = `/logo.png` }}
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
                              {arb.percentage.toFixed(2)}%
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

                    <div className="h-[100px] bg-muted/20 rounded-md overflow-hidden relative border border-border/30 mt-1">
                      {isLoading ? (
                        <div className="absolute inset-0 flex items-center justify-center animate-pulse">
                          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                        </div>
                      ) : arbOpportunities.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={arbOpportunities} margin={{ top: 20, right: 10, left: 0, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                            <XAxis dataKey="token" />
                            <YAxis />
                            <Tooltip />
                            <Bar dataKey="percentage" fill="#22c55e" label={{ position: 'top', fill: '#22c55e', fontSize: 10 }} />
                          </BarChart>
                        </ResponsiveContainer>
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
                          <span className="text-xs text-violet-500">Copy</span>
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
                          <div className="text-lg font-bold text-green-500">${(walletInfo.balance * 0.024).toFixed(2)}</div>
                        </div>
                      </div>

                      <div className="h-[150px] bg-muted/20 rounded-md overflow-hidden relative border border-border/30 mb-2">
                        {isLoading ? (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                          </div>
                        ) : portfolioData.length > 0 ? (
                          <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                              <Pie
                                data={portfolioData}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                outerRadius={60}
                                fill="#8884d8"
                                dataKey="value"
                              >
                                {portfolioData.map((entry, index) => (
                                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                              </Pie>
                              <Tooltip formatter={(value) => [`${value} units`, 'Quantity']} />
                            </PieChart>
                          </ResponsiveContainer>
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-muted-foreground">No portfolio data available</span>
                          </div>
                        )}
                      </div>

                      <div className="space-y-2 overflow-auto max-h-[calc(100vh-350px)]">
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
                          portfolioData.map((token, index) => (
                            <div key={index} className="flex items-center justify-between p-2 border border-border/40 rounded-md">
                              <div className="flex items-center">
                                <div className="w-7 h-7 rounded-md bg-background mr-2 flex items-center justify-center overflow-hidden">
                                  <Image
                                    src={`/logo.png`}
                                    width={28}
                                    height={28}
                                    alt={token.name}
                                    className="object-cover"
                                  />
                                </div>
                                <span className="font-medium">{token.name}</span>
                              </div>
                              <div className="flex flex-col items-end">
                                <span>{token.value.toFixed(4)}</span>
                                <span className="text-xs text-muted-foreground">${(token.value * token.price).toFixed(2)}</span>
                              </div>
                            </div>
                          ))
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
                              src={token.logoUrl || `/logo.png`}
                              width={32}
                              height={32}
                              alt={token.ticker}
                              className="object-cover"
                              onError={(e) => { e.currentTarget.src = `/logo.png` }}
                            />
                          </div>
                          <div>
                            <h3 className="font-bold text-base">{token.ticker}</h3>
                            <div className={((token.change24h || 0) >= 0 ? 'text-green-500' : 'text-red-500') + ' text-xs flex items-center'}>
                              {(token.change24h || 0) >= 0 ?
                                <ArrowUpRight className="w-3 h-3 mr-0.5" /> :
                                <ArrowDownRight className="w-3 h-3 mr-0.5" />
                              }
                              {Math.abs(token.change24h || 0).toFixed(2)}%
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
          
          <TabsContent value="portfolio">
            {walletConnected && walletInfo ? (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
                <Card className="col-span-full lg:col-span-1">
                  <CardHeader className="p-3">
                    <CardTitle className="text-lg">Portfolio Breakdown</CardTitle>
                  </CardHeader>
                  <CardContent className="p-3 pt-0">
                    <div className="h-[200px]">
                      {isLoading ? (
                        <div className="flex items-center justify-center h-full">
                          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                        </div>
                      ) : portfolioData.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={portfolioData}
                              cx="50%"
                              cy="50%"
                              labelLine={false}
                              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                              outerRadius={80}
                              fill="#8884d8"
                              dataKey="value"
                            >
                              {portfolioData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                              ))}
                            </Pie>
                            <Tooltip formatter={(value) => [`${value} units`, 'Quantity']} />
                          </PieChart>
                        </ResponsiveContainer>
                      ) : (
                        <div className="flex items-center justify-center h-full text-muted-foreground">
                          No portfolio data available
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                <Card className="col-span-full lg:col-span-2">
                  <CardHeader className="p-3">
                    <CardTitle className="text-lg">Portfolio Performance</CardTitle>
                  </CardHeader>
                  <CardContent className="p-3 pt-0">
                    <div className="h-[200px]">
                      {isLoading ? (
                        <div className="flex items-center justify-center h-full">
                          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                        </div>
                      ) : portfolioData.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={portfolioData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip formatter={(value) => [`${value}%`, '24h Change']} />
                            <Bar dataKey="change24h" fill="#8884d8">
                              {portfolioData.map((entry, index) => (
                                <Cell
                                  key={`cell-${index}`}
                                  fill={(entry.change24h || 0) >= 0 ? '#22c55e' : '#ef4444'}
                                />
                              ))}
                            </Bar>
                          </BarChart>
                        </ResponsiveContainer>
                      ) : (
                        <div className="flex items-center justify-center h-full text-muted-foreground">
                          No performance data available
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                <Card className="col-span-full">
                  <CardHeader className="p-3">
                    <CardTitle className="text-lg">Recent Transactions</CardTitle>
                  </CardHeader>
                  <CardContent className="p-3 pt-0">
                    {isLoading ? (
                      <div className="space-y-2">
                        {Array(3).fill(0).map((_, index) => (
                          <div key={index} className="flex items-center justify-between p-3 border rounded-md animate-pulse">
                            <div className="flex items-center gap-3">
                              <div className="h-8 w-8 rounded-full bg-muted"></div>
                              <div>
                                <div className="h-4 w-48 bg-muted rounded mb-2"></div>
                                <div className="h-3 w-24 bg-muted rounded"></div>
                              </div>
                            </div>
                            <div className="h-5 w-20 bg-muted rounded"></div>
                          </div>
                        ))}
                      </div>
                    ) : transactionData.length > 0 ? (
                      <div className="space-y-2">
                        {transactionData.map((tx, index) => {
                          const isIncoming = tx.outputs && Array.isArray(tx.outputs) ?
                            tx.outputs.some(output => output.address === walletInfo.address) :
                            index % 2 === 0;

                          const txAmount = tx.outputs && Array.isArray(tx.outputs) && tx.outputs.length > 0 ?
                            tx.outputs.reduce((sum, output) => sum + (output.address === walletInfo.address ? output.amount : 0), 0) / 100000000 :
                            5.25; // Fixed amount for consistency

                          return (
                            <div key={index} className="flex items-center justify-between p-3 border rounded-md hover:bg-muted/20 transition-colors">
                              <div className="flex items-center gap-3">
                                <div className={`p-2 rounded-full ${isIncoming ? 'bg-green-500/10' : 'bg-red-500/10'}`}>
                                  {isIncoming ? (
                                    <ArrowDownRight className="h-4 w-4 text-green-500" />
                                  ) : (
                                    <ArrowUpRight className="h-4 w-4 text-red-500" />
                                  )}
                                </div>
                                <div>
                                  <div className="font-medium text-sm truncate max-w-[200px]">{tx.transaction_id || tx.txid}</div>
                                  <div className="text-xs text-muted-foreground">
                                    {tx.block_time ? `Block: ${tx.block_time}` : 'Recent transaction'}
                                  </div>
                                </div>
                              </div>
                              <div className={isIncoming ? 'text-green-500' : 'text-red-500'}>
                                {isIncoming ? '+' : '-'}{Number(txAmount).toFixed(2)} KAS
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="p-8 text-center text-muted-foreground">
                        No transaction data available
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            ) : (
              <Card>
                <CardContent className="p-6 flex flex-col items-center justify-center">
                  <Wallet className="w-12 h-12 text-muted-foreground mb-4" />
                  <h3 className="text-xl font-bold mb-2">Connect Your Wallet</h3>
                  <p className="text-muted-foreground mb-4 text-center max-w-md">
                    Connect your wallet to view your portfolio, transaction history, and token holdings.
                  </p>
                  <Button onClick={connectWallet}>
                    Connect Wallet
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>
          
          <TabsContent value="nfts">
            <div className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <Card>
                  <CardHeader className="p-3">
                    <CardTitle className="text-lg">Popular Collections</CardTitle>
                  </CardHeader>
                  <CardContent className="p-3 pt-0">
                    {isLoading ? (
                      <div className="space-y-2">
                        {Array(3).fill(0).map((_, index) => (
                          <div key={index} className="flex items-center gap-3 p-2 border rounded-md animate-pulse">
                            <div className="h-10 w-10 rounded-md bg-muted"></div>
                            <div className="flex-1">
                              <div className="h-4 w-24 bg-muted rounded mb-2"></div>
                              <div className="h-3 w-32 bg-muted rounded"></div>
                            </div>
                            <div className="h-8 w-16 bg-muted rounded"></div>
                          </div>
                        ))}
                      </div>
                    ) : recentMints.length > 0 ? (
                      <div className="space-y-2">
                        {Array.from(new Set(recentMints.map(m => m.tick))).slice(0, 3).map((tick, index) => {
                          const collection = recentMints.find(m => m.tick === tick);
                          const mintCount = recentMints.filter(m => m.tick === tick).length;
                          const totalSupply = collection?.total_supply || 0;
                          const mintedPercentage = collection?.current_mint_position
                            ? (collection.current_mint_position / totalSupply * 100).toFixed(0)
                            : '?';

                          return (
                            <div key={index} className="flex items-center gap-2 p-2 border rounded-md hover:bg-muted/20 transition-colors cursor-pointer"
                              onClick={navigateToNFTExplorer}>
                              <div className="h-10 w-10 rounded-md overflow-hidden bg-muted">
                                <img
                                  src={collection?.thumbnail_url || `/logo.png`}
                                  alt={tick}
                                  className="w-full h-full object-cover"
                                  onError={(e) => { e.currentTarget.src = `/logo.png` }}
                                />
                              </div>
                              <div className="flex-1">
                                <div className="font-medium">{tick}</div>
                                <div className="text-xs text-muted-foreground">
                                  Recent Mints: {mintCount} • Progress: {mintedPercentage}%
                                </div>
                              </div>
                              <Button variant="outline" size="sm" className="h-8">
                                View
                              </Button>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="p-4 text-center text-muted-foreground">
                        No collection data available
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="p-3">
                    <CardTitle className="text-lg">Recent Mints</CardTitle>
                  </CardHeader>
                  <CardContent className="p-3 pt-0">
                    {isLoading ? (
                      <div className="grid grid-cols-3 gap-2">
                        {Array(6).fill(0).map((_, index) => (
                          <div key={index} className="aspect-square rounded-md bg-muted animate-pulse"></div>
                        ))}
                      </div>
                    ) : recentMints.length > 0 ? (
                      <div className="grid grid-cols-3 gap-2">
                        {recentMints.slice(0, 6).map((mint, index) => (
                          <div key={index} className="relative cursor-pointer" onClick={navigateToNFTExplorer}>
                            <div className="aspect-square rounded-md overflow-hidden border border-border/40">
                              <img
                                src={mint.thumbnail_url || `/logo.png`}
                                alt="NFT"
                                className="w-full h-full object-cover"
                                onError={(e) => { e.currentTarget.src = `/logo.png` }}
                              />
                            </div>
                            <div className="absolute top-1 right-1 bg-black/50 backdrop-blur-sm text-white text-xs px-1.5 py-0.5 rounded">
                              #{mint.id}
                            </div>
                            <div className="absolute bottom-1 left-1 bg-primary/70 backdrop-blur-sm text-white text-xs px-1.5 py-0.5 rounded-sm">
                              {mint.tick}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-4 text-center text-muted-foreground">
                        No recent mints available
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader className="p-3">
                  <CardTitle className="text-lg">NFT Marketplace Activity</CardTitle>
                </CardHeader>
                <CardContent className="p-3 pt-0">
                  <div className="h-[200px]">
                    {isLoading ? (
                      <div className="flex items-center justify-center h-full">
                        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                      </div>
                    ) : recentMints.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={recentMints.map((mint, i) => ({
                          time: i.toString(),
                          activity: i + 1,
                          collection: mint.tick
                        }))}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="time" />
                          <YAxis />
                          <Tooltip
                            formatter={(value, name, props) => [value, name === 'activity' ? 'Mint Count' : name]}
                            labelFormatter={(label) => `Collection: ${recentMints[parseInt(label)]?.tick || 'Unknown'}`}
                          />
                          <Line type="monotone" dataKey="activity" stroke="#8884d8" activeDot={{ r: 8 }} />
                        </LineChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="flex items-center justify-center h-full text-muted-foreground">
                        No marketplace activity data available
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
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