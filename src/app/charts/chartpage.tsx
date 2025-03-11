'use client';

import React, { useState, useEffect } from 'react';
import TradingViewChart from './TradingViewChart';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { DollarSign, Coins, Search, BarChart4, LineChart, CandlestickChart, History, Clock, ArrowRight, Sparkles, TrendingUp, TrendingDown, RefreshCw, Loader2, AlertCircle, Users, Link2, Activity, Globe } from 'lucide-react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTwitter, faDiscord, faTelegram } from '@fortawesome/free-brands-svg-icons';
import { useSearchParams } from 'next/navigation';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import Image from 'next/image';
import { Skeleton } from '@/components/ui/skeleton';
import { faGlobe } from '@fortawesome/free-solid-svg-icons';

interface TokenData {
  transferTotal: number;
  decimal: number;
  status: string;
  mintTotal: number;
  deployerAddress: string;
  ticker: string;
  totalSupply?: number;
  maxSupply?: number;
  totalMinted?: number;
  totalHolders?: number;
  holderTotal?: number;
  marketCap?: number;
  volumeUsd?: number;
  price?: any;
  rank?: number;
  iconUrl?: string;
  creationDate?: number;
  deployedAt?: number;
  marketsData?: any[];
  holders?: any[];
  socialLinks?: { type: string, url: string }[];
}

