import { NextResponse, type NextRequest } from "next/server";
import { verifySessionToken } from "@/server/lib/auth";

const subscriberRoutes = ["/dashboard", "/api/scores", "/api/subscription", "/api/winners/upload"];
const adminRoutes = ["/admin", "/api/admin"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isSubscriberRoute = subscriberRoutes.some((route) => pathname.startsWith(route));
  const isAdminRoute = adminRoutes.some((route) => pathname.startsWith(route));

  if (!isSubscriberRoute && !isAdminRoute) {
    return NextResponse.next();
  }

  const token = request.cookies.get("golf_charity_session")?.value;
  if (!token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  try {
    const session = await verifySessionToken(token);

    if (isAdminRoute && session.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }

    return NextResponse.next();
  } catch {
    return NextResponse.redirect(new URL("/login", request.url));
  }
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/admin/:path*",
    "/api/admin/:path*",
    "/api/scores/:path*",
    "/api/subscription/:path*",
    "/api/winners/upload/:path*",
    "/api/dashboard/:path*"
  ]
};
