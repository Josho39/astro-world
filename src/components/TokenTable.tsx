"use client"

import * as React from "react"
import { Table, TableBody, TableCaption, TableCell, TableFooter, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { cn } from "@/lib/utils"

interface TokenPrice {
    floorPrice: number;
    priceInUsd: number;
    marketCapInUsd: number;
    change24h: number;
    change24hInKas: number;
}

interface TokenBalance {
    ticker: string;
    balance: string;
    balanceUsd: number;
    balanceKas: number;
    price: TokenPrice;
    percentage: number;
    iconUrl?: string;
    change24h: number;
}

interface TokenTableProps {
    tokens: TokenBalance[];
    totalValueKas: number;
    totalValueUsd: number;
}

export function TokenTable({ tokens, totalValueKas, totalValueUsd }: TokenTableProps) {
    const formatNumber = (value: number, decimals: number = 2): string => {
        return value.toLocaleString(undefined, {
            minimumFractionDigits: decimals,
            maximumFractionDigits: decimals
        });
    };

    const formatUsdValue = (value: number): string => {
        return value < 0.01 ? 
            `$${value.toFixed(4)}` : 
            `$${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    };
    const [isMobile, setIsMobile] = React.useState(false);
    
    React.useEffect(() => {
        const checkIfMobile = () => setIsMobile(window.innerWidth < 768);
        checkIfMobile();
        window.addEventListener('resize', checkIfMobile);
        return () => window.removeEventListener('resize', checkIfMobile);
    }, []);

    return (
        <div className="overflow-x-auto">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className="w-[180px]">Token</TableHead>
                        <TableHead className="text-right">Balance</TableHead>
                        {!isMobile && <TableHead className="text-right">Price (KAS)</TableHead>}
                        {!isMobile && <TableHead className="text-right">Value (KAS)</TableHead>}
                        <TableHead className="text-right">Value (USD)</TableHead>
                        <TableHead className="text-right w-[80px]">24h</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {tokens.map((token) => (
                        <TableRow key={token.ticker}>
                            <TableCell>
                                <div className="flex items-center gap-2">
                                    {token.iconUrl && (
                                        <img 
                                            src={token.iconUrl} 
                                            alt={token.ticker}
                                            className="w-6 h-6 rounded-full"
                                        />
                                    )}
                                    <span className="font-medium">{token.ticker}</span>
                                </div>
                            </TableCell>
                            <TableCell className="text-right font-mono text-xs sm:text-sm">
                                {formatNumber(parseFloat(token.balance), isMobile ? 2 : 6)}
                            </TableCell>
                            {!isMobile && (
                                <TableCell className="text-right font-mono text-xs sm:text-sm">
                                    {token.price.floorPrice === 1 ? '1.00000000' : 
                                    formatNumber(token.price.floorPrice, 8)}
                                </TableCell>
                            )}
                            {!isMobile && (
                                <TableCell className="text-right font-mono text-xs sm:text-sm">
                                    {formatNumber(token.balanceKas)}
                                </TableCell>
                            )}
                            <TableCell className="text-right font-mono text-xs sm:text-sm">
                                {formatUsdValue(token.balanceUsd)}
                            </TableCell>
                            <TableCell className={cn(
                                "text-right font-mono text-xs sm:text-sm",
                                token.change24h > 0 ? "text-green-500" : 
                                token.change24h < 0 ? "text-red-500" : ""
                            )}>
                                {token.change24h > 0 ? '+' : ''}{token.change24h.toFixed(2)}%
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
                <TableFooter>
                    <TableRow>
                        <TableCell>Total</TableCell>
                        {isMobile ? (
                            <TableCell></TableCell>
                        ) : (
                            <TableCell colSpan={2}></TableCell>
                        )}
                        {!isMobile && (
                            <TableCell className="text-right font-mono text-xs sm:text-sm">
                                {formatNumber(totalValueKas)}
                            </TableCell>
                        )}
                        <TableCell className="text-right font-mono text-xs sm:text-sm">
                            {formatUsdValue(totalValueUsd)}
                        </TableCell>
                        <TableCell></TableCell>
                    </TableRow>
                </TableFooter>
            </Table>
        </div>
    );
}
