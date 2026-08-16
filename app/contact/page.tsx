"use client";

import Footer from "@/components/Footer";
import Header from "@/components/Header";

export default function ContactPage() {
  return (
    <main className="min-h-screen bg-[#FAF9F6] text-[var(--charcoal)]">
      <Header />

      {/* Contact Section */}
      <section className="container-gallery pb-24 pt-32 md:pb-32 md:pt-40">
        <div className="grid items-center gap-16 md:grid-cols-2 md:gap-24">

          {/* =========================
              LEFT — INTRODUCTION
          ========================== */}
          <div>
            <p className="text-[10px] uppercase tracking-[0.25em] text-[var(--ochre)]">
              Get in Touch
            </p>

            <h1 className="serif mt-5 text-5xl leading-[1.05] md:text-6xl">
              Let&apos;s start
              <br />
              a conversation.
            </h1>

            <div className="my-8 w-full max-w-md border-t border-black/10" />

            <p className="max-w-md text-md leading-7 text-black/60">
              Whether you&apos;re interested in an artwork, want to learn more
              about the collection, or simply want to connect with us,
              we&apos;d love to hear from you.
            </p>

            {/* Contact Details */}
            <div className="mt-10 grid gap-7 sm:grid-cols-2 md:grid-cols-1 lg:grid-cols-2">

              <div>
                <p className="text-[9px] uppercase tracking-[0.18em] text-[var(--muted-text)]">
                  Email
                </p>

                <a
                  href="mailto:hello@ethiopiamaps.com"
                  className="mt-2 inline-block text-sm transition-colors hover:text-[var(--ochre)]"
                >
                  hello@ethiopiamaps.com
                </a>
              </div>

              <div>
                <p className="text-[9px] uppercase tracking-[0.18em] text-[var(--muted-text)]">
                  Location
                </p>

                <p className="mt-2 text-sm">
                  Addis Ababa, Ethiopia
                </p>
              </div>

            </div>
          </div>

          {/* =========================
              RIGHT — FORM BOX
          ========================== */}
          <div className="w-full">
            <div className="border border-black/10 bg-white p-6 md:p-8">

              {/* Form Header */}
              <div className="mb-7 border-b border-black/10 pb-5">
                <p className="text-[9px] uppercase tracking-[0.2em] text-[var(--ochre)]">
                  Contact
                </p>

                <h2 className="serif mt-2 text-3xl">
                  Send us a message
                </h2>
              </div>

              <form>

                {/* Name */}
                <div className="mb-5">
                  <label
                    htmlFor="name"
                    className="mb-2 block text-[9px] uppercase tracking-[0.18em] text-[var(--muted-text)]"
                  >
                    Name
                  </label>

                  <input
                    id="name"
                    name="name"
                    type="text"
                    placeholder="Your name"
                    className="
                      h-11
                      w-full
                      rounded-sm
                      border
                      border-black/15
                      bg-[#FAF9F6]
                      px-3
                      text-sm
                      outline-none
                      transition-colors
                      placeholder:text-black/30
                      focus:border-[var(--ochre)]
                    "
                  />
                </div>

                {/* Email */}
                <div className="mb-5">
                  <label
                    htmlFor="email"
                    className="mb-2 block text-[9px] uppercase tracking-[0.18em] text-[var(--muted-text)]"
                  >
                    Email
                  </label>

                  <input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="your@email.com"
                    className="
                      h-11
                      w-full
                      rounded-sm
                      border
                      border-black/15
                      bg-[#FAF9F6]
                      px-3
                      text-sm
                      outline-none
                      transition-colors
                      placeholder:text-black/30
                      focus:border-[var(--ochre)]
                    "
                  />
                </div>

                {/* Subject */}
                <div className="mb-5">
                  <label
                    htmlFor="subject"
                    className="mb-2 block text-[9px] uppercase tracking-[0.18em] text-[var(--muted-text)]"
                  >
                    Subject
                  </label>

                  <input
                    id="subject"
                    name="subject"
                    type="text"
                    placeholder="How can we help?"
                    className="
                      h-11
                      w-full
                      rounded-sm
                      border
                      border-black/15
                      bg-[#FAF9F6]
                      px-3
                      text-sm
                      outline-none
                      transition-colors
                      placeholder:text-black/30
                      focus:border-[var(--ochre)]
                    "
                  />
                </div>

                {/* Message */}
                <div className="mb-6">
                  <label
                    htmlFor="message"
                    className="mb-2 block text-[9px] uppercase tracking-[0.18em] text-[var(--muted-text)]"
                  >
                    Message
                  </label>

                  <textarea
                    id="message"
                    name="message"
                    rows={4}
                    placeholder="Tell us what's on your mind..."
                    className="
                      min-h-[110px]
                      w-full
                      resize-none
                      rounded-sm
                      border
                      border-black/15
                      bg-[#FAF9F6]
                      px-3
                      py-3
                      text-sm
                      leading-6
                      outline-none
                      transition-colors
                      placeholder:text-black/30
                      focus:border-[var(--ochre)]
                    "
                  />
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  className="
                    h-11
                    w-full
                    bg-black
                    px-8
                    text-[10px]
                    font-medium
                    uppercase
                    tracking-[0.2em]
                    text-white
                    transition-all
                    duration-300
                    hover:bg-[var(--ochre)]
                  "
                >
                  Send Message
                </button>

              </form>
            </div>
          </div>

        </div>
      </section>

      <Footer />
    </main>
  );
}
