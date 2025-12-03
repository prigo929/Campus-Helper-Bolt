'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';
import { ArrowLeft, Mail, MapPin, GraduationCap, Loader2, AlertCircle } from 'lucide-react';
import { Navigation } from '@/components/navigation';
import { Footer } from '@/components/footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { supabase, type Profile } from '@/lib/supabase';

export default function PublicProfilePage() {
  return (
    <Suspense fallback={<ProfileSuspenseFallback />}>
      <PublicProfileContent />
    </Suspense>
  );
}

function PublicProfileContent() {
  const router = useRouter();
  const params = useSearchParams();
  const id = params.get('id') || '';

  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      if (!id || !supabase) {
        setError('Profile not available.');
        setLoading(false);
        return;
      }

      const { data, error: fetchError } = await supabase
        .from('profiles')
        .select('id, email, full_name, university, major, year, rating, total_ratings, bio, created_at')
        .eq('id', id)
        .single();

      if (fetchError) {
        setError(fetchError.message);
      } else {
        setProfile(data);
      }
      setLoading(false);
    };
    load();
  }, [id]);

  const initials = (profile?.full_name || profile?.email || 'CH')
    .split(' ')
    .filter(Boolean)
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navigation />
      <main className="flex-1">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Button variant="ghost" className="text-[#1e3a5f] hover:text-[#d4af37] mb-4" onClick={() => router.back()}>
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back
          </Button>

          <Card className="border-2">
            <CardHeader>
              <CardTitle className="text-2xl text-[#1e3a5f]">Profile</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {loading && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Loading profile...
                </div>
              )}
              {error && (
                <div className="flex items-start gap-2 text-sm text-red-700 bg-red-50 border border-red-200 px-3 py-2 rounded-md">
                  <AlertCircle className="w-4 h-4 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              {profile && (
                <>
                  <div className="flex items-center gap-4">
                    <Avatar className="w-14 h-14 border-2 border-[#d4af37]">
                      <AvatarFallback className="bg-[#d4af37] text-[#1e3a5f] font-semibold">
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h1 className="text-xl font-semibold text-[#1e3a5f]">{profile.full_name}</h1>
                      <p className="text-sm text-gray-600">{profile.email}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge className="bg-[#d4af37] text-[#1e3a5f]">
                          {profile.rating?.toFixed(1) || '0.0'} ({profile.total_ratings} reviews)
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-3 text-sm text-gray-700">
                    <div className="flex items-center gap-2">
                      <GraduationCap className="w-4 h-4" />
                      {profile.major || 'Major not set'}
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      {profile.university || 'University'}
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4" />
                      {profile.year || 'Year not set'}
                    </div>
                  </div>

                  <div>
                    <h2 className="text-lg font-semibold text-[#1e3a5f] mb-1">About</h2>
                    <p className="text-gray-700">{profile.bio || 'No bio yet.'}</p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
}

function ProfileSuspenseFallback() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navigation />
      <main className="flex-1">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading profile...
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
