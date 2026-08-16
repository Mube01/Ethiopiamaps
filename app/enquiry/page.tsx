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

  const handleSubmit = (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    const formData = new FormData(e.currentTarget);

    const enquiry = {
      customer: {
        name: formData.get("name"),
        email: formData.get("email"),
        phone: formData.get("phone"),
        message: formData.get("message"),
      },

      artworks: items,

      total,
    };

    console.log("ENQUIRY:", enquiry);

    setSubmitted(true);

    clearItems();
  };

  if (submitted) {
    return (
      <main className="min-h-screen bg-[#FAF9F6] text-[var(--charcoal)]">
        <Header />

        <section className="container-gallery flex min-h-[75vh] items-center justify-center pt-24">

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

          {/* LEFT */}
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

                        {/* Image */}
                        <div className="relative h-28 w-24 shrink-0 overflow-hidden bg-[var(--warm-paper)]">

                          <Image
                            src={item.image}
                            alt={item.title}
                            fill
                            className="object-cover"
                          />

                        </div>

                        {/* Details */}
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
                              className="text-[10px] uppercase tracking-[0.12em] text-black/35 transition-colors hover:text-red-600"
                            >
                              Remove
                            </button>

                          </div>

                          <p className="mt-2 text-xs text-black/45">
                            {item.size} · {item.format}
                          </p>

                          <div className="mt-auto flex items-end justify-between pt-4">

                            {/* Quantity */}
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
                                  className="flex h-8 w-8 items-center justify-center text-black/50 hover:text-[var(--ochre)]"
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
                                  className="flex h-8 w-8 items-center justify-center text-black/50 hover:text-[var(--ochre)]"
                                >
                                  +
                                </button>

                              </div>

                            </div>

                            {/* Price */}
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

                {/* Add another */}
                <Link
                  href="/shop"
                  className="flex items-center justify-center border border-dashed border-black/20 px-6 py-5 text-[10px] uppercase tracking-[0.18em] text-black/50 transition-colors hover:border-[var(--ochre)] hover:text-[var(--ochre)]"
                >
                  + Add Another Artwork
                </Link>

              </div>
            )}

          </div>

          {/* RIGHT */}
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

              {items.length > 0 && (
                <form onSubmit={handleSubmit}>

                  {/* Name */}
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
                      placeholder="Your name"
                      className="w-full rounded-sm border border-black/15 bg-white px-3 py-3 text-sm outline-none transition-colors placeholder:text-black/30 focus:border-[var(--ochre)]"
                    />

                  </div>

                  {/* Email */}
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
                      placeholder="your@email.com"
                      className="w-full rounded-sm border border-black/15 bg-white px-3 py-3 text-sm outline-none transition-colors placeholder:text-black/30 focus:border-[var(--ochre)]"
                    />

                  </div>

                  {/* Phone */}
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
                      placeholder="+251 ..."
                      className="w-full rounded-sm border border-black/15 bg-white px-3 py-3 text-sm outline-none transition-colors placeholder:text-black/30 focus:border-[var(--ochre)]"
                    />

                  </div>

                  {/* Message */}
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
                      placeholder="Tell us anything you'd like us to know..."
                      className="w-full resize-none rounded-sm border border-black/15 bg-white px-3 py-3 text-sm outline-none transition-colors placeholder:text-black/30 focus:border-[var(--ochre)]"
                    />

                  </div>

                  <button
                    type="submit"
                    className="w-full bg-[var(--ochre)] px-8 py-4 text-[10px] font-medium uppercase tracking-[0.18em] text-white transition-opacity hover:opacity-80"
                  >
                    Send Enquiry
                  </button>

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