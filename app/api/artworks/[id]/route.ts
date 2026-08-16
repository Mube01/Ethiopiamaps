import { NextRequest, NextResponse } from "next/server";
import { ObjectId } from "mongodb";
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
| GET ONE ARTWORK
|--------------------------------------------------------------------------
*/

export async function GET(
  request: NextRequest,
  context: {
    params: Promise<{ id: string }>;
  }
) {
  try {
    const { id } = await context.params;

    /*
     * Check MongoDB ObjectId
     */
    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        {
          error: "Invalid artwork ID",
        },
        {
          status: 400,
        }
      );
    }

    const collection =
      await getArtworksCollection();

    const artwork = await collection.findOne({
      _id: new ObjectId(id),
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
  } catch (error) {
    console.error(
      "GET artwork error:",
      error
    );

    return NextResponse.json(
      {
        error: "Failed to fetch artwork",
      },
      {
        status: 500,
      }
    );
  }
}

/*
|--------------------------------------------------------------------------
| UPDATE ARTWORK
|--------------------------------------------------------------------------
*/

export async function PUT(
  request: NextRequest,
  context: {
    params: Promise<{ id: string }>;
  }
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

    const { id } = await context.params;

    /*
     * Validate MongoDB ID
     */
    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        {
          error: "Invalid artwork ID",
        },
        {
          status: 400,
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
     * Validate required fields
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
     * Only local OR international
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
     * Find existing artwork
     */
    const existing = await collection.findOne({
      _id: new ObjectId(id),
    });

    if (!existing) {
      return NextResponse.json(
        {
          error: "Artwork not found",
        },
        {
          status: 404,
        }
      );
    }

    /*
     * Update artwork
     */
    await collection.updateOne(
      {
        _id: new ObjectId(id),
      },
      {
        $set: {
          slug: String(slug),
          title: String(title),
          description: String(description),
          year: Number(year),
          type:
            type === "local"
              ? "local"
              : "international",
          available: Boolean(available),
          image: images[0].url,
          cloudinaryPublicId:
            images[0].publicId,
          images,
          sizes,
          updatedAt: new Date(),
        },
      }
    );

    /*
     * Get updated artwork
     */
    const updated =
      await collection.findOne({
        _id: new ObjectId(id),
      });

    if (!updated) {
      return NextResponse.json(
        {
          error:
            "Artwork could not be retrieved after update",
        },
        {
          status: 500,
        }
      );
    }

    return NextResponse.json({
      ...updated,
      _id: updated._id?.toString(),
    });
  } catch (error) {
    console.error(
      "PUT artwork error:",
      error
    );

    return NextResponse.json(
      {
        error: "Failed to update artwork",
      },
      {
        status: 500,
      }
    );
  }
}

/*
|--------------------------------------------------------------------------
| DELETE ARTWORK
|--------------------------------------------------------------------------
*/

export async function DELETE(
  request: NextRequest,
  context: {
    params: Promise<{ id: string }>;
  }
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

    const { id } = await context.params;

    /*
     * Validate MongoDB ID
     */
    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        {
          error: "Invalid artwork ID",
        },
        {
          status: 400,
        }
      );
    }

    const collection =
      await getArtworksCollection();

    /*
     * Find artwork first
     */
    const artwork = await collection.findOne({
      _id: new ObjectId(id),
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

    /*
     * Delete
     */
    await collection.deleteOne({
      _id: new ObjectId(id),
    });

    return NextResponse.json({
      success: true,
      deletedId: id,
    });
  } catch (error) {
    console.error(
      "DELETE artwork error:",
      error
    );

    return NextResponse.json(
      {
        error: "Failed to delete artwork",
      },
      {
        status: 500,
      }
    );
  }
}
