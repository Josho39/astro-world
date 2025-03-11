import React from 'react';
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Loader2, CheckCircle2, XCircle, AlertCircle } from "lucide-react";

interface AirdropModalProps {
    isOpen: boolean;
    onClose: () => void;
    progress: {
        stage: 'checking' | 'preparing' | 'transferring' | 'complete' | 'error';
        status?: string;
        index?: number;
        total?: number;
        error?: string;
        balance?: string;
        required?: string;
    };
}

export function AirdropModal({ isOpen, onClose, progress }: AirdropModalProps) {
    const getProgressPercentage = () => {
        if (progress.stage === 'checking') return 0;
        if (progress.stage === 'preparing' && progress.status?.includes('preparing')) {
            const match = progress.status.match(/\d+/);
            return match ? parseInt(match[0]) : 0;
        }
        if (progress.stage === 'transferring' && progress.index && progress.total) {
            return (progress.index / progress.total) * 100;
        }
        if (progress.stage === 'complete') return 100;
        return 0;
    };

    const canClose = progress.stage === 'complete' || progress.stage === 'error';

    const renderContent = () => {
        switch (progress.stage) {
            case 'checking':
                return (
                    <>
                        <AlertDialogHeader>
                            <AlertDialogTitle className="flex items-center gap-2">
                                <Loader2 className="h-5 w-5 animate-spin text-primary" />
                                Checking Balance
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                                Verifying your token balance...
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <div className="my-4">
                            <Progress value={0} className="h-2" />
                        </div>
                    </>
                );

            case 'preparing':
                return (
                    <>
                        <AlertDialogHeader>
                            <AlertDialogTitle className="flex items-center gap-2">
                                <Loader2 className="h-5 w-5 animate-spin text-primary" />
                                Preparing Transfer
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                                {progress.status}
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <div className="my-4">
                            <Progress value={getProgressPercentage()} className="h-2" />
                        </div>
                    </>
                );

            case 'transferring':
                return (
                    <>
                        <AlertDialogHeader>
                            <AlertDialogTitle className="flex items-center gap-2">
                                <Loader2 className="h-5 w-5 animate-spin text-primary" />
                                Transfer in Progress
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                                Processing transfer {progress.index} of {progress.total}
                                <div className="text-sm text-yellow-500 mt-2">
                                    Please do not close this window or browser
                                </div>
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <div className="my-4">
                            <Progress value={getProgressPercentage()} className="h-2" />
                        </div>
                    </>
                );

            case 'complete':
                return (
                    <>
                        <AlertDialogHeader>
                            <AlertDialogTitle className="flex items-center gap-2 text-green-500">
                                <CheckCircle2 className="h-5 w-5" />
                                Transfer Complete
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                                Successfully transferred tokens to {progress.total} recipients
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <div className="my-4">
                            <Progress value={100} className="h-2" />
                        </div>
                    </>
                );

            case 'error':
                return (
                    <>
                        <AlertDialogHeader>
                            <AlertDialogTitle className="flex items-center gap-2 text-destructive">
                                <XCircle className="h-5 w-5" />
                                Error
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                                {progress.error || 'An error occurred during the transfer'}
                                {progress.balance && progress.required && (
                                    <div className="mt-2 p-4 bg-destructive/10 rounded-lg">
                                        <div className="flex items-center gap-2">
                                            <AlertCircle className="h-4 w-4 text-destructive" />
                                            <span>Insufficient Balance</span>
                                        </div>
                                        <div className="mt-2 text-sm">
                                            Available: {progress.balance}<br />
                                            Required: {progress.required}
                                        </div>
                                    </div>
                                )}
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                    </>
                );
        }
    };

    return (
        <AlertDialog open={isOpen}>
            <AlertDialogContent>
                {renderContent()}
                <AlertDialogFooter>
                    {canClose && (
                        <Button
                            variant="outline"
                            onClick={onClose}
                            className="mt-2 sm:mt-0"
                        >
                            Close
                        </Button>
                    )}
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}