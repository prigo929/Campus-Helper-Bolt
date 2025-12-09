import Link from 'next/link';
import { Navigation } from '@/components/navigation';
import { Footer } from '@/components/footer';

const faqs = [
  {
    question: 'How do I post a new job?',
    answer: 'Open the Jobs page, select "Post a Job", and fill in the role, pay, and location. Clear details and expectations help you get faster responses.',
  },
  {
    question: 'How do I sell books or materials?',
    answer: 'Head to the Marketplace, choose "Create listing", and add photos plus a short description. Mark the condition so buyers know what to expect.',
  },
  {
    question: 'Can I mark something as complete?',
    answer: 'Yes. Edit your job or listing and switch the status to closed/complete. This keeps search results fresh for other students.',
  },
  {
    question: 'How do I report a user or post?',
    answer: 'Use the report option on the job, listing, or forum post when available, or message us from the Contact page with a link and screenshot.',
  },
  {
    question: 'Do you verify campus emails?',
    answer: 'We encourage sign-ups with campus email addresses to keep the community trusted. If you need to switch emails, reach out via Contact.',
  },
  {
    question: 'I am not getting replies or notifications.',
    answer: 'Double-check your inbox spam folder and make sure your posted job/listing is still marked open. If the problem persists, send us the details.',
  },
];

export const metadata = {
  title: 'Help Center | Military Helper',
};

export default function HelpCenterPage() {
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
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <p className="uppercase text-sm tracking-widest text-[#f4d03f] font-semibold mb-2">Help Center</p>
            <h1 className="text-4xl font-bold mb-3">Answers to common questions</h1>
            <p className="text-lg text-gray-200">
              Quick guidance for posting jobs, selling materials, and keeping your campus experience safe.
            </p>
          </div>
        </section>

        <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
          <div className="grid gap-4">
            {faqs.map((faq, index) => (
              <div
                key={faq.question}
                className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm animate-fade-in-up"
                style={{ animationDelay: `${index * 0.06}s` }}
              >
                <h3 className="text-lg font-semibold text-[#1e3a5f] mb-2">{faq.question}</h3>
                <p className="text-gray-700 leading-relaxed">{faq.answer}</p>
              </div>
            ))}
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
            <h2 className="text-2xl font-semibold text-[#1e3a5f] mb-3">Still need help?</h2>
            <p className="text-gray-700 mb-4">
              If you did not find what you were looking for, try the resources below or contact us with the details of your issue.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link href="/support/safety-tips" className="px-4 py-2 rounded-full bg-[#1e3a5f] text-white hover:bg-[#2a4a6f]">
                Safety tips
              </Link>
              <Link href="/support/contact" className="px-4 py-2 rounded-full border border-[#1e3a5f] text-[#1e3a5f] hover:bg-[#1e3a5f] hover:text-white">
                Contact support
              </Link>
              <Link href="/legal/terms" className="px-4 py-2 rounded-full border border-gray-300 text-gray-700 hover:border-[#d4af37] hover:text-[#d4af37]">
                Review our terms
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
