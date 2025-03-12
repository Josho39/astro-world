'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Loader2, ArrowDown, ArrowUp, ArrowUpDown, Star, Search, RefreshCw, TrendingUp, TrendingDown, DollarSign, Users, Clock } from 'lucide-react';
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Image from 'next/image';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { useRouter } from 'next/navigation';
import { Label } from "@/components/ui/label";

interface TokenData {
  _id: string;
  ticker: string;
  totalSupply: number;
  totalMinted: number;
  totalHolders: number;
  marketCap: number;
  volumeUsd: number;
  price: number;
  rank: number;
  logoUrl: string | null;
  creationDate: number;
  change24h?: number;
  changePrice?: number;
  changeMarketCap?: number;
  changeVolumeUsd?: number;
}

const TokenTable = () => {
  const router = useRouter();
  const [tokens, setTokens] = useState<TokenData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sortConfig, setSortConfig] = useState<{ key: keyof TokenData; direction: 'asc' | 'desc' }>({ key: 'rank', direction: 'asc' });
  const [showFavorites, setShowFavorites] = useState(false);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [isMobile, setIsMobile] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'top' | 'new'>('top');
  const [currency, setCurrency] = useState<'USD' | 'KAS'>('USD');
  const [kasToUsdRate, setKasToUsdRate] = useState<number>(0.066929);

  useEffect(() => {
    const checkIfMobile = () => setIsMobile(window.innerWidth < 768);
    checkIfMobile();
    window.addEventListener('resize', checkIfMobile);
    return () => window.removeEventListener('resize', checkIfMobile);
  }, []);

  useEffect(() => {
    const savedFavorites = localStorage.getItem('tokenFavorites');
    if (savedFavorites) {
      setFavorites(new Set(JSON.parse(savedFavorites)));
    }
  }, []);

  const fetchKasPrice = async () => {
    try {
      const response = await fetch('https://api.kaspa.org/info/price?stringOnly=false');
      if (!response.ok) throw new Error('Failed to fetch KAS price');
      const data = await response.json();
      setKasToUsdRate(data.price);
    } catch (error) {
      console.error('Failed to fetch KAS price:', error);
      // Keep using the default value if fetch fails
    }
  };

  const fetchTokens = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/krc20-tokens');
      if (!response.ok) throw new Error('Failed to fetch tokens');
      const data = await response.json();
      
      setTokens(data);
      setError(null);
    } catch (error) {
      setError((error as Error).message);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchTokens();
    fetchKasPrice();
  }, []);

  const refreshData = async () => {
    setIsRefreshing(true);
    await Promise.all([fetchTokens(), fetchKasPrice()]);
  };

  const formatTimeAgo = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    if (days < 30) return `${days}d`;
    if (days < 365) return `${Math.floor(days / 30)}m`;
    return `${Math.floor(days / 365)}y`;
  };

  const formatNumber = (num: number | undefined, isPrice = false) => {
    if (typeof num !== 'number') return "0";
    
    if (currency === 'USD') {
      // Already in USD, no conversion needed
      if (isPrice) {
        if (num < 0.01) return `$${num.toFixed(6)}`;
        if (num < 1) return `$${num.toFixed(4)}`;
        return `$${num.toFixed(2)}`;
      }
      
      if (num >= 1e9) return `$${(num / 1e9).toFixed(1)}B`;
      if (num >= 1e6) return `$${(num / 1e6).toFixed(1)}M`;
      if (num >= 1e3) return `$${(num / 1e3).toFixed(1)}K`;
      return `$${num.toFixed(2)}`;
    } else {
      // Convert USD to KAS
      const kasValue = num / kasToUsdRate;
      
      if (isPrice) {
        if (kasValue < 0.01) return `${kasValue.toFixed(6)}`;
        if (kasValue < 1) return `${kasValue.toFixed(4)}`;
        return `${kasValue.toFixed(2)}`;
      }
      
      if (kasValue >= 1e9) return `${(kasValue / 1e9).toFixed(1)}B`;
      if (kasValue >= 1e6) return `${(kasValue / 1e6).toFixed(1)}M`;
      if (kasValue >= 1e3) return `${(kasValue / 1e3).toFixed(1)}K`;
      return `${kasValue.toFixed(2)}`;
    }
  };

  const toggleFavorite = (tokenId: string) => {
    const newFavorites = new Set(favorites);
    if (newFavorites.has(tokenId)) {
      newFavorites.delete(tokenId);
    } else {
      newFavorites.add(tokenId);
    }
    setFavorites(newFavorites);
    localStorage.setItem('tokenFavorites', JSON.stringify([...newFavorites]));
  };

  const sortData = (key: keyof TokenData) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const navigateToChart = (ticker: string) => {
    router.push(`/charts?ticker=${ticker}`);
  };

  const filteredTokens = useMemo(() => {
    let filtered = [...tokens];
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(token => 
        token.ticker.toLowerCase().includes(query)
      );
    }
    
    if (activeTab === 'top') {
      filtered = filtered.sort((a, b) => a.rank - b.rank).slice(0, 50);
    } else if (activeTab === 'new') {
      filtered = filtered.sort((a, b) => b.creationDate - a.creationDate).slice(0, 50);
    }
    
    if (showFavorites) {
      filtered = filtered.filter(token => favorites.has(token._id));
    }
    
    return filtered;
  }, [tokens, searchQuery, activeTab, showFavorites, favorites]);

  const sortedTokens = useMemo(() => {
    if (sortConfig.key === 'rank') {
      return [...filteredTokens].sort((a, b) => {
        return sortConfig.direction === 'asc' 
          ? a.rank - b.rank 
          : b.rank - a.rank;
      });
    }
    
    return [...filteredTokens].sort((a, b) => {
      if (sortConfig.key === 'creationDate') {
        return sortConfig.direction === 'asc'
          ? a.creationDate - b.creationDate
          : b.creationDate - a.creationDate;
      }
      const aValue = Number(a[sortConfig.key]) ?? 0;
      const bValue = Number(b[sortConfig.key]) ?? 0;
      return sortConfig.direction === 'asc' ? aValue - bValue : bValue - aValue;
    });
  }, [filteredTokens, sortConfig]);
  
  const renderSortIcon = (key: keyof TokenData) => {
    if (sortConfig.key === key) {
      return sortConfig.direction === 'asc' 
        ? <ArrowUp className="ml-1 h-3 w-3" /> 
        : <ArrowDown className="ml-1 h-3 w-3" />;
    }
    return <ArrowUpDown className="ml-1 h-3 w-3 opacity-50" />;
  };

  if (isLoading && !isRefreshing) return (
    <div className="flex items-center justify-center h-[400px]">
      <div className="flex flex-col items-center gap-2">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="text-muted-foreground text-sm">Loading token data...</p>
      </div>
    </div>
  );

  return (
    <Card className="border rounded-xl shadow-sm bg-card overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-primary/5 to-transparent p-2 pb-0">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <CardTitle className="text-xl">KRC20 Tokens</CardTitle>
            <p className="text-sm text-muted-foreground">Browse, search and analyze KRC20 tokens on Kaspa</p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input 
                placeholder="Search token..." 
                className="pl-9 w-full sm:w-[250px] bg-background/80 border-input" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <div className="flex gap-2">
              <div className="flex items-center gap-2 bg-background/80 px-3 py-1 rounded-md border text-xs">
                <Label htmlFor="currency-toggle" className="cursor-pointer">
                  {currency === "USD" ? 
                    <span className="flex items-center"><DollarSign size={16} className="mr-1" /> USD</span> : 
                    <span>KAS</span>
                  }
                </Label>
                <Switch 
                  id="currency-toggle"
                  checked={currency === "KAS"}
                  onCheckedChange={(checked) => setCurrency(checked ? "KAS" : "USD")}
                />
              </div>
              
              <div className="flex items-center gap-2 bg-background/80 px-3 py-1 rounded-md border text-xs">
                <span>Favorites</span>
                <Switch 
                  checked={showFavorites} 
                  onCheckedChange={setShowFavorites} 
                />
              </div>
              
              <Button size="sm" variant="outline" className="text-xs h-8" onClick={refreshData}>
                <RefreshCw size={14} className={`mr-1 ${isRefreshing ? "animate-spin" : ""}`} />
                Refresh
              </Button>
            </div>
          </div>
        </div>
        
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'all' | 'top' | 'new')} className="mt-3">
          <TabsList className="bg-background/50">
            <TabsTrigger value="all" className="text-xs">All Tokens</TabsTrigger>
            <TabsTrigger value="top" className="text-xs">Top 50</TabsTrigger>
            <TabsTrigger value="new" className="text-xs">New Tokens</TabsTrigger>
          </TabsList>
        </Tabs>
      </CardHeader>
      
      <CardContent className="p-0">
        {error ? (
          <div className="text-center py-6 text-destructive bg-destructive/10 mx-4 my-4 rounded-lg text-sm">
            Error: {error}
            <Button variant="outline" size="sm" onClick={fetchTokens} className="ml-2">
              Try Again
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto scrollbar-thin">
            <Table>
              <TableHeader className="bg-muted/30">
                <TableRow className="hover:bg-transparent">
                  <TableHead className="w-[40px] px-2">
                    <Star className="w-4 h-4 text-yellow-500" />
                  </TableHead>
                  <TableHead className="w-[140px]">Token</TableHead>
                  <TableHead className="text-right">
                    <Button variant="ghost" onClick={() => sortData('price')} className="font-medium text-xs h-7 px-2">
                      Price {currency === "USD" ? <DollarSign className="h-3 w-3 ml-1 text-muted-foreground" /> : null}
                      {renderSortIcon('price')}
                    </Button>
                  </TableHead>
                  <TableHead className="text-right">
                    <Button variant="ghost" onClick={() => sortData('marketCap')} className="font-medium text-xs h-7 px-2">
                      Market Cap
                      {renderSortIcon('marketCap')}
                    </Button>
                  </TableHead>
                  <TableHead className="text-right">
                    <Button variant="ghost" onClick={() => sortData('volumeUsd')} className="font-medium text-xs h-7 px-2">
                      Volume (24h)
                      {renderSortIcon('volumeUsd')}
                    </Button>
                  </TableHead>
                  <TableHead className="text-right">
                    <Button variant="ghost" onClick={() => sortData('totalHolders')} className="font-medium text-xs h-7 px-2">
                      Holders
                      {renderSortIcon('totalHolders')}
                    </Button>
                  </TableHead>
                  <TableHead className="text-right">
                    <Button variant="ghost" onClick={() => sortData('creationDate')} className="font-medium text-xs h-7 px-2">
                      Age
                      {renderSortIcon('creationDate')}
                    </Button>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isRefreshing ? (
                  Array(5).fill(0).map((_, index) => (
                    <TableRow key={`skeleton-${index}`}>
                      <TableCell className="px-2">
                        <div className="h-4 w-4 bg-muted rounded-full animate-pulse"></div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="h-8 w-8 bg-muted rounded-full animate-pulse"></div>
                          <div className="h-4 w-20 bg-muted rounded animate-pulse"></div>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="h-4 w-16 bg-muted rounded animate-pulse ml-auto"></div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="h-4 w-20 bg-muted rounded animate-pulse ml-auto"></div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="h-4 w-16 bg-muted rounded animate-pulse ml-auto"></div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="h-4 w-12 bg-muted rounded animate-pulse ml-auto"></div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="h-4 w-10 bg-muted rounded animate-pulse ml-auto"></div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : sortedTokens.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-32 text-center">
                      <div className="flex flex-col items-center justify-center text-muted-foreground">
                        <Search className="w-8 h-8 mb-2 opacity-20" />
                        {showFavorites ? (
                          <>
                            <p>No favorite tokens yet</p>
                            <p className="text-sm mt-1">Click the star icon to add tokens to your favorites</p>
                          </>
                        ) : searchQuery ? (
                          <>
                            <p>No tokens matching "{searchQuery}"</p>
                            <p className="text-sm mt-1">Try a different search term</p>
                          </>
                        ) : (
                          <p>No tokens found</p>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  sortedTokens.map((token) => (
                    <TableRow
                      key={token._id}
                      className={`group transition-colors duration-200 ${favorites.has(token._id) ? 'bg-yellow-500/5' : ''} hover:bg-accent/30 cursor-pointer`}
                      onClick={(e) => {
                        if ((e.target as HTMLElement).closest('button')) return;
                        navigateToChart(token.ticker);
                      }}
                    >
                      <TableCell className="w-[40px] px-2">
                        <Button variant="ghost" size="icon" onClick={(e) => {
                          e.stopPropagation();
                          toggleFavorite(token._id);
                        }} className="h-6 w-6 opacity-70 group-hover:opacity-100 transition-opacity">
                          <Star className={`h-4 w-4 ${favorites.has(token._id) ? 'text-yellow-500' : 'text-muted-foreground'}`} fill={favorites.has(token._id) ? "currentColor" : "none"} />
                        </Button>
                      </TableCell>
                      <TableCell className="py-2">
                        <div className="flex items-center gap-2">
                          <div className="relative">
                            {token.logoUrl ? (
                              <div className="w-7 h-7 rounded-full overflow-hidden shadow-sm border">
                                <Image 
                                  src={token.logoUrl} 
                                  alt={token.ticker} 
                                  width={28} 
                                  height={28} 
                                  className="object-cover" 
                                  onError={(e) => {
                                    (e.target as HTMLImageElement).src = `/kas.png`;
                                  }}
                                />
                              </div>
                            ) : (
                              <div className="w-7 h-7 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-sm font-medium text-primary shadow-sm">
                                {token.ticker[0]}
                              </div>
                            )}
                            
                            {formatTimeAgo(token.creationDate) === 'Today' && (
                              <Badge className="absolute -top-1 -right-1 px-1 py-0 text-[10px] h-4 bg-green-500 text-white">NEW</Badge>
                            )}
                          </div>
                          <div className="flex flex-col">
                            <span className="font-bold text-sm">{token.ticker}</span>
                            <span className="text-xs text-muted-foreground">#{token.rank}</span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex flex-col items-end">
                          <span className="text-sm font-medium">{formatNumber(token.price, true)}</span>
                          {token.change24h && (
                            <div className={`flex items-center text-xs ${token.change24h > 0 ? 'text-green-500' : 'text-red-500'}`}>
                              {token.change24h > 0 ? (
                                <TrendingUp className="h-3 w-3 mr-0.5" />
                              ) : (
                                <TrendingDown className="h-3 w-3 mr-0.5" />
                              )}
                              <span>{Math.abs(token.change24h).toFixed(1)}%</span>
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex flex-col items-end">
                          <span className="text-sm font-medium">{formatNumber(token.marketCap)}</span>
                          {token.changeMarketCap && (
                            <span className={`text-xs ${token.changeMarketCap > 0 ? 'text-green-500' : 'text-red-500'}`}>
                              {token.changeMarketCap > 0 ? '+' : ''}{token.changeMarketCap.toFixed(1)}%
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex flex-col items-end">
                          <span className="text-sm font-medium">{formatNumber(token.volumeUsd)}</span>
                          {token.changeVolumeUsd && (
                            <span className={`text-xs ${token.changeVolumeUsd > 0 ? 'text-green-500' : 'text-red-500'}`}>
                              {token.changeVolumeUsd > 0 ? '+' : ''}{token.changeVolumeUsd.toFixed(1)}%
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <span className="font-medium">{token.totalHolders?.toLocaleString() || '0'}</span>
                      </TableCell>
                      <TableCell className="text-right">
                        <Badge variant="outline" className="bg-accent/30 border-accent text-foreground">
                          {formatTimeAgo(token.creationDate)}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        )}
        
        <div className="py-3 px-4 border-t text-sm text-muted-foreground flex items-center justify-between">
          <div>Showing {sortedTokens.length} tokens</div>
          <div className="flex items-center gap-3">
            <div className="flex items-center">
              <DollarSign className="h-4 w-4 mr-1" />
              <span>1 KAS = ${kasToUsdRate.toFixed(6)} USD</span>
            </div>
            <span>•</span>
            <div className="flex items-center">
              <Star className="h-4 w-4 text-yellow-500 mr-1" fill="currentColor" />
              <span>Favorites: {favorites.size}</span>
            </div>
            <span>•</span>
            <div>Last updated: {new Date().toLocaleTimeString()}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default TokenTable;