'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { Search, MapPin, Clock, Plus, Loader2 } from 'lucide-react';
import { Navigation } from '@/components/navigation';
import { Footer } from '@/components/footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase, type Job } from '@/lib/supabase';
import { getSafeSession } from '@/lib/get-safe-session';

const categories = ['All', 'Logistics', 'Intel', 'Support', 'Aviation', 'Other'];

type DisplayJob = Job & {
  user_name?: string;
  user_rating?: number;
  posted?: string;
};

const sampleTimestamp = '2024-01-01T00:00:00Z';

const sampleJobs: DisplayJob[] = [
  {
    id: '1',
    user_id: 'demo',
    title: 'Convoy Security Team Lead',
    description: 'Coordinate two-vehicle escort, brief drivers, and oversee route checks before dusk.',
    category: 'Logistics',
    pay_rate: 260,
    pay_type: 'hourly',
    location: 'FOB Patriot',
    status: 'open',
    created_at: sampleTimestamp,
    updated_at: sampleTimestamp,
    user_name: 'Sgt. Lawson',
    user_rating: 4.8,
    posted: '2 days ago',
  },
  {
    id: '2',
    user_id: 'demo',
    title: 'Intel Synthesis Analyst',
    description: 'Summarize SIGINT + HUMINT into a nightly brief for the ops desk; push a 2-pager before 2300.',
    category: 'Intel',
    pay_rate: 320,
    pay_type: 'hourly',
    location: 'Remote/TOC',
    status: 'open',
    created_at: sampleTimestamp,
    updated_at: sampleTimestamp,
    user_name: 'Lt. Rivera',
    user_rating: 5.0,
    posted: '1 week ago',
  },
  {
    id: '3',
    user_id: 'demo',
    title: 'Air corridor deconfliction',
    description: 'Coordinate flight windows for CASEVAC and resupply; publish NO-FLY grid updates by 1800.',
    category: 'Aviation',
    pay_rate: 280,
    pay_type: 'hourly',
    location: 'Flight Ops',
    status: 'open',
    created_at: sampleTimestamp,
    updated_at: sampleTimestamp,
    user_name: 'CWO Hart',
    user_rating: 4.9,
    posted: '3 days ago',
  },
  {
    id: '4',
    user_id: 'demo',
    title: 'FOB Supply Control',
    description: 'Receive pallets, stage class IV/V, and reconcile hand receipts for platoon leaders.',
    category: 'Support',
    pay_rate: 240,
    pay_type: 'hourly',
    location: 'Supply Yard',
    status: 'open',
    created_at: sampleTimestamp,
    updated_at: sampleTimestamp,
    user_name: 'SSG Parker',
    user_rating: 4.7,
    posted: '5 days ago',
  },
];

const currency = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
});

export default function JobsPage() {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [jobs, setJobs] = useState<DisplayJob[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadJobs = async () => {
      if (!supabase) {
        setJobs(sampleJobs);
        setLoading(false);
        return;
      }

      setLoading(true);

      const { session, error: sessionError } = await getSafeSession({ silent: true });
      if (sessionError) {
        console.error('Failed to load jobs session', sessionError);
      }
      if (!session) {
        setJobs(sampleJobs);
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('jobs')
        .select('id, user_id, title, description, category, pay_rate, pay_type, location, status, created_at, updated_at')
        .eq('status', 'open')
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) {
        console.error('Failed to load jobs', error);
        setJobs(sampleJobs);
      } else {
        setJobs(data as DisplayJob[]);
      }

      setLoading(false);
    };

    loadJobs();
  }, []);

  const filteredJobs = useMemo(() => {
    return jobs.filter((job) => {
      const matchesCategory =
        selectedCategory === 'All' ||
        (job.category || '').toLowerCase() === selectedCategory.toLowerCase();
      const term = searchTerm.toLowerCase();
      const matchesSearch =
        job.title.toLowerCase().includes(term) ||
        (job.description || '').toLowerCase().includes(term);
      return matchesCategory && matchesSearch;
    });
  }, [jobs, searchTerm, selectedCategory]);

  const formatDate = (value?: string | null) =>
    value ? new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '';

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
                <p className="text-xs uppercase tracking-[0.38em] text-[#caa35d] mb-2">Tasking board</p>
                <h1 className="text-4xl font-black leading-tight">Missions and taskings</h1>
                <p className="text-[#e6d9bd]/80">Deploy, guard, or brief—pick up the next assignment fast.</p>
              </div>
              <Button
                className="bg-[#caa35d] text-[#0b0f18] hover:bg-[#a57c2c] font-semibold border border-white/20 shadow-[0_10px_30px_rgba(0,0,0,0.35)]"
                onClick={() => router.push('/jobs/create')}
              >
                <Plus className="w-4 h-4 mr-2" />
                Post a task
              </Button>
            </div>

            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/50 w-5 h-5" />
                <Input
                  type="text"
                  placeholder="Search missions..."
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
              Showing <span className="font-semibold text-[#f1df9c]">{filteredJobs.length}</span> missions
              {loading && <Loader2 className="w-4 h-4 animate-spin text-[#caa35d]" />}
            </p>
          </div>

          <div className="grid gap-6">
            {filteredJobs.map((job, index) => (
              <Link href={`/jobs/detail?id=${job.id}`} key={job.id}>
                <Card
                  className="hover:shadow-[0_18px_50px_rgba(0,0,0,0.45)] transition-all border border-[#caa35d]/35 hover:border-[#caa35d] bg-[#0f1c16]/90 backdrop-blur animate-fade-in-up h-full"
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <CardTitle className="text-xl text-[#f1df9c] mb-2 line-clamp-2">{job.title}</CardTitle>
                        <div className="flex items-center gap-4 text-sm text-[#d9c8a5]/80 mb-3">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-[#f1df9c]">{job.user_name || 'Military Helper user'}</span>
                            {job.user_rating && <span className="text-[#caa35d]">★ {job.user_rating}</span>}
                          </div>
                          <span className="text-white/30">•</span>
                          <span>{job.posted || 'Recently'}</span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <Badge variant="secondary" className="bg-white/10 text-[#f1df9c] border border-white/20">
                            {job.category}
                          </Badge>
                          <Badge variant="secondary" className="bg-[#caa35d]/15 text-[#caa35d] border border-[#caa35d]/40">
                            {job.pay_type === 'hourly' ? 'Hourly' : 'Fixed'}
                          </Badge>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-[#f1df9c]">
                          {currency.format(Number(job.pay_rate))}
                          <span className="text-sm text-[#d9c8a5]/80">/{job.pay_type === 'hourly' ? 'hr' : 'mission'}</span>
                        </p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="flex flex-wrap gap-4 text-sm text-[#d9c8a5]/80 mb-3">
                      <span className="inline-flex items-center gap-1">
                        <MapPin className="w-4 h-4 text-[#caa35d]" />
                        {job.location}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <Clock className="w-4 h-4 text-[#caa35d]" />
                        {formatDate(job.created_at)}
                      </span>
                    </div>
                    <p className="text-[#d9c8a5]">{job.description}</p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
