'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import {
  Briefcase,
  ShoppingBag,
  MessageSquare,
  User,
  LogOut,
  Loader2,
  Shield,
  Sparkles,
  Search,
  Menu,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { supabase } from '@/lib/supabase';
import { NotificationsDropdown } from '@/components/notifications-dropdown';

export function Navigation() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [isAuthed, setIsAuthed] = useState(false);
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const loadUser = async () => {
      if (!supabase) return;

      setLoading(true);
      const { data } = await supabase.auth.getSession();
      if (!isMounted) return;

      const session = data.session;
      setIsAuthed(Boolean(session));

      if (!session?.user) {
        setDisplayName('');
        setEmail('');
        setIsAdmin(false);
        setLoading(false);
        return;
      }

      const baseEmail = session.user.email || '';
      setEmail(baseEmail);
      setIsAdmin(session.user.user_metadata?.role === 'admin');

      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name, role')
        .eq('id', session.user.id)
        .single();

      setDisplayName(profile?.full_name || baseEmail || 'Profile');
      if (profile?.role === 'admin') {
        setIsAdmin(true);
      }
      setLoading(false);
    };

    loadUser();
    return () => {
      isMounted = false;
    };
  }, []);

  const initials = useMemo(() => {
    const source = displayName || email || 'CH';
    return source
      .split(' ')
      .filter(Boolean)
      .map((part) => part[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();
  }, [displayName, email]);

  const handleSignOut = async () => {
    if (!supabase) return;
    setLoading(true);
    await supabase.auth.signOut();
    setIsAuthed(false);
    setDisplayName('');
    setEmail('');
    setIsAdmin(false);
    setLoading(false);
    router.push('/');
  };

  return (
    <nav className="bg-[#1e3a5f] text-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="flex flex-wrap items-center gap-2 py-3">
          <div className="flex items-center space-x-2 w-full sm:w-auto sm:flex-1 sm:min-w-0 lg:flex-1 lg:min-w-0">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 min-w-[2rem] min-h-[2rem] shrink-0 bg-gradient-to-br from-[#d4af37] to-[#f4d03f] rounded-lg flex items-center justify-center font-bold text-[#1e3a5f]">
                CH
              </div>
              <span className="text-xl font-bold">Campus Helper</span>
            </Link>
            {isAdmin && (
              <Link href="/admin/reports" className="hidden md:inline-flex">
                <Button
                  variant="default"
                  className="bg-white text-[#1e3a5f] hover:bg-[#d4af37] hover:text-[#1e3a5f] font-semibold border border-[#d4af37]"
                >
                  <Shield className="w-4 h-4 mr-2" />
                  Admin
                </Button>
              </Link>
            )}
          </div>

          <div className="hidden lg:flex items-center space-x-1 justify-center flex-shrink-0">
            <Link href="/jobs">
              <Button variant="ghost" className="text-white hover:text-[#d4af37] hover:bg-[#2a4a6f]">
                <Briefcase className="w-4 h-4 mr-2" />
                Jobs
              </Button>
            </Link>
            <Link href="/marketplace">
              <Button variant="ghost" className="text-white hover:text-[#d4af37] hover:bg-[#2a4a6f]">
                <ShoppingBag className="w-4 h-4 mr-2" />
                Marketplace
              </Button>
            </Link>
            <Link href="/forum">
              <Button variant="ghost" className="text-white hover:text-[#d4af37] hover:bg-[#2a4a6f]">
                <MessageSquare className="w-4 h-4 mr-2" />
                Forum
              </Button>
            </Link>
            <Link href="/search">
              <Button variant="ghost" className="text-white hover:text-[#d4af37] hover:bg-[#2a4a6f]">
                <Search className="w-4 h-4 mr-2" />
                Search
              </Button>
            </Link>
            <Link href="/ai-assistant">
              <Button
                variant="ghost"
                className="group relative overflow-hidden text-white hover:text-white bg-gradient-to-r from-purple-500 via-purple-600 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 border border-purple-300/50 shadow-[0_8px_30px_rgba(126,34,206,0.35)] transition-all duration-300 hover:-translate-y-0.5"
              >
                <span className="pointer-events-none absolute inset-[-10%] blur-2xl bg-purple-500/40 group-hover:bg-purple-400/50 transition-colors duration-500" />
                <span className="pointer-events-none absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-30 transition-opacity" />
                <span className="pointer-events-none absolute inset-0 translate-x-[-150%] bg-gradient-to-r from-transparent via-white/60 to-transparent opacity-70 animate-[shimmer_2.5s_ease-in-out_infinite]" />
                <span className="pointer-events-none absolute -inset-px rounded-lg border border-white/20 opacity-0 group-hover:opacity-80 transition-opacity duration-500 animate-[pulse_2.8s_ease-in-out_infinite]" />
                <Sparkles className="w-4 h-4 mr-2 drop-shadow-[0_0_10px_rgba(255,255,255,0.35)]" />
                AI
              </Button>
            </Link>
          </div>

          <div className="flex items-center gap-2 justify-end w-full sm:w-auto sm:flex-1 sm:min-w-0 lg:flex-1 lg:min-w-0">
            {isAuthed ? (
              <>
                <NotificationsDropdown />
                <Link href="/messages" aria-label="Messages">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-10 w-10 text-white hover:text-[#d4af37] hover:bg-[#2a4a6f]"
                  >
                    <MessageSquare className="w-5 h-5" />
                  </Button>
                </Link>
                <Link href="/profile">
                  <Button
                    variant="ghost"
                    className="text-white hover:text-[#d4af37] hover:bg-[#2a4a6f] flex items-center gap-2 h-10 px-2"
                  >
                    <Avatar className="h-8 w-8 border border-white/20 bg-white/10">
                      <AvatarFallback className="bg-[#d4af37] text-[#1e3a5f] text-xs font-semibold">
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                    <span className="hidden sm:inline">{displayName || 'Profile'}</span>
                  </Button>
                </Link>
                <Button
                  variant="outline"
                  className="border-white bg-white/10 text-white hover:bg-white hover:text-[#1e3a5f] hidden sm:inline-flex"
                  onClick={handleSignOut}
                  disabled={loading}
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <LogOut className="w-4 h-4" />}
                </Button>
              </>
            ) : (
              <>
                <Link href="/profile">
                  <Button variant="ghost" className="text-white hover:text-[#d4af37] hover:bg-[#2a4a6f]">
                    <User className="w-4 h-4 mr-2" />
                    <span className="hidden sm:inline">Profile</span>
                  </Button>
                </Link>
                <Link href="/sign-in">
                  <Button className="bg-[#d4af37] text-[#1e3a5f] hover:bg-[#c19b2e] font-semibold">
                    Sign In
                  </Button>
                </Link>
              </>
            )}
            <Button
              variant="ghost"
              size="icon"
              className="h-10 w-10 text-white hover:text-[#d4af37] hover:bg-[#2a4a6f] lg:hidden"
              aria-label="Toggle menu"
              onClick={() => setMobileOpen((prev) => !prev)}
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>
        {mobileOpen && (
          <div className="lg:hidden mt-3 space-y-2 border-t border-white/10 pt-3 pb-4">
            <div className="grid grid-cols-2 gap-3 px-1">
              <Link href="/jobs" onClick={() => setMobileOpen(false)}>
                <Button variant="ghost" className="w-full justify-center bg-white/10 text-white">
                  <Briefcase className="w-4 h-4 mr-2" />
                  Jobs
                </Button>
              </Link>
              <Link href="/marketplace" onClick={() => setMobileOpen(false)}>
                <Button variant="ghost" className="w-full justify-center bg-white/10 text-white">
                  <ShoppingBag className="w-4 h-4 mr-2" />
                  Market
                </Button>
              </Link>
              <Link href="/forum" onClick={() => setMobileOpen(false)}>
                <Button variant="ghost" className="w-full justify-center bg-white/10 text-white">
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Forum
                </Button>
              </Link>
              <Link href="/search" onClick={() => setMobileOpen(false)}>
                <Button variant="ghost" className="w-full justify-center bg-white/10 text-white">
                  <Search className="w-4 h-4 mr-2" />
                  Search
                </Button>
              </Link>
              <Link href="/ai-assistant" onClick={() => setMobileOpen(false)}>
                <Button className="w-full justify-center bg-gradient-to-r from-purple-500 via-purple-600 to-indigo-500 text-white border border-purple-300/50 shadow-[0_8px_20px_rgba(126,34,206,0.35)]">
                  <Sparkles className="w-4 h-4 mr-2" />
                  AI
                </Button>
              </Link>
              {isAuthed ? (
                <Button
                  className="w-full justify-center bg-white text-[#1e3a5f]"
                  onClick={() => {
                    setMobileOpen(false);
                    handleSignOut();
                  }}
                  disabled={loading}
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <LogOut className="w-4 h-4 mr-2" />}
                  Sign out
                </Button>
              ) : (
                <Link href="/sign-in" onClick={() => setMobileOpen(false)}>
                  <Button className="w-full justify-center bg-[#d4af37] text-[#1e3a5f]">Sign In</Button>
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
