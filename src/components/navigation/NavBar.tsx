'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { Wallet, Banknote, Box, Eye, LineChart, Star, Lock, ChevronRight, Power, Calculator, Coins, Menu, X, Home, Palette } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { useWallet } from '@/context/WalletContext';
import { ThemeToggle } from '@/components/theme-toggle';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';

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
        name: 'NFT Insights',
        icon: <Eye className="w-5 h-5" />,
        href: '/NFT-insight',
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
    const [activeCategoryMobile, setActiveCategoryMobile] = useState<string | null>(null);
    const [showText, setShowText] = useState(false);

    useEffect(() => {
        const checkDesktop = () => window.innerWidth >= 768;
        setIsDesktop(checkDesktop());

        const handleResize = () => {
            const desktop = checkDesktop();
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

    const toggleCategoryMobile = (category: string) => {
        setActiveCategoryMobile(prevCategory => prevCategory === category ? null : category);
    };

    const toggleExpanded = () => {
        if (isExpanded) {
            setShowText(false);
            setTimeout(() => {
                setIsExpanded(false);
            }, 50);
        } else {
            setIsExpanded(true);
            setTimeout(() => {
                setShowText(true);
            }, 250);
        }
    };

    const MobileNavButton = () => (
        <div className="fixed top-4 left-4 z-50 md:hidden">
            <Button
                variant="outline"
                size="icon"
                className="rounded-full shadow-md bg-background border-primary/20 hover:bg-background/90 h-10 w-10"
                onClick={() => setIsMobileOpen(!isMobileOpen)}
            >
                {isMobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
        </div>
    );

    return (
        <>
            <MobileNavButton />

            <AnimatePresence>
                {isMobileOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.05 }}
                        className="fixed inset-0 bg-background/70 backdrop-blur-md z-40 md:hidden"
                        onClick={() => setIsMobileOpen(false)}
                    />
                )}
            </AnimatePresence>

            <div className="fixed top-0 left-0 h-full z-40" ref={navRef}>
                <motion.nav
                    className="hidden md:flex h-full bg-background border-r border-border text-foreground transition-all duration-300 ease-in-out shadow-md"
                    initial={false}
                    animate={{ width: isExpanded ? 240 : 72 }}
                    transition={{ duration: 0.25 }}
                    onAnimationComplete={() => {
                        if (isExpanded) {
                            setShowText(true);
                        }
                    }}
                >
                    <DesktopSidebar
                        isExpanded={isExpanded}
                        pathname={pathname}
                        walletConnected={walletConnected}
                        walletInfo={walletInfo}
                        handleWalletClick={handleWalletClick}
                        toggleMenu={toggleExpanded}
                        showText={showText}
                    />
                </motion.nav>

                <AnimatePresence>
                    {isMobileOpen && (
                        <motion.nav
                            className="md:hidden fixed top-0 left-0 h-full bg-background border-r border-border text-foreground z-50 w-72 shadow-xl"
                            initial={{ x: "-100%" }}
                            animate={{ x: 0 }}
                            exit={{ x: "-100%" }}
                            transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        >
                            <MobileSidebar
                                pathname={pathname}
                                walletConnected={walletConnected}
                                walletInfo={walletInfo}
                                handleWalletClick={handleWalletClick}
                                closeMobileMenu={() => setIsMobileOpen(false)}
                                activeCategory={activeCategoryMobile}
                                toggleCategory={toggleCategoryMobile}
                            />
                        </motion.nav>
                    )}
                </AnimatePresence>
            </div>
            <div className="hidden md:block" style={{ width: isExpanded ? '240px' : '72px', flexShrink: 0 }} />
        </>
    );
};

interface DesktopSidebarProps {
    isExpanded: boolean;
    pathname: string;
    walletConnected: boolean;
    walletInfo: { balance: number; address: string } | null;
    handleWalletClick: () => void;
    toggleMenu: () => void;
    showText?: boolean;
}

