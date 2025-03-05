'use client';

import React, { useState } from 'react';
import TradingViewChart from './TradingViewChart';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ThemeToggle } from '@/components/theme-toggle';
import { DollarSign, Coins } from 'lucide-react';

const ChartPage = () => {
    const [ticker, setTicker] = useState<string>('BURT');
    const [timeRange, setTimeRange] = useState<'1d' | '7d' | '1m' | '1y'>('1d');
    const [priceType, setPriceType] = useState<'usd' | 'kas'>('usd');
    const [inputTicker, setInputTicker] = useState<string>('BURT');
    const [key, setKey] = useState<number>(0);

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

    return (
        <div className="w-full h-full min-h-screen p-0 bg-background overflow-y-hidden">
            <Card className="w-full h-full p-0 bg-card text-card-foreground border-border">
                <div className="flex flex-col gap-4 h-full">
                    <div className="flex flex-col sm:flex-row gap-4 justify-between">
                        <div className="flex-1 flex flex-col sm:flex-row gap-2">
                            <Input
                                type="text"
                                placeholder="Enter Token Ticker"
                                value={inputTicker}
                                onChange={(e) => setInputTicker(e.target.value)}
                                onKeyDown={handleKeyDown}
                                className="bg-input border-input"
                            />
                            <Button onClick={handleSearch} className="bg-primary hover:bg-primary/90">
                                Search
                            </Button>
                        </div>

                        <div className="flex flex-col sm:flex-row items-center">
                            <div className="flex items-center">

                                <div className="flex gap-4">
                                    <Button
                                        variant={priceType === 'usd' ? "default" : "outline"}
                                        onClick={() => handlePriceTypeChange('usd')}
                                        className="flex items-center gap-1"
                                        size="sm"
                                    >
                                        <DollarSign className="h-4 w-4" />
                                        USD

                                    </Button>
                                    <Button
                                        variant={priceType === 'kas' ? "default" : "outline"}
                                        onClick={() => handlePriceTypeChange('kas')}
                                        className="flex items-center gap-1"
                                        size="sm"
                                    >
                                        <Coins className="h-4 w-4" />
                                        KAS
                                    </Button>
                                </div>
                            </div>

                        </div>
                    </div>

                    <Tabs
                        value={timeRange}
                        onValueChange={handleTimeRangeChange}
                        className="w-full"
                    >
                        <TabsList className="grid grid-cols-4 w-full bg-muted">
                            <TabsTrigger
                                value="1d"
                                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                            >
                                1D
                            </TabsTrigger>
                            <TabsTrigger
                                value="7d"
                                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                            >
                                1W
                            </TabsTrigger>
                            <TabsTrigger
                                value="1m"
                                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                            >
                                1M
                            </TabsTrigger>
                            <TabsTrigger
                                value="1y"
                                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                            >
                                1Y
                            </TabsTrigger>
                        </TabsList>
                    </Tabs>

                    <div
                        className="w-full h-[calc(100vh-250px)] bg-card rounded-lg overflow-hidden border border-border"
                        style={{ minHeight: '500px' }}
                    >
                        <TradingViewChart
                            key={key}
                            ticker={ticker}
                            timeRange={timeRange}
                            priceType={priceType}
                        />
                    </div>
                </div>
            </Card>
        </div>
    );
};

export default ChartPage;