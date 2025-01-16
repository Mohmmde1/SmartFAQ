import { getToken } from "next-auth/jwt";
import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"

export default withAuth(
    async function middleware(request) {
        console.log("Middleware executed for path:", request.nextUrl.pathname);
        const token = await getToken({
            req: request,
            secret: process.env.JWT_SECRET,
            cookieName: "next-auth.session-token",
        });

        const isAuthPage = request.nextUrl.pathname === '/auth';
        const isLandingPage = request.nextUrl.pathname === '/';
        const isAuthenticated = !!token;

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

        return NextResponse.next();
    },
    {
        callbacks: {
            authorized: async ({ token }) => {
                console.log("Authorized callback called:", {
                    token,
                    timestamp: new Date().toISOString(),
                });
                return true;
            }
        },
    }
);

export const config = {
    matcher: [
        '/',
        '/dashboard/:path*',
        '/auth',
    ]
}