const DesktopSidebar = ({
    isExpanded,
    pathname,
    walletConnected,
    walletInfo,
    handleWalletClick,
    toggleMenu,
    showText = false
}: DesktopSidebarProps) => {
    const krc20Items = navItems.filter(item => item.category === 'krc20');
    const krc721Items = navItems.filter(item => item.category === 'krc721');
    const utilityItems = navItems.filter(item => item.category === 'utility');
    const mainItems = navItems.filter(item => item.category === 'main');

    return (
        <div
            className="flex flex-col h-full w-full overflow-y-auto overflow-x-hidden scrollbar-thin"
            onMouseEnter={() => toggleMenu()}
            onMouseLeave={() => toggleMenu()}
        >
            <div className="h-16 px-4 flex items-center justify-center md:justify-start mt-2 mb-2">
                <div className="flex items-center">
                    <div className="relative w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
                        <Image
                            src="/logo.png"
                            alt="Astro World"
                            fill
                            className="object-contain p-1.5"
                        />
                    </div>
                    <div className="ml-3 w-28 h-9 flex items-center">
                        {isExpanded && showText && (
                            <motion.span
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="font-bold text-lg whitespace-nowrap"
                            >
                                Astro World
                            </motion.span>
                        )}
                    </div>
                </div>
            </div>

            <ThemeToggle type="sidebar" expanded={isExpanded} />

            <div className="flex-1 px-2 py-4 space-y-6 overflow-hidden">
                {mainItems.length > 0 && (
                    <div className="space-y-1">
                        {mainItems.map((item) => renderNavItem(item, pathname, isExpanded, showText))}
                    </div>
                )}

                {krc20Items.length > 0 && (
                    <div className="space-y-1">
                        <div className="px-2 h-5 mt-4 mb-2 flex items-center">
                            {isExpanded && showText && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="text-xs font-semibold text-muted-foreground uppercase tracking-wider"
                                >
                                    KRC-20
                                </motion.div>
                            )}
                        </div>
                        {krc20Items.map((item) => renderNavItem(item, pathname, isExpanded, showText))}
                    </div>
                )}

                {krc721Items.length > 0 && (
                    <div className="space-y-1">
                        <div className="px-2 h-5 mt-4 mb-2 flex items-center">
                            {isExpanded && showText && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="text-xs font-semibold text-muted-foreground uppercase tracking-wider"
                                >
                                    KRC-721
                                </motion.div>
                            )}
                        </div>
                        {krc721Items.map((item) => renderNavItem(item, pathname, isExpanded, showText))}
                    </div>
                )}

                {utilityItems.length > 0 && (
                    <div className="space-y-1">
                        <div className="px-2 h-5 mt-4 mb-2 flex items-center">
                            {isExpanded && showText && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="text-xs font-semibold text-muted-foreground uppercase tracking-wider"
                                >
                                    Utility
                                </motion.div>
                            )}
                        </div>
                        {utilityItems.map((item) => renderNavItem(item, pathname, isExpanded, showText))}
                    </div>
                )}
            </div>

            <div className="px-2 py-4 border-t border-border mt-auto">
                <div className="h-auto min-h-[68px]">
                    <button
                        onClick={handleWalletClick}
                        className="flex items-center w-full h-10 px-2 rounded-lg transition-all duration-200 hover:bg-accent group/wallet"
                    >
                        <div className="flex items-center w-full">
                            <div className="shrink-0 flex items-center justify-center w-6 h-6">
                                <Power className={`w-5 h-5 ${walletConnected ? 'text-green-500' : 'text-muted-foreground'}`} />
                            </div>
                            <div className="ml-3 w-28 h-6 flex items-center">
                                {isExpanded && showText && (
                                    <motion.span
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="whitespace-nowrap"
                                    >
                                        {walletConnected ? 'Connected' : 'Connect Wallet'}
                                    </motion.span>
                                )}
                            </div>
                        </div>
                    </button>
                    {walletConnected && walletInfo && isExpanded && showText && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="px-2 mt-1 text-sm"
                        >
                            <div className="text-green-500 font-medium">{walletInfo.balance} KAS</div>
                            <div className="text-xs text-muted-foreground truncate">
                                {walletInfo.address}
                            </div>
                        </motion.div>
                    )}
                </div>
            </div>
        </div>
    );
};

interface MobileSidebarProps {
    pathname: string;
    walletConnected: boolean;
    walletInfo: { balance: number; address: string } | null;
    handleWalletClick: () => void;
    closeMobileMenu: () => void;
    activeCategory: string | null;
    toggleCategory: (category: string) => void;
}

