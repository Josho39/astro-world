'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useWallet } from '@/context/WalletContext';
import { ArrowRightIcon, TrendingUpIcon, Wallet, Banknote, LineChart, Star, Calculator, Coins, Palette, ArrowUpRight, ArrowDownRight, ChevronRight, Percent, Clock, AlertCircle, Search, RefreshCw, Eye } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function Home() {
  const { walletConnected, walletInfo, connectWallet } = useWallet();
  const [isLoading, setIsLoading] = useState(true);
  const [marketData, setMarketData] = useState<any[]>([]);
  const [arbOpportunities, setArbOpportunities] = useState<any[]>([]);
  const [recentMints, setRecentMints] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        await new Promise(resolve => setTimeout(resolve, 500));

        setMarketData([
          { name: 'BURT', price: '0.0321', change: 2.4 },
          { name: 'KOKO', price: '0.0045', change: -3.8 },
          { name: 'NACHO', price: '0.0078', change: 5.6 },
          { name: 'VANA', price: '0.0192', change: -1.2 },
          { name: 'KPUNK', price: '0.0103', change: 7.2 },
          { name: 'KASPE', price: '0.0056', change: -2.1 },
          { name: 'COCO', price: '0.0009', change: 1.3 },
          { name: 'BOBS', price: '0.0025', change: -0.8 }
        ]);

        setArbOpportunities([
          { token: 'BURT', percentage: 4.2, fromExchange: 'MEXC', toExchange: 'GuacSwap' },
          { token: 'KOKO', percentage: 3.8, fromExchange: 'XT', toExchange: 'CoinEx' },
          { token: 'NACHO', percentage: 2.9, fromExchange: 'Biconomy', toExchange: 'MEXC' },
          { token: 'VANA', percentage: 2.1, fromExchange: 'CoinEx', toExchange: 'GuacSwap' }
        ]);

        setRecentMints([
          { id: 142, collection: 'KPUNK', time: '5m ago' },
          { id: 78, collection: 'KSNAKE', time: '12m ago' },
          { id: 203, collection: 'KASPAD', time: '27m ago' },
          { id: 55, collection: 'KPIG', time: '39m ago' },
          { id: 91, collection: 'KPUNK', time: '52m ago' },
          { id: 114, collection: 'KASPAD', time: '1h ago' }
        ]);
      } catch (error) {
        console.error("Error loading data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  const handleRefresh = () => {
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 500);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background/95 flex flex-col">
      <header className="py-3 px-3 relative overflow-hidden border-b border-border/30">
        <div className="relative z-10 w-full">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center">
              <div className="h-10 w-10 bg-primary/10 rounded-lg flex items-center justify-center shadow-md mr-3">
                <Image src="/logo.png" alt="Astro World" width={24} height={24} className="object-contain" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Astro World</h1>
                <p className="text-xs text-muted-foreground">Dashboard</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search..."
                  className="pl-8 h-8 bg-background/80 border-primary/20 w-full md:w-[200px]"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                />
              </div>

              <Button
                onClick={handleRefresh}
                disabled={isLoading}
                size="sm"
                variant="outline"
                className="h-8"
              >
                {isLoading ? (
                  <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <RefreshCw className="h-3.5 w-3.5" />
                )}
              </Button>

              {!walletConnected ? (
                <Button
                  onClick={connectWallet}
                  size="sm"
                  className="h-8"
                >
                  <Wallet className="h-3.5 w-3.5 mr-1.5" />
                  Connect Wallet
                </Button>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8"
                >
                  <Wallet className="h-3.5 w-3.5 mr-1.5" />
                  <span className="text-green-500 font-medium">{walletInfo?.balance} KAS</span>
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 p-3 flex flex-col">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 flex-1">
          <div className="flex flex-col gap-3">
            <Card className="p-3 overflow-hidden flex-1">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-bold flex items-center">
                  <TrendingUpIcon className="w-4 h-4 mr-1.5 text-emerald-500" />
                  Market Overview
                </h3>
                <Link href="/krc20-tokens" className="text-xs text-muted-foreground hover:text-primary flex items-center">
                  View All <ChevronRight className="w-3 h-3 ml-1" />
                </Link>
              </div>

              <div className="space-y-1.5 overflow-auto max-h-[calc(100vh-230px)]">
                {marketData.map((token, index) => (
                  <Link href={`/charts?ticker=${token.name}`} key={token.name} className="flex items-center justify-between p-2 border border-border/40 rounded-md hover:bg-accent/30 transition-colors">
                    <div className="flex items-center">
                      <div className="w-7 h-7 rounded-md bg-background mr-2 flex items-center justify-center overflow-hidden">
                        <Image src={`/tokens/${token.name.toLowerCase()}.jpg`} width={28} height={28} alt={token.name}
                          className="object-cover"
                          onError={(e) => (e.currentTarget.src = `/tokens/krc20.jpg`)}
                        />
                      </div>
                      <span className="font-medium">{token.name}</span>
                    </div>
                    <div className="flex flex-col items-end">
                      <span>${token.price}</span>
                      <span className={token.change >= 0 ? 'text-green-500 flex items-center text-xs' : 'text-red-500 flex items-center text-xs'}>
                        {token.change >= 0 ? <ArrowUpRight className="w-3 h-3 mr-0.5" /> : <ArrowDownRight className="w-3 h-3 mr-0.5" />}
                        {Math.abs(token.change)}%
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </Card>

            <Card className="p-3 overflow-hidden">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-bold flex items-center">
                  <LineChart className="w-4 h-4 mr-1.5 text-blue-500" />
                  Featured Chart
                </h3>
                <Link href="/charts" className="text-xs text-muted-foreground hover:text-primary flex items-center">
                  View Charts <ChevronRight className="w-3 h-3 ml-1" />
                </Link>
              </div>

              <div className="h-[180px] bg-muted/20 rounded-md overflow-hidden relative border border-border/30">
                <div className="absolute inset-0 flex items-center justify-center">
                  <Image src="/previews/price-chart.png" alt="Price Chart" fill className="object-cover opacity-90 hover:opacity-100 transition-opacity" />
                </div>
              </div>
              <div className="mt-2 text-xs flex items-center justify-between">
                <span className="text-muted-foreground flex items-center"><Clock className="w-3 h-3 mr-1" /> Updated 5 minutes ago</span>
                <Link href="/charts?ticker=BURT" className="text-primary hover:underline flex items-center">
                  View BURT Charts <ArrowRightIcon className="w-3 h-3 ml-1" />
                </Link>
              </div>
            </Card>
          </div>

          <div className="flex flex-col gap-3">
            <Card className="p-3 overflow-hidden">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-bold flex items-center">
                  <Palette className="w-4 h-4 mr-1.5 text-amber-500" />
                  Recent NFT Mints
                </h3>
                <Link href="/mint-watcher" className="text-xs text-muted-foreground hover:text-primary flex items-center">
                  View All <ChevronRight className="w-3 h-3 ml-1" />
                </Link>
              </div>

              <div className="grid grid-cols-3 gap-2">
                {recentMints.map((mint, index) => (
                  <div key={index} className="relative">
                    <div className="aspect-square rounded-md overflow-hidden border border-border/40">
                      <Image
                        src={`/previews/nft${(index % 4) + 1}.jpg`}
                        alt="NFT"
                        width={120}
                        height={120}
                        className="w-full h-full object-cover"
                        onError={(e) => (e.currentTarget.src = `/previews/nft-placeholder.jpg`)}
                      />
                    </div>
                    <div className="absolute top-1 right-1 bg-black/50 backdrop-blur-sm text-white text-xs px-1.5 py-0.5 rounded">
                      #{mint.id}
                    </div>
                    <div className="absolute bottom-1 left-1 bg-primary/70 backdrop-blur-sm text-white text-xs px-1.5 py-0.5 rounded-sm">
                      {mint.collection}
                    </div>
                    <div className="absolute top-1 left-1 bg-black/50 backdrop-blur-sm text-white text-xs px-1.5 py-0.5 rounded flex items-center">
                      <Clock className="w-3 h-3 mr-0.5" />
                      {mint.time}
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="p-3 overflow-hidden flex-1">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-bold flex items-center">
                  <Calculator className="w-4 h-4 mr-1.5 text-blue-500" />
                  Arbitrage Opportunities
                </h3>
                <Link href="/krc-arb-tracker" className="text-xs text-muted-foreground hover:text-primary flex items-center">
                  View All <ChevronRight className="w-3 h-3 ml-1" />
                </Link>
              </div>

              <div className="space-y-2 overflow-y-auto max-h-[calc(100vh-450px)]">
                {arbOpportunities.map((arb, index) => (
                  <div key={index} className="flex items-center justify-between p-2 border border-border/40 rounded-md">
                    <div className="flex items-center">
                      <div className="w-7 h-7 rounded-md bg-background mr-2 flex items-center justify-center overflow-hidden">
                        <Image
                          src={`/tokens/${arb.token.toLowerCase()}.jpg`}
                          width={28}
                          height={28}
                          alt={arb.token}
                          className="object-cover"
                          onError={(e) => (e.currentTarget.src = `/tokens/krc20.jpg`)}
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
                ))}

                <div className="h-[120px] bg-muted/20 rounded-md overflow-hidden relative border border-border/30 mt-3">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Image src="/previews/arbitrage.png" alt="Arbitrage Opportunities" fill className="object-cover opacity-90 hover:opacity-100 transition-opacity" />
                  </div>
                </div>
              </div>
            </Card>
          </div>

          <div className="flex flex-col gap-3">
            {walletConnected && walletInfo ? (
              <Card className="p-3 overflow-hidden flex-1">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-bold flex items-center">
                    <Wallet className="w-4 h-4 mr-1.5 text-violet-500" />
                    Your Wallet
                  </h3>
                  <Link href="/wallet-profiler" className="text-xs text-muted-foreground hover:text-primary flex items-center">
                    Full Analysis <ChevronRight className="w-3 h-3 ml-1" />
                  </Link>
                </div>

                <div className="flex flex-col">
                  <div className="bg-violet-500/5 rounded-md p-2 border border-violet-500/20 mb-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">Address</span>
                      <span className="text-xs text-violet-500">Copy</span>
                    </div>
                    <div className="font-mono text-xs truncate mt-1">{walletInfo.address}</div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 mb-3">
                    <div className="bg-primary/5 rounded-md p-2 border border-primary/20">
                      <div className="text-xs text-muted-foreground">Balance</div>
                      <div className="text-lg font-bold text-primary">{walletInfo.balance} KAS</div>
                    </div>

                    <div className="bg-green-500/5 rounded-md p-2 border border-green-500/20">
                      <div className="text-xs text-muted-foreground">USD Value</div>
                      <div className="text-lg font-bold text-green-500">${(walletInfo.balance * 0.024).toFixed(2)}</div>
                    </div>
                  </div>

                  <div className="h-[200px] bg-muted/20 rounded-md overflow-hidden relative border border-border/30 mb-3">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Image src="/previews/portfolio.png" alt="Portfolio Distribution" fill className="object-cover opacity-90 hover:opacity-100 transition-opacity" />
                    </div>
                  </div>

                  <div className="space-y-2 overflow-auto max-h-[calc(100vh-450px)]">
                    <h4 className="text-xs font-medium mb-1">Your Tokens</h4>
                    {[
                      { token: 'BURT', balance: '12,500', value: '$401.25' },
                      { token: 'NACHO', balance: '8,320', value: '$64.90' },
                      { token: 'KPUNK', balance: '3', value: 'NFT' }
                    ].map((token, index) => (
                      <div key={index} className="flex items-center justify-between p-2 border border-border/40 rounded-md">
                        <div className="flex items-center">
                          <div className="w-7 h-7 rounded-md bg-background mr-2 flex items-center justify-center overflow-hidden">
                            <Image
                              src={`/tokens/${token.token.toLowerCase()}.jpg`}
                              width={28}
                              height={28}
                              alt={token.token}
                              className="object-cover"
                              onError={(e) => (e.currentTarget.src = `/tokens/krc20.jpg`)}
                            />
                          </div>
                          <span className="font-medium">{token.token}</span>
                        </div>
                        <div className="flex flex-col items-end">
                          <span>{token.balance}</span>
                          <span className="text-xs text-muted-foreground">{token.value}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </Card>
            ) : (
              <>
                <Card className="p-3 overflow-hidden">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-bold flex items-center">
                      <AlertCircle className="w-4 h-4 mr-1.5 text-orange-500" />
                      Connect Your Wallet
                    </h3>
                  </div>

                  <div className="flex flex-col items-center justify-center p-4 text-center">
                    <Wallet className="w-12 h-12 text-muted-foreground mb-3" />
                    <p className="text-sm mb-3">Connect your wallet to see your portfolio, tokens, and analyze your holdings</p>
                    <Button onClick={connectWallet} className="w-full">
                      Connect Wallet
                    </Button>
                  </div>
                </Card>

                <Card className="p-3 overflow-hidden flex-1">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-bold flex items-center">
                      <Star className="w-4 h-4 mr-1.5 text-amber-500" />
                      Quick Actions
                    </h3>
                  </div>

                  <div className="grid gap-2">
                    <QuickActionButton
                      icon={<LineChart className="w-4 h-4 text-blue-500" />}
                      title="Charts"
                      description="View price charts and indicators"
                      href="/charts"
                      color="blue"
                    />

                    <QuickActionButton
                      icon={<Palette className="w-4 h-4 text-amber-500" />}
                      title="NFT Explorer"
                      description="Browse NFT collections and mints"
                      href="/krc721-tokens"
                      color="amber"
                    />

                    <QuickActionButton
                      icon={<Coins className="w-4 h-4 text-emerald-500" />}
                      title="KRC-20 Tokens"
                      description="View token prices and markets"
                      href="/krc20-tokens"
                      color="emerald"
                    />

                    <QuickActionButton
                      icon={<Calculator className="w-4 h-4 text-violet-500" />}
                      title="Arbitrage Calculator"
                      description="Find cross-exchange opportunities"
                      href="/krc-arb-tracker"
                      color="violet"
                    />

                    <QuickActionButton
                      icon={<Eye className="w-4 h-4 text-pink-500" />}
                      title="Wallet Explorer"
                      description="Explore any wallet's transactions"
                      href="/wallet-explorer"
                      color="pink"
                    />

                    <QuickActionButton
                      icon={<Banknote className="w-4 h-4 text-green-500" />}
                      title="Profit/Loss"
                      description="Track trading performance"
                      href="/profit-loss"
                      color="green"
                    />
                  </div>
                </Card>
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

function QuickActionButton({ icon, title, description, href, color }: {
  icon: React.ReactNode;
  title: string;
  description: string;
  href: string;
  color: string;
}) {
  return (
    <Link href={href}>
      <div className={`flex items-center p-2 rounded-md border border-${color}-500/20 bg-${color}-500/5 hover:bg-${color}-500/10 transition-colors group`}>
        <div className="mr-3">{icon}</div>
        <div className="flex-1">
          <h4 className="font-medium text-sm">{title}</h4>
          <p className="text-xs text-muted-foreground">{description}</p>
        </div>
        <ArrowRightIcon className={`w-3.5 h-3.5 text-${color}-500 opacity-0 group-hover:opacity-100 transition-opacity group-hover:translate-x-1 transition-transform`} />
      </div>
    </Link>
  );
}