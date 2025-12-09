import Link from 'next/link';
import { Mail, MessageSquare, Clock } from 'lucide-react';
import { Navigation } from '@/components/navigation';
import { Footer } from '@/components/footer';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

const contactOptions = [
  {
    title: 'Email support',
    description: 'Send details, links, and screenshots so we can troubleshoot quickly.',
    value: 'support@militaryhelper.com',
    href: 'mailto:support@militaryhelper.com',
    icon: Mail,
  },
  {
    title: 'Chat with us',
    description: 'Share your question or report and we will route it to the right teammate.',
    value: 'Message support',
    href: '/support/help-center',
    icon: MessageSquare,
  },
  {
    title: 'Response times',
    description: 'We answer most requests within one business day. Urgent safety issues are prioritized.',
    value: 'Mon-Fri, 9am-5pm ET',
    href: '/support/safety-tips',
    icon: Clock,
  },
];

export const metadata = {
  title: 'Contact Us | Military Helper',
};

export default function ContactPage() {
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
            <p className="uppercase text-sm tracking-widest text-[#f4d03f] font-semibold mb-2">Contact</p>
            <h1 className="text-4xl font-bold mb-3">We are here to help</h1>
            <p className="text-lg text-gray-200 max-w-3xl">
              Reach the Military Helper team for account support, safety concerns, or feedback on how we can improve.
            </p>
          </div>
        </section>

        <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
          <div className="grid md:grid-cols-3 gap-6">
            {contactOptions.map((option, index) => {
              const Icon = option.icon;
              return (
                <Card
                  key={option.title}
                  className="h-full border-2 border-gray-100 hover:border-[#d4af37] transition-shadow hover:shadow-2xl bg-white/90 backdrop-blur animate-fade-in-up"
                  style={{ animationDelay: `${index * 0.08}s` }}
                >
                  <CardHeader className="space-y-3">
                    <div className="w-12 h-12 rounded-xl bg-[#1e3a5f] text-[#d4af37] flex items-center justify-center shadow">
                      <Icon className="w-5 h-5" />
                    </div>
                    <CardTitle className="text-xl text-[#1e3a5f]">{option.title}</CardTitle>
                    <CardDescription className="text-gray-600">{option.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0">
                    {option.href.startsWith('mailto:') ? (
                      <a href={option.href} className="inline-flex items-center text-[#1e3a5f] font-semibold hover:text-[#d4af37]">
                        <span>{option.value}</span>
                        <span className="ml-2">→</span>
                      </a>
                    ) : (
                      <Link href={option.href} className="inline-flex items-center text-[#1e3a5f] font-semibold hover:text-[#d4af37]">
                        <span>{option.value}</span>
                        <span className="ml-2">→</span>
                      </Link>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm space-y-4 animate-fade-in-up" style={{ animationDelay: '0.36s' }}>
            <h2 className="text-2xl font-semibold text-[#1e3a5f]">What to include</h2>
            <p className="text-gray-700">
              To help us resolve your request faster, include the link to the job, listing, or post plus any screenshots of the conversation or payment receipts.
              For urgent safety issues, briefly describe what happened and where you met.
            </p>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
