'use client';

import { FormEvent, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { User, Loader2, AlertCircle } from 'lucide-react';
import { Navigation } from '@/components/navigation';
import { Footer } from '@/components/footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/lib/supabase';
import { ensureProfileExists } from '@/lib/profile';
import type { Session } from '@supabase/supabase-js';

export default function EditProfilePage() {
  const router = useRouter();
  const [session, setSession] = useState<Session | null>(null);
  const supabaseConfigured = Boolean(supabase);
  const [checkingSession, setCheckingSession] = useState(() => supabaseConfigured);
  const [loadingProfile, setLoadingProfile] = useState(() => supabaseConfigured);

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [university, setUniversity] = useState('');
  const [major, setMajor] = useState('');
  const [year, setYear] = useState('');
  const [bio, setBio] = useState('');

  const [error, setError] = useState(() =>
    supabaseConfigured ? '' : 'Supabase is not configured. Add NEXT_PUBLIC_SUPABASE_* env vars.'
  );
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const client = supabase;
    if (!client) return;
    let active = true;

    const loadProfile = async () => {
      const { data, error: sessionError } = await client.auth.getSession();
      if (!active) return;
      if (sessionError) {
        setError(sessionError.message);
        setCheckingSession(false);
        setLoadingProfile(false);
        return;
      }

      if (!data.session?.user) {
        setError('Please sign in to edit your profile.');
        setCheckingSession(false);
        setLoadingProfile(false);
        router.push('/sign-in');
        return;
      }

      setSession(data.session);
      try {
        await ensureProfileExists(client, data.session);
      } catch (profileError) {
        console.error('Profile auto-create failed', profileError);
      }

      const { data: profileData, error: profileError } = await client
        .from('profiles')
        .select('email, full_name, university, major, year, bio')
        .eq('id', data.session.user.id)
        .single();

      if (profileError) {
        setError(profileError.message);
      } else if (profileData) {
        setFullName(profileData.full_name || '');
        setEmail(profileData.email || data.session.user.email || '');
        setUniversity(profileData.university || '');
        setMajor(profileData.major || '');
        setYear(profileData.year || '');
        setBio(profileData.bio || '');
      }

      setCheckingSession(false);
      setLoadingProfile(false);
    };

    loadProfile();

    return () => {
      active = false;
    };
  }, [router]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setMessage('');

    const client = supabase;
    if (!client) {
      setError('Supabase is not configured. Add NEXT_PUBLIC_SUPABASE_* env vars.');
      return;
    }

    if (!session?.user) {
      setError('Please sign in to edit your profile.');
      return;
    }

    if (!fullName.trim() || !university.trim()) {
      setError('Name and university are required.');
      return;
    }

    setIsSubmitting(true);

    const updates = {
      full_name: fullName.trim(),
      email: email.trim() || session.user.email,
      university: university.trim(),
      major: major.trim(),
      year: year.trim(),
      bio: bio.trim(),
    };

    const { error: updateError } = await client
      .from('profiles')
      .update(updates)
      .eq('id', session.user.id);

    if (updateError) {
      setError(updateError.message);
      setIsSubmitting(false);
      return;
    }

    // Keep auth metadata loosely in sync for downstream usage.
    await client.auth.updateUser({
      data: {
        full_name: updates.full_name,
        university: updates.university,
        major: updates.major,
        year: updates.year,
      },
    });

    setMessage('Profile updated.');
    setIsSubmitting(false);
    router.push('/profile');
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navigation />

      <main className="flex-1">
        <div className="relative overflow-hidden bg-gradient-to-br from-[#1e3a5f] via-[#243f66] to-[#1e3a5f] text-white py-12">
          <div className="pointer-events-none absolute inset-0 opacity-80 bg-[radial-gradient(circle_at_15%_25%,rgba(244,208,63,0.28),transparent_35%),radial-gradient(circle_at_85%_15%,rgba(255,255,255,0.18),transparent_35%),radial-gradient(circle_at_50%_90%,rgba(15,31,51,0.55),transparent_40%)] bg-[length:160%_160%] animate-gradient-move" />
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute -left-10 -top-16 h-52 w-52 rounded-full bg-gradient-to-br from-[#d4af37] to-[#f4d03f] blur-3xl opacity-70 animate-float" />
            <div className="absolute right-0 top-6 h-60 w-60 rounded-full bg-gradient-to-br from-white/40 via-transparent to-[#d4af37]/25 blur-3xl opacity-70 animate-float" />
          </div>
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-lg bg-white/15 backdrop-blur flex items-center justify-center">
                <User className="w-6 h-6 text-[#f4d03f]" />
              </div>
              <div>
                <p className="uppercase text-sm tracking-widest text-[#f4d03f] font-semibold">Profile</p>
                <h1 className="text-3xl font-bold">Edit Profile</h1>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Card className="border-2">
            <CardHeader>
              <CardTitle className="text-xl text-[#1e3a5f]">Your details</CardTitle>
              <CardDescription>Update how classmates see you across jobs, marketplace, and forum.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {(checkingSession || loadingProfile) && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Loading your profile...
                </div>
              )}
              {error && (
                <div className="rounded-md bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-700 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}
              {message && (
                <div className="rounded-md bg-green-50 border border-green-200 px-3 py-2 text-sm text-green-800">
                  {message}
                </div>
              )}

              <form className="space-y-4" onSubmit={handleSubmit}>
                <div className="space-y-2">
                  <Label htmlFor="full-name">Full name</Label>
                  <Input
                    id="full-name"
                    placeholder="Jordan Kim"
                    value={fullName}
                    onChange={(event) => setFullName(event.target.value)}
                    disabled={isSubmitting || loadingProfile}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@university.edu"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    disabled={isSubmitting || loadingProfile}
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="university">University</Label>
                    <Input
                      id="university"
                      placeholder="State University"
                      value={university}
                      onChange={(event) => setUniversity(event.target.value)}
                      disabled={isSubmitting || loadingProfile}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="major">Major</Label>
                    <Input
                      id="major"
                      placeholder="Computer Science"
                      value={major}
                      onChange={(event) => setMajor(event.target.value)}
                      disabled={isSubmitting || loadingProfile}
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="year">Year</Label>
                    <Input
                      id="year"
                      placeholder="Junior"
                      value={year}
                      onChange={(event) => setYear(event.target.value)}
                      disabled={isSubmitting || loadingProfile}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="bio">Bio</Label>
                    <Textarea
                      id="bio"
                      placeholder="Tell classmates about your interests, skills, and what you're looking for."
                      value={bio}
                      onChange={(event) => setBio(event.target.value)}
                      rows={4}
                      disabled={isSubmitting || loadingProfile}
                    />
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Button type="submit" disabled={isSubmitting || checkingSession || loadingProfile} className="bg-[#1e3a5f] text-white hover:bg-[#2a4a6f]">
                    {isSubmitting ? 'Saving...' : 'Save changes'}
                  </Button>
                  <Button type="button" variant="outline" onClick={() => router.push('/profile')}>
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
}
