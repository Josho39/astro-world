'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Bell, BellOff, RefreshCw, Search, Loader2, AlertCircle, Info, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import _ from 'lodash';

interface NFTCollection {
    tick: string;
    minted_count: number;
    total_supply?: number;
    last_update: string;
    watched: boolean;
    recent_mints?: NFTMint[];
}

interface NFTMint {
    tick: string;
    id: number;
    timestamp: string;
    thumbnail_url?: string;
    current_mint_position?: number;
    total_supply?: number;
    metadata?: NFTMetadata;
}

interface NFTMetadata {
    name?: string;
    description?: string;
    image?: string;
    attributes?: { trait_type: string; value: string }[];
}

const MintWatcher = () => {
    const [collections, setCollections] = useState<NFTCollection[]>([]);
    const [watchedCollections, setWatchedCollections] = useState<Set<string>>(new Set());
    const [recentMints, setRecentMints] = useState<NFTMint[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [showOnlyWatched, setShowOnlyWatched] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isNotificationDialogOpen, setIsNotificationDialogOpen] = useState(false);
    const [notificationsEnabled, setNotificationsEnabled] = useState(false);
    const [activeTab, setActiveTab] = useState('recent-mints');
    const [selectedCollection, setSelectedCollection] = useState<string | null>(null);
    const [flippedCards, setFlippedCards] = useState<Set<string>>(new Set());

    useEffect(() => {
        const savedWatches = localStorage.getItem('nftWatchedCollections');
        if (savedWatches) {
            setWatchedCollections(new Set(JSON.parse(savedWatches)));
        }

        if (typeof window !== 'undefined' && 'Notification' in window) {
            if (Notification.permission === 'granted') {
                setNotificationsEnabled(true);
            }
        }

        fetchData();
    }, []);

    const requestNotificationPermission = async () => {
        if (typeof window !== 'undefined' && 'Notification' in window) {
            const permission = await Notification.requestPermission();
            if (permission === 'granted') {
                setNotificationsEnabled(true);
                setIsNotificationDialogOpen(false);
                new Notification('Mint Watcher Notifications Enabled', {
                    body: 'You will be notified of new mints for watched collections',
                    icon: '/logo.png'
                });
            } else {
                setNotificationsEnabled(false);
            }
        }
    };

    const showNotification = (tick: string, id: number) => {
        if (notificationsEnabled && typeof window !== 'undefined' && 'Notification' in window) {
            new Notification(`New Mint: ${tick}`, {
                body: `ID #${id} was just minted`,
                icon: '/logo.png'
            });
        }
    };

    const fetchData = async () => {
        try {
            setIsLoading(true);
            setError(null);
            
            await fetchCollectionDetails();
            await fetchRecentMints();
            
        } catch (error) {
            console.error('Error fetching data:', error);
            setError('Failed to load data. Please try again later.');
        } finally {
            setIsLoading(false);
        }
    };

    const fetchCollectionDetails = async () => {
        try {
            const response = await fetch('/api/krc721/new-mints');

            if (!response.ok) {
                throw new Error('Failed to fetch collection details');
            }

            const data = await response.json();
            
            if (data.success && data.data) {
                const collectionDocs = data.data;
                
                const collectionsMap = new Map<string, NFTCollection>();

                collectionDocs.forEach((doc: { tick: any; minted_count: any; total_supply: any; last_updated: any; }) => {
                    const tick = doc.tick;
                    collectionsMap.set(tick, {
                        tick,
                        minted_count: doc.minted_count || 0,
                        total_supply: doc.total_supply || 0,
                        last_update: doc.last_updated || new Date().toISOString(),
                        watched: watchedCollections.has(tick),
                        recent_mints: []
                    });
                });

                setCollections(Array.from(collectionsMap.values()));
            }
            
            return true;
        } catch (error) {
            console.error('Error fetching collection details:', error);
            return false;
        }
    };

    const fetchRecentMints = async () => {
        try {
            const response = await fetch('/api/krc721/new-mints/recent');

            if (!response.ok) {
                throw new Error('Failed to fetch recent mints');
            }

            const data = await response.json();
            
            if (data.success && data.data) {
                const fetchedMints = data.data.map((mint: any) => ({
                    tick: mint.tick,
                    id: mint.id,
                    timestamp: mint.timestamp,
                    thumbnail_url: mint.thumbnail_url,
                    current_mint_position: mint.current_mint_position,
                    total_supply: mint.total_supply
                }));
                
                setRecentMints(fetchedMints);
                
                fetchedMints.forEach((mint: { tick: string; id: number; }) => {
                    if (watchedCollections.has(mint.tick)) {
                        showNotification(mint.tick, mint.id);
                    }
                });
            }
            
            return true;
        } catch (error) {
            console.error('Error fetching recent mints:', error);
            return false;
        }
    };

    const fetchMetadata = async (tick: string, id: number) => {
        try {
            const url = `https://cache.krc721.stream/krc721/mainnet/metadata/${tick}/${id}`;
            const response = await fetch(url);
            
            if (!response.ok) {
                throw new Error(`Failed to fetch metadata: ${response.statusText}`);
            }
            
            const metadata = await response.json();
            
            setRecentMints(prevMints => 
                prevMints.map(mint => 
                    mint.tick === tick && mint.id === id 
                        ? { ...mint, metadata } 
                        : mint
                )
            );
        } catch (error) {
            console.error(`Error fetching metadata for ${tick}/${id}:`, error);
        }
    };

    const toggleCardFlip = (tick: string, id: number) => {
        const cardId = `${tick}-${id}`;
        setFlippedCards(prev => {
            const newSet = new Set(prev);
            if (newSet.has(cardId)) {
                newSet.delete(cardId);
            } else {
                newSet.add(cardId);
                if (!recentMints.find(m => m.tick === tick && m.id === id)?.metadata) {
                    fetchMetadata(tick, id);
                }
            }
            return newSet;
        });
    };

    const refreshData = async () => {
        try {
            setIsRefreshing(true);
            setError(null);

            const scanResponse = await fetch('/api/krc721/new-mints/scan', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: selectedCollection ? JSON.stringify({ tick: selectedCollection }) : JSON.stringify({}),
            });

            if (!scanResponse.ok) {
                throw new Error('Scan failed');
            }

            await fetchCollectionDetails();
            await fetchRecentMints();

        } catch (error) {
            console.error('Error refreshing data:', error);
            setError('Failed to refresh data. Please try again later.');
        } finally {
            setIsRefreshing(false);
        }
    };

    const toggleWatch = (tick: string) => {
        const newWatched = new Set(watchedCollections);

        if (newWatched.has(tick)) {
            newWatched.delete(tick);
        } else {
            newWatched.add(tick);
            if (!notificationsEnabled) {
                setIsNotificationDialogOpen(true);
            }
        }

        setWatchedCollections(newWatched);
        localStorage.setItem('nftWatchedCollections', JSON.stringify(Array.from(newWatched)));

        setCollections(prev =>
            prev.map(collection =>
                collection.tick === tick
                    ? { ...collection, watched: newWatched.has(tick) }
                    : collection
            )
        );
    };

    const filteredCollections = collections
        .filter(collection => {
            if (showOnlyWatched && !collection.watched) return false;
            if (searchQuery && !collection.tick.toLowerCase().includes(searchQuery.toLowerCase())) return false;
            return true;
        })
        .sort((a, b) => {
            if (a.watched && !b.watched) return -1;
            if (!a.watched && b.watched) return 1;
            return a.tick.localeCompare(b.tick);
        });

    const filteredMints = recentMints.filter(mint => {
        if (activeTab === 'recent-mints' && searchQuery) {
            const lowerQuery = searchQuery.toLowerCase();
            const matchesTick = mint.tick.toLowerCase().includes(lowerQuery);
            const matchesId = mint.id.toString().includes(lowerQuery);
            if (!matchesTick && !matchesId) return false;
        }
        if (selectedCollection && mint.tick !== selectedCollection) return false;
        return true;
    });

    const formatTimeAgo = (timestamp: string) => {
        const date = new Date(timestamp);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffSec = Math.floor(diffMs / 1000);

        if (diffSec < 60) return `${diffSec}s ago`;
        if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`;
        if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}h ago`;
        return `${Math.floor(diffSec / 86400)}d ago`;
    };

    const handleCollectionClick = (tick: string) => {
        setSelectedCollection(prevSelected => prevSelected === tick ? null : tick);
        setActiveTab('recent-mints');
    };

    const clearCollectionFilter = () => {
        setSelectedCollection(null);
    };

    return (
        <Card className="w-full border">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-8 rounded-t-xl">
                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight">NFT Mint Watcher</h1>
                            <p className="text-muted-foreground mt-1">Track real-time NFT mints across collections</p>
                        </div>
                        <Button 
                            onClick={refreshData} 
                            disabled={isRefreshing} 
                            size="sm"
                            className="bg-primary/90 hover:bg-primary"
                        >
                            {isRefreshing ? (
                                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                            ) : (
                                <RefreshCw className="h-4 w-4 mr-2" />
                            )}
                            Refresh Data
                        </Button>
                    </div>
                    
                    <div className="mt-6 flex flex-col sm:flex-row gap-4">
                        <div className="flex-1 relative">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                type="text"
                                placeholder={activeTab === 'recent-mints' ? "Search by ticker or ID..." : "Search collections..."}
                                className="pl-8 bg-background/80 border-primary/20"
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <div className="flex items-center space-x-4">
                            <div className="flex items-center space-x-2">
                                <Switch
                                    id="watch-filter"
                                    checked={showOnlyWatched}
                                    onCheckedChange={setShowOnlyWatched}
                                />
                                <Label htmlFor="watch-filter">Watched only</Label>
                            </div>
                        </div>
                    </div>
                    
                    <div className="mt-6">
                        <TabsList className="grid grid-cols-2 w-full max-w-md mx-auto">
                            <TabsTrigger value="recent-mints" className="rounded-l-md">Recent Mints</TabsTrigger>
                            <TabsTrigger value="collections" className="rounded-r-md">Collections</TabsTrigger>
                        </TabsList>
                    </div>
                </div>

                <div className="p-6">
                    <TabsContent value="recent-mints" className="mt-0 space-y-6">
                        <div className="flex justify-between items-center">
                            <h3 className="text-lg font-medium flex items-center gap-2">
                                {selectedCollection ? (
                                    <>
                                        <Badge variant="secondary" className="py-1 px-3 text-sm">
                                            {selectedCollection}
                                        </Badge>
                                        <span className="text-muted-foreground text-sm">Recent Mints</span>
                                    </>
                                ) : (
                                    "All Recent Mints"
                                )}
                            </h3>
                            {selectedCollection && (
                                <Button variant="outline" size="sm" onClick={clearCollectionFilter}>
                                    View All Collections
                                </Button>
                            )}
                        </div>
                        
                        {isLoading ? (
                            <div className="text-center py-12 text-muted-foreground bg-card border rounded-xl flex flex-col items-center justify-center">
                                <Loader2 className="h-8 w-8 animate-spin mb-4" />
                                <p>Loading recent mints...</p>
                            </div>
                        ) : filteredMints.length === 0 ? (
                            <div className="text-center py-16 text-muted-foreground bg-card border rounded-xl">
                                <Info className="h-12 w-12 mx-auto mb-3 opacity-50" />
                                <p className="text-lg font-medium">No recent mints found</p>
                                <p className="text-sm mt-1 max-w-md mx-auto">Try refreshing or check back later for updates on new mints.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
                                {filteredMints.map((mint, index) => {
                                    const isFlipped = flippedCards.has(`${mint.tick}-${mint.id}`);
                                    return (
                                        <div key={`${mint.tick}-${mint.id}-${index}`} className="group perspective-1000 h-[320px]">
                                            <div 
                                                className={cn(
                                                    "relative w-full h-full transition-transform duration-500 transform-style-3d cursor-pointer",
                                                    isFlipped ? "rotate-y-180" : ""
                                                )}
                                                onClick={() => toggleCardFlip(mint.tick, mint.id)}
                                            >
                                                <div className="absolute w-full h-full backface-hidden rounded-xl overflow-hidden border bg-card">
                                                    <div className="relative w-[full] h-[full] bg-muted">
                                                        {mint.thumbnail_url ? (
                                                            <img 
                                                                src={mint.thumbnail_url} 
                                                                alt={`${mint.tick} #${mint.id}`} 
                                                                className="w-full h-full object-cover"
                                                                onError={(e) => {
                                                                    (e.target as HTMLImageElement).src = "/placeholder-nft.png";
                                                                }}
                                                            />
                                                        ) : (
                                                            <div className="w-full h-full flex items-center justify-center">
                                                                <span className="text-muted-foreground">{mint.tick} #{mint.id}</span>
                                                            </div>
                                                        )}
                                                        <Badge className="absolute top-2 right-2 bg-background/80 backdrop-blur-sm text-foreground">
                                                            #{mint.id}
                                                        </Badge>
                                                    </div>
                                                    <div className="h-[40px] p-2 flex justify-between items-center">
                                                        <div className="font-medium truncate">
                                                            {mint.tick}
                                                        </div>
                                                        <div className="text-xs px-1.5 py-0.5 rounded bg-primary/10 text-primary whitespace-nowrap">
                                                            {formatTimeAgo(mint.timestamp)}
                                                        </div>
                                                    </div>
                                                </div>
                                                
                                                <div className="absolute w-full h-full backface-hidden rotate-y-180 rounded-xl overflow-hidden border bg-card p-3">
                                                    <div className="h-full flex flex-col">
                                                        <h3 className="text-sm font-bold truncate">
                                                            {mint.metadata?.name || `${mint.tick} #${mint.id}`}
                                                        </h3>
                                                        
                                                        <div className="mt-1 flex-1 overflow-y-auto text-xs">
                                                            {!mint.metadata ? (
                                                                <div className="h-full flex items-center justify-center">
                                                                    <Loader2 className="h-4 w-4 animate-spin" />
                                                                </div>
                                                            ) : (
                                                                <div>
                                                                    {mint.metadata.attributes && mint.metadata.attributes.length > 0 && (
                                                                        <div className="space-y-1 pt-1">
                                                                            <div className="grid grid-cols-2 gap-1">
                                                                                {mint.metadata.attributes.slice(0, 100).map((attr, idx) => (
                                                                                    <div 
                                                                                        key={idx} 
                                                                                        className="bg-primary/5 p-1 rounded truncate"
                                                                                    >
                                                                                        <span className="font-medium text-primary/70 text-[10px]">{attr.trait_type}: </span>
                                                                                        <span className="text-[10px]">{attr.value}</span>
                                                                                    </div>
                                                                                ))}
                                                                            </div>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            )}
                                                        </div>
                                                        
                                                        <div className="mt-2 flex justify-between items-center pt-2 border-t">
                                                            <span className="text-xs text-muted-foreground">
                                                                Tap to flip
                                                            </span>
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className={cn(
                                                                    "h-6 w-6",
                                                                    watchedCollections.has(mint.tick) ? "text-primary" : "text-muted-foreground"
                                                                )}
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    toggleWatch(mint.tick);
                                                                }}
                                                            >
                                                                {watchedCollections.has(mint.tick) ? <Bell className="h-3 w-3" /> : <BellOff className="h-3 w-3" />}
                                                            </Button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </TabsContent>
                    
                    <TabsContent value="collections" className="mt-0">
                        <div className="border rounded-md overflow-hidden">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-12"></TableHead>
                                        <TableHead>Collection</TableHead>
                                        <TableHead className="text-right">Minted</TableHead>
                                        <TableHead className="text-right">Total Supply</TableHead>
                                        <TableHead className="text-right">Progress</TableHead>
                                        <TableHead className="text-right">Last Updated</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {isLoading ? (
                                        <TableRow>
                                            <TableCell colSpan={6} className="h-24 text-center">
                                                <Loader2 className="h-5 w-5 animate-spin mx-auto" />
                                                <span className="block mt-2 text-sm text-muted-foreground">Loading collections...</span>
                                            </TableCell>
                                        </TableRow>
                                    ) : filteredCollections.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={6} className="h-24 text-center">
                                                <span className="text-muted-foreground">
                                                    {searchQuery ? 'No matching collections found' : 'No collections found'}
                                                </span>
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        filteredCollections.map(collection => (
                                            <TableRow
                                                key={collection.tick}
                                                className={cn(
                                                    collection.watched ? 'bg-primary/5' : '',
                                                    selectedCollection === collection.tick ? 'bg-secondary/30' : '',
                                                    "cursor-pointer hover:bg-secondary/10"
                                                )}
                                                onClick={() => handleCollectionClick(collection.tick)}
                                            >
                                                <TableCell className="p-2 text-center">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            toggleWatch(collection.tick);
                                                        }}
                                                        className={cn(
                                                            "h-8 w-8",
                                                            collection.watched ? "text-primary" : "text-muted-foreground"
                                                        )}
                                                    >
                                                        {collection.watched ? <Bell className="h-4 w-4" /> : <BellOff className="h-4 w-4" />}
                                                    </Button>
                                                </TableCell>
                                                <TableCell className="font-medium">{collection.tick}</TableCell>
                                                <TableCell className="text-right">{collection.minted_count.toLocaleString()}</TableCell>
                                                <TableCell className="text-right">
                                                    {collection.total_supply
                                                        ? collection.total_supply.toLocaleString()
                                                        : 'Unknown'}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    {collection.total_supply ? (
                                                        <TooltipProvider>
                                                            <Tooltip>
                                                                <TooltipTrigger asChild>
                                                                    <div className="flex items-center justify-end">
                                                                        <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                                                                            <div 
                                                                                className="h-full bg-primary rounded-full" 
                                                                                style={{ 
                                                                                    width: `${(collection.minted_count / collection.total_supply) * 100}%` 
                                                                                }}
                                                                            />
                                                                        </div>
                                                                    </div>
                                                                </TooltipTrigger>
                                                                <TooltipContent>
                                                                    <p>{Math.round((collection.minted_count / collection.total_supply) * 100)}% minted</p>
                                                                </TooltipContent>
                                                            </Tooltip>
                                                        </TooltipProvider>
                                                    ) : (
                                                        <span className="text-xs text-muted-foreground">-</span>
                                                    )}
                                                </TableCell>
                                                <TableCell className="text-right text-sm text-muted-foreground">
                                                    {formatTimeAgo(collection.last_update)}
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </TabsContent>
                </div>
            </Tabs>

            <AlertDialog open={isNotificationDialogOpen} onOpenChange={setIsNotificationDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Enable Notifications?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Would you like to receive notifications when new NFTs are minted for collections you're watching?
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>No Thanks</AlertDialogCancel>
                        <AlertDialogAction onClick={requestNotificationPermission}>
                            Enable Notifications
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {error && (
                <div className="fixed bottom-4 right-4 bg-destructive text-destructive-foreground p-4 rounded-lg shadow-lg flex items-center gap-2 max-w-md">
                    <AlertCircle className="h-5 w-5" />
                    <div>
                        <p className="font-semibold">Error</p>
                        <p className="text-sm">{error}</p>
                    </div>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="ml-auto"
                        onClick={() => setError(null)}
                    >
                        <X className="h-4 w-4" />
                    </Button>
                </div>
            )}
        </Card>
    );
};

export default MintWatcher;