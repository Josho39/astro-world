'use client';

import React from 'react';
import AirdropTool from './AirdropTool';
import { PageHeader } from '@/components/ui/page-header';
import { Box } from 'lucide-react';

export default function AirdropToolPage() {
  return (
    <div className="w-full py-1">
      <div className="space-y-4">
        <PageHeader 
          category="utility"
          title="Airdrop Tool"
          icon={<Box className="w-5 h-5" />}
        />
        <AirdropTool />
      </div>
    </div>
  );
}