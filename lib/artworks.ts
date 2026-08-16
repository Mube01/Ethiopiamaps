import {
  Collection,
  ObjectId,
} from "mongodb";

import { getMongoClient } from "./mongodb";

export type ArtworkSize = {
  size: string;
  description: string;
  price: number;
};

export type ArtworkImage = {
  url: string;
  publicId: string;
};

export type Artwork = {
  _id?: ObjectId;

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

  createdAt?: Date;

  updatedAt?: Date;
};

export async function getArtworksCollection(): Promise<
  Collection<Artwork>
> {
  const client = await getMongoClient();

  const db = client.db(
    process.env.MONGODB_DB ||
      "ethiopia_maps"
  );

  return db.collection<Artwork>(
    "artworks"
  );
}