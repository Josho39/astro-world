'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronLeft, ChevronRight, Search, BarChart3,
  ArrowUpRight, ArrowDownRight, RefreshCw,
  Filter, SlidersHorizontal, Clock, AlertCircle, Loader2
} from 'lucide-react';
import {
  Table, TableHeader, TableBody, TableRow, TableHead, TableCell
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface NFTCollection {
  tick: string;
  floor_price?: number;
  total_volume?: number;
  volume_24h?: number;
  change_24h?: number;
  total_supply?: number;
  minted_count?: number;
  minted_percentage?: number;
  thumbnail_url?: string;
  deployer?: string;
  buri?: string;
  royaltyFee?: string;
  premint?: number;
  last_updated?: string;
}

interface NFTToken {
  id: number;
  image_url: string;
  minted?: boolean;
  metadata?: NFTMetadata;
}

interface NFTMetadata {
  name?: string;
  description?: string;
  image?: string;
  attributes?: { trait_type: string; value: string }[];
}

const formatNumber = (num: number): string => {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
  return num.toString();
};

const formatPrice = (price: number | undefined): string => {
  if (price === undefined) return '-';
  if (price === 0) return '0';
  if (price < 0.01) return '<0.01';
  return price.toFixed(2);
};

const formatChange = (change: number | undefined): string => {
  if (change === undefined) return '0%';
  return `${change > 0 ? '+' : ''}${change.toFixed(1)}%`;
};

const getColorClass = (change: number | undefined): string => {
  if (!change) return 'text-gray-400';
  if (change > 0) return 'text-emerald-500';
  if (change < 0) return 'text-red-500';
  return 'text-gray-400';
};

const getProgressColorClass = (percentage: number): string => {
  if (percentage < 25) return 'bg-red-500';
  if (percentage < 50) return 'bg-orange-500';
  if (percentage < 75) return 'bg-yellow-500';
  return 'bg-green-500';
};

const CollectionItem = ({
  collection,
  isSelected,
  onClick
}: {
  collection: NFTCollection,
  isSelected: boolean,
  onClick: () => void
}) => {
  const mintPercentage = collection.minted_percentage ||
    (collection.total_supply && collection.minted_count
      ? (collection.minted_count / collection.total_supply) * 100
      : 0);

  return (
    <motion.div
      whileHover={{ y: -5, boxShadow: "0 8px 30px -15px rgba(0, 0, 0, 0.2)" }}
      className={`border rounded-xl overflow-hidden transition-colors duration-300 cursor-pointer
      ${isSelected ? 'border-primary shadow-md bg-primary/5' : 'hover:border-primary/50'}`}
      onClick={onClick}
    >
      <div className="aspect-square overflow-hidden bg-muted">
        {collection.thumbnail_url ? (
          <img
            src={collection.thumbnail_url}
            alt={collection.tick}
            className="w-full h-full object-cover"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48bGluZWFyR3JhZGllbnQgaWQ9ImEiIHgxPSIwJSIgeTE9IjAlIiB4Mj0iMTAwJSIgeTI9IjEwMCUiPjxzdG9wIG9mZnNldD0iMCUiIHN0b3AtY29sb3I9IiNhMDU1ZjciIHN0b3Atb3BhY2l0eT0iLjIiLz48c3RvcCBvZmZzZXQ9IjEwMCUiIHN0b3AtY29sb3I9IiMzYjgyZjYiIHN0b3Atb3BhY2l0eT0iLjIiLz48L2xpbmVhckdyYWRpZW50PjwvZGVmcz48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0idXJsKCNhKSIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0ic2Fucy1zZXJpZiIgZm9udC1zaXplPSIyNCIgZm9udC13ZWlnaHQ9IjUwMCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZG9taW5hbnQtYmFzZWxpbmU9Im1pZGRsZSIgZmlsbD0icmdiYSgxMDAsMTAwLDEwMCwwLjgpIj5ObyBJbWFnZTwvdGV4dD48L3N2Zz4=';
            }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-primary/5">
            <span className="text-xl font-bold text-primary/40">{collection.tick}</span>
          </div>
        )}
      </div>
      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-bold text-lg truncate">{collection.tick}</h3>
          {collection.change_24h !== undefined && (
            <Badge className={`${getColorClass(collection.change_24h)} bg-background`}>
              {collection.change_24h > 0 && <ArrowUpRight className="inline w-3 h-3 mr-1" />}
              {collection.change_24h < 0 && <ArrowDownRight className="inline w-3 h-3 mr-1" />}
              {formatChange(collection.change_24h)}
            </Badge>
          )}
        </div>

        <div className="grid grid-cols-2 gap-2 text-sm mb-2">
          <div>
            <p className="text-muted-foreground">Floor</p>
            <p className="font-medium">{collection.floor_price ? `${collection.floor_price} KAS` : '-'}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Vol 24h</p>
            <p className="font-medium">{collection.volume_24h ? formatNumber(collection.volume_24h) : '-'}</p>
          </div>
        </div>

        {collection.total_supply && (
          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Mint Progress</span>
              <span>{Math.round(mintPercentage)}%</span>
            </div>
            <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
              <div
                className={`h-full ${getProgressColorClass(mintPercentage)} rounded-full`}
                style={{ width: `${mintPercentage}%` }}
              />
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};

const CollectionTable = ({
  collections,
  isLoading,
  selectedCollection,
  onSelectCollection,
  currentPage,
  pageSize,
  onPageChange,
  totalPages
}: {
  collections: NFTCollection[],
  isLoading: boolean,
  selectedCollection: string | null,
  onSelectCollection: (tick: string) => void,
  currentPage: number,
  pageSize: number,
  onPageChange: (page: number) => void,
  totalPages: number
}) => {
  return (
    <div>
      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[200px]">Collection</TableHead>
              <TableHead className="text-right">Floor Price</TableHead>
              <TableHead className="text-right">Volume 24h</TableHead>
              <TableHead className="text-right">Total Volume</TableHead>
              <TableHead className="text-right">Minted</TableHead>
              <TableHead className="text-right">Change 24h</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array(pageSize).fill(0).map((_, index) => (
                <TableRow key={`skeleton-${index}`}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Skeleton className="h-8 w-8 rounded-md" />
                      <Skeleton className="h-4 w-24" />
                    </div>
                  </TableCell>
                  <TableCell className="text-right"><Skeleton className="h-4 w-16 ml-auto" /></TableCell>
                  <TableCell className="text-right"><Skeleton className="h-4 w-16 ml-auto" /></TableCell>
                  <TableCell className="text-right"><Skeleton className="h-4 w-20 ml-auto" /></TableCell>
                  <TableCell className="text-right"><Skeleton className="h-4 w-24 ml-auto" /></TableCell>
                  <TableCell className="text-right"><Skeleton className="h-4 w-16 ml-auto" /></TableCell>
                </TableRow>
              ))
            ) : collections.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-6 text-muted-foreground">
                  No collections found
                </TableCell>
              </TableRow>
            ) : (
              collections.map((collection) => {
                const isSelected = selectedCollection === collection.tick;
                const mintPercentage = collection.minted_percentage ||
                  (collection.total_supply && collection.minted_count
                    ? (collection.minted_count / collection.total_supply) * 100
                    : 0);

                return (
                  <TableRow
                    key={collection.tick}
                    className={`cursor-pointer hover:bg-muted/50 ${isSelected ? 'bg-primary/5' : ''}`}
                    onClick={() => onSelectCollection(collection.tick)}
                  >
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-md overflow-hidden bg-muted flex-shrink-0">
                          {collection.thumbnail_url ? (
                            <img
                              src={collection.thumbnail_url}
                              alt={collection.tick}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48bGluZWFyR3JhZGllbnQgaWQ9ImEiIHgxPSIwJSIgeTE9IjAlIiB4Mj0iMTAwJSIgeTI9IjEwMCUiPjxzdG9wIG9mZnNldD0iMCUiIHN0b3AtY29sb3I9IiNhMDU1ZjciIHN0b3Atb3BhY2l0eT0iLjIiLz48c3RvcCBvZmZzZXQ9IjEwMCUiIHN0b3AtY29sb3I9IiMzYjgyZjYiIHN0b3Atb3BhY2l0eT0iLjIiLz48L2xpbmVhckdyYWRpZW50PjwvZGVmcz48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0idXJsKCNhKSIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0ic2Fucy1zZXJpZiIgZm9udC1zaXplPSIyNCIgZm9udC13ZWlnaHQ9IjUwMCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZG9taW5hbnQtYmFzZWxpbmU9Im1pZGRsZSIgZmlsbD0icmdiYSgxMDAsMTAwLDEwMCwwLjgpIj5ObyBJbWFnZTwvdGV4dD48L3N2Zz4=';
                              }}
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-primary/10">
                              <span className="text-xs font-medium text-primary/60">{collection.tick.substring(0, 2)}</span>
                            </div>
                          )}
                        </div>
                        <span className="font-medium">{collection.tick}</span>
                        {isSelected && (
                          <Badge variant="outline" className="ml-2 border-primary text-primary text-xs">Selected</Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {collection.floor_price ? `${collection.floor_price} KAS` : '-'}
                    </TableCell>
                    <TableCell className="text-right">
                      {collection.volume_24h ? formatNumber(collection.volume_24h) : '-'}
                    </TableCell>
                    <TableCell className="text-right">
                      {collection.total_volume ? formatNumber(collection.total_volume) : '-'}
                    </TableCell>
                    <TableCell className="text-right">
                      {collection.total_supply ? (
                        <div className="flex items-center justify-end gap-2">
                          <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden">
                            <div
                              className={`h-full ${getProgressColorClass(mintPercentage)} rounded-full`}
                              style={{ width: `${mintPercentage}%` }}
                            />
                          </div>
                          <span>
                            {collection.minted_count ?? 0}/{collection.total_supply}
                          </span>
                        </div>
                      ) : '-'}
                    </TableCell>
                    <TableCell className={`text-right ${getColorClass(collection.change_24h)}`}>
                      {collection.change_24h !== undefined ? (
                        <>
                          {collection.change_24h > 0 && <ArrowUpRight className="inline w-3 h-3 mr-1" />}
                          {collection.change_24h < 0 && <ArrowDownRight className="inline w-3 h-3 mr-1" />}
                          {formatChange(collection.change_24h)}
                        </>
                      ) : '-'}
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex justify-between items-center mt-4">
        <div className="text-sm text-muted-foreground">
          Showing page {currentPage} of {totalPages}
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(1)}
            disabled={currentPage === 1}
          >
            First
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            Prev
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            Next
            <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(totalPages)}
            disabled={currentPage === totalPages}
          >
            Last
          </Button>
        </div>
      </div>
    </div>
  );
};

const NFTTokenGrid = ({
  tokens,
  isLoading,
  onTokenClick
}: {
  tokens: NFTToken[],
  isLoading: boolean,
  onTokenClick: (id: number) => void
}) => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
      {isLoading ? (
        Array(12).fill(0).map((_, index) => (
          <div key={`skeleton-${index}`} className="border rounded-lg overflow-hidden">
            <Skeleton className="aspect-square w-full" />
            <div className="p-2">
              <Skeleton className="h-4 w-16 mb-1" />
              <Skeleton className="h-3 w-24" />
            </div>
          </div>
        ))
      ) : tokens.length === 0 ? (
        <div className="col-span-full flex items-center justify-center py-8 text-muted-foreground border rounded-lg">
          No tokens found for this collection
        </div>
      ) : (
        tokens.map((token) => (
          <motion.div
            key={token.id}
            whileHover={{ y: -5 }}
            className={`border rounded-lg overflow-hidden cursor-pointer ${token.minted ? '' : 'opacity-100'}`}
            onClick={() => onTokenClick(token.id)}
          >
            <div className="aspect-square overflow-hidden bg-muted relative">
              <img
                src={token.image_url}
                alt={`Token #${token.id}`}
                className="w-full h-full object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48bGluZWFyR3JhZGllbnQgaWQ9ImEiIHgxPSIwJSIgeTE9IjAlIiB4Mj0iMTAwJSIgeTI9IjEwMCUiPjxzdG9wIG9mZnNldD0iMCUiIHN0b3AtY29sb3I9IiNhMDU1ZjciIHN0b3Atb3BhY2l0eT0iLjIiLz48c3RvcCBvZmZzZXQ9IjEwMCUiIHN0b3AtY29sb3I9IiMzYjgyZjYiIHN0b3Atb3BhY2l0eT0iLjIiLz48L2xpbmVhckdyYWRpZW50PjwvZGVmcz48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0idXJsKCNhKSIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0ic2Fucy1zZXJpZiIgZm9udC1zaXplPSIyNCIgZm9udC13ZWlnaHQ9IjUwMCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZG9taW5hbnQtYmFzZWxpbmU9Im1pZGRsZSIgZmlsbD0icmdiYSgxMDAsMTAwLDEwMCwwLjgpIj5ObyBJbWFnZTwvdGV4dD48L3N2Zz4=';
                }}
              />
              <Badge className="absolute top-2 right-2 bg-background/90">
                #{token.id}
              </Badge>
              {!token.minted && (
                <Badge className="absolute bottom-2 left-2 bg-background/90 text-muted-foreground">
                  Not Minted
                </Badge>
              )}
            </div>
            <div className="p-2">
              <div className="text-sm font-medium">#{token.id}</div>
              {token.metadata?.name && (
                <div className="text-xs text-muted-foreground truncate">{token.metadata.name}</div>
              )}
            </div>
          </motion.div>
        ))
      )}
    </div>
  );
};

