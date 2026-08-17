"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useEnquiry } from "@/components/EnquiryProvider";

type ArtworkImage = {
  url: string;
  publicId: string;
};

type ArtworkSize = {
  size: string;
  description: string;
  price: number;
};

type Artwork = {
  _id: string;
  slug: string;
  title: string;
  description: string;
  year: number;
  type: "local" | "international";
  available: boolean;
  image: string;
  cloudinaryPublicId: string;
  images: ArtworkImage[];
  sizes: ArtworkSize[];
};

export default function ArtworkPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const [slug, setSlug] = useState<string | null>(null);
  const [work, setWork] = useState<Artwork | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [selectedSizeIndex, setSelectedSizeIndex] =
    useState(0);
  const [selectedImageIndex, setSelectedImageIndex] =
    useState(0);

  const router = useRouter();

  const [isZoomed, setIsZoomed] = useState(false);
  const [zoomPosition, setZoomPosition] = useState({
    x: 50,
    y: 50,
  });

  const { items, addItem } = useEnquiry();

  /*
   * Get slug from params
   */
  useEffect(() => {
    params.then((value) => {
      setSlug(value.slug);
    });
  }, [params]);

  /*
   * Fetch artwork
   */
  useEffect(() => {
    if (!slug) return;

    const currentSlug = slug;

    async function fetchArtwork() {
      setLoading(true);
      setNotFound(false);

      try {
        const response = await fetch(
          `/api/artworks?slug=${encodeURIComponent(
            currentSlug
          )}`,
          {
            cache: "no-store",
          }
        );

        if (response.status === 404) {
          setNotFound(true);
          return;
        }

        if (!response.ok) {
          throw new Error(
            "Failed to fetch artwork"
          );
        }

        const data = await response.json();

        setWork({
          ...data,
          images:
            Array.isArray(data.images) &&
            data.images.length === 3
              ? data.images
              : [
                  {
                    url: data.image,
                    publicId:
                      data.cloudinaryPublicId,
                  },
                ],
        });
      } catch (error) {
        console.error(
          "Failed to load artwork:",
          error
        );

        setNotFound(true);
      } finally {
        setLoading(false);
      }
    }

    fetchArtwork();
  }, [slug]);

  /*
   * Selected size
   */
  const selectedOption =
    work?.sizes[selectedSizeIndex] ?? null;

  /*
   * Selected image
   */
  const selectedImage =
    work?.images[selectedImageIndex] ??
    (work
      ? {
          url: work.image,
          publicId:
            work.cloudinaryPublicId,
        }
      : null);

  /*
   * Image zoom
   */
  const handleImageMouseMove = (
    event: React.MouseEvent<HTMLDivElement>
  ) => {
    const rect =
      event.currentTarget.getBoundingClientRect();

    const x =
      ((event.clientX - rect.left) /
        rect.width) *
      100;

    const y =
      ((event.clientY - rect.top) /
        rect.height) *
      100;

    setZoomPosition({
      x: Math.max(0, Math.min(100, x)),
      y: Math.max(0, Math.min(100, y)),
    });
  };

  /*
   * Add artwork to enquiry
   */
  const handleEnquire = () => {
    if (
      !work ||
      !selectedOption ||
      !selectedImage
    ) {
      return;
    }

    addItem({
      id: `${work.slug}-${selectedOption.size}`,
      slug: work.slug,
      title: work.title,
      image: selectedImage.url,
      edition: selectedOption.size,
      size: selectedOption.description,
      format: "Fine Art Print",
      price: selectedOption.price,
      quantity,
    });

    router.push("/enquiry");
  };

  /*
   * Loading skeleton
   */
  if (!slug || loading) {
    return (
      <main className="min-h-screen bg-[#FAF9F6]">
        <Header />

        <section className="container-gallery pb-24 pt-32 md:pt-40">
          <div className="animate-pulse">
            <div className="grid gap-12 md:grid-cols-[1.1fr_0.9fr] md:gap-20">

              {/* =========================
                  IMAGE SKELETON
              ========================== */}
              <div>
                <div className="aspect-square w-full bg-black/[0.06]" />

                {/* Thumbnail skeletons */}
                <div className="mt-4 grid grid-cols-3 gap-3">
                  {Array.from({ length: 3 }).map(
                    (_, index) => (
                      <div
                        key={index}
                        className="aspect-square bg-black/[0.05]"
                      />
                    )
                  )}
                </div>
              </div>

              {/* =========================
                  DETAILS SKELETON
              ========================== */}
              <div className="flex flex-col justify-center">

                {/* Small category / title */}
                <div className="h-3 w-20 bg-black/[0.05]" />

                {/* Title */}
                <div className="mt-6 h-14 w-3/4 bg-black/[0.06]" />

                {/* Year */}
                <div className="mt-5 h-4 w-14 bg-black/[0.05]" />

                {/* Divider */}
                <div className="my-8 border-t border-black/10" />

                {/* Description */}
                <div className="space-y-3">
                  <div className="h-4 w-full bg-black/[0.05]" />
                  <div className="h-4 w-[92%] bg-black/[0.05]" />
                  <div className="h-4 w-[80%] bg-black/[0.05]" />
                  <div className="h-4 w-[65%] bg-black/[0.05]" />
                </div>

                {/* Size section */}
                <div className="mt-10">
                  <div className="mb-4 h-3 w-24 bg-black/[0.05]" />

                  <div className="space-y-3">
                    {Array.from({ length: 3 }).map(
                      (_, index) => (
                        <div
                          key={index}
                          className="h-[76px] w-full border border-black/10 bg-black/[0.03]"
                        />
                      )
                    )}
                  </div>
                </div>

                {/* Price */}
                <div className="mt-8">
                  <div className="h-3 w-14 bg-black/[0.05]" />

                  <div className="mt-3 h-9 w-36 bg-black/[0.06]" />

                  <div className="mt-2 h-3 w-40 bg-black/[0.04]" />
                </div>

                {/* Quantity */}
                <div className="mt-8">
                  <div className="mb-3 h-3 w-20 bg-black/[0.05]" />

                  <div className="h-11 w-36 border border-black/10 bg-black/[0.03]" />
                </div>

                {/* Total */}
                <div className="mt-8 flex max-w-md items-center justify-between border-t border-black/10 pt-5">
                  <div className="h-3 w-12 bg-black/[0.05]" />

                  <div className="h-7 w-28 bg-black/[0.06]" />
                </div>

                {/* Button */}
                <div className="mt-8 h-12 w-36 bg-black/[0.08]" />

                {/* Back link */}
                <div className="mt-8 h-3 w-32 bg-black/[0.04]" />
              </div>
            </div>

            {/* Loading label */}
            <div className="mt-12 flex items-center justify-center gap-4">
              <span className="h-px w-8 bg-[var(--ochre)]" />

              <p className="text-[10px] uppercase tracking-[0.25em] text-[var(--ochre)]">
                Loading Artwork
              </p>

              <span className="h-px w-8 bg-[var(--ochre)]" />
            </div>
          </div>
        </section>

        <Footer />
      </main>
    );
  }

  /*
   * Artwork not found
   */
  if (
    notFound ||
    !work ||
    !selectedOption ||
    !selectedImage
  ) {
    return (
      <main className="min-h-screen bg-[#FAF9F6]">
        <Header />

        <section className="container-gallery flex min-h-[70vh] items-center justify-center pt-24">
          <div className="text-center">
            <p className="text-[10px] uppercase tracking-[0.2em] text-[var(--ochre)]">
              Artwork Not Found
            </p>

            <h1 className="serif mt-4 text-4xl">
              This artwork doesn&apos;t exist.
            </h1>

            <Link
              href="/shop"
              className="mt-8 inline-block border border-black/20 px-6 py-3 text-[10px] uppercase tracking-[0.15em] transition-colors hover:border-[var(--ochre)]"
            >
              Back to Collection
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
        <div className="grid gap-12 md:grid-cols-[1.1fr_0.9fr] md:gap-20">

          {/* =========================
              IMAGES
          ========================== */}
          <div>
            {/* Main Artwork Image */}
            <div
              className="relative aspect-square overflow-hidden rounded-sm bg-[var(--warm-paper)] md:cursor-crosshair"
              onMouseEnter={() =>
                setIsZoomed(true)
              }
              onMouseMove={
                handleImageMouseMove
              }
              onMouseLeave={() =>
                setIsZoomed(false)
              }
            >
              <Image
                src={selectedImage.url}
                alt={work.title}
                fill
                priority
                sizes="(max-width: 768px) 100vw, 30vw"
                className="object-cover transition-transform duration-150 ease-out md:hidden"
              />

              <div
                className="absolute inset-0 hidden bg-no-repeat transition-opacity duration-150 md:block"
                style={{
                  backgroundImage: `url("${selectedImage.url}")`,
                  backgroundSize: isZoomed
                    ? "250%"
                    : "100%",
                  backgroundPosition: `${zoomPosition.x}% ${zoomPosition.y}%`,
                  backgroundRepeat:
                    "no-repeat",
                }}
              />

              <div
                className={`pointer-events-none absolute inset-0 bg-black transition-opacity duration-200 ${
                  isZoomed
                    ? "opacity-[0.02]"
                    : "opacity-0"
                }`}
              />

              <div
  className={`pointer-events-none absolute bottom-4 left-1/2 hidden -translate-x-1/2 bg-black/60 px-4 py-2 text-[9px] uppercase tracking-[0.18em] text-white backdrop-blur-sm transition-opacity duration-300 md:block ${
    isZoomed
      ? "opacity-0"
      : "opacity-100"
  }`}
>
  Move cursor to explore
</div>
            </div>

            {/* Image Thumbnails */}
            <div className="mt-4 grid grid-cols-3 gap-3">
              {work.images.map(
                (image, index) => (
                  <button
                    key={
                      image.publicId ||
                      index
                    }
                    type="button"
                    onClick={() =>
                      setSelectedImageIndex(
                        index
                      )
                    }
                    className={`relative aspect-square overflow-hidden border bg-[var(--warm-paper)] transition-colors ${
                      selectedImageIndex ===
                      index
                        ? "border-[var(--ochre)]"
                        : "border-black/10 hover:border-black/30"
                    }`}
                    aria-label={`View image ${
                      index + 1
                    }`}
                  >
                    <Image
                      src={image.url}
                      alt={`${work.title} image ${
                        index + 1
                      }`}
                      fill
                      sizes="(max-width: 768px) 33vw, 10vw"
                      className="object-cover"
                    />
                  </button>
                )
              )}
            </div>
          </div>

          {/* =========================
              ARTWORK DETAILS
          ========================== */}
          <div className="flex flex-col justify-center">
            <h1 className="serif mt-4 text-5xl md:text-6xl">
              {work.title}
            </h1>

            <p className="mt-4 text-sm text-[var(--muted-text)]">
              {work.year}
            </p>

            <div className="my-8 border-t border-black/10" />

            <p className="max-w-lg text-md leading-7 text-gray-600">
              {work.description}
            </p>

            {work.available && (
              <div className="mt-10">
                <p className="mb-4 text-[10px] uppercase tracking-[0.15em] text-[var(--muted-text)]">
                  Select Size
                </p>

                <div className="space-y-3">
                  {work.sizes.map(
                    (option, index) => {
                      const selected =
                        selectedSizeIndex ===
                        index;

                      return (
                        <button
                          key={`${option.size}-${index}`}
                          type="button"
                          onClick={() =>
                            setSelectedSizeIndex(
                              index
                            )
                          }
                          className={`flex w-full items-center justify-between border px-4 py-4 text-left transition-all duration-300 ${
                            selected
                              ? "border-[var(--ochre)] bg-[var(--ochre)]/[0.05]"
                              : "border-black/15 bg-white hover:border-black/30"
                          }`}
                        >
                          <div className="flex items-center gap-4">
                            <span
                              className={`flex h-4 w-4 items-center justify-center rounded-full border ${
                                selected
                                  ? "border-[var(--ochre)]"
                                  : "border-black/25"
                              }`}
                            >
                              {selected && (
                                <span className="h-2 w-2 rounded-full bg-[var(--ochre)]" />
                              )}
                            </span>

                            <div>
                              <p className="text-[11px] font-medium uppercase tracking-[0.12em]">
                                {
                                  option.size
                                }
                              </p>

                              <p className="mt-1 text-xs text-black/45">
                                {
                                  option.description
                                }
                              </p>
                            </div>
                          </div>

                          <p className="serif text-lg">
                            ETB{" "}
                            {option.price.toLocaleString()}
                          </p>
                        </button>
                      );
                    }
                  )}
                </div>
              </div>
            )}

            {/* Price */}
<div className="mt-8">
  <p className="text-[10px] uppercase tracking-[0.15em] text-[var(--muted-text)]">
    Price
  </p>

  <p className="serif mt-2 text-3xl">
    ETB{" "}
    {selectedOption.price.toLocaleString()}
  </p>

  <p className="mt-1 text-[10px] text-black/40">
    {selectedOption.size} -{" "}
    {selectedOption.description}
  </p>

  <p className="mt-3 text-[12px] tracking-[0.12em] text-black/85">
    Delivery within 5 – 7 working days
  </p>
</div>

            {/* Quantity */}
            {work.available && (
              <div className="mt-8">
                <p className="mb-3 text-[10px] uppercase tracking-[0.15em] text-[var(--muted-text)]">
                  Quantity
                </p>

                <div className="flex w-fit items-center border border-black/15 bg-white">
                  <button
                    type="button"
                    onClick={() =>
                      setQuantity(
                        (current) =>
                          Math.max(
                            1,
                            current - 1
                          )
                      )
                    }
                    className="flex h-11 w-11 items-center justify-center text-lg text-black/50 transition-colors hover:text-[var(--ochre)]"
                  >
                    -
                  </button>

                  <span className="flex h-11 w-12 items-center justify-center border-x border-black/10 text-sm">
                    {quantity}
                  </span>

                  <button
                    type="button"
                    onClick={() =>
                      setQuantity(
                        (current) =>
                          current + 1
                      )
                    }
                    className="flex h-11 w-11 items-center justify-center text-lg text-black/50 transition-colors hover:text-[var(--ochre)]"
                  >
                    +
                  </button>
                </div>
              </div>
            )}

            {/* Total */}
            {work.available && (
              <div className="mt-8 flex max-w-md items-center justify-between border-t border-black/10 pt-5">
                <p className="text-[10px] uppercase tracking-[0.15em] text-[var(--muted-text)]">
                  Total
                </p>

                <p className="serif text-2xl">
                  ETB{" "}
                  {(
                    selectedOption.price *
                    quantity
                  ).toLocaleString()}
                </p>
              </div>
            )}

            {/* Enquire / Sold */}
            <div className="mt-8">
              {work.available ? (
                <button
                  type="button"
                  onClick={handleEnquire}
                  className="w-full bg-[var(--ochre)] px-8 py-4 text-[10px] font-medium uppercase tracking-[0.18em] text-white transition-all duration-300 hover:opacity-80 md:w-auto"
                >
                  Enquire
                </button>
              ) : (
                <div className="border border-black/15 px-8 py-4 text-center text-[10px] uppercase tracking-[0.18em] text-black/50 md:w-auto">
                  Sold
                </div>
              )}
            </div>

            {/* Enquiry link */}
            {items.length > 0 && (
              <Link
                href="/enquiry"
                className="mt-4 inline-flex text-[10px] uppercase tracking-[0.15em] text-[var(--ochre)] transition-opacity hover:opacity-50"
              >
                View enquiry (
                {items.length})
              </Link>
            )}

            {/* Back */}
            <Link
              href="/shop"
              className="mt-8 inline-flex text-[10px] uppercase tracking-[0.15em] text-black/50 transition-colors hover:text-[var(--ochre)]"
            >
              Back to Collection
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}