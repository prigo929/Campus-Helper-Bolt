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

/**
 * Interface representing the highlighted content fetched from Supabase.
 * Includes latest missions, marketplace items, and forum briefings.
 */
type SupabaseHighlights = {
  jobs: Job[];
  items: MarketplaceItem[];
  posts: ForumPost[];
};

/**
 * Static asset configuration for the hero marquee animation.
 * Features iconic military imagery with specialized badges.
 */
const HERO_IMAGES = [
  { src: '/oil-desert-storm-tanks.jpg', alt: 'Tanks in oil fires', badge: 'Armor Push' },
  { src: '/desert-ops-tank.jpg', alt: 'Desert Ops', badge: 'OPS Ready' },
  { src: '/desert-storm-space.jpg', alt: 'Aerial View', badge: 'Overwatch' },
  { src: '/user-army.jpg', alt: 'US Army Rangers', badge: 'Army Strong' },
  { src: '/user-navy.webp', alt: 'USS Gerald R. Ford', badge: 'Naval Power' },
  { src: '/us-af-f22.jpg', alt: 'F-22 Raptor', badge: 'Air Superiority' },
  { src: '/us-sf-launch.jpg', alt: 'Space Force Launch', badge: 'Orbital Guard' },
  { src: '/apache-helicopter.jpg', alt: 'AH-64 Apache', badge: 'Air Cavalry' },
  { src: '/paratroopers-jump.jpg', alt: '82nd Airborne', badge: 'Airborne' },
  { src: '/ac-130.jpg', alt: 'AC-130 Gunship', badge: 'Air Support' },
  { src: '/f16-falcon.jpg', alt: 'F-16 Falcon', badge: 'Air Combat' },
  { src: '/aircraft-carrier.jpg', alt: 'USS Nimitz', badge: 'Naval Power' },
  { src: '/abrams-tank.jpg', alt: 'M1 Abrams', badge: 'Heavy Armor' },
  { src: '/soldier-m4.jpg', alt: 'Soldier with M4', badge: 'Infantry' },
  { src: '/soldier-patrol.jpg', alt: 'Patrol', badge: 'Recon' },
  { src: '/dave-sherrill-usa.jpg', alt: 'USA Flag', badge: 'USA' },
];

/**
 * Demonstration data used as a fallback when Supabase connection is unavailable
 * or when the database tables are empty. This ensures the landing page
 * always has representative content.
 */
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

/**
 * Fetches mission, marketplace, and forum highlights from Supabase.
 * Uses service role client if available for server-side pre-rendering,
 * otherwise falls back to the public client or demo data on failure.
 * 
 * @returns {Promise<SupabaseHighlights>} A combined object of active theater data.
 */
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
    // Parallel fetch for optimal performance
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

/**
 * Formatter for USD currency display, used for mission pay rates and marketplace prices.
 */
const currency = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
});

/**
 * The main landing page component.
 * Implements a high-impact "Desert Storm" aesthetic with:
 * - Animated hero marquee with military imagery
 * - Theater Operations video background section
 * - Real-time operations feed from Supabase
 * - Categorized mission and supply highlights
 */
