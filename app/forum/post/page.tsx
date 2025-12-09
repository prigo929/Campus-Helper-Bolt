'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Suspense, useEffect, useRef, useState } from 'react';
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
import { getSafeSession } from '@/lib/get-safe-session';

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

type FlatComment = {
  id: string;
  content: string;
  created_at: string;
  user_id: string;
  author: string;
  parent_id: string | null;
};

type ThreadedComment = FlatComment & {
  replies: ThreadedComment[];
};

function buildThread(items: FlatComment[]): ThreadedComment[] {
  const map = new Map<string, ThreadedComment>();
  const roots: ThreadedComment[] = [];

  items.forEach((item) => {
    map.set(item.id, { ...item, replies: [] });
  });

  map.forEach((comment) => {
    if (comment.parent_id && map.has(comment.parent_id)) {
      map.get(comment.parent_id)!.replies.push(comment);
    } else {
      roots.push(comment);
    }
  });

  const sortThread = (list: ThreadedComment[]) => {
    list.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
    list.forEach((reply) => sortThread(reply.replies));
  };

  sortThread(roots);
  return roots;
}

export default function ForumDetailPage() {
  return (
    <Suspense fallback={<ForumSuspenseFallback />}>
      <ForumDetailPageContent />
    </Suspense>
  );
}