const KRC721Explorer = () => {
  const router = useRouter();
  const [collections, setCollections] = useState<NFTCollection[]>([]);
  const [marketData, setMarketData] = useState<Record<string, any>>({});
  const [filteredCollections, setFilteredCollections] = useState<NFTCollection[]>([]);
  const [loading, setLoading] = useState(true);
  const [paginationData, setPaginationData] = useState({ offset: 0, next: 0, hasMore: true });
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCollection, setSelectedCollection] = useState<NFTCollection | null>(null);
  const [tokens, setTokens] = useState<NFTToken[]>([]);
  const [tokensLoading, setTokensLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'top' | 'recent'>('recent');
  const [showTokens, setShowTokens] = useState(false);
  const [tokenPage, setTokenPage] = useState(1);
  const tokensPerPage = 24;
  const [totalSupply, setTotalSupply] = useState(0);
  const [mintedTokenIds, setMintedTokenIds] = useState<Set<number>>(new Set());
  const [selectedToken, setSelectedToken] = useState<NFTToken | null>(null);
  const [tokensViewMode, setTokensViewMode] = useState<'grid' | 'list'>('grid');
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const [tableCurrentPage, setTableCurrentPage] = useState(1);
  const tablePageSize = 10;

  const fetchMarketData = async () => {
    try {
      const response = await fetch('https://markets.krc20.stream/krc721/mainnet/markets');
      if (!response.ok) {
        throw new Error('Failed to fetch market data');
      }
      const data = await response.json();
      setMarketData(data);
      return data;
    } catch (error) {
      console.error('Error fetching market data:', error);
      return {};
    }
  };

  const fetchCollections = async (offset = 0) => {
    try {
      setLoading(true);
      const response = await fetch(`https://mainnet.krc721.stream/api/v1/krc721/mainnet/nfts?offset=${offset}`);

      if (!response.ok) {
        throw new Error('Failed to fetch NFT data');
      }

      const data = await response.json();

      if (data && data.result) {
        const marketDataObj = await fetchMarketData();

        const processedCollections = data.result.map((nft: any) => {
          const market = marketDataObj[nft.tick] || {};

          const mintedPercentage = nft.max && nft.minted
            ? (parseInt(nft.minted) / parseInt(nft.max)) * 100
            : undefined;

          return {
            tick: nft.tick,
            floor_price: market.floor_price || 0,
            total_volume: market.total_volume || 0,
            volume_24h: market.volume_24h || 0,
            change_24h: market.change_24h || 0,
            total_supply: nft.max ? parseInt(nft.max) : undefined,
            minted_count: nft.minted ? parseInt(nft.minted) : 0,
            minted_percentage: mintedPercentage,
            thumbnail_url: `https://cache.krc721.stream/krc721/mainnet/thumbnail/${nft.tick}/1`,
            deployer: nft.deployer,
            buri: nft.buri,
            royaltyFee: nft.royaltyFee,
            premint: nft.premint ? parseInt(nft.premint) : 0,
            last_updated: nft.updated
          };
        });

        const nextOffset = data.next;

        setPaginationData({
          offset,
          next: nextOffset,
          hasMore: nextOffset !== undefined && nextOffset !== null
        });

        setCollections(prev => {
          if (offset === 0) {
            return processedCollections;
          } else {
            return [...prev, ...processedCollections];
          }
        });

        if (offset === 0 && nextOffset) {
          fetchAllCollections(nextOffset);
        }
      }
    } catch (error) {
      console.error('Error fetching collections:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAllCollections = async (nextOffset: number) => {
    try {
      while (nextOffset) {
        const response = await fetch(`https://mainnet.krc721.stream/api/v1/krc721/mainnet/nfts?offset=${nextOffset}`);

        if (!response.ok) {
          throw new Error('Failed to fetch additional NFT data');
        }

        const data = await response.json();

        if (data && data.result) {
          const marketDataObj = await fetchMarketData();

          const processedCollections = data.result.map((nft: any) => {
            const market = marketDataObj[nft.tick] || {};

            const mintedPercentage = nft.max && nft.minted
              ? (parseInt(nft.minted) / parseInt(nft.max)) * 100
              : undefined;

            return {
              tick: nft.tick,
              floor_price: market.floor_price || 0,
              total_volume: market.total_volume || 0,
              volume_24h: market.volume_24h || 0,
              change_24h: market.change_24h || 0,
              total_supply: nft.max ? parseInt(nft.max) : undefined,
              minted_count: nft.minted ? parseInt(nft.minted) : 0,
              minted_percentage: mintedPercentage,
              thumbnail_url: `https://cache.krc721.stream/krc721/mainnet/thumbnail/${nft.tick}/1`,
              deployer: nft.deployer,
              buri: nft.buri,
              royaltyFee: nft.royaltyFee,
              premint: nft.premint ? parseInt(nft.premint) : 0,
              last_updated: nft.updated
            };
          });

          setCollections(prev => [...prev, ...processedCollections]);

          nextOffset = data.next;

          setPaginationData({
            offset: nextOffset || 0,
            next: nextOffset,
            hasMore: !!nextOffset
          });

          await new Promise(resolve => setTimeout(resolve, 50));
        } else {

          break;
        }
      }
    } catch (error) {
      console.error('Error fetching all collections:', error);
    }
  };

  const fetchTokensForCollection = async (collection: NFTCollection) => {
    try {
      setTokensLoading(true);

      const response = await fetch(`/api/krc721/new-mints?tick=${collection.tick}`);

      if (!response.ok) {
        throw new Error(`Failed to fetch tokens for ${collection.tick}`);
      }

      const responseData = await response.json();

      if (!responseData.success || !responseData.data || responseData.data.length === 0) {
        throw new Error(`No data found for collection ${collection.tick}`);
      }

      const collectionData = responseData.data[0];
      const totalSupply = collectionData.total_supply || collection.total_supply || 500;
      const mintedIds = new Set<number>();

      if (collectionData.minted_ids) {
        collectionData.minted_ids.forEach((id: number) => mintedIds.add(id));
      }

      setMintedTokenIds(mintedIds);
      setTotalSupply(totalSupply);

      const tokens: NFTToken[] = [];
      for (let i = 1; i <= totalSupply; i++) {
        tokens.push({
          id: i,
          image_url: `https://cache.krc721.stream/krc721/mainnet/thumbnail/${collection.tick}/${i}`,
          minted: mintedIds.has(i)
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
          image_url: `https://cache.krc721.stream/krc721/mainnet/thumbnail/${collection.tick}/${i}`,
          minted: false
        });
      }

      setTokens(fallbackTokens);
      setShowTokens(true);
    } finally {
      setTokensLoading(false);
    }
  };

  const fetchTokenMetadata = async (tick: string, id: number) => {
    try {
      const url = `https://cache.krc721.stream/krc721/mainnet/metadata/${tick}/${id}`;
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`Failed to fetch metadata: ${response.statusText}`);
      }

      const metadata = await response.json();

      setTokens(prevTokens => {
        return prevTokens.map(token => {
          if (token.id === id) {
            return { ...token, metadata };
          }
          return token;
        });
      });

      return metadata;
    } catch (error) {
      console.error(`Error fetching metadata for ${tick}/${id}:`, error);
      return null;
    }
  };

  const loadMoreCollections = async () => {
    if (paginationData.hasMore && !loading) {
      await fetchCollections(paginationData.next);
    }
  };

  useEffect(() => {
    let filtered = [...collections];

    if (searchQuery) {
      filtered = filtered.filter(c =>
        c.tick.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }


    filtered = filtered.sort((a, b) => {
      const dateA = a.last_updated ? new Date(a.last_updated).getTime() : 0;
      const dateB = b.last_updated ? new Date(b.last_updated).getTime() : 0;
      return dateB - dateA;
    });

    if (activeTab === 'top') {
      filtered = filtered
        .sort((a, b) => (b.total_volume || 0) - (a.total_volume || 0));
    }

    setFilteredCollections(filtered);
  }, [collections, searchQuery, activeTab]);

  useEffect(() => {
    fetchCollections();
  }, []);

  const refreshData = async () => {
    setRefreshing(true);
    await fetchMarketData();
    await fetchCollections(0);
    if (selectedCollection) {
      await fetchTokensForCollection(selectedCollection);
    }
    setRefreshing(false);
  };

  const handleCollectionClick = (tick: string) => {
    const collection = collections.find(c => c.tick === tick);
    if (collection) {
      setSelectedCollection(collection);
      fetchTokensForCollection(collection);
    }
  };

  const handleTokenClick = async (id: number) => {
    if (selectedCollection) {
      const token = tokens.find(t => t.id === id);
      if (token) {
        if (!token.metadata) {
          const metadata = await fetchTokenMetadata(selectedCollection.tick, id);
          if (metadata) {
            setSelectedToken({
              ...token,
              metadata
            });
          } else {
            setSelectedToken(token);
          }
        } else {
          setSelectedToken(token);
        }
      }
    }
  };

  const handleBackClick = () => {
    setShowTokens(false);
    setSelectedToken(null);
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

  const paginatedTokens = useMemo(() => {
    const startIndex = (tokenPage - 1) * tokensPerPage;
    const endIndex = startIndex + tokensPerPage;
    return tokens.slice(startIndex, endIndex);
  }, [tokens, tokenPage, tokensPerPage]);

  const paginatedTableData = useMemo(() => {
    const startIndex = (tableCurrentPage - 1) * tablePageSize;
    const endIndex = startIndex + tablePageSize;
    return filteredCollections.slice(startIndex, endIndex);
  }, [filteredCollections, tableCurrentPage, tablePageSize]);

  const maxTokenPage = Math.ceil(tokens.length / tokensPerPage);
  const totalTablePages = Math.ceil(filteredCollections.length / tablePageSize);

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
      <div className="flex flex-col space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="relative w-full sm:max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              type="text"
              placeholder="Search collections..."
              className="w-full pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={refreshData}
              disabled={refreshing}
              className="relative"
            >
              {refreshing ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <RefreshCw className="h-4 w-4 mr-2" />
              )}
              Refresh
              {refreshing && (
                <span className="animate-ping absolute h-2 w-2 rounded-full bg-primary opacity-75 top-0 right-0"></span>
              )}
            </Button>
          </div>
        </div>

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
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => scrollHorizontally('left')}
                        className="h-8 w-8"
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => scrollHorizontally('right')}
                        className="h-8 w-8"
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {loading && collections.length === 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                      {Array(5).fill(0).map((_, i) => (
                        <Card key={`skeleton-${i}`}>
                          <CardContent className="p-0">
                            <Skeleton className="h-48 w-full rounded-t-lg" />
                            <div className="p-4 space-y-2">
                              <Skeleton className="h-6 w-24" />
                              <Skeleton className="h-4 w-full" />
                              <Skeleton className="h-4 w-3/4" />
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <motion.div
                      ref={scrollContainerRef}
                      className="flex space-x-4 pb-4 overflow-x-auto scrollbar-hide"
                      drag="x"
                      dragConstraints={{ left: 0, right: 0 }}
                      style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                    >
                      {[...collections]
                        .sort((a, b) => {
                          const dateA = a.last_updated ? new Date(a.last_updated).getTime() : 0;
                          const dateB = b.last_updated ? new Date(b.last_updated).getTime() : 0;
                          return dateB - dateA;
                        })
                        .slice(0, 20)
                        .map((collection) => (
                          <motion.div
                            key={collection.tick}
                            className="flex-shrink-0 w-64"
                            whileHover={{ scale: 1.03 }}
                            whileTap={{ scale: 0.98 }}
                            variants={item}
                          >
                            <CollectionItem
                              collection={collection}
                              isSelected={selectedCollection?.tick === collection.tick}
                              onClick={() => handleCollectionClick(collection.tick)}
                            />
                          </motion.div>
                        ))}

                      {filteredCollections.length === 0 && !loading && (
                        <div className="flex-1 text-center py-8 text-muted-foreground">
                          No collections found matching your search
                        </div>
                      )}
                    </motion.div>
                  )}
                </div>
              </div>

              <div className="mb-6 flex overflow-x-auto border-b">
                <button
                  className={`px-4 py-2 font-medium border-b-2 whitespace-nowrap transition-colors ${activeTab === 'top' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
                  onClick={() => setActiveTab('top')}
                >
                  <BarChart3 className="w-4 h-4 inline-block mr-2" />
                  <span>Top Volume</span>
                </button>
                <button
                  className={`px-4 py-2 font-medium border-b-2 whitespace-nowrap transition-colors ${activeTab === 'recent' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
                  onClick={() => setActiveTab('recent')}
                >
                  <Clock className="w-4 h-4 inline-block mr-2" />
                  <span>Recent</span>
                </button>
              </div>

              <CollectionTable
                collections={paginatedTableData}
                isLoading={loading && collections.length === 0}
                selectedCollection={selectedCollection?.tick || null}
                onSelectCollection={handleCollectionClick}
                currentPage={tableCurrentPage}
                pageSize={tablePageSize}
                onPageChange={setTableCurrentPage}
                totalPages={totalTablePages}
              />
            </motion.div>
          ) : (
            <motion.div
              key="tokens"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="mb-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleBackClick}
                  className="flex items-center"
                >
                  <ChevronLeft className="mr-1 w-4 h-4" />
                  Back to Collections
                </Button>
              </div>

              {selectedCollection && (
                <Card className="mb-6">
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row gap-6">
                      <div className="w-full md:w-40 h-40 rounded-md overflow-hidden flex-shrink-0">
                        {selectedCollection.thumbnail_url ? (
                          <img
                            src={selectedCollection.thumbnail_url}
                            alt={selectedCollection.tick}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48bGluZWFyR3JhZGllbnQgaWQ9ImEiIHgxPSIwJSIgeTE9IjAlIiB4Mj0iMTAwJSIgeTI9IjEwMCUiPjxzdG9wIG9mZnNldD0iMCUiIHN0b3AtY29sb3I9IiNhMDU1ZjciIHN0b3Atb3BhY2l0eT0iLjIiLz48c3RvcCBvZmZzZXQ9IjEwMCUiIHN0b3AtY29sb3I9IiMzYjgyZjYiIHN0b3Atb3BhY2l0eT0iLjIiLz48L2xpbmVhckdyYWRpZW50PjwvZGVmcz48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0idXJsKCNhKSIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0ic2Fucy1zZXJpZiIgZm9udC1zaXplPSIyNCIgZm9udC13ZWlnaHQ9IjUwMCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZG9taW5hbnQtYmFzZWxpbmU9Im1pZGRsZSIgZmlsbD0icmdiYSgxMDAsMTAwLDEwMCwwLjgpIj5ObyBJbWFnZTwvdGV4dD48L3N2Zz4=';
                            }}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-primary/5">
                            <span className="text-3xl font-bold text-primary/40">{selectedCollection.tick}</span>
                          </div>
                        )}
                      </div>

                      <div className="flex-1">
                        <h2 className="text-2xl font-bold mb-2">{selectedCollection.tick}</h2>

                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-4">
                          <div>
                            <p className="text-sm text-muted-foreground">Floor Price</p>
                            <p className="text-lg font-bold">{selectedCollection.floor_price ? `${selectedCollection.floor_price} KAS` : 'N/A'}</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">24h Volume</p>
                            <p className="text-lg font-bold">{selectedCollection.volume_24h ? `${formatNumber(selectedCollection.volume_24h)} KAS` : 'N/A'}</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Total Volume</p>
                            <p className="text-lg font-bold">{selectedCollection.total_volume ? `${formatNumber(selectedCollection.total_volume)} KAS` : 'N/A'}</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Mint Progress</p>
                            <div className="flex items-center gap-2">
                              <div className="h-2 flex-1 bg-muted rounded-full overflow-hidden">
                                <div
                                  className={`h-full ${getProgressColorClass(selectedCollection.minted_percentage || 0)} rounded-full`}
                                  style={{ width: `${selectedCollection.minted_percentage || 0}%` }}
                                />
                              </div>
                              <span className="text-sm font-medium">
                                {Math.round(selectedCollection.minted_percentage || 0)}%
                              </span>
                            </div>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Supply</p>
                            <p className="text-lg font-bold">
                              {selectedCollection.minted_count || 0}/{selectedCollection.total_supply || '?'}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">24h Change</p>
                            <p className={`text-lg font-bold ${getColorClass(selectedCollection.change_24h)}`}>
                              {selectedCollection.change_24h !== undefined ? (
                                <>
                                  {selectedCollection.change_24h > 0 && <ArrowUpRight className="inline w-4 h-4 mr-1" />}
                                  {selectedCollection.change_24h < 0 && <ArrowDownRight className="inline w-4 h-4 mr-1" />}
                                  {formatChange(selectedCollection.change_24h)}
                                </>
                              ) : 'N/A'}
                            </p>
                          </div>
                        </div>

                        {selectedCollection.deployer && (
                          <div className="text-sm text-muted-foreground truncate">
                            <span className="font-medium">Deployer:</span> {selectedCollection.deployer}
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              <div className="mb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setTokenPage(p => Math.max(1, p - 1))}
                    disabled={tokenPage === 1}
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>

                  <span className="text-sm font-medium">
                    Page {tokenPage} of {maxTokenPage}
                  </span>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setTokenPage(p => Math.min(maxTokenPage, p + 1))}
                    disabled={tokenPage === maxTokenPage}
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <NFTTokenGrid
                tokens={paginatedTokens}
                isLoading={tokensLoading}
                onTokenClick={handleTokenClick}
              />

              {tokens.length > tokensPerPage && (
                <div className="flex justify-center items-center mt-6 gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setTokenPage(1)}
                    disabled={tokenPage === 1}
                  >
                    First
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setTokenPage(p => Math.max(1, p - 1))}
                    disabled={tokenPage === 1}
                  >
                    <ChevronLeft className="w-4 h-4 mr-1" />
                    Previous
                  </Button>

                  <div className="flex items-center gap-1">
                    {Array.from({ length: Math.min(5, maxTokenPage) }, (_, i) => {
                      let pageNum;
                      if (maxTokenPage <= 5) {
                        pageNum = i + 1;
                      } else if (tokenPage <= 3) {
                        pageNum = i + 1;
                      } else if (tokenPage >= maxTokenPage - 2) {
                        pageNum = maxTokenPage - 4 + i;
                      } else {
                        pageNum = tokenPage - 2 + i;
                      }

                      return (
                        <Button
                          key={pageNum}
                          variant={tokenPage === pageNum ? "default" : "outline"}
                          size="sm"
                          className="w-8 h-8 p-0"
                          onClick={() => setTokenPage(pageNum)}
                        >
                          {pageNum}
                        </Button>
                      );
                    })}
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setTokenPage(p => Math.min(maxTokenPage, p + 1))}
                    disabled={tokenPage === maxTokenPage}
                  >
                    Next
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setTokenPage(maxTokenPage)}
                    disabled={tokenPage === maxTokenPage}
                  >
                    Last
                  </Button>
                </div>
              )}

              {selectedToken && (
                <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                  <Card className="w-full max-w-2xl">
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="text-xl font-bold">
                            {selectedCollection?.tick} #{selectedToken.id}
                          </h3>
                          {selectedToken.metadata?.name && (
                            <p className="text-muted-foreground">{selectedToken.metadata.name}</p>
                          )}
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setSelectedToken(null)}
                        >
                          <ChevronLeft className="w-5 h-5" />
                        </Button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <div className="aspect-square rounded-md overflow-hidden bg-muted">
                            <img
                              src={selectedToken.image_url}
                              alt={`Token #${selectedToken.id}`}
                              className="w-full h-full object-contain"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48bGluZWFyR3JhZGllbnQgaWQ9ImEiIHgxPSIwJSIgeTE9IjAlIiB4Mj0iMTAwJSIgeTI9IjEwMCUiPjxzdG9wIG9mZnNldD0iMCUiIHN0b3AtY29sb3I9IiNhMDU1ZjciIHN0b3Atb3BhY2l0eT0iLjIiLz48c3RvcCBvZmZzZXQ9IjEwMCUiIHN0b3AtY29sb3I9IiMzYjgyZjYiIHN0b3Atb3BhY2l0eT0iLjIiLz48L2xpbmVhckdyYWRpZW50PjwvZGVmcz48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0idXJsKCNhKSIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0ic2Fucy1zZXJpZiIgZm9udC1zaXplPSIyNCIgZm9udC13ZWlnaHQ9IjUwMCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZG9taW5hbnQtYmFzZWxpbmU9Im1pZGRsZSIgZmlsbD0icmdiYSgxMDAsMTAwLDEwMCwwLjgpIj5ObyBJbWFnZTwvdGV4dD48L3N2Zz4=';
                              }}
                            />
                          </div>

                          <div className="flex justify-between items-center mt-4">
                            <Badge variant={selectedToken.minted ? "default" : "secondary"}>
                              {selectedToken.minted ? "Minted" : "Not Minted"}
                            </Badge>
                          </div>
                        </div>

                        <div>
                          {selectedToken.metadata?.description && (
                            <div className="mb-4">
                              <h4 className="text-sm font-medium text-muted-foreground mb-1">Description</h4>
                              <p className="text-sm whitespace-pre-wrap">{selectedToken.metadata.description}</p>
                            </div>
                          )}

                          {selectedToken.metadata?.attributes && selectedToken.metadata.attributes.length > 0 && (
                            <div>
                              <h4 className="text-sm font-medium text-muted-foreground mb-2">Attributes</h4>
                              <div className="grid grid-cols-2 gap-2">
                                {selectedToken.metadata.attributes.map((attr, i) => (
                                  <div key={i} className="border rounded-md p-2 bg-muted/10">
                                    <div className="text-xs text-muted-foreground">{attr.trait_type}</div>
                                    <div className="font-medium text-sm truncate">{attr.value}</div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default KRC721Explorer;