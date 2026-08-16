import crypto from "crypto";
import { ObjectId } from "mongodb";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

import { getMongoClient } from "@/lib/mongodb";

const SESSION_COOKIE = "admin_session";

const SESSION_DURATION = 7 * 24 * 60 * 60 * 1000;

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
| SESSION TOKEN
|--------------------------------------------------------------------------
*/

function createSessionToken() {
  return crypto.randomBytes(32).toString("hex");
}

function hashSessionToken(token: string) {
  return crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");
}

/*
|--------------------------------------------------------------------------
| CREATE ADMIN SESSION
|--------------------------------------------------------------------------
*/

export async function createAdminSession(
  adminId: ObjectId | string
) {
  const db = await getDatabase();

  const token = createSessionToken();

  const tokenHash = hashSessionToken(token);

  const now = new Date();

  const expiresAt = new Date(
    now.getTime() + SESSION_DURATION
  );

  const adminIdString =
    adminId instanceof ObjectId
      ? adminId.toString()
      : adminId;

  await db.collection("admin_sessions").insertOne({
    tokenHash,
    adminId: adminIdString,
    createdAt: now,
    expiresAt,
  });

  return {
    token,
    expiresAt,
  };
}

/*
|--------------------------------------------------------------------------
| SET COOKIE
|--------------------------------------------------------------------------
*/

export function setAdminSessionCookie(
  response: NextResponse,
  token: string
) {
  response.cookies.set({
    name: SESSION_COOKIE,
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: Math.floor(
      SESSION_DURATION / 1000
    ),
  });
}

/*
|--------------------------------------------------------------------------
| GET AUTHENTICATED ADMIN
|--------------------------------------------------------------------------
*/

export async function getAuthenticatedAdmin(
  token: string | undefined
) {
  if (!token) {
    return null;
  }

  try {
    const db = await getDatabase();

    const tokenHash = hashSessionToken(token);

    const session =
      await db.collection("admin_sessions").findOne({
        tokenHash,
        expiresAt: {
          $gt: new Date(),
        },
      });

    if (!session) {
      return null;
    }

    const adminId = session.adminId;

    if (!adminId) {
      return null;
    }

    let objectId: ObjectId;

    try {
      objectId = new ObjectId(
        adminId.toString()
      );
    } catch {
      return null;
    }

    const admin =
      await db.collection("admins").findOne({
        _id: objectId,
      });

    if (!admin) {
      return null;
    }

    return admin;
  } catch (error) {
    console.error(
      "Get authenticated admin error:",
      error
    );

    return null;
  }
}

/*
|--------------------------------------------------------------------------
| CHECK AUTHENTICATION
|--------------------------------------------------------------------------
*/

export async function isAdminAuthenticated(
  request: NextRequest
) {
  const token =
    request.cookies.get(
      SESSION_COOKIE
    )?.value;

  const admin =
    await getAuthenticatedAdmin(token);

  return Boolean(admin);
}

/*
|--------------------------------------------------------------------------
| CURRENT ADMIN
|--------------------------------------------------------------------------
*/

export async function getCurrentAdmin() {
  const cookieStore = await cookies();

  const token =
    cookieStore.get(
      SESSION_COOKIE
    )?.value;

  return getAuthenticatedAdmin(token);
}

/*
|--------------------------------------------------------------------------
| DELETE SESSION
|--------------------------------------------------------------------------
*/

export async function destroyAdminSession(
  request: NextRequest,
  response: NextResponse
) {
  const token =
    request.cookies.get(
      SESSION_COOKIE
    )?.value;

  if (token) {
    try {
      const db = await getDatabase();

      const tokenHash =
        hashSessionToken(token);

      await db
        .collection("admin_sessions")
        .deleteOne({
          tokenHash,
        });
    } catch (error) {
      console.error(
        "Destroy admin session error:",
        error
      );
    }
  }

  response.cookies.set({
    name: SESSION_COOKIE,
    value: "",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
}