'use client';

import React from 'react';
import KRC721Explorer from './krc721';
import { PageHeader } from '@/components/ui/page-header';
import { Palette } from 'lucide-react';

export default function KRC721Page() {
  return (
    <div className="w-full py-1">
      <div className="space-y-4">
        <PageHeader 
          category="krc721"
          title="NFT Explorer"
          icon={<Palette className="w-5 h-5" />}
        />
        <KRC721Explorer />
      </div>
    </div>
  );
}