'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { Briefcase, ShoppingBag, MessageSquare, User, LogOut, Loader2, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { supabase } from '@/lib/supabase';

export function Navigation() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [isAuthed, setIsAuthed] = useState(false);
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);

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
    setLoading(false);
    router.refresh();
  };

  return (
    <nav className="bg-[#1e3a5f] text-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-[#d4af37] to-[#f4d03f] rounded-lg flex items-center justify-center font-bold text-[#1e3a5f]">
              CH
            </div>
            <span className="text-xl font-bold">Campus Helper</span>
          </Link>

          <div className="hidden md:flex items-center space-x-1">
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
          </div>

          <div className="flex items-center space-x-2">
            {isAuthed ? (
              <>
                {isAdmin && (
                  <Link href="/admin/reports">
                    <Button variant="outline" className="border-white/60 text-white hover:bg-white hover:text-[#1e3a5f]">
                      <Shield className="w-4 h-4 mr-2" />
                      Admin
                    </Button>
                  </Link>
                )}
                <Link href="/profile">
                  <Button variant="ghost" className="text-white hover:text-[#d4af37] hover:bg-[#2a4a6f] flex items-center gap-2">
                    <Avatar className="h-7 w-7 border border-white/20 bg-white/10">
                      <AvatarFallback className="bg-[#d4af37] text-[#1e3a5f] text-xs font-semibold">
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                    <span className="hidden sm:inline">{displayName || 'Profile'}</span>
                  </Button>
                </Link>
                <Button
                  variant="outline"
                  className="border-white bg-white/10 text-white hover:bg-white hover:text-[#1e3a5f]"
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
          </div>
        </div>
      </div>
    </nav>
  );
}
