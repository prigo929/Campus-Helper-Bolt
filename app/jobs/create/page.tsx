'use client';

import { FormEvent, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Briefcase, MapPin, DollarSign, Clock, Loader2, AlertCircle } from 'lucide-react';
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

const categories = ['Tutoring', 'Research', 'Campus Tasks', 'Events', 'Tech', 'Other'];
const payTypes = ['hourly', 'fixed', 'negotiable'] as const;

export default function CreateJobPage() {
  const router = useRouter();
  const [session, setSession] = useState<Session | null>(null);
  const supabaseConfigured = Boolean(supabase);
  const [checkingSession, setCheckingSession] = useState(() => supabaseConfigured);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState(categories[0]);
  const [payRate, setPayRate] = useState('');
  const [payType, setPayType] = useState<(typeof payTypes)[number]>('hourly');
  const [location, setLocation] = useState('');

  const [error, setError] = useState(() =>
    supabaseConfigured ? '' : 'Supabase is not configured. Add NEXT_PUBLIC_SUPABASE_* env vars.'
  );
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!supabase) return;
    let active = true;

    supabase.auth.getSession().then(async ({ data, error: sessionError }) => {
      if (!active) return;
      if (sessionError) {
        setError(sessionError.message);
        setCheckingSession(false);
        return;
      }
      if (!data.session?.user) {
        setError('Please sign in to post a job.');
        router.push('/sign-in');
        setCheckingSession(false);
        return;
      }
      setSession(data.session);
      try {
        await ensureProfileExists(supabase, data.session);
      } catch (profileError) {
        console.error('Profile auto-create failed', profileError);
      }
      setCheckingSession(false);
    });

    return () => {
      active = false;
    };
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
      setError('Please sign in to post a job.');
      return;
    }

    if (!title.trim() || !description.trim() || !location.trim() || !payRate.trim()) {
      setError('Please complete all required fields.');
      return;
    }

    const parsedPayRate = Number(payRate);
    if (Number.isNaN(parsedPayRate) || parsedPayRate <= 0) {
      setError('Enter a valid pay rate greater than 0.');
      return;
    }

    setIsSubmitting(true);

    const { error: insertError } = await supabase.from('jobs').insert({
      user_id: session.user.id,
      title: title.trim(),
      description: description.trim(),
      category,
      pay_rate: parsedPayRate,
      pay_type: payType,
      location: location.trim(),
      status: 'open',
    });

    if (insertError) {
      setError(insertError.message);
    } else {
      setMessage('Job posted! Redirecting...');
      router.push('/jobs');
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
                <Briefcase className="w-6 h-6 text-[#f4d03f]" />
              </div>
              <div>
                <p className="uppercase text-sm tracking-widest text-[#f4d03f] font-semibold">Create</p>
                <h1 className="text-3xl font-bold">Post a Job</h1>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Card className="border-2">
            <CardHeader>
              <CardTitle className="text-xl text-[#1e3a5f]">Job details</CardTitle>
              <CardDescription>Share what you need help with so students can apply.</CardDescription>
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
                    placeholder="Math Tutor for Calculus II"
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
                    placeholder="Describe the work, expectations, and timing."
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
                          <SelectItem key={cat} value={cat}>
                            {cat}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="location">Location</Label>
                    <Input
                      id="location"
                      placeholder="Library or Online"
                      value={location}
                      onChange={(event) => setLocation(event.target.value)}
                      disabled={isSubmitting}
                      required
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="pay-rate">Pay rate</Label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <Input
                        id="pay-rate"
                        type="number"
                        min="0"
                        step="0.01"
                        placeholder="20"
                        className="pl-8"
                        value={payRate}
                        onChange={(event) => setPayRate(event.target.value)}
                        disabled={isSubmitting}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="pay-type">Pay type</Label>
                    <Select value={payType} onValueChange={(value) => setPayType(value as (typeof payTypes)[number])}>
                      <SelectTrigger id="pay-type">
                        <SelectValue placeholder="Pay type" />
                      </SelectTrigger>
                      <SelectContent>
                        {payTypes.map((type) => (
                          <SelectItem key={type} value={type}>
                            {type}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="status">Status</Label>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Clock className="w-4 h-4 text-[#d4af37]" />
                      Open
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Button type="submit" disabled={isSubmitting || checkingSession} className="bg-[#1e3a5f] text-white hover:bg-[#2a4a6f]">
                    {isSubmitting ? 'Posting...' : 'Post job'}
                  </Button>
                  <Button type="button" variant="outline" onClick={() => router.push('/jobs')}>
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
