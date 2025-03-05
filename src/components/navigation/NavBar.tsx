'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { Wallet, Banknote, Box, Eye, LineChart, Star, Search, Lock, ChevronRight, Power, Calculator, Coins, Menu, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useWallet } from '@/context/WalletContext';
import { ThemeToggle } from '@/components/theme-toggle';
import { Button } from '@/components/ui/button';

export const navItems = [
    {
        name: 'KRC-20',
        icon: <Coins className="w-5 h-5" />,
        href: '/krc20-tokens',
    },
    {
        name: 'Charts',
        icon: <LineChart className="w-5 h-5" />,
        href: '/charts',
    },
    {
        name: 'Wallet Profiler',
        icon: <Wallet className="w-5 h-5" />,
        href: '/wallet-profiler',
    },
    {
        name: 'KRC Arb Calc',
        icon: <Calculator className="w-5 h-5" />,
        href: '/krc-arb-tracker',
    },
    {
        name: 'Profit/Loss',
        icon: <Banknote className="w-5 h-5" />,
        href: '/profit-loss',
    },
    {
        name: 'Airdrop Tool',
        icon: <Box className="w-5 h-5" />,
        href: '/airdrop-tool',
    },
    {
        name: 'Wallet Explorer',
        icon: <Eye className="w-5 h-5" />,
        href: '/wallet-explorer',
    },
    {
        name: 'Mint Watcher',
        icon: <Star className="w-5 h-5" />,
        href: '/mint-watcher',
    },
    {
        name: 'Secret Tools',
        icon: <Lock className="w-5 h-5" />,
        href: '/secret-tools',
    },
];

