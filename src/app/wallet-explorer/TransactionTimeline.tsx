/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { RefreshCw, AlertCircle, Search } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Area, AreaChart, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine, CartesianGrid } from 'recharts';
import TransactionList from './TransactionList';

const ANIMATION_DURATION_MS = 2000;

const formatKAS = (amount: number) => {
  return (amount / 100000000).toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }) + ' KAS';
};

const formatFullDate = (timestamp: number) => {
  const date = new Date(timestamp);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const formatTickDate = (timestamp: number) => {
  const date = new Date(timestamp);
  return `${date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
};

const BalanceFlow = ({ transactions, mainAddress }: { transactions: any[]; mainAddress: string; }) => {
  const [progress, setProgress] = useState(0);

  const flowData = useMemo(() => {
    let balance = 0;
    const sortedTransactions = [...transactions].sort((a, b) => a.block_time - b.block_time);
    
    return sortedTransactions.map((tx) => {
      const sentAmount = tx.inputs.reduce((sum: number, input: any) => 
        input.previous_outpoint_resolved?.script_public_key_address === mainAddress 
          ? sum + (input.previous_outpoint_resolved?.amount || 0) / 100000000
          : sum, 0);

      const receivedAmount = tx.outputs.reduce((sum: number, output: any) => 
        output.script_public_key_address === mainAddress 
          ? sum + output.amount / 100000000
          : sum, 0);

      const netAmount = receivedAmount - sentAmount;
      balance += netAmount;

      return {
        time: tx.block_time,
        balance,
        netAmount,
        fullTime: formatFullDate(tx.block_time),
        shortTime: formatTickDate(tx.block_time)
      };
    });
  }, [transactions, mainAddress]);

  useEffect(() => {
    setProgress(0);
    const startTime = Date.now();
    const animate = () => {
      const elapsed = Date.now() - startTime;
      const nextProgress = Math.min(1, elapsed / ANIMATION_DURATION_MS);
      setProgress(nextProgress);

      if (nextProgress < 1) {
        requestAnimationFrame(animate);
      }
    };
    requestAnimationFrame(animate);
  }, [flowData]);

  const CustomizedXAxisTick = ({ x, y, payload }: { x: number; y: number; payload: { value: number; index: number; }; }) => {
    const index = payload.index;
    const totalPoints = flowData.length;
    
    const isMajorPoint = () => {
      if (totalPoints <= 10) return true;
      if (index === 0 || index === totalPoints - 1) return true;
      const interval = Math.max(1, Math.floor(totalPoints / 8));
      return index % interval === 0;
    };

    if (!isMajorPoint()) return <g />;

    return (
      <g transform={`translate(${x},${y})`}>
        <text 
          x={0} 
          y={0} 
          dy={16} 
          textAnchor="middle" 
          fill="#6b7280" 
          fontSize={12}
          transform="rotate(-35)"
        >
          {formatTickDate(payload.value)}
        </text>
      </g>
    );
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-background/95 p-4 rounded-lg shadow-lg border backdrop-blur-sm">
          <p className="text-sm font-medium text-muted-foreground mb-2">
            {data.fullTime}
          </p>
          <div className="space-y-2">
            <div className="flex justify-between items-center gap-4">
              <span className="text-sm font-medium">Balance:</span>
              <span className={`text-sm font-bold ${data.balance >= 0 ? "text-green-500" : "text-red-500"}`}>
                {formatKAS(data.balance * 100000000)}
              </span>
            </div>
            {data.netAmount !== 0 && (
              <div className="flex justify-between items-center gap-4 border-t pt-2">
                <span className="text-sm font-medium">Change:</span>
                <span className={`text-sm font-bold ${data.netAmount >= 0 ? "text-green-500" : "text-red-500"}`}>
                  {data.netAmount > 0 ? '+' : ''}{formatKAS(data.netAmount * 100000000)}
                </span>
              </div>
            )}
          </div>
        </div>
      );
    }
    return null;
  };

  const gradientOffset = useMemo(() => {
    const dataMax = Math.max(...flowData.map(d => d.balance));
    const dataMin = Math.min(...flowData.map(d => d.balance));
    
    if (dataMax <= 0) return 0;
    if (dataMin >= 0) return 1;
    
    return dataMax / (dataMax - dataMin);
  }, [flowData]);

  return (
    <div className="w-full h-[500px] pt-4">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={flowData} margin={{ top: 20, right: 30, left: 0, bottom: 70 }}>
          <defs>
            <linearGradient id="splitColor" x1="0" y1="0" x2="0" y2="1">
              <stop offset={gradientOffset} stopColor="#22c55e" stopOpacity={0.3} />
              <stop offset={gradientOffset} stopColor="#ef4444" stopOpacity={0.3} />
            </linearGradient>
            <clipPath id="clipPath">
              <rect x="0" y="0" width={`${progress * 100}%`} height="100%" />
            </clipPath>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
          <XAxis 
            dataKey="time"
            tick={CustomizedXAxisTick}
            height={80}
            axisLine={{ stroke: '#e5e7eb' }}
            tickLine={{ stroke: '#e5e7eb' }}
          />
          <YAxis 
            tickFormatter={(value) => formatKAS(value * 100000000)}
            width={140}
            axisLine={{ stroke: '#e5e7eb' }}
            tickLine={{ stroke: '#e5e7eb' }}
            style={{ fontSize: '12px' }}
          />
          <Tooltip 
            content={<CustomTooltip />}
            cursor={{ stroke: '#6b7280', strokeWidth: 1, strokeDasharray: '5 5' }}
          />
          <ReferenceLine y={0} stroke="#9ca3af" strokeWidth={2} />
          <Area
            clipPath="url(#clipPath)"
            type="monotone"
            dataKey="balance"
            stroke={flowData[flowData.length - 1]?.balance >= 0 ? "#22c55e" : "#ef4444"}
            fill="url(#splitColor)"
            strokeWidth={2}
            isAnimationActive={false}
            dot={false}
            activeDot={{ r: 6, stroke: '#fff', strokeWidth: 2 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

const TransactionTimeline = () => {
  const [address, setAddress] = useState('');
  const [transactions, setTransactions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isValidAddress, setIsValidAddress] = useState(true);

  const validateKaspaAddress = (addr: string) => {
    return addr.startsWith('kaspa:') && addr.length > 10;
  };

  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newAddress = e.target.value;
    setAddress(newAddress);
    setIsValidAddress(validateKaspaAddress(newAddress));
  };

  const fetchTransactions = async () => {
    if (!isValidAddress) {
      setError('Please enter a valid Kaspa address');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      const response = await fetch(`/api/transactions?address=${address}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch transactions');
      }
      
      const data = await response.json();
      setTransactions(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch transactions');
      console.error('Error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-col space-y-4">
        <div className="flex flex-row items-center justify-between">
          <CardTitle>Wallet Watcher</CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchTransactions}
            disabled={isLoading || !isValidAddress}
            className="flex items-center gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <Input
              placeholder="Enter Kaspa address (kaspa:...)"
              value={address}
              onChange={handleAddressChange}
              className={!isValidAddress && address ? 'border-destructive' : ''}
            />
            {!isValidAddress && address && (
              <p className="text-destructive text-sm mt-1">Please enter a valid Kaspa address starting with kaspa:</p>
            )}
          </div>
          <Button 
            onClick={fetchTransactions}
            disabled={!isValidAddress || isLoading}
            className="flex items-center gap-2"
          >
            <Search className="h-4 w-4" />
            Search
          </Button>
        </div>
        {!address && (
          <Alert>
            <AlertDescription>Enter a Kaspa address to view its balance flow</AlertDescription>
          </Alert>
        )}
      </CardHeader>
      <CardContent>
        {error ? (
          <div className="flex items-center gap-2 text-destructive bg-destructive/10 p-4 rounded-lg">
            <AlertCircle className="h-4 w-4" />
            <p>{error}</p>
          </div>
        ) : isLoading ? (
          <div className="flex items-center justify-center h-40">
            <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : transactions.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">
            {address ? 'No transactions found' : 'Enter an address to view transactions'}
          </p>
        ) : (
          <div className="space-y-8">
            <BalanceFlow
              transactions={transactions}
              mainAddress={address}
            />
            <div className="border-t pt-8">
              <TransactionList
                transactions={transactions}
                mainAddress={address}
              />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TransactionTimeline;