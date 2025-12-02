'use client';

import { FormEvent, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ShoppingBag, Tag, Loader2, AlertCircle } from 'lucide-react';
import { Navigation } from '@/components/navigation';
import { Footer } from '@/components/footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/lib/supabase';
import { ensureProfileExists } from '@/lib/profile';
import type { Session } from '@supabase/supabase-js';

const categories = [
  { label: 'Books', value: 'books' },
  { label: 'Notes', value: 'notes' },
  { label: 'Exams', value: 'exams' },
  { label: 'Equipment', value: 'equipment' },
  { label: 'Other', value: 'other' },
];

const conditions = [
  { label: 'New', value: 'new' },
  { label: 'Like new', value: 'like_new' },
  { label: 'Good', value: 'good' },
  { label: 'Fair', value: 'fair' },
];

export default function CreateMarketplaceItemPage() {
  const router = useRouter();
  const [session, setSession] = useState<Session | null>(null);
  const [checkingSession, setCheckingSession] = useState(true);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState(categories[0].value);
  const [price, setPrice] = useState('');
  const [condition, setCondition] = useState(conditions[1].value);

  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!supabase) {
      setError('Supabase is not configured. Add NEXT_PUBLIC_SUPABASE_* env vars.');
      setCheckingSession(false);
      return;
    }

    supabase.auth
      .getSession()
      .then(async ({ data, error: sessionError }) => {
        if (sessionError) {
          setError(sessionError.message);
          return;
        }
        if (!data.session?.user) {
          setError('Please sign in to list an item.');
          router.push('/sign-in');
          return;
        }
        setSession(data.session);
        try {
          await ensureProfileExists(supabase, data.session);
        } catch (profileError) {
          console.error('Profile auto-create failed', profileError);
        }
      })
      .finally(() => setCheckingSession(false));
  }, [router]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setMessage('');

    if (!supabase) {
      setError('Supabase is not configured. Add NEXT_PUBLIC_SUPABASE_* env vars.');
      return;
    }

    if (!session?.user) {
      setError('Please sign in to list an item.');
      return;
    }

    if (!title.trim() || !description.trim() || !price.trim()) {
      setError('Please complete all required fields.');
      return;
    }

    const parsedPrice = Number(price);
    if (Number.isNaN(parsedPrice) || parsedPrice <= 0) {
      setError('Enter a valid price greater than 0.');
      return;
    }

    setIsSubmitting(true);

    const { error: insertError } = await supabase.from('marketplace_items').insert({
      user_id: session.user.id,
      title: title.trim(),
      description: description.trim(),
      category,
      price: parsedPrice,
      condition,
      status: 'available',
    });

    if (insertError) {
      setError(insertError.message);
    } else {
      setMessage('Item listed! Redirecting...');
      router.push('/marketplace');
    }

    setIsSubmitting(false);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navigation />

      <main className="flex-1">
        <div className="relative overflow-hidden bg-gradient-to-br from-[#1e3a5f] via-[#243f66] to-[#1e3a5f] text-white py-12">
          <div className="pointer-events-none absolute inset-0 opacity-80 bg-[radial-gradient(circle_at_15%_25%,rgba(244,208,63,0.28),transparent_35%),radial-gradient(circle_at_85%_15%,rgba(255,255,255,0.18),transparent_35%),radial-gradient(circle_at_50%_90%,rgba(15,31,51,0.55),transparent_40%)] bg-[length:160%_160%] animate-gradient-move" />
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute -left-10 -top-16 h-52 w-52 rounded-full bg-gradient-to-br from-[#d4af37] to-[#f4d03f] blur-3xl opacity-70 animate-float" />
            <div className="absolute right-0 top-6 h-60 w-60 rounded-full bg-gradient-to-br from-white/40 via-transparent to-[#d4af37]/25 blur-3xl opacity-70 animate-float" />
          </div>
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-lg bg-white/15 backdrop-blur flex items-center justify-center">
                <ShoppingBag className="w-6 h-6 text-[#f4d03f]" />
              </div>
              <div>
                <p className="uppercase text-sm tracking-widest text-[#f4d03f] font-semibold">Create</p>
                <h1 className="text-3xl font-bold">List an Item</h1>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Card className="border-2">
            <CardHeader>
              <CardTitle className="text-xl text-[#1e3a5f]">Item details</CardTitle>
              <CardDescription>Describe what you are selling so classmates can buy quickly.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {checkingSession && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Checking your session...
                </div>
              )}
              {error && (
                <div className="rounded-md bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-700 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}
              {message && (
                <div className="rounded-md bg-green-50 border border-green-200 px-3 py-2 text-sm text-green-800">
                  {message}
                </div>
              )}

              <form className="space-y-4" onSubmit={handleSubmit}>
                <div className="space-y-2">
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    placeholder="MacBook Air M1"
                    value={title}
                    onChange={(event) => setTitle(event.target.value)}
                    disabled={isSubmitting}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Describe the item, condition, and what's included."
                    value={description}
                    onChange={(event) => setDescription(event.target.value)}
                    rows={5}
                    disabled={isSubmitting}
                    required
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="category">Category</Label>
                    <Select value={category} onValueChange={(value) => setCategory(value)}>
                      <SelectTrigger id="category">
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((cat) => (
                          <SelectItem key={cat.value} value={cat.value}>
                            {cat.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="condition">Condition</Label>
                    <Select value={condition} onValueChange={(value) => setCondition(value)}>
                      <SelectTrigger id="condition">
                        <SelectValue placeholder="Condition" />
                      </SelectTrigger>
                      <SelectContent>
                        {conditions.map((cond) => (
                          <SelectItem key={cond.value} value={cond.value}>
                            {cond.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="price">Price</Label>
                  <div className="relative">
                    <Tag className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      id="price"
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="50"
                      className="pl-8"
                      value={price}
                      onChange={(event) => setPrice(event.target.value)}
                      disabled={isSubmitting}
                      required
                    />
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Button type="submit" disabled={isSubmitting || checkingSession} className="bg-[#1e3a5f] text-white hover:bg-[#2a4a6f]">
                    {isSubmitting ? 'Listing...' : 'List item'}
                  </Button>
                  <Button type="button" variant="outline" onClick={() => router.push('/marketplace')}>
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
}
