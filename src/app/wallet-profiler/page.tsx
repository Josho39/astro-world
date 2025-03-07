'use client';

import React from 'react';
import WalletProfiler from './walletprofiler';
import { PageHeader } from '@/components/ui/page-header';
import { Wallet } from 'lucide-react';

export default function WalletProfilerPage() {
  return (
    <div className="w-full py-1">
      <div className="space-y-4">
        <PageHeader 
          category="utility"
          title="Wallet Profiler"
          icon={<Wallet className="w-5 h-5" />}
        />
        <WalletProfiler />
      </div>
    </div>
  );
}