import Link from 'next/link';
import { ShieldCheck, Lock, MapPin, CreditCard, MessageSquare, Users } from 'lucide-react';
import { Navigation } from '@/components/navigation';
import { Footer } from '@/components/footer';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

const tips = [
  {
    title: 'Meet in well-lit public places',
    description: 'Use campus common areas or other public spaces when handing off items or meeting for a job.',
    icon: MapPin,
  },
  {
    title: 'Keep payments traceable',
    description: 'Use documented payment methods instead of cash. Keep your receipts or screenshots.',
    icon: CreditCard,
  },
  {
    title: 'Protect your personal info',
    description: 'Share only what is necessary. Avoid sending IDs, passwords, or banking details in chat.',
    icon: Lock,
  },
  {
    title: 'Check profiles and reviews',
    description: 'Look at ratings or prior activity before agreeing to work or buy. Ask clarifying questions first.',
    icon: Users,
  },
  {
    title: 'Document agreements',
    description: 'Summarize the price, scope, and timeline in chat so you both have a written reference.',
    icon: MessageSquare,
  },
  {
    title: 'Report suspicious behavior',
    description: 'If something feels off, report the post or contact support with links and screenshots.',
    icon: ShieldCheck,
  },
];

export const metadata = {
  title: 'Safety Tips | Military Helper',
};

export default function SafetyTipsPage() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navigation />

      <main className="flex-1">
        <section className="relative overflow-hidden text-white py-14">
          <div className="absolute inset-0 bg-[#1b3a62]" />
          <div className="pointer-events-none absolute inset-0 blur-3xl">
            <div className="absolute -12 -16 h-64 w-64 rounded-full bg-[#1e3a5f] opacity-70 mix-blend-screen animate-[float_12s_ease-in-out_infinite]" />
            <div className="absolute right-0 top-8 h-80 w-80 rounded-full bg-[#d4af37] opacity-35 mix-blend-screen animate-[float_16s_ease-in-out_infinite]" />
            <div className="absolute left-1/2 top-14 h-[22rem] w-[22rem] -translate-x-1/2 rounded-full bg-[#1abc9c] opacity-30 mix-blend-screen animate-[float_18s_ease-in-out_infinite]" />
            <div className="absolute right-1/3 bottom-0 h-80 w-80 rounded-full bg-[#0b172a] opacity-28 mix-blend-screen animate-[float_20s_ease-in-out_infinite]" />
            <div className="absolute left-1/4 bottom-6 h-72 w-72 rounded-full bg-[#2b4f7b] opacity-26 mix-blend-screen animate-[float_22s_ease-in-out_infinite]" />
          </div>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(0,0,0,0.32),transparent_38%),radial-gradient(circle_at_80%_15%,rgba(21,44,74,0.4),transparent_38%),radial-gradient(circle_at_45%_85%,rgba(26,188,156,0.18),transparent_40%)] opacity-80" />
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <p className="uppercase text-sm tracking-widest text-[#f4d03f] font-semibold mb-2">Safety</p>
            <h1 className="text-4xl font-bold mb-3">Stay safe on and off campus</h1>
            <p className="text-lg text-gray-200 max-w-3xl">
              Use these quick checks whenever you post, buy, or meet with other students on Military Helper.
            </p>
          </div>
        </section>

        <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
          <div className="grid md:grid-cols-2 gap-6">
            {tips.map((tip, index) => {
              const Icon = tip.icon;
              return (
                <Card
                  key={tip.title}
                  className="border-2 border-gray-100 hover:border-[#d4af37] transition-shadow hover:shadow-2xl bg-white/90 backdrop-blur animate-fade-in-up"
                  style={{ animationDelay: `${index * 0.08}s` }}
                >
                  <CardHeader className="flex flex-row items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-[#1e3a5f] text-[#d4af37] flex items-center justify-center shadow">
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <CardTitle className="text-xl text-[#1e3a5f]">{tip.title}</CardTitle>
                      <CardDescription className="text-gray-600">{tip.description}</CardDescription>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0 text-sm text-gray-700 leading-relaxed">
                    Remember to trust your instincts. If a request seems too good to be true or feels rushed, pause and verify details before moving forward.
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
            <h2 className="text-2xl font-semibold text-[#1e3a5f] mb-3">If something goes wrong</h2>
            <p className="text-gray-700 mb-3">
              Save any chat history, receipts, and the link to the post. Share these with campus security if needed and let us know so we can review the account.
            </p>
            <p className="text-gray-700">
              Need help right now? Visit our <Link href="/support/contact" className="text-[#1e3a5f] font-semibold hover:text-[#d4af37]">Contact</Link> page and we will follow up as quickly as possible.
            </p>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
