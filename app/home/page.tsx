import Image from 'next/image';
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

const HERO_IMAGES = [
  { src: '/oil-desert-storm-tanks.jpg', alt: 'Column of tanks rolling through oil fires during Desert Storm', badge: 'Armor push', position: 'center center' },
  { src: '/desert-ops-tank.jpg', alt: 'Desert operation tank profile with crew ready', badge: 'OPS ready', position: 'center 45%' },
  { src: '/desert-storm-space.jpg', alt: 'Satellite view of Desert Storm theater at night', badge: 'Overwatch', position: 'center center' },
  { src: '/desert-storm-collage-1.svg', alt: 'Operation Desert Storm propaganda collage poster', badge: 'Desert Storm', position: 'center center' },
  { src: '/desert-storm-collage-2.svg', alt: 'Hold the line Desert Storm morale art', badge: 'Hold the line', position: 'center center' },
  { src: '/usa-flag.svg', alt: 'USA flag patch', badge: 'USA', position: 'center center' },
];

const FALLBACK_DATA: SupabaseHighlights = {
  jobs: [
    {
      id: 'demo-1',
      user_id: 'demo',
      title: 'Convoy Security Team Lead',
      description: 'Coordinate two-vehicle escort, brief drivers, and oversee route checks before dusk.',
      category: 'Logistics',
      pay_rate: 260,
      pay_type: 'hourly',
      location: 'FOB Patriot',
      status: 'open',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: 'demo-2',
      user_id: 'demo',
      title: 'Intel Synthesis Analyst',
      description: 'Summarize SIGINT + HUMINT into a nightly brief for the ops desk; push a 2-pager before 2300.',
      category: 'Intel',
      pay_rate: 320,
      pay_type: 'hourly',
      location: 'Remote/TOC',
      status: 'open',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  ],
  items: [
    {
      id: 'demo-3',
      user_id: 'demo',
      title: 'AN/PRC-152 Field Radio Kit',
      description: 'Includes spare battery, whip antenna, and throat mic. Tested and zeroed.',
      category: 'equipment',
      price: 1875,
      condition: 'like_new',
      images: [],
      status: 'available',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: 'demo-4',
      user_id: 'demo',
      title: 'Desert camo netting (12x12)',
      description: 'Dust-treated netting for quick hide sites or vehicle shade.',
      category: 'equipment',
      price: 240,
      condition: 'good',
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
      title: 'Best dust-off LZ near Objective Falcon?',
      content: 'Need a flat zone within 5km, low dunes. Anyone flown it recently at night?',
      category: 'general',
      views: 168,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: 'demo-6',
      user_id: 'demo',
      title: 'Looking for spare chem lights and IR strobes',
      content: 'We burned through ours last rotation. Happy to barter MRE coffee and 9-line cards.',
      category: 'other',
      views: 122,
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
    <div className="min-h-screen flex flex-col bg-[#0b0f0c] text-[#e8dfc7]">
      <Navigation />

      <main className="flex-1">
        <section className="relative overflow-hidden text-[#f1df9c] py-20">
          <div className="absolute inset-0">
            <div className="absolute inset-0 bg-gradient-to-b from-[#0f1c16] via-[#0f1c16] to-[#0b0f0c]" />
            <div className="absolute inset-0 opacity-45 mix-blend-overlay bg-[radial-gradient(circle_at_20%_20%,rgba(202,163,93,0.25),transparent_32%),radial-gradient(circle_at_70%_10%,rgba(182,107,46,0.16),transparent_30%),radial-gradient(circle_at_30%_80%,rgba(52,69,47,0.3),transparent_38%)]" />
            <div className="absolute inset-0 opacity-25 bg-[linear-gradient(120deg,rgba(255,255,255,0.07)_1px,transparent_1px),linear-gradient(-120deg,rgba(202,163,93,0.08)_1px,transparent_1px)] bg-[length:26px_26px]" />
            <div className="absolute inset-x-[-12%] -bottom-28 h-80 rotate-[-3deg]">
              <div className="grid h-full grid-cols-1 gap-4 opacity-80 md:grid-cols-3">
                {HERO_IMAGES.map((image, index) => (
                  <div
                    key={`${image.src}-${index}`}
                    className="relative h-full overflow-hidden rounded-xl border border-[#caa35d]/40 bg-[#0f1c16] shadow-[0_30px_80px_rgba(0,0,0,0.35)]"
                    style={{ animationDelay: `${index * 80}ms` }}
                  >
                    <Image
                      src={image.src}
                      alt={image.alt}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 33vw, 16vw"
                      className="h-full w-full object-cover brightness-110 saturate-125"
                      style={image.position ? { objectPosition: image.position } : undefined}
                      priority={index < 3}
                    />
                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#0f1c16] via-[#0f1c16]/55 to-transparent" />
                    <div className="pointer-events-none absolute left-3 top-3 rounded-full border border-[#caa35d]/60 bg-[#0f1c16]/70 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-[#caa35d]">
                      {image.badge ?? 'Desert Storm 1991'}
                    </div>
                  </div>
                ))}
              </div>
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#0b0f0c] via-transparent to-transparent" />
            </div>
          </div>

          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-4xl mx-auto">
              <p className="mb-4 text-xs font-semibold uppercase tracking-[0.45em] text-[#caa35d]">
                Desert Storm inspired · Military Helper
              </p>
              <h1 className="text-5xl md:text-6xl font-black mb-6 leading-tight drop-shadow-[0_18px_60px_rgba(0,0,0,0.35)]">
                Military Helper for missions, supply, and briefs
              </h1>
              <p className="text-lg md:text-xl text-[#f6f0d8] mb-8">
                Equip your unit, coordinate missions, trade gear, and push intel faster—purpose-built for the modern force with a Desert Storm edge.
              </p>
              <div className="animate-fade-in-up" style={{ animationDelay: '0.16s' }}>
                <HomeHeroActions />
              </div>
              <div className="grid gap-3 sm:grid-cols-3 mt-10">
                <div className="rounded-lg border border-[#caa35d]/30 bg-white/5 px-4 py-3 text-left">
                  <p className="text-xs uppercase tracking-[0.24em] text-[#caa35d]">Active missions</p>
                  <p className="text-2xl font-bold">{jobs.length}+</p>
                </div>
                <div className="rounded-lg border border-[#caa35d]/30 bg-white/5 px-4 py-3 text-left">
                  <p className="text-xs uppercase tracking-[0.24em] text-[#caa35d]">Supply drops</p>
                  <p className="text-2xl font-bold">{items.length} listings</p>
                </div>
                <div className="rounded-lg border border-[#caa35d]/30 bg-white/5 px-4 py-3 text-left">
                  <p className="text-xs uppercase tracking-[0.24em] text-[#caa35d]">Briefs + comms</p>
                  <p className="text-2xl font-bold">{posts.length} threads</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="py-16 bg-[#0f1310]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-10">
              <div>
                <h2 className="text-3xl md:text-4xl font-bold text-[#f1df9c]">Operations Feed</h2>
                <p className="text-lg text-[#d9c8a5]/80">Live flow of missions, supply exchanges, and field briefings.</p>
              </div>
              <div className="flex flex-wrap justify-center md:justify-end gap-3 w-full md:w-auto">
                <Link href="/jobs">
                  <Button variant="outline" className="border-[#caa35d] text-[#f1df9c] hover:bg-[#caa35d] hover:text-[#0f1c16]">
                    View missions
                  </Button>
                </Link>
                <Link href="/marketplace">
                  <Button className="bg-[#caa35d] text-[#0f1c16] hover:bg-[#a57c2c]">Open supply</Button>
                </Link>
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              <Link href="/jobs" className="block h-full">
                <Card className="group relative overflow-hidden border border-[#caa35d]/30 hover:border-[#caa35d] transition-all duration-300 shadow-[0_20px_60px_rgba(0,0,0,0.35)] bg-white/5 backdrop-blur-sm transform hover:-translate-y-1">
                  <span className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-br from-[#caa35d]/15 via-white/20 to-[#0f1c16]/10" />
                  <CardContent className="relative p-6 space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xl font-bold text-[#f1df9c]">Priority Missions</h3>
                      <Briefcase className="w-5 h-5 text-[#caa35d]" />
                    </div>
                    <div className="space-y-4">
                      {jobs.map((job) => (
                        <div key={job.id} className="border border-[#caa35d]/25 rounded-lg p-3 bg-[#0f1c16]/70">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <p className="font-semibold text-[#f1df9c]">{job.title}</p>
                              <p className="text-sm text-[#d9c8a5]/80">{job.location}</p>
                            </div>
                            <span className="text-sm font-semibold text-[#caa35d]">
                              {currency.format(Number(job.pay_rate))}/{job.pay_type === 'hourly' ? 'hr' : 'mission'}
                            </span>
                          </div>
                          <p className="text-sm text-[#d9c8a5]/80 mt-2 max-h-12 overflow-hidden text-ellipsis">{job.description}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </Link>

              <Link href="/marketplace" className="block h-full">
                <Card className="group relative overflow-hidden border border-[#caa35d]/30 hover:border-[#caa35d] transition-all duration-300 shadow-[0_20px_60px_rgba(0,0,0,0.35)] bg-white/5 backdrop-blur-sm transform hover:-translate-y-1">
                  <span className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-br from-[#caa35d]/15 via-white/20 to-[#0f1c16]/10" />
                  <CardContent className="relative p-6 space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xl font-bold text-[#f1df9c]">Supply Exchange</h3>
                      <ShoppingBag className="w-5 h-5 text-[#caa35d]" />
                    </div>
                    <div className="space-y-4">
                      {items.map((item) => (
                        <div key={item.id} className="border border-[#caa35d]/25 rounded-lg p-3 bg-[#0f1c16]/70">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <p className="font-semibold text-[#f1df9c]">{item.title}</p>
                              <p className="text-sm text-[#d9c8a5]/80 capitalize">{item.condition.replace('_', ' ')}</p>
                            </div>
                            <span className="text-sm font-semibold text-[#caa35d]">{currency.format(Number(item.price))}</span>
                          </div>
                          <p className="text-sm text-[#d9c8a5]/80 mt-2 max-h-12 overflow-hidden text-ellipsis">{item.description}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </Link>

              <Link href="/forum" className="block h-full">
                <Card className="group relative overflow-hidden border border-[#caa35d]/30 hover:border-[#caa35d] transition-all duration-300 shadow-[0_20px_60px_rgba(0,0,0,0.35)] bg-white/5 backdrop-blur-sm transform hover:-translate-y-1">
                  <span className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-br from-[#caa35d]/15 via-white/20 to-[#0f1c16]/10" />
                  <CardContent className="relative p-6 space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xl font-bold text-[#f1df9c]">Briefings</h3>
                      <MessageSquare className="w-5 h-5 text-[#caa35d]" />
                    </div>
                    <div className="space-y-4">
                      {posts.map((post) => (
                        <div
                          key={post.id}
                          className="border border-[#caa35d]/25 rounded-lg p-3 bg-[#0f1c16]/70 max-h-32 overflow-hidden"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <p className="font-semibold text-[#f1df9c]">{post.title}</p>
                            <span className="text-xs font-semibold text-[#caa35d] uppercase">{post.category}</span>
                          </div>
                          <p className="text-sm text-[#d9c8a5]/80 mt-2 line-clamp-2">{post.content}</p>
                          <p className="text-xs text-[#d9c8a5]/70 mt-2">{post.views ?? 0} views</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </div>
          </div>
        </section>

        <section className="py-16 bg-[#0b0f0c]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-[#f1df9c] mb-4">Built for the field</h2>
              <p className="text-lg text-[#d9c8a5]/80 max-w-2xl mx-auto">
                Missions, supply, and comms in one ready-room. Inspired by Desert Storm grit but wired for today&apos;s tempo.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              <Card className="group relative overflow-hidden border border-[#caa35d]/30 hover:border-[#caa35d] transition-all duration-300 hover:shadow-[0_20px_60px_rgba(0,0,0,0.35)] bg-white/5 backdrop-blur-sm transform hover:-translate-y-1">
                <span className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-br from-[#caa35d]/15 via-white/20 to-[#0f1c16]/10" />
                <CardContent className="relative p-6">
                  <div className="w-12 h-12 bg-[#caa35d] rounded-lg flex items-center justify-center mb-4">
                    <Briefcase className="w-6 h-6 text-[#0f1c16]" />
                  </div>
                  <h3 className="text-xl font-bold text-[#f1df9c] mb-3">Mission roster</h3>
                  <p className="text-[#d9c8a5]/85 mb-4">
                    Spin up gigs fast, track who is on point, and keep incentives clear for every rotation.
                  </p>
                  <Link href="/jobs" className="text-[#caa35d] font-semibold hover:underline">
                    View missions →
                  </Link>
                </CardContent>
              </Card>

              <Card className="group relative overflow-hidden border border-[#caa35d]/30 hover:border-[#caa35d] transition-all duration-300 hover:shadow-[0_20px_60px_rgba(0,0,0,0.35)] bg-white/5 backdrop-blur-sm transform hover:-translate-y-1">
                <span className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-br from-[#caa35d]/15 via-white/20 to-[#0f1c16]/10" />
                <CardContent className="relative p-6">
                  <div className="w-12 h-12 bg-[#caa35d] rounded-lg flex items-center justify-center mb-4">
                    <ShoppingBag className="w-6 h-6 text-[#0f1c16]" />
                  </div>
                  <h3 className="text-xl font-bold text-[#f1df9c] mb-3">Supply exchange</h3>
                  <p className="text-[#d9c8a5]/85 mb-4">
                    Move kit, radios, and desert-ready gear with trusted peers. Barter, buy, or swap in minutes.
                  </p>
                  <Link href="/marketplace" className="text-[#caa35d] font-semibold hover:underline">
                    Open supply →
                  </Link>
                </CardContent>
              </Card>

              <Card className="group relative overflow-hidden border border-[#caa35d]/30 hover:border-[#caa35d] transition-all duration-300 hover:shadow-[0_20px_60px_rgba(0,0,0,0.35)] bg-white/5 backdrop-blur-sm transform hover:-translate-y-1">
                <span className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-br from-[#caa35d]/15 via-white/20 to-[#0f1c16]/10" />
                <CardContent className="relative p-6">
                  <div className="w-12 h-12 bg-[#caa35d] rounded-lg flex items-center justify-center mb-4">
                    <MessageSquare className="w-6 h-6 text-[#0f1c16]" />
                  </div>
                  <h3 className="text-xl font-bold text-[#f1df9c] mb-3">Briefings & chatter</h3>
                  <p className="text-[#d9c8a5]/85 mb-4">
                    Drop quick intel, SOPs, or morale boosts. Keep everyone synced without drowning in noise.
                  </p>
                  <Link href="/forum" className="text-[#caa35d] font-semibold hover:underline">
                    Enter briefings →
                  </Link>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        <section className="bg-[#0f1310] py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-[#f1df9c] mb-4">Why units rely on us</h2>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-[#0f1c16] border border-[#caa35d]/50 rounded-full flex items-center justify-center mx-auto mb-4 animate-float">
                  <Shield className="w-8 h-8 text-[#caa35d]" />
                </div>
                <h3 className="text-xl font-bold text-[#f1df9c] mb-2">Verified teammates</h3>
                <p className="text-[#d9c8a5]/85">
                  Email and profile checks keep your roster authentic and accountable for every op.
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-[#0f1c16] border border-[#caa35d]/50 rounded-full flex items-center justify-center mx-auto mb-4 animate-float" style={{ animationDelay: '0.1s' }}>
                  <Star className="w-8 h-8 text-[#caa35d]" />
                </div>
                <h3 className="text-xl font-bold text-[#f1df9c] mb-2">Reputation matters</h3>
                <p className="text-[#d9c8a5]/85">
                  Ratings and after-action notes keep high-performers visible and build trust fast.
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-[#0f1c16] border border-[#caa35d]/50 rounded-full flex items-center justify-center mx-auto mb-4 animate-float" style={{ animationDelay: '0.2s' }}>
                  <TrendingUp className="w-8 h-8 text-[#caa35d]" />
                </div>
                <h3 className="text-xl font-bold text-[#f1df9c] mb-2">Ready for tempo</h3>
                <p className="text-[#d9c8a5]/85">
                  Built for fast turns: spin up, brief, and redeploy without losing context between teams.
                </p>
              </div>
            </div>
          </div>
        </section>

        <HomeFinalCta />

      </main>

      <Footer />
    </div>
  );
}
