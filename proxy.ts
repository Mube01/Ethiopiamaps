import {
  NextRequest,
  NextResponse,
} from "next/server";

import {
  isAdminAuthenticated,
} from "@/lib/admin-auth";

export async function proxy(
  request: NextRequest
) {
  const { pathname } = request.nextUrl;

  /*
  |--------------------------------------------------------------------------
  | Protect admin dashboard
  |--------------------------------------------------------------------------
  */

  if (
    pathname.startsWith("/admin") &&
    pathname !== "/admin/login"
  ) {
    const authenticated =
      await isAdminAuthenticated(
        request
      );

    if (!authenticated) {
      const loginUrl = new URL(
        "/admin/login",
        request.url
      );

      loginUrl.searchParams.set(
        "from",
        pathname
      );

      return NextResponse.redirect(
        loginUrl
      );
    }
  }

  /*
  |--------------------------------------------------------------------------
  | Redirect authenticated admins away from login
  |--------------------------------------------------------------------------
  */

  if (
    pathname === "/admin/login"
  ) {
    const authenticated =
      await isAdminAuthenticated(
        request
      );

    if (authenticated) {
      return NextResponse.redirect(
        new URL(
          "/admin",
          request.url
        )
      );
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin/:path*",
  ],
};