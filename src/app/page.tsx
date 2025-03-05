'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { navItems } from '@/components/navigation/NavBar';
import Link from 'next/link';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, TrendingUp, Clock, Star, Sparkles, BarChart3, Layers } from 'lucide-react';
import { useState, useEffect } from 'react';
import AnimatedParticles from '@/components/AnimatedParticles';

export default function Home() {
  const [isLoaded, setIsLoaded] = useState(false);
  
  useEffect(() => {
    setIsLoaded(true);
  }, []);

  const analyticsTools = navItems.filter(item => 
    ['Wallet Profiler', 'Profit/Loss', 'Wallet Explorer', 'Mint Watcher'].includes(item.name)
  );
  
  const tradingTools = navItems.filter(item => 
    ['Charts', 'KRC-20', 'KRC Arb Calc'].includes(item.name)
  );
  
  const utilityTools = navItems.filter(item => 
    ['Airdrop Tool', 'Secret Tools'].includes(item.name)
  );

  return (
    <div className={`space-y-6 ${isLoaded ? 'opacity-100' : 'opacity-0'} transition-opacity duration-700`}>
      <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-primary/30 via-primary/5 to-background p-3 md:p-6">
        <div className={`relative z-10 max-w-3xl transition-all duration-1000 transform ${isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
          <Badge className="mb-1 animate-pulse bg-primary/20 hover:bg-primary/30" variant="outline">
            <Sparkles className="w-3 h-3 mr-1" /> Kaspa Ecosystem
          </Badge>
          <h1 className="text-3xl md:text-5xl font-bold tracking-tight mb-2 text-primary">
            Welcome to <span className="relative">
              Astro World
              <span className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-blue-500 rounded-full"></span>
            </span>
          </h1>
          <p className="text-lg text-muted-foreground mb-3 max-w-2xl">
            Advanced analytics and tools to navigate the Kaspa ecosystem with confidence and precision
          </p>
          <div className="flex flex-wrap gap-3">
            <Link href="/charts" 
              className="group inline-flex items-center bg-gradient-to-r from-primary to-primary/80 text-primary-foreground px-4 py-2 rounded-md hover:shadow-lg hover:shadow-primary/20 transition-all duration-300">
              Explore Charts 
              <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link href="/krc20-tokens" 
              className="group inline-flex items-center bg-gradient-to-r from-primary to-primary/80 text-primary-foreground px-4 py-2 rounded-md hover:shadow-lg hover:shadow-primary/20 transition-all duration-300">
              Browse KRC-20
              <ArrowRight className="ml-2 h-4 w-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
            </Link>
            <Link href="/mint-watcher" 
              className="group inline-flex items-center bg-gradient-to-r from-primary to-primary/80 text-primary-foreground px-4 py-2 rounded-md hover:shadow-lg hover:shadow-primary/20 transition-all duration-300">
              Browse KRC-721
              <ArrowRight className="ml-2 h-4 w-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
            </Link>
          </div>
        </div>
        
        <div className="absolute right-0 top-0 -translate-y-1/4 translate-x-1/4 opacity-30 animate-pulse duration-7000">
          <div className="w-64 h-64 md:w-96 md:h-96 rounded-full bg-gradient-to-br from-primary to-blue-500 blur-3xl" />
        </div>
        
        <div className="absolute left-1/4 bottom-0 translate-y-1/2 opacity-20">
          <div className="w-40 h-40 md:w-64 md:h-64 rounded-full bg-green-400 blur-3xl animate-bounce duration-15000" />
        </div>
        
        {isLoaded && <AnimatedParticles />}
      </div>

      <div className={`space-y-3 transition-all duration-1000 delay-300 transform ${isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-12 opacity-0'}`}>
        <div className="flex items-center gap-2 mb-3">
          <div className="p-2 rounded-full bg-rose-100 dark:bg-rose-900/30">
            <TrendingUp className="h-5 w-5 text-rose-500" />
          </div>
          <h2 className="text-xl md:text-2xl font-bold">Trading Tools</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {tradingTools.map((item, index) => (
            <Link 
              key={item.name} 
              href={item.href} 
              className="group block"
              style={{ 
                transitionDelay: `${index * 100}ms`
              }}
            >
              <Card className="h-full min-h-24 overflow-hidden border border-border bg-card hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 relative">
                <div className="absolute inset-0 bg-gradient-to-br from-rose-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="absolute -inset-1 rounded-xl bg-gradient-to-r from-rose-500/10 via-primary/10 to-violet-500/10 opacity-0 group-hover:opacity-100 blur group-hover:animate-spin-slow transition-opacity duration-500" />
                <CardHeader className="pb-2 pt-3 px-4 relative">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base md:text-lg flex items-center gap-2">
                      <div className="p-1.5 rounded-md bg-rose-100 dark:bg-rose-900/30 text-rose-500 group-hover:scale-110 transition-transform">
                        {item.icon}
                      </div>
                      {item.name}
                    </CardTitle>
                    <ArrowRight className="h-4 w-4 text-rose-500 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                  </div>
                </CardHeader>
                <CardContent className="relative px-4 pb-4">
                  <CardDescription className="line-clamp-2 text-xs md:text-sm">
                    {getToolDescription(item.name)}
                  </CardDescription>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      <div className={`space-y-3 transition-all duration-1000 delay-500 transform ${isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-12 opacity-0'}`}>
        <div className="flex items-center gap-2 mb-3">
          <div className="p-2 rounded-full bg-blue-100 dark:bg-blue-900/30">
            <BarChart3 className="h-5 w-5 text-blue-500" />
          </div>
          <h2 className="text-xl md:text-2xl font-bold">Analytics Tools</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {analyticsTools.map((item, index) => (
            <Link 
              key={item.name} 
              href={item.href} 
              className="group block" 
              style={{ 
                transitionDelay: `${index * 100}ms`
              }}
            >
              <Card className="h-full min-h-24 overflow-hidden border border-border bg-card hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 relative">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="absolute -inset-1 rounded-xl bg-gradient-to-r from-blue-500/10 via-primary/10 to-green-500/10 opacity-0 group-hover:opacity-100 blur group-hover:animate-spin-slow transition-opacity duration-500" />
                <CardHeader className="pb-2 pt-3 px-4 relative">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base md:text-lg flex items-center gap-2">
                      <div className="p-1.5 rounded-md bg-blue-100 dark:bg-blue-900/30 text-blue-500 group-hover:scale-110 transition-transform">
                        {item.icon}
                      </div>
                      {item.name}
                    </CardTitle>
                    <ArrowRight className="h-4 w-4 text-blue-500 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                  </div>
                </CardHeader>
                <CardContent className="relative px-4 pb-4">
                  <CardDescription className="line-clamp-2 text-xs md:text-sm">
                    {getToolDescription(item.name)}
                  </CardDescription>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
      
      <div className={`space-y-3 transition-all duration-1000 delay-700 transform ${isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-12 opacity-0'}`}>
        <div className="flex items-center gap-2 mb-3">
          <div className="p-2 rounded-full bg-emerald-100 dark:bg-emerald-900/30">
            <Layers className="h-5 w-5 text-emerald-500" />
          </div>
          <h2 className="text-xl md:text-2xl font-bold">Utility Tools</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {utilityTools.map((item, index) => (
            <Link 
              key={item.name} 
              href={item.href} 
              className="group block"
              style={{ 
                transitionDelay: `${index * 100}ms`
              }}
            >
              <Card className="h-full min-h-24 overflow-hidden border border-border bg-card hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 relative">
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="absolute -inset-1 rounded-xl bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-green-500/10 opacity-0 group-hover:opacity-100 blur group-hover:animate-spin-slow transition-opacity duration-500" />
                <CardHeader className="pb-2 pt-3 px-4 relative">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base md:text-lg flex items-center gap-2">
                      <div className="p-1.5 rounded-md bg-emerald-100 dark:bg-emerald-900/30 text-emerald-500 group-hover:scale-110 transition-transform">
                        {item.icon}
                      </div>
                      {item.name}
                    </CardTitle>
                    <ArrowRight className="h-4 w-4 text-emerald-500 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                  </div>
                </CardHeader>
                <CardContent className="relative px-4 pb-4">
                  <CardDescription className="line-clamp-2 text-xs md:text-sm">
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