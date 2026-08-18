import type { Metadata } from "next";
import ArtworkClient from "./ArtworkClient";

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

type PageProps = {
  params: Promise<{
    slug: string;
  }>;
};

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ||
  "https://ethiopiamaps.com";

async function getArtwork(
  slug: string
): Promise<Artwork | null> {
  try {
    const response = await fetch(
      `${SITE_URL}/api/artworks?slug=${encodeURIComponent(
        slug
      )}`,
      {
        cache: "no-store",
      }
    );

    if (!response.ok) {
      return null;
    }

    const data = await response.json();

    if (!data || !data.slug) {
      return null;
    }

    const images =
      Array.isArray(data.images) &&
      data.images.length > 0
        ? data.images
        : [
            {
              url: data.image || "",
              publicId:
                data.cloudinaryPublicId || "",
            },
          ];

    return {
      ...data,
      images,
    };
  } catch (error) {
    console.error(
      "Failed to fetch artwork for SEO:",
      error
    );

    return null;
  }
}

function getArtworkImage(
  artwork: Artwork
): string {
  return (
    artwork.images?.[0]?.url ||
    artwork.image ||
    ""
  );
}

function cleanDescription(
  description: string
): string {
  return description
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 155);
}

/*
 * =========================================================
 * DYNAMIC SEO METADATA
 * =========================================================
 */

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;

  const artwork = await getArtwork(slug);

  /*
   * Artwork not found
   */
  if (!artwork) {
    return {
      title: "Artwork Not Found | Ethiopia Maps",
      description:
        "The requested artwork could not be found in the Ethiopia Maps collection.",
      robots: {
        index: false,
        follow: false,
      },
    };
  }

  const title = `${artwork.title} | Ethiopia Maps`;

  const description =
    cleanDescription(
      artwork.description
    ) ||
    `Explore ${artwork.title}, an artwork from the Ethiopia Maps collection.`;

  const artworkImage =
    getArtworkImage(artwork);

  const canonicalUrl = `${SITE_URL}/shop/${artwork.slug}`;

  return {
    title,

    description,

    keywords: [
      artwork.title,
      "Ethiopia Maps",
      "Ethiopian art",
      "Ethiopian artwork",
      "Ethiopia art",
      "Ethiopian fine art",
      "art prints Ethiopia",
      "Ethiopian art prints",
      artwork.type === "local"
        ? "Ethiopian local art"
        : "international art",
    ],

    alternates: {
      canonical: canonicalUrl,
    },

    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-image-preview":
          "large",
        "max-snippet": -1,
        "max-video-preview": -1,
      },
    },

    openGraph: {
      title,
      description,
      url: canonicalUrl,
      siteName: "Ethiopia Maps",
      type: "website",
      locale: "en_US",

      ...(artworkImage
        ? {
            images: [
              {
                url: artworkImage,
                width: 1200,
                height: 1200,
                alt: artwork.title,
              },
            ],
          }
        : {}),
    },

    twitter: {
      card: "summary_large_image",
      title,
      description,

      ...(artworkImage
        ? {
            images: [
              artworkImage,
            ],
          }
        : {}),
    },

    category: "Art",
  };
}

/*
 * =========================================================
 * PAGE
 * =========================================================
 */

export default async function ArtworkPage({
  params,
}: PageProps) {
  const { slug } = await params;

  const artwork = await getArtwork(slug);

  /*
   * If artwork doesn't exist, let the client
   * component handle the visual not-found state.
   *
   * We don't use notFound() here because your
   * existing design already has a custom
   * "Artwork Not Found" screen.
   */

  return (
    <>
      <ArtworkClient
        slug={slug}
        initialArtwork={artwork}
      />

      {artwork && (
        <ArtworkStructuredData
          artwork={artwork}
        />
      )}
    </>
  );
}

/*
 * =========================================================
 * JSON-LD STRUCTURED DATA
 * =========================================================
 */

function ArtworkStructuredData({
  artwork,
}: {
  artwork: Artwork;
}) {
  const artworkImage =
    getArtworkImage(artwork);

  const canonicalUrl = `${SITE_URL}/shop/${artwork.slug}`;

  const prices = artwork.sizes
    .map((size) => size.price)
    .filter(
      (price) =>
        typeof price === "number" &&
        price > 0
    );

  const lowestPrice =
    prices.length > 0
      ? Math.min(...prices)
      : undefined;

  const highestPrice =
    prices.length > 0
      ? Math.max(...prices)
      : undefined;

  const productSchema = {
    "@context":
      "https://schema.org",

    "@type": "Product",

    name: artwork.title,

    description:
      artwork.description,

    image: artworkImage
      ? [artworkImage]
      : [],

    url: canonicalUrl,

    brand: {
      "@type": "Brand",
      name: "Ethiopia Maps",
    },

    category:
      "Ethiopian Fine Art",

    ...(artwork.available &&
    lowestPrice !== undefined
      ? {
          offers: {
            "@type":
              "AggregateOffer",

            url: canonicalUrl,

            priceCurrency: "ETB",

            lowPrice:
              lowestPrice,

            ...(highestPrice !==
            undefined
              ? {
                  highPrice:
                    highestPrice,
                }
              : {}),

            offerCount:
              artwork.sizes.length,

            availability:
              "https://schema.org/InStock",
          },
        }
      : {
          offers: {
            "@type": "Offer",

            url: canonicalUrl,

            priceCurrency: "ETB",

            availability:
              "https://schema.org/OutOfStock",
          },
        }),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(
          productSchema
        ),
      }}
    />
  );
}