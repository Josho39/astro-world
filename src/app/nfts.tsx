import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import Image from 'next/image';
import { Separator } from '@/components/ui/separator';

export const NFTsTab = ({ 
  isLoading, 
  nftHoldings, 
  trendingCollections, 
  nftMarketStats,
  walletConnected,
  navigateToNFTExplorer 
}) => {
  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold">NFT Explorer</h2>
          <p className="text-sm text-muted-foreground">Discover, track, and analyze NFT collections</p>
        </div>
      </div>

      {/* NFT Holdings - Full Width */}
      {walletConnected && nftHoldings.length > 0 && (
        <Card>
          <CardHeader className="p-4 flex flex-row items-center justify-between">
            <CardTitle className="text-lg">Your NFT Holdings</CardTitle>
            <div className="bg-primary/10 text-primary font-medium text-sm py-1 px-3 rounded-full">
              {nftHoldings.length} Assets
            </div>
          </CardHeader>
          <CardContent className="px-6 pb-6 pt-2">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {nftHoldings.map((nft, idx) => (
                <div key={idx} className="flex flex-col bg-accent/5 rounded-xl overflow-hidden hover:shadow-lg transition-all hover:scale-[1.02] hover:bg-accent/10 cursor-pointer border border-border/40">
                  <div className="aspect-square w-full overflow-hidden bg-muted relative group">
                    <img
                      src={nft.image || `/kas.png`}
                      alt={nft.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      onError={(e) => { e.currentTarget.src = `/kas.png` }}
                    />
                    <div className="absolute bottom-0 left-0 w-full p-1.5 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="text-xs font-medium text-white truncate">{nft.name}</div>
                    </div>
                  </div>
                  <div className="p-3">
                    <div className="text-sm font-medium truncate">{nft.name}</div>
                    <div className="flex items-center justify-between mt-1">
                      <div className="text-xs text-muted-foreground">{nft.collection}</div>
                      <div className="text-xs font-bold text-primary">{nft.value} KAS</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Trending Collections & Market Stats - Side by Side */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="h-full">
          <CardHeader className="p-4">
            <CardTitle className="text-lg">Trending Collections</CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4 pt-0">
            <div className="grid grid-cols-1 gap-3">
              {isLoading ? (
                Array(3).fill(0).map((_, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 border rounded-md animate-pulse">
                    <div className="h-14 w-14 rounded-md bg-muted"></div>
                    <div className="flex-1">
                      <div className="h-5 w-36 bg-muted rounded mb-2"></div>
                      <div className="h-4 w-48 bg-muted rounded"></div>
                    </div>
                    <div className="h-10 w-20 bg-muted rounded"></div>
                  </div>
                ))
              ) : trendingCollections.length > 0 ? (
                trendingCollections
                  .slice(0, 5)
                  .map((collection, index) => (
                    <div 
                      key={index} 
                      className="flex items-center justify-between p-3 border rounded-md hover:bg-accent/10 transition-colors cursor-pointer"
                      onClick={navigateToNFTExplorer}
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-14 w-14 rounded-md overflow-hidden bg-muted">
                          <img
                            src={collection.thumbnail_url || `/kas.png`}
                            alt={collection.tick}
                            className="w-full h-full object-cover"
                            onError={(e) => { e.currentTarget.src = `/kas.png` }}
                          />
                        </div>
                        <div>
                          <h3 className="font-bold">{collection.tick}</h3>
                          <div className="grid grid-cols-3 gap-2 mt-1">
                            <div className="flex flex-col">
                              <span className="text-xs text-muted-foreground">Floor</span>
                              <span className="text-sm font-medium">{collection.floorPrice} KAS</span>
                            </div>
                            <div className="flex flex-col">
                              <span className="text-xs text-muted-foreground">Volume</span>
                              <span className="text-sm font-medium">{(collection.volume24h / 1000).toFixed(1)}K</span>
                            </div>
                            <div className="flex flex-col">
                              <span className="text-xs text-muted-foreground">Supply</span>
                              <span className="text-sm font-medium">{collection.totalSupply}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col items-end">
                        <div className={parseFloat(collection.change24h) >= 0 ? 'text-green-500' : 'text-red-500'}>
                          {parseFloat(collection.change24h) >= 0 ? '+' : ''}{collection.change24h}%
                        </div>
                        <span className="text-xs text-muted-foreground">24h Change</span>
                      </div>
                    </div>
                  ))
              ) : (
                <div className="p-6 text-center text-muted-foreground">
                  No trending collections found
                </div>
              )}
            </div>
          </CardContent>
        </Card>
        
        <Card className="h-full">
          <CardHeader className="p-4">
            <CardTitle className="text-lg">Market Stats</CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4 pt-0">
            <div className="space-y-4">
              <div className="bg-blue-500/10 rounded-md p-3 border border-blue-500/20">
                <p className="text-xs text-muted-foreground">Total Volume (24h)</p>
                <h3 className="text-xl font-bold">{(nftMarketStats.totalVolume / 1000).toFixed(1)}K KAS</h3>
              </div>
              
              <div>
                <h4 className="text-sm font-medium mb-2">Top Floor Price Changes</h4>
                <div className="space-y-2">
                  {nftMarketStats.floorChanges.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between">
                      <span className="text-xs">{item.name}</span>
                      <div className="flex items-baseline gap-2">
                        <span className="text-xs text-muted-foreground">{item.floorPrice} KAS</span>
                        <span className={`text-xs ${item.change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                          {item.change >= 0 ? '+' : ''}{item.change.toFixed(2)}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <Separator />
              
              <div>
                <h4 className="text-sm font-medium mb-2">Recent Sales</h4>
                <div className="space-y-2">
                  {nftMarketStats.topSales.map((sale, idx) => (
                    <div key={idx} className="flex items-center justify-between">
                      <div>
                        <span className="text-xs font-medium">{sale.collection} {sale.item}</span>
                        <div className="text-xs text-muted-foreground">{sale.time}</div>
                      </div>
                      <span className="text-xs font-medium">{sale.price} KAS</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default NFTsTab;