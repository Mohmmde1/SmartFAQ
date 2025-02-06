import { getServerSession } from "next-auth";
import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"
import { authOptions } from "./app/api/auth/config";

export default withAuth(
    async function middleware(request) {
        console.log("=== Middleware Start ===");
        console.log("URL:", request.url);
        console.log("Path:", request.nextUrl.pathname);
        console.log("Method:", request.method);
        console.log("Headers:", Object.fromEntries(request.headers));

        const session = await getServerSession(authOptions);

        console.log("Session present:", !!session);
        if (session) {
            console.log("Session data:", {
                user: session.user,
                expires: session.expires,
                accessToken: !!session.accessToken
            });
        }

        const isAuthPage = request.nextUrl.pathname === '/auth';
        const isLandingPage = request.nextUrl.pathname === '/';
        const isAuthenticated = !!session;

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
            authorized: async ({ req }) => {
                console.log("=== Auth Callback ===");
                const session = await getServerSession(authOptions);
                console.log("Session:", session);
                console.log("Timestamp:", new Date().toISOString());
                return !!session;
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
