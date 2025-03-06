'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { Wallet, Banknote, Box, Eye, LineChart, Star, Search, Lock, ChevronRight, Power, Calculator, Coins, Menu, X, Home, Palette } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { useWallet } from '@/context/WalletContext';
import { ThemeToggle } from '@/components/theme-toggle';
import { Button } from '@/components/ui/button';

export const navItems = [
    {
        name: 'Home',
        icon: <Home className="w-5 h-5" />,
        href: '/',
        category: 'main'
    },
    {
        name: 'KRC-20',
        icon: <Coins className="w-5 h-5" />,
        href: '/krc20-tokens',
        category: 'krc20'
    },
    {
        name: 'Charts',
        icon: <LineChart className="w-5 h-5" />,
        href: '/charts',
        category: 'krc20'
    },
    {
        name: 'KRC Arb Calc',
        icon: <Calculator className="w-5 h-5" />,
        href: '/krc-arb-tracker',
        category: 'krc20'
    },
    {
        name: 'KRC-721 Explorer',
        icon: <Palette className="w-5 h-5" />,
        href: '/krc721-tokens',
        category: 'krc721'
    },
    {
        name: 'Mint Watcher',
        icon: <Star className="w-5 h-5" />,
        href: '/mint-watcher',
        category: 'krc721'
    },
    {
        name: 'Wallet Profiler',
        icon: <Wallet className="w-5 h-5" />,
        href: '/wallet-profiler',
        category: 'utility'
    },
    {
        name: 'Profit/Loss',
        icon: <Banknote className="w-5 h-5" />,
        href: '/profit-loss',
        category: 'utility'
    },
    {
        name: 'Airdrop Tool',
        icon: <Box className="w-5 h-5" />,
        href: '/airdrop-tool',
        category: 'utility'
    },
    {
        name: 'Wallet Explorer',
        icon: <Eye className="w-5 h-5" />,
        href: '/wallet-explorer',
        category: 'utility'
    },
    {
        name: 'Secret Tools',
        icon: <Lock className="w-5 h-5" />,
        href: '/secret-tools',
        category: 'utility'
    },
];

