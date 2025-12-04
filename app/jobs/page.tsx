'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { Search, MapPin, DollarSign, Clock, Plus, Loader2 } from 'lucide-react';
import { Navigation } from '@/components/navigation';
import { Footer } from '@/components/footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase, type Job } from '@/lib/supabase';

const categories = ['All', 'Tutoring', 'Research', 'Campus Tasks', 'Events', 'Tech', 'Other'];

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
    title: 'Math Tutor Needed',
    description: 'Looking for a patient math tutor for Calculus II. 2-3 sessions per week.',
    category: 'Tutoring',
    pay_rate: 25,
    pay_type: 'hourly',
    location: 'Library or Online',
    status: 'open',
    created_at: sampleTimestamp,
    updated_at: sampleTimestamp,
    user_name: 'Sarah Chen',
    user_rating: 4.8,
    posted: '2 days ago',
  },
  {
    id: '2',
    user_id: 'demo',
    title: 'Research Assistant - Psychology Lab',
    description: 'Help with data collection and analysis for cognitive psychology study. 10 hours/week.',
    category: 'Research',
    pay_rate: 18,
    pay_type: 'hourly',
    location: 'Psychology Building',
    status: 'open',
    created_at: sampleTimestamp,
    updated_at: sampleTimestamp,
    user_name: 'Dr. Martinez',
    user_rating: 5.0,
    posted: '1 week ago',
  },
  {
    id: '3',
    user_id: 'demo',
    title: 'Event Setup Help',
    description: 'Need 3 people to help set up tables and chairs for campus event. Quick 2-hour job.',
    category: 'Events',
    pay_rate: 100,
    pay_type: 'fixed',
    location: 'Student Union',
    status: 'open',
    created_at: sampleTimestamp,
    updated_at: sampleTimestamp,
    user_name: 'Campus Events',
    user_rating: 4.6,
    posted: '3 days ago',
  },
  {
    id: '4',
    user_id: 'demo',
    title: 'Web Development Project',
    description: 'Build a simple portfolio website. Experience with React preferred.',
    category: 'Tech',
    pay_rate: 500,
    pay_type: 'fixed',
    location: 'Remote',
    status: 'open',
    created_at: sampleTimestamp,
    updated_at: sampleTimestamp,
    user_name: 'Michael Brown',
    user_rating: 4.9,
    posted: '5 days ago',
  },
];

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

      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) {
        setJobs(sampleJobs);
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('jobs')
        .select('id, user_id, title, description, category, pay_rate, pay_type, location, status, created_at, updated_at, profiles(full_name,email)')
        .order('created_at', { ascending: false })
        .limit(50);

      if (!error && data) {
        const mapped: DisplayJob[] = data.map((job) => {
          const profile = (job as any).profiles;
          return {
            ...job,
            posted: job.created_at,
            user_name: profile?.full_name || profile?.email || 'Campus Helper user',
          };
        });
        setJobs(mapped);
      } else {
        setJobs(sampleJobs);
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
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navigation />

      <main className="flex-1">
        <div className="relative overflow-hidden bg-gradient-to-br from-[#1e3a5f] to-[#2a4a6f] text-white py-12">
          <div className="pointer-events-none absolute inset-0 opacity-80 bg-[radial-gradient(circle_at_15%_25%,rgba(244,208,63,0.28),transparent_35%),radial-gradient(circle_at_85%_15%,rgba(255,255,255,0.18),transparent_35%),radial-gradient(circle_at_50%_90%,rgba(15,31,51,0.55),transparent_40%)] bg-[length:160%_160%] animate-gradient-move" />
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute -left-10 -top-16 h-52 w-52 rounded-full bg-gradient-to-br from-[#d4af37] to-[#f4d03f] blur-3xl opacity-70 animate-float" />
            <div className="absolute right-0 top-6 h-60 w-60 rounded-full bg-gradient-to-br from-white/40 via-transparent to-[#d4af37]/25 blur-3xl opacity-70 animate-float" />
          </div>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-4xl font-bold mb-2">Student Jobs</h1>
                <p className="text-gray-200">Find flexible work that fits your schedule</p>
              </div>
              <Button
                className="bg-[#d4af37] text-[#1e3a5f] hover:bg-[#c19b2e] font-semibold"
                onClick={() => router.push('/jobs/create')}
              >
                <Plus className="w-4 h-4 mr-2" />
                Post a Job
              </Button>
            </div>

            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  type="text"
                  placeholder="Search jobs..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 h-12 bg-white text-gray-900 placeholder:text-gray-500"
                />
              </div>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-full md:w-48 h-12 bg-white text-gray-900 data-[placeholder]:text-gray-500">
                  <SelectValue placeholder="Category" />
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
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-6">
            <p className="text-gray-600 flex items-center gap-3">
              Showing <span className="font-semibold text-[#1e3a5f]">{filteredJobs.length}</span> jobs
              {loading && <Loader2 className="w-4 h-4 animate-spin text-[#1e3a5f]" />}
            </p>
          </div>

          <div className="grid gap-6">
            {filteredJobs.map((job, index) => (
              <Link href={`/jobs/detail?id=${job.id}`} key={job.id}>
                <Card
                  className="hover:shadow-lg transition-shadow border-2 hover:border-[#d4af37] bg-white/90 backdrop-blur animate-fade-in-up h-full"
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-xl text-[#1e3a5f] mb-2 line-clamp-2">{job.title}</CardTitle>
                        <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                          <div className="flex items-center">
                            <span className="font-medium">{job.user_name || 'Campus Helper user'}</span>
                            {job.user_rating && <span className="ml-2 text-[#d4af37]">★ {job.user_rating}</span>}
                          </div>
                          <span className="text-gray-400">•</span>
                          <span>{job.posted ? formatDate(job.posted) : formatDate(job.created_at) || 'Recently posted'}</span>
                        </div>
                      </div>
                      <Badge className="bg-[#d4af37] text-[#1e3a5f] hover:bg-[#c19b2e]">
                        {job.category}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4 overflow-hidden">
                    <p className="text-gray-700 line-clamp-3">{job.description}</p>

                    <div className="flex flex-wrap items-center gap-4 text-sm">
                      <div className="flex items-center text-gray-600">
                        <DollarSign className="w-4 h-4 mr-1 text-[#d4af37]" />
                        <span className="font-semibold text-[#1e3a5f]">
                          ${job.pay_rate}
                        </span>
                        <span className="ml-1">
                          {job.pay_type === 'hourly' ? '/hr' : job.pay_type === 'fixed' ? 'total' : 'negotiable'}
                        </span>
                      </div>

                      <div className="flex items-center text-gray-600">
                        <MapPin className="w-4 h-4 mr-1 text-[#d4af37]" />
                        {job.location}
                      </div>

                      <div className="flex items-center text-gray-600">
                        <Clock className="w-4 h-4 mr-1 text-[#d4af37]" />
                        {(job.status || 'open') === 'open' ? 'Open' : 'Closed'}
                      </div>
                    </div>

                    <div className="mt-4 pt-4 border-t flex items-center justify-between text-sm text-gray-500">
                      <span>Updated {formatDate(job.updated_at || job.created_at) || 'recently'}</span>
                      <span className="text-[#1e3a5f] group-hover:text-[#d4af37]">View Details →</span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>

          {filteredJobs.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">
                {loading ? 'Loading jobs...' : 'No jobs found matching your criteria.'}
              </p>
              <p className="text-gray-400 mt-2">Try adjusting your filters or search terms.</p>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
