"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useEnquiry } from "@/components/EnquiryProvider";

export default function EnquiryPage() {
  const {
    items,
    removeItem,
    updateQuantity,
    clearItems,
    total,
  } = useEnquiry();

  const [submitted, setSubmitted] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    if (sending) return;

    if (items.length === 0) {
      setError(
        "Please add at least one artwork to your enquiry."
      );
      return;
    }

    setError("");
    setSending(true);

    const formData = new FormData(e.currentTarget);

    const enquiry = {
      customer: {
        name: String(formData.get("name") || "").trim(),
        email: String(formData.get("email") || "").trim(),
        phone: String(formData.get("phone") || "").trim(),
        message: String(formData.get("message") || "").trim(),
      },

      artworks: items.map((item) => ({
        id: item.id,
        slug: item.slug,
        title: item.title,
        image: item.image,
        edition: item.edition,
        size: item.size,
        format: item.format,
        price: item.price,
        quantity: item.quantity,
        itemTotal: item.price * item.quantity,
      })),

      total,
    };

    try {
      const response = await fetch("/api/enquiry", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(enquiry),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            "Unable to send your enquiry. Please try again."
        );
      }

      /*
       * Only clear the enquiry after the server
       * confirms that the email was successfully sent.
       */
      clearItems();

      setSubmitted(true);
    } catch (err) {
      console.error("Enquiry submission failed:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Unable to send your enquiry. Please try again."
      );
    } finally {
      setSending(false);
    }
  };

  if (submitted) {
    return (
      <main className="min-h-screen bg-[#FAF9F6] text-[var(--charcoal)]">
        <Header />

        <section className="container-gallery flex min-h-[75vh] items-center justify-center px-6 pt-24">
          <div className="max-w-xl text-center">
            <p className="text-[10px] uppercase tracking-[0.25em] text-[var(--ochre)]">
              Enquiry Sent
            </p>

            <h1 className="serif mt-5 text-5xl md:text-6xl">
              Thank you.
            </h1>

            <div className="my-8 border-t border-black/10" />

            <p className="text-sm leading-7 text-black/60">
              Your artwork enquiry has been received.
              We will review your request and contact you
              shortly.
            </p>

            <p className="mt-4 text-xs leading-6 text-black/40">
              A confirmation has been sent to the email
              address you provided.
            </p>

            <Link
              href="/shop"
              className="mt-8 inline-block bg-[var(--ochre)] px-8 py-4 text-[10px] uppercase tracking-[0.18em] text-white transition-opacity hover:opacity-80"
            >
              Continue Exploring
            </Link>
          </div>
        </section>

        <Footer />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#FAF9F6] text-[var(--charcoal)]">
      <Header />

      <section className="container-gallery pb-24 pt-32 md:pt-40">
        <div className="grid gap-16 lg:grid-cols-[1.1fr_0.9fr]">
          {/* =====================================================
              LEFT
          ====================================================== */}
          <div>
            <p className="text-[10px] uppercase tracking-[0.25em] text-[var(--ochre)]">
              Artwork Enquiry
            </p>

            <h1 className="serif mt-4 text-5xl md:text-6xl">
              Your selection.
            </h1>

            <div className="my-8 border-t border-black/10" />

            {items.length === 0 ? (
              <div className="py-16 text-center">
                <p className="text-sm text-black/50">
                  Your enquiry is currently empty.
                </p>

                <Link
                  href="/shop"
                  className="mt-6 inline-block border border-black/15 px-6 py-3 text-[10px] uppercase tracking-[0.15em] transition-colors hover:border-[var(--ochre)]"
                >
                  Browse Collection
                </Link>
              </div>
            ) : (
              <div className="space-y-5">
                {items.map((item) => {
                  const itemTotal =
                    item.price * item.quantity;

                  return (
                    <div
                      key={item.id}
                      className="border border-black/10 bg-white p-4"
                    >
                      <div className="flex gap-5">
                        {/* =================================================
                            IMAGE
                        ================================================== */}
                        <div className="relative h-28 w-24 shrink-0 overflow-hidden bg-[var(--warm-paper)]">
                          <Image
                            src={item.image}
                            alt={item.title}
                            fill
                            sizes="96px"
                            className="object-cover"
                          />
                        </div>

                        {/* =================================================
                            DETAILS
                        ================================================== */}
                        <div className="flex min-w-0 flex-1 flex-col">
                          <div className="flex justify-between gap-4">
                            <div>
                              <p className="text-[9px] uppercase tracking-[0.2em] text-[var(--ochre)]">
                                {item.edition}
                              </p>

                              <h2 className="serif mt-1 text-2xl">
                                {item.title}
                              </h2>
                            </div>

                            <button
                              type="button"
                              onClick={() =>
                                removeItem(item.id)
                              }
                              className="shrink-0 text-[10px] uppercase tracking-[0.12em] text-black/35 transition-colors hover:text-red-600"
                            >
                              Remove
                            </button>
                          </div>

                          <p className="mt-2 text-xs text-black/45">
                            {item.size} · {item.format}
                          </p>

                          <div className="mt-auto flex items-end justify-between gap-4 pt-4">
                            {/* =================================================
                                QUANTITY
                            ================================================== */}
                            <div>
                              <p className="mb-1 text-[8px] uppercase tracking-[0.15em] text-black/35">
                                Quantity
                              </p>

                              <div className="flex items-center border border-black/10">
                                <button
                                  type="button"
                                  onClick={() =>
                                    updateQuantity(
                                      item.id,
                                      Math.max(
                                        1,
                                        item.quantity - 1
                                      )
                                    )
                                  }
                                  className="flex h-8 w-8 items-center justify-center text-black/50 transition-colors hover:text-[var(--ochre)]"
                                  aria-label={`Decrease quantity of ${item.title}`}
                                >
                                  −
                                </button>

                                <span className="flex h-8 w-9 items-center justify-center border-x border-black/10 text-xs">
                                  {item.quantity}
                                </span>

                                <button
                                  type="button"
                                  onClick={() =>
                                    updateQuantity(
                                      item.id,
                                      item.quantity + 1
                                    )
                                  }
                                  className="flex h-8 w-8 items-center justify-center text-black/50 transition-colors hover:text-[var(--ochre)]"
                                  aria-label={`Increase quantity of ${item.title}`}
                                >
                                  +
                                </button>
                              </div>
                            </div>

                            {/* =================================================
                                PRICE
                            ================================================== */}
                            <p className="serif text-xl">
                              ETB{" "}
                              {itemTotal.toLocaleString()}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}

                {/* =================================================
                    ADD ANOTHER
                ================================================== */}
                <Link
                  href="/shop"
                  className="flex items-center justify-center border border-dashed border-black/20 px-6 py-5 text-[10px] uppercase tracking-[0.18em] text-black/50 transition-colors hover:border-[var(--ochre)] hover:text-[var(--ochre)]"
                >
                  + Add Another Artwork
                </Link>
              </div>
            )}
          </div>

          {/* =====================================================
              RIGHT
          ====================================================== */}
          <div>
            <div className="sticky top-32">
              <p className="text-[10px] uppercase tracking-[0.2em] text-[var(--muted-text)]">
                Your Details
              </p>

              <div className="my-7 border-t border-black/10" />

              {items.length > 0 && (
                <div className="mb-8 flex items-center justify-between">
                  <p className="text-[10px] uppercase tracking-[0.15em] text-black/45">
                    Estimated Total
                  </p>

                  <p className="serif text-2xl">
                    ETB {total.toLocaleString()}
                  </p>
                </div>
              )}

              {error && (
                <div className="mb-6 border border-red-200 bg-red-50 px-4 py-3 text-xs leading-5 text-red-600">
                  {error}
                </div>
              )}

              {items.length > 0 && (
                <form onSubmit={handleSubmit}>
                  {/* =================================================
                      NAME
                  ================================================== */}
                  <div className="mb-5">
                    <label
                      htmlFor="name"
                      className="mb-2 block text-[9px] uppercase tracking-[0.18em] text-black/50"
                    >
                      Full Name
                    </label>

                    <input
                      id="name"
                      name="name"
                      type="text"
                      required
                      disabled={sending}
                      placeholder="Your name"
                      className="w-full rounded-sm border border-black/15 bg-white px-3 py-3 text-sm outline-none transition-colors placeholder:text-black/30 focus:border-[var(--ochre)] disabled:cursor-not-allowed disabled:opacity-50"
                    />
                  </div>

                  {/* =================================================
                      EMAIL
                  ================================================== */}
                  <div className="mb-5">
                    <label
                      htmlFor="email"
                      className="mb-2 block text-[9px] uppercase tracking-[0.18em] text-black/50"
                    >
                      Email Address
                    </label>

                    <input
                      id="email"
                      name="email"
                      type="email"
                      required
                      disabled={sending}
                      placeholder="your@email.com"
                      className="w-full rounded-sm border border-black/15 bg-white px-3 py-3 text-sm outline-none transition-colors placeholder:text-black/30 focus:border-[var(--ochre)] disabled:cursor-not-allowed disabled:opacity-50"
                    />
                  </div>

                  {/* =================================================
                      PHONE
                  ================================================== */}
                  <div className="mb-5">
                    <label
                      htmlFor="phone"
                      className="mb-2 block text-[9px] uppercase tracking-[0.18em] text-black/50"
                    >
                      Phone
                    </label>

                    <input
                      id="phone"
                      name="phone"
                      type="tel"
                      disabled={sending}
                      placeholder="+251 ..."
                      className="w-full rounded-sm border border-black/15 bg-white px-3 py-3 text-sm outline-none transition-colors placeholder:text-black/30 focus:border-[var(--ochre)] disabled:cursor-not-allowed disabled:opacity-50"
                    />
                  </div>

                  {/* =================================================
                      MESSAGE
                  ================================================== */}
                  <div className="mb-7">
                    <label
                      htmlFor="message"
                      className="mb-2 block text-[9px] uppercase tracking-[0.18em] text-black/50"
                    >
                      Message
                    </label>

                    <textarea
                      id="message"
                      name="message"
                      rows={5}
                      disabled={sending}
                      placeholder="Tell us anything you'd like us to know..."
                      className="w-full resize-none rounded-sm border border-black/15 bg-white px-3 py-3 text-sm outline-none transition-colors placeholder:text-black/30 focus:border-[var(--ochre)] disabled:cursor-not-allowed disabled:opacity-50"
                    />
                  </div>

                  {/* =================================================
                      SUBMIT
                  ================================================== */}
                  <button
                    type="submit"
                    disabled={sending}
                    className="flex w-full items-center justify-center gap-3 bg-[var(--ochre)] px-8 py-4 text-[10px] font-medium uppercase tracking-[0.18em] text-white transition-all hover:opacity-80 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {sending ? (
                      <>
                        <span className="h-3 w-3 animate-spin rounded-full border border-white/40 border-t-white" />
                        Sending...
                      </>
                    ) : (
                      "Send Enquiry"
                    )}
                  </button>

                  <p className="mt-4 text-center text-[9px] leading-5 text-black/35">
                    We will review your enquiry and contact
                    you shortly with availability and next
                    steps.
                  </p>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}