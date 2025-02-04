'use client';

import { useParams, useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { getAddressBalance, getAddressTransactions } from '@/lib/kaspa-client';
import { useEffect, useState } from 'react';
import { AddressDetailsSkeleton } from '@/components/ui/skeleton';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { formatDistanceToNow } from 'date-fns';
import { ChevronLeft, ChevronRight, Copy, ExternalLink, ArrowLeft  } from 'lucide-react';


const ITEMS_PER_PAGE = 50;

interface Transaction {
    transaction_id: string;
    hash: string;
    block_time: number;
    is_accepted: boolean;
    inputs: Array<{
        previous_outpoint_hash: string;
        previous_outpoint_index: number;
    }>;
    outputs: Array<{
        amount: number;
        script_public_key_address: string;
    }>;
}

interface AddressData {
    balance: number;
    transactions: Transaction[];
    totalTxs: number;
}

export default function AddressPage() {
    const params = useParams();
    const router = useRouter();
    const searchParams = useSearchParams();
    const currentPage = Number(searchParams.get('page')) || 1;

    const [addressInfo, setAddressInfo] = useState<AddressData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [copiedToClipboard, setCopiedToClipboard] = useState(false);
    const totalPages = addressInfo ? Math.ceil(addressInfo.totalTxs / ITEMS_PER_PAGE) : 1;

    useEffect(() => {
        const fetchAddressInfo = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const offset = (currentPage - 1) * ITEMS_PER_PAGE;
                const [balanceRes, txRes] = await Promise.all([
                    getAddressBalance(params.addr as string),
                    getAddressTransactions(params.addr as string, ITEMS_PER_PAGE, offset)
                ]);

                setAddressInfo({
                    balance: balanceRes.balance,
                    transactions: txRes,
                    totalTxs: txRes.length
                });
            } catch (err) {
                console.error('Failed to fetch address info:', err);
                setError('Failed to load address data');
            } finally {
                setIsLoading(false);
            }
        };

        if (params.addr) {
            fetchAddressInfo();
        }
    }, [params.addr, currentPage]);

    const getTransactionAmount = (tx: Transaction): { amount: number; type: 'in' | 'out' } => {
        const addr = params.addr as string;
        let incomingAmount = 0;
        let outgoingAmount = 0;

        tx.outputs.forEach(output => {
            if (output.script_public_key_address === addr) {
                incomingAmount += output.amount;
            }
        });

        const totalOutput = tx.outputs.reduce((sum, output) => sum + output.amount, 0);
        if (incomingAmount < totalOutput) {
            return { amount: -totalOutput / 100000000, type: 'out' };
        }

        return { amount: incomingAmount / 100000000, type: 'in' };
    };

    const copyToClipboard = async () => {
        await navigator.clipboard.writeText(params.addr as string);
        setCopiedToClipboard(true);
        setTimeout(() => setCopiedToClipboard(false), 2000);
    };

    if (isLoading) {
        return <AddressDetailsSkeleton />;
    }

    if (error) {
        return (
            <div className="space-y-6">
                <Card className="border-0 bg-white/5 backdrop-blur-sm">
                    <CardContent className="pt-6">
                        <p className="text-center text-red-500">{error}</p>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="space-y-2">
                <h1 className="text-4xl font-bold">
                    <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-500 dark:to-purple-500">
                        Address Details
                    </span>
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                    View balance and transaction history
                </p>
            </div>

            <Card className="border-0 bg-white/5 backdrop-blur-sm">
                <CardContent className="p-6">
                    <div className="space-y-6">
                        <div className="grid gap-6 md:grid-cols-2">
                            <div className="space-y-2">
                                <p className="text-sm text-gray-600 dark:text-gray-400">Address</p>
                                <div className="flex items-center space-x-2">
                                    <code className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-500 dark:to-purple-500">
                                        {params.addr}
                                    </code>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={copyToClipboard}
                                        className="h-8 w-8 p-0 hover:bg-gray-100 dark:hover:bg-gray-800/50"
                                    >
                                        {copiedToClipboard ? (
                                            <span className="text-green-500 text-xs">Copied!</span>
                                        ) : (
                                            <Copy className="h-4 w-4" />
                                        )}
                                    </Button>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <p className="text-sm text-gray-600 dark:text-gray-400">Balance</p>
                                <div className="flex items-baseline space-x-2">
                                    <p className="text-3xl font-bold">
                                        {addressInfo ? (addressInfo.balance / 100000000).toFixed(8) : '0'}
                                    </p>
                                    <span className="text-gray-600 dark:text-gray-400">KAS</span>
                                </div>
                                {addressInfo && (
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                        {addressInfo.totalTxs} total transactions
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card className="border-0 bg-white/5 backdrop-blur-sm">
                <CardHeader>
                    <CardTitle className="text-xl font-semibold">Transaction History</CardTitle>
                </CardHeader>
                <CardContent>
                    {addressInfo && addressInfo.transactions.length > 0 ? (
                        <>
                            <div className="rounded-md border border-gray-200 dark:border-gray-800">
                                <Table>
                                    <TableHeader>
                                        <TableRow className="hover:bg-gray-100/50 dark:hover:bg-gray-800/50">
                                            <TableHead className="font-medium">Time</TableHead>
                                            <TableHead className="font-medium">Transaction ID</TableHead>
                                            <TableHead className="text-right font-medium">Amount (KAS)</TableHead>
                                            <TableHead className="font-medium">Status</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {addressInfo.transactions.map((tx) => {
                                            const { amount, type } = getTransactionAmount(tx);
                                            return (
                                                <TableRow
                                                    key={tx.transaction_id}
                                                    className="hover:bg-gray-100/50 dark:hover:bg-gray-800/50"
                                                >
                                                    <TableCell className="text-gray-600 dark:text-gray-400">
                                                        {formatDistanceToNow(new Date(tx.block_time), { addSuffix: true })}
                                                    </TableCell>
                                                    <TableCell>
                                                        <Link
                                                            href={`/explorer/txs/${tx.transaction_id}`}
                                                            className="flex items-center space-x-2 text-gray-900 dark:text-gray-100 
                                       hover:text-blue-600 dark:hover:text-blue-400"
                                                        >
                                                            <code className="text-xs font-mono">
                                                                {tx.transaction_id.substring(0, 8)}...
                                                                {tx.transaction_id.substring(tx.transaction_id.length - 8)}
                                                            </code>
                                                            <ExternalLink className="h-3 w-3" />
                                                        </Link>
                                                    </TableCell>
                                                    <TableCell className={`text-right ${type === 'in'
                                                        ? "text-green-600 dark:text-green-500"
                                                        : "text-red-600 dark:text-red-500"
                                                        }`}>
                                                        {type === 'in' ? '+' : ''}{amount.toFixed(8)}
                                                    </TableCell>
                                                    <TableCell>
                                                        <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs 
                                           font-medium ${tx.is_accepted
                                                                ? "bg-green-100 dark:bg-green-500/20 text-green-600 dark:text-green-500"
                                                                : "bg-yellow-100 dark:bg-yellow-500/20 text-yellow-600 dark:text-yellow-500"
                                                            }`}>
                                                            {tx.is_accepted ? "Confirmed" : "Pending"}
                                                        </span>
                                                    </TableCell>
                                                </TableRow>
                                            );
                                        })}
                                    </TableBody>
                                </Table>
                            </div>

                            {totalPages > 1 && (
                                <div className="mt-6 flex items-center justify-between">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => router.push(`?page=${currentPage - 1}`)}
                                        disabled={currentPage <= 1}
                                        className="border-gray-200 dark:border-gray-800 hover:bg-gray-100 
                             dark:hover:bg-gray-800/50"
                                    >
                                        <ChevronLeft className="h-4 w-4 mr-2" />
                                        Previous
                                    </Button>
                                    <span className="text-sm text-gray-600 dark:text-gray-400">
                                        Page {currentPage} of {totalPages}
                                    </span>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => router.push(`?page=${currentPage + 1}`)}
                                        disabled={currentPage >= totalPages}
                                        className="border-gray-200 dark:border-gray-800 hover:bg-gray-100 
                             dark:hover:bg-gray-800/50"
                                    >
                                        Next
                                        <ChevronRight className="h-4 w-4 ml-2" />
                                    </Button>
                                </div>
                            )}
                        </>
                    ) : (
                        <p className="text-center text-gray-600 dark:text-gray-400 py-8">
                            No transactions found for this address
                        </p>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}