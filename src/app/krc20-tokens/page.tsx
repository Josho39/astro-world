'use client';

import React from 'react';
import TokenTable from './TokenTable';
import { PageHeader } from '@/components/ui/page-header';
import { Coins } from 'lucide-react';

export default function TokenPage() {
  return (
    <div className="w-full py-1">
      <div className="space-y-4">
        <PageHeader 
          category="krc20"
          title="Token Explorer"
          icon={<Coins className="w-5 h-5" />}
        />
        <TokenTable />
      </div>
    </div>
  );
}