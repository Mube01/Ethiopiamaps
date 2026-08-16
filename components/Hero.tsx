"use client";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function Hero() {
  return (
    <section className="relative h-screen min-h-[700px] overflow-hidden bg-[var(--deep-earth)]">
      <Image
        src="/images/addis.png"
        alt="Addis Ababa"
        fill
        priority
        className="object-cover"
      />

      {/* Image overlay */}
      <div className="absolute inset-0 bg-black/35" />

      {/* Centered navigation + CTA */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, delay: 0.3 }}
        className="absolute left-1/2 top-1/2 z-20 flex -translate-x-1/2 -translate-y-1/2 flex-col items-center"
      >
        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          className="flex flex-col items-center text-center"
        >
          <h1 className="serif text-[clamp(48px,6vw,78px)] font-normal leading-none tracking-[-0.035em] text-white">
            ETHIOPIA MAPS
          </h1>
        </motion.div>

        {/* Navigation */}
        <nav className="mt-8 flex items-center gap-8">
          <Link
            href="/about"
            className="text-[17px] uppercase tracking-[0.2em] text-white transition-opacity duration-300 hover:opacity-50"
          >
            About
          </Link>

          <span className="h-1 w-1 rounded-full bg-white/50" />

          <Link
            href="/shop"
            className="text-[17px] uppercase tracking-[0.2em] text-white transition-opacity duration-300 hover:opacity-50"
          >
            Shop
          </Link>

          <span className="h-1 w-1 rounded-full bg-white/50" />

          <Link
            href="/contact"
            className="text-[17px] uppercase tracking-[0.2em] text-white transition-opacity duration-300 hover:opacity-50"
          >
            Contact
          </Link>
        </nav>

        {/* Explore button */}
        <Link
          href="/shop"
          className="mt-7 inline-flex items-center gap-5 rounded-lg border border-[var(--ochre)] bg-black/70 px-6 py-3.5 text-[12px] font-medium uppercase tracking-[0.18em] text-white transition-colors hover:bg-[var(--ochre)]"
        >
          Explore the Collection
          <ArrowRight size={14} strokeWidth={1.5} />
        </Link>
      </motion.div>
{/* Social Media */}
<motion.div
  initial={{ opacity: 0, y: 15 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 1, delay: 0.8 }}
  className="absolute bottom-8 left-1/2 z-20 flex -translate-x-1/2 items-center gap-8"
>
  {/* Instagram */}
  <a
    href="https://www.instagram.com/nahom.22?igsh=eHMzc25ocGJ6dXF5"
    target="_blank"
    rel="noopener noreferrer"
    aria-label="Instagram"
    className="text-white transition-all duration-300 hover:scale-110 hover:opacity-50"
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
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
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
    href="https://linkedin.com"
    target="_blank"
    rel="noopener noreferrer"
    aria-label="LinkedIn"
    className="text-white transition-all duration-300 hover:scale-110 hover:opacity-50"
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
    href="https://www.behance.net/nahomredda1"
    target="_blank"
    rel="noopener noreferrer"
    aria-label="Behance"
    className="text-white transition-all duration-300 hover:scale-110 hover:opacity-50"
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
    className="text-white transition-all duration-300 hover:scale-110 hover:opacity-50"
  >
    <svg
      className="h-6 w-6"
      viewBox="0 0 24 24"
      fill="currentColor"
    >
      <path d="M12 2C6.48 2 2 6.05 2 11.03c0 3.73 2.1 6.98 5.27 8.64-.07-.73-.01-1.6.18-2.43l1.2-5.07s-.3-.6-.3-1.48c0-1.38.8-2.42 1.8-2.42.85 0 1.26.64 1.26 1.4 0 .85-.54 2.12-.82 3.3-.23.99.5 1.8 1.48 1.8 1.78 0 3.15-1.87 3.15-4.57 0-2.39-1.72-4.06-4.17-4.06-2.84 0-4.51 2.13-4.51 4.33 0 .86.33 1.78.74 2.28.08.1.09.19.07.29l-.27 1.1c-.04.18-.14.22-.32.13-1.18-.55-1.92-2.28-1.92-3.67 0-2.99 2.17-5.73 6.27-5.73 3.29 0 5.85 2.35 5.85 5.49 0 3.27-2.06 5.9-4.92 5.9-.96 0-1.86-.5-2.17-1.1l-.59 2.26c-.21.83-.77 1.86-1.15 2.49.86.27 1.76.41 2.69.41 5.52 0 10-4.05 10-9.03S17.52 2 12 2Z" />
    </svg>
  </a>
</motion.div></section>
  );
}
