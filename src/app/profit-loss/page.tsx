import React from 'react';
import { PageHeader } from '@/components/ui/page-header';
import { Banknote } from 'lucide-react';

export default function ProfitLossPage() {
  return (
    <div className="w-full py-1">
      <div className="space-y-4">
        <PageHeader 
          category="utility"
          title="Profit/Loss Calculator"
          icon={<Banknote className="w-5 h-5" />}
        />
        <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-r from-blue-500 to-purple-600 p-4 rounded-lg">
          <div className="text-center space-y-4">
            <h1 className="text-4xl md:text-6xl font-bold text-white">
              PnL Coming Soon
            </h1>
            <p className="text-lg md:text-xl text-white/80">
              We're working hard to bring you amazing data visualizations!
            </p>
            <div className="animate-bounce mt-8">
              <div className="w-16 h-16 border-4 border-white/30 border-t-white rounded-full animate-spin" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}