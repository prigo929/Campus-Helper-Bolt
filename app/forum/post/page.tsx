'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { ArrowLeft, MessageSquare, Eye, Loader2, AlertCircle, Flag } from 'lucide-react';
import { Navigation } from '@/components/navigation';
import { Footer } from '@/components/footer';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { supabase, type ForumPost } from '@/lib/supabase';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';

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
  const [comments, setComments] = useState<
    { id: string; content: string; created_at: string; user_id: string; author: string }[]
  >([]);
  const [reply, setReply] = useState('');
  const [replyError, setReplyError] = useState('');
  const [replying, setReplying] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const [reportReason, setReportReason] = useState('spam');
  const [reportDetails, setReportDetails] = useState('');
  const [reportMessage, setReportMessage] = useState('');
  const [commentReportMessage, setCommentReportMessage] = useState('');
  const [views, setViews] = useState<number | null>(null);
  const handleReportSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!post?.id) return;
    setReportMessage('Report submitted. Thanks for letting us know.');
    setReportDetails('');
    setReportOpen(false);
  };

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
        const currentViews = data.views ?? 0;
        setViews(currentViews);
        await supabase.from('forum_posts').update({ views: currentViews + 1 }).eq('id', id);
        setViews(currentViews + 1);
      }

      setLoading(false);
    };

    load();
  }, [id]);

  useEffect(() => {
    const loadComments = async () => {
      if (!supabase || !post?.id) return;
      const { data, error: commentsError } = await supabase
        .from('forum_comments')
        .select('id, content, created_at, user_id, profiles(full_name,email)')
        .eq('post_id', post.id)
        .order('created_at', { ascending: false });
      if (commentsError) {
        console.error('Comments load error', commentsError);
        return;
      }
      const mapped =
        data?.map((c) => ({
          id: c.id,
          content: c.content,
          created_at: c.created_at,
          user_id: c.user_id,
          author: (c as any).profiles?.full_name || (c as any).profiles?.email || 'Campus Helper user',
        })) || [];
      setComments(mapped);
    };
    loadComments();
  }, [post?.id]);

  const formatDate = (value?: string | null) =>
    value ? new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—';

  const handleReply = async () => {
    setReplyError('');
    if (!supabase) {
      setReplyError('Supabase is not configured.');
      return;
    }
    if (!post?.id) {
      setReplyError('No post to reply to.');
      return;
    }
    if (!reply.trim()) {
      setReplyError('Enter a reply.');
      return;
    }
    setReplying(true);
    const { data: sessionData } = await supabase.auth.getSession();
    const userId = sessionData.session?.user?.id;
    if (!userId) {
      setReplyError('Please sign in to reply.');
      setReplying(false);
      return;
    }
    const { error: insertError } = await supabase.from('forum_comments').insert({
      post_id: post.id,
      user_id: userId,
      content: reply.trim(),
    });
    if (insertError) {
      setReplyError(insertError.message);
      setReplying(false);
      return;
    }
    setReply('');
    // reload comments
    const { data: refreshed } = await supabase
      .from('forum_comments')
      .select('id, content, created_at, user_id, profiles(full_name,email)')
      .eq('post_id', post.id)
      .order('created_at', { ascending: false });
    const mapped =
      refreshed?.map((c) => ({
        id: c.id,
        content: c.content,
        created_at: c.created_at,
        user_id: c.user_id,
        author: (c as any).profiles?.full_name || (c as any).profiles?.email || 'Campus Helper user',
      })) || [];
    setComments(mapped);
    setReplying(false);
  };

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
                <div className="flex flex-col items-end gap-2">
                  <Badge className="bg-[#d4af37] text-[#1e3a5f]">Forum</Badge>
                  <Dialog open={reportOpen} onOpenChange={setReportOpen}>
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-red-200 text-red-600 hover:bg-red-50"
                      onClick={() => setReportOpen(true)}
                    >
                      <Flag className="w-4 h-4 mr-1" />
                      Report
                    </Button>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Report post</DialogTitle>
                        <DialogDescription>
                          Tell us what is wrong with this post.
                        </DialogDescription>
                      </DialogHeader>
                      <form className="space-y-3" onSubmit={handleReportSubmit}>
                        <div className="space-y-1">
                          <label htmlFor="report-reason" className="text-sm font-medium text-gray-700">
                            Reason
                          </label>
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
                          <label htmlFor="report-details" className="text-sm font-medium text-gray-700">
                            Details (optional)
                          </label>
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
                        {reportMessage && (
                          <p className="text-sm text-green-700">{reportMessage}</p>
                        )}
                      </form>
                    </DialogContent>
                  </Dialog>
                </div>
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
                  {views ?? post?.views ?? 0} views
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

              <Card className="border border-gray-200 bg-white">
                <CardHeader className="pb-2">
                  <CardTitle className="text-[#1e3a5f] text-lg">Replies</CardTitle>
                  <CardDescription className="text-gray-600">
                    Join the discussion with your classmates.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {replyError && (
                    <div className="text-sm text-red-700 bg-red-50 border border-red-200 px-3 py-2 rounded-md">
                      {replyError}
                    </div>
                  )}
                  <div className="space-y-2">
                    <Textarea
                      placeholder="Share your thoughts..."
                      value={reply}
                      onChange={(e) => setReply(e.target.value)}
                      rows={3}
                      disabled={replying}
                    />
                    <div className="flex justify-end">
                      <Button
                        className="bg-[#1e3a5f] text-white hover:bg-[#2a4a6f]"
                        disabled={replying}
                        onClick={handleReply}
                      >
                        {replying ? 'Posting...' : 'Post reply'}
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {comments.length === 0 ? (
                      <p className="text-sm text-gray-600">No replies yet. Be the first to respond.</p>
                    ) : (
                      comments.map((comment) => (
                        <div key={comment.id} className="rounded-lg border border-gray-100 bg-gray-50 px-3 py-2">
                          <div className="flex items-center justify-between text-sm text-gray-600 mb-1">
                            <span className="font-semibold text-[#1e3a5f]">{comment.author}</span>
                            <div className="flex items-center gap-3">
                              <span className="text-xs text-gray-500">{formatDate(comment.created_at)}</span>
                              <button
                                type="button"
                                onClick={async () => {
                                  setCommentReportMessage('');
                                  if (!supabase || !post?.id) return;
                                  const { data: sessionData } = await supabase.auth.getSession();
                                  const reporterId = sessionData.session?.user?.id;
                                  if (!reporterId) {
                                    setCommentReportMessage('Sign in to report comments.');
                                    return;
                                  }
                                  const { error: insertError } = await supabase.from('reports').insert({
                                    target_type: 'comment',
                                    target_table: 'forum_comments',
                                    target_id: comment.id,
                                    target_user_id: comment.user_id,
                                    reporter_user_id: reporterId,
                                    reason: 'comment',
                                    details: comment.content.slice(0, 200),
                                    status: 'open',
                                  });
                                  if (insertError) {
                                    setCommentReportMessage(insertError.message);
                                  } else {
                                    setCommentReportMessage('Comment reported.');
                                  }
                                }}
                                className="text-xs text-red-600 hover:underline"
                              >
                                Report
                              </button>
                            </div>
                          </div>
                          <p className="text-sm text-gray-700 whitespace-pre-line">{comment.content}</p>
                        </div>
                      ))
                    )}
                    {commentReportMessage && (
                      <p className="text-xs text-gray-600">{commentReportMessage}</p>
                    )}
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
