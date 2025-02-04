'use client';

import { useState, useEffect, SetStateAction } from 'react';
import { useTheme } from 'next-themes';
import { TokenTable } from '@/components/TokenTable';
import { Card, CardContent, CardHeader, CardTitle, } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { PieChart, Pie, Bar, BarChart, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis, Legend } from 'recharts';
import { Loader2, Search, Wallet } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useWallet } from '@/context/WalletContext';

interface TokenPrice {
  floorPrice: number;
  priceInUsd: number;
  marketCapInUsd: number;
  change24h: number;
  change24hInKas: number;
}

interface TokenData {
  balance: string;
  ticker: string;
  decimal: string;
  locked: string;
  opScoreMod: string;
  price?: TokenPrice;
  iconUrl?: string;
}

interface TokenBalance {
  ticker: string;
  balance: string;
  balanceUsd: number;
  balanceKas: number;
  price: TokenPrice;
  percentage: number;
  iconUrl?: string;
  change24h: number;
}

const COLORS = [
  '#3b82f6',
  '#22c55e',
  '#eab308',
  '#ef4444',
  '#8b5cf6',
  '#ec4899',
  '#f97316',
  '#06b6d4',
  '#14b8a6',
  '#f59e0b',
];

const AUTO_REFRESH_INTERVAL = 1200000; // 20 minutes

