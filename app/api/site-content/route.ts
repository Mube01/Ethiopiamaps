import { NextResponse } from "next/server";
import { getMongoClient } from "@/lib/mongodb";
import { ObjectId } from "mongodb";

const DATABASE_NAME = "ethiopia_maps";
const COLLECTION_NAME = "siteContent";

const DEFAULT_TAGLINE =
  "Beautifully crafted maps celebrating\nEthiopia & Africa's cities.";

const DEFAULT_ABOUT_CONTENT = `Ethiopia Maps is a visual mapping platform created to explore, document, and celebrate Ethiopian cities through art and design.

The project began from a simple observation: despite Ethiopia's rich history, diverse cultures, and distinctive cities, there is still a limited visual language through which these places are represented and remembered.

Much of what we see of our cities comes through photographs, satellite imagery, or conventional maps. Ethiopia Maps aims to add something different — a more personal and artistic way of seeing the places we call home.

Each map is individually researched and designed to capture the character of a city, bringing together its streets, landscape, architecture, history, and everyday identity. The goal is not simply to show where a city is, but to create something that makes you look at it, recognize it, and perhaps see it differently.

Founded by Nahom, an architect and visual artist, the project begins in Ethiopia with a growing collection of cities and hopes to contribute to a stronger visual culture around the places that make Ethiopia — and eventually Africa — what it is.

These are maps of places worth remembering.`;

type SiteContentDocument = {
  _id?: ObjectId;
  key: string;
  homeTagline: string;
  aboutContent: string;
  createdAt?: Date;
  updatedAt?: Date;
};

export async function GET() {
  try {
    const client = await getMongoClient();

    const db = client.db(DATABASE_NAME);

    const collection =
      db.collection<SiteContentDocument>(
        COLLECTION_NAME
      );

    let content = await collection.findOne({
      key: "main",
    });

    /*
     * Create the document if it doesn't exist.
     */
    if (!content) {
      const newContent: SiteContentDocument = {
        key: "main",
        homeTagline: DEFAULT_TAGLINE,
        aboutContent: DEFAULT_ABOUT_CONTENT,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const result =
        await collection.insertOne(newContent);

      content = {
        ...newContent,
        _id: result.insertedId,
      };
    }

    return NextResponse.json(
      {
        homeTagline:
          typeof content.homeTagline === "string" &&
          content.homeTagline.trim()
            ? content.homeTagline
            : DEFAULT_TAGLINE,

        aboutContent:
          typeof content.aboutContent === "string" &&
          content.aboutContent.trim()
            ? content.aboutContent
            : DEFAULT_ABOUT_CONTENT,
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    console.error(
      "GET /api/site-content error:",
      error
    );

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to load site content.",
      },
      {
        status: 500,
      }
    );
  }
}

export async function PUT(
  request: Request
) {
  try {
    const client = await getMongoClient();

    const db = client.db(DATABASE_NAME);

    const collection =
      db.collection<SiteContentDocument>(
        COLLECTION_NAME
      );

    let body: {
      homeTagline?: unknown;
      aboutContent?: unknown;
    };

    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        {
          error:
            "Invalid JSON request body.",
        },
        {
          status: 400,
        }
      );
    }

    const existing =
      await collection.findOne({
        key: "main",
      });

    /*
     * IMPORTANT:
     * An empty string is allowed when saving.
     * We only use defaults when a value wasn't
     * supplied at all.
     */
    const homeTagline =
      typeof body.homeTagline === "string"
        ? body.homeTagline
        : existing?.homeTagline ??
          DEFAULT_TAGLINE;

    const aboutContent =
      typeof body.aboutContent === "string"
        ? body.aboutContent
        : existing?.aboutContent ??
          DEFAULT_ABOUT_CONTENT;

    await collection.updateOne(
      {
        key: "main",
      },
      {
        $set: {
          homeTagline,
          aboutContent,
          updatedAt: new Date(),
        },

        $setOnInsert: {
          key: "main",
          createdAt: new Date(),
        },
      },
      {
        upsert: true,
      }
    );

    const updated =
      await collection.findOne({
        key: "main",
      });

    if (!updated) {
      throw new Error(
        "Content was saved but could not be retrieved."
      );
    }

    return NextResponse.json(
      {
        homeTagline:
          updated.homeTagline?.trim()
            ? updated.homeTagline
            : DEFAULT_TAGLINE,

        aboutContent:
          updated.aboutContent?.trim()
            ? updated.aboutContent
            : DEFAULT_ABOUT_CONTENT,
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    console.error(
      "PUT /api/site-content error:",
      error
    );

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to save site content.",
      },
      {
        status: 500,
      }
    );
  }
}