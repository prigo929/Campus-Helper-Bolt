import type { Metadata } from 'next';
import { Sparkles, Shield, MessageSquare } from 'lucide-react';
import { Navigation } from '@/components/navigation';
import { Footer } from '@/components/footer';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AiChatPanel } from '@/components/ai-chat-panel';

export const metadata: Metadata = {
  title: 'AI Assistant | Campus Helper',
  description: 'Chat with the Campus Helper AI to draft posts, improve listings, and get quick campus tips.',
};

export default function AiAssistantPage() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-gray-50 via-white to-indigo-50 relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-10 -top-16 h-72 w-72 rounded-full bg-purple-400/30 blur-3xl animate-pulse" />
        <div className="absolute right-0 top-10 h-80 w-80 rounded-full bg-indigo-400/25 blur-3xl animate-[pulse_4s_ease-in-out_infinite]" />
        <div className="absolute -bottom-24 left-1/2 h-96 w-96 rounded-full bg-purple-500/20 blur-[120px] animate-[pulse_5s_ease-in-out_infinite]" />
        <div className="absolute inset-0 opacity-50 bg-[radial-gradient(circle_at_30%_20%,rgba(147,51,234,0.08),transparent_30%),radial-gradient(circle_at_80%_10%,rgba(79,70,229,0.08),transparent_30%),radial-gradient(circle_at_50%_80%,rgba(59,130,246,0.07),transparent_35%)] animate-[pulse_6s_ease-in-out_infinite]" />
      </div>
      <Navigation />

      <main className="flex-1">
        <section className="py-12">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
            <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-[#1e3a5f] via-[#1f3f65] to-[#162b48] text-white shadow-2xl ring-1 ring-white/10">
              <span className="pointer-events-none absolute inset-[-12%] bg-gradient-to-r from-purple-500/16 via-white/8 to-indigo-400/16 blur-3xl animate-[pulse_5.5s_ease-in-out_infinite]" />
              <span className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_15%,rgba(255,255,255,0.12),transparent_35%),radial-gradient(circle_at_85%_20%,rgba(236,72,153,0.1),transparent_40%),radial-gradient(circle_at_50%_85%,rgba(129,140,248,0.1),transparent_35%)] opacity-80" />
              <span className="pointer-events-none absolute inset-0 bg-[linear-gradient(120deg,rgba(255,255,255,0.06)_1px,transparent_1px),linear-gradient(-120deg,rgba(236,72,153,0.05)_1px,transparent_1px)] bg-[length:26px_26px] opacity-40" />
              <span className="pointer-events-none absolute inset-x-10 top-6 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent opacity-70" />
              <CardContent className="p-6 md:p-8 space-y-4 relative z-10">
                <Badge className="bg-white/15 text-white border-white/30 w-fit">New</Badge>
                <h1 className="text-3xl md:text-4xl font-bold leading-tight flex items-center gap-3">
                  <span className="relative">
                    <span className="pointer-events-none absolute inset-0 blur-lg bg-purple-400/60 animate-pulse" />
                    <Sparkles className="w-7 h-7 text-[#f4d03f] relative drop-shadow-[0_0_12px_rgba(255,255,255,0.5)]" />
                  </span>
                  Campus Helper AI
                </h1>
                <p className="text-lg text-gray-200 max-w-3xl">
                  Draft job posts, improve marketplace listings, and get forum replies faster with the Next.js AI SDK,
                  running securely on Vercel.
                </p>
                <div className="flex flex-wrap gap-3 text-sm text-white/90">
                  <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1">
                    <MessageSquare className="w-4 h-4 text-[#f4d03f]" />
                    Streaming responses
                  </span>
                  <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1">
                    <Shield className="w-4 h-4 text-[#f4d03f]" />
                    Campus-safe guidance
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
