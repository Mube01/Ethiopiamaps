import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const client = await clientPromise;

    await client.db("admin").command({
      ping: 1,
    });

    const db = client.db(
      process.env.MONGODB_DB || "ethiopia_maps"
    );

    const collections =
      await db
        .listCollections()
        .toArray();

    return NextResponse.json({
      success: true,
      message: "MongoDB connection is working",
      database: db.databaseName,
      collections: collections.map(
        (collection: { name: any; }) => collection.name
      ),
    });
  } catch (error) {
    console.error(
      "MongoDB test failed:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Unknown MongoDB error",
      },
      {
        status: 500,
      }
    );
  }
}