const MobileSidebar = ({
    pathname,
    walletConnected,
    walletInfo,
    handleWalletClick,
    closeMobileMenu,
    activeCategory,
    toggleCategory
}: MobileSidebarProps) => {
    const mainItems = navItems.filter(item => item.category === 'main');
    const categories = [
        { id: 'krc20', name: 'KRC-20', items: navItems.filter(item => item.category === 'krc20') },
        { id: 'krc721', name: 'KRC-721', items: navItems.filter(item => item.category === 'krc721') },
        { id: 'utility', name: 'Utility', items: navItems.filter(item => item.category === 'utility') }
    ];

    return (
        <div className="flex flex-col h-full w-full">
            <div className="h-16 px-4 flex items-center justify-between mt-2 mb-2">
                <div className="flex items-center">
                    <div className="relative w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
                        <Image
                            src="/logo.png"
                            alt="Astro World"
                            fill
                            className="object-contain p-1.5"
                        />
                    </div>
                    <span className="font-bold text-lg whitespace-nowrap ml-3">Astro World</span>
                </div>
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={closeMobileMenu}
                    className="h-8 w-8 rounded-full"
                >
                    <X className="h-4 w-4" />
                </Button>
            </div>

            <ThemeToggle type="mobile" />

            <div className="flex-1 px-3 py-4 space-y-4 overflow-y-auto">
                {mainItems.length > 0 && (
                    <div className="space-y-1">
                        {mainItems.map((item) => (
                            <Link
                                key={item.name}
                                href={item.href}
                                className={`flex items-center px-3 py-2.5 rounded-lg transition-all duration-200
                                    ${pathname === item.href
                                        ? 'bg-primary/10 text-primary font-medium'
                                        : 'text-foreground hover:bg-accent hover:text-accent-foreground'
                                    }`}
                                onClick={closeMobileMenu}
                            >
                                <div className="flex items-center">
                                    <div className="shrink-0">{item.icon}</div>
                                    <span className="ml-3 whitespace-nowrap">{item.name}</span>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}

                {categories.map(category => (
                    <div key={category.id} className="space-y-1">
                        <button
                            className="flex items-center justify-between w-full px-3 py-2.5 rounded-lg transition-all duration-200 bg-muted/50 hover:bg-muted"
                            onClick={() => toggleCategory(category.id)}
                        >
                            <span className="font-medium">{category.name}</span>
                            <ChevronRight className={`w-4 h-4 transition-transform duration-300 ${activeCategory === category.id ? 'rotate-90' : ''}`} />
                        </button>

                        <AnimatePresence>
                            {activeCategory === category.id && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    transition={{ duration: 0.2 }}
                                    className="overflow-hidden pl-2"
                                >
                                    {category.items.map(item => (
                                        <Link
                                            key={item.name}
                                            href={item.href}
                                            className={`flex items-center px-3 py-2.5 rounded-lg transition-all duration-200 my-1
                                                ${pathname === item.href
                                                    ? 'bg-primary/10 text-primary font-medium'
                                                    : 'text-foreground hover:bg-accent hover:text-accent-foreground'
                                                }`}
                                            onClick={closeMobileMenu}
                                        >
                                            <div className="flex items-center">
                                                <div className="shrink-0">{item.icon}</div>
                                                <span className="ml-3 whitespace-nowrap">{item.name}</span>
                                            </div>
                                        </Link>
                                    ))}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                ))}
            </div>

            <div className="px-3 py-4 border-t border-border mt-auto">
                <button
                    onClick={() => {
                        handleWalletClick();
                        if (!walletConnected) closeMobileMenu();
                    }}
                    className={`flex items-center w-full px-3 py-2.5 rounded-lg transition-all duration-200 
                        ${walletConnected
                            ? 'bg-green-500/10 text-green-500 hover:bg-green-500/20'
                            : 'bg-primary/10 text-primary hover:bg-primary/20'}`}
                >
                    <div className="flex items-center">
                        <Power className="w-5 h-5" />
                        <span className="ml-3 whitespace-nowrap font-medium">
                            {walletConnected ? 'Connected' : 'Connect Wallet'}
                        </span>
                    </div>
                </button>
                {walletConnected && walletInfo && (
                    <div className="px-2 mt-2 text-sm">
                        <div className="text-green-500 font-medium">{walletInfo.balance} KAS</div>
                        <div className="text-xs text-muted-foreground truncate">
                            {walletInfo.address}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

const renderNavItem = (item: { name: any; icon: any; href: any; category?: string; }, pathname: string, isExpanded: boolean, showText: boolean) => {
    const isActive = pathname === item.href;

    return (
        <Link
            key={item.name}
            href={item.href}
            className={`flex items-center h-10 px-2.5 py-0 rounded-lg transition-all duration-200
                ${isActive
                    ? 'bg-primary/10 text-primary font-medium'
                    : 'text-foreground hover:bg-accent hover:text-accent-foreground'
                }
                relative group/item
            `}
        >
            <div className="flex items-center justify-between w-full">
                <div className="flex items-center">
                    <div className="shrink-0 flex items-center justify-center w-6 h-6">
                        {item.icon}
                    </div>
                    <div className="ml-3 w-28 h-6 flex items-center">
                        {isExpanded && showText && (
                            <motion.span
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="whitespace-nowrap text-sm truncate max-w-[160px]"
                            >
                                {item.name}
                            </motion.span>
                        )}
                    </div>
                </div>
                <AnimatePresence>
                    {isExpanded && isActive && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                        >
                            <div className="w-1.5 h-1.5 rounded-full bg-primary mr-1" />
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
            {!isExpanded && isActive && (
                <div className="absolute right-0 top-1/2 transform -translate-y-1/2 w-1.5 h-8 bg-primary rounded-l-full" />
            )}
        </Link>
    );
};

export default NavBar;