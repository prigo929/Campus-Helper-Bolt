'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { Search, Plus, MessageSquare, Eye, TrendingUp, Loader2 } from 'lucide-react';
import { Navigation } from '@/components/navigation';
import { Footer } from '@/components/footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase, type ForumPost } from '@/lib/supabase';
import { getSafeSession } from '@/lib/get-safe-session';

const categories = ['All', 'Ops', 'Intel', 'Logistics', 'Support', 'Other'];

type DisplayPost = ForumPost & {
  user_name?: string;
  user_rating?: number;
  comments?: number;
  posted?: string;
  trending?: boolean;
  comments_count?: number;
};

const sampleTimestamp = '2024-01-01T00:00:00Z';

const samplePosts: DisplayPost[] = [
  {
    id: '1',
    user_id: 'demo',
    title: 'Best dust-off LZ near Objective Falcon?',
    content: 'Need a flat zone within 5km, low dunes. Anyone flown it recently at night?',
    category: 'ops',
    user_name: 'Lt. Hayes',
    user_rating: 4.7,
    views: 245,
    comments: 12,
    posted: '2 hours ago',
    trending: true,
    created_at: sampleTimestamp,
    updated_at: sampleTimestamp,
  },
  {
    id: '2',
    user_id: 'demo',
    title: 'Intel push for tonight',
    content: 'Need HUMINT + SIGINT rollup for 2100 brief. Any fresh hits on the river crossing?',
    category: 'intel',
    user_name: 'CWO Rios',
    user_rating: 4.9,
    views: 189,
    comments: 10,
    posted: '5 hours ago',
    trending: false,
    created_at: sampleTimestamp,
    updated_at: sampleTimestamp,
  },
  {
    id: '3',
    user_id: 'demo',
    title: 'Need pallets and a forklift for inbound ammo',
    content: 'Class V arriving 1700. Need two pallets cleared and a driver staged at Bay 3.',
    category: 'logistics',
    user_name: 'Supply Sgt.',
    user_rating: 5.0,
    views: 156,
    comments: 15,
    posted: '1 day ago',
    trending: true,
    created_at: sampleTimestamp,
    updated_at: sampleTimestamp,
  },
  {
    id: '4',
    user_id: 'demo',
    title: 'FOB maintenance crew swap',
    content: 'Swapping teams for generator PMCS. Need one electrician and one HVAC tech.',
    category: 'support',
    user_name: 'Ops Desk',
    user_rating: 4.8,
    views: 203,
    comments: 7,
    posted: '1 day ago',
    trending: false,
    created_at: sampleTimestamp,
    updated_at: sampleTimestamp,
  },
  {
    id: '5',
    user_id: 'demo',
    title: 'ISR feed lagging?',
    content: 'Our ISR feed is 5s behind. Anyone else seeing latency on the TOC screens?',
    category: 'intel',
    user_name: 'Capt. Wynn',
    user_rating: 4.6,
    views: 134,
    comments: 19,
    posted: '2 days ago',
    trending: true,
    created_at: sampleTimestamp,
    updated_at: sampleTimestamp,
  },
  {
    id: '6',
    user_id: 'demo',
    title: 'Need extra chem lights and IR strobes',
    content: 'We burned through ours on last patrol. Can barter MRE coffee and 9-line cards.',
    category: 'logistics',
    user_name: 'Sgt. Brooks',
    user_rating: 4.9,
    views: 312,
    comments: 23,
    posted: '3 hours ago',
    trending: true,
    created_at: sampleTimestamp,
    updated_at: sampleTimestamp,
  },
];

