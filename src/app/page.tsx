'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { navItems } from '@/components/navigation/NavBar';
import { ArrowRightIcon, TrendingUpIcon, BarChart3Icon, Wallet, Banknote, Box, Eye, LineChart, Star, Lock, Calculator, Coins, Palette } from 'lucide-react';

export default function Home() {
  const krc20Items = navItems.filter(item => item.category === 'krc20');
  const krc721Items = navItems.filter(item => item.category === 'krc721');
  const utilityItems = navItems.filter(item => item.category === 'utility');

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background/80">
      <div className="absolute inset-0 bg-grid-small-pattern opacity-5 pointer-events-none"></div>
      
      <header className="pt-6 pb-6 px-4 relative overflow-hidden">
        <div className="absolute -top-32 -right-32 w-64 h-64 bg-primary/5 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 -left-32 w-64 h-64 bg-primary/5 rounded-full blur-3xl"></div>
        
        <div className="max-w-5xl mx-auto relative z-10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="flex items-center"
            >
              <div className="h-14 w-14 bg-primary/10 rounded-2xl flex items-center justify-center shadow-lg mr-4">
                <Image src="/logo.png" alt="Astro World" width={34} height={34} className="object-contain" />
              </div>
              <div>
                <motion.h1 
                  initial={{ y: 10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.1, duration: 0.4 }}
                  className="text-3xl md:text-4xl font-bold"
                >
                  Astro World
                </motion.h1>
                <motion.p 
                  initial={{ y: 10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.2, duration: 0.4 }}
                  className="text-muted-foreground"
                >
                  Advanced tools for Kaspa blockchain
                </motion.p>
              </div>
            </motion.div>
            
            <motion.div 
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.4 }}
              className="flex flex-wrap gap-3"
            >
              <Link href="/krc20-tokens" className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors">
                <Coins className="w-4 h-4" />
                <span>KRC-20 Tokens</span>
              </Link>
              <Link href="/krc721-tokens" className="inline-flex items-center gap-2 px-4 py-2 bg-background border border-input rounded-lg font-medium hover:bg-accent hover:text-accent-foreground transition-colors">
                <Palette className="w-4 h-4" />
                <span>NFT Collections</span>
              </Link>
            </motion.div>
          </div>
        </div>
      </header>
      
      <main className="px-4 pb-16 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 mt-6">
          <FeatureCard 
            title="KRC-20 Markets"
            description="Track token prices, market data, and trading volumes in real-time."
            icon={<TrendingUpIcon />}
            color="emerald"
            delay={0.1}
            href="/krc20-tokens"
          />
          
          <FeatureCard 
            title="NFT Collections"
            description="Explore KRC-721 collections, monitor mints and track ownership."
            icon={<Palette />}
            color="amber" 
            delay={0.2}
            href="/krc721-tokens"
          />
          
          <FeatureCard 
            title="Wallet Tools"
            description="Analyze holdings, track performance and monitor transactions."
            icon={<Wallet />}
            color="violet"
            delay={0.3}
            href="/wallet-profiler"
          />
        </div>
        
        <section className="mb-10">
          <SectionHeader title="KRC-20 Tools" icon={<Coins className="w-6 h-6" />} color="emerald" />
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {krc20Items.map((item, index) => (
              <ToolCard
                key={index}
                name={item.name}
                icon={item.icon}
                href={item.href}
                description={getToolDescription(item.name)}
                delay={0.05 * index}
                color="emerald"
              />
            ))}
          </div>
        </section>
        
        <section className="mb-10">
          <SectionHeader title="KRC-721 Tools" icon={<Palette className="w-6 h-6" />} color="amber" />
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {krc721Items.map((item, index) => (
              <ToolCard
                key={index}
                name={item.name}
                icon={item.icon}
                href={item.href}
                description={getToolDescription(item.name)}
                delay={0.05 * index}
                color="amber"
              />
            ))}
          </div>
        </section>
        
        <section className="mb-10">
          <SectionHeader title="Utility Tools" icon={<Wallet className="w-6 h-6" />} color="violet" />
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {utilityItems.map((item, index) => (
              <ToolCard
                key={index}
                name={item.name}
                icon={item.icon}
                href={item.href}
                description={getToolDescription(item.name)}
                delay={0.05 * index}
                color="violet"
              />
            ))}
          </div>
        </section>
        
        <section className="bg-card border border-border rounded-xl p-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h2 className="text-xl font-bold mb-2">Ready to dive deeper?</h2>
              <p className="text-muted-foreground mb-4 md:mb-0">Explore our full suite of tools and unlock the power of Kaspa analytics.</p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Link href="/wallet-profiler" className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors justify-center">
                <Wallet className="w-4 h-4" />
                <span>Analyze Wallet</span>
              </Link>
              <Link href="/charts" className="inline-flex items-center gap-2 px-4 py-2 bg-background border border-input rounded-lg font-medium hover:bg-accent hover:text-accent-foreground transition-colors justify-center">
                <BarChart3Icon className="w-4 h-4" />
                <span>View Charts</span>
              </Link>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

