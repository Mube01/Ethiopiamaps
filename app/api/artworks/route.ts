import { NextRequest, NextResponse } from "next/server";
import { getArtworksCollection } from "@/lib/artworks";
import { requireAdmin } from "@/lib/admin";

export const dynamic = "force-dynamic";

function validateImages(images: unknown): images is {
  url: string;
  publicId: string;
}[] {
  return (
    Array.isArray(images) &&
    images.length === 3 &&
    images.every(
      (image) =>
        image &&
        typeof image === "object" &&
        "url" in image &&
        "publicId" in image &&
        typeof image.url === "string" &&
        image.url.trim() !== "" &&
        typeof image.publicId === "string" &&
        image.publicId.trim() !== ""
    )
  );
}

/*
|--------------------------------------------------------------------------
| GET ALL ARTWORKS
|--------------------------------------------------------------------------
*/

export async function GET(request: NextRequest) {
  try {
    const collection =
      await getArtworksCollection();

    const slug =
      request.nextUrl.searchParams.get("slug");

    if (slug) {
      const artwork = await collection.findOne({
        slug,
      });

      if (!artwork) {
        return NextResponse.json(
          {
            error: "Artwork not found",
          },
          {
            status: 404,
          }
        );
      }

      return NextResponse.json({
        ...artwork,
        _id: artwork._id?.toString(),
      });
    }

    const artworks = await collection
      .find({})
      .sort({
        type: 1,
        createdAt: -1,
      })
      .toArray();

    return NextResponse.json(
      artworks.map((artwork) => ({
        ...artwork,
        _id: artwork._id?.toString(),
      }))
    );
  } catch (error) {
    console.error(
      "GET artworks error:",
      error
    );

    return NextResponse.json(
      {
        error: "Failed to fetch artworks",
      },
      {
        status: 500,
      }
    );
  }
}

/*
|--------------------------------------------------------------------------
| CREATE ARTWORK
|--------------------------------------------------------------------------
*/

export async function POST(
  request: NextRequest
) {
  try {
    const admin = await requireAdmin();

    if (!admin) {
      return NextResponse.json(
        {
          error: "Unauthorized.",
        },
        {
          status: 401,
        }
      );
    }

    const body = await request.json();

    const {
      slug,
      title,
      description,
      year,
      type,
      available,
      images,
      sizes,
    } = body;

    /*
     * Required fields
     */
    if (
      !slug ||
      !title ||
      !description ||
      !year ||
      !type ||
      !validateImages(images) ||
      !Array.isArray(sizes) ||
      sizes.length === 0
    ) {
      return NextResponse.json(
        {
          error:
            "Missing required artwork fields. Exactly 3 images are required.",
        },
        {
          status: 400,
        }
      );
    }

    /*
     * Local or international only
     */
    if (
      type !== "local" &&
      type !== "international"
    ) {
      return NextResponse.json(
        {
          error:
            "Artwork type must be local or international",
        },
        {
          status: 400,
        }
      );
    }

    /*
     * Validate sizes
     */
    const validSizes = sizes.every(
      (size: {
        size: string;
        description: string;
        price: number;
      }) =>
        typeof size.size === "string" &&
        size.size.trim() !== "" &&
        typeof size.description === "string" &&
        size.description.trim() !== "" &&
        typeof size.price === "number" &&
        size.price > 0
    );

    if (!validSizes) {
      return NextResponse.json(
        {
          error:
            "Every size must have a description and price",
        },
        {
          status: 400,
        }
      );
    }

    const collection =
      await getArtworksCollection();

    /*
     * Prevent duplicate slug
     */
    const existing = await collection.findOne({
      slug: String(slug),
    });

    if (existing) {
      return NextResponse.json(
        {
          error:
            "An artwork with this slug already exists",
        },
        {
          status: 409,
        }
      );
    }

    /*
     * Create artwork
     *
     * MongoDB automatically creates _id.
     */
    const artwork = {
      slug: String(slug),
      title: String(title),
      description: String(description),
      year: Number(year),

      type:
        type === "local"
          ? ("local" as const)
          : ("international" as const),

      available: Boolean(available),

      image: images[0].url,

      cloudinaryPublicId:
        images[0].publicId,

      images,

      sizes,

      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result =
      await collection.insertOne(artwork);

    /*
     * Get newly created artwork
     */
    const created =
      await collection.findOne({
        _id: result.insertedId,
      });

    return NextResponse.json(
      {
        ...created,
        _id: created?._id?.toString(),
      },
      {
        status: 201,
      }
    );
  } catch (error) {
    console.error(
      "POST artwork error:",
      error
    );

    return NextResponse.json(
      {
        error: "Failed to create artwork",
      },
      {
        status: 500,
      }
    );
  }
}
