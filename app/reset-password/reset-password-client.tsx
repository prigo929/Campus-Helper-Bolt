'use client';

import { FormEvent, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Lock, Mail } from 'lucide-react';
import { Navigation } from '@/components/navigation';
import { Footer } from '@/components/footer';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase';

type RecoveryTokens = {
  access_token: string | null;
  refresh_token: string | null;
};

export default function ResetPasswordClient() {
  const router = useRouter();
  const initialTokens: RecoveryTokens =
    typeof window !== 'undefined'
      ? (() => {
          const hashParams = new URLSearchParams(window.location.hash.slice(1));
          return {
            access_token: hashParams.get('access_token'),
            refresh_token: hashParams.get('refresh_token'),
          };
        })()
      : { access_token: null, refresh_token: null };

  const [tokens, setTokens] = useState<RecoveryTokens>(initialTokens);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isSettingSession, setIsSettingSession] = useState(
    Boolean(initialTokens.access_token && initialTokens.refresh_token)
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!supabase || !tokens.access_token || !tokens.refresh_token) return;
    let active = true;

    supabase.auth
      .setSession({ access_token: tokens.access_token, refresh_token: tokens.refresh_token })
      .then(({ error: setSessionError }) => {
        if (!active) return;
        if (setSessionError) {
          setError(setSessionError.message);
          return;
        }
        setTokens({ access_token: tokens.access_token, refresh_token: tokens.refresh_token });
      })
      .catch((err: unknown) => {
        if (!active) return;
        setError(err instanceof Error ? err.message : 'Could not restore the reset session.');
      })
      .finally(() => {
        if (active) setIsSettingSession(false);
      });

    return () => {
      active = false;
    };
  }, [tokens.access_token, tokens.refresh_token]);

  const handleUpdatePassword = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setMessage('');

    if (!supabase) {
      setError('Supabase is not configured. Add NEXT_PUBLIC_SUPABASE_* env vars.');
      return;
    }

    if (!tokens.access_token || !tokens.refresh_token) {
      setError('Use the password reset link from your email to continue.');
      return;
    }

    if (!newPassword || newPassword.length < 6) {
      setError('Enter a new password (at least 6 characters).');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setIsSubmitting(true);

    const { error: updateError } = await supabase.auth.updateUser({ password: newPassword });

    if (updateError) {
      setError(updateError.message);
    } else {
      setMessage('Password updated. You can now sign in.');
      router.push('/sign-in');
    }

    setIsSubmitting(false);
  };

  const hasTokens = Boolean(tokens.access_token && tokens.refresh_token);

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

          <div className="max-w-xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <Card className="border-2 border-white/20 bg-white/90 backdrop-blur shadow-2xl">
              <CardHeader className="space-y-2">
                <CardTitle className="text-2xl text-[#1e3a5f] flex items-center gap-2">
                  <Lock className="w-5 h-5" />
                  Reset your password
                </CardTitle>
                <CardDescription className="text-gray-600">
                  {hasTokens ? 'Choose a new password to secure your account.' : 'Use the reset link from your email to continue.'}
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

                <form className="space-y-4" onSubmit={handleUpdatePassword}>
                  <div className="space-y-2">
                    <Label htmlFor="new-password">New password</Label>
                    <Input
                      id="new-password"
                      type="password"
                      placeholder="Enter a new password"
                      className="h-11"
                      value={newPassword}
                      onChange={(event) => setNewPassword(event.target.value)}
                      disabled={!hasTokens || isSubmitting || isSettingSession}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirm-password">Confirm new password</Label>
                    <Input
                      id="confirm-password"
                      type="password"
                      placeholder="Re-enter your password"
                      className="h-11"
                      value={confirmPassword}
                      onChange={(event) => setConfirmPassword(event.target.value)}
                      disabled={!hasTokens || isSubmitting || isSettingSession}
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={!hasTokens || isSubmitting || isSettingSession}
                    className="w-full bg-[#1e3a5f] hover:bg-[#2a4a6f] text-white h-11 shadow-[0_15px_40px_rgba(30,58,95,0.35)]"
                  >
                    {isSettingSession ? 'Preparing...' : isSubmitting ? 'Updating...' : 'Update password'}
                  </Button>
                </form>

                {!hasTokens && (
                  <div className="rounded-md bg-blue-50 border border-blue-100 px-3 py-2 text-sm text-blue-900 flex items-start gap-2">
                    <Mail className="w-4 h-4 mt-0.5" />
                    <div>
                      <p className="font-semibold">Need a reset link?</p>
                      <p>
                        Start from the sign-in page and choose Forgot password? after entering your campus email. We will email you a secure link.
                      </p>
                    </div>
                  </div>
                )}

                <div className="text-sm text-center">
                  <Link href="/sign-in" className="font-semibold text-[#1e3a5f] hover:text-[#d4af37]">
                    Back to sign in
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
