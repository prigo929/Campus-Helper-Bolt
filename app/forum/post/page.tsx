'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { ArrowLeft, MessageSquare, Eye, Loader2, AlertCircle, Star } from 'lucide-react';
import { Navigation } from '@/components/navigation';
import { Footer } from '@/components/footer';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { supabase, type ForumPost } from '@/lib/supabase';
import type { Rating } from '@/lib/supabase';

const fallbackPost: ForumPost = {
  id: 'demo',
  user_id: 'demo',
  title: 'Sample post',
  content: 'Sign in to view full discussion.',
  category: 'general',
  views: 0,
  created_at: '',
  updated_at: '',
};

export default function ForumDetailPage() {
  const router = useRouter();
  const params = useSearchParams();
  const id = params.get('id') || '';

  const [post, setPost] = useState<ForumPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [author, setAuthor] = useState('Campus Helper user');
  const [authorId, setAuthorId] = useState<string | null>(null);
  const [reviews, setReviews] = useState<Rating[]>([]);
  const [ratingSummary, setRatingSummary] = useState<{ rating?: number | null; total_ratings?: number | null }>({});
  const [newRating, setNewRating] = useState('5');
  const [newComment, setNewComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [submitMessage, setSubmitMessage] = useState('');

  useEffect(() => {
    const load = async () => {
      if (!id) {
        setPost(fallbackPost);
        setLoading(false);
        return;
      }

      if (!supabase) {
        setPost(fallbackPost);
        setLoading(false);
        return;
      }

      setLoading(true);
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) {
        setPost(fallbackPost);
        setLoading(false);
        return;
      }

      const { data, error: fetchError } = await supabase
        .from('forum_posts')
        .select('id, user_id, title, content, category, views, created_at, updated_at, profiles(full_name,email,rating,total_ratings)')
        .eq('id', id)
        .single();

      if (fetchError) {
        setError(fetchError.message);
        setPost(fallbackPost);
      } else {
        setPost(data);
        const profile = (data as any).profiles;
        setAuthor(profile?.full_name || profile?.email || 'Campus Helper user');
        setAuthorId(data.user_id || null);
        setRatingSummary({ rating: profile?.rating, total_ratings: profile?.total_ratings });
      }

      setLoading(false);
    };

    load();
  }, [id]);

  useEffect(() => {
    const loadReviews = async () => {
      if (!authorId || !supabase) return;
      const { data, error: ratingsError } = await supabase
        .from('ratings')
        .select('id, rating, comment, created_at')
        .eq('rated_user_id', authorId)
        .order('created_at', { ascending: false })
        .limit(5);
      if (!ratingsError && data) {
        setReviews(data);
      }
    };
    loadReviews();
  }, [authorId]);

  const formatDate = (value?: string | null) =>
    value ? new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—';

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navigation />

      <main className="flex-1">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center gap-3 mb-4">
            <Button variant="ghost" className="text-[#1e3a5f] hover:text-[#d4af37]" onClick={() => router.back()}>
              <ArrowLeft className="w-4 h-4 mr-1" />
              Back
            </Button>
          </div>

          <Card className="border-2">
            <CardHeader>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <CardTitle className="text-2xl text-[#1e3a5f]">{post?.title || 'Discussion'}</CardTitle>
                  <CardDescription className="text-gray-600 capitalize">{post?.category || 'category'}</CardDescription>
                  <p className="text-sm text-gray-500 mt-1">
                    Posted by{' '}
                    {authorId ? (
                      <Link href={`/profile/view?id=${authorId}`} className="underline hover:text-[#d4af37]">
                        {author}
                      </Link>
                    ) : (
                      author
                    )}
                  </p>
                </div>
                <Badge className="bg-[#d4af37] text-[#1e3a5f]">Forum</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {loading && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Loading post...
                </div>
              )}
              {error && (
                <div className="flex items-start gap-2 text-sm text-red-700 bg-red-50 border border-red-200 px-3 py-2 rounded-md">
                  <AlertCircle className="w-4 h-4 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              <div className="flex items-center gap-4 text-sm text-gray-700">
                <div className="flex items-center">
                  <Eye className="w-4 h-4 mr-1 text-[#d4af37]" />
                  {post?.views ?? 0} views
                </div>
                <div className="flex items-center">
                  <MessageSquare className="w-4 h-4 mr-1 text-[#d4af37]" />
                  Updated {formatDate(post?.updated_at || post?.created_at)}
                </div>
              </div>

              <div>
                <h2 className="text-lg font-semibold text-[#1e3a5f] mb-2">Content</h2>
                <p className="text-gray-700 whitespace-pre-line">{post?.content}</p>
              </div>

              <Card className="border border-[#d4af37]/30 bg-gradient-to-br from-white via-white to-[#fff8e1]">
                <CardHeader className="pb-2">
                  <CardTitle className="text-[#1e3a5f] text-lg">Reviews for {author}</CardTitle>
                  <CardDescription className="text-gray-600">
                    {ratingSummary.rating ? `${ratingSummary.rating.toFixed(1)} average • ${ratingSummary.total_ratings || 0} ratings` : 'No ratings yet'}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {reviews.length === 0 ? (
                    <p className="text-sm text-gray-600">No reviews yet.</p>
                  ) : (
                    reviews.map((review) => (
                      <div key={review.id} className="rounded-lg border border-gray-200 bg-white px-3 py-2">
                        <div className="flex items-center gap-2 text-[#d4af37] mb-1">
                          {[...Array(5)].map((_, idx) => (
                            <Star key={idx} className={`w-4 h-4 ${idx < review.rating ? 'fill-current' : ''}`} />
                          ))}
                          <span className="text-xs text-gray-500 ml-2">{formatDate(review.created_at)}</span>
                        </div>
                        <p className="text-sm text-gray-700">{review.comment || 'No comment provided.'}</p>
                      </div>
                    ))
                  )}

                  <div className="border-t pt-3 space-y-3">
                    <h3 className="text-sm font-semibold text-[#1e3a5f]">Leave a review</h3>
                    {submitError && (
                      <div className="text-sm text-red-700 bg-red-50 border border-red-200 px-3 py-2 rounded-md">
                        {submitError}
                      </div>
                    )}
                    {submitMessage && (
                      <div className="text-sm text-green-800 bg-green-50 border border-green-200 px-3 py-2 rounded-md">
                        {submitMessage}
                      </div>
                    )}
                    <div className="grid md:grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <Label htmlFor="rating">Rating</Label>
                        <Input
                          id="rating"
                          type="number"
                          min={1}
                          max={5}
                          step={1}
                          value={newRating}
                          onChange={(e) => setNewRating(e.target.value)}
                          disabled={submitting}
                        />
                      </div>
                      <div className="space-y-1 md:col-span-2">
                        <Label htmlFor="comment">Comment</Label>
                        <Textarea
                          id="comment"
                          placeholder="Share your experience..."
                          value={newComment}
                          onChange={(e) => setNewComment(e.target.value)}
                          rows={3}
                          disabled={submitting}
                        />
                      </div>
                    </div>
                    <Button
                      className="bg-[#1e3a5f] text-white hover:bg-[#2a4a6f]"
                      disabled={submitting}
                      onClick={async () => {
                        setSubmitError('');
                        setSubmitMessage('');
                        if (!authorId) {
                          setSubmitError('No user to review.');
                          return;
                        }
                        if (!supabase) {
                          setSubmitError('Supabase is not configured.');
                          return;
                        }
                        const parsedRating = Number(newRating);
                        if (Number.isNaN(parsedRating) || parsedRating < 1 || parsedRating > 5) {
                          setSubmitError('Rating must be between 1 and 5.');
                          return;
                        }

                        setSubmitting(true);
                        const { data: sessionData } = await supabase.auth.getSession();
                        const userId = sessionData.session?.user?.id;
                        if (!userId) {
                          setSubmitError('Please sign in to leave a review.');
                          setSubmitting(false);
                          return;
                        }

                        const { error: insertError } = await supabase.from('ratings').insert({
                          rated_user_id: authorId,
                          rater_user_id: userId,
                          rating: parsedRating,
                          comment: newComment.trim(),
                          transaction_type: 'profile',
                        });

                        if (insertError) {
                          setSubmitError(insertError.message);
                        } else {
                          setSubmitMessage('Review submitted!');
                          setReviews((prev) => [
                            {
                              id: crypto.randomUUID(),
                              rated_user_id: authorId,
                              rater_user_id: userId,
                              rating: parsedRating,
                              comment: newComment.trim(),
                              transaction_type: 'profile',
                              created_at: new Date().toISOString(),
                            },
                            ...prev,
                          ]);
                          setNewRating('5');
                          setNewComment('');
                        }
                        setSubmitting(false);
                      }}
                    >
                      {submitting ? 'Submitting...' : 'Submit review'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
}
