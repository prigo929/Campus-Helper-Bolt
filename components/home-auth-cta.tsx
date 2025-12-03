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
            className="group relative overflow-hidden bg-[#d4af37] text-[#1e3a5f] hover:bg-[#c19b2e] font-semibold text-lg px-8 shadow-[0_15px_40px_rgba(212,175,55,0.35)] transition-transform duration-300 hover:-translate-y-0.5"
          >
            <span className="pointer-events-none absolute inset-0 bg-white/30 opacity-0 group-hover:opacity-20 transition-opacity" />
            <span className="pointer-events-none absolute inset-0 translate-x-[-150%] bg-gradient-to-r from-transparent via-white/50 to-transparent opacity-60 group-hover:opacity-90 animate-[shimmer_4s_ease-in-out_infinite]" />
            Post a Job
          </Button>
        </Link>
        <Link href="/marketplace/create">
          <Button
            size="lg"
            variant="outline"
            className="relative overflow-hidden border-2 border-white/80 text-white hover:bg-white hover:text-[#1e3a5f] font-semibold text-lg px-8 backdrop-blur bg-white/10 transition-transform duration-300 hover:-translate-y-0.5"
          >
            List Study Material
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
          className="group relative overflow-hidden bg-[#d4af37] text-[#1e3a5f] hover:bg-[#c19b2e] font-semibold text-lg px-8 shadow-[0_15px_40px_rgba(212,175,55,0.35)] transition-transform duration-300 hover:-translate-y-0.5"
        >
          <span className="pointer-events-none absolute inset-0 bg-white/30 opacity-0 group-hover:opacity-20 transition-opacity" />
          <span className="pointer-events-none absolute inset-0 translate-x-[-150%] bg-gradient-to-r from-transparent via-white/50 to-transparent opacity-60 group-hover:opacity-90 animate-[shimmer_4s_ease-in-out_infinite]" />
          Get Started
        </Button>
      </Link>
      <Link href="/support">
        <Button
          size="lg"
          variant="outline"
          className="relative overflow-hidden border-2 border-white/80 text-white hover:bg-white hover:text-[#1e3a5f] font-semibold text-lg px-8 backdrop-blur bg-white/10 transition-transform duration-300 hover:-translate-y-0.5"
        >
          Learn More
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
          <h2 className="text-3xl md:text-4xl font-bold text-[#1e3a5f] mb-6">Jump back in</h2>
          <p className="text-lg text-gray-600 mb-8">
            Post a new job, list study materials, or keep exploring what&apos;s new on campus.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/jobs/create">
              <Button
                size="lg"
                className="group relative overflow-hidden bg-[#d4af37] text-[#1e3a5f] hover:bg-[#c19b2e] font-semibold text-lg px-8 shadow-[0_15px_40px_rgba(212,175,55,0.35)] transition-transform duration-300 hover:-translate-y-0.5"
              >
                <span className="pointer-events-none absolute inset-0 bg-white/30 opacity-0 group-hover:opacity-20 transition-opacity" />
                Post a Job
              </Button>
            </Link>
            <Link href="/marketplace/create">
              <Button
                size="lg"
                variant="outline"
                className="relative overflow-hidden border-2 border-[#1e3a5f] text-[#1e3a5f] hover:bg-[#1e3a5f] hover:text-white font-semibold text-lg px-8 backdrop-blur bg-white transition-transform duration-300 hover:-translate-y-0.5"
              >
                List an Item
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
        <h2 className="text-3xl md:text-4xl font-bold text-[#1e3a5f] mb-6">Ready to Get Started?</h2>
        <p className="text-lg text-gray-600 mb-8">Join your campus community today and discover opportunities.</p>
        <Link href="/sign-up">
          <Button
            size="lg"
            className="group relative overflow-hidden bg-[#d4af37] text-[#1e3a5f] hover:bg-[#c19b2e] font-semibold text-lg px-10 shadow-[0_15px_40px_rgba(212,175,55,0.35)]"
          >
            <span className="pointer-events-none absolute inset-0 bg-white/30 opacity-0 group-hover:opacity-20 transition-opacity" />
            Create Your Account
          </Button>
        </Link>
      </div>
    </section>
  );
}