export default async function Home() {
  const { jobs, items, posts } = await loadSupabaseHighlights();

  return (
    <div className="min-h-screen flex flex-col bg-[#0b0f0c] text-[#e8dfc7]">
      <Navigation />

      <main className="flex-1">
        {/* Hero Section: Features a rotating marquee of military imagery */}
        <section className="relative overflow-hidden text-[#f1df9c] py-20">
          <div className="absolute inset-0">
            <div className="absolute inset-0 bg-gradient-to-b from-[#0f1c16] via-[#0f1c16] to-[#0b0f0c]" />
            <div className="absolute inset-0 opacity-45 mix-blend-overlay bg-[radial-gradient(circle_at_20%_20%,rgba(202,163,93,0.25),transparent_32%),radial-gradient(circle_at_70%_10%,rgba(182,107,46,0.16),transparent_30%),radial-gradient(circle_at_30%_80%,rgba(52,69,47,0.3),transparent_38%)]" />
            
            {/* Marquee Container: Animates imagery behind the hero text */}
            <div className="absolute top-1/2 -translate-y-1/2 -left-[10%] -right-[10%] opacity-60 rotate-[-3deg] select-none pointer-events-none">
              <div
                className="flex w-max animate-scroll"
                style={{
                  paddingRight: '32px', // Force end padding matching item margin
                }}
              >
                {/* Double the images to create a seamless infinite loop animation */}
                {[...HERO_IMAGES, ...HERO_IMAGES].map((image, index) => (
                  <div
                    key={`${image.src}-${index}`}
                    className="relative w-[300px] h-[400px] shrink-0 overflow-hidden rounded-xl border border-[#caa35d]/40 bg-[#0f1c16] shadow-[0_30px_80px_rgba(0,0,0,0.35)]"
                    style={{ marginRight: '32px' }} // Force spacing between items
                  >
                    <Image
                      src={image.src}
                      alt={image.alt}
                      fill
                      sizes="300px"
                      className="object-cover brightness-110 saturate-125"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0f1c16] via-[#0f1c16]/20 to-transparent" />
                    <div className="absolute left-3 top-3 rounded-full border border-[#caa35d]/60 bg-[#0f1c16]/70 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-[#caa35d]">
                      {image.badge}
                    </div>
                  </div>
                ))}
              </div>
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
              
              {/* Stat counters for social proof */}
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

        {/* Theater Operations Section: High-impact video background with CRT effects */}
        <section className="relative py-24 bg-[#0b0f0c] overflow-hidden">
          {/* Decorative background elements for depth */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(202,163,93,0.05),transparent_60%)]" />
          <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-[#caa35d]/20 to-transparent" />

          <div className="relative w-full mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mb-12 text-center">
              <h2 className="text-3xl md:text-4xl font-bold text-[#f1df9c] mb-4">
                Theater Operations
              </h2>
              <p className="text-[#d9c8a5]/80 text-lg">
                Visual confirmation of the grid capabilities.
              </p>
            </div>

            <div className="group relative rounded-2xl overflow-hidden border border-[#caa35d]/30 bg-[#0f1c16] shadow-[0_30px_100px_rgba(0,0,0,0.5)] w-full max-w-6xl mx-auto">
              {/* CRT Scanline effect overlay for immersive military aesthetic */}
              <div className="pointer-events-none absolute inset-0 z-20 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_4px,3px_100%] opacity-15" />
              <div className="pointer-events-none absolute inset-0 z-20 bg-gradient-to-t from-[#0b0f0c]/80 via-transparent to-transparent opacity-60" />

              <div className="aspect-video w-full relative pointer-events-none">
                <video
                  className="w-full h-full object-cover scale-[1.01]"
                  autoPlay
                  muted
                  loop
                  playsInline
                >
                  <source src="/theater-ops.mp4" type="video/mp4" />
                </video>
              </div>

              {/* Decorative HUD-style corners */}
              <div className="absolute top-0 left-0 w-16 h-16 border-l-2 border-t-2 border-[#caa35d]/60 rounded-tl-2xl pointer-events-none" />
              <div className="absolute top-0 right-0 w-16 h-16 border-r-2 border-t-2 border-[#caa35d]/60 rounded-tr-2xl pointer-events-none" />
              <div className="absolute bottom-0 left-0 w-16 h-16 border-l-2 border-b-2 border-[#caa35d]/60 rounded-bl-2xl pointer-events-none" />
              <div className="absolute bottom-0 right-0 w-16 h-16 border-r-2 border-b-2 border-[#caa35d]/60 rounded-br-2xl pointer-events-none" />
            </div>
          </div>
        </section>

        {/* Operations Feed: Displays the latest highlights fetched from Supabase */}
        <section className="py-16 bg-[#0f1310]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-10">
              <div>
                <h2 className="text-3xl md:text-4xl font-bold text-[#f1df9c]">Operations Feed</h2>
                <p className="text-lg text-[#d9c8a5]/80">Live flow of missions, supply exchanges, and field briefings.</p>
              </div>
              <div className="flex flex-wrap justify-center md:justify-end gap-3 w-full md:w-auto">
                <Link href="/jobs">
                  <Button className="bg-[#caa35d] text-[#0f1c16] hover:bg-[#a57c2c]">
                    View missions
                  </Button>
                </Link>
                <Link href="/marketplace">
                  <Button className="bg-[#caa35d] text-[#0f1c16] hover:bg-[#a57c2c]">Open supply</Button>
                </Link>
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {/* Priority Missions Card */}
              <Link href="/jobs" className="block h-full">
                <Card className="group relative h-full overflow-hidden border border-[#caa35d]/30 hover:border-[#caa35d] transition-all duration-300 shadow-[0_20px_60px_rgba(0,0,0,0.35)] bg-white/5 backdrop-blur-sm transform hover:-translate-y-1">
                  <span className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-br from-[#caa35d]/15 via-white/20 to-[#0f1c16]/10" />
                  <CardContent className="relative p-6 space-y-4 flex-1 flex flex-col">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xl font-bold text-[#f1df9c]">Priority Missions</h3>
                      <Briefcase className="w-5 h-5 text-[#caa35d]" />
                    </div>
                    <div className="space-y-4">
                      {jobs.map((job) => (
                        <div key={job.id} className="border border-[#caa35d]/25 rounded-lg p-3 bg-[#0f1c16]/70 flex flex-col gap-1.5">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <p className="font-semibold text-[#f1df9c]">{job.title}</p>
                              <p className="text-sm text-[#d9c8a5]/80">{job.location}</p>
                            </div>
                            <span className="text-sm font-semibold text-[#caa35d]">
                              {currency.format(Number(job.pay_rate))}/{job.pay_type === 'hourly' ? 'hr' : 'mission'}
                            </span>
                          </div>
                          <p className="text-sm text-[#d9c8a5]/80 line-clamp-3 min-h-[3.6em]">{job.description}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </Link>

              {/* Supply Exchange Card */}
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
                        <div key={item.id} className="border border-[#caa35d]/25 rounded-lg p-3 bg-[#0f1c16]/70 flex flex-col gap-1.5">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <p className="font-semibold text-[#f1df9c]">{item.title}</p>
                              <p className="text-sm text-[#d9c8a5]/80 capitalize">{item.condition.replace('_', ' ')}</p>
                            </div>
                            <span className="text-sm font-semibold text-[#caa35d]">{currency.format(Number(item.price))}</span>
                          </div>
                          <p className="text-sm text-[#d9c8a5]/80 line-clamp-3 min-h-[3.6em]">{item.description}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </Link>

              {/* Briefings Card */}
              <Link href="/forum" className="block h-full">
                <Card className="group relative h-full overflow-hidden border border-[#caa35d]/30 hover:border-[#caa35d] transition-all duration-300 shadow-[0_20px_60px_rgba(0,0,0,0.35)] bg-white/5 backdrop-blur-sm transform hover:-translate-y-1">
                  <span className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-br from-[#caa35d]/15 via-white/20 to-[#0f1c16]/10" />
                  <CardContent className="relative p-6 space-y-4 flex-1 flex flex-col">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xl font-bold text-[#f1df9c]">Briefings</h3>
                      <MessageSquare className="w-5 h-5 text-[#caa35d]" />
                    </div>
                    <div className="space-y-4">
                      {posts.map((post) => (
                        <div
                          key={post.id}
                          className="border border-[#caa35d]/25 rounded-lg p-3 bg-[#0f1c16]/70 min-h-[7.5rem] flex flex-col gap-1.5"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <p className="font-semibold text-[#f1df9c]">{post.title}</p>
                            <span className="text-xs font-semibold text-[#caa35d] uppercase">{post.category}</span>
                          </div>
                          <p className="text-sm text-[#d9c8a5]/80 line-clamp-2 min-h-[2.6em]">{post.content}</p>
                          <p className="text-xs text-[#d9c8a5]/70 mt-auto pt-1">{post.views ?? 0} views</p>
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
                <CardContent className="relative p-6 flex flex-col h-full">
                  <div className="w-12 h-12 bg-[#caa35d] rounded-lg flex items-center justify-center mb-4">
                    <Briefcase className="w-6 h-6 text-[#0f1c16]" />
                  </div>
                  <h3 className="text-xl font-bold text-[#f1df9c] mb-3">Mission roster</h3>
                  <p className="text-[#f1df9c] mb-4">
                    Spin up gigs fast, track who is on point, and keep incentives clear for every rotation.
                  </p>
                  <div className="flex justify-end mt-auto pt-2">
                    <Link href="/jobs" className="text-[#caa35d] font-semibold hover:text-white hover:underline">
                      View missions →
                    </Link>
                  </div>
                </CardContent>
              </Card>

              <Card className="group relative overflow-hidden border border-[#caa35d]/30 hover:border-[#caa35d] transition-all duration-300 hover:shadow-[0_20px_60px_rgba(0,0,0,0.35)] bg-white/5 backdrop-blur-sm transform hover:-translate-y-1">
                <span className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-br from-[#caa35d]/15 via-white/20 to-[#0f1c16]/10" />
                <CardContent className="relative p-6 flex flex-col h-full">
                  <div className="w-12 h-12 bg-[#caa35d] rounded-lg flex items-center justify-center mb-4">
                    <ShoppingBag className="w-6 h-6 text-[#0f1c16]" />
                  </div>
                  <h3 className="text-xl font-bold text-[#f1df9c] mb-3">Supply exchange</h3>
                  <p className="text-[#f1df9c] mb-4">
                    Move kit, radios, and desert-ready gear with trusted peers. Barter, buy, or swap in minutes.
                  </p>
                  <div className="flex justify-end mt-auto pt-2">
                    <Link href="/marketplace" className="text-[#caa35d] font-semibold hover:underline">
                      Open supply →
                    </Link>
                  </div>
                </CardContent>
              </Card>

              <Card className="group relative overflow-hidden border border-[#caa35d]/30 hover:border-[#caa35d] transition-all duration-300 hover:shadow-[0_20px_60px_rgba(0,0,0,0.35)] bg-white/5 backdrop-blur-sm transform hover:-translate-y-1">
                <span className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-br from-[#caa35d]/15 via-white/20 to-[#0f1c16]/10" />
                <CardContent className="relative p-6 flex flex-col h-full">
                  <div className="w-12 h-12 bg-[#caa35d] rounded-lg flex items-center justify-center mb-4">
                    <MessageSquare className="w-6 h-6 text-[#0f1c16]" />
                  </div>
                  <h3 className="text-xl font-bold text-[#f1df9c] mb-3">Briefings & chatter</h3>
                  <p className="text-[#f1df9c] mb-4">
                    Drop quick intel, SOPs, or morale boosts. Keep everyone synced without drowning in noise.
                  </p>
                  <div className="flex justify-end mt-auto pt-2">
                    <Link href="/forum" className="text-[#caa35d] font-semibold hover:underline">
                      Enter briefings →
                    </Link>
                  </div>
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
