'use client';

import Link from 'next/link';
import { navItems } from '@/components/navigation/NavBar';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { ArrowRight } from 'lucide-react';
import Image from 'next/image';

export default function Home() {
  const [activeSection, setActiveSection] = useState<null | 'krc20' | 'krc721' | 'utility'>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  
  useEffect(() => {
    setIsLoaded(true);
  }, []);

  const krc20Tools = navItems.filter(item => item.category === 'krc20');
  const krc721Tools = navItems.filter(item => item.category === 'krc721');
  const utilityTools = navItems.filter(item => item.category === 'utility');

  return (
    <div className="flex flex-col h-[calc(100vh-2rem)] overflow-hidden">
      <div className="flex flex-col md:flex-row flex-1 w-full">
        <motion.div 
          className="relative flex-1 overflow-hidden bg-gradient-to-b from-green-500/20 via-green-600/10 to-green-700/5 border-r border-green-500/20"
          initial={{ flex: 1 }}
          animate={{ flex: activeSection === 'krc20' ? 2 : 1 }}
          onHoverStart={() => setActiveSection('krc20')}
          onHoverEnd={() => setActiveSection(null)}
          transition={{ duration: 0.5, ease: "easeInOut" }}
        >
          <div className="h-full w-full p-6 flex flex-col">
            <div className="flex items-center mb-8">
              <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center mr-4">
                <svg viewBox="0 0 24 24" className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 16.5c-3.58 0-6.5-2.92-6.5-6.5h3c0 1.93 1.57 3.5 3.5 3.5s3.5-1.57 3.5-3.5h3c0 3.58-2.92 6.5-6.5 6.5z" />
                </svg>
              </div>
              <h2 className="text-3xl font-bold text-green-500">KRC-20 Tools</h2>
            </div>
            
            <div className="space-y-4 overflow-y-auto flex-1 scrollbar-hide pr-2" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
              {krc20Tools.map((tool, index) => (
                <motion.div 
                  key={tool.name}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * index, duration: 0.5 }}
                >
                  <Link href={tool.href} className="block">
                    <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 hover:bg-green-500/10 transition-all duration-300 border border-green-500/20 group">
                      <div className="flex items-center">
                        <div className="w-10 h-10 rounded-md bg-green-500/20 flex items-center justify-center mr-4 text-green-400">
                          {tool.icon}
                        </div>
                        <div className="flex-1">
                          <h3 className="text-xl font-bold text-green-400 group-hover:text-green-300 transition-colors">{tool.name}</h3>
                          <p className="text-green-200/70 text-sm mt-1">{getToolDescription(tool.name as keyof typeof descriptions)}</p>
                        </div>
                        <ArrowRight className="w-5 h-5 text-green-400 opacity-0 group-hover:opacity-100 transform group-hover:translate-x-1 transition-all" />
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
            
            <div className={`absolute inset-0 pointer-events-none ${activeSection === 'krc20' ? 'opacity-100' : 'opacity-0'} transition-opacity duration-700`}>
              <div className="absolute bottom-0 right-0 w-72 h-72 bg-green-500/20 rounded-full filter blur-3xl transform translate-x-1/3 translate-y-1/3" />
              <div className="absolute top-1/4 left-1/4 w-48 h-48 bg-green-400/10 rounded-full filter blur-3xl animate-pulse duration-5000" />
            </div>
          </div>
        </motion.div>

        <motion.div 
          className="relative flex-1 overflow-hidden bg-gradient-to-b from-yellow-500/20 via-yellow-600/10 to-yellow-700/5 border-r border-yellow-500/20"
          initial={{ flex: 1 }}
          animate={{ flex: activeSection === 'krc721' ? 2 : 1 }}
          onHoverStart={() => setActiveSection('krc721')}
          onHoverEnd={() => setActiveSection(null)}
          transition={{ duration: 0.5, ease: "easeInOut" }}
        >
          <div className="h-full w-full p-6 flex flex-col">
            <div className="flex items-center mb-8">
              <div className="w-12 h-12 rounded-full bg-yellow-500/20 flex items-center justify-center mr-4">
                <svg viewBox="0 0 24 24" className="w-6 h-6 text-yellow-500" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14" />
                  <path d="M14 8a2 2 0 100-4 2 2 0 000 4z" />
                  <rect x="2" y="2" width="20" height="20" rx="5" />
                </svg>
              </div>
              <h2 className="text-3xl font-bold text-yellow-500">KRC-721 Tools</h2>
            </div>
            
            <div className="space-y-4 overflow-y-auto flex-1 scrollbar-hide pr-2" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
              {krc721Tools.map((tool, index) => (
                <motion.div 
                  key={tool.name}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * index + 0.2, duration: 0.5 }}
                >
                  <Link href={tool.href} className="block">
                    <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 hover:bg-yellow-500/10 transition-all duration-300 border border-yellow-500/20 group">
                      <div className="flex items-center">
                        <div className="w-10 h-10 rounded-md bg-yellow-500/20 flex items-center justify-center mr-4 text-yellow-400">
                          {tool.icon}
                        </div>
                        <div className="flex-1">
                          <h3 className="text-xl font-bold text-yellow-400 group-hover:text-yellow-300 transition-colors">{tool.name}</h3>
                          <p className="text-yellow-200/70 text-sm mt-1">{getToolDescription(tool.name as keyof typeof descriptions)}</p>
                        </div>
                        <ArrowRight className="w-5 h-5 text-yellow-400 opacity-0 group-hover:opacity-100 transform group-hover:translate-x-1 transition-all" />
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
            
            <div className={`absolute inset-0 pointer-events-none ${activeSection === 'krc721' ? 'opacity-100' : 'opacity-0'} transition-opacity duration-700`}>
              <div className="absolute top-0 right-0 w-72 h-72 bg-yellow-500/20 rounded-full filter blur-3xl transform translate-x-1/3 -translate-y-1/3" />
              <div className="absolute bottom-1/4 left-1/4 w-48 h-48 bg-yellow-400/10 rounded-full filter blur-3xl animate-pulse duration-5000" />
            </div>
          </div>
        </motion.div>

        <motion.div 
          className="relative flex-1 overflow-hidden bg-gradient-to-b from-purple-500/20 via-purple-600/10 to-purple-700/5"
          initial={{ flex: 1 }}
          animate={{ flex: activeSection === 'utility' ? 2 : 1 }}
          onHoverStart={() => setActiveSection('utility')}
          onHoverEnd={() => setActiveSection(null)}
          transition={{ duration: 0.5, ease: "easeInOut" }}
        >
          <div className="h-full w-full p-6 flex flex-col">
            <div className="flex items-center mb-8">
              <div className="w-12 h-12 rounded-full bg-purple-500/20 flex items-center justify-center mr-4">
                <svg viewBox="0 0 24 24" className="w-6 h-6 text-purple-500" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M14 10l-2 1m0 0l-2-1m2 1v2.5M20 7l-2 1m2-1l-2-1m2 1v2.5M14 4l-2-1-2 1M4 7l2-1m0 0l2 1m-2-1v2.5" />
                  <path d="M4 17l6-3-6-3v6z" />
                  <path d="M20 17l-6-3 6-3v6z" />
                </svg>
              </div>
              <h2 className="text-3xl font-bold text-purple-500">Utility Tools</h2>
            </div>
            
            <div className="space-y-4 overflow-y-auto flex-1 scrollbar-hide pr-2" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
              {utilityTools.map((tool, index) => (
                <motion.div 
                  key={tool.name}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * index + 0.4, duration: 0.5 }}
                >
                  <Link href={tool.href} className="block">
                    <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 hover:bg-purple-500/10 transition-all duration-300 border border-purple-500/20 group">
                      <div className="flex items-center">
                        <div className="w-10 h-10 rounded-md bg-purple-500/20 flex items-center justify-center mr-4 text-purple-400">
                          {tool.icon}
                        </div>
                        <div className="flex-1">
                          <h3 className="text-xl font-bold text-purple-400 group-hover:text-purple-300 transition-colors">{tool.name}</h3>
                          <p className="text-purple-200/70 text-sm mt-1">{getToolDescription(tool.name as keyof typeof descriptions)}</p>
                        </div>
                        <ArrowRight className="w-5 h-5 text-purple-400 opacity-0 group-hover:opacity-100 transform group-hover:translate-x-1 transition-all" />
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
            
            <div className={`absolute inset-0 pointer-events-none ${activeSection === 'utility' ? 'opacity-100' : 'opacity-0'} transition-opacity duration-700`}>
              <div className="absolute bottom-0 left-0 w-72 h-72 bg-purple-500/20 rounded-full filter blur-3xl transform -translate-x-1/3 translate-y-1/3" />
              <div className="absolute top-1/4 right-1/4 w-48 h-48 bg-purple-400/10 rounded-full filter blur-3xl animate-pulse duration-5000" />
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

const descriptions = {
  'KRC-20': 'Browse and analyze KRC-20 tokens with real-time market data',
  'Charts': 'Interactive price charts with multiple timeframes and indicators',
  'KRC Arb Calc': 'Calculate arbitrage opportunities across Kaspa exchanges',
  'KRC-721 Explorer': 'Browse and explore KRC-721 NFT collections with analytics',
  'Mint Watcher': 'Track new NFT mints and launches in real-time with alerts',
  'Wallet Profiler': 'Analyze wallet holdings, history, and portfolio performance',
  'Profit/Loss': 'Track trading performance and tax liabilities across tokens',
  'Airdrop Tool': 'Manage and distribute token airdrops to multiple addresses',
  'Wallet Explorer': 'Explore wallet addresses, balance history, and transactions',
  'Secret Tools': 'Advanced tools for power users in the Kaspa ecosystem',
  'Home': 'Return to the Astro World dashboard'
};

function getToolDescription(toolName: keyof typeof descriptions) {
  return descriptions[toolName] || `Access ${toolName.toLowerCase()} features and analytics`;
}
