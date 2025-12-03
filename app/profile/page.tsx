'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Star, MapPin, GraduationCap, Mail, Briefcase, ShoppingBag, Edit, Loader2, AlertTriangle, MessageSquare, Trash2, Flag } from 'lucide-react';
import { Navigation } from '@/components/navigation';
import { Footer } from '@/components/footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase, type Profile, type Job, type MarketplaceItem, type Rating, type ForumPost } from '@/lib/supabase';
import { ensureProfileExists } from '@/lib/profile';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

export default function ProfilePage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('overview');
  const [profile, setProfile] = useState<Profile | null>(null);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [listings, setListings] = useState<MarketplaceItem[]>([]);
  const [reviews, setReviews] = useState<Rating[]>([]);
  const [posts, setPosts] = useState<ForumPost[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  const supabaseConfigured = Boolean(supabase);
  const [loading, setLoading] = useState(() => supabaseConfigured);
  const [error, setError] = useState(() =>
    supabaseConfigured ? '' : 'Supabase is not configured. Add NEXT_PUBLIC_SUPABASE_* env vars.'
  );
  const [reportOpen, setReportOpen] = useState(false);
  const [reportReason, setReportReason] = useState('spam');
  const [reportDetails, setReportDetails] = useState('');
  const [reportMessage, setReportMessage] = useState('');

  useEffect(() => {
    const client = supabase;
    if (!client) return;
    let active = true;

    const loadProfile = async () => {
      if (!active) return;
      setLoading(true);
      setError('');

      const { data: sessionData, error: sessionError } = await client.auth.getSession();

      if (sessionError) {
        setError(sessionError.message);
        setLoading(false);
        return;
      }

      const session = sessionData.session;

      if (!session?.user) {
        setError('Please sign in to view your profile.');
        setLoading(false);
        return;
      }

      setUserId(session.user.id);

      try {
        await ensureProfileExists(client, session);
      } catch (profileSeedError) {
        console.error('Profile auto-create failed', profileSeedError);
      }

      const userId = session.user.id;

      const [profileRes, jobsRes, listingsRes, reviewsRes, postsRes] = await Promise.all([
        client
          .from('profiles')
          .select('id, email, full_name, university, major, year, avatar_url, bio, rating, total_ratings, created_at, role')
          .eq('id', userId)
          .single(),
        client
          .from('jobs')
          .select('id, user_id, title, description, category, status, pay_rate, pay_type, location, created_at, updated_at')
          .eq('user_id', userId)
          .order('updated_at', { ascending: false })
          .limit(25),
        client
          .from('marketplace_items')
          .select('id, user_id, title, description, category, condition, price, status, created_at, updated_at')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
          .limit(25),
        client
          .from('ratings')
          .select('id, rated_user_id, rater_user_id, rating, comment, transaction_type, transaction_id, created_at')
          .eq('rated_user_id', userId)
          .order('created_at', { ascending: false })
          .limit(25),
        client
          .from('forum_posts')
          .select('id, user_id, title, content, category, views, created_at, updated_at')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
          .limit(25),
      ]);

      if (profileRes.error) {
        setError(profileRes.error.message || 'Could not load your profile.');
      } else {
        setProfile(profileRes.data);
      }

      if (jobsRes.error) {
        console.error('Jobs fetch error', jobsRes.error);
      } else {
        setJobs(jobsRes.data || []);
      }

      if (listingsRes.error) {
        console.error('Listings fetch error', listingsRes.error);
      } else {
        setListings(listingsRes.data || []);
      }

      if (reviewsRes.error) {
        console.error('Reviews fetch error', reviewsRes.error);
      } else {
        setReviews(reviewsRes.data || []);
      }

      if (postsRes.error) {
        console.error('Posts fetch error', postsRes.error);
      } else {
        setPosts(postsRes.data || []);
      }

      setLoading(false);
    };

    loadProfile();

    return () => {
      active = false;
    };
  }, []);

  const displayName = profile?.full_name || 'Your profile';
  const email = profile?.email || 'Add your email';
  const university = profile?.university || 'Add your university';
  const major = profile?.major || 'Add your major';
  const year = profile?.year || 'Add your year';
  const reputation = profile?.rating !== undefined && profile?.rating !== null ? Number(profile.rating) : 0;
  const totalRatings = profile?.total_ratings ?? 0;
  const memberSince = profile?.created_at
    ? new Date(profile.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    : '—';
  const bio = profile?.bio || 'Add a short bio to introduce yourself.';
  const isAdmin = profile?.role === 'admin';
  const initials = (profile?.full_name || profile?.email || 'CH')
    .split(' ')
    .filter(Boolean)
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
  const completedEarnings = jobs
    .filter((job) => (job.status || '').toLowerCase() === 'completed')
    .reduce((sum, job) => sum + Number(job.pay_rate || 0), 0);
  const activeListings = listings.filter((listing) => (listing.status || '').toLowerCase() === 'available').length;

  const handleDeleteJob = async (id: string) => {
    if (!supabase || !userId) return;
    const { error: deleteError } = await supabase.from('jobs').delete().eq('id', id).eq('user_id', userId);
    if (!deleteError) {
      setJobs((prev) => prev.filter((job) => job.id !== id));
    } else {
      console.error('Delete job failed', deleteError);
    }
  };

  const handleDeleteListing = async (id: string) => {
    if (!supabase || !userId) return;
    const { error: deleteError } = await supabase.from('marketplace_items').delete().eq('id', id).eq('user_id', userId);
    if (!deleteError) {
      setListings((prev) => prev.filter((item) => item.id !== id));
    } else {
      console.error('Delete listing failed', deleteError);
    }
  };

  const handleReportUser = () => {
    if (!profile) return;
    setReportMessage('');
    setReportDetails('');
    setReportOpen(true);
  };

  const handleSubmitReport = (event: React.FormEvent) => {
    event.preventDefault();
    if (!profile) return;
    setReportMessage('Report submitted. Thanks for letting us know.');
    setReportDetails('');
    setReportOpen(false);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navigation />

      <main className="flex-1">
        {loading ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="w-6 h-6 animate-spin text-[#1e3a5f]" />
          </div>
        ) : error ? (
          <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <Card className="border-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-[#1e3a5f]">
                  <AlertTriangle className="w-5 h-5" />
                  Profile unavailable
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-700">{error}</p>
                <div className="flex gap-3">
                  <Button onClick={() => window.location.reload()} variant="outline" className="border-[#1e3a5f] text-[#1e3a5f] hover:bg-[#1e3a5f] hover:text-white">
                    Retry
                  </Button>
                  <Button asChild className="bg-[#1e3a5f] text-white hover:bg-[#2a4a6f]">
                    <Link href="/sign-in">Go to sign in</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          <>
            <div className="bg-gradient-to-br from-[#1e3a5f] to-[#2a4a6f] text-white py-12">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
                  <Avatar className="w-24 h-24 border-4 border-white shadow-lg">
                    <AvatarFallback className="bg-[#d4af37] text-[#1e3a5f] text-3xl font-bold">
                      {initials}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1">
                    <h1 className="text-3xl font-bold mb-2">{displayName}</h1>
                    <div className="flex flex-wrap items-center gap-4 text-gray-200 mb-3">
                      <div className="flex items-center">
                        <GraduationCap className="w-4 h-4 mr-2" />
                        {major} - {year}
                      </div>
                      <div className="flex items-center">
                        <MapPin className="w-4 h-4 mr-2" />
                        {university}
                      </div>
                      <div className="flex items-center">
                        <Mail className="w-4 h-4 mr-2" />
                        {email}
                      </div>
                    </div>
                <div className="flex items-center gap-2">
                  <div className="flex items-center bg-[#d4af37] text-[#1e3a5f] px-3 py-1 rounded-full font-semibold">
                    <Star className="w-4 h-4 mr-1 fill-current" />
                    {reputation} ({totalRatings} reviews)
                  </div>
                  <Badge className="bg-white/20 text-white">
                    Member since {memberSince}
                  </Badge>
                  {isAdmin && (
                    <Badge className="bg-green-100 text-green-800">
                      Admin
                    </Badge>
                  )}
                </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      className="bg-[#d4af37] text-[#1e3a5f] hover:bg-[#c19b2e] font-semibold"
                      onClick={() => router.push('/profile/edit')}
                    >
                      <Edit className="w-4 h-4 mr-2" />
                      Edit Profile
                    </Button>
                    <Dialog open={reportOpen} onOpenChange={setReportOpen}>
                      <Button
                        variant="outline"
                        className="border-red-200 text-red-600 hover:bg-red-50"
                        onClick={handleReportUser}
                      >
                        <Flag className="w-4 h-4 mr-2" />
                        Report
                      </Button>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Report user</DialogTitle>
                          <DialogDescription>Tell us what is wrong with this profile.</DialogDescription>
                        </DialogHeader>
                        <form className="space-y-3" onSubmit={handleSubmitReport}>
                          <div className="space-y-1">
                            <Label htmlFor="report-reason">Reason</Label>
                            <select
                              id="report-reason"
                              value={reportReason}
                              onChange={(e) => setReportReason(e.target.value)}
                              className="w-full border rounded-md px-3 py-2 text-sm"
                            >
                              <option value="spam">Spam</option>
                              <option value="scam">Scam / Fraud</option>
                              <option value="insult">Harassment / Insult</option>
                              <option value="inaccurate">Inaccurate or misleading</option>
                              <option value="other">Other</option>
                            </select>
                          </div>
                          <div className="space-y-1">
                            <Label htmlFor="report-details">Details (optional)</Label>
                            <Textarea
                              id="report-details"
                              placeholder="Add any context that helps us review."
                              value={reportDetails}
                              onChange={(e) => setReportDetails(e.target.value)}
                              rows={3}
                            />
                          </div>
                          <DialogFooter>
                            <Button type="submit" className="bg-[#1e3a5f] text-white hover:bg-[#2a4a6f]">
                              Submit report
                            </Button>
                          </DialogFooter>
                          {reportMessage && <p className="text-sm text-green-700">{reportMessage}</p>}
                        </form>
                      </DialogContent>
                    </Dialog>
                    {isAdmin && (
                      <Link href="/admin/reports">
                        <Button variant="outline" className="border-[#d4af37] text-[#1e3a5f] hover:bg-[#d4af37] hover:text-[#1e3a5f]">
                          Admin Dashboard
                        </Button>
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="bg-white border mb-6">
                  <TabsTrigger value="overview" className="data-[state=active]:bg-[#1e3a5f] data-[state=active]:text-white">
                    Overview
                  </TabsTrigger>
                  <TabsTrigger value="jobs" className="data-[state=active]:bg-[#1e3a5f] data-[state=active]:text-white">
                    <Briefcase className="w-4 h-4 mr-2" />
                    My Jobs
                  </TabsTrigger>
                  <TabsTrigger value="listings" className="data-[state=active]:bg-[#1e3a5f] data-[state=active]:text-white">
                    <ShoppingBag className="w-4 h-4 mr-2" />
                    My Listings
                  </TabsTrigger>
                  <TabsTrigger value="posts" className="data-[state=active]:bg-[#1e3a5f] data-[state=active]:text-white">
                    <MessageSquare className="w-4 h-4 mr-2" />
                    My Posts
                  </TabsTrigger>
                  <TabsTrigger value="reviews" className="data-[state=active]:bg-[#1e3a5f] data-[state=active]:text-white">
                    <Star className="w-4 h-4 mr-2" />
                    Reviews
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="overview">
                  <div className="grid md:grid-cols-3 gap-6 mb-6">
                <Card className="border-2">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-gray-600">Total Earnings</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-[#1e3a5f]">${completedEarnings}</div>
                    <p className="text-sm text-gray-500 mt-1">From completed jobs</p>
                  </CardContent>
                </Card>

                <Card className="border-2">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-gray-600">Active Listings</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-[#1e3a5f]">{activeListings}</div>
                    <p className="text-sm text-gray-500 mt-1">Items for sale</p>
                  </CardContent>
                </Card>

                <Card className="border-2">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-gray-600">Reputation</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-[#1e3a5f]">{reputation.toFixed(1)}</div>
                    <p className="text-sm text-gray-500 mt-1">
                      Average rating {totalRatings ? `(${totalRatings} reviews)` : ''}
                    </p>
                  </CardContent>
                </Card>
              </div>

                  <Card className="border-2">
                    <CardHeader>
                      <CardTitle className="text-[#1e3a5f]">About</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-700">{bio}</p>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="jobs">
                  {jobs.length === 0 ? (
                    <div className="text-gray-600 text-sm">You have not posted any jobs yet.</div>
                  ) : (
                    <div className="grid gap-4">
                      {jobs.map((job) => (
                        <Card key={job.id} className="border-2">
                          <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                              <div className="flex-1">
                                <h3 className="text-lg font-bold text-[#1e3a5f] mb-2">{job.title}</h3>
                                <div className="flex items-center gap-4 text-sm text-gray-600">
                                  {(() => {
                                    const status = job.status || 'open';
                                    return (
                                      <Badge className={
                                        status === 'completed' ? 'bg-green-100 text-green-800' :
                                        status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                                        status === 'cancelled' ? 'bg-gray-200 text-gray-800' :
                                        'bg-gray-100 text-gray-800'
                                      }>
                                        {status.replace('_', ' ')}
                                      </Badge>
                                    );
                                  })()}
                                  <span className="text-[#1e3a5f] font-semibold">
                                    ${job.pay_rate} {job.pay_type === 'hourly' ? '/hr' : job.pay_type === 'fixed' ? 'total' : 'negotiable'}
                                  </span>
                                  <span className="text-gray-500">{job.location}</span>
                                  {job.updated_at && <span className="text-gray-400">Updated {formatDate(job.updated_at)}</span>}
                                </div>
                              </div>
                              <Button
                                variant="outline"
                                className="border-red-200 text-red-600 hover:bg-red-50"
                                onClick={() => handleDeleteJob(job.id)}
                              >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Remove
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="listings">
                  {listings.length === 0 ? (
                    <div className="text-gray-600 text-sm">You have not listed any items yet.</div>
                  ) : (
                    <div className="grid gap-4">
                      {listings.map((listing) => (
                        <Card key={listing.id} className="border-2">
                          <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                              <div className="flex-1">
                                <h3 className="text-lg font-bold text-[#1e3a5f] mb-2">{listing.title}</h3>
                                <div className="flex items-center gap-4">
                                  {(() => {
                                    const status = listing.status || 'available';
                                    return (
                                      <Badge className={
                                        status === 'sold' ? 'bg-gray-100 text-gray-800' :
                                        status === 'reserved' ? 'bg-blue-100 text-blue-800' :
                                        'bg-green-100 text-green-800'
                                      }>
                                        {status}
                                      </Badge>
                                    );
                                  })()}
                                  <span className="text-lg font-semibold text-[#1e3a5f]">${listing.price}</span>
                                  {listing.created_at && <span className="text-sm text-gray-500">Listed {formatDate(listing.created_at)}</span>}
                                </div>
                              </div>
                              <Button
                                variant="outline"
                                className="border-red-200 text-red-600 hover:bg-red-50"
                                onClick={() => handleDeleteListing(listing.id)}
                              >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Remove
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="reviews">
                  {reviews.length === 0 ? (
                    <div className="text-gray-600 text-sm">No reviews yet.</div>
                  ) : (
                    <div className="grid gap-4">
                      {reviews.map((review) => (
                        <Card key={review.id} className="border-2">
                          <CardContent className="p-6">
                            <div className="flex items-start justify-between mb-3">
                              <div>
                                <div className="flex items-center mb-2">
                                  <div className="flex items-center text-[#d4af37] mr-3">
                                    {[...Array(5)].map((_, i) => (
                                      <Star
                                        key={i}
                                        className={`w-4 h-4 ${i < (review.rating || 0) ? 'fill-current' : ''}`}
                                      />
                                    ))}
                                  </div>
                                  <span className="font-semibold text-[#1e3a5f]">
                                    {review.rater_user_id ? `From ${review.rater_user_id.slice(0, 8)}...` : 'From a peer'}
                                  </span>
                                </div>
                                <p className="text-gray-700">{review.comment || 'No comment provided.'}</p>
                              </div>
                              <span className="text-sm text-gray-500">{formatDate(review.created_at)}</span>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="posts">
                  {posts.length === 0 ? (
                    <div className="text-gray-600 text-sm">You have not created any posts yet.</div>
                  ) : (
                    <div className="grid gap-4">
                      {posts.map((post) => (
                        <Card key={post.id} className="border-2">
                          <CardContent className="p-6">
                            <div className="flex items-center justify-between mb-2">
                              <div>
                                <h3 className="text-lg font-bold text-[#1e3a5f]">{post.title}</h3>
                                <p className="text-sm text-gray-600 capitalize">{post.category}</p>
                              </div>
                              {post.created_at && (
                                <span className="text-sm text-gray-500">Posted {formatDate(post.created_at)}</span>
                              )}
                            </div>
                            <p className="text-gray-700 text-sm line-clamp-2">{post.content}</p>
                            <div className="mt-3 flex justify-end">
                              <Button
                                variant="outline"
                                className="border-red-200 text-red-600 hover:bg-red-50"
                                onClick={async () => {
                                  if (!supabase || !userId) return;
                                  const { error: deleteError } = await supabase
                                    .from('forum_posts')
                                    .delete()
                                    .eq('id', post.id)
                                    .eq('user_id', userId);
                                  if (!deleteError) {
                                    setPosts((prev) => prev.filter((p) => p.id !== post.id));
                                  } else {
                                    console.error('Delete post failed', deleteError);
                                  }
                                }}
                              >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Remove
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </div>
          </>
        )}
      </main>

      <Footer />
    </div>
  );
}
  const formatDate = (value?: string | null) =>
    value ? new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—';
