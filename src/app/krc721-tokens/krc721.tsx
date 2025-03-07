'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Search, TrendingUp, BarChart3, ArrowUpRight, ArrowDownRight, ExternalLink, RefreshCw } from 'lucide-react';

interface NFTCollection {
  tick: string;
  floor_price: number;
  total_volume: number;
  volume_24h: number;
  change_24h: number;
  total_supply?: number;
  minted_count?: number;
  minted_percentage?: number;
  thumbnail_url?: string;
}

interface NFTToken {
  id: number;
  image_url: string;
  minted?: boolean;
}

const formatChange = (change: number) => {
  if (!change) return '0%';
  return `${change > 0 ? '+' : ''}${change.toFixed(1)}%`;
};

const getColorClass = (change: number) => {
  if (change > 0) return 'text-emerald-500';
  if (change < 0) return 'text-red-500';
  return 'text-gray-400';
};

const KRC721Explorer = () => {
  const router = useRouter();
  const [collections, setCollections] = useState<NFTCollection[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCollection, setSelectedCollection] = useState<NFTCollection | null>(null);
  const [tokens, setTokens] = useState<NFTToken[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'trending' | 'top' | 'recent'>('trending');
  const [showTokens, setShowTokens] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const itemsPerPage = 100;

  useEffect(() => {
    const fetchCollections = async () => {
      try {
        setLoading(true);
        const marketResponse = await fetch('https://markets.krc20.stream/krc721/mainnet/markets');
        if (!marketResponse.ok) {
          throw new Error('Failed to fetch market data');
        }
        
        const marketData = await marketResponse.json();
        const nftResponse = await fetch('https://mainnet.krc721.stream/api/v1/krc721/mainnet/nfts');
        if (!nftResponse.ok) {
          throw new Error('Failed to fetch NFT data');
        }
        
        const nftData = await nftResponse.json();
        
        if (marketData && nftData.result) {
          const processedCollections = [];
          const nftMap = new Map();
          nftData.result.forEach((nft: any) => {
            nftMap.set(nft.tick, nft);
          });
          
          for (const [tick, market] of Object.entries(marketData)) {
            if (tick === 'KAS') continue;
            
            const marketInfo = market as any;
            const nftInfo = nftMap.get(tick);
            
            if (nftInfo) {
              const mintedPercentage = nftInfo.max && nftInfo.minted
                ? (parseInt(nftInfo.minted) / parseInt(nftInfo.max)) * 100
                : undefined;
              
              processedCollections.push({
                tick: tick,
                floor_price: marketInfo.floor_price || 0,
                total_volume: marketInfo.total_volume || 0,
                volume_24h: marketInfo.volume_24h || 0,
                change_24h: marketInfo.change_24h || 0,
                total_supply: nftInfo.max ? parseInt(nftInfo.max) : undefined,
                minted_count: nftInfo.minted ? parseInt(nftInfo.minted) : undefined,
                minted_percentage: mintedPercentage,
                thumbnail_url: `https://cache.krc721.stream/krc721/mainnet/thumbnail/${tick}/1`,
                deployer: nftInfo.deployer,
                buri: nftInfo.buri,
                royaltyFee: nftInfo.royaltyFee,
                premint: nftInfo.premint ? parseInt(nftInfo.premint) : 0
              });
            } else {
              processedCollections.push({
                tick: tick,
                floor_price: marketInfo.floor_price || 0,
                total_volume: marketInfo.total_volume || 0,
                volume_24h: marketInfo.volume_24h || 0,
                change_24h: marketInfo.change_24h || 0,
                thumbnail_url: `https://cache.krc721.stream/krc721/mainnet/thumbnail/${tick}/1`
              });
            }
          }
          
          setCollections(processedCollections);
        }
      } catch (error) {
        console.error('Error fetching collections:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchCollections();
  }, []);
  
  const fetchTokensForCollection = async (collection: NFTCollection) => {
    try {
      setLoading(true);
      
      const response = await fetch(`/api/collections?tick=${collection.tick}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch tokens for ${collection.tick}`);
      }
      
      const data = await response.json();
      const totalSupply = collection.total_supply || 500;
      const mintedTokenIds = new Set<number>();
      
      if (data && data.minted) {
        data.minted.forEach((id: number) => mintedTokenIds.add(id));
      }
      
      const tokens: NFTToken[] = [];
      
      for (let i = 1; i <= totalSupply; i++) {
        tokens.push({
          id: i,
          image_url: `https://cache.krc721.stream/krc721/mainnet/thumbnail/${collection.tick}/${i}`,
          minted: mintedTokenIds.has(i)
        });
      }
      
      setTokens(tokens);
      setShowTokens(true);
    } catch (error) {
      console.error('Error fetching tokens:', error);
      
      const totalSupply = collection.total_supply || 500;
      const fallbackTokens: NFTToken[] = [];
      
      for (let i = 1; i <= totalSupply; i++) {
        fallbackTokens.push({
          id: i,
          image_url: `https://cache.krc721.stream/krc721/mainnet/thumbnail/${collection.tick}/${i}`
        });
      }
      
      setTokens(fallbackTokens);
      setShowTokens(true);
    } finally {
      setLoading(false);
    }
  };
  
  const loadMoreCollections = async () => {
    if (!hasMore || loading) return;
    
    try {
      setLoading(true);
      const nextOffset = offset + 50;
      
      const response = await fetch(`https://mainnet.krc721.stream/api/v1/krc721/mainnet/nfts?offset=${nextOffset}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch more NFT data');
      }
      
      const data = await response.json();
      
      if (data.result && data.result.length > 0) {
        const newCollections = data.result.map((nft: any) => {
          const mintedPercentage = nft.max && nft.minted
            ? (parseInt(nft.minted) / parseInt(nft.max)) * 100
            : undefined;
          
          return {
            tick: nft.tick,
            floor_price: 0, 
            total_volume: 0,
            volume_24h: 0,
            change_24h: 0,
            total_supply: nft.max ? parseInt(nft.max) : undefined,
            minted_count: nft.minted ? parseInt(nft.minted) : undefined,
            minted_percentage: mintedPercentage,
            thumbnail_url: `https://cache.krc721.stream/krc721/mainnet/thumbnail/${nft.tick}/1`,
            deployer: nft.deployer,
            buri: nft.buri,
            royaltyFee: nft.royaltyFee,
            premint: nft.premint ? parseInt(nft.premint) : 0
          };
        });
        
        try {
          const marketResponse = await fetch('https://markets.krc20.stream/krc721/mainnet/markets');
          if (marketResponse.ok) {
            const marketData = await marketResponse.json();
            
            newCollections.forEach((collection: NFTCollection) => {
              const marketInfo = marketData[collection.tick] as any;
              if (marketInfo) {
                collection.floor_price = marketInfo.floor_price || 0;
                collection.total_volume = marketInfo.total_volume || 0;
                collection.volume_24h = marketInfo.volume_24h || 0;
                collection.change_24h = marketInfo.change_24h || 0;
              }
            });
          }
        } catch (err) {
          console.error('Error fetching market data for new collections:', err);
        }
        
        setCollections(prev => [...prev, ...newCollections]);
        setOffset(nextOffset);
        setHasMore(data.result.length === 50); 
      } else {
        setHasMore(false);
      }
    } catch (error) {
      console.error('Error loading more collections:', error);
      setHasMore(false);
    } finally {
      setLoading(false);
    }
  };
  
  const scrollHorizontally = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      const scrollAmount = 300; 
      
      if (direction === 'left') {
        container.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
      } else {
        container.scrollBy({ left: scrollAmount, behavior: 'smooth' });
      }
    }
  };

  const filteredCollections = searchQuery
    ? collections.filter(c => c.tick.toLowerCase().includes(searchQuery.toLowerCase()))
    : collections;

  const getDisplayedCollections = () => {
    let result = [...filteredCollections];
    
    if (activeTab === 'trending') {
      result = result.filter(c => c.volume_24h > 0)
        .sort((a, b) => b.volume_24h - a.volume_24h);
    } else if (activeTab === 'top') {
      result = result.sort((a, b) => b.total_volume - a.total_volume);
    } else {
      result = result.sort((a, b) => b.volume_24h - a.volume_24h);
    }
    
    return result.slice(0, 20);
  };
  
  const handleCollectionClick = (collection: NFTCollection) => {
    router.push(`/${collection.tick}`);
    
    setSelectedCollection(collection);
    fetchTokensForCollection(collection);
  };
  
  const refreshData = async () => {
    setRefreshing(true);
    try {
      const marketResponse = await fetch('https://markets.krc20.stream/krc721/mainnet/markets');
      if (!marketResponse.ok) {
        throw new Error('Failed to fetch market data');
      }
      
      const marketData = await marketResponse.json();
      
      setCollections(prev => {
        return prev.map(collection => {
          const marketInfo = marketData[collection.tick] as any;
          if (!marketInfo) return collection;
          
          return {
            ...collection,
            floor_price: marketInfo.floor_price || collection.floor_price,
            total_volume: marketInfo.total_volume || collection.total_volume,
            volume_24h: marketInfo.volume_24h || collection.volume_24h,
            change_24h: marketInfo.change_24h || collection.change_24h
          };
        });
      });
      
    } catch (error) {
      console.error('Error refreshing data:', error);
    } finally {
      setRefreshing(false);
    }
  };
  
  const handleBackClick = () => {
    setShowTokens(false);
    setSelectedCollection(null);
  };

  const getPageTokens = () => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return tokens.slice(startIndex, endIndex);
  };
  
  const maxPage = Math.ceil(tokens.length / itemsPerPage);
  
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <motion.div 
      className="min-h-screen"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 py-4 sm:py-6">
        <div className="flex items-center space-x-2">
          <div className="relative w-10 h-10 rounded-lg overflow-hidden border">
            <motion.div
              className="absolute inset-0 bg-gradient-to-br from-purple-500/30 to-blue-500/30"
              animate={{ 
                background: [
                  "linear-gradient(to bottom right, rgba(168, 85, 247, 0.3), rgba(59, 130, 246, 0.3))",
                  "linear-gradient(to bottom right, rgba(59, 130, 246, 0.3), rgba(168, 85, 247, 0.3))"
                ]
              }}
              transition={{ duration: 3, repeat: Infinity, repeatType: "reverse" }}
            />
            <div className="absolute inset-0 flex items-center justify-center font-bold text-xl">K</div>
          </div>
          <div>
            <h1 className="text-xl font-bold">KRC-721</h1>
            <p className="text-xs text-muted-foreground">Collections Explorer</p>
          </div>
        </div>
        
        <div className="relative w-full sm:max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <input
            type="text"
            placeholder="Search collections..."
            className="w-full h-10 pl-10 pr-4 rounded-lg border focus:outline-none focus:ring-2 focus:ring-ring"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </header>

      <AnimatePresence mode="wait">
        {!showTokens ? (
          <motion.div
            key="collections"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <div className="mb-8">
              <div className="overflow-hidden relative">
                <div className="flex items-center justify-between mb-2">

                  <div className="flex items-center space-x-2">
                    <button 
                      onClick={() => scrollHorizontally('left')}
                      className="p-1.5 rounded-full border hover:bg-gray-100 transition-colors"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button 
                      onClick={() => scrollHorizontally('right')}
                      className="p-1.5 rounded-full border hover:bg-gray-100 transition-colors"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                    <button 
                      onClick={refreshData}
                      disabled={refreshing}
                      className="p-1.5 rounded-full border hover:bg-gray-100 transition-colors"
                    >
                      <RefreshCw className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} />
                    </button>
                  </div>
                </div>
                <motion.div 
                  ref={scrollContainerRef}
                  className="flex space-x-4 py-2 px-1 overflow-x-auto scrollbar-hide"
                  drag="x"
                  dragConstraints={{ left: 0, right: 0 }}
                  style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                >
                  {getDisplayedCollections().map((collection) => (
                    <motion.div
                      key={collection.tick}
                      className="flex-shrink-0 cursor-pointer group"
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleCollectionClick(collection)}
                      variants={item}
                    >
                      <div className="w-64 rounded-xl overflow-hidden border group-hover:border-primary/50 transition-colors duration-300">
                        <div className="h-64 relative">
                          {collection.thumbnail_url && (
                            <img 
                              src={collection.thumbnail_url} 
                              alt={collection.tick}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48bGluZWFyR3JhZGllbnQgaWQ9ImEiIHgxPSIwJSIgeTE9IjAlIiB4Mj0iMTAwJSIgeTI9IjEwMCUiPjxzdG9wIG9mZnNldD0iMCUiIHN0b3AtY29sb3I9IiNhMDU1ZjciIHN0b3Atb3BhY2l0eT0iLjIiLz48c3RvcCBvZmZzZXQ9IjEwMCUiIHN0b3AtY29sb3I9IiMzYjgyZjYiIHN0b3Atb3BhY2l0eT0iLjIiLz48L2xpbmVhckdyYWRpZW50PjwvZGVmcz48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0idXJsKCNhKSIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0ic2Fucy1zZXJpZiIgZm9udC1zaXplPSIyNCIgZm9udC13ZWlnaHQ9IjUwMCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZG9taW5hbnQtYmFzZWxpbmU9Im1pZGRsZSIgZmlsbD0icmdiYSgxMDAsMTAwLDEwMCwwLjgpIj5ObyBJbWFnZTwvdGV4dD48L3N2Zz4=';
                              }}
                            />
                          )}
                          <div className="absolute left-0 top-0 m-2 px-2 py-1 rounded-md bg-background/80 backdrop-blur-sm text-xs font-medium">
                            {collection.tick}
                          </div>
                          {collection.minted_percentage !== undefined && (
                            <div className="absolute right-0 bottom-0 m-2 px-2 py-1 rounded-md bg-background/80 backdrop-blur-sm text-xs font-medium">
                              {Math.round(collection.minted_percentage)}% Minted
                            </div>
                          )}
                        </div>
                        <div className="p-4 space-y-2">
                          <div className="flex justify-between">
                            <div>
                              <p className="text-sm text-muted-foreground">Floor</p>
                              <p className="font-bold">{collection.floor_price} KAS</p>
                            </div>
                            <div>
                              <p className="text-sm text-muted-foreground">Volume</p>
                              <p className="font-bold">{collection.total_volume}</p>
                            </div>
                          </div>
                          <div className="flex justify-between items-center pt-1">
                            <div>
                              <p className="text-sm text-muted-foreground">24h %</p>
                              <p className={`font-medium ${getColorClass(collection.change_24h)}`}>
                                {collection.change_24h > 0 && <ArrowUpRight className="inline w-3 h-3 mr-1" />}
                                {collection.change_24h < 0 && <ArrowDownRight className="inline w-3 h-3 mr-1" />}
                                {formatChange(collection.change_24h)}
                              </p>
                            </div>
                            <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                              <motion.div
                                className="flex items-center text-sm text-primary font-medium"
                                whileHover={{ x: 3 }}
                              >
                                View Collection <ExternalLink className="ml-1 w-3 h-3" />
                              </motion.div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              </div>
            </div>
            
            <div className="mb-6 flex overflow-x-auto scrollbar-hide border-b">
              <button 
                className={`px-3 sm:px-4 py-2 font-medium border-b-2 whitespace-nowrap transition-colors ${activeTab === 'trending' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
                onClick={() => setActiveTab('trending')}
              >
                <TrendingUp className="w-4 h-4 inline-block mr-1 sm:mr-2" />
                <span className="text-sm sm:text-base">Trending</span>
              </button>
              <button 
                className={`px-3 sm:px-4 py-2 font-medium border-b-2 whitespace-nowrap transition-colors ${activeTab === 'top' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
                onClick={() => setActiveTab('top')}
              >
                <BarChart3 className="w-4 h-4 inline-block mr-1 sm:mr-2" />
                <span className="text-sm sm:text-base">Top Volume</span>
              </button>
              <button 
                className={`px-3 sm:px-4 py-2 font-medium border-b-2 whitespace-nowrap transition-colors ${activeTab === 'recent' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
                onClick={() => setActiveTab('recent')}
              >
                <span className="text-sm sm:text-base">Recent</span>
              </button>
            </div>
            
            <motion.div
              variants={container}
              initial="hidden"
              animate="show"
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 mb-10"
            >
              {getDisplayedCollections().map((collection) => (
                <motion.div 
                  key={collection.tick}
                  variants={item}
                  whileHover={{ 
                    y: -5,
                    boxShadow: "0 10px 30px -15px rgba(0, 0, 0, 0.2)"
                  }}
                  className="border rounded-xl overflow-hidden hover:border-primary/50 transition-colors duration-300 cursor-pointer"
                  onClick={() => handleCollectionClick(collection)}
                >
                  <div className="p-4 flex items-center space-x-3">
                    <div className="w-12 h-12 rounded-md overflow-hidden flex-shrink-0">
                      {collection.thumbnail_url && (
                        <img 
                          src={collection.thumbnail_url} 
                          alt={collection.tick}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48bGluZWFyR3JhZGllbnQgaWQ9ImEiIHgxPSIwJSIgeTE9IjAlIiB4Mj0iMTAwJSIgeTI9IjEwMCUiPjxzdG9wIG9mZnNldD0iMCUiIHN0b3AtY29sb3I9IiNhMDU1ZjciIHN0b3Atb3BhY2l0eT0iLjIiLz48c3RvcCBvZmZzZXQ9IjEwMCUiIHN0b3AtY29sb3I9IiMzYjgyZjYiIHN0b3Atb3BhY2l0eT0iLjIiLz48L2xpbmVhckdyYWRpZW50PjwvZGVmcz48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0idXJsKCNhKSIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0ic2Fucy1zZXJpZiIgZm9udC1zaXplPSIyNCIgZm9udC13ZWlnaHQ9IjUwMCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZG9taW5hbnQtYmFzZWxpbmU9Im1pZGRsZSIgZmlsbD0icmdiYSgxMDAsMTAwLDEwMCwwLjgpIj5ObyBJbWFnZTwvdGV4dD48L3N2Zz4=';
                          }}
                        />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold truncate">{collection.tick}</h3>
                      <div className="flex justify-between text-sm">
                        <span>Floor: {collection.floor_price} KAS</span>
                        <span className={getColorClass(collection.change_24h)}>
                          {formatChange(collection.change_24h)}
                        </span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        ) : (
          <motion.div
            key="tokens"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="mb-6">
              <button 
                onClick={handleBackClick}
                className="flex items-center text-sm font-medium hover:text-primary transition-colors"
              >
                <ChevronLeft className="mr-1 w-4 h-4" />
                Back to Collections
              </button>
            </div>
            
            {selectedCollection && (
              <div className="mb-6 border rounded-xl p-4">
                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                  <div className="w-16 h-16 rounded-md overflow-hidden">
                    {selectedCollection.thumbnail_url && (
                      <img 
                        src={selectedCollection.thumbnail_url} 
                        alt={selectedCollection.tick}
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>
                  <div>
                    <h2 className="text-xl sm:text-2xl font-bold">{selectedCollection.tick}</h2>
                    <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm mt-1">
                      <div>
                        <span className="text-muted-foreground">Floor:</span> {selectedCollection.floor_price} KAS
                      </div>
                      {selectedCollection.minted_count !== undefined && selectedCollection.total_supply !== undefined && (
                        <div>
                          <span className="text-muted-foreground">Minted:</span> {selectedCollection.minted_count} / {selectedCollection.total_supply}
                        </div>
                      )}
                      <div className={getColorClass(selectedCollection.change_24h)}>
                        <span className="text-muted-foreground">24h:</span> {formatChange(selectedCollection.change_24h)}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            <motion.div
              variants={container}
              initial="hidden"
              animate="show"
              className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2 sm:gap-4 mb-6"
            >
              {getPageTokens().map((token) => (
                <motion.div
                  key={token.id}
                  variants={item}
                  whileHover={{ y: -5 }}
                  className="border rounded-lg overflow-hidden"
                >
                  <div className="aspect-square overflow-hidden">
                    <img 
                      src={token.image_url} 
                      alt={`Token #${token.id}`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48bGluZWFyR3JhZGllbnQgaWQ9ImEiIHgxPSIwJSIgeTE9IjAlIiB4Mj0iMTAwJSIgeTI9IjEwMCUiPjxzdG9wIG9mZnNldD0iMCUiIHN0b3AtY29sb3I9IiNhMDU1ZjciIHN0b3Atb3BhY2l0eT0iLjIiLz48c3RvcCBvZmZzZXQ9IjEwMCUiIHN0b3AtY29sb3I9IiMzYjgyZjYiIHN0b3Atb3BhY2l0eT0iLjIiLz48L2xpbmVhckdyYWRpZW50PjwvZGVmcz48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0idXJsKCNhKSIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0ic2Fucy1zZXJpZiIgZm9udC1zaXplPSIyNCIgZm9udC13ZWlnaHQ9IjUwMCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZG9taW5hbnQtYmFzZWxpbmU9Im1pZGRsZSIgZmlsbD0icmdiYSgxMDAsMTAwLDEwMCwwLjgpIj5ObyBJbWFnZTwvdGV4dD48L3N2Zz4=';
                      }}
                    />
                  </div>
                  <div className="p-2 text-center">
                    <p className="text-sm font-medium">#{token.id}</p>
                  </div>
                </motion.div>
              ))}
            </motion.div>
            
            {tokens.length > itemsPerPage && (
              <div className="flex justify-center items-center space-x-3 mb-10">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="w-10 h-10 rounded-md flex items-center justify-center border disabled:opacity-50"
                  aria-label="Previous page"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                
                <div className="text-sm font-medium">
                  Page {currentPage} of {maxPage}
                </div>
                
                <button
                  onClick={() => setCurrentPage(p => Math.min(maxPage, p + 1))}
                  disabled={currentPage === maxPage}
                  className="w-10 h-10 rounded-md flex items-center justify-center border disabled:opacity-50"
                  aria-label="Next page"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default KRC721Explorer ;