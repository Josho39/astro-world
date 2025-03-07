'use client';

import React from 'react';
import ArbAnalyzer from './ArbAnalyzer';
import { PageHeader } from '@/components/ui/page-header';
import { Calculator } from 'lucide-react';

export default function ArbAnalyzerPage() {
  return (
    <div className="w-full py-1">
      <div className="space-y-4">
        <PageHeader 
          category="krc20"
          title="Arbitrage Calculator"
          icon={<Calculator className="w-5 h-5" />}
        />
        <ArbAnalyzer />
      </div>
    </div>
  );
}