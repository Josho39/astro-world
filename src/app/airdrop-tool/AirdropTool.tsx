'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Progress } from "@/components/ui/progress";
import { useWallet } from '@/context/WalletContext';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Plus, Upload, Trash2, Download, Box, ArrowRight, Info, AlertCircle } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger, } from "@/components/ui/tooltip";
import { AirdropModal } from './AirdropModal';

declare global {
    interface Window {
        kasware: any;
    }
}

interface TransferEntry {
    address: string;
    amount: string;
}

interface BatchTransferProgress {
    status?: string;
    index?: number;
    total?: number;
    errorMsg?: string;
    txId?: { revealId: string };
}

interface BatchTransferResult {
    status: string;
    index?: number;
    errorMsg?: string;
    txId?: { revealId: string };
}

export default function AirdropTool() {
    const [entries, setEntries] = useState<TransferEntry[]>([{ address: '', amount: '' }]);
    const [ticker, setTicker] = useState('');
    const [isTransferring, setIsTransferring] = useState(false);
    const [transferProgress, setTransferProgress] = useState<BatchTransferProgress>({});
    const { walletConnected, walletInfo } = useWallet();
    const [modalOpen, setModalOpen] = useState(false);
    const [modalProgress, setModalProgress] = useState<{
        stage: 'checking' | 'preparing' | 'transferring' | 'complete' | 'error',
        status: string,
        index: number,
        total: number,
        error: string,
        balance: string,
        required: string
    }>({
        stage: 'checking',
        status: '',
        index: 0,
        total: 0,
        error: '',
        balance: '',
        required: ''
    });

    const checkBalance = async () => {
        if (!walletConnected || !walletInfo?.address || !ticker) return false;

        try {
            setModalOpen(true);
            setModalProgress({
                ...modalProgress,
                stage: 'checking'
            });

            const totalRequired = entries.reduce((sum, entry) => sum + parseFloat(entry.amount || '0'), 0);

            if (ticker.toLowerCase() === 'kas') {
                const balance = walletInfo.balance;
                if (balance < totalRequired) {
                    setModalProgress({
                        ...modalProgress,
                        stage: 'error',
                        error: 'Insufficient KAS balance',
                        balance: balance.toString(),
                        required: totalRequired.toString()
                    });
                    return false;
                }
            } else {
                const response = await fetch(`https://api.kasplex.org/v1/krc20/address/${walletInfo.address}/token/${ticker}`);
                const data = await response.json();

                if (data.message === 'successful' && data.result?.length > 0) {
                    const tokenInfo = data.result[0];
                    const decimals = parseInt(tokenInfo.dec);
                    const balance = parseFloat(tokenInfo.balance) / Math.pow(10, decimals);

                    if (balance < totalRequired) {
                        setModalProgress({
                            ...modalProgress,
                            stage: 'error',
                            error: `Insufficient ${ticker.toUpperCase()} balance`,
                            balance: balance.toString(),
                            required: totalRequired.toString()
                        });
                        return false;
                    }
                } else {
                    setModalProgress({
                        ...modalProgress,
                        stage: 'error',
                        error: `No ${ticker.toUpperCase()} balance found`
                    });
                    return false;
                }
            }

            return true;
        } catch (error) {
            console.error('Balance check error:', error);
            setModalProgress({
                ...modalProgress,
                stage: 'error',
                error: 'Failed to check balance'
            });
            return false;
        }
    };

    useEffect(() => {
        if (!window.kasware) return;

        const handleTransferProgress = (progress: any[]) => {
            const latestProgress = progress[progress.length - 1];
            if (latestProgress) {
                if (latestProgress.status?.includes('preparing')) {
                    setModalProgress({
                        ...modalProgress,
                        stage: 'preparing',
                        status: latestProgress.status
                    });
                } else {
                    setModalProgress({
                        ...modalProgress,
                        stage: 'transferring',
                        status: latestProgress.status,
                        index: latestProgress.index,
                        total: entries.length
                    });
                }

                if (latestProgress.status === 'success') {
                    setModalProgress({
                        ...modalProgress,
                        stage: 'complete',
                        total: entries.length
                    });
                } else if (latestProgress.status === 'failed') {
                    setModalProgress({
                        ...modalProgress,
                        stage: 'error',
                        error: latestProgress.errorMsg || 'Transfer failed'
                    });
                }
            }
        };

        window.kasware.on('krc20BatchTransferChanged', handleTransferProgress);

        return () => {
            window.kasware.removeListener('krc20BatchTransferChanged', handleTransferProgress);
        };
    }, [entries.length]);

    const getProgressPercentage = () => {
        if (!transferProgress.index || !transferProgress.total) return 0;
        return (transferProgress.index / transferProgress.total) * 100;
    };

    const getStatusPercentage = () => {
        if (!transferProgress.status || !transferProgress.status.includes('preparing')) return 100;
        const match = transferProgress.status.match(/\d+/);
        return match ? parseInt(match[0]) : 0;
    };

    const addNewEntry = () => {
        setEntries([...entries, { address: '', amount: '' }]);
    };

    const removeEntry = (index: number) => {
        const newEntries = entries.filter((_, i) => i !== index);
        setEntries(newEntries.length ? newEntries : [{ address: '', amount: '' }]);
    };

    const updateEntry = (index: number, field: keyof TransferEntry, value: string) => {
        const newEntries = [...entries];
        newEntries[index] = { ...newEntries[index], [field]: value };
        setEntries(newEntries);
    };

    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        try {
            const text = await file.text();
            const rows = text.split('\n')
                .filter(row => row.trim())
                .slice(1);

            const newEntries = rows.map(row => {
                const [address, amount] = row.split(',').map(item => item.trim());
                return { address: address || '', amount: amount || '' };
            });

            setEntries(newEntries.length ? newEntries : [{ address: '', amount: '' }]);
        } catch (error) {
            console.error('Error reading CSV:', error);
        }
    };

    const downloadTemplate = () => {
        const template = 'address,amount\nkaspa:address1,100\nkaspa:address2,200';
        const blob = new Blob([template], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'airdrop-template.csv';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const startAirdrop = async () => {
        if (!walletConnected || !walletInfo || !window.kasware) return;

        try {
            const hasBalance = await checkBalance();
            if (!hasBalance) return;

            const kasware = window.kasware;

            if (ticker.toLowerCase() === 'kas') {
                const transferList = entries.map(entry => ({
                    to: entry.address,
                    amount: Math.floor(parseFloat(entry.amount) * 100000000)
                }));
                await kasware.batchTransfer(transferList);
            } else {
                const transferList = entries.map(entry => ({
                    tick: ticker.toUpperCase(),
                    to: entry.address,
                    amount: parseFloat(entry.amount)
                }));
                await kasware.krc20BatchTransferTransaction(transferList);
            }
        } catch (error) {
            console.error('Airdrop error:', error);
            setModalProgress({
                ...modalProgress,
                stage: 'error',
                error: 'Failed to start transfer'
            });
        }
    };


    if (!walletConnected) {
        return (

            <div className="text-center py-12">
                <p className="text-muted-foreground">Please connect your wallet to use the airdrop tool</p>
            </div>

        );
    }

    return (
        <><div className="relative">
            <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-primary/10 to-background blur-3xl"></div>

            <div className="relative">
                <Card className="border-0 shadow-2xl bg-background/60 backdrop-blur-lg">
                    <CardContent className="p-6 space-y-6">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                            <div className="flex items-center space-x-2 w-full md:w-auto">
                                <div className="relative flex-1 md:w-64">
                                    <Input
                                        placeholder="Token Ticker (e.g., BURT)"
                                        value={ticker}
                                        onChange={(e) => setTicker(e.target.value)}
                                        className="pl-10" />
                                    <Box className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                </div>
                                <TooltipProvider>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <Button variant="ghost" size="icon">
                                                <Info className="h-4 w-4 text-muted-foreground" />
                                            </Button>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <p>Enter KAS for native token or the token ticker for KRC20 tokens</p>
                                        </TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>
                            </div>

                            <div className="flex items-center space-x-3 w-full md:w-auto justify-end">
                                <TooltipProvider>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={downloadTemplate}
                                                className="bg-background/80"
                                            >
                                                <Download className="w-4 h-4 mr-2" />
                                                Template
                                            </Button>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <p>Download CSV template</p>
                                        </TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>

                                <TooltipProvider>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <label className="cursor-pointer">
                                                <div className="flex items-center px-4 py-2 text-sm border rounded-md hover:bg-accent transition-colors">
                                                    <Upload className="w-4 h-4 mr-2" />
                                                    Upload CSV
                                                    <input
                                                        type="file"
                                                        accept=".csv"
                                                        className="hidden"
                                                        onChange={handleFileUpload} />
                                                </div>
                                            </label>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <div className="space-y-1">
                                                <p className="font-medium">CSV Format:</p>
                                                <p>Column 1: Kaspa address</p>
                                                <p>Column 2: Amount</p>
                                            </div>
                                        </TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>
                            </div>
                        </div>

                        <div className="space-y-3">
                            {entries.map((entry, index) => (
                                <div key={index} className="flex items-center space-x-3 group">
                                    <Input
                                        placeholder="Recipient Address"
                                        value={entry.address}
                                        onChange={(e) => updateEntry(index, 'address', e.target.value)} />
                                    <Input
                                        placeholder="Amount"
                                        value={entry.amount}
                                        onChange={(e) => updateEntry(index, 'amount', e.target.value)}
                                        className="w-32"
                                        type="number"
                                        step="0.00000001" />
                                    <TooltipProvider>
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => removeEntry(index)}
                                                    disabled={entries.length === 1}
                                                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                                                >
                                                    <Trash2 className="w-4 h-4 text-destructive" />
                                                </Button>
                                            </TooltipTrigger>
                                            <TooltipContent>Remove recipient</TooltipContent>
                                        </Tooltip>
                                    </TooltipProvider>
                                </div>
                            ))}
                        </div>

                        <div className="space-y-4 pt-4">
                            <Button
                                variant="outline"
                                onClick={addNewEntry}
                                className="w-full"
                            >
                                <Plus className="w-4 h-4 mr-2" />
                                Add Recipient
                            </Button>

                            <Button
                                onClick={startAirdrop}
                                className="w-full bg-gradient-to-r from-primary/80 to-primary hover:from-primary hover:to-primary/90 transition-all duration-300"
                                disabled={!ticker || entries.some(e => !e.address || !e.amount) || isTransferring}
                            >
                                <ArrowRight className="w-4 h-4 mr-2" />
                                {isTransferring ? 'Processing...' : 'Start Airdrop'}
                            </Button>
                        </div>

                        <div className="flex justify-between items-center pt-4 text-sm text-muted-foreground border-t">
                            <span>Total Recipients: {entries.length}</span>
                            <span>Total Amount: {entries.reduce((sum, entry) => sum + (Number(entry.amount) || 0), 0)} {ticker}</span>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div><AirdropModal
                isOpen={modalOpen}
                onClose={() => {
                    if (modalProgress.stage === 'complete' || modalProgress.stage === 'error') {
                        setModalOpen(false);
                    }
                }}
                progress={modalProgress} /></>

    );
}