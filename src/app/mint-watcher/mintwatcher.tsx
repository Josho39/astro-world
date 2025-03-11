'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Bell, RefreshCw, Search, Loader2, AlertCircle, Info, X, ChevronLeft, ChevronRight, LayoutGrid, LayoutList } from 'lucide-react';
import { cn } from '@/lib/utils';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Cell } from 'recharts';
import _ from 'lodash';

interface NFTCollection {
    tick: string;
    minted_count: number;
    total_supply?: number;
    last_update: string;
    watched: boolean;
    recent_mints?: NFTMint[];
}

interface NFTHolder {
    owner: string;
    count: number;
}

interface HolderData {
    ticker: string;
    totalSupply: number;
    totalMinted: number;
    totalMintedPercent: number;
    totalHolders: number;
    holders: NFTHolder[];
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

const HolderDistributionChart = ({ holders }: { holders: NFTHolder[] }) => {
    const ranges = [
        { name: '1', min: 1, max: 1 },
        { name: '2-5', min: 2, max: 5 },
        { name: '6-10', min: 6, max: 10 },
        { name: '11-25', min: 11, max: 25 },
        { name: '25+', min: 26, max: Infinity }
    ];

    const distribution = ranges.map(range => {
        const count = holders.filter(holder =>
            holder.count >= range.min && holder.count <= range.max
        ).length;

        return {
            name: range.name,
            count,
            color: getBarColor(range.name)
        };
    });

    function getBarColor(name: string) {
        switch (name) {
            case '1': return '#8884d8';
            case '2-5': return '#82ca9d';
            case '6-10': return '#ffc658';
            case '11-25': return '#ff8042';
            case '25+': return '#0088fe';
            default: return '#8884d8';
        }
    }

    return (
        <ResponsiveContainer width="100%" height="100%">
            <BarChart
                data={distribution}
                margin={{ top: 5, right: 5, left: 0, bottom: 5 }}
            >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <RechartsTooltip
                    formatter={(value: number) => [`${value} holders`, 'Count']}
                    labelFormatter={(label) => `${label} NFT${label !== '1' ? 's' : ''} per address`}
                />
                <Bar dataKey="count">
                    {distribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                </Bar>
            </BarChart>
        </ResponsiveContainer>
    );
};

const Pagination = ({
    totalItems,
    itemsPerPage,
    currentPage,
    onPageChange
}: {
    totalItems: number;
    itemsPerPage: number;
    currentPage: number;
    onPageChange: (page: number) => void;
}) => {
    const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));

    const goToPage = (page: number) => {
        const validPage = Math.max(1, Math.min(page, totalPages));
        onPageChange(validPage);
    };

    const renderPageNumbers = () => {
        const pages = [];
        const maxPageButtons = 5;

        let startPage = Math.max(1, currentPage - Math.floor(maxPageButtons / 2));
        let endPage = Math.min(totalPages, startPage + maxPageButtons - 1);

        if (endPage - startPage + 1 < maxPageButtons) {
            startPage = Math.max(1, endPage - maxPageButtons + 1);
        }

        if (startPage > 1) {
            pages.push(
                <Button
                    key="first"
                    variant="outline"
                    size="sm"
                    className="w-10 h-9"
                    onClick={() => goToPage(1)}
                >
                    1
                </Button>
            );

            if (startPage > 2) {
                pages.push(<span key="ellipsis1" className="px-2">...</span>);
            }
        }

        for (let i = startPage; i <= endPage; i++) {
            pages.push(
                <Button
                    key={i}
                    variant={i === currentPage ? "default" : "outline"}
                    size="sm"
                    className="w-10 h-9"
                    onClick={() => goToPage(i)}
                >
                    {i}
                </Button>
            );
        }

        if (endPage < totalPages) {
            if (endPage < totalPages - 1) {
                pages.push(<span key="ellipsis2" className="px-2">...</span>);
            }

            pages.push(
                <Button
                    key="last"
                    variant="outline"
                    size="sm"
                    className="w-10 h-9"
                    onClick={() => goToPage(totalPages)}
                >
                    {totalPages}
                </Button>
            );
        }

        return pages;
    };

