"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const DEFAULT_ABOUT_CONTENT = `Ethiopia Maps is a visual mapping platform created to explore, document, and celebrate Ethiopian cities through art and design.

The project began from a simple observation: despite Ethiopia's rich history, diverse cultures, and distinctive cities, there is still a limited visual language through which these places are represented and remembered.

Much of what we see of our cities comes through photographs, satellite imagery, or conventional maps. Ethiopia Maps aims to add something different — a more personal and artistic way of seeing the places we call home.

Each map is individually researched and designed to capture the character of a city, bringing together its streets, landscape, architecture, history, and everyday identity. The goal is not simply to show where a city is, but to create something that makes you look at it, recognize it, and perhaps see it differently.

Founded by Nahom, an architect and visual artist, the project begins in Ethiopia with a growing collection of cities and hopes to contribute to a stronger visual culture around the places that make Ethiopia — and eventually Africa — what it is.

These are maps of places worth remembering.`;

export default function AboutPage() {
  const [aboutContent, setAboutContent] =
    useState(DEFAULT_ABOUT_CONTENT);

  useEffect(() => {
    let active = true;

    const loadContent = async () => {
      try {
        const response = await fetch(
          "/api/site-content",
          {
            method: "GET",
            cache: "no-store",
          }
        );

        if (!response.ok) {
          return;
        }

        const data = await response.json();

        if (
          active &&
          typeof data.aboutContent === "string" &&
          data.aboutContent.trim()
        ) {
          setAboutContent(
            data.aboutContent
          );
        }
      } catch {
        // Keep default content if loading fails.
      }
    };

    loadContent();

    return () => {
      active = false;
    };
  }, []);

  const paragraphs = aboutContent
    .split(/\n\s*\n/)
    .map((paragraph) =>
      paragraph.trim()
    )
    .filter(Boolean);

  return (
    <main className="min-h-screen bg-[#FAF9F6] text-[var(--charcoal)]">
      <Header />

      {/* ABOUT */}
      <section className="container-gallery pb-28 pt-32 md:pt-40">
        <div className="grid items-center gap-12 md:grid-cols-2 md:gap-20">
          {/* IMAGE */}
          <div className="relative aspect-[4/5] overflow-hidden rounded-sm bg-[var(--warm-paper)]">
            <Image
              src="/images/4.webp"
              alt="Ethiopia Maps"
              fill
              priority
              className="object-cover transition-transform duration-700 hover:scale-[1.02]"
            />
          </div>

          {/* TEXT */}
          <div className="flex flex-col justify-center">
            <p className="text-[10px] uppercase tracking-[0.25em] text-[var(--ochre)]">
              About Ethiopia Maps
            </p>

            <h1 className="serif mt-5 text-5xl leading-[1.05] md:text-6xl">
              Mapping Ethiopia
              <br />
              through art.
            </h1>

            <div className="my-8 border-t border-black/10" />

            <div className="max-w-lg space-y-5 text-md leading-7 text-black/65">
              {paragraphs.map(
                (paragraph, index) => (
                  <p key={index}>
                    {paragraph}
                  </p>
                )
              )}
            </div>

            <div className="mt-10 grid grid-cols-2 gap-8 border-t border-black/10 pt-6">
              <div>
                <p className="text-[9px] uppercase tracking-[0.18em] text-[var(--muted-text)]">
                  Collection
                </p>

                <p className="serif mt-2 text-xl">
                  Ethiopian Art
                </p>
              </div>

              <div>
                <p className="text-[9px] uppercase tracking-[0.18em] text-[var(--muted-text)]">
                  Established
                </p>

                <p className="serif mt-2 text-xl">
                  2026
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PHILOSOPHY */}
      <section className="border-t border-black/10 text-center">
        <div className="container-gallery py-24 md:py-32">
          <div className="mx-auto max-w-3xl">
            <p className="text-[10px] uppercase tracking-[0.25em] text-[var(--ochre)]">
              Our Philosophy
            </p>

            <h2 className="serif mt-5 text-4xl leading-tight md:text-5xl">
              Every place carries a story.
            </h2>

            <p className="mt-7 text-md leading-7 text-black/60 md:text-base">
              Ethiopia has an extraordinary visual
              language shaped by geography,
              architecture, history, and generations
              of artistic expression.
              <br />
              Ethiopia Maps exists to celebrate that
              language through contemporary artwork.
            </p>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}