export default function WalletProfiler() {
  const { theme } = useTheme();
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [tokenBalances, setTokenBalances] = useState<TokenBalance[]>([]);
  const [totalValueKas, setTotalValueKas] = useState(0);
  const [totalValueUsd, setTotalValueUsd] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [searchAddress, setSearchAddress] = useState('');
  const { walletConnected, walletInfo } = useWallet();
  const chartBorderColor =
    theme === 'dark' ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.2)';
  const tooltipBackground =
    theme === 'dark' ? 'rgba(0, 0, 0, 0.8)' : 'rgba(255, 255, 255, 0.9)';
  const tooltipTextColor = theme === 'dark' ? 'white' : 'black';

  const fetchWalletData = async (address?: string) => {
    if (!searchAddress) return;

    try {
      setLoading(true);
      setError(null);

      const kasResponse = await fetch(
        `https://api.kaspa.org/addresses/${searchAddress}/balance`
      );
      if (!kasResponse.ok) throw new Error('Failed to fetch KAS balance');
      const kasData = await kasResponse.json();
      const kasBalance = kasData.balance / 100000000;

      const kasPriceResponse = await fetch(
        'https://api.kaspa.org/info/price?stringOnly=false'
      );
      if (!kasPriceResponse.ok) throw new Error('Failed to fetch Kaspa price');
      const kasPriceData = await kasPriceResponse.json();
      const kasPrice = kasPriceData.price;

      const response = await fetch(
        `https://api-v2-do.kas.fyi/addresses/${searchAddress}/tokens`
      );
      if (!response.ok) throw new Error('Failed to fetch token data');
      const tokenData = await response.json();

      const processedBalances = [
        {
          ticker: 'KAS',
          balance: kasBalance.toFixed(6),
          balanceUsd: kasBalance * kasPrice,
          balanceKas: kasBalance,
          price: {
            floorPrice: 1,
            priceInUsd: kasPrice,
            marketCapInUsd: 0,
            change24h: 0,
            change24hInKas: 0,
          },
          percentage: 0,
          iconUrl: 'https://krc20-assets.kas.fyi/icons/KAS.jpg',
          change24h: 0,
        },
      ];

      const tokenBalances = tokenData.map(
        (token: {
          balance: string;
          decimal: string;
          price: { floorPrice: number; priceInUsd: number; change24h: any };
          ticker: any;
          iconUrl: any;
        }) => {
          const balance =
            parseFloat(token.balance) / Math.pow(10, parseInt(token.decimal));
          const balanceKas = token.price
            ? balance * token.price.floorPrice
            : 0;
          const balanceUsd = token.price
            ? balance * token.price.priceInUsd
            : 0;

          return {
            ticker: token.ticker,
            balance: balance.toFixed(6),
            balanceUsd,
            balanceKas,
            price: token.price || {
              floorPrice: 0,
              priceInUsd: 0,
              marketCapInUsd: 0,
              change24h: 0,
              change24hInKas: 0,
            },
            percentage: 0,
            iconUrl: token.iconUrl,
            change24h: token.price?.change24h || 0,
          };
        }
      );

      const allBalances = [...processedBalances, ...tokenBalances];
      const totalKas = allBalances.reduce(
        (sum, token) => sum + token.balanceKas,
        0
      );
      const totalUsd = allBalances.reduce(
        (sum, token) => sum + token.balanceUsd,
        0
      );
      const balancesWithPercentages = allBalances
        .map((token) => ({
          ...token,
          percentage: totalKas > 0 ? (token.balanceKas / totalKas) * 100 : 0,
        }))
        .sort((a, b) => b.balanceKas - a.balanceKas);

      setTokenBalances(balancesWithPercentages);
      setTotalValueKas(totalKas);
      setTotalValueUsd(totalUsd);
    } catch (error) {
      console.error('Error:', error);
      setError(
        error instanceof Error ? error.message : 'Failed to load wallet data'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (address) {
      fetchWalletData(address);
      const interval = setInterval(
        () => fetchWalletData(address),
        AUTO_REFRESH_INTERVAL
      );
      return () => clearInterval(interval);
    }
  }, [address]);

  const handleSearchClick = () => {
    setAddress(searchAddress);
  };

  const handleInputChange = (e: {
    target: { value: SetStateAction<string> };
  }) => {
    setSearchAddress(e.target.value);
  };

  const chartData = tokenBalances
    .filter((token) => token.balanceKas > 0)
    .map((token) => ({
      name: token.ticker,
      value: token.balanceKas,
    }));

  const handleMyWalletClick = () => {
    if (walletInfo?.address) {
      setSearchAddress(walletInfo.address);
      setAddress(walletInfo.address);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-3">
            <Input
              placeholder="Enter Kaspa Address"
              value={searchAddress}
              onChange={handleInputChange}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleSearchClick();
                }
              }}
              className="flex-1"
            />
            <div className="flex gap-2">
              {walletConnected && walletInfo && (
                <Button
                  variant="outline"
                  onClick={handleMyWalletClick}
                  className="whitespace-nowrap"
                >
                  <Wallet className="h-4 w-4 mr-2" />
                  My Wallet
                </Button>
              )}
              <Button
                onClick={handleSearchClick}
                disabled={!searchAddress || loading}
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <Search className="h-4 w-4 mr-2" />
                    Search
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {loading && !tokenBalances.length ? (
        <Card>
          <CardContent className="p-2-">
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="h-8 w-8 animate-spin" />
              <p className="text-sm text-muted-foreground">
                Loading wallet data...
              </p>
            </div>
          </CardContent>
        </Card>
      ) : tokenBalances.length > 0 ? (
        <>
          <Card>
            <CardHeader>
              <CardTitle>Market Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {tokenBalances
                  .filter((token) => token.price?.marketCapInUsd > 0)
                  .map((token) => (
                    <Card
                      key={token.ticker}
                      className={cn(
                        'relative overflow-hidden',
                        token.change24h > 0
                          ? 'bg-green-500/5'
                          : token.change24h < 0
                            ? 'bg-red-500/5'
                            : ''
                      )}
                    >
                      <CardContent className="pt-2">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            {token.iconUrl && (
                              <img
                                src={token.iconUrl}
                                alt={token.ticker}
                                className="w-8 h-8 rounded-full"
                              />
                            )}
                            <div>
                              <div className="font-bold">{token.ticker}</div>
                              <div
                                className={cn(
                                  'text-sm',
                                  token.change24h > 0
                                    ? 'text-green-500'
                                    : token.change24h < 0
                                      ? 'text-red-500'
                                      : ''
                                )}
                              >
                                {token.change24h > 0 ? '+' : ''}
                                {token.change24h.toFixed(2)}%
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-sm font-mono">
                              ${token.price.priceInUsd.toFixed(6)}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {token.price.floorPrice.toFixed(8)} KAS
                            </div>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <div className="h-1 bg-muted rounded-full overflow-hidden">
                            <div
                              className={cn(
                                'h-full transition-all duration-500',
                                token.change24h > 0
                                  ? 'bg-green-500'
                                  : 'bg-red-500'
                              )}
                              style={{
                                width: `${Math.min(
                                  Math.abs(token.change24h),
                                  100
                                )}%`,
                                opacity: 0.5,
                              }}
                            />
                          </div>
                          <div className="flex justify-between text-xs text-muted-foreground">
                            <span>Market Cap</span>
                            <span className="font-mono">
                              $
                              {token.price.marketCapInUsd.toLocaleString(
                                undefined,
                                {
                                  maximumFractionDigits: 0,
                                }
                              )}
                            </span>
                          </div>
                          <div className="flex justify-between text-xs text-muted-foreground">
                            <span>Your Holdings</span>
                            <span className="font-mono">
                              $
                              {token.balanceUsd.toLocaleString(undefined, {
                                maximumFractionDigits: 2,
                              })}
                            </span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <div className="flex flex-col lg:flex-row gap-8">
                <div
                  className="no-scrollbar modern-scrollbar relative w-full overflow-y-auto lg:w-[900px]"
                  style={{ maxHeight: '800px' }}
                >
                  <TokenTable
                    tokens={tokenBalances}
                    totalValueKas={totalValueKas}
                    totalValueUsd={totalValueUsd}
                  />
                </div>

                <div className="flex-1">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm">
                        Portfolio Distribution
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={chartData}
                              innerRadius={60}
                              outerRadius={80}
                              paddingAngle={2}
                              dataKey="value"
                            >
                              {chartData.map((entry, index) => (
                                <Cell
                                  key={`cell-${index}`}
                                  fill={COLORS[index % COLORS.length]}
                                  stroke={chartBorderColor}
                                />
                              ))}
                            </Pie>
                            <Tooltip
                              formatter={(value: number) => [
                                `${value.toFixed(2)} KAS`,
                                'Value',
                              ]}
                              contentStyle={{
                                backgroundColor: tooltipBackground,
                                border: 'none',
                                borderRadius: '4px',
                                color: tooltipTextColor,
                              }}
                            />
                            <Legend
                              layout="vertical"
                              align="right"
                              verticalAlign="middle"
                              wrapperStyle={{ fontSize: '12px' }}
                            />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="mt-4">
                    <CardHeader>
                      <CardTitle className="text-sm">
                        24h Performance
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart
                            data={tokenBalances.filter(
                              (t) => t.price?.change24h !== 0
                            )}
                            layout="vertical"
                            margin={{ top: 5, right: 30, left: 60, bottom: 5 }}
                          >
                            <XAxis type="number" domain={['auto', 'auto']} />
                            <YAxis
                              type="category"
                              dataKey="ticker"
                              width={60}
                            />
                            <Tooltip
                              formatter={(value: number) =>
                                `${value.toFixed(2)}%`
                              }
                              contentStyle={{
                                backgroundColor: tooltipBackground,
                                border: 'none',
                                borderRadius: '4px',
                                color: tooltipTextColor,
                              }}
                              cursor={{ fill: 'transparent' }}
                            />
                            <Bar
                              dataKey="change24h"
                              minPointSize={2}
                              fill="#8884d8"
                            >
                              {tokenBalances
                                .filter((t) => t.price?.change24h !== 0)
                                .map((entry, index) => (
                                  <Cell
                                    key={`cell-${index}`}
                                    fill={
                                      entry.change24h >= 0
                                        ? '#22c55e'
                                        : '#ef4444'
                                    }
                                  />
                                ))}
                            </Bar>
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </CardContent>
          </Card>


        </>
      ) : null}
    </div>
  );
}