'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ADDRESS_PREFIX } from './explorer_constants';

export default function Explorer() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSearch = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const query = searchQuery.trim();
    
    if (!query) return;
    
    setIsLoading(true);

    try {
      if (query.length === 64) {
        router.push(`/explorer/txs/${query}`);
      } else if (query.startsWith(ADDRESS_PREFIX)) {
        router.push(`/explorer/addresses/${query}`);
      }
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setIsLoading(false);
      setSearchQuery('');
    }
  };

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-4xl font-bold">Explorer</h1>
        <p className="text-muted-foreground">
          Search for Kaspa addresses and transactions
        </p>
      </div>

      <Card className="border-0 bg-white/5 backdrop-blur-sm">
        <CardContent className="pt-6">
          <form onSubmit={handleSearch} className="max-w-3xl mx-auto">
            <div className="relative flex gap-2">
              <Input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={`Search for ${ADDRESS_PREFIX}address or tx`}
                className="bg-background"
                disabled={isLoading}
              />
              <Button 
                type="submit"
                disabled={isLoading}
                variant="secondary"
              >
                <Search className="w-4 h-4 mr-2" />
                Search
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}