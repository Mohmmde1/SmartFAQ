import { getToken } from "next-auth/jwt";
import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"

export default withAuth(
    async function middleware(request) {
        console.log("=== Middleware Start ===");
        console.log("URL:", request.url);
        console.log("NextURL:", request.nextUrl);
        console.log("Path:", request.nextUrl.pathname);
        console.log("Method:", request.method);

        const token = await getToken({
            req: request,
            secret: process.env.JWT_SECRET,
            cookieName: "next-auth.session-token",
        });

        console.log("Token present:", !!token);

        const isAuthPage = request.nextUrl.pathname === '/auth';
        const isLandingPage = request.nextUrl.pathname === '/';
        const isAuthenticated = !!token;

        console.log("Route info:", {
            isAuthPage,
            isLandingPage,
            isAuthenticated
        });

        // Redirect authenticated users from landing or auth page to dashboard
        if ((isLandingPage || isAuthPage) && isAuthenticated) {
            return NextResponse.redirect(new URL("/dashboard", request.url));
        }

        // Allow unauthenticated users to access the auth page
        if (isAuthPage && !isAuthenticated) {
            return NextResponse.next();
        }

        // Allow unauthenticated users to access landing page
        if (isLandingPage && !isAuthenticated) {
            return NextResponse.next();
        }

        // Redirect unauthenticated users to auth
        if (!isAuthenticated) {
            return NextResponse.redirect(new URL("/auth", request.url));
        }

        console.log("=== Middleware End ===");
        return NextResponse.next();
    },
    {
        callbacks: {
            authorized: async ({ token }) => {
                console.log("=== Auth Callback ===");
                console.log("Token:", token);
                console.log("Timestamp:", new Date().toISOString());
                return true;
            }
        },
    }
);

export const config = {
    matcher: [
        '/',
        '/dashboard/:path*',
        '/faqs/:path*',
        '/faq/:path*',
        '/auth',
    ]
}