export default function ForumPage() {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('recent');
  const [posts, setPosts] = useState<DisplayPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadPosts = async () => {
      if (!supabase) {
        setPosts(samplePosts);
        setLoading(false);
        return;
      }

      setLoading(true);

      const { session, error: sessionError } = await getSafeSession({ silent: true });
      if (sessionError) {
        console.error('Failed to load forum session', sessionError);
      }
      if (!session) {
        setPosts(samplePosts);
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('forum_posts')
        .select('id, user_id, title, content, category, views, created_at, updated_at, profiles(full_name,email), forum_comments(count)')
        .order('created_at', { ascending: false })
        .limit(50);

      if (!error && data) {
        const mapped: DisplayPost[] = data.map((post: any) => {
          const profile = post.profiles;
          const commentsCount = post.forum_comments?.[0]?.count ?? 0;
          return {
            ...post,
            posted: post.created_at,
            trending: post.views ? post.views > 100 : false,
            comments: commentsCount,
            comments_count: commentsCount,
            user_name: profile?.full_name || profile?.email || 'Military Helper user',
          };
        });
        setPosts(mapped);
      } else {
        setPosts(samplePosts);
      }

      setLoading(false);
    };

    loadPosts();
  }, []);

  const filteredPosts = useMemo(() => {
    return posts.filter((post) => {
      const matchesCategory =
        selectedCategory === 'All' ||
        (post.category || '').toLowerCase() === selectedCategory.toLowerCase();
      const matchesSearch =
        post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (post.content || '').toLowerCase().includes(searchTerm.toLowerCase());
      const matchesTab = activeTab === 'recent' || (activeTab === 'trending' && post.trending);
      return matchesCategory && matchesSearch && matchesTab;
    });
  }, [posts, activeTab, selectedCategory, searchTerm]);

  const formatDate = (value?: string | null) =>
    value ? new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'Recently';

  const categoryBadgeClasses = 'bg-white/10 text-[#f1df9c] border border-white/20';

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
                <p className="text-xs uppercase tracking-[0.38em] text-[#caa35d] mb-2">Briefings & chatter</p>
                <h1 className="text-4xl font-black leading-tight">Field comms board</h1>
                <p className="text-[#e6d9bd]/80">Drop intel, SOPs, and quick asks. Keep the unit synced.</p>
              </div>
              <Button
                className="bg-[#caa35d] text-[#0b0f18] hover:bg-[#a57c2c] font-semibold border border-white/20 shadow-[0_10px_30px_rgba(0,0,0,0.35)]"
                onClick={() => router.push('/forum/new')}
              >
                <Plus className="w-4 h-4 mr-2" />
                New brief
              </Button>
            </div>

            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/50 w-5 h-5" />
                <Input
                  type="text"
                  placeholder="Search threads..."
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
          <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
            <TabsList className="bg-[#0f1c16] border border-white/15 text-[#f1df9c]">
              <TabsTrigger value="recent" className="data-[state=active]:bg-[#caa35d] data-[state=active]:text-[#0b0f18]">
                Recent
              </TabsTrigger>
              <TabsTrigger value="trending" className="data-[state=active]:bg-[#caa35d] data-[state=active]:text-[#0b0f18]">
                <TrendingUp className="w-4 h-4 mr-2" />
                Trending
              </TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab} className="mt-6">
              <div className="mb-6">
                <p className="text-[#d9c8a5]/80 flex items-center gap-3">
                  Showing <span className="font-semibold text-[#f1df9c]">{filteredPosts.length}</span> posts
                  {loading && <Loader2 className="w-4 h-4 animate-spin text-[#caa35d]" />}
                </p>
              </div>

              <div className="grid gap-4">
                {filteredPosts.map((post, index) => (
                  <Link href={`/forum/post?id=${post.id}`} key={post.id}>
                    <Card
                      className="hover:shadow-[0_18px_50px_rgba(0,0,0,0.45)] transition-all border border-[#caa35d]/35 hover:border-[#caa35d] bg-[#0f1c16]/90 backdrop-blur animate-fade-in-up h-full overflow-hidden"
                      style={{ animationDelay: `${index * 0.05}s` }}
                    >
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="text-lg font-bold text-[#f1df9c] line-clamp-2">{post.title}</h3>
                              {post.trending && (
                                <Badge className="bg-[#caa35d] text-[#0b0f18]">
                                  <TrendingUp className="w-3 h-3 mr-1" />
                                  Trending
                                </Badge>
                              )}
                            </div>
                            <div className="flex items-center gap-3 text-sm text-[#d9c8a5]/80">
                              <span className="font-semibold text-[#f1df9c]">{post.user_name || 'Military Helper user'}</span>
                              {post.user_rating && <span className="text-[#caa35d]">★ {post.user_rating}</span>}
                              <span className="text-white/30">•</span>
                              <span>{post.posted ? formatDate(post.posted) : formatDate(post.created_at)}</span>
                            </div>
                          </div>
                          <Badge className={categoryBadgeClasses}>{post.category}</Badge>
                        </div>
                      </CardHeader>

                      <CardContent className="space-y-3 pb-5">
                        <p className="text-[#d9c8a5] line-clamp-3">{post.content}</p>

                        <div className="flex items-center gap-6 text-sm text-[#d9c8a5]/80">
                          <div className="flex items-center">
                            <Eye className="w-4 h-4 mr-1 text-[#caa35d]" />
                            <span>{post.views ?? 0} views</span>
                          </div>
                          <div className="flex items-center">
                            <MessageSquare className="w-4 h-4 mr-1 text-[#caa35d]" />
                            <span>{post.comments_count ?? post.comments ?? 0} comments</span>
                          </div>
                          <span className="ml-auto text-[#caa35d] group-hover:text-white">View Discussion →</span>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>

              {filteredPosts.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-[#d9c8a5] text-lg">
                    {loading ? 'Loading posts...' : 'No posts found matching your criteria.'}
                  </p>
                  <p className="text-[#d9c8a5]/70 mt-2">Try adjusting your filters or search terms.</p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </section>
      </main>

      <Footer />
    </div>
  );
}
