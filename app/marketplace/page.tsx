'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { Search, Plus, BookOpen, FileText, Microscope, Laptop, Loader2 } from 'lucide-react';
import { Navigation } from '@/components/navigation';
import { Footer } from '@/components/footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase, type MarketplaceItem } from '@/lib/supabase';
import { getSafeSession } from '@/lib/get-safe-session';

const categories = ['All', 'Equipment', 'Gear', 'Signal', 'Medical', 'Other'];

type DisplayItem = MarketplaceItem & {
  seller?: string;
  seller_rating?: number;
  posted?: string;
  category_label?: string;
};

const sampleTimestamp = '2024-01-01T00:00:00Z';

const sampleItems: DisplayItem[] = [
  {
    id: '1',
    user_id: 'demo',
    title: 'AN/PRC-152 Field Radio Kit',
    description: 'Includes spare battery, whip antenna, and throat mic. Tested and zeroed.',
    category: 'equipment',
    price: 1875,
    condition: 'like_new',
    status: 'available',
    created_at: sampleTimestamp,
    updated_at: sampleTimestamp,
    seller: 'Cpl. Vega',
    seller_rating: 4.9,
    posted: '1 day ago',
  },
  {
    id: '2',
    user_id: 'demo',
    title: 'Desert camo netting (12x12)',
    description: 'Dust-treated netting for quick hide sites or vehicle shade.',
    category: 'gear',
    price: 240,
    condition: 'good',
    status: 'available',
    created_at: sampleTimestamp,
    updated_at: sampleTimestamp,
    seller: 'Sgt. Miller',
    seller_rating: 4.7,
    posted: '3 days ago',
  },
  {
    id: '3',
    user_id: 'demo',
    title: 'IFAK restock bundle',
    description: 'Tourniquets, gauze, chest seals, and compression bandages. Sealed and dated.',
    category: 'medical',
    price: 160,
    condition: 'new',
    status: 'available',
    created_at: sampleTimestamp,
    updated_at: sampleTimestamp,
    seller: 'Spec. Wright',
    seller_rating: 5.0,
    posted: '1 week ago',
  },
  {
    id: '4',
    user_id: 'demo',
    title: 'Signal flare pack (IR + vis)',
    description: 'Mixed IR/visible flares, sealed. Keep your LZ marked under NODs.',
    category: 'signal',
    price: 95,
    condition: 'like_new',
    status: 'available',
    created_at: sampleTimestamp,
    updated_at: sampleTimestamp,
    seller: 'CW3 Carter',
    seller_rating: 4.8,
    posted: '2 days ago',
  },
  {
    id: '5',
    user_id: 'demo',
    title: 'Kevlar plates (size M) – matched pair',
    description: 'Level III+, minimal wear, inspected after last rotation.',
    category: 'gear',
    price: 820,
    condition: 'good',
    status: 'available',
    created_at: sampleTimestamp,
    updated_at: sampleTimestamp,
    seller: 'Staff Sgt. Rhodes',
    seller_rating: 4.6,
    posted: '4 days ago',
  },
  {
    id: '6',
    user_id: 'demo',
    title: 'Night vision battery bank',
    description: 'Ruggedized pack for NODs and radios; includes field cables.',
    category: 'equipment',
    price: 260,
    condition: 'good',
    status: 'available',
    created_at: sampleTimestamp,
    updated_at: sampleTimestamp,
    seller: 'WO2 Han',
    seller_rating: 4.9,
    posted: '5 days ago',
  },
];

const categoryIcons = {
  Equipment: Laptop,
  Gear: Microscope,
  Signal: FileText,
  Medical: BookOpen,
  Other: Microscope,
};

const currency = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
});

