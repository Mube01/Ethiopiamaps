import {
  NextRequest,
  NextResponse,
} from "next/server";

import {
  destroyAdminSession,
} from "@/lib/admin-auth";

export async function POST(
  request: NextRequest
) {
  const response =
    NextResponse.json({
      success: true,
    });

  await destroyAdminSession(
    request,
    response
  );

  return response;
}