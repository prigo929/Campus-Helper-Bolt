import Link from 'next/link';
import { Navigation } from '@/components/navigation';
import { Footer } from '@/components/footer';

const sections = [
  {
    title: 'Information we collect',
    body: 'We collect the details you provide when creating an account (like name and email), plus the jobs, listings, and posts you create. Basic technical data such as IP address and device type may also be captured to keep the service secure.',
  },
  {
    title: 'How we use your data',
    body: 'Your information lets us deliver the platform, send notifications you request, and keep the community trusted by preventing spam or abuse. Aggregated, non-identifiable data may be used to improve features.',
  },
  {
    title: 'When we share data',
    body: 'We do not sell your personal data. We may share limited information with service providers (like hosting or analytics) who follow strict confidentiality rules, or when required to comply with law or protect the platform.',
  },
  {
    title: 'Retention',
    body: 'Content you post stays visible until you remove it or mark it complete. We retain account information as long as needed to operate Military Helper and meet legal or security obligations.',
  },
  {
    title: 'Your choices',
    body: 'You can edit your posts and account details. If you want to request deletion of your data or have questions about access, contact us and we will guide you through the process.',
  },
];

export const metadata = {
  title: 'Privacy Policy | Military Helper',
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navigation />

      <main className="flex-1">
        <section className="relative overflow-hidden bg-gradient-to-br from-[#1e3a5f] to-[#2a4a6f] text-white py-14">
          <div className="pointer-events-none absolute inset-0 opacity-80 bg-[radial-gradient(circle_at_15%_25%,rgba(244,208,63,0.28),transparent_35%),radial-gradient(circle_at_85%_15%,rgba(255,255,255,0.18),transparent_35%),radial-gradient(circle_at_50%_90%,rgba(15,31,51,0.55),transparent_40%)] bg-[length:160%_160%] animate-gradient-move" />
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute -left-10 -top-16 h-52 w-52 rounded-full bg-gradient-to-br from-[#d4af37] to-[#f4d03f] blur-3xl opacity-70 animate-float" />
            <div className="absolute right-0 top-6 h-60 w-60 rounded-full bg-gradient-to-br from-white/40 via-transparent to-[#d4af37]/25 blur-3xl opacity-70 animate-float" />
          </div>
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <p className="uppercase text-sm tracking-widest text-[#f4d03f] font-semibold mb-2">Privacy</p>
            <h1 className="text-4xl font-bold mb-3">How we handle your data</h1>
            <p className="text-lg text-gray-200 max-w-3xl">
              This summary explains what we collect and how we keep your information safe while you use Military Helper.
            </p>
          </div>
        </section>

        <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
          <div className="space-y-6">
            {sections.map((section, index) => (
              <div
                key={section.title}
                className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm animate-fade-in-up"
                style={{ animationDelay: `${index * 0.08}s` }}
              >
                <h2 className="text-2xl font-semibold text-[#1e3a5f] mb-2">{section.title}</h2>
                <p className="text-gray-700 leading-relaxed">{section.body}</p>
              </div>
            ))}
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
            <h2 className="text-xl font-semibold text-[#1e3a5f] mb-2">Have a privacy question?</h2>
            <p className="text-gray-700">
              Reach our team through the <Link href="/support/contact" className="text-[#1e3a5f] font-semibold hover:text-[#d4af37]">Contact page</Link>. Please include the email on your account so we can respond quickly.
            </p>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
