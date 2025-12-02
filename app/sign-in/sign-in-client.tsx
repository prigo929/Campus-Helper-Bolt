'use client';

import { FormEvent, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Shield, Sparkles, KeyRound } from 'lucide-react';
import { Navigation } from '@/components/navigation';
import { Footer } from '@/components/footer';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase';
import { ensureProfileExists } from '@/lib/profile';

export default function SignInClient() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleResetPassword = async () => {
    setError('');
    setMessage('');

    if (!supabase) {
      setError('Supabase is not configured. Add NEXT_PUBLIC_SUPABASE_* env vars.');
      return;
    }

    if (!email.trim()) {
      setError('Enter your campus email to reset your password.');
      return;
    }

    setIsSubmitting(true);

    const redirectTo = typeof window !== 'undefined' ? `${window.location.origin}/reset-password` : undefined;
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo,
    });

    if (resetError) {
      setError(resetError.message);
    } else {
      setMessage('Check your email for a link to reset your password.');
    }

    setIsSubmitting(false);
  };

  const handleSignIn = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setMessage('');

    if (!supabase) {
      setError('Supabase is not configured. Add NEXT_PUBLIC_SUPABASE_* env vars.');
      return;
    }

    if (!email.trim() || !password) {
      setError('Enter your email and password to continue.');
      return;
    }

    setIsSubmitting(true);

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    if (signInError) {
      setError(signInError.message);
      setIsSubmitting(false);
      return;
    }

    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();

    if (sessionError) {
      setError(sessionError.message);
      setIsSubmitting(false);
      return;
    }

    try {
      await ensureProfileExists(supabase, sessionData.session, { email: email.trim() });
    } catch (profileError) {
      console.error('Profile setup failed after sign-in', profileError);
      setError('Signed in, but we could not load your profile. Try again.');
      setIsSubmitting(false);
      return;
    }

    setMessage('Signed in! Redirecting...');
    router.push('/');
    router.refresh();
    setIsSubmitting(false);
  };

  const handleMagicLink = async () => {
    setError('');
    setMessage('');

    if (!supabase) {
      setError('Supabase is not configured. Add NEXT_PUBLIC_SUPABASE_* env vars.');
      return;
    }

    if (!email.trim()) {
      setError('Enter your campus email to receive a sign-in link.');
      return;
    }

    setIsSubmitting(true);

    const { error: otpError } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: {
        shouldCreateUser: false,
        emailRedirectTo: typeof window !== 'undefined' ? `${window.location.origin}/` : undefined,
      },
    });

    if (otpError) {
      setError(otpError.message);
    } else {
      setMessage('Check your email for a magic sign-in link.');
    }

    setIsSubmitting(false);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navigation />

      <main className="flex-1">
        <section className="relative overflow-hidden bg-gradient-to-br from-[#1e3a5f] via-[#243f66] to-[#1e3a5f] text-white py-16">
          <div className="pointer-events-none absolute inset-0 opacity-80 bg-[radial-gradient(circle_at_15%_25%,rgba(244,208,63,0.28),transparent_35%),radial-gradient(circle_at_85%_15%,rgba(255,255,255,0.18),transparent_35%),radial-gradient(circle_at_50%_90%,rgba(15,31,51,0.55),transparent_40%)] bg-[length:160%_160%] animate-gradient-move" />
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute -left-10 -top-16 h-52 w-52 rounded-full bg-gradient-to-br from-[#d4af37] to-[#f4d03f] blur-3xl opacity-70 animate-float" />
            <div className="absolute right-0 top-6 h-60 w-60 rounded-full bg-gradient-to-br from-white/40 via-transparent to-[#d4af37]/25 blur-3xl opacity-70 animate-float" />
            <div className="absolute -bottom-12 left-1/2 h-60 w-60 rounded-full bg-gradient-to-br from-[#0f1f33] via-transparent to-transparent blur-3xl opacity-60 animate-float" />
          </div>

          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="grid lg:grid-cols-2 gap-10 items-center">
              <div className="space-y-4 animate-fade-in-up">
                <p className="uppercase text-sm tracking-widest text-[#f4d03f] font-semibold">Welcome back</p>
                <h1 className="text-4xl md:text-5xl font-bold leading-tight">
                  Sign in to reconnect
                  <span className="text-[#d4af37]"> with campus</span>
                </h1>
                <p className="text-lg text-gray-200 max-w-xl">
                  Access jobs, marketplace deals, and your forum threads in one place. Keep your campus network moving.
                </p>

                <div className="grid sm:grid-cols-3 gap-3 pt-2">
                  <div className="flex items-center gap-2 bg-white/10 border border-white/10 rounded-lg px-3 py-2 backdrop-blur animate-fade-in-up" style={{ animationDelay: '0.05s' }}>
                    <Shield className="w-5 h-5 text-[#f4d03f]" />
                    <span className="text-sm">Safe & verified</span>
                  </div>
                  <div className="flex items-center gap-2 bg-white/10 border border-white/10 rounded-lg px-3 py-2 backdrop-blur animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
                    <Sparkles className="w-5 h-5 text-[#f4d03f]" />
                    <span className="text-sm">Modern experience</span>
                  </div>
                  <div className="flex items-center gap-2 bg-white/10 border border-white/10 rounded-lg px-3 py-2 backdrop-blur animate-fade-in-up" style={{ animationDelay: '0.15s' }}>
                    <KeyRound className="w-5 h-5 text-[#f4d03f]" />
                    <span className="text-sm">Fast access</span>
                  </div>
                </div>
              </div>

              <div className="animate-fade-in-up" style={{ animationDelay: '0.12s' }}>
                <Card className="border-2 border-white/20 bg-white/90 backdrop-blur shadow-2xl">
                  <CardHeader className="space-y-2">
                    <CardTitle className="text-2xl text-[#1e3a5f]">Sign in</CardTitle>
                    <CardDescription className="text-gray-600">
                      Use your campus email to stay verified across jobs, marketplace, and forum.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {error && (
                      <div className="rounded-md bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-700">
                        {error}
                      </div>
                    )}
                    {message && (
                      <div className="rounded-md bg-green-50 border border-green-200 px-3 py-2 text-sm text-green-800">
                        {message}
                      </div>
                    )}
                    <form className="space-y-4" onSubmit={handleSignIn}>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          type="email"
                          placeholder="you@university.edu"
                          className="h-11"
                          value={email}
                          autoComplete="email"
                          onChange={(event) => setEmail(event.target.value)}
                          disabled={isSubmitting}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="password">Password</Label>
                        <Input
                          id="password"
                          type="password"
                          placeholder="********"
                          className="h-11"
                          value={password}
                          autoComplete="current-password"
                          onChange={(event) => setPassword(event.target.value)}
                          disabled={isSubmitting}
                        />
                      </div>

                      <div className="flex items-center justify-between text-sm">
                        <div className="text-gray-500">Need an account?</div>
                        <Link href="/sign-up" className="font-semibold text-[#1e3a5f] hover:text-[#d4af37]">
                          Create one
                        </Link>
                      </div>

                      <Button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full bg-[#1e3a5f] hover:bg-[#2a4a6f] text-white h-11 shadow-[0_15px_40px_rgba(30,58,95,0.35)]"
                      >
                        {isSubmitting ? 'Signing in...' : 'Sign in'}
                      </Button>

                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleMagicLink}
                        disabled={isSubmitting}
                        className="w-full border-2 border-[#d4af37] text-[#1e3a5f] hover:bg-[#d4af37] hover:text-[#1e3a5f] h-11"
                      >
                        {isSubmitting ? 'Sending link...' : 'Continue with campus email'}
                      </Button>

                      <button
                        type="button"
                        onClick={handleResetPassword}
                        disabled={isSubmitting}
                        className="text-sm text-[#1e3a5f] hover:text-[#d4af37] text-center block w-full"
                      >
                        Forgot password?
                      </button>
                    </form>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