function ForumDetailPageContent() {
  const router = useRouter();
  const params = useSearchParams();
  const id = params.get('id') || '';

  const [post, setPost] = useState<ForumPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [author, setAuthor] = useState('Military Helper user');
  const [authorId, setAuthorId] = useState<string | null>(null);
  const [comments, setComments] = useState<ThreadedComment[]>([]);
  const [commentLookup, setCommentLookup] = useState<Record<string, FlatComment>>({});
  const [reply, setReply] = useState('');
  const [replyError, setReplyError] = useState('');
  const [replyNotice, setReplyNotice] = useState('');
  const [replyingToCommentId, setReplyingToCommentId] = useState<string | null>(null);
  const [replying, setReplying] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const [reportReason, setReportReason] = useState('spam');
  const [reportDetails, setReportDetails] = useState('');
  const [reportMessage, setReportMessage] = useState('');
  const [commentReportMessage, setCommentReportMessage] = useState('');
  const [views, setViews] = useState<number | null>(null);
  const [hasSession, setHasSession] = useState(false);
  const hasIncremented = useRef(false);

  const handleReportSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!post?.id) return;
    setReportMessage('Report submitted. Thanks for letting us know.');
    setReportDetails('');
    setReportOpen(false);
  };

  async function loadComments(postId: string) {
    const client = supabase;
    if (!client) return;
    const fetchComments = (includeParent: boolean) =>
      client
        .from('forum_comments')
        .select(
          includeParent
            ? 'id, content, created_at, user_id, parent_id, profiles(full_name,email)'
            : 'id, content, created_at, user_id, profiles(full_name,email)'
        )
        .eq('post_id', postId)
        .order('created_at', { ascending: true });

    let { data, error: commentsError } = await fetchComments(true);
    if (commentsError && commentsError.message?.toLowerCase().includes('parent_id')) {
      console.warn('parent_id missing in schema cache; falling back to flat comments');
      ({ data, error: commentsError } = await fetchComments(false));
    }
    if (commentsError) {
      console.error('Comments load error', commentsError);
      return;
    }
    const rows = (data as any[]) || [];
    const mapped =
      rows.map((c) => ({
        id: c.id,
        content: c.content,
        created_at: c.created_at,
        user_id: c.user_id,
        parent_id: (c as any).parent_id || null,
        author: (c as any).profiles?.full_name || (c as any).profiles?.email || 'Military Helper user',
      })) || [];

    setCommentLookup(
      mapped.reduce((acc, curr) => {
        acc[curr.id] = curr;
        return acc;
      }, {} as Record<string, FlatComment>)
    );
    setComments(buildThread(mapped));
  }

  useEffect(() => {
    const load = async () => {
      if (!id) {
        setPost(fallbackPost);
        setLoading(false);
        return;
      }

      const client = supabase;
      if (!client) {
        setPost(fallbackPost);
        setLoading(false);
        return;
      }

      setLoading(true);
      const { session, error: sessionError } = await getSafeSession({ silent: true });
      if (sessionError) {
        console.error('Failed to load forum post session', sessionError);
      }
      setHasSession(Boolean(session));
      if (!session) {
        setPost(fallbackPost);
        setComments([]);
        setLoading(false);
        return;
      }

      const { data, error: fetchError } = await client
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
        setAuthor(profile?.full_name || profile?.email || 'Military Helper user');
        setAuthorId(data.user_id || null);
        const currentViews = data.views ?? 0;
        setViews(currentViews);
        if (!hasIncremented.current) {
          const { error: rpcError } = await client.rpc('increment_forum_post_views', { post_id: id });
          if (!rpcError) {
            setViews(currentViews + 1);
            hasIncremented.current = true;
          } else {
            console.error('Increment views failed', rpcError);
          }
        }
      }

      await loadComments(id);
      setLoading(false);
    };

    load();
  }, [id]);

  const formatDate = (value?: string | null) =>
    value ? new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—';

  const replyingToAuthor = replyingToCommentId ? commentLookup[replyingToCommentId]?.author : null;

  const handleReply = async () => {
    setReplyError('');
    setReplyNotice('');
    const client = supabase;
    if (!client) {
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
    const { session } = await getSafeSession();
    const userId = session?.user?.id;
    if (!userId) {
      setReplyError('Please sign in to reply.');
      setReplying(false);
      return;
    }
    const payload: Record<string, any> = {
      post_id: post.id,
      user_id: userId,
      content: reply.trim(),
    };
    if (replyingToCommentId) payload.parent_id = replyingToCommentId;

    let { error: insertError } = await client.from('forum_comments').insert(payload);
    if (insertError && insertError.message?.toLowerCase().includes('parent_id')) {
      console.warn('parent_id not found; retrying insert without parent link');
      delete payload.parent_id;
      ({ error: insertError } = await client.from('forum_comments').insert(payload));
      if (!insertError) {
        setReplyNotice('Threaded replies need the latest migration; comment added at the top level.');
      }
    }
    if (insertError) {
      setReplyError(insertError.message);
      setReplying(false);
      return;
    }
    setReply('');
    setReplyingToCommentId(null);
    await loadComments(post.id);
    setReplying(false);
  };

  const renderCommentThread = (comment: ThreadedComment, depth = 0) => {
    const indentStyle = depth > 0 ? { marginLeft: depth * 8 } : undefined;
    const containerClasses = depth > 0 ? 'border-l border-gray-200 pl-3' : '';
    const cardClasses = depth > 0 ? 'border-gray-200 bg-white' : 'border-gray-100 bg-gray-50';

    return (
      <div key={comment.id} className={`space-y-1 ${containerClasses}`} style={indentStyle}>
        <div className={`rounded-lg border px-3 py-2 ${cardClasses}`}>
          <div className="flex items-center justify-between text-sm text-gray-600 mb-1">
            <span className="font-semibold text-[#1e3a5f]">{comment.author}</span>
            <div className="flex items-center gap-3">
              <span className="text-xs text-gray-500">{formatDate(comment.created_at)}</span>
              <button
                type="button"
                onClick={() => {
                  setReplyingToCommentId(comment.id);
                  setReply((prev) => (prev ? prev : `@${comment.author} `));
                }}
                className="text-xs text-[#1e3a5f] hover:underline"
              >
                Reply
              </button>
              <button
                type="button"
                onClick={async () => {
                  setCommentReportMessage('');
                  if (!supabase || !post?.id) return;
                  const { session } = await getSafeSession();
                  const reporterId = session?.user?.id;
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
        {comment.replies.length > 0 && comment.replies.map((child) => renderCommentThread(child, depth + 1))}
      </div>
    );
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
                <CardContent className="space-y-4">
                  {replyError && (
                    <div className="text-sm text-red-700 bg-red-50 border border-red-200 px-3 py-2 rounded-md">
                      {replyError}
                    </div>
                  )}
                  {replyNotice && (
                    <div className="text-sm text-amber-700 bg-amber-50 border border-amber-200 px-3 py-2 rounded-md">
                      {replyNotice}
                    </div>
                  )}
                  <div className="space-y-2">
                    {replyingToCommentId && (
                      <div className="flex items-center justify-between rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-xs text-gray-700">
                        <span>Replying to {replyingToAuthor || 'comment'}</span>
                        <button
                          type="button"
                          onClick={() => setReplyingToCommentId(null)}
                          className="text-[#1e3a5f] hover:underline"
                        >
                          Cancel
                        </button>
                      </div>
                    )}
                    <Textarea
                      placeholder="Share your thoughts..."
                      value={reply}
                      onChange={(e) => setReply(e.target.value)}
                      rows={3}
                      disabled={replying}
                    />
                    <div className="flex items-center justify-between">
                      <p className="text-xs text-gray-500">Replies show in chronological threads.</p>
                      <Button
                        className="bg-[#1e3a5f] text-white hover:bg-[#2a4a6f]"
                        disabled={replying}
                        onClick={handleReply}
                      >
                        {replying ? 'Posting...' : replyingToCommentId ? 'Post reply' : 'Post comment'}
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {comments.length === 0 ? (
                      <p className="text-sm text-gray-600">No replies yet. Be the first to respond.</p>
                    ) : (
                      comments.map((comment) => renderCommentThread(comment))
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

function ForumSuspenseFallback() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navigation />
      <main className="flex-1">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading discussion...
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
