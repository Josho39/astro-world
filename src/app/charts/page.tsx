'use client';

import React, { Suspense } from 'react';
import ChartPage from './chartpage';

function ChartPageLoading() {
  return (
    <div className="w-full h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
    </div>
  );
}

export default function TVchartsPage() {
  return (
    <div className="w-full">
      <Suspense fallback={<ChartPageLoading />}>
        <ChartPage />
      </Suspense>
    </div>
  );
}