    return (
        <div className="flex items-center justify-between mt-4 px-1">
            <div className="text-sm text-muted-foreground">
                Showing {Math.min(totalItems, (currentPage - 1) * itemsPerPage + 1)} to {Math.min(totalItems, currentPage * itemsPerPage)} of {totalItems} items
            </div>
            <div className="flex items-center space-x-2">
                <Button
                    variant="outline"
                    size="icon"
                    onClick={() => goToPage(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="h-9 w-9"
                >
                    <ChevronLeft className="h-4 w-4" />
                </Button>
                <div className="flex items-center">
                    {renderPageNumbers()}
                </div>
                <Button
                    variant="outline"
                    size="icon"
                    onClick={() => goToPage(currentPage + 1)}
                    disabled={currentPage >= totalPages}
                    className="h-9 w-9"
                >
                    <ChevronRight className="h-4 w-4" />
                </Button>
            </div>
        </div>
    );
};

const MintWatcher = () => {
    const [collections, setCollections] = useState<NFTCollection[]>([]);
    const [watchedCollections, setWatchedCollections] = useState<Set<string>>(new Set());
    const [recentMints, setRecentMints] = useState<NFTMint[]>([]);
    const [holderData, setHolderData] = useState<HolderData | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isHolderLoading, setIsHolderLoading] = useState(false);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [isNotificationDialogOpen, setIsNotificationDialogOpen] = useState(false);
    const [notificationsEnabled, setNotificationsEnabled] = useState(false);
    const [activeTab, setActiveTab] = useState('recent-mints');
    const [selectedCollection, setSelectedCollection] = useState<string | null>(null);
    const [flippedCards, setFlippedCards] = useState<Set<string>>(new Set());
    const [showWatchedOnly, setShowWatchedOnly] = useState(false);
    const [currentMintsPage, setCurrentMintsPage] = useState(1);
    const [mintsPerPage, setMintsPerPage] = useState(120);
    const [currentCollectionsPage, setCurrentCollectionsPage] = useState(1);
    const [collectionsPerPage, setCollectionsPerPage] = useState(50);
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const savedViewMode = typeof localStorage !== 'undefined' ? localStorage.getItem('nftViewMode') : null;

    useEffect(() => {
        const savedWatches = localStorage.getItem('nftWatchedCollections');
        if (savedWatches) {
            setWatchedCollections(new Set(JSON.parse(savedWatches)));
        }

        const savedSelectedCollection = localStorage.getItem('nftSelectedCollection');
        if (savedSelectedCollection) {
            setSelectedCollection(savedSelectedCollection);
        }

        if (savedViewMode && (savedViewMode === 'grid' || savedViewMode === 'list')) {
            setViewMode(savedViewMode as 'grid' | 'list');
        }

        if (typeof window !== 'undefined' && 'Notification' in window) {
            if (Notification.permission === 'granted') {
                setNotificationsEnabled(true);
            }
        }

        fetchData();
    }, []);

    useEffect(() => {
        if (selectedCollection && activeTab === 'holders') {
            fetchHolderData(selectedCollection);
        }
    }, [selectedCollection, activeTab]);

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

    const fetchHolderData = async (tick: string) => {
        try {
            setIsHolderLoading(true);
            setError(null);
            const response = await fetch(`/api/krc721/holders/${tick}`);

            if (!response.ok) {
                throw new Error(`Failed to fetch holder data for ${tick}`);
            }

            const data = await response.json();
            setHolderData(data);
        } catch (error) {
            console.error(`Error fetching holder data for ${tick}:`, error);
            setError(`Failed to load holder data for ${tick}. Please try again later.`);
            setHolderData(null);
        } finally {
            setIsHolderLoading(false);
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

    const toggleWatch = (tick: string, e?: React.MouseEvent) => {
        if (e) {
            e.stopPropagation();
        }

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

    const getProgressBarColor = (percentage: number) => {
        if (percentage < 25) return "bg-orange-500";
        if (percentage < 50) return "bg-yellow-500";
        if (percentage < 75) return "bg-blue-500";
        return "bg-green-500";
    };

    const filteredCollections = collections
        .filter(collection => {
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
        if (showWatchedOnly && !watchedCollections.has(mint.tick)) return false;
        return true;
    });

    const indexOfLastMint = currentMintsPage * mintsPerPage;
    const indexOfFirstMint = indexOfLastMint - mintsPerPage;
    const currentMints = filteredMints.slice(indexOfFirstMint, indexOfLastMint);
    const indexOfLastCollection = currentCollectionsPage * collectionsPerPage;
    const indexOfFirstCollection = indexOfLastCollection - collectionsPerPage;
    const currentCollections = filteredCollections.slice(indexOfFirstCollection, indexOfLastCollection);

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
        const newSelected = selectedCollection === tick ? null : tick;
        setSelectedCollection(newSelected);

        if (newSelected) {
            localStorage.setItem('nftSelectedCollection', newSelected);
        } else {
            localStorage.removeItem('nftSelectedCollection');
        }
    };

    const handleTabChange = (tab: string) => {
        setActiveTab(tab);
        if (tab === 'recent-mints') {
            setCurrentMintsPage(1);
        } else {
            setCurrentCollectionsPage(1);
        }
    };

    const clearCollectionFilter = () => {
        setSelectedCollection(null);
        setHolderData(null);
        localStorage.removeItem('nftSelectedCollection');
    };

    const toggleShowWatchedOnly = () => {
        setShowWatchedOnly(!showWatchedOnly);
        setCurrentMintsPage(1);
    };

    const toggleViewMode = () => {
        const newMode = viewMode === 'grid' ? 'list' : 'grid';
        setViewMode(newMode);
        localStorage.setItem('nftViewMode', newMode);
    };

    return (
        <div className="flex flex-col space-y-1">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-0 p-2">
                <div>
                    <div>
                        <CardTitle className="text-xl">Mint Watcher</CardTitle>
                        <p className="text-sm text-muted-foreground">Monitor NFT collection minting activity</p>
                    </div>
                </div>
                <div className="flex items-center gap-2 w-full md:w-auto mt-3 md:mt-0">
                    <div className="relative flex-1 md:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            type="text"
                            placeholder="Search..."
                            className="pl-9 h-9 bg-background/80 border-primary/20 w-full"
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            <Card className="w-full border">
                <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
                    <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-3 rounded-t-xl">
                        <div className="flex flex-col md:flex-row justify-between items-center gap-2">
                            <TabsList className="grid grid-cols-2 w-full md:w-48">
                                <TabsTrigger value="recent-mints" className="rounded-l-md">Recent Mints</TabsTrigger>
                                <TabsTrigger value="holders" className="rounded-r-md">Holders</TabsTrigger>
                            </TabsList>

                            <div className="flex items-center gap-2 w-full md:w-auto">
                                <div className="flex items-center space-x-2">
                                    <Switch
                                        id="watched-filter"
                                        checked={showWatchedOnly}
                                        onCheckedChange={toggleShowWatchedOnly}
                                        className="md:ml-2"
                                    />
                                    <label htmlFor="watched-filter" className="text-sm font-medium cursor-pointer flex items-center">
                                        <Bell className="h-4 w-4 mr-1" />
                                        Watched only
                                    </label>
                                </div>

                                <div className="flex items-center gap-1 ml-2">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className={cn("p-1", viewMode === 'grid' ? "bg-muted" : "")}
                                        onClick={() => viewMode !== 'grid' && toggleViewMode()}
                                    >
                                        <LayoutGrid className="h-4 w-4" />
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className={cn("p-1", viewMode === 'list' ? "bg-muted" : "")}
                                        onClick={() => viewMode !== 'list' && toggleViewMode()}
                                    >
                                        <LayoutList className="h-4 w-4" />
                                    </Button>
                                </div>

                                <Button
                                    onClick={refreshData}
                                    disabled={isRefreshing}
                                    size="sm"
                                    className="bg-primary/90 hover:bg-primary ml-2"
                                >
                                    {isRefreshing ? (
                                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                    ) : (
                                        <RefreshCw className="h-4 w-4 mr-2" />
                                    )}
                                    Refresh
                                </Button>
                            </div>
                        </div>
                    </div>

                    <div className="mt-2 p-3 md:p-4">
                        <TabsContent value="recent-mints" className="mt-2 space-y-4">
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-2">
                                <div className="flex flex-wrap gap-2 items-center">
                                    {selectedCollection ? (
                                        <Button variant="outline" size="sm" onClick={clearCollectionFilter}>
                                            View All Collections
                                        </Button>
                                    ) : (
                                        <div className="flex items-center space-x-2">
                                            <Switch
                                                id="watched-filter"
                                                checked={showWatchedOnly}
                                                onCheckedChange={toggleShowWatchedOnly}
                                            />
                                            <label htmlFor="watched-filter" className="text-sm font-medium cursor-pointer flex items-center">
                                                <Bell className="h-4 w-4 mr-1" />
                                                Show watched only
                                            </label>
                                        </div>
                                    )}

                                    <Separator orientation="vertical" className="h-6 hidden sm:block" />

                                    <div className="flex items-center space-x-2">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className={cn("p-1", viewMode === 'grid' ? "bg-muted" : "")}
                                            onClick={() => viewMode !== 'grid' && toggleViewMode()}
                                        >
                                            <LayoutGrid className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className={cn("p-1", viewMode === 'list' ? "bg-muted" : "")}
                                            onClick={() => viewMode !== 'list' && toggleViewMode()}
                                        >
                                            <LayoutList className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>

                                <div className="text-xs text-muted-foreground">
                                    {filteredMints.length} {filteredMints.length === 1 ? 'mint' : 'mints'} found
                                </div>
                            </div>

                            {isLoading ? (
                                <div className="text-center py-8 text-muted-foreground bg-card border rounded-xl flex flex-col items-center justify-center">
                                    <Loader2 className="h-8 w-8 animate-spin mb-4" />
                                    <p>Loading recent mints...</p>
                                </div>
                            ) : filteredMints.length === 0 ? (
                                <div className="text-center py-6 text-muted-foreground bg-card border rounded-xl">
                                    <Info className="h-12 w-12 mx-auto mb-1 opacity-50" />
                                    <p className="text-lg font-medium">No recent mints found</p>
                                    <p className="text-sm mt-1 max-w-md mx-auto">
                                        {showWatchedOnly ?
                                            "No mints for watched collections. Try disabling the filter or watch more collections." :
                                            "Try refreshing or check back later for updates on new mints."}
                                    </p>
                                </div>
                            ) : viewMode === 'grid' ? (
                                <>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4 md:gap-5">
                                        {currentMints.map((mint, index) => {
                                            const isFlipped = flippedCards.has(`${mint.tick}-${mint.id}`);
                                            const isWatched = watchedCollections.has(mint.tick);
                                            const isSelected = selectedCollection === mint.tick;

                                            return (
                                                <div key={`${mint.tick}-${mint.id}-${index}`}
                                                    className={`relative min-h-[380px] ${isSelected ? 'ring-2 ring-primary rounded-lg' : ''}`}
                                                    style={{
                                                        perspective: '1000px'
                                                    }}>
                                                    <div
                                                        className={`w-full h-full transition-all duration-500 relative ${isFlipped ? 'rotate-y-180' : ''}`}
                                                        style={{
                                                            transformStyle: 'preserve-3d',
                                                            transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)'
                                                        }}
                                                    >
                                                        <Card
                                                            className={`cursor-pointer absolute w-full h-full backface-hidden group border shadow-sm hover:shadow-md transition-shadow ${isSelected ? 'border-primary bg-primary/5' : ''}`}
                                                            style={{
                                                                backfaceVisibility: 'hidden',
                                                            }}
                                                            onClick={() => toggleCardFlip(mint.tick, mint.id)}
                                                        >
                                                            <div className="relative aspect-square w-full overflow-hidden bg-muted">
                                                                {mint.thumbnail_url ? (
                                                                    <img
                                                                        src={mint.thumbnail_url}
                                                                        alt={`${mint.tick} #${mint.id}`}
                                                                        className="w-full h-full object-cover"
                                                                    />
                                                                ) : (
                                                                    <div className="w-full h-full flex items-center justify-center">
                                                                        <span className="text-muted-foreground">{mint.tick} #{mint.id}</span>
                                                                    </div>
                                                                )}
                                                                <Badge className="absolute top-2 right-2 bg-background/90 text-foreground font-semibold">
                                                                    #{mint.id}
                                                                </Badge>

                                                                <Button
                                                                    variant={isWatched ? "default" : "outline"}
                                                                    size="sm"
                                                                    onClick={(e) => toggleWatch(mint.tick, e)}
                                                                    className={`absolute bottom-2 left-2 h-8 px-2 gap-1 flex items-center ${isWatched ? 'bg-primary text-primary-foreground' : 'bg-background/80'}`}
                                                                >
                                                                    <Bell className="h-3.5 w-3.5 mr-1" />
                                                                    {isWatched ? 'Watched' : 'Watch'}
                                                                </Button>
                                                            </div>
                                                            <div className="p-3 border-t bg-card">
                                                                <div className="flex items-center justify-between mb-1">
                                                                    <h3 className="font-bold text-base truncate">{mint.tick}</h3>
                                                                    <span className="text-xs bg-primary/10 text-primary rounded px-2 py-0.5 whitespace-nowrap">
                                                                        {formatTimeAgo(mint.timestamp)}
                                                                    </span>
                                                                </div>
                                                                <p className="text-sm text-muted-foreground">
                                                                    Click to view details
                                                                </p>
                                                            </div>
                                                        </Card>

                                                        <Card
                                                            className={`cursor-pointer absolute w-full h-full backface-hidden group border shadow-sm hover:shadow-md transition-shadow ${isSelected ? 'border-primary bg-primary/5' : ''}`}
                                                            style={{
                                                                backfaceVisibility: 'hidden',
                                                                transform: 'rotateY(180deg)'
                                                            }}
                                                            onClick={() => toggleCardFlip(mint.tick, mint.id)}
                                                        >
                                                            <div className="flex flex-col h-full">
                                                                <div className="flex-1 aspect-square overflow-y-auto p-3">
                                                                    {mint.metadata ? (
                                                                        <div>
                                                                            {mint.metadata.name && (
                                                                                <p className="font-medium text-foreground mb-2">{mint.metadata.name}</p>
                                                                            )}

                                                                            {mint.metadata.attributes && mint.metadata.attributes.length > 0 && (
                                                                                <div className="grid grid-cols-2 gap-1 mt-1">
                                                                                    {mint.metadata.attributes.slice(0, 100).map((attr, idx) => (
                                                                                        <div key={idx} className="bg-primary/5 p-1 rounded truncate">
                                                                                            <span className="font-medium text-primary/70">{attr.trait_type}: </span>
                                                                                            <span>{attr.value}</span>
                                                                                        </div>
                                                                                    ))}
                                                                                </div>
                                                                            )}
                                                                        </div>
                                                                    ) : (
                                                                        <div className="flex items-center justify-center h-full">
                                                                            <Loader2 className="h-6 w-6 animate-spin" />
                                                                        </div>
                                                                    )}
                                                                </div>
                                                                <div className="p-3 border-t bg-card mt-auto">
                                                                    <div className="flex items-center justify-between mb-2">
                                                                        <h3 className="font-bold text-base truncate">{mint.tick}</h3>
                                                                        <Badge className="bg-background/90 text-foreground font-semibold">
                                                                            #{mint.id}
                                                                        </Badge>
                                                                    </div>
                                                                    <Button
                                                                        variant={isWatched ? "default" : "outline"}
                                                                        size="sm"
                                                                        className="w-full h-8"
                                                                        onClick={(e) => toggleWatch(mint.tick, e)}
                                                                    >
                                                                        <Bell className="h-3.5 w-3.5 mr-1.5" />
                                                                        {isWatched ? 'Watched' : 'Watch'}
                                                                    </Button>
                                                                </div>
                                                            </div>
                                                        </Card>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>

                                    {filteredMints.length > mintsPerPage && (
                                        <Pagination
                                            totalItems={filteredMints.length}
                                            itemsPerPage={mintsPerPage}
                                            currentPage={currentMintsPage}
                                            onPageChange={setCurrentMintsPage}
                                        />
                                    )}

                                    <style jsx global>{`
                                  .backface-hidden {
                                    -webkit-backface-visibility: hidden;
                                    backface-visibility: hidden;
                                  }
                                  .rotate-y-180 {
                                    transform: rotateY(180deg);
                                  }
                                `}</style>
                                </>
                            ) : (
                                <>
                                    <div className="border rounded-md overflow-hidden">
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead className="w-12 text-center">Watch</TableHead>
                                                    <TableHead>Collection</TableHead>
                                                    <TableHead>ID</TableHead>
                                                    <TableHead>Preview</TableHead>
                                                    <TableHead>Time</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {currentMints.map((mint) => {
                                                    const isWatched = watchedCollections.has(mint.tick);
                                                    const isSelected = selectedCollection === mint.tick;

                                                    return (
                                                        <TableRow
                                                            key={`${mint.tick}-${mint.id}`}
                                                            className={cn(
                                                                isWatched ? 'bg-primary/5' : '',
                                                                isSelected ? 'bg-primary/10 border-l-4 border-l-primary' : '',
                                                                "hover:bg-secondary/10 cursor-pointer"
                                                            )}
                                                            onClick={() => handleCollectionClick(mint.tick)}
                                                        >
                                                            <TableCell className="p-2 text-center">
                                                                <Button
                                                                    variant={isWatched ? "default" : "ghost"}
                                                                    size="icon"
                                                                    onClick={(e) => toggleWatch(mint.tick, e)}
                                                                    className={cn(
                                                                        "h-8 w-8 relative",
                                                                        isWatched ? "bg-primary text-primary-foreground" : "text-muted-foreground"
                                                                    )}
                                                                >
                                                                    <Bell className="h-4 w-4" />
                                                                    {isWatched && (
                                                                        <span className="absolute inset-0 rounded-full animate-ping bg-primary/30"></span>
                                                                    )}
                                                                </Button>
                                                            </TableCell>
                                                            <TableCell className="font-medium">
                                                                <div className="flex items-center">
                                                                    {mint.tick}
                                                                    {isSelected && (
                                                                        <Badge className="ml-2 bg-primary/20 text-primary border-primary/40">Selected</Badge>
                                                                    )}
                                                                </div>
                                                            </TableCell>
                                                            <TableCell>
                                                                <Badge className="bg-background text-foreground font-semibold">
                                                                    #{mint.id}
                                                                </Badge>
                                                            </TableCell>
                                                            <TableCell>
                                                                <div className="w-12 h-12 relative overflow-hidden rounded-md bg-muted">
                                                                    {mint.thumbnail_url ? (
                                                                        <img
                                                                            src={mint.thumbnail_url}
                                                                            alt={`${mint.tick} #${mint.id}`}
                                                                            className="w-full h-full object-cover"
                                                                        />
                                                                    ) : (
                                                                        <div className="w-full h-full flex items-center justify-center">
                                                                            <span className="text-xs text-muted-foreground">No img</span>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </TableCell>
                                                            <TableCell>
                                                                <span className="text-xs bg-primary/10 text-primary rounded px-2 py-1 whitespace-nowrap">
                                                                    {formatTimeAgo(mint.timestamp)}
                                                                </span>
                                                            </TableCell>
                                                        </TableRow>
                                                    );
                                                })}
                                            </TableBody>
                                        </Table>
                                    </div>

                                    {filteredMints.length > mintsPerPage && (
                                        <Pagination
                                            totalItems={filteredMints.length}
                                            itemsPerPage={mintsPerPage}
                                            currentPage={currentMintsPage}
                                            onPageChange={setCurrentMintsPage}
                                        />
                                    )}
                                </>
                            )}
                        </TabsContent>

                        <TabsContent value="holders" className="mt-2 space-y-4">
                            {selectedCollection && holderData ? (
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center mb-2">
                                        <Button variant="outline" size="sm" onClick={clearCollectionFilter}>
                                            View All Collections
                                        </Button>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <Card className="p-4">
                                            <h3 className="text-base font-bold mb-3">{selectedCollection} Overview</h3>
                                            <div className="grid grid-cols-2 gap-3">
                                                <div>
                                                    <p className="text-sm text-muted-foreground">Total Supply</p>
                                                    <p className="text-lg font-bold">{holderData.totalSupply.toLocaleString()}</p>
                                                </div>
                                                <div>
                                                    <p className="text-sm text-muted-foreground">Total Minted</p>
                                                    <p className="text-lg font-bold">{holderData.totalMinted.toLocaleString()}</p>
                                                </div>
                                                <div>
                                                    <p className="text-sm text-muted-foreground">Total Holders</p>
                                                    <p className="text-lg font-bold">{holderData.totalHolders.toLocaleString()}</p>
                                                </div>
                                                <div>
                                                    <p className="text-sm text-muted-foreground">Minting Progress</p>
                                                    <div className="mt-1 h-2 bg-muted rounded-full overflow-hidden">
                                                        <div
                                                            className="h-full bg-primary rounded-full"
                                                            style={{ width: `${holderData.totalMintedPercent * 100}%` }}
                                                        ></div>
                                                    </div>
                                                    <p className="text-xs mt-1 text-right">{(holderData.totalMintedPercent * 100).toFixed(2)}%</p>
                                                </div>
                                            </div>
                                        </Card>

                                        <Card className="p-4">
                                            <h3 className="text-base font-bold mb-3">Holder Distribution</h3>
                                            <div className="h-36 w-full">
                                                <HolderDistributionChart holders={holderData.holders} />
                                            </div>
                                        </Card>
                                    </div>

                                    <Card className="overflow-hidden">
                                        <div className="p-3 border-b">
                                            <h3 className="text-base font-semibold">All Holders</h3>
                                            <p className="text-xs text-muted-foreground mt-1">
                                                Showing {holderData.holders.length} holders for {selectedCollection}
                                            </p>
                                        </div>
                                        <div className="overflow-x-auto max-h-80">
                                            <Table>
                                                <TableHeader>
                                                    <TableRow>
                                                        <TableHead>Address</TableHead>
                                                        <TableHead className="text-right">Token Count</TableHead>
                                                        <TableHead className="text-right">Percent of Supply</TableHead>
                                                    </TableRow>
                                                </TableHeader>
                                                <TableBody>
                                                    {holderData.holders
                                                        .sort((a, b) => b.count - a.count)
                                                        .map((holder, index) => (
                                                            <TableRow key={index}>
                                                                <TableCell className="font-mono text-xs truncate max-w-60">
                                                                    {holder.owner}
                                                                </TableCell>
                                                                <TableCell className="text-right font-medium">
                                                                    {holder.count.toLocaleString()}
                                                                </TableCell>
                                                                <TableCell className="text-right">
                                                                    {((holder.count / holderData.totalMinted) * 100).toFixed(2)}%
                                                                </TableCell>
                                                            </TableRow>
                                                        ))
                                                    }
                                                </TableBody>
                                            </Table>
                                        </div>
                                    </Card>
                                </div>
                            ) : isHolderLoading ? (
                                <div className="text-center py-8 text-muted-foreground bg-card border rounded-xl flex flex-col items-center justify-center">
                                    <Loader2 className="h-8 w-8 animate-spin mb-4" />
                                    <p>Loading holder data...</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    <div className="text-center py-4 bg-card border rounded-xl">
                                        <h3 className="text-lg font-medium">Select a Collection to View Holders</h3>
                                        <p className="text-sm text-muted-foreground mt-1">Choose a collection to see holder distribution and details</p>
                                    </div>

                                    <div className="border rounded-md overflow-hidden">
                                        <div className="overflow-x-auto">
                                            <Table>
                                                <TableHeader>
                                                    <TableRow>
                                                        <TableHead className="w-12 text-center">Watch</TableHead>
                                                        <TableHead>Collection</TableHead>
                                                        <TableHead className="text-right">Progress</TableHead>
                                                        <TableHead className="text-right">Minted</TableHead>
                                                        <TableHead className="text-right">Pre-minted</TableHead>
                                                        <TableHead className="text-right">Total Supply</TableHead>
                                                    </TableRow>
                                                </TableHeader>
                                                <TableBody>
                                                    {isLoading ? (
                                                        <TableRow>
                                                            <TableCell colSpan={6} className="h-24 text-center">
                                                                <Loader2 className="h-5 w-5 animate-spin mx-auto" />
                                                                <span className="block mt-1 text-sm text-muted-foreground">Loading collections...</span>
                                                            </TableCell>
                                                        </TableRow>
                                                    ) : currentCollections.length === 0 ? (
                                                        <TableRow>
                                                            <TableCell colSpan={6} className="h-24 text-center">
                                                                <span className="text-muted-foreground">
                                                                    {searchQuery ? 'No matching collections found' : 'No collections found'}
                                                                </span>
                                                            </TableCell>
                                                        </TableRow>
                                                    ) : (
                                                        currentCollections.map(collection => {
                                                            const mintPercentage = collection.total_supply
                                                                ? Math.round((collection.minted_count / collection.total_supply) * 100)
                                                                : 0;
                                                            const progressBarColor = getProgressBarColor(mintPercentage);
                                                            const premintedCount = collection.total_supply && collection.minted_count
                                                                ? collection.total_supply - collection.minted_count
                                                                : 0;
                                                            const isSelected = selectedCollection === collection.tick;
                                                            const isWatched = collection.watched;

                                                            return (
                                                                <TableRow
                                                                    key={collection.tick}
                                                                    className={cn(
                                                                        isWatched ? 'bg-primary/5' : '',
                                                                        isSelected ? 'bg-primary/10 border-l-4 border-l-primary' : '',
                                                                        "cursor-pointer hover:bg-secondary/10"
                                                                    )}
                                                                    onClick={() => {
                                                                        handleCollectionClick(collection.tick);
                                                                    }}
                                                                >
                                                                    <TableCell className="p-2 text-center">
                                                                        <Button
                                                                            variant={isWatched ? "default" : "ghost"}
                                                                            size="icon"
                                                                            onClick={(e) => toggleWatch(collection.tick, e)}
                                                                            className={cn(
                                                                                "h-8 w-8 relative",
                                                                                isWatched ? "bg-primary text-primary-foreground" : "text-muted-foreground"
                                                                            )}
                                                                        >
                                                                            <Bell className="h-4 w-4" />
                                                                            {isWatched && (
                                                                                <span className="absolute inset-0 rounded-full animate-ping bg-primary/30"></span>
                                                                            )}
                                                                        </Button>
                                                                    </TableCell>
                                                                    <TableCell className="font-medium">
                                                                        <div className="flex items-center">
                                                                            {collection.tick}
                                                                            {isSelected && (
                                                                                <Badge className="ml-2 bg-primary/20 text-primary border-primary/40">Selected</Badge>
                                                                            )}
                                                                        </div>
                                                                    </TableCell>
                                                                    <TableCell className="text-right">
                                                                        {collection.total_supply ? (
                                                                            <TooltipProvider>
                                                                                <Tooltip>
                                                                                    <TooltipTrigger asChild>
                                                                                        <div className="flex items-center justify-end">
                                                                                            <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                                                                                                <div
                                                                                                    className={`h-full ${progressBarColor} rounded-full`}
                                                                                                    style={{
                                                                                                        width: `${mintPercentage}%`
                                                                                                    }}
                                                                                                />
                                                                                            </div>
                                                                                            <span className="ml-2 text-xs font-medium">{mintPercentage}%</span>
                                                                                        </div>
                                                                                    </TooltipTrigger>
                                                                                    <TooltipContent>
                                                                                        <p className="font-bold">{mintPercentage}% minted</p>
                                                                                        <p className="text-xs">
                                                                                            {collection.minted_count.toLocaleString()} of {collection.total_supply.toLocaleString()}
                                                                                        </p>
                                                                                    </TooltipContent>
                                                                                </Tooltip>
                                                                            </TooltipProvider>
                                                                        ) : (
                                                                            <span className="text-xs text-muted-foreground">-</span>
                                                                        )}
                                                                    </TableCell>
                                                                    <TableCell className="text-right font-medium">{collection.minted_count.toLocaleString()}</TableCell>
                                                                    <TableCell className="text-right">
                                                                        {collection.total_supply
                                                                            ? premintedCount.toLocaleString()
                                                                            : 'Unknown'}
                                                                    </TableCell>
                                                                    <TableCell className="text-right">
                                                                        {collection.total_supply
                                                                            ? collection.total_supply.toLocaleString()
                                                                            : 'Unknown'}
                                                                    </TableCell>
                                                                </TableRow>
                                                            );
                                                        })
                                                    )}
                                                </TableBody>
                                            </Table>
                                        </div>
                                    </div>

                                    {filteredCollections.length > collectionsPerPage && (
                                        <Pagination
                                            totalItems={filteredCollections.length}
                                            itemsPerPage={collectionsPerPage}
                                            currentPage={currentCollectionsPage}
                                            onPageChange={setCurrentCollectionsPage}
                                        />
                                    )}
                                </div>
                            )}
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
                        <AlertDialogFooter className="flex-col sm:flex-row gap-2">
                            <AlertDialogCancel className="w-full sm:w-auto mt-0">No Thanks</AlertDialogCancel>
                            <AlertDialogAction className="w-full sm:w-auto" onClick={requestNotificationPermission}>
                                Enable Notifications
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>

                {error && (
                    <div className="fixed bottom-4 right-4 bg-destructive text-destructive-foreground p-4 rounded-lg shadow-lg flex items-center gap-2 max-w-md z-50">
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
        </div>
    );
};
export default MintWatcher;