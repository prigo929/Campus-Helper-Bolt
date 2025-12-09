'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useAuthStatus } from '@/hooks/use-auth-status';

export function HomeHeroActions() {
  const { isAuthed } = useAuthStatus();

  if (isAuthed) {
    return (
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Link href="/jobs/create">
          <Button
            size="lg"
            className="group relative overflow-hidden bg-[#caa35d] text-[#0f1c16] hover:bg-[#a57c2c] font-semibold text-lg px-8 shadow-[0_15px_40px_rgba(0,0,0,0.45)] transition-transform duration-300 hover:-translate-y-0.5"
          >
            <span className="pointer-events-none absolute inset-0 bg-white/30 opacity-0 group-hover:opacity-20 transition-opacity" />
            <span className="pointer-events-none absolute inset-0 translate-x-[-150%] bg-gradient-to-r from-transparent via-white/50 to-transparent opacity-60 group-hover:opacity-90 animate-[shimmer_4s_ease-in-out_infinite]" />
            Launch a mission
          </Button>
        </Link>
        <Link href="/marketplace/create">
          <Button
            size="lg"
            variant="outline"
            className="relative overflow-hidden border-2 border-[#caa35d] text-[#f1df9c] hover:bg-[#caa35d] hover:text-[#0f1c16] font-semibold text-lg px-8 backdrop-blur bg-white/5 transition-transform duration-300 hover:-translate-y-0.5"
          >
            List supply
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col sm:flex-row gap-4 justify-center">
      <Link href="/sign-up">
        <Button
          size="lg"
          className="group relative overflow-hidden bg-[#caa35d] text-[#0f1c16] hover:bg-[#a57c2c] font-semibold text-lg px-8 shadow-[0_15px_40px_rgba(0,0,0,0.45)] transition-transform duration-300 hover:-translate-y-0.5"
        >
          <span className="pointer-events-none absolute inset-0 bg-white/30 opacity-0 group-hover:opacity-20 transition-opacity" />
          <span className="pointer-events-none absolute inset-0 translate-x-[-150%] bg-gradient-to-r from-transparent via-white/50 to-transparent opacity-60 group-hover:opacity-90 animate-[shimmer_4s_ease-in-out_infinite]" />
          Enter the ready-room
        </Button>
      </Link>
      <Link href="/support">
        <Button
          size="lg"
          variant="outline"
          className="relative overflow-hidden border-2 border-[#caa35d] text-[#f1df9c] hover:bg-[#caa35d] hover:text-[#0f1c16] font-semibold text-lg px-8 backdrop-blur bg-white/5 transition-transform duration-300 hover:-translate-y-0.5"
        >
          Tour the platform
        </Button>
      </Link>
    </div>
  );
}

export function HomeFinalCta() {
  const { isAuthed } = useAuthStatus();

  if (isAuthed) {
    return (
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-[#f1df9c] mb-6">Jump back into the fight</h2>
          <p className="text-lg text-[#d9c8a5]/80 mb-8">
            Post a new mission, list fresh kit, or push a briefing to keep everyone synced.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/jobs/create">
              <Button
                size="lg"
                className="group relative overflow-hidden bg-[#caa35d] text-[#0f1c16] hover:bg-[#a57c2c] font-semibold text-lg px-8 shadow-[0_15px_40px_rgba(0,0,0,0.45)] transition-transform duration-300 hover:-translate-y-0.5"
              >
                <span className="pointer-events-none absolute inset-0 bg-white/30 opacity-0 group-hover:opacity-20 transition-opacity" />
                Post a mission
              </Button>
            </Link>
            <Link href="/marketplace/create">
              <Button
                size="lg"
                variant="outline"
                className="relative overflow-hidden border-2 border-[#caa35d] text-[#f1df9c] hover:bg-[#caa35d] hover:text-[#0f1c16] font-semibold text-lg px-8 backdrop-blur bg-white/5 transition-transform duration-300 hover:-translate-y-0.5"
              >
                List supply
              </Button>
            </Link>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-[#f1df9c] mb-6">Ready for your next op?</h2>
        <p className="text-lg text-[#d9c8a5]/80 mb-8">Join Military Helper, trade gear, and rally your crew with Desert Storm energy.</p>
        <Link href="/sign-up">
          <Button
            size="lg"
            className="group relative overflow-hidden bg-[#caa35d] text-[#0f1c16] hover:bg-[#a57c2c] font-semibold text-lg px-10 shadow-[0_15px_40px_rgba(0,0,0,0.45)]"
          >
            <span className="pointer-events-none absolute inset-0 bg-white/30 opacity-0 group-hover:opacity-20 transition-opacity" />
            Create your account
          </Button>
        </Link>
      </div>
    </section>
  );
}
