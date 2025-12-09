import Link from 'next/link';

export function Footer() {
  return (
    <footer className="bg-[#0f1c16] text-[#f1df9c] mt-auto border-t border-[#caa35d]/25">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-gradient-to-br from-[#caa35d] to-[#b66b2e] rounded-lg flex items-center justify-center font-bold text-[#0f1c16]">
                MH
              </div>
              <span className="text-lg font-bold tracking-[0.12em] uppercase">Military Helper</span>
            </div>
            <p className="text-sm text-[#d9c8a5]/85">
              A Desert Storm-inspired hub for missions, supply, and briefings.
            </p>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Platform</h3>
            <ul className="space-y-2 text-sm text-[#d9c8a5]/85">
              <li><Link href="/jobs" className="hover:text-[#caa35d]">Missions</Link></li>
              <li><Link href="/marketplace" className="hover:text-[#caa35d]">Supply Exchange</Link></li>
              <li><Link href="/forum" className="hover:text-[#caa35d]">Briefings</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4">
              <Link href="/support" className="hover:text-[#caa35d]">Support</Link>
            </h3>
            <ul className="space-y-2 text-sm text-[#d9c8a5]/85">
              <li><Link href="/support/help-center" className="hover:text-[#caa35d]">Help Center</Link></li>
              <li><Link href="/support/safety-tips" className="hover:text-[#caa35d]">Safety Tips</Link></li>
              <li><Link href="/support/contact" className="hover:text-[#caa35d]">Contact Us</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4">
              <Link href="/legal" className="hover:text-[#caa35d]">Legal</Link>
            </h3>
            <ul className="space-y-2 text-sm text-[#d9c8a5]/85">
              <li><Link href="/legal/terms" className="hover:text-[#caa35d]">Terms of Service</Link></li>
              <li><Link href="/legal/privacy" className="hover:text-[#caa35d]">Privacy Policy</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-[#caa35d]/25 mt-8 pt-8 text-sm text-[#d9c8a5]/70 text-center">
          © {new Date().getFullYear()} Military Helper. Mission-ready.
        </div>
      </div>
    </footer>
  );
}
