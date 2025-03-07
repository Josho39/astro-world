'use client';

import React from 'react';
import MintWatcher from './mintwatcher';
import { PageHeader } from '@/components/ui/page-header';
import { Star } from 'lucide-react';

export default function MintWatcherPage() {
  return (
    <div className="w-full py-1">
      <div className="space-y-4">
        <PageHeader 
          category="krc721"
          title="Mint Watcher"
          icon={<Star className="w-5 h-5" />}
        />
        <MintWatcher />
      </div>
    </div>
  );
}