const NavBar = () => {
    const pathname = usePathname();
    const [isExpanded, setIsExpanded] = useState(false);
    const [isMobileOpen, setIsMobileOpen] = useState(false);
    const { walletConnected, walletInfo, connectWallet, disconnectWallet } = useWallet();

    const [isDesktop, setIsDesktop] = useState(false);
    const navRef = useRef(null);

    useEffect(() => {
        setIsDesktop(window.innerWidth >= 768);

        const handleResize = () => {
            const desktop = window.innerWidth >= 768;
            setIsDesktop(desktop);
            if (desktop) {
                setIsMobileOpen(false);
            }
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        setIsMobileOpen(false);
    }, [pathname]);

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

    const MobileMenuButton = () => (
        <Button
            variant="ghost"
            size="icon"
            className="fixed top-0 left-0 z-50 md:hidden rounded-none h-10 w-10"
            onClick={() => setIsMobileOpen(!isMobileOpen)}
        >
            {isMobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </Button>
    );

    const toggleExpanded = () => {
        setIsExpanded(!isExpanded);
    };

    return (
        <>
            <MobileMenuButton />

            {isMobileOpen && (
                <div
                    className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 md:hidden"
                    onClick={() => setIsMobileOpen(false)}
                />
            )}

            <div className="fixed top-0 left-0 h-full z-50" ref={navRef}>
                <nav
                    className={`hidden md:flex h-full bg-background border-r border-border text-foreground 
                        transition-all duration-300 ease-in-out 
                        hover:w-64 ${isExpanded ? 'w-64' : 'w-16'}`}
                    onMouseEnter={() => setIsExpanded(true)}
                    onMouseLeave={() => setIsExpanded(false)}
                >
                    <SidebarContent
                        isExpanded={isExpanded}
                        pathname={pathname}
                        walletConnected={walletConnected}
                        walletInfo={walletInfo}
                        handleWalletClick={handleWalletClick}
                        toggleMenu={toggleExpanded}
                    />
                </nav>

                <nav
                    className={`md:hidden fixed top-0 left-0 h-full w-64 bg-background border-r border-border text-foreground
                        transform transition-transform duration-300 ease-in-out z-50
                        ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'}`}
                >
                    <SidebarContent
                        isExpanded={true}
                        pathname={pathname}
                        walletConnected={walletConnected}
                        walletInfo={walletInfo}
                        handleWalletClick={handleWalletClick}
                        toggleMenu={() => { }}
                    />
                </nav>
            </div>
        </>
    );
};

interface SidebarContentProps {
    isExpanded: boolean;
    pathname: string;
    walletConnected: boolean;
    walletInfo: { balance: number; address: string } | null;
    handleWalletClick: () => void;
    toggleMenu: () => void;
}

const SidebarContent = ({
    isExpanded,
    pathname,
    walletConnected,
    walletInfo,
    handleWalletClick,
    toggleMenu
}: SidebarContentProps) => {
    const krc20Items = navItems.filter(item => item.category === 'krc20');
    const krc721Items = navItems.filter(item => item.category === 'krc721');
    const utilityItems = navItems.filter(item => item.category === 'utility');
    const mainItems = navItems.filter(item => item.category === 'main');

    return (
        <div className="flex flex-col h-full w-full overflow-hidden">
            <Button
                variant="ghost"
                size="sm"
                className="absolute right-0 top-2 p-1 h-6 w-6 rounded-l-none"
                onClick={toggleMenu}
            >
                <ChevronRight className={`w-4 h-4 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} />
            </Button>

            <div className="h-16 px-4 flex items-center justify-center md:justify-start mt-4 md:mt-0">
                <div className="flex items-center space-x-2 overflow-hidden">
                    <div className="relative w-8 h-8 shrink-0">
                        <Image
                            src="/logo.png"
                            alt="Astro World"
                            fill
                            className="object-contain"
                        />
                    </div>
                    <span className={`font-bold text-lg whitespace-nowrap transition-opacity duration-300
                        ${isExpanded ? 'opacity-100' : 'opacity-0'}`}>
                        Astro World
                    </span>
                </div>
            </div>

            <div className="px-2">
                <ThemeToggle />
            </div>

            <div className="flex-1 px-2 py-4 space-y-6 overflow-hidden">
                {mainItems.length > 0 && (
                    <div className="space-y-2">
                        {mainItems.map((item) => renderNavItem(item, pathname, isExpanded))}
                    </div>
                )}

                {krc20Items.length > 0 && (
                    <div className="space-y-2">
                        <div className={`px-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider transition-opacity duration-300 ${isExpanded ? 'opacity-100' : 'opacity-0'}`}>
                            KRC-20
                        </div>
                        {krc20Items.map((item) => renderNavItem(item, pathname, isExpanded))}
                    </div>
                )}

                {krc721Items.length > 0 && (
                    <div className="space-y-2">
                        <div className={`px-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider transition-opacity duration-300 ${isExpanded ? 'opacity-100' : 'opacity-0'}`}>
                            KRC-721
                        </div>
                        {krc721Items.map((item) => renderNavItem(item, pathname, isExpanded))}
                    </div>
                )}

                {utilityItems.length > 0 && (
                    <div className="space-y-2">
                        <div className={`px-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider transition-opacity duration-300 ${isExpanded ? 'opacity-100' : 'opacity-0'}`}>
                            Utility
                        </div>
                        {utilityItems.map((item) => renderNavItem(item, pathname, isExpanded))}
                    </div>
                )}
            </div>

            <div className="px-2 py-4 border-t border-border">
                <div className="h-[68px]">
                    <button
                        onClick={handleWalletClick}
                        className="flex items-center w-full h-10 px-2 rounded-lg transition-all duration-200 hover:bg-accent group/wallet"
                    >
                        <div className="flex items-center w-full">
                            <div className="shrink-0">
                                <Power className={`w-5 h-5 ${walletConnected ? 'text-green-500' : 'text-muted-foreground'}`} />
                            </div>
                            <span className={`ml-3 whitespace-nowrap transition-opacity duration-300
                                ${isExpanded ? 'opacity-100' : 'opacity-0'}`}>
                                {walletConnected ? 'Connected' : 'Connect Wallet'}
                            </span>
                        </div>
                    </button>
                    {walletConnected && walletInfo && (
                        <div className={`px-2 mt-1 text-sm transition-opacity duration-300
                            ${isExpanded ? 'opacity-100' : 'opacity-0'}`}>
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
    );
};

const renderNavItem = (item: { name: any; icon: any; href: any; category?: string; }, pathname: string, isExpanded: boolean) => {
    const isActive = pathname === item.href;
    return (
        <Link
            key={item.name}
            href={item.href}
            className={`flex items-center px-2 py-3 rounded-lg transition-all duration-200
                ${isActive
                    ? 'bg-accent text-accent-foreground'
                    : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                }
                group/item relative
            `}
        >
            <div className="flex items-center justify-between w-full">
                <div className="flex items-center">
                    <div className="shrink-0">
                        {item.icon}
                    </div>
                    <span className={`ml-3 whitespace-nowrap transition-opacity duration-300
                        ${isExpanded ? 'opacity-100' : 'opacity-0'}`}>
                        {item.name}
                    </span>
                </div>
                <ChevronRight className={`w-4 h-4 transition-opacity duration-300
                    ${isExpanded || isActive ? 'opacity-100' : 'opacity-0'}`}
                />
            </div>
        </Link>
    );
};

export default NavBar;