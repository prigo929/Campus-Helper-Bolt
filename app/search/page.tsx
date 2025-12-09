'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Search, Briefcase, ShoppingBag, MessageSquare, AlertCircle, Loader2, ArrowLeft } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { supabase } from '@/lib/supabase';
import type { Job, MarketplaceItem, ForumPost } from '@/lib/supabase';
import { getSafeSession } from '@/lib/get-safe-session';

type SearchResults = {
  jobs: Job[];
  items: MarketplaceItem[];
  posts: ForumPost[];
  meta?: {
    usedServiceKey?: boolean;
    warning?: string;
    counts?: { jobs: number; items: number; posts: number };
  };
};

const EMPTY_RESULTS: SearchResults = { jobs: [], items: [], posts: [] };

function highlight(text: string, query: string) {
  if (!query) return text;
  const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const parts = text.split(new RegExp(`(${escaped})`, 'ig'));
  return parts.map((part, idx) =>
    part.toLowerCase() === query.toLowerCase() ? (
      <mark key={idx} className="bg-yellow-200 text-[#1e3a5f] px-0.5 rounded">
        {part}
      </mark>
    ) : (
      <span key={idx}>{part}</span>
    )
  );
}

export default function SearchPage() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResults>(EMPTY_RESULTS);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [authToken, setAuthToken] = useState<string | null>(null);

  const handleBack = () => {
    if (window.history.length > 1) {
      router.back();
    } else {
      router.push('/home');
    }
  };

  useEffect(() => {
    let isMounted = true;
    if (!supabase) return;
    getSafeSession({ silent: true }).then(({ session }) => {
      if (!isMounted) return;
      setAuthToken(session?.access_token ?? null);
    });
    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (!query.trim()) {
      setResults(EMPTY_RESULTS);
      setError('');
      return;
    }

    const controller = new AbortController();
    const timeout = setTimeout(async () => {
      try {
        setLoading(true);
        setError('');
        const headers: Record<string, string> = {};
        if (authToken) headers.Authorization = `Bearer ${authToken}`;
        const res = await fetch(`/api/search?q=${encodeURIComponent(query.trim())}`, {
          signal: controller.signal,
          headers,
        });
        if (!res.ok) {
          throw new Error('Search failed');
        }
        const data = await res.json();
        if (data.error) {
          setError(typeof data.error === 'string' ? data.error : 'Unable to search right now.');
          setResults(EMPTY_RESULTS);
          return;
        }
        setResults(data);
        if (data.meta?.warning) {
          setError(data.meta.warning);
        }
      } catch (err: any) {
        if (err.name === 'AbortError') return;
        console.error('Search request failed', err);
        setError('Unable to search right now. Please try again.');
        setResults(EMPTY_RESULTS);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => {
      controller.abort();
      clearTimeout(timeout);
    };
  }, [query, authToken]);

  const hasAnyResults = useMemo(
    () => results.jobs.length || results.items.length || results.posts.length,
    [results]
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 via-white to-indigo-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 space-y-8">
        <header className="space-y-3">
          <div className="flex items-center gap-3 flex-wrap">
            <Button
              variant="ghost"
              size="sm"
              className="text-[#1e3a5f] hover:text-[#d4af37]"
              onClick={handleBack}
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              Back
            </Button>
            <div className="inline-flex items-center gap-2 rounded-full bg-purple-100 text-purple-700 px-3 py-1 text-sm font-semibold">
              <Search className="w-4 h-4" />
              Global Search
            </div>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-[#1e3a5f]">Find anything on Military Helper</h1>
          <p className="text-lg text-gray-600">
            Search across jobs, marketplace listings, and forum posts from one place.
          </p>
        </header>

        <div className="flex flex-col gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search jobs, materials, or forum posts..."
              className="pl-10 pr-4 py-6 text-lg border-[#d4af37]/60 focus-visible:ring-[#d4af37]"
            />
          </div>
          {error && (
            <div className="flex items-center gap-2 text-sm text-red-600">
              <AlertCircle className="w-4 h-4" />
              {error}
            </div>
          )}
        </div>

        {loading && (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Loader2 className="w-4 h-4 animate-spin" />
            Searching...
          </div>
        )}

        {!loading && query.trim() && !hasAnyResults && (
          <Card className="border-dashed border-gray-200 bg-white/90">
            <CardContent className="p-6 text-center space-y-3">
              <p className="text-lg font-semibold text-[#1e3a5f]">No matches found</p>
              <p className="text-sm text-gray-600">Try a different term or shorten your query.</p>
            </CardContent>
          </Card>
        )}

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          <Card className="bg-white/90 backdrop-blur border-gray-100 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-[#1e3a5f]">
                <Briefcase className="w-5 h-5 text-[#d4af37]" />
                Jobs
                <Badge variant="outline" className="ml-2">
                  {results.jobs.length}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {results.jobs.map((job) => (
                <Link
                  key={job.id}
                  href={`/jobs/detail?id=${job.id}`}
                  className="block rounded-lg border border-gray-100 bg-white hover:border-[#d4af37] hover:shadow-md transition p-3"
                >
                  <div className="flex items-center justify-between">
                    <p className="font-semibold text-[#1e3a5f]">{highlight(job.title, query)}</p>
                    <span className="text-xs uppercase text-[#d4af37]">{job.location}</span>
                  </div>
                  <p className="text-sm text-gray-700 line-clamp-2">
                    {highlight(job.description || '', query)}
                  </p>
                </Link>
              ))}
              {!results.jobs.length && <p className="text-sm text-gray-500">No job results yet.</p>}
            </CardContent>
          </Card>

          <Card className="bg-white/90 backdrop-blur border-gray-100 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-[#1e3a5f]">
                <ShoppingBag className="w-5 h-5 text-[#d4af37]" />
                Materials
                <Badge variant="outline" className="ml-2">
                  {results.items.length}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {results.items.map((item) => (
                <Link
                  key={item.id}
                  href={`/marketplace/detail?id=${item.id}`}
                  className="block rounded-lg border border-gray-100 bg-white hover:border-[#d4af37] hover:shadow-md transition p-3"
                >
                  <div className="flex items-center justify-between">
                    <p className="font-semibold text-[#1e3a5f]">{highlight(item.title, query)}</p>
                    <span className="text-xs uppercase text-[#d4af37]">{item.condition}</span>
                  </div>
                  <p className="text-sm text-gray-700 line-clamp-2">
                    {highlight(item.description || '', query)}
                  </p>
                </Link>
              ))}
              {!results.items.length && <p className="text-sm text-gray-500">No materials found.</p>}
            </CardContent>
          </Card>

          <Card className="bg-white/90 backdrop-blur border-gray-100 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-[#1e3a5f]">
                <MessageSquare className="w-5 h-5 text-[#d4af37]" />
                Forum
                <Badge variant="outline" className="ml-2">
                  {results.posts.length}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {results.posts.map((post) => (
                <Link
                  key={post.id}
                  href={`/forum/post?id=${post.id}`}
                  className="block rounded-lg border border-gray-100 bg-white hover:border-[#d4af37] hover:shadow-md transition p-3"
                >
                  <div className="flex items-center justify-between">
                    <p className="font-semibold text-[#1e3a5f]">{highlight(post.title, query)}</p>
                    <span className="text-xs uppercase text-[#d4af37]">{post.category}</span>
                  </div>
                    <p className="text-sm text-gray-700 line-clamp-2">{highlight(post.content || '', query)}</p>
                </Link>
              ))}
              {!results.posts.length && <p className="text-sm text-gray-500">No forum matches yet.</p>}
            </CardContent>
          </Card>
        </div>

        <div className="flex items-center justify-between text-sm text-gray-500">
          <span>Results grouped by content type.</span>
          <Button variant="ghost" size="sm" onClick={() => setQuery('')}>
            Clear search
          </Button>
        </div>
      </div>
    </div>
  );
}
