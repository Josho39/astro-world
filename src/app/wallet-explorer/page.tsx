'use client';

import React from 'react';
import TransactionTimeline from './TransactionTimeline';
import { PageHeader } from '@/components/ui/page-header';
import { Eye } from 'lucide-react';

export default function WalletExplorerPage() {
  return (
    <div className="w-full py-1">
      <div className="space-y-4">
        <PageHeader 
          category="utility"
          title="Wallet Explorer"
          icon={<Eye className="w-5 h-5" />}
        />
        <TransactionTimeline />
      </div>
    </div>
  );
}