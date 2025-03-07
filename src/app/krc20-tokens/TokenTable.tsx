'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Loader2, ArrowDown, ArrowUp, ArrowUpDown, Star } from 'lucide-react';
import { Switch } from "@/components/ui/switch";
import Image from 'next/image';
import { Card } from '@/components/ui/card';
import { useRouter } from 'next/navigation';

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
}

const TokenTable = () => {
  const router = useRouter();
  const [tokens, setTokens] = useState<TokenData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortConfig, setSortConfig] = useState<{ key: keyof TokenData; direction: 'asc' | 'desc' }>({ key: 'marketCap', direction: 'desc' });
  const [showFavorites, setShowFavorites] = useState(false);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [isMobile, setIsMobile] = useState(false);

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

  useEffect(() => {
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
      }
    };
    fetchTokens();
  }, []);

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

  const formatNumber = (num: number | undefined) => {
    if (typeof num !== 'number') return "0";
    if (num >= 1e9) return (num / 1e9).toFixed(1) + 'B';
    if (num >= 1e6) return (num / 1e6).toFixed(1) + 'M';
    if (num >= 1e3) return (num / 1e3).toFixed(1) + 'K';
    return num.toFixed(0);
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

  const sortedTokens = useMemo(() => {
    const sorted = [...tokens].sort((a, b) => {
      if (sortConfig.key === 'creationDate') {
        return sortConfig.direction === 'asc'
          ? a.creationDate - b.creationDate
          : b.creationDate - a.creationDate;
      }
      const aValue = Number(a[sortConfig.key]) ?? 0;
      const bValue = Number(b[sortConfig.key]) ?? 0;
      return sortConfig.direction === 'asc' ? aValue - bValue : bValue - aValue;
    });
    return showFavorites ? sorted.filter(token => favorites.has(token._id)) : sorted;
  }, [tokens, sortConfig, showFavorites, favorites]);

  if (isLoading) return (
    <div className="flex items-center justify-center h-[200px]">
      <Loader2 className="w-6 h-6 animate-spin text-primary" />
    </div>
  );

  if (error) return (
    <div className="text-center py-6 text-red-500 bg-red-50 rounded-lg text-sm">
      Error: {error}
    </div>
  );

  return (
    <Card className="border bg-card">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3 border-b gap-2">
        <h2 className="text-lg font-semibold">KRC20 Tokens</h2>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Favorites</span>
          <Switch checked={showFavorites} onCheckedChange={setShowFavorites} />
        </div>
      </div>
      <div className="overflow-x-auto scrollbar-thin">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="w-[40px] px-2">
                <Star className="w-4 h-4 text-yellow-500" />
              </TableHead>
              <TableHead className="w-[160px]">Token</TableHead>
              <TableHead className="text-right">
                <Button variant="ghost" onClick={() => sortData('price')} className="font-medium text-xs h-8 px-2">
                  Price {sortConfig.key === 'price' ? (sortConfig.direction === 'asc' ? <ArrowUp className="ml-1 h-3 w-3" /> : <ArrowDown className="ml-1 h-3 w-3" />) : <ArrowUpDown className="ml-1 h-3 w-3" />}
                </Button>
              </TableHead>
              {!isMobile && (
                <TableHead className="text-right">
                  <Button variant="ghost" onClick={() => sortData('marketCap')} className="font-medium text-xs h-8 px-2">
                    MCap {sortConfig.key === 'marketCap' ? (sortConfig.direction === 'asc' ? <ArrowUp className="ml-1 h-3 w-3" /> : <ArrowDown className="ml-1 h-3 w-3" />) : <ArrowUpDown className="ml-1 h-3 w-3" />}
                  </Button>
                </TableHead>
              )}
              {!isMobile && (
                <TableHead className="text-right">
                  <Button variant="ghost" onClick={() => sortData('volumeUsd')} className="font-medium text-xs h-8 px-2">
                    Vol {sortConfig.key === 'volumeUsd' ? (sortConfig.direction === 'asc' ? <ArrowUp className="ml-1 h-3 w-3" /> : <ArrowDown className="ml-1 h-3 w-3" />) : <ArrowUpDown className="ml-1 h-3 w-3" />}
                  </Button>
                </TableHead>
              )}
              {!isMobile && (
                <TableHead className="text-right">
                  <Button variant="ghost" onClick={() => sortData('totalSupply')} className="font-medium text-xs h-8 px-2">
                    Supply {sortConfig.key === 'totalSupply' ? (sortConfig.direction === 'asc' ? <ArrowUp className="ml-1 h-3 w-3" /> : <ArrowDown className="ml-1 h-3 w-3" />) : <ArrowUpDown className="ml-1 h-3 w-3" />}
                  </Button>
                </TableHead>
              )}
              {!isMobile && (
                <TableHead className="text-right">
                  <Button variant="ghost" onClick={() => sortData('totalHolders')} className="font-medium text-xs h-8 px-2">
                    Holders {sortConfig.key === 'totalHolders' ? (sortConfig.direction === 'asc' ? <ArrowUp className="ml-1 h-3 w-3" /> : <ArrowDown className="ml-1 h-3 w-3" />) : <ArrowUpDown className="ml-1 h-3 w-3" />}
                  </Button>
                </TableHead>
              )}
              <TableHead className="text-right">
                <Button variant="ghost" onClick={() => sortData('creationDate')} className="font-medium text-xs h-8 px-2">
                  Age {sortConfig.key === 'creationDate' ? (sortConfig.direction === 'asc' ? <ArrowUp className="ml-1 h-3 w-3" /> : <ArrowDown className="ml-1 h-3 w-3" />) : <ArrowUpDown className="ml-1 h-3 w-3" />}
                </Button>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedTokens.map((token) => (
              <TableRow
                key={token._id}
                className={`group ${favorites.has(token._id) ? 'bg-yellow-500/5' : ''} hover:bg-accent/20 cursor-pointer`}
                onClick={(e) => {
                  if ((e.target as HTMLElement).closest('button')) return;
                  navigateToChart(token.ticker);
                }}
              >
                <TableCell className="w-[40px] px-2">
                  <Button variant="ghost" size="icon" onClick={() => toggleFavorite(token._id)} className="h-6 w-6">
                    <Star className={`h-4 w-4 ${favorites.has(token._id) ? 'text-yellow-500' : 'text-muted-foreground'}`} fill={favorites.has(token._id) ? "currentColor" : "none"} />
                  </Button>
                </TableCell>
                <TableCell className="py-2">
                  <div className="flex items-center gap-2">
                    {token.logoUrl ? (
                      <Image src={token.logoUrl} alt={token.ticker} width={24} height={24} className="rounded-full" />
                    ) : (
                      <div className="w-6 h-6 rounded-full bg-accent flex items-center justify-center text-xs font-medium">
                        {token.ticker[0]}
                      </div>
                    )}
                    <span className="font-medium text-sm">{token.ticker}</span>
                  </div>
                </TableCell>
                <TableCell className="text-right font-medium text-xs sm:text-sm">${(token.price ?? 0).toFixed(isMobile ? 4 : 6)}</TableCell>
                {!isMobile && (
                  <TableCell className="text-right font-medium text-xs sm:text-sm">${formatNumber(token.marketCap)}</TableCell>
                )}
                {!isMobile && (
                  <TableCell className="text-right font-medium text-xs sm:text-sm">${formatNumber(token.volumeUsd)}</TableCell>
                )}
                {!isMobile && (
                  <TableCell className="text-right font-medium text-xs sm:text-sm">{formatNumber(token.totalSupply)}</TableCell>
                )}
                {!isMobile && (
                  <TableCell className="text-right font-medium text-xs sm:text-sm">{formatNumber(token.totalHolders)}</TableCell>
                )}
                <TableCell className="text-right font-medium text-xs sm:text-sm">{formatTimeAgo(token.creationDate)}</TableCell>
              </TableRow>
            ))}
            {sortedTokens.length === 0 && (
              <TableRow>
                <TableCell colSpan={isMobile ? 4 : 8} className="h-16 text-center text-sm text-muted-foreground">
                  {showFavorites ? "No favorite tokens yet" : "No tokens found"}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </Card>
  );
};

export default TokenTable;