const NavBar = () => {
    const pathname = usePathname();
    const [isExpanded, setIsExpanded] = useState(false);
    const [isMobileOpen, setIsMobileOpen] = useState(false);
    const { walletConnected, walletInfo, connectWallet, disconnectWallet } = useWallet();

    useEffect(() => {
        setIsMobileOpen(false);
    }, [pathname]);

    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth >= 768) {
                setIsMobileOpen(false);
            }
        };
        
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        if (isMobileOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [isMobileOpen]);

    const handleWalletClick = async () => {
        if (walletConnected) {
            await disconnectWallet();
        } else {
            await connectWallet();
        }
    };

    return (
        <>
            <Button
                variant="ghost"
                size="icon"
                className="fixed top-0 left-0 z-50 md:hidden rounded-none h-12 w-12"
                onClick={() => setIsMobileOpen(!isMobileOpen)}
            >
                {isMobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </Button>

            {isMobileOpen && (
                <div 
                    className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 md:hidden"
                    onClick={() => setIsMobileOpen(false)}
                />
            )}

            <div 
                className={`fixed top-0 left-0 h-full w-64 bg-background border-r z-50 transform transition-transform duration-300 md:translate-x-0 ${
                    isMobileOpen ? 'translate-x-0' : '-translate-x-full'
                } md:relative md:w-auto md:h-screen`}
            >
                <div className="flex flex-col h-full w-full">
                    <div className="h-16 px-4 flex items-center justify-center md:justify-start mt-4">
                        <div className="flex items-center space-x-2 overflow-hidden">
                            <div className="relative w-8 h-8 shrink-0">
                                <Image
                                    src="/logo.png"
                                    alt="Astro World"
                                    fill
                                    className="object-contain"
                                />
                            </div>
                            <span className={`font-bold text-lg whitespace-nowrap ${!isExpanded && 'md:hidden'}`}>
                                Astro World
                            </span>
                        </div>
                    </div>

                    <div className="px-2">
                        <ThemeToggle />
                    </div>

                    <div className="flex-1 px-2 py-4 space-y-2 overflow-y-auto">
                        {navItems.map((item) => {
                            const isActive = pathname === item.href;
                            return (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    className={`flex items-center px-2 py-3 rounded-lg transition-all duration-200 ${
                                        isActive
                                            ? 'bg-accent text-accent-foreground'
                                            : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                                    } group relative`}
                                >
                                    <div className="flex items-center justify-between w-full">
                                        <div className="flex items-center">
                                            <div className="shrink-0">
                                                {item.icon}
                                            </div>
                                            <span className={`ml-3 whitespace-nowrap ${
                                                !isExpanded && 'md:opacity-0 md:group-hover:opacity-100 md:transition-opacity md:duration-300'
                                            }`}>
                                                {item.name}
                                            </span>
                                        </div>
                                        <ChevronRight className={`w-4 h-4 ${
                                            !isExpanded && !isActive && 'md:opacity-0 md:group-hover:opacity-100 md:transition-opacity md:duration-300'
                                        }`} />
                                    </div>
                                </Link>
                            );
                        })}
                    </div>

                    <div className="px-2 py-4 border-t">
                        <div className="h-[68px]">
                            <button
                                onClick={handleWalletClick}
                                className="flex items-center w-full h-10 px-2 rounded-lg transition-all duration-200 hover:bg-accent group"
                            >
                                <div className="flex items-center w-full">
                                    <div className="shrink-0">
                                        <Power className={`w-5 h-5 ${walletConnected ? 'text-green-500' : 'text-muted-foreground'}`} />
                                    </div>
                                    <span className={`ml-3 whitespace-nowrap ${
                                        !isExpanded && 'md:opacity-0 md:group-hover:opacity-100 md:transition-opacity md:duration-300'
                                    }`}>
                                        {walletConnected ? 'Connected' : 'Connect Wallet'}
                                    </span>
                                </div>
                            </button>
                            {walletConnected && walletInfo && (
                                <div className={`px-2 mt-1 text-sm ${
                                    !isExpanded && 'md:opacity-0 md:group-hover:opacity-100 md:transition-opacity md:duration-300'
                                }`}>
                                    <div className="text-green-500 font-medium">{walletInfo.balance} KAS</div>
                                    <div className="text-xs text-muted-foreground truncate">
                                        {walletInfo.address}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <div className="hidden md:block fixed left-0 top-0 h-screen z-40">
                <nav
                    className="h-screen bg-background border-r transition-all duration-300 ease-in-out"
                    style={{ width: isExpanded ? '16rem' : '4rem' }}
                    onMouseEnter={() => setIsExpanded(true)}
                    onMouseLeave={() => setIsExpanded(false)}
                >
                    <div className="flex flex-col h-full">
                        <div className="h-16 px-4 flex items-center justify-center md:justify-start">
                            <div className="flex items-center space-x-2 overflow-hidden">
                                <div className="relative w-8 h-8 shrink-0">
                                    <Image
                                        src="/logo.png"
                                        alt="Astro World"
                                        fill
                                        className="object-contain"
                                    />
                                </div>
                                <span className={`font-bold text-lg whitespace-nowrap transition-opacity duration-300 ${
                                    isExpanded ? 'opacity-100' : 'opacity-0'
                                }`}>
                                    Astro World
                                </span>
                            </div>
                        </div>

                        <div className="px-2">
                            <ThemeToggle />
                        </div>

                        <div className="flex-1 px-2 py-4 space-y-2">
                            {navItems.map((item) => {
                                const isActive = pathname === item.href;
                                return (
                                    <Link
                                        key={item.name}
                                        href={item.href}
                                        className={`flex items-center px-2 py-3 rounded-lg transition-all duration-200 ${
                                            isActive
                                                ? 'bg-accent text-accent-foreground'
                                                : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                                        } group relative`}
                                    >
                                        <div className="flex items-center justify-between w-full">
                                            <div className="flex items-center">
                                                <div className="shrink-0">
                                                    {item.icon}
                                                </div>
                                                <span className={`ml-3 whitespace-nowrap transition-opacity duration-300 ${
                                                    isExpanded ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                                                }`}>
                                                    {item.name}
                                                </span>
                                            </div>
                                            <ChevronRight className={`w-4 h-4 transition-opacity duration-300 ${
                                                isExpanded || isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                                            }`} />
                                        </div>
                                    </Link>
                                );
                            })}
                        </div>

                        <div className="px-2 py-4 border-t">
                            <div className="h-[68px]">
                                <button
                                    onClick={handleWalletClick}
                                    className="flex items-center w-full h-10 px-2 rounded-lg transition-all duration-200 hover:bg-accent group"
                                >
                                    <div className="flex items-center w-full">
                                        <div className="shrink-0">
                                            <Power className={`w-5 h-5 ${walletConnected ? 'text-green-500' : 'text-muted-foreground'}`} />
                                        </div>
                                        <span className={`ml-3 whitespace-nowrap transition-opacity duration-300 ${
                                            isExpanded ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                                        }`}>
                                            {walletConnected ? 'Connected' : 'Connect Wallet'}
                                        </span>
                                    </div>
                                </button>
                                {walletConnected && walletInfo && (
                                    <div className={`px-2 mt-1 text-sm transition-opacity duration-300 ${
                                        isExpanded ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                                    }`}>
                                        <div className="text-green-500 font-medium">{walletInfo.balance} KAS</div>
                                        {isExpanded && (
                                            <div className="text-xs text-muted-foreground truncate">
                                                {walletInfo.address}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </nav>
            </div>
        </>
    );
};

export default NavBar;