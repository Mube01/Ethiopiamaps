import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";

import { getMongoClient } from "@/lib/mongodb";
import {
  createAdminSession,
  setAdminSessionCookie,
} from "@/lib/admin-auth";

export async function POST(
  request: NextRequest
) {
  try {
    const body = await request.json();

    const email =
      typeof body.email === "string"
        ? body.email.trim().toLowerCase()
        : "";

    const password =
      typeof body.password === "string"
        ? body.password
        : "";

    if (!email || !password) {
      return NextResponse.json(
        {
          error:
            "Email and password are required.",
        },
        {
          status: 400,
        }
      );
    }

    const client = await getMongoClient();

    const db = client.db();

    const admin =
      await db
        .collection("admins")
        .findOne({ email });

    if (!admin) {
      return NextResponse.json(
        {
          error:
            "Invalid email or password.",
        },
        {
          status: 401,
        }
      );
    }

    const passwordMatches =
      await bcrypt.compare(
        password,
        admin.passwordHash
      );

    if (!passwordMatches) {
      return NextResponse.json(
        {
          error:
            "Invalid email or password.",
        },
        {
          status: 401,
        }
      );
    }

    const { token } =
      await createAdminSession(
        admin._id
      );

    const response =
      NextResponse.json({
        success: true,
      });

    setAdminSessionCookie(
      response,
      token
    );

    return response;
  } catch (error) {
    console.error(
      "Admin login error:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Unable to sign in. Please try again.",
      },
      {
        status: 500,
      }
    );
  }
}