import Link from 'next/link';
import { Navigation } from '@/components/navigation';
import { Footer } from '@/components/footer';

const sections = [
  {
    title: 'Using Military Helper',
    body: 'Military Helper is designed for students and campus partners. By using the platform you confirm you are able to enter agreements in your region and will follow your institution’s code of conduct.',
  },
  {
    title: 'Posts and listings',
    body: 'Keep job posts, marketplace listings, and forum messages accurate and respectful. Do not share misleading pay information, spam content, or illegal materials.',
  },
  {
    title: 'Payments and responsibilities',
    body: 'Unless otherwise noted, payments and agreements happen directly between users. Military Helper is not a party to these agreements and does not guarantee payment or performance. Always document what you agree to.',
  },
  {
    title: 'Safety and conduct',
    body: 'Meet in safe, public places when possible and follow the guidance in our Safety Tips. Harassment, discrimination, or attempts to bypass community safeguards may lead to account limits or removal.',
  },
  {
    title: 'Content rights',
    body: 'You retain ownership of the content you share and grant Military Helper a license to display it on the platform so others can discover your posts and listings.',
  },
  {
    title: 'Ending or changing the service',
    body: 'We may update features, pause access, or remove content that violates these terms. We will post updates here when the terms change so you can review what is new.',
  },
];

export const metadata = {
  title: 'Terms of Service | Military Helper',
};

export default function TermsPage() {
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
            <p className="uppercase text-sm tracking-widest text-[#f4d03f] font-semibold mb-2">Terms of Service</p>
            <h1 className="text-4xl font-bold mb-3">Rules for using Military Helper</h1>
            <p className="text-lg text-gray-200 max-w-3xl">
              Please read these terms so you know what is expected when posting jobs, selling materials, or taking part in discussions.
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
            <h2 className="text-xl font-semibold text-[#1e3a5f] mb-2">Contact</h2>
            <p className="text-gray-700">
              If you have questions about these terms, message us through the <Link href="/support/contact" className="text-[#1e3a5f] font-semibold hover:text-[#d4af37]">Contact page</Link>.
            </p>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
