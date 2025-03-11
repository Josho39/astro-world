'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { ArrowUpDown, ArrowUp, ArrowDown, RefreshCw, Eye, EyeOff, Loader2, Search } from 'lucide-react';
import { cn } from "@/lib/utils";
import _ from 'lodash';
import { MARKETS } from './market-config';
import { TICKERS } from './krc20-tickers';

interface MarketData {
    priceInUsd: number;
    volumeInUsd: number;
}

interface MarketInfo {
    name: string;
    marketData?: MarketData;
}

interface Token {
    ticker: string;
    marketsData?: MarketInfo[];
}

interface MarketPrice {
    market: string;
    price: number;
    volume: number;
}

interface CombinedMarketData {
    ticker: string;
    markets: MarketPrice[];
    maxPrice: number;
    minPrice: number;
    maxSpread: number;
}

interface SortConfig {
    key: string;
    direction: 'asc' | 'desc';
}

interface SelectedRow {
    ticker: string;
    market: string;
    price: number;
}

const ArbAnalyzer = () => {
    const [tokens, setTokens] = useState<Token[]>([]);
    const [filterTicker, setFilterTicker] = useState('');
    const [minVolume, setMinVolume] = useState<number>(0);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [progress, setProgress] = useState({ current: 0, total: 0 });
    const [hiddenMarkets, setHiddenMarkets] = useState<Set<string>>(new Set());
    const [ignoreZeroVolume, setIgnoreZeroVolume] = useState(false);
    const [selectedRows, setSelectedRows] = useState<SelectedRow[]>([]);

    const BATCH_SIZE = 100;
    const API_DELAY = 0;

    const fetchTokenData = async (ticker: string): Promise<Token | null> => {
        try {
            const cleanedTicker = ticker.replace(/['"]/g, '').trim();
            if (!cleanedTicker) return null;
            const response = await fetch(`https://api-v2-do.kas.fyi/token/krc20/${encodeURIComponent(cleanedTicker)}/info`);
            if (!response.ok) return null;
            const data = await response.json();
            return data;
        } catch (error) {
            return null;
        }
    };

    const fetchAndUpdateTickers = async () => {
        try {
            setIsLoading(true);
            setError(null);
            setTokens([]);
            
            const uniqueTickers = [...new Set(TICKERS)];
            setProgress({ current: 0, total: uniqueTickers.length });
            
            const validTokens: Token[] = [];
            const failedTickers: string[] = [];

            for (let i = 0; i < uniqueTickers.length; i += BATCH_SIZE) {
                const batch = uniqueTickers.slice(i, i + BATCH_SIZE);
                const batchPromises = batch.map(ticker => 
                    fetchTokenData(ticker)
                        .then(result => {
                            if (!result) failedTickers.push(ticker);
                            return result;
                        })
                        .catch(() => {
                            failedTickers.push(ticker);
                            return null;
                        })
                );

                const batchResults = await Promise.all(batchPromises);
                const validBatchTokens = batchResults.filter((t): t is Token => t !== null);
                validTokens.push(...validBatchTokens);

                setProgress({ current: i + BATCH_SIZE, total: uniqueTickers.length });
                setTokens(current => [...current, ...validBatchTokens]);

                await new Promise(resolve => setTimeout(resolve, API_DELAY));
            }

            if (failedTickers.length > 0) {
                setError(`Loaded ${validTokens.length} tokens. Failed to load ${failedTickers.length} tokens.`);
            }

        } catch (error) {
            setError(error instanceof Error ? error.message : 'Failed to load tokens');
        } finally {
            setIsLoading(false);
            setProgress({ current: 0, total: 0 });
        }
    };

    useEffect(() => {
        fetchAndUpdateTickers();
    }, []);

    const toggleMarket = (market: string) => {
        setHiddenMarkets(current => {
            const newSet = new Set(current);
            if (current.has(market)) {
                newSet.delete(market);
            } else {
                newSet.add(market);
            }
            return newSet;
        });
    };

    const showAllMarkets = () => {
        setHiddenMarkets(new Set());
    };

    const allMarkets = useMemo(() => {
        return _.uniq(tokens.flatMap(token => 
            token.marketsData
                ?.filter(market => {
                    if (ignoreZeroVolume && market.marketData?.volumeInUsd === 0) return false;
                    if (minVolume > 0 && market.marketData && market.marketData.volumeInUsd < minVolume) return false;
                    return true;
                })
                .map(market => market.name) || []
        ));
    }, [tokens, ignoreZeroVolume, minVolume]);

    const filteredTokens = useMemo(() => {
        if (hiddenMarkets.size === 0) return tokens;
        return tokens.map(token => ({
            ...token,
            marketsData: token.marketsData?.filter(market => !hiddenMarkets.has(market.name))
        })).filter(token => token.marketsData && token.marketsData.length > 0);
    }, [tokens, hiddenMarkets]);

    const toggleRowSelection = (ticker: string, market: string, price: number) => {
        setSelectedRows(current => {
            const newSelection = current.filter(row => !(row.ticker === ticker && row.market === market));
            if (newSelection.length === current.length) {
                if (current.length >= 2) {
                    newSelection.shift();
                }
                newSelection.push({ ticker, market, price });
            }
            return newSelection;
        });
    };

    const calculateSelectedSpread = () => {
        if (selectedRows.length !== 2 || selectedRows[0].ticker !== selectedRows[1].ticker) return null;
        const [row1, row2] = selectedRows;
        const spread = ((Math.max(row1.price, row2.price) - Math.min(row1.price, row2.price)) / Math.min(row1.price, row2.price)) * 100;
        return spread;
    };
    const combinedMarketData = useMemo(() => {
        const data = filteredTokens.map(token => {
            const markets: MarketPrice[] = token.marketsData
                ?.filter(m => {
                    if (!m.marketData?.priceInUsd) return false;
                    if (ignoreZeroVolume && m.marketData.volumeInUsd === 0) return false;
                    if (minVolume > 0 && m.marketData.volumeInUsd < minVolume) return false;
                    return true;
                })
                ?.map(m => ({
                    market: m.name,
                    price: m.marketData!.priceInUsd,
                    volume: m.marketData!.volumeInUsd
                })) || [];
            if (markets.length < 2) return null;
            const prices = markets.map(m => m.price);
            const maxPrice = Math.max(...prices);
            const lowestPrice = Math.min(...prices);
            const maxSpread = ((maxPrice - lowestPrice) / lowestPrice) * 100;
            return {
                ticker: token.ticker,
                markets,
                maxPrice,
                minPrice: lowestPrice,
                maxSpread
            };
        }).filter((data): data is CombinedMarketData => data !== null);
        return _.orderBy(data, ['maxSpread'], ['desc']);
    }, [filteredTokens, ignoreZeroVolume, minVolume]);

    return (
        <div className="flex flex-col space-y-4">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-0 p-2">
                <div>
                    <div>
                        <CardTitle className="text-xl">Arbitrage Analyzer</CardTitle>
                        <p className="text-sm text-muted-foreground">Analyze arbitrage opportunities between different markets for tokens</p>
                    </div>
                </div>
                <div className="flex items-center gap-2 w-full md:w-auto mt-3 md:mt-0">
                    <div className="relative flex-1 md:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Filter by ticker..."
                            value={filterTicker}
                            onChange={(e) => setFilterTicker(e.target.value)}
                            className="pl-9 h-9 bg-background/80 border-primary/20 w-full"
                        />
                    </div>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                        <div className="flex flex-wrap gap-4 items-center">
                            <div className="flex items-center space-x-2">
                                <Label htmlFor="min-volume">Min Volume ($):</Label>
                                <Input
                                    id="min-volume"
                                    type="number"
                                    placeholder="Min volume"
                                    value={minVolume}
                                    onChange={(e) => setMinVolume(Number(e.target.value))}
                                    className="max-w-24"
                                />
                            </div>
                            <div className="flex items-center space-x-2">
                                <Switch id="ignore-zero-volume" checked={ignoreZeroVolume} onCheckedChange={setIgnoreZeroVolume} />
                                <Label htmlFor="ignore-zero-volume">Ignore Zero Volume</Label>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            {isLoading && progress.total > 0 && (
                                <div className="text-sm text-muted-foreground">
                                    Loading: {Math.min(progress.current, progress.total)}/{progress.total}
                                </div>
                            )}
                            <div className="text-sm text-muted-foreground">
                                Total Tokens: {tokens.length}
                            </div>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <div className="flex gap-2 flex-wrap items-start">
                            {Object.keys(MARKETS).sort((a, b) => a.localeCompare(b)).map(market => {
                                const marketConfig = MARKETS[market];
                                const isAvailable = allMarkets.includes(market);
                                
                                return (
                                    <Button
                                        key={market}
                                        variant={hiddenMarkets.has(market) ? "default" : "outline"}
                                        onClick={() => isAvailable && toggleMarket(market)}
                                        className={cn(
                                            "flex flex-col items-center gap-1 p-2 h-auto w-16",
                                            !isAvailable && "opacity-50 cursor-not-allowed"
                                        )}
                                        title={`${marketConfig.displayName}${marketConfig.isKrc20Market ? ' (KRC20)' : ''}`}
                                    >
                                        <div className="relative">
                                            <Avatar className="h-8 w-8 rounded-full">
                                                <AvatarImage src={marketConfig.iconUrl} alt={marketConfig.displayName} className="object-cover" />
                                                <AvatarFallback className="text-xs">{marketConfig.name.slice(0, 2).toUpperCase()}</AvatarFallback>
                                            </Avatar>
                                            <div className="absolute -top-1 -right-1">
                                                {hiddenMarkets.has(market) ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                                            </div>
                                        </div>
                                        <span className="text-[10px] text-center leading-tight max-w-full truncate">
                                            {marketConfig.displayName}
                                        </span>
                                    </Button>
                                );
                            })}
                            <Button variant="outline" onClick={showAllMarkets} className="flex flex-col items-center justify-center h-[68px] w-16 p-2">
                                <Eye className="h-8 w-8" />
                                <span className="text-[10px] mt-1">Show All</span>
                            </Button>
                        </div>

                        <div className="relative overflow-x-auto border rounded-lg">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Ticker</TableHead>
                                        <TableHead>Market</TableHead>
                                        <TableHead>Price</TableHead>
                                        <TableHead>Volume</TableHead>
                                        <TableHead>Action</TableHead>
                                        <TableHead>Spread %</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {combinedMarketData
                                        .filter(data => data.ticker.toLowerCase().includes(filterTicker.toLowerCase()))
                                        .map((data) => {
                                            const sortedMarkets = [...data.markets].sort((a, b) => a.price - b.price);
                                            const lowestPrice = sortedMarkets[0].price;
                                            const highestPrice = sortedMarkets[sortedMarkets.length - 1].price;

                                            return sortedMarkets.map((market, marketIndex) => {
                                                const isSelected = selectedRows.some(row => 
                                                    row.ticker === data.ticker && row.market === market.market
                                                );
                                                
                                                return (
                                                    <TableRow 
                                                        key={`${data.ticker}-${market.market}`}
                                                        className={cn(
                                                            "cursor-pointer hover:bg-muted/50",
                                                            isSelected && "bg-muted"
                                                        )}
                                                        onClick={() => toggleRowSelection(data.ticker, market.market, market.price)}
                                                    >
                                                        {marketIndex === 0 && (
                                                            <TableCell className="font-medium" rowSpan={sortedMarkets.length}>
                                                                {data.ticker}
                                                            </TableCell>
                                                        )}
                                                        <TableCell>{market.market}</TableCell>
                                                        <TableCell className={
                                                            market.price === lowestPrice 
                                                                ? 'text-green-500'
                                                                : market.price === highestPrice 
                                                                    ? 'text-red-500'
                                                                    : ''
                                                        }>
                                                            ${market.price.toFixed(8)}
                                                        </TableCell>
                                                        <TableCell>
                                                            ${market.volume.toFixed(2)}
                                                        </TableCell>
                                                        <TableCell className={
                                                            market.price === lowestPrice 
                                                                ? 'text-green-500 font-bold'
                                                                : market.price === highestPrice 
                                                                    ? 'text-red-500 font-bold'
                                                                    : ''
                                                        }>
                                                            {market.price === lowestPrice ? '[BUY]' : market.price === highestPrice ? '[SELL]' : '-'}
                                                        </TableCell>
                                                        {marketIndex === 0 && (
                                                            <TableCell 
                                                                className="font-semibold text-green-500" 
                                                                rowSpan={sortedMarkets.length}
                                                            >
                                                                {selectedRows.length === 2 && 
                                                                 selectedRows[0].ticker === data.ticker && 
                                                                 selectedRows[1].ticker === data.ticker ? (
                                                                    calculateSelectedSpread()?.toFixed(2)
                                                                ) : (
                                                                    data.maxSpread.toFixed(2)
                                                                )}%
                                                            </TableCell>
                                                        )}
                                                    </TableRow>
                                                );
                                            });
                                        })}
                                    {combinedMarketData.length === 0 && (
                                        <TableRow>
                                            <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                                                {isLoading ? (
                                                    <div className="flex items-center justify-center gap-2">
                                                        <Loader2 className="h-4 w-4 animate-spin" />
                                                        Loading market data...
                                                    </div>
                                                ) : (
                                                    "No arbitrage opportunities found"
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                        
                        {error && (
                            <div className="text-sm text-muted-foreground mt-2">
                                {error}
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default ArbAnalyzer;