'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { navItems } from '@/components/navigation/NavBar';
import Link from 'next/link';

export default function Home() {
  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-4xl font-bold text-white">Welcome to Astro World</h1>
        <p className="text-gray-300">Advanced tools for the Kaspa ecosystem</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {navItems.map((item) => (
          <Link key={item.name} href={item.href} className="block group">
            <Card className="bg-white/5 backdrop-blur-sm border-0 transition-all duration-300 
              hover:bg-white/10 hover:transform hover:scale-105 hover:shadow-2xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-white">
                  <div className="p-2 rounded-lg bg-gray-800 group-hover:bg-gray-700 transition-colors">
                    {item.icon}
                  </div>
                  {item.name}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-400">
                  Access {item.name.toLowerCase()} features and analytics
                </p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}