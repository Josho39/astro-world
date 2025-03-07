'use client';

import React, { Suspense } from 'react';
import ChartPage from './chartpage';
import { PageHeader } from '@/components/ui/page-header';
import { LineChart } from 'lucide-react';

function ChartPageLoading() {
  return (
    <div className="w-full h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
    </div>
  );
}

export default function TVchartsPage() {
  return (
    <div className="w-full py-1">
      <div className="space-y-4">
        <PageHeader 
          category="krc20"
          title="KRC20 Charts"
          icon={<LineChart className="w-5 h-5" />}
        />
        <Suspense fallback={<ChartPageLoading />}>
          <ChartPage />
        </Suspense>
      </div>
    </div>
  );
}