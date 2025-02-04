'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getTransaction } from '@/lib/kaspa-client';
import { useEffect, useState } from 'react';
import { TransactionSkeleton } from '@/components/ui/skeleton';
import { formatDistanceToNow } from 'date-fns';

interface TransactionDetails {
    transaction_id: string;
    hash: string;
    block_time: number;
    is_accepted: boolean;
    accepting_block_hash?: string;
    subnetwork_id: string;
    inputs: Array<{
        previous_outpoint_hash: string;
        previous_outpoint_index: number;
        signature_script: string;
        sig_op_count: number;
    }>;
    outputs: Array<{
        amount: number;
        script_public_key: string;
        script_public_key_type: string;
        script_public_key_address: string;
    }>;
}

export default function TransactionPage() {
    const params = useParams();
    const [txInfo, setTxInfo] = useState<TransactionDetails | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchTx = async () => {
            try {
                const data = await getTransaction(params.id as string);
                setTxInfo(data);
            } catch (error) {
                console.error('Failed to fetch transaction:', error);
            } finally {
                setIsLoading(false);
            }
        };

        if (params.id) {
            fetchTx();
        }
    }, [params.id]);

    if (isLoading) {
        return <TransactionSkeleton />;
    }

    if (!txInfo) {
        return (
            <div className="min-h-screen">
                <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
                    <Card className="border-0 bg-white/80 dark:bg-black/20 backdrop-blur-xl">
                        <CardContent className="pt-6">
                            <p className="text-center text-gray-600 dark:text-gray-400">
                                Transaction not found
                            </p>
                        </CardContent>
                    </Card>
                </div>
            </div>
        );
    }

    const totalOutput = txInfo.outputs.reduce((sum, output) => sum + output.amount, 0);
    const fee = -totalOutput;

    return (
        <div className="min-h-screen">
            <div className="max-w-8xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
                <div className="space-y-6">
                    <div className="space-y-1">
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-500 dark:to-purple-500">
                                Transaction Details
                            </span>
                        </h1>
                        <p className="text-gray-600 dark:text-gray-400">
                            View transaction details and status information
                        </p>
                    </div>

                    <Card className="border-0 bg-white/80 dark:bg-black/20 backdrop-blur-xl">
                        <CardContent className="p-6">
                            <div className="flex flex-col md:flex-row justify-between gap-4">
                                <div className="space-y-1">
                                    <p className="text-sm text-gray-600 dark:text-gray-400">Transaction ID</p>
                                    <code className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-500 dark:to-purple-500">
                                        {txInfo.transaction_id}
                                    </code>
                                </div>
                                <div className="flex items-start justify-end">
                                    <span className={`rounded-full px-3 py-1 text-sm font-medium ${txInfo.is_accepted
                                            ? "bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300"
                                            : "bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-300"
                                        }`}>
                                        {txInfo.is_accepted ? "Accepted" : "Pending"}
                                    </span>
                                </div>
                            </div>

                            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-800">
                                <dl className="grid grid-cols-1 gap-4">
                                    <div>
                                        <dt className="text-sm text-gray-600 dark:text-gray-400">Time</dt>
                                        <dd className="mt-1">
                                            {formatDistanceToNow(new Date(txInfo.block_time), { addSuffix: true })}
                                        </dd>
                                    </div>
                                    {txInfo.accepting_block_hash && (
                                        <div>
                                            <dt className="text-sm text-gray-600 dark:text-gray-400">Accepting Block</dt>
                                            <dd className="mt-1 font-mono text-sm break-all">
                                                {txInfo.accepting_block_hash}
                                            </dd>
                                        </div>
                                    )}
                                </dl>
                            </div>
                        </CardContent>
                    </Card>

                    <div className="grid gap-6 md:grid-cols-2">
                        <Card className="border-0 bg-white/80 dark:bg-black/20 backdrop-blur-xl">
                            <CardHeader>
                                <CardTitle>Inputs</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {txInfo.inputs.length === 0 ? (
                                        <p className="text-gray-600 dark:text-gray-400">Coinbase Transaction</p>
                                    ) : (
                                        txInfo.inputs.map((input, index) => (
                                            <div key={index} className="pb-4 border-b border-gray-200 dark:border-gray-800 last:border-0">
                                                <p className="text-sm text-gray-600 dark:text-gray-400">From Transaction</p>
                                                <Link
                                                    href={`/explorer/txs/${input.previous_outpoint_hash}`}
                                                    className="mt-1 block font-mono text-sm hover:text-blue-600 dark:hover:text-blue-400"
                                                >
                                                    {input.previous_outpoint_hash}
                                                </Link>
                                                <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                                                    Output Index: {input.previous_outpoint_index}
                                                </p>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="border-0 bg-white/80 dark:bg-black/20 backdrop-blur-xl">
                            <CardHeader>
                                <CardTitle>Outputs</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {txInfo.outputs.map((output, index) => (
                                        <div key={index} className="pb-4 border-b border-gray-200 dark:border-gray-800 last:border-0">
                                            <div className="flex justify-between">
                                                <span className="text-sm text-gray-600 dark:text-gray-400">Amount</span>
                                                <span>{output.amount / 100000000} KAS</span>
                                            </div>
                                            <div className="mt-2">
                                                <p className="text-sm text-gray-600 dark:text-gray-400">To Address</p>
                                                <Link
                                                    href={`/explorer/addresses/${output.script_public_key_address}`}
                                                    className="mt-1 block font-mono text-sm hover:text-blue-600 dark:hover:text-blue-400"
                                                >
                                                    {output.script_public_key_address}
                                                </Link>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {fee > 0 && (
                        <Card className="border-0 backdrop-blur-xl">
                            <CardContent className="p-6">
                                <div className="flex justify-between">
                                    <span className="text-sm text-gray-600 dark:text-gray-400">Transaction Fee</span>
                                    <span>{fee / 100000000} KAS</span>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    );
}