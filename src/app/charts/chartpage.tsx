'use client';

import React, { useState } from 'react';
import TradingViewChart from './TradingViewChart';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';

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

  const handlePriceTypeChange = (value: string) => {
    if (value) {
      setPriceType(value as 'usd' | 'kas');
      setKey(prev => prev + 1);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const getTimeRangeLabel = (range: string) => {
    switch (range) {
      case '1d': return '1 Day';
      case '7d': return '1 Week';
      case '1m': return '1 Month';
      case '1y': return '1 Year';
      default: return range.toUpperCase();
    }
  };

  return (
    <div className="w-full h-full min-h-screen p-4 bg-gray-950">
      <Card className="w-full h-full p-6 bg-gray-900 text-white border-gray-800">
        <div className="flex flex-col gap-6 h-full">
          <div className="flex flex-col sm:flex-row gap-4 justify-between">
            <div className="flex-1 flex flex-col sm:flex-row gap-2">
              <Input
                type="text"
                placeholder="Enter Token Ticker"
                value={inputTicker}
                onChange={(e) => setInputTicker(e.target.value)}
                onKeyDown={handleKeyDown}
                className="bg-gray-800 border-gray-700 text-white"
              />
              <Button onClick={handleSearch} className="bg-primary hover:bg-primary/90">
                Search
              </Button>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-2 items-center">
              <ToggleGroup 
                type="single" 
                value={priceType}
                onValueChange={handlePriceTypeChange}
                className="bg-gray-800 rounded-md border border-gray-700"
              >
                <ToggleGroupItem 
                  value="usd" 
                  className={`px-3 py-2 ${priceType === 'usd' ? 'bg-primary text-primary-foreground' : 'bg-transparent'}`}
                >
                  USD
                </ToggleGroupItem>
                <ToggleGroupItem 
                  value="kas" 
                  className={`px-3 py-2 ${priceType === 'kas' ? 'bg-primary text-primary-foreground' : 'bg-transparent'}`}
                >
                  KAS
                </ToggleGroupItem>
              </ToggleGroup>
            </div>
          </div>
          
          <Tabs 
            value={timeRange} 
            onValueChange={handleTimeRangeChange}
            className="w-full"
          >
            <TabsList className="grid grid-cols-4 w-full bg-gray-800">
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
          
          <div className="flex items-center gap-2">
            <div className="text-xl font-bold">{ticker}</div>
            <div className="text-sm text-gray-400">
              Hourly Price Chart (Past {getTimeRangeLabel(timeRange)}) - {priceType.toUpperCase()}
            </div>
          </div>
          
          <div className="w-full h-[calc(100vh-340px)]" style={{ minHeight: '500px' }}> {/* Adjust height value here */}
            <div className="w-full h-full bg-gray-900 rounded-lg overflow-hidden border border-gray-800">
              <TradingViewChart 
                key={key} 
                ticker={ticker} 
                timeRange={timeRange}
                priceType={priceType}
              />
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default ChartPage;