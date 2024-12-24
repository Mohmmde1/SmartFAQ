import NextAuth, { type User, type Session } from "next-auth"
import axios from "axios"
import GoogleProvider from "next-auth/providers/google"
import { JWT } from "next-auth/jwt"
import { JwtUtils, UrlUtils } from "@/lib/utils";

namespace NextAuthUtils {
    interface RefreshTokenResponse {
        access: string;
        refresh: string;
    }

    export const refreshToken = async function (refreshToken: string): Promise<[string | null, string | null]> {
        try {
            const response = await axios.post<RefreshTokenResponse>(
                UrlUtils.makeUrl(
                    process.env.BACKEND_API_BASE || '',
                    "auth",
                    "token",
                    "refresh",
                ),
                {
                    refresh: refreshToken,
                },
            );

            const { access, refresh } = response.data;
            return [access, refresh];
        } catch {
            return [null, null];
        }
    };
}

export const authOptions = {
    secret: process.env.NEXTAUTH_SECRET,
    session: {
        jwt: true,
        maxAge: 24 * 60 * 60, // 24 hours
    },
    jwt: {
        secret: process.env.JWT_SECRET,
    },
    debug: process.env.NODE_ENV === "development",
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID || '',
            clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
            authorization: {
                params: {
                    scope: "openid email profile",
                    access_type: "offline", // Ensures you get a refresh token
                },
            },
        }),

    ],
    callbacks: {
        async jwt({ token, account }: { token: JWT; account?: any }) {
            console.log('JWT Callback Called:', {
                hasAccount: !!account,
                hasToken: !!token,
                tokenExpired: token.accessToken ? JwtUtils.isJwtExpired(token.accessToken as string) : null,
                timestamp: new Date().toISOString()
            });

            // Initial sign in
            if (account) {
                try {
                    const url = UrlUtils.makeUrl(
                        process.env.BACKEND_API_BASE || '',
                        "auth",
                        "google",
                    );
                    const response = await fetch(url, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            access_token: account.access_token,
                            id_token: account.id_token,
                        }),
                    });

                    const data = await response.json();
                    token.accessToken = data.access;
                    token.refreshToken = data.refresh;
                    return token;
                } catch (error) {
                    console.error('Error during social auth:', error);
                }
            } else if (token) {
                console.log("Checking token expiration");
                if (token.accessToken && JwtUtils.isJwtExpired(token.accessToken as string)) {
                    console.log("Token expired, refreshing token");
                    if (token.refreshToken) {
                        const [accessToken, refreshToken] = await NextAuthUtils.refreshToken(token.refreshToken as string);
                        if (accessToken && refreshToken) {
                            token.accessToken = accessToken;
                            token.refreshToken = refreshToken;
                        }
                    } else {
                        delete token.accessToken;
                        delete token.refreshToken;
                        console.log("No refresh token found");
                    }
                }
            }

            return token;
        },
        async session({ session, user }: { session: Session; user?: User }) {
            return session;
        },
    },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
