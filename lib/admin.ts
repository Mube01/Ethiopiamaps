import crypto from "crypto";
import { ObjectId } from "mongodb";

import { getMongoClient } from "@/lib/mongodb";
import { getCurrentAdmin } from "@/lib/admin-auth";

export type AdminDocument = {
  _id?: ObjectId;
  email: string;
  passwordHash: string;
  createdAt: Date;
  updatedAt: Date;
};

export type AdminSessionDocument = {
  _id?: ObjectId;
  tokenHash: string;
  adminId: string;
  expiresAt: Date;
  createdAt: Date;
};

/*
|--------------------------------------------------------------------------
| DATABASE
|--------------------------------------------------------------------------
*/

async function getDatabase() {
  const client = await getMongoClient();

  const databaseName = process.env.MONGODB_DB;

  if (!databaseName) {
    throw new Error(
      "MONGODB_DB is not defined in .env.local"
    );
  }

  return client.db(databaseName);
}

/*
|--------------------------------------------------------------------------
| ADMIN COLLECTIONS
|--------------------------------------------------------------------------
*/

export async function getAdminsCollection() {
  const db = await getDatabase();

  return db.collection<AdminDocument>(
    "admins"
  );
}

export async function getAdminSessionsCollection() {
  const db = await getDatabase();

  return db.collection<AdminSessionDocument>(
    "admin_sessions"
  );
}

/*
|--------------------------------------------------------------------------
| PASSWORD HASHING
|--------------------------------------------------------------------------
*/

export function hashPassword(
  password: string
): string {
  const salt = crypto
    .randomBytes(16)
    .toString("hex");

  const hash = crypto
    .scryptSync(
      password,
      salt,
      64
    )
    .toString("hex");

  return `${salt}:${hash}`;
}

export function verifyPassword(
  password: string,
  storedHash: string
): boolean {
  try {
    const [salt, key] =
      storedHash.split(":");

    if (!salt || !key) {
      return false;
    }

    const derivedKey =
      crypto.scryptSync(
        password,
        salt,
        64
      );

    const storedKey =
      Buffer.from(key, "hex");

    if (
      derivedKey.length !==
      storedKey.length
    ) {
      return false;
    }

    return crypto.timingSafeEqual(
      derivedKey,
      storedKey
    );
  } catch {
    return false;
  }
}

/*
|--------------------------------------------------------------------------
| REQUIRE ADMIN
|--------------------------------------------------------------------------
|
| This is the function used by protected API
| routes such as:
|
| POST   /api/artworks
| PUT    /api/artworks/:id
| DELETE /api/artworks/:id
| POST   /api/upload
|
| Authentication is handled centrally by
| lib/admin-auth.ts.
|
*/

export async function requireAdmin() {
  return getCurrentAdmin();
}