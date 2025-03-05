'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { navItems } from '@/components/navigation/NavBar';
import Link from 'next/link';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, TrendingUp, Clock, Star } from 'lucide-react';

export default function Home() {
  const analyticsTools = navItems.filter(item => 
    ['Wallet Profiler', 'Profit/Loss', 'Wallet Explorer'].includes(item.name)
  );
  
  const tradingTools = navItems.filter(item => 
    ['Charts', 'KRC-20', 'KRC Arb Calc'].includes(item.name)
  );
  
  const utilityTools = navItems.filter(item => 
    ['Airdrop Tool', 'Mint Watcher', 'Secret Tools'].includes(item.name)
  );

  return (
    <div className="space-y-12">
      <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-primary/20 via-primary/10 to-background p-8 md:p-10">
        <div className="relative z-10 max-w-3xl">
          <Badge className="mb-4" variant="outline">Kaspa Ecosystem</Badge>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
            Welcome to <span className="text-primary">Astro World</span>
          </h1>
          <p className="text-xl text-muted-foreground mb-6">
            Advanced analytics and tools to navigate the Kaspa ecosystem with confidence
          </p>
          <div className="flex flex-wrap gap-4">
            <Link href="/charts" className="inline-flex items-center bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 transition-colors">
              Explore Charts <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
            <Link href="/krc20-tokens" className="inline-flex items-center bg-secondary text-secondary-foreground px-4 py-2 rounded-md hover:bg-secondary/90 transition-colors">
              Browse KRC-20 Tokens
            </Link>
          </div>
        </div>
        
        <div className="absolute right-0 top-0 -translate-y-1/4 translate-x-1/4 opacity-20">
          <div className="w-96 h-96 rounded-full bg-primary blur-3xl" />
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-primary" />
          <h2 className="text-2xl font-bold">Trading Tools</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tradingTools.map((item) => (
            <Link key={item.name} href={item.href} className="group block">
              <Card className="h-full overflow-hidden border border-border bg-card hover:border-primary/50 transition-all duration-300">
                <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <div className="p-2 rounded-md bg-primary/10 text-primary">
                        {item.icon}
                      </div>
                      {item.name}
                    </CardTitle>
                    <ArrowRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription className="line-clamp-2">
                    {getToolDescription(item.name)}
                  </CardDescription>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Star className="h-5 w-5 text-primary" />
          <h2 className="text-2xl font-bold">Analytics Tools</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {analyticsTools.map((item) => (
            <Link key={item.name} href={item.href} className="group block">
              <Card className="h-full overflow-hidden border border-border bg-card hover:border-primary/50 transition-all duration-300">
                <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <div className="p-2 rounded-md bg-primary/10 text-primary">
                        {item.icon}
                      </div>
                      {item.name}
                    </CardTitle>
                    <ArrowRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription className="line-clamp-2">
                    {getToolDescription(item.name)}
                  </CardDescription>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
      
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Clock className="h-5 w-5 text-primary" />
          <h2 className="text-2xl font-bold">Utility Tools</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {utilityTools.map((item) => (
            <Link key={item.name} href={item.href} className="group block">
              <Card className="h-full overflow-hidden border border-border bg-card hover:border-primary/50 transition-all duration-300">
                <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <div className="p-2 rounded-md bg-primary/10 text-primary">
                        {item.icon}
                      </div>
                      {item.name}
                    </CardTitle>
                    <ArrowRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription className="line-clamp-2">
                    {getToolDescription(item.name)}
                  </CardDescription>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

function getToolDescription(toolName: string): string {
  const descriptions: Record<string, string> = {
    'Charts': 'Interactive price charts for KRC-20 tokens with multiple timeframes and indicators',
    'KRC-20': 'Browse and analyze KRC-20 tokens, market data, and trading volumes',
    'KRC Arb Calc': 'Calculate potential arbitrage opportunities across different Kaspa exchanges',
    'Wallet Profiler': 'Analyze wallet holdings, transaction history, and portfolio performance',
    'Profit/Loss': 'Track your trading performance and tax liabilities across different tokens',
    'Wallet Explorer': 'Explore wallet addresses, balance history, and transaction patterns',
    'Airdrop Tool': 'Manage and distribute token airdrops to multiple addresses efficiently',
    'Mint Watcher': 'Track new token mints and launches in real-time with alerts',
    'Secret Tools': 'Advanced tools and features for power users in the Kaspa ecosystem',
  };

  return descriptions[toolName] || `Access ${toolName.toLowerCase()} features and analytics`;
}