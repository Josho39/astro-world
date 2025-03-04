/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowDownRight, ArrowUpRight, ChevronLeft, ChevronRight } from 'lucide-react';

const formatKAS = (amount: number) => {
  return (amount / 100000000).toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }) + ' KAS';
};

const formatDate = (timestamp: number) => {
  const date = new Date(timestamp);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};


const TransactionPanel = ({ transaction, mainAddress }: { transaction: any; mainAddress: string }) => {
    const sentAmount = transaction.inputs.reduce((sum: number, input: any) => 
      input.previous_outpoint_resolved?.script_public_key_address === mainAddress 
        ? sum + (input.previous_outpoint_resolved?.amount || 0)
        : 0, 0);
  
    const receivedAmount = transaction.outputs.reduce((sum: number, output: any) => 
      output.script_public_key_address === mainAddress 
        ? sum + output.amount
        : 0, 0);
  
    const netAmount = receivedAmount - sentAmount;
    const isReceiving = netAmount > 0;
  
    return (
      <Card className="p-4 hover:shadow-lg transition-shadow">
        <div className="flex items-start gap-4">
          <div className={`p-2 rounded-full ${isReceiving ? 'bg-green-500/10' : 'bg-red-500/10'}`}>
            {isReceiving ? (
              <ArrowDownRight className="h-5 w-5 text-green-500" />
            ) : (
              <ArrowUpRight className="h-5 w-5 text-red-500" />
            )}
          </div>
          
          <div className="flex-1 flex items-start justify-between gap-4">
            <div>
              <div className="text-sm font-medium truncate max-w-sm">
                {transaction.transaction_id}
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                {formatDate(transaction.block_time)}
              </div>
            </div>
            
            <div className="text-right">
              <div className={`text-sm font-bold ${isReceiving ? 'text-green-500' : 'text-red-500'}`}>
                {isReceiving ? '+' : '-'}{formatKAS(Math.abs(netAmount))}
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                {transaction.is_accepted ? 'Confirmed' : 'Pending'}
              </div>
            </div>
          </div>
        </div>
      </Card>
    );
  };
  
  const TransactionList = ({ transactions, mainAddress }: { transactions: any[]; mainAddress: string }) => {
    const [currentPage, setCurrentPage] = useState(0);
    const ITEMS_PER_PAGE = 25;
    
    const sortedTransactions = [...transactions].sort((a, b) => b.block_time - a.block_time);
    const totalPages = Math.ceil(sortedTransactions.length / ITEMS_PER_PAGE);
    
    const currentTransactions = sortedTransactions.slice(
      currentPage * ITEMS_PER_PAGE,
      (currentPage + 1) * ITEMS_PER_PAGE
    );
  
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Transaction History</h2>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(p => Math.max(0, p - 1))}
              disabled={currentPage === 0}
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Previous
            </Button>
            <span className="text-sm text-muted-foreground px-2">
              Page {currentPage + 1} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(p => Math.min(totalPages - 1, p + 1))}
              disabled={currentPage === totalPages - 1}
            >
              Next
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
  
        <div className="grid gap-2">
          {currentTransactions.map((transaction) => (
            <TransactionPanel
              key={transaction.transaction_id}
              transaction={transaction}
              mainAddress={mainAddress}
            />
          ))}
        </div>
  
        <div className="flex items-center justify-between mt-4">
          <div className="text-sm text-muted-foreground">
            Showing {currentPage * ITEMS_PER_PAGE + 1} to {Math.min((currentPage + 1) * ITEMS_PER_PAGE, sortedTransactions.length)} of {sortedTransactions.length} transactions
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(0)}
              disabled={currentPage === 0}
            >
              First
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(totalPages - 1)}
              disabled={currentPage === totalPages - 1}
            >
              Last
            </Button>
          </div>
        </div>
      </div>
    );
  };
  
  export default TransactionList;