import type { Metadata } from 'next';
import { Sparkles, Shield, MessageSquare } from 'lucide-react';
import { Navigation } from '@/components/navigation';
import { Footer } from '@/components/footer';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AiChatPanel } from '@/components/ai-chat-panel';

export const metadata: Metadata = {
  title: 'AI Assistant | Military Helper',
  description: 'Chat with the Military Helper AI to draft mission briefs, tighten supply listings, and get quick field tips.',
};

export default function AiAssistantPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#0b0f0c] relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-10 -top-16 h-72 w-72 rounded-full bg-[#caa35d]/20 blur-3xl animate-pulse" />
        <div className="absolute right-0 top-10 h-80 w-80 rounded-full bg-[#2c3b29]/35 blur-3xl animate-[pulse_4s_ease-in-out_infinite]" />
        <div className="absolute -bottom-24 left-1/2 h-96 w-96 rounded-full bg-[#b66b2e]/25 blur-[120px] animate-[pulse_5s_ease-in-out_infinite]" />
        <div className="absolute inset-0 opacity-50 bg-[radial-gradient(circle_at_30%_20%,rgba(202,163,93,0.14),transparent_30%),radial-gradient(circle_at_80%_10%,rgba(182,107,46,0.12),transparent_30%),radial-gradient(circle_at_50%_80%,rgba(44,59,41,0.16),transparent_35%)] animate-[pulse_6s_ease-in-out_infinite]" />
      </div>
      <Navigation />

      <main className="flex-1">
        <section className="py-12">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
            <Card className="relative overflow-hidden border border-[#caa35d]/30 bg-gradient-to-br from-[#0f1c16] via-[#1f2a1c] to-[#0b0f0c] text-[#f1df9c] shadow-2xl ring-1 ring-[#caa35d]/20">
              <span className="pointer-events-none absolute inset-[-12%] bg-gradient-to-r from-[#caa35d]/16 via-white/8 to-[#2c3b29]/18 blur-3xl animate-[pulse_5.5s_ease-in-out_infinite]" />
              <span className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_15%,rgba(255,255,255,0.12),transparent_35%),radial-gradient(circle_at_85%_20%,rgba(202,163,93,0.12),transparent_40%),radial-gradient(circle_at_50%_85%,rgba(44,59,41,0.2),transparent_35%)] opacity-80" />
              <span className="pointer-events-none absolute inset-0 bg-[linear-gradient(120deg,rgba(255,255,255,0.06)_1px,transparent_1px),linear-gradient(-120deg,rgba(202,163,93,0.05)_1px,transparent_1px)] bg-[length:26px_26px] opacity-40" />
              <span className="pointer-events-none absolute inset-x-10 top-6 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent opacity-70" />
              <CardContent className="p-6 md:p-8 space-y-4 relative z-10">
                <Badge className="bg-white/10 text-[#f1df9c] border-[#caa35d]/40 w-fit">Ready-room</Badge>
                <h1 className="text-3xl md:text-4xl font-bold leading-tight flex items-center gap-3">
                  <span className="relative">
                    <span className="pointer-events-none absolute inset-0 blur-lg bg-[#caa35d]/60 animate-pulse" />
                    <Sparkles className="w-7 h-7 text-[#caa35d] relative drop-shadow-[0_0_12px_rgba(255,255,255,0.35)]" />
                  </span>
                  Military Helper AI
                </h1>
                <p className="text-lg text-[#d9c8a5]/85 max-w-3xl">
                  Draft mission posts, tighten supply listings, and push field briefings faster with the Next.js AI SDK,
                  running securely on Vercel.
                </p>
                <div className="flex flex-wrap gap-3 text-sm text-[#f1df9c]">
                  <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 border border-[#caa35d]/30">
                    <MessageSquare className="w-4 h-4 text-[#caa35d]" />
                    Streaming responses for briefs
                  </span>
                  <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 border border-[#caa35d]/30">
                    <Shield className="w-4 h-4 text-[#caa35d]" />
                    Field-safe guidance
                  </span>
                </div>
              </CardContent>
            </Card>

            <AiChatPanel />
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