function SectionHeader({ title, icon, color }: { title: string, icon: React.ReactNode, color: string }) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4 }}
      className="flex items-center mb-4"
    >
      <div className={`w-9 h-9 mr-3 rounded-lg bg-${color}-500/10 flex items-center justify-center text-${color}-500`}>
        {icon}
      </div>
      <h2 className="text-xl font-bold">{title}</h2>
    </motion.div>
  );
}

function FeatureCard({ title, description, icon, color, delay, href }: { 
  title: string, 
  description: string, 
  icon: React.ReactNode, 
  color: string,
  delay: number,
  href: string
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
    >
      <Link href={href} className="block h-full">
        <div className={`h-full bg-${color}-500/5 hover:bg-${color}-500/10 border border-${color}-500/20 backdrop-blur-sm rounded-xl p-5 transition-all duration-300 group`}>
          <div className={`w-10 h-10 mb-3 rounded-lg bg-${color}-500/10 flex items-center justify-center text-${color}-500`}>
            {icon}
          </div>
          <h3 className={`text-lg font-bold mb-2 group-hover:text-${color}-600 dark:group-hover:text-${color}-400 transition-colors`}>{title}</h3>
          <p className="text-muted-foreground text-sm mb-3">{description}</p>
          <div className={`flex items-center text-${color}-500 font-medium text-sm`}>
            <span>Explore</span>
            <ArrowRightIcon className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

function ToolCard({ name, icon, href, description, delay, color }: { 
  name: string, 
  icon: React.ReactNode, 
  href: string, 
  description: string,
  delay: number,
  color: string
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay, duration: 0.3 }}
    >
      <Link href={href} className="block h-full">
        <div className={`h-full bg-card hover:bg-${color}-500/5 backdrop-blur-sm border border-border hover:border-${color}-500/30 rounded-lg p-4 transition-all duration-300 group`}>
          <div className="flex items-center mb-2">
            <div className={`w-8 h-8 rounded-lg bg-${color}-500/10 flex items-center justify-center text-${color}-500 mr-3`}>
              {icon}
            </div>
            <h3 className="font-bold">{name}</h3>
          </div>
          
          <p className="text-xs text-muted-foreground mb-2">{description}</p>
          
          <div className={`flex items-center text-${color}-500 text-xs font-medium`}>
            <span className="group-hover:underline">Open Tool</span>
            <ArrowRightIcon className="w-3 h-3 ml-1 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

function getToolDescription(name: string) {
  const descriptions: Record<string, string> = {
    'Home': 'Return to the Astro World dashboard',
    'KRC-20': 'Browse and analyze KRC-20 tokens with real-time market data',
    'Charts': 'Interactive price charts with multiple timeframes and indicators',
    'KRC Arb Calc': 'Calculate arbitrage opportunities across Kaspa exchanges',
    'KRC-721 Explorer': 'Browse and explore KRC-721 NFT collections with analytics',
    'Mint Watcher': 'Track new NFT mints and launches in real-time with alerts',
    'Wallet Profiler': 'Analyze wallet holdings, history, and portfolio performance',
    'Profit/Loss': 'Track trading performance and tax liabilities across tokens',
    'Airdrop Tool': 'Manage and distribute token airdrops to multiple addresses',
    'Wallet Explorer': 'Explore wallet addresses, balance history, and transactions',
    'Secret Tools': 'Advanced tools for power users in the Kaspa ecosystem'
  };

  return descriptions[name] || `Access ${name.toLowerCase()} features and analytics`;
}