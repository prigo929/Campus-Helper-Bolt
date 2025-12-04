import Link from 'next/link';
import { Briefcase, ShoppingBag, MessageSquare, Star, TrendingUp, Shield } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';
import { supabase, Job, MarketplaceItem, ForumPost } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Navigation } from '@/components/navigation';
import { Footer } from '@/components/footer';
import { HomeFinalCta, HomeHeroActions } from '@/components/home-auth-cta';

type SupabaseHighlights = {
  jobs: Job[];
  items: MarketplaceItem[];
  posts: ForumPost[];
};

const FALLBACK_DATA: SupabaseHighlights = {
  jobs: [
    {
      id: 'demo-1',
      user_id: 'demo',
      title: 'Library Desk Assistant',
      description: 'Evening shift helping students check out books and equipment.',
      category: 'Campus',
      pay_rate: 17,
      pay_type: 'hourly',
      location: 'On campus',
      status: 'open',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: 'demo-2',
      user_id: 'demo',
      title: 'Peer Tutor - Calculus',
      description: 'Work 4–6 hrs/week tutoring Calc I & II students.',
      category: 'Tutoring',
      pay_rate: 22,
      pay_type: 'hourly',
      location: 'Hybrid',
      status: 'open',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  ],
  items: [
    {
      id: 'demo-3',
      user_id: 'demo',
      title: 'MacBook Air M1 8GB/256GB',
      description: 'Lightly used, includes charger.',
      category: 'equipment',
      price: 625,
      condition: 'good',
      images: [],
      status: 'available',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: 'demo-4',
      user_id: 'demo',
      title: 'Organic Chemistry Notes + Flashcards',
      description: 'Full semester set with practice questions.',
      category: 'notes',
      price: 35,
      condition: 'like_new',
      images: [],
      status: 'available',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  ],
  posts: [
    {
      id: 'demo-5',
      user_id: 'demo',
      title: 'Best places to study late?',
      content: 'Looking for quiet spots open after 10pm.',
      category: 'general',
      views: 42,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: 'demo-6',
      user_id: 'demo',
      title: 'Anyone selling a lab coat (size M)?',
      content: 'Need one for CHEM 201 next week.',
      category: 'academic',
      views: 30,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  ],
};

async function loadSupabaseHighlights(): Promise<SupabaseHighlights> {
  const client =
    process.env.SUPABASE_SERVICE_ROLE_KEY && process.env.NEXT_PUBLIC_SUPABASE_URL
      ? createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)
      : supabase;

  if (!client) {
    console.warn('Supabase is not configured; using fallback homepage content.');
    return FALLBACK_DATA;
  }

  try {
    const [jobsRes, itemsRes, postsRes] = await Promise.all([
      client
        .from('jobs')
        .select('id, user_id, title, description, category, pay_rate, pay_type, location, status, created_at, updated_at')
        .eq('status', 'open')
        .order('created_at', { ascending: false })
        .limit(3),
      client
        .from('marketplace_items')
        .select('id, user_id, title, description, category, price, condition, images, status, created_at, updated_at')
        .eq('status', 'available')
        .order('created_at', { ascending: false })
        .limit(3),
      client
        .from('forum_posts')
        .select('id, user_id, title, content, category, views, created_at, updated_at')
        .order('created_at', { ascending: false })
        .limit(3),
    ]);

    const jobs = jobsRes.data ?? [];
    const items = itemsRes.data ?? [];
    const posts = postsRes.data ?? [];

    if (jobsRes.error || itemsRes.error || postsRes.error) {
      console.error('Supabase read error', { jobsError: jobsRes.error, itemsError: itemsRes.error, postsError: postsRes.error });
      return FALLBACK_DATA;
    }

    // If tables are empty, fall back to demo content so the section is not blank.
    return {
      jobs: jobs.length ? jobs : FALLBACK_DATA.jobs,
      items: items.length ? items : FALLBACK_DATA.items,
      posts: posts.length ? posts : FALLBACK_DATA.posts,
    };
  } catch (error) {
    console.error('Supabase read failed', error);
    return FALLBACK_DATA;
  }
}

const currency = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
});

export default async function Home() {
  const { jobs, items, posts } = await loadSupabaseHighlights();

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-gray-50 to-white">
      <Navigation />

      <main className="flex-1">
        <section className="relative overflow-hidden bg-gradient-to-br from-[#1e3a5f] via-[#2a4a6f] to-[#1e3a5f] text-white py-20">
          <div className="pointer-events-none absolute inset-0 opacity-80 bg-[radial-gradient(circle_at_20%_30%,rgba(244,208,63,0.25),transparent_35%),radial-gradient(circle_at_80%_15%,rgba(255,255,255,0.15),transparent_35%),radial-gradient(circle_at_50%_85%,rgba(15,31,51,0.45),transparent_35%)] bg-[length:160%_160%] animate-gradient-move" />
          <div className="pointer-events-none absolute inset-0 mix-blend-screen opacity-35 bg-[linear-gradient(120deg,rgba(255,255,255,0.12)_1px,transparent_1px),linear-gradient(-120deg,rgba(212,175,55,0.12)_1px,transparent_1px)] bg-[length:26px_26px] animate-gradient-move" />
          <div className="pointer-events-none absolute inset-y-0 left-1/4 w-1/2 bg-gradient-to-r from-white/10 via-white/35 to-transparent blur-3xl opacity-70 animate-float" />
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute -left-10 -top-16 h-64 w-64 rounded-full bg-gradient-to-br from-[#d4af37] to-[#f4d03f] blur-3xl opacity-70 animate-float" />
            <div className="absolute right-0 top-10 h-72 w-72 rounded-full bg-gradient-to-br from-white/40 via-transparent to-[#d4af37]/20 blur-3xl opacity-70 animate-float" />
            <div className="absolute -bottom-12 left-1/2 h-64 w-64 rounded-full bg-gradient-to-br from-[#0f1f33] via-transparent to-transparent blur-3xl opacity-60 animate-float" />
          </div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="text-center max-w-3xl mx-auto">
              <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight animate-fade-in-up">
                Your Campus,
                <span className="text-[#d4af37]"> Connected</span>
              </h1>
              <p className="text-xl text-gray-200 mb-8 animate-fade-in-up" style={{ animationDelay: '0.08s' }}>
                Find jobs, buy and sell materials, and connect with your university community all in one place.
              </p>
              <div className="animate-fade-in-up" style={{ animationDelay: '0.16s' }}>
                <HomeHeroActions />
              </div>
            </div>
          </div>
        </section>

        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-10">
              <div>
                <h2 className="text-3xl md:text-4xl font-bold text-[#1e3a5f]">Live Campus Feed</h2>
                <p className="text-lg text-gray-600">
                  Feel free to explore!
                </p>
              </div>
              <div className="flex flex-wrap justify-center md:justify-end gap-3 w-full md:w-auto">
                <Link href="/jobs">
                  <Button variant="outline" className="border-[#1e3a5f] text-[#1e3a5f] hover:bg-[#1e3a5f] hover:text-white">
                    View all jobs
                  </Button>
                </Link>
                <Link href="/marketplace">
                  <Button className="bg-[#d4af37] text-[#1e3a5f] hover:bg-[#c19b2e]">Open marketplace</Button>
                </Link>
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              <Link href="/jobs" className="block h-full">
                <Card className="group relative overflow-hidden border-2 border-gray-100 hover:border-[#d4af37] transition-all duration-300 shadow-sm hover:shadow-2xl bg-white/90 backdrop-blur transform hover:-translate-y-1">
                  <span className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-br from-[#d4af37]/10 via-white/40 to-[#1e3a5f]/10" />
                  <CardContent className="relative p-6 space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xl font-bold text-[#1e3a5f]">Latest Jobs</h3>
                      <Briefcase className="w-5 h-5 text-[#d4af37]" />
                    </div>
                    <div className="space-y-4">
                      {jobs.map((job) => (
                        <div key={job.id} className="border border-gray-100 rounded-lg p-3 bg-gray-50/70">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <p className="font-semibold text-[#1e3a5f]">{job.title}</p>
                              <p className="text-sm text-gray-600">{job.location}</p>
                            </div>
                            <span className="text-sm font-semibold text-[#d4af37]">
                              {currency.format(Number(job.pay_rate))}/{job.pay_type === 'hourly' ? 'hr' : 'job'}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 mt-2 max-h-12 overflow-hidden text-ellipsis">{job.description}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </Link>

              <Link href="/marketplace" className="block h-full">
                <Card className="group relative overflow-hidden border-2 border-gray-100 hover:border-[#d4af37] transition-all duration-300 shadow-sm hover:shadow-2xl bg-white/90 backdrop-blur transform hover:-translate-y-1">
                  <span className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-br from-[#d4af37]/10 via-white/40 to-[#1e3a5f]/10" />
                  <CardContent className="relative p-6 space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xl font-bold text-[#1e3a5f]">Marketplace</h3>
                      <ShoppingBag className="w-5 h-5 text-[#d4af37]" />
                    </div>
                    <div className="space-y-4">
                      {items.map((item) => (
                        <div key={item.id} className="border border-gray-100 rounded-lg p-3 bg-gray-50/70">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <p className="font-semibold text-[#1e3a5f]">{item.title}</p>
                              <p className="text-sm text-gray-600 capitalize">{item.condition.replace('_', ' ')}</p>
                            </div>
                            <span className="text-sm font-semibold text-[#d4af37]">{currency.format(Number(item.price))}</span>
                          </div>
                          <p className="text-sm text-gray-600 mt-2 max-h-12 overflow-hidden text-ellipsis">{item.description}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </Link>

              <Link href="/forum" className="block h-full">
                <Card className="group relative overflow-hidden border-2 border-gray-100 hover:border-[#d4af37] transition-all duration-300 shadow-sm hover:shadow-2xl bg-white/90 backdrop-blur transform hover:-translate-y-1">
                  <span className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-br from-[#d4af37]/10 via-white/40 to-[#1e3a5f]/10" />
                  <CardContent className="relative p-6 space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xl font-bold text-[#1e3a5f]">Forum</h3>
                      <MessageSquare className="w-5 h-5 text-[#d4af37]" />
                    </div>
                    <div className="space-y-4">
                      {posts.map((post) => (
                        <div
                          key={post.id}
                          className="border border-gray-100 rounded-lg p-3 bg-gray-50/70 max-h-32 overflow-hidden"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <p className="font-semibold text-[#1e3a5f]">{post.title}</p>
                            <span className="text-xs font-semibold text-[#d4af37] uppercase">{post.category}</span>
                          </div>
                          <p className="text-sm text-gray-600 mt-2 line-clamp-2">{post.content}</p>
                          <p className="text-xs text-gray-500 mt-2">{post.views ?? 0} views</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </div>
          </div>
        </section>

        <section className="py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-[#1e3a5f] mb-4">
                Everything You Need
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Campus Helper brings together jobs, marketplace, and community in one trusted platform.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              <Card className="group relative overflow-hidden border-2 hover:border-[#d4af37] transition-all duration-300 hover:shadow-2xl bg-white/90 backdrop-blur transform hover:-translate-y-1">
                <span className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-br from-[#d4af37]/10 via-white/40 to-[#1e3a5f]/10" />
                <CardContent className="relative p-6">
                  <div className="w-12 h-12 bg-[#d4af37] rounded-lg flex items-center justify-center mb-4">
                    <Briefcase className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-[#1e3a5f] mb-3">Student Jobs</h3>
                  <p className="text-gray-600 mb-4">
                    Find flexible part-time work that fits your schedule. From tutoring to campus tasks, discover opportunities made for students.
                  </p>
                  <Link href="/jobs" className="text-[#d4af37] font-semibold hover:underline">
                    Browse Jobs →
                  </Link>
                </CardContent>
              </Card>

              <Card className="group relative overflow-hidden border-2 hover:border-[#d4af37] transition-all duration-300 hover:shadow-2xl bg-white/90 backdrop-blur transform hover:-translate-y-1">
                <span className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-br from-[#d4af37]/10 via-white/40 to-[#1e3a5f]/10" />
                <CardContent className="relative p-6">
                  <div className="w-12 h-12 bg-[#d4af37] rounded-lg flex items-center justify-center mb-4">
                    <ShoppingBag className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-[#1e3a5f] mb-3">Marketplace</h3>
                  <p className="text-gray-600 mb-4">
                    Buy and sell textbooks, notes, past exams, and equipment. Save money and help fellow students.
                  </p>
                  <Link href="/marketplace" className="text-[#d4af37] font-semibold hover:underline">
                    Shop Now →
                  </Link>
                </CardContent>
              </Card>

              <Card className="group relative overflow-hidden border-2 hover:border-[#d4af37] transition-all duration-300 hover:shadow-2xl bg-white/90 backdrop-blur transform hover:-translate-y-1">
                <span className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-br from-[#d4af37]/10 via-white/40 to-[#1e3a5f]/10" />
                <CardContent className="relative p-6">
                  <div className="w-12 h-12 bg-[#d4af37] rounded-lg flex items-center justify-center mb-4">
                    <MessageSquare className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-[#1e3a5f] mb-3">Community Forum</h3>
                  <p className="text-gray-600 mb-4">
                    Share updates, ask questions, and stay connected with what&apos;s happening on campus.
                  </p>
                  <Link href="/forum" className="text-[#d4af37] font-semibold hover:underline">
                    Join Discussion →
                  </Link>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        <section className="bg-gray-50 py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-[#1e3a5f] mb-4">
                Why Students Trust Us
              </h2>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-[#1e3a5f] rounded-full flex items-center justify-center mx-auto mb-4 animate-float">
                  <Shield className="w-8 h-8 text-[#d4af37]" />
                </div>
                <h3 className="text-xl font-bold text-[#1e3a5f] mb-2">Verified Users</h3>
                <p className="text-gray-600">
                  University email verification ensures you&apos;re connecting with real students.
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-[#1e3a5f] rounded-full flex items-center justify-center mx-auto mb-4 animate-float" style={{ animationDelay: '0.1s' }}>
                  <Star className="w-8 h-8 text-[#d4af37]" />
                </div>
                <h3 className="text-xl font-bold text-[#1e3a5f] mb-2">Rating System</h3>
                <p className="text-gray-600">
                  Build your reputation and trust through ratings and reviews.
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-[#1e3a5f] rounded-full flex items-center justify-center mx-auto mb-4 animate-float" style={{ animationDelay: '0.2s' }}>
                  <TrendingUp className="w-8 h-8 text-[#d4af37]" />
                </div>
                <h3 className="text-xl font-bold text-[#1e3a5f] mb-2">Growing Community</h3>
                <p className="text-gray-600">
                  Join thousands of students already using Campus Helper.
                </p>
              </div>
            </div>
          </div>
        </section>

      </main>

      <Footer />
    </div>
  );
}
