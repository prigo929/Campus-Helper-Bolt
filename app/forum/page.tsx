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

const categories = ['All', 'General', 'Academic', 'Events', 'Housing', 'Other'];

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
    title: 'Best study spots on campus?',
    content: 'Looking for quiet places to study. The library is always packed. Any recommendations?',
    category: 'general',
    user_name: 'Alex Thompson',
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
    title: 'Group needed for CS 301 project',
    content: 'Anyone interested in forming a study group for the final project? Meeting twice a week.',
    category: 'academic',
    user_name: 'Priya Patel',
    user_rating: 4.9,
    views: 89,
    comments: 8,
    posted: '5 hours ago',
    trending: false,
    created_at: sampleTimestamp,
    updated_at: sampleTimestamp,
  },
  {
    id: '3',
    user_id: 'demo',
    title: 'Spring Festival volunteers needed!',
    content: 'Student Union is organizing the Spring Festival. We need volunteers for setup and coordination.',
    category: 'events',
    user_name: 'Campus Events',
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
    title: 'Looking for roommate - Fall semester',
    content: '2BR apartment near campus, $600/month. Clean, quiet, preferably grad student.',
    category: 'housing',
    user_name: 'Jordan Kim',
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
    title: 'Professor recommendations for ECO 202?',
    content: 'Which professor would you recommend for Microeconomics? Looking for clear lectures and fair grading.',
    category: 'academic',
    user_name: 'Marcus Johnson',
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
    title: 'Free pizza at Engineering Building!',
    content: 'Tech club is hosting a meetup with free pizza and drinks. Room 301, 6 PM today.',
    category: 'events',
    user_name: 'Tech Club',
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

      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) {
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
        const mapped: DisplayPost[] = data.map((post) => {
          const profile = (post as any).profiles;
          const commentsCount = (post as any).forum_comments?.[0]?.count ?? 0;
          return {
            ...post,
            posted: post.created_at,
            trending: post.views ? post.views > 100 : false,
            comments: commentsCount,
            comments_count: commentsCount,
            user_name: profile?.full_name || profile?.email || 'Campus Helper user',
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
      const matchesSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            (post.content || '').toLowerCase().includes(searchTerm.toLowerCase());
      const matchesTab = activeTab === 'recent' || (activeTab === 'trending' && post.trending);
      return matchesCategory && matchesSearch && matchesTab;
    });
  }, [posts, activeTab, selectedCategory, searchTerm]);

  const formatDate = (value?: string | null) =>
    value ? new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'Recently';

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Academic': return 'bg-blue-100 text-blue-800';
      case 'Events': return 'bg-green-100 text-green-800';
      case 'Housing': return 'bg-purple-100 text-purple-800';
      case 'General': return 'bg-gray-100 text-gray-800';
      default: return 'bg-orange-100 text-orange-800';
    }
  };

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
                <h1 className="text-4xl font-bold mb-2">Community Forum</h1>
                <p className="text-gray-200">Connect with students and share campus life</p>
              </div>
              <Button
                className="bg-[#d4af37] text-[#1e3a5f] hover:bg-[#c19b2e] font-semibold"
                onClick={() => router.push('/forum/new')}
              >
                <Plus className="w-4 h-4 mr-2" />
                New Post
              </Button>
            </div>

            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  type="text"
                  placeholder="Search discussions..."
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
          <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
            <TabsList className="bg-white border">
              <TabsTrigger value="recent" className="data-[state=active]:bg-[#1e3a5f] data-[state=active]:text-white">
                Recent
              </TabsTrigger>
              <TabsTrigger value="trending" className="data-[state=active]:bg-[#1e3a5f] data-[state=active]:text-white">
                <TrendingUp className="w-4 h-4 mr-2" />
                Trending
              </TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab} className="mt-6">
              <div className="mb-6">
                <p className="text-gray-600 flex items-center gap-3">
                  Showing <span className="font-semibold text-[#1e3a5f]">{filteredPosts.length}</span> posts
                  {loading && <Loader2 className="w-4 h-4 animate-spin text-[#1e3a5f]" />}
                </p>
              </div>

              <div className="grid gap-4">
                {filteredPosts.map((post, index) => (
                  <Link href={`/forum/post?id=${post.id}`} key={post.id}>
                    <Card
                      className="hover:shadow-lg transition-all border-2 hover:border-[#d4af37] bg-white/90 backdrop-blur animate-fade-in-up h-full overflow-hidden"
                      style={{ animationDelay: `${index * 0.05}s` }}
                    >
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="text-lg font-bold text-[#1e3a5f] line-clamp-2">{post.title}</h3>
                              {post.trending && (
                                <Badge className="bg-[#d4af37] text-[#1e3a5f]">
                                  <TrendingUp className="w-3 h-3 mr-1" />
                                  Trending
                                </Badge>
                              )}
                            </div>
                            <div className="flex items-center gap-3 text-sm text-gray-600">
                              <span className="font-medium">{post.user_name || 'Campus Helper user'}</span>
                              {post.user_rating && <span className="text-[#d4af37]">★ {post.user_rating}</span>}
                              <span className="text-gray-400">•</span>
                              <span>{post.posted ? formatDate(post.posted) : formatDate(post.created_at)}</span>
                            </div>
                          </div>
                          <Badge className={getCategoryColor(post.category)}>
                            {post.category}
                          </Badge>
                        </div>
                      </CardHeader>

                      <CardContent className="space-y-3 pb-5 max-h-40 overflow-hidden">
                        <p className="text-gray-700 line-clamp-3">{post.content}</p>

                        <div className="flex items-center gap-6 text-sm text-gray-600">
                          <div className="flex items-center">
                            <Eye className="w-4 h-4 mr-1 text-[#d4af37]" />
                            <span>{post.views ?? 0} views</span>
                          </div>
                          <div className="flex items-center">
                            <MessageSquare className="w-4 h-4 mr-1 text-[#d4af37]" />
                            <span>{post.comments_count ?? post.comments ?? 0} comments</span>
                          </div>
                          <span className="ml-auto text-[#1e3a5f] group-hover:text-[#d4af37]">View Discussion →</span>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>

              {filteredPosts.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-gray-500 text-lg">
                    {loading ? 'Loading posts...' : 'No posts found matching your criteria.'}
                  </p>
                  <p className="text-gray-400 mt-2">Try adjusting your filters or search terms.</p>
                </div>
              )}
            </TabsContent>
          </Tabs>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