export default function MarketplacePage() {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [items, setItems] = useState<DisplayItem[]>([]);
  const [loading, setLoading] = useState(true);

  const capitalizeCategory = (value?: string | null) => {
    if (!value) return '';
    return value.charAt(0).toUpperCase() + value.slice(1);
  };

  useEffect(() => {
    const loadItems = async () => {
      if (!supabase) {
        setItems(sampleItems);
        setLoading(false);
        return;
      }

      setLoading(true);

      const { session, error: sessionError } = await getSafeSession({ silent: true });
      if (sessionError) {
        console.error('Failed to load marketplace session', sessionError);
      }
      if (!session) {
        setItems(sampleItems);
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('marketplace_items')
        .select('id, user_id, title, description, category, price, condition, images, status, created_at, updated_at')
        .eq('status', 'available')
        .order('created_at', { ascending: false })
        .limit(24);

      if (error) {
        console.error('Failed to load marketplace items', error);
        setItems(sampleItems);
      } else {
        setItems(data as DisplayItem[]);
      }

      setLoading(false);
    };

    loadItems();
  }, []);

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const matchesCategory =
        selectedCategory === 'All' ||
        (item.category || '').toLowerCase() === selectedCategory.toLowerCase();
      const term = searchTerm.toLowerCase();
      const matchesSearch =
        item.title.toLowerCase().includes(term) ||
        (item.description || '').toLowerCase().includes(term);
      return matchesCategory && matchesSearch;
    });
  }, [items, searchTerm, selectedCategory]);

  return (
    <div className="min-h-screen flex flex-col bg-[#0b0f18] text-[#e6d9bd]">
      <Navigation />

      <main className="flex-1">
        <section className="relative overflow-hidden text-[#f1df9c] py-12">
          <div className="absolute inset-0">
            <div className="absolute inset-0 bg-gradient-to-b from-[#0f1c16] via-[#0f1c16] to-[#0b0f18]" />
            <div className="absolute inset-0 opacity-35 mix-blend-overlay bg-[radial-gradient(circle_at_18%_22%,rgba(211,180,92,0.2),transparent_32%),radial-gradient(circle_at_80%_12%,rgba(33,71,111,0.2),transparent_30%),radial-gradient(circle_at_54%_88%,rgba(183,50,57,0.16),transparent_42%)]" />
            <div className="absolute inset-0 opacity-25 bg-[linear-gradient(120deg,rgba(255,255,255,0.06)_1px,transparent_1px),linear-gradient(-120deg,rgba(202,163,93,0.07)_1px,transparent_1px)] bg-[length:26px_26px]" />
          </div>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.38em] text-[#caa35d] mb-2">Supply exchange</p>
                <h1 className="text-4xl font-black leading-tight">Swap gear and kit</h1>
                <p className="text-[#e6d9bd]/80">Trade radios, armor, med gear, and signal kits with trusted peers.</p>
              </div>
              <Button
                className="bg-[#caa35d] text-[#0b0f18] hover:bg-[#a57c2c] font-semibold border border-white/20 shadow-[0_10px_30px_rgba(0,0,0,0.35)]"
                onClick={() => router.push('/marketplace/create')}
              >
                <Plus className="w-4 h-4 mr-2" />
                List gear
              </Button>
            </div>

            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/50 w-5 h-5" />
                <Input
                  type="text"
                  placeholder="Search supply..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 h-12 bg-white/10 text-white placeholder:text-white/60 border-white/15"
                />
              </div>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-full md:w-48 h-12 bg-white/10 text-white border-white/20 data-[placeholder]:text-white/60">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent className="bg-[#0f1c16] text-[#f1df9c] border border-white/15">
                  {categories.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </section>

        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="mb-6">
            <p className="text-[#d9c8a5]/80 flex items-center gap-3">
              Showing <span className="font-semibold text-[#f1df9c]">{filteredItems.length}</span> listings
              {loading && <Loader2 className="w-4 h-4 animate-spin text-[#caa35d]" />}
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredItems.map((item, index) => {
              const CategoryIcon = categoryIcons[capitalizeCategory(item.category) as keyof typeof categoryIcons] || BookOpen;

              return (
                <Card
                  key={item.id}
                  className="hover:shadow-[0_18px_50px_rgba(0,0,0,0.45)] transition-all border border-[#caa35d]/35 hover:border-[#caa35d] bg-[#0f1c16]/90 backdrop-blur animate-fade-in-up h-full"
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                    <div className="space-y-1">
                      <CardTitle className="text-xl text-[#f1df9c] line-clamp-2">{item.title}</CardTitle>
                      <div className="flex items-center gap-2 text-sm text-[#d9c8a5]/80">
                        <CategoryIcon className="w-4 h-4 text-[#caa35d]" />
                        <span className="capitalize">{item.category}</span>
                        <span className="text-white/30">•</span>
                        <span className="capitalize">{item.condition.replace('_', ' ')}</span>
                      </div>
                    </div>
                    <Badge variant="secondary" className="bg-[#caa35d]/15 text-[#caa35d] border border-[#caa35d]/40">
                      {item.status}
                    </Badge>
                  </CardHeader>
                  <CardContent className="flex flex-col gap-3">
                    <p className="text-[#d9c8a5] line-clamp-3">{item.description}</p>
                    <div className="flex items-center justify-between text-sm text-[#d9c8a5]/80">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-[#f1df9c]">{item.seller || 'Supply'}</span>
                        {item.seller_rating && <span className="text-[#caa35d]">★ {item.seller_rating}</span>}
                      </div>
                      <span className="font-bold text-lg text-[#f1df9c]">{currency.format(Number(item.price))}</span>
                    </div>
                  </CardContent>
                  <CardFooter className="flex items-center justify-between text-sm text-[#d9c8a5]/80">
                    <span>{item.posted || 'Recently'}</span>
                    <Link href={`/marketplace?id=${item.id}`} className="text-[#caa35d] font-semibold hover:text-white hover:underline">
                      View item
                    </Link>
                  </CardFooter>
                </Card>
              );
            })}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
