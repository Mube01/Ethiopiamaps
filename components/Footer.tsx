import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-[#8C7355] bg-[#0B0B0B] text-white">
      <div className="container-gallery py-16">
        <div className="grid gap-12 md:grid-cols-3">

          {/* =====================================================
              BRAND
          ====================================================== */}
          <div>
            <div className="serif text-[28px] font-bold tracking-[0.04em] text-white">
              ETHIOPIA MAPS
            </div>

            <p className="mt-4 max-w-xs text-[15px] leading-6 text-[#999]">
              Discover the beauty, history, and landscapes of Ethiopia & Africa through
              carefully curated maps and artwork.
            </p>
          </div>

          {/* =====================================================
              NAVIGATION
          ====================================================== */}
          <div>
            <h3 className="text-[13px] font-semibold uppercase tracking-[0.12em] text-[#90744F]">
              Explore
            </h3>

            <nav className="mt-5 flex flex-col gap-3">
              <Link
                href="/"
                className="text-[15px] text-[#999] transition-colors hover:text-white"
              >
                Home
              </Link>

              <Link
                href="/shop"
                className="text-[15px] text-[#999] transition-colors hover:text-white"
              >
                Shop
              </Link>

              <Link
                href="/about"
                className="text-[15px] text-[#999] transition-colors hover:text-white"
              >
                About
              </Link>

              <Link
                href="/contact"
                className="text-[15px] text-[#999] transition-colors hover:text-white"
              >
                Contact
              </Link>
            </nav>
          </div>

          {/* =====================================================
              CONNECT
          ====================================================== */}
          <div>
            <h3 className="text-[13px] font-semibold uppercase tracking-[0.12em] text-[#90744F]">
              Connect
            </h3>

            <div className="mt-5 flex flex-col gap-3">

  {/* Email */}
  <a
    href="mailto:hello@ethiopiamaps.com"
    className="flex items-center gap-3 text-[15px] text-[#999] transition-colors hover:text-white"
  >
    {/* Email Icon */}
    <svg
      className="h-5 w-5 shrink-0"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="m3 7 9 6 9-6" />
    </svg>

    hello@ethiopiamaps.com
  </a>

  {/* Phone */}
  <a
    href="tel:+251929451813"
    className="flex items-center gap-3 text-[15px] text-[#999] transition-colors hover:text-white"
  >
    {/* Phone Icon */}
    <svg
      className="h-5 w-5 shrink-0"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.79 19.79 0 0 1 2.12 4.18 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.12.9.33 1.78.62 2.63a2 2 0 0 1-.45 2.11L8 9.73a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.85.29 1.73.5 2.63.62A2 2 0 0 1 22 16.92Z" />
    </svg>

    +251 929 45 18 13
  </a>

              {/* =================================================
                  SOCIAL MEDIA
              ================================================== */}
              <div className="mt-4 flex items-center gap-6">

                {/* Instagram */}
                <a
                  href="https://www.instagram.com/nahom.22?igsh=eHMzc25ocGJ6dXF5"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Instagram"
                  className="text-[#999] transition-all duration-300 hover:scale-110 hover:text-white"
                >
                  <svg
                    className="h-6 w-6"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <rect
                      x="3"
                      y="3"
                      width="18"
                      height="18"
                      rx="5"
                    />

                    <circle
                      cx="12"
                      cy="12"
                      r="4"
                    />

                    <circle
                      cx="17.5"
                      cy="6.5"
                      r="1"
                      fill="currentColor"
                      stroke="none"
                    />
                  </svg>
                </a>

                {/* LinkedIn */}
                <a
                  href="https://www.linkedin.com/company/ethiopia-maps/"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="LinkedIn"
                  className="text-[#999] transition-all duration-300 hover:scale-110 hover:text-white"
                >
                  <svg
                    className="h-6 w-6"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M6.5 8.5H3V21h3.5V8.5ZM4.75 3A2.05 2.05 0 1 0 4.75 7.1 2.05 2.05 0 0 0 4.75 3ZM21 13.85c0-3.77-2.01-5.52-4.7-5.52-2.17 0-3.14 1.2-3.68 2.05V8.5H9.12V21h3.5v-6.19c0-1.63.31-3.2 2.32-3.2 1.98 0 2.01 1.86 2.01 3.3V21H21v-7.15Z" />
                  </svg>
                </a>

                {/* Behance */}
                <a
                  href="https://www.behance.net/ethiopiamaps"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Behance"
                  className="text-[#999] transition-all duration-300 hover:scale-110 hover:text-white"
                >
                  <svg
                    className="h-7 w-7"
                    viewBox="0 0 24 20"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M2 3h6.2c2.7 0 4.3 1.4 4.3 3.5 0 1.5-.8 2.6-2.1 3.1 1.7.5 2.7 1.7 2.7 3.5 0 2.6-1.9 4.1-4.8 4.1H2V3Z" />

                    <path d="M5.5 5.8v2.6h2.3c1.1 0 1.7-.5 1.7-1.3 0-.9-.6-1.3-1.7-1.3H5.5Z" />

                    <path d="M5.5 11v2.7H8c1.2 0 1.8-.5 1.8-1.4S9.2 11 8 11H5.5Z" />

                    <path d="M15 7h4" />

                    <path d="M14.5 12.2h7.1c.1-2.7-1.5-4.7-4.2-4.7-2.8 0-4.6 1.9-4.6 4.6 0 2.8 1.9 4.6 4.7 4.6 1.8 0 3.3-.7 4-2" />
                  </svg>
                </a>

                {/* Pinterest */}
                <a
                  href="https://pin.it/3k2SCwtUB"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Pinterest"
                  className="text-[#999] transition-all duration-300 hover:scale-110 hover:text-white"
                >
                  <svg
                    className="h-6 w-6"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M12 2C6.48 2 2 6.05 2 11.03c0 3.73 2.1 6.98 5.27 8.64-.07-.73-.01-1.6.18-2.43l1.2-5.07s-.3-.6-.3-1.48c0-1.38.8-2.42 1.8-2.42.85 0 1.26.64 1.26 1.4 0 .85-.54 2.12-.82 3.3-.23.99.5 1.8 1.48 1.8 1.78 0 3.15-1.87 3.15-4.57 0-2.39-1.72-4.06-4.17-4.06-2.84 0-4.51 2.13-4.51 4.33 0 .86.33 1.78.74 2.28.08.1.09.19.07.29l-.27 1.1c-.04.18-.14.22-.32.13-1.18-.55-1.92-2.28-1.92-3.67 0-2.99 2.17-5.73 6.27-5.73 3.29 0 5.85 2.35 5.85 5.49 0 3.27-2.06 5.9-4.92 5.9-.96 0-1.86-.5-2.17-1.1l-.59 2.26c-.21.83-.77 1.86-1.15 2.49.86.27 1.76.41 2.69.41 5.52 0 10-4.05 10-9.03S17.52 2 12 2Z" />
                  </svg>
                </a>

              </div>
            </div>
          </div>
        </div>

        {/* =====================================================
            BOTTOM
        ====================================================== */}
        <div className="mt-16 border-t border-white/10 pt-6">
          <div className="flex flex-col gap-3 text-[12px] uppercase tracking-[0.08em] text-[#999] sm:flex-row sm:items-center sm:justify-between">

            <p>
              © {new Date().getFullYear()} Ethiopia Maps. All rights reserved.
            </p>

            <div className="flex gap-6">
              <Link
                href="/admin"
                className="transition-colors hover:text-[#8C7355]"
              >
                Admin
              </Link>
            </div>

          </div>
        </div>
      </div>
    </footer>
  );
}