const ChartPage = () => {
  const searchParams = useSearchParams();
  const tickerParam = searchParams.get('ticker');
  const [ticker, setTicker] = useState<string>(tickerParam || 'BURT');
  const [timeRange, setTimeRange] = useState<'1d' | '7d' | '1m' | '1y'>('1d');
  const [priceType, setPriceType] = useState<'usd' | 'kas'>('usd');
  const [inputTicker, setInputTicker] = useState<string>(tickerParam || 'BURT');
  const [key, setKey] = useState<number>(0);
  const [chartType, setChartType] = useState<'candle' | 'line'>('candle');
  const [isLoading, setIsLoading] = useState(true);
  const [tokenData, setTokenData] = useState<TokenData | null>(null);
  const [chartData, setChartData] = useState<any | null>(null);
  const [isSaved, setIsSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'markets' | 'holders'>('markets');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedFavorites = localStorage.getItem('chartFavorites');
      if (savedFavorites) {
        const favorites = JSON.parse(savedFavorites);
        setIsSaved(favorites.includes(ticker));
      }
    }
  }, [ticker]);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        try {
          const directResponse = await fetch(`https://api-v2-do.kas.fyi/token/krc20/${ticker}/info`);
          if (directResponse.ok) {
            const directData = await directResponse.json();
            setTokenData(directData);
          } else {
            const tokensResponse = await fetch('/api/krc20-tokens');
            if (!tokensResponse.ok) {
              throw new Error('Failed to fetch token data');
            }

            const tokensData = await tokensResponse.json();
            const currentToken = tokensData.find((t: TokenData) =>
              t.ticker?.toLowerCase() === ticker.toLowerCase()
            );

            if (currentToken) {
              setTokenData(currentToken);
            } else {
              const specificTokenResponse = await fetch(`/api/krc20-tokens/${ticker}`);
              if (specificTokenResponse.ok) {
                const specificToken = await specificTokenResponse.json();
                setTokenData(specificToken);
              } else {
                setTokenData(null);
              }
            }
          }
        } catch (err) {
          console.error(`Error fetching from direct API:`, err);
          const tokensResponse = await fetch('/api/krc20-tokens');
          if (!tokensResponse.ok) {
            throw new Error('Failed to fetch token data');
          }

          const tokensData = await tokensResponse.json();
          const currentToken = tokensData.find((t: TokenData) =>
            t.ticker?.toLowerCase() === ticker.toLowerCase()
          );

          if (currentToken) {
            setTokenData(currentToken);
          } else {
            const specificTokenResponse = await fetch(`/api/krc20-tokens/${ticker}`);
            if (specificTokenResponse.ok) {
              const specificToken = await specificTokenResponse.json();
              setTokenData(specificToken);
            } else {
              setTokenData(null);
            }
          }
        }
        const chartResponse = await fetch(`/api/chart-data?ticker=${ticker}&timeRange=${timeRange}`);
        if (!chartResponse.ok) {
          throw new Error('Failed to fetch chart data');
        }

        const chartData = await chartResponse.json();
        setChartData(chartData);

        try {
          const holdersResponse = await fetch(`https://api.kasplex.org/v1/krc20/token/${ticker}`);
          if (holdersResponse.ok) {
            const holdersData = await holdersResponse.json();
            if (holdersData.result && holdersData.result[0] && holdersData.result[0].holder) {
              setTokenData(prevData => {
                if (!prevData) return prevData;

                return {
                  ...prevData,
                  holders: holdersData.result[0].holder.map((holder: any) => ({
                    address: holder.address,
                    amount: parseInt(holder.amount),
                    tags: []
                  }))
                };
              });
            }
          }
        } catch (err) {
          console.error(`Error fetching holder data for ${ticker}:`, err);
        }

      } catch (err) {
        console.error('Error fetching data:', err);
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [ticker, timeRange]);

  useEffect(() => {
    if (tickerParam) {
      setTicker(tickerParam);
      setInputTicker(tickerParam);
      setKey(prev => prev + 1);
    }
  }, [tickerParam]);

  const handleSearch = () => {
    if (inputTicker.trim()) {
      setTicker(inputTicker.trim().toUpperCase());
      setKey(prev => prev + 1);
    }
  };

  const handleTimeRangeChange = (value: string) => {
    setTimeRange(value as '1d' | '7d' | '1m' | '1y');
    setKey(prev => prev + 1);
  };

  const handlePriceTypeChange = (type: 'usd' | 'kas') => {
    setPriceType(type);
    setKey(prev => prev + 1);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const getTotalVolume = () => {
    if (!tokenData?.marketsData || tokenData.marketsData.length === 0) {
      return tokenData?.price?.tradeVolume?.amountInUsd || tokenData?.volumeUsd || 0;
    }

    const totalVolume = tokenData.marketsData.reduce((sum, market) => {
      return sum + (market.marketData?.volumeInUsd || 0);
    }, 0);

    return totalVolume || tokenData?.price?.tradeVolume?.amountInUsd || tokenData?.volumeUsd || 0;
  };

  const formatNumber = (num: number | undefined) => {
    if (typeof num !== 'number') return "0";
    if (num >= 1e9) return (num / 1e9).toFixed(1) + 'B';
    if (num >= 1e6) return (num / 1e6).toFixed(1) + 'M';
    if (num >= 1e3) return (num / 1e3).toFixed(1) + 'K';
    return num.toFixed(0);
  };

  const formatCurrency = (num: number | undefined, decimals: number = 8) => {
    if (typeof num !== 'number') return "0.00";
    return num.toFixed(decimals);
  };

  const formatTokenAmount = (amount: number | undefined, decimals: number = 8) => {
    if (typeof amount !== 'number') return "0";
    const actualAmount = amount / Math.pow(10, decimals);
    return formatNumber(actualAmount);
  };


  const getTimeLabel = () => {
    switch (timeRange) {
      case '1d': return '24 hours';
      case '7d': return '7 days';
      case '1m': return '1 month';
      case '1y': return '1 year';
      default: return '24 hours';
    }
  };

  const getPriceHighLow = () => {
    if (!chartData || !chartData.candles || chartData.candles.length === 0) {
      return { high: 0, low: 0 };
    }

    const highs = chartData.candles.map((c: any) =>
      priceType === 'kas' && c.high_kas
        ? parseFloat(c.high_kas)
        : parseFloat(c.high)
    );

    const lows = chartData.candles.map((c: any) =>
      priceType === 'kas' && c.low_kas
        ? parseFloat(c.low_kas)
        : parseFloat(c.low)
    );

    return {
      high: Math.max(...highs),
      low: Math.min(...lows)
    };
  };

  const { high, low } = getPriceHighLow();

  const getTokenPrice = () => {
    if (!tokenData || !tokenData.price) return 0;
    return priceType === 'usd'
      ? tokenData.price.priceInUsd || 0
      : tokenData.price.floorPrice || 0;
  };

  const getSocialIcon = (type: string) => {
    switch (type) {
      case 'twitter': return <FontAwesomeIcon icon={faTwitter} className="w-3.5 h-3.5" />;
      case 'discord': return <FontAwesomeIcon icon={faDiscord} className="w-3.5 h-3.5" />;
      case 'telegram': return <FontAwesomeIcon icon={faTelegram} className="w-3.5 h-3.5" />;
      case 'website': return <FontAwesomeIcon icon={faGlobe} className="w-3.5 h-3.5" />;
      default: return <Link2 className="w-3.5 h-3.5" />;
    }
  };

  return (
    <div className="w-full h-full min-h-screen p-2 sm:p-4 bg-background overflow-y-auto">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2">
          <div>
            <h1 className="text-2xl font-bold flex items-center">
              <CandlestickChart className="mr-2 h-6 w-6 text-primary" />
              Charts
            </h1>
            <p className="text-muted-foreground">Analyze token price movements and trends</p>
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Enter Token Ticker"
                value={inputTicker}
                onChange={(e) => setInputTicker(e.target.value)}
                onKeyDown={handleKeyDown}
                className="pl-9 pr-12"
              />
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 bottom-0 px-2"
                      onClick={handleSearch}
                    >
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    Search Token
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>

            <div className="flex gap-1">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant={priceType === 'usd' ? "default" : "outline"}
                      onClick={() => handlePriceTypeChange('usd')}
                      className="flex items-center gap-1"
                      size="sm"
                    >
                      <DollarSign className="h-4 w-4" />
                      USD
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    Show prices in USD
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant={priceType === 'kas' ? "default" : "outline"}
                      onClick={() => handlePriceTypeChange('kas')}
                      className="flex items-center gap-1"
                      size="sm"
                    >
                      <Coins className="h-4 w-4" />
                      KAS
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    Show prices in KAS
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>
        </div>

        <Card className="bg-gradient-to-r from-background via-primary/5 to-background border-primary/10">
          <CardContent className="p-3">
            {isLoading ? (
              <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
                <div className="flex items-center gap-3">
                  <Skeleton className="w-10 h-10 rounded-full" />
                  <div>
                    <Skeleton className="h-8 w-32 mb-1" />
                    <Skeleton className="h-6 w-48" />
                  </div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full md:w-auto md:ml-auto">
                  <Skeleton className="h-10 w-24" />
                  <Skeleton className="h-10 w-24" />
                  <Skeleton className="h-10 w-24" />
                  <Skeleton className="h-10 w-24" />
                </div>
              </div>
            ) : (
              <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden">
                    {tokenData?.iconUrl ? (
                      <Image
                        src={tokenData.iconUrl}
                        width={40}
                        height={40}
                        alt={ticker}
                        className="object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = `/kas.png`;
                        }}
                      />
                    ) : (
                      <Image
                        src="/kas.png"
                        width={40}
                        height={40}
                        alt={ticker}
                        className="object-cover"
                      />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-xl font-bold">{ticker}</h2>
                      <Badge variant="outline" className="text-xs border-primary/20">
                        {priceType === 'usd' ? 'USD' : 'KAS'}
                      </Badge>
                      {tokenData?.socialLinks && tokenData.socialLinks.length > 0 && (
                        <div className="flex gap-1 ml-1">
                          {tokenData.socialLinks.map((link, index) => (
                            <TooltipProvider key={index}>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <a
                                    href={link.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="p-1.5 bg-primary/10 rounded-full text-primary hover:bg-primary/20 transition-colors"
                                  >
                                    {getSocialIcon(link.type)}
                                  </a>
                                </TooltipTrigger>
                                <TooltipContent>
                                  {link.type.charAt(0).toUpperCase() + link.type.slice(1)}
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="text-2xl font-bold">
                        {priceType === 'usd' ? '$' : ''}
                        {formatCurrency(getTokenPrice())}
                      </div>
                      {tokenData?.price?.change24h !== undefined && (
                        <div className={`flex items-center ${tokenData.price.change24h >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                          {tokenData.price.change24h >= 0 ? (
                            <TrendingUp className="h-4 w-4 mr-1" />
                          ) : (
                            <TrendingDown className="h-4 w-4 mr-1" />
                          )}
                          <span className="font-medium">
                            {tokenData.price.change24h >= 0 ? '+' : ''}
                            {tokenData.price.change24h.toFixed(2)}%
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 w-full md:w-auto md:ml-auto">
                  <div className="flex flex-col">
                    <span className="text-xs text-muted-foreground">24h Volume</span>
                    <span className="font-medium">
                      {priceType === 'usd' ? '$' : ''}
                      {formatNumber(getTotalVolume())}
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs text-muted-foreground">Market Cap</span>
                    <span className="font-medium">
                      {priceType === 'usd' ? '$' : ''}
                      {tokenData?.price?.marketCapInUsd
                        ? formatNumber(tokenData.price.marketCapInUsd)
                        : formatNumber(tokenData?.marketCap)}
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs text-muted-foreground">24h High</span>
                    <span className="font-medium text-green-500">
                      {priceType === 'usd' ? '$' : ''}
                      {formatCurrency(high)}
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs text-muted-foreground">24h Low</span>
                    <span className="font-medium text-red-500">
                      {priceType === 'usd' ? '$' : ''}
                      {formatCurrency(low)}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">

          <div className="lg:col-span-3">
            <Card className="border shadow-sm">
              <Tabs
                value={timeRange}
                onValueChange={handleTimeRangeChange}
                className="px-4 mt-2"
              >
                <TabsList className="grid grid-cols-4 w-full">
                  <TabsTrigger
                    value="1d"
                    className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                  >
                    <Clock className="h-3.5 w-3.5 mr-1.5" />
                    1D
                  </TabsTrigger>
                  <TabsTrigger
                    value="7d"
                    className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                  >
                    <Clock className="h-3.5 w-3.5 mr-1.5" />
                    1W
                  </TabsTrigger>
                  <TabsTrigger
                    value="1m"
                    className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                  >
                    <Clock className="h-3.5 w-3.5 mr-1.5" />
                    1M
                  </TabsTrigger>
                  <TabsTrigger
                    value="1y"
                    className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                  >
                    <Clock className="h-3.5 w-3.5 mr-1.5" />
                    1Y
                  </TabsTrigger>
                </TabsList>
              </Tabs>

              <CardContent className="p-0 mt-2">
                <div className="w-full h-[550px] rounded-lg overflow-hidden">
                  {error ? (
                    <div className="w-full h-full flex items-center justify-center">
                      <div className="text-center p-6 max-w-md">
                        <AlertCircle className="h-10 w-10 text-destructive mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-destructive mb-2">Chart Error</h3>
                        <p className="text-muted-foreground">{error}</p>
                        <Button className="mt-4" onClick={() => setKey(prev => prev + 1)}>
                          <RefreshCw className="mr-2 h-4 w-4" />
                          Try Again
                        </Button>
                      </div>
                    </div>
                  ) : isLoading ? (
                    <div className="w-full h-full flex items-center justify-center">
                      <div className="text-center">
                        <Loader2 className="h-10 w-10 text-primary mx-auto mb-4 animate-spin" />
                        <p className="text-muted-foreground">Loading chart data...</p>
                      </div>
                    </div>
                  ) : (
                    <TradingViewChart
                      key={key}
                      ticker={ticker}
                      timeRange={timeRange}
                      priceType={priceType}
                    />
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
          <div>
            <Card className="h-[610px]">
              <CardHeader className="p-2 pb-0">
                <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'markets' | 'holders')}>
                  <TabsList className="w-full h-8">
                    <TabsTrigger value="markets" className="flex items-center gap-1 text-xs">
                      <Activity className="h-4 w-4" />
                      Market Activity
                    </TabsTrigger>
                    <TabsTrigger value="holders" className="flex items-center gap-1 text-xs">
                      <Users className="h-4 w-4" />
                      Top Holders
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              </CardHeader>
              <CardContent className="p-2 h-[600px] overflow-hidden">
                {activeTab === 'markets' ? (
                  <div className="h-full">
                    <h3 className="text-lg font-medium mb-0">Exchange Prices</h3>
                    {isLoading ? (
                      <div className="space-y-2">
                        {Array(5).fill(0).map((_, i) => (
                          <div key={i} className="flex justify-between p-1 border rounded-md">
                            <div className="flex items-center gap-1">
                              <Skeleton className="w-8 h-8 rounded-full" />
                              <Skeleton className="h-5 w-24" />
                            </div>
                            <Skeleton className="h-5 w-24" />
                          </div>
                        ))}
                      </div>
                    ) : tokenData?.marketsData && tokenData.marketsData.length > 0 ? (
                      <ScrollArea className="h-[515px] pr-4">
                        <div className="space-y-1">
                          {tokenData.marketsData
                            .filter((market: any) => market.marketData.priceInUsd > 0 || market.marketData.volumeInUsd > 0)
                            .sort((a: any, b: any) => b.marketData.volumeInUsd - a.marketData.volumeInUsd)
                            .map((market: any, idx: number) => (
                              <div key={idx} className="flex justify-between p-3 border rounded-md hover:bg-accent/30 transition-colors">
                                <div className="flex items-center gap-2">
                                  {market.metadata?.iconUrl ? (
                                    <div className="w-8 h-8 rounded-full overflow-hidden">
                                      <Image
                                        src={market.metadata.iconUrl}
                                        alt={market.name}
                                        width={32}
                                        height={32}
                                        className="object-cover"
                                        onError={(e) => {
                                          const target = e.target as HTMLImageElement;
                                          target.src = `/kas.png`;
                                        }}
                                      />
                                    </div>
                                  ) : (
                                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                                      <span className="text-xs font-medium">{market.name.substring(0, 2)}</span>
                                    </div>
                                  )}
                                  <div>
                                    <p className="font-medium">{market.name}</p>
                                    <p className="text-xs text-muted-foreground">
                                      Vol: ${formatNumber(market.marketData.volumeInUsd)}
                                    </p>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <p className="font-bold">${formatCurrency(market.marketData.priceInUsd, 6)}</p>
                                </div>
                              </div>
                            ))}
                        </div>
                      </ScrollArea>
                    ) : (
                      <div className="h-full flex items-center justify-center text-center text-muted-foreground">
                        <div>
                          <Activity className="h-12 w-12 mb-2 mx-auto opacity-20" />
                          <p>No market data available</p>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="h-full">
                    <div className="flex justify-between items-center mb-0">
                      <h3 className="text-lg font-medium">Top Holders</h3>
                      {tokenData?.holderTotal || tokenData?.totalHolders ? (
                        <Badge variant="outline" className="font-normal">
                          Total: {formatNumber(tokenData.holderTotal || tokenData.totalHolders)}
                        </Badge>
                      ) : null}
                    </div>
                    {isLoading ? (
                      <div className="space-y-2">
                        {Array(8).fill(0).map((_, i) => (
                          <div key={i} className="flex justify-between p-2 border rounded-md">
                            <Skeleton className="h-5 w-40" />
                            <Skeleton className="h-5 w-24" />
                          </div>
                        ))}
                      </div>
                    ) : tokenData?.holders && tokenData.holders.length > 0 ? (
                      <ScrollArea className="h-[515px] pr-4">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Address</TableHead>
                              <TableHead className="text-right">Holdings</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {tokenData.holders.map((holder: any, idx: number) => (
                              <TableRow key={idx}>
                                <TableCell>
                                  <div className="flex flex-col">
                                    <div className="text-xs font-mono truncate max-w-[200px]">
                                      {holder.address}
                                    </div>
                                    {holder.tags && holder.tags.length > 0 && holder.tags[0].name && (
                                      <Badge variant="outline" className="w-fit mt-0 border-primary/20">
                                        {holder.tags[0].name}
                                      </Badge>
                                    )}
                                  </div>
                                </TableCell>
                                <TableCell className="text-right font-medium">
                                  {formatNumber(holder.amount / Math.pow(10, tokenData.decimal || 8))}
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </ScrollArea>
                    ) : (
                      <div className="h-full flex items-center justify-center text-center text-muted-foreground">
                        <div>
                          <Users className="h-12 w-12 mb-1 mx-auto opacity-20" />
                          <p>No holder data available</p>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="col-span-1 lg:col-span-4">
            <Card>
              <CardHeader className="p-2 pb-0">
                <CardTitle className="text-base">Token Information</CardTitle>
              </CardHeader>
              <CardContent className="p-2 pt-0">
                {isLoading ? (
                  <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
                    {Array(10).fill(0).map((_, i) => (
                      <div key={i} className="space-y-2">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-5 w-32" />
                      </div>
                    ))}
                  </div>
                ) : tokenData ? (
                  <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-9 gap-1">
                    <div className="space-y-1">
                      <span className="text-sm text-muted-foreground">Total Supply</span>
                      <span className="font-medium block text-base">
                        {formatTokenAmount(tokenData.maxSupply || tokenData.totalSupply, tokenData.decimal || 8)}
                      </span>
                    </div>
                    <div className="space-y-1">
                      <span className="text-sm text-muted-foreground">Minted</span>
                      <span className="font-medium block text-base">
                        {formatTokenAmount(tokenData.totalMinted, tokenData.decimal || 8)}
                      </span>
                    </div>
                    <div className="space-y-1">
                      <span className="text-sm text-muted-foreground">Holders</span>
                      <span className="font-medium block text-base">
                        {formatNumber(tokenData.holderTotal || tokenData.totalHolders)}
                      </span>
                    </div>
                    <div className="space-y-1">
                      <span className="text-sm text-muted-foreground">Transfers</span>
                      <span className="font-medium block text-base">
                        {formatNumber(tokenData.transferTotal || 0)}
                      </span>
                    </div>
                    <div className="space-y-1">
                      <span className="text-sm text-muted-foreground">Deployed</span>
                      <span className="font-medium block text-base">
                        {new Date(tokenData.deployedAt || tokenData.creationDate || 0).toLocaleDateString()}
                      </span>
                    </div>
                    {tokenData.price?.burned > 0 && (
                      <div className="space-y-1">
                        <span className="text-sm text-muted-foreground">Burned</span>
                        <span className="font-medium block text-base">
                          {formatNumber(tokenData.price.burned)} KAS
                        </span>
                      </div>
                    )}
                    <div className="space-y-1">
                      <span className="text-sm text-muted-foreground">Decimal</span>
                      <span className="font-medium block text-base">
                        {tokenData.decimal || 8}
                      </span>
                    </div>
                    <div className="space-y-1">
                      <span className="text-sm text-muted-foreground">Status</span>
                      <span className="font-medium block text-base capitalize">
                        {tokenData.status || 'active'}
                      </span>
                    </div>
                    <div className="space-y-1">
                      <span className="text-sm text-muted-foreground">Mint Total</span>
                      <span className="font-medium block text-base">
                        {formatNumber(tokenData.mintTotal || 0)}
                      </span>
                    </div>
                    <div className="space-y-1">
                      <span className="text-sm text-muted-foreground">Deployer</span>
                      <span className="font-medium block text-xs font-mono truncate">
                        {tokenData.deployerAddress || 'Unknown'}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="text-center p-4 text-muted-foreground">
                    No token data available
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChartPage;