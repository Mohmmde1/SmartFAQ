import NextAuth, { type User, type Session } from "next-auth"
import axios from "axios"
import GoogleProvider from "next-auth/providers/google"
import CredentialsProvider from "next-auth/providers/credentials";
import { JWT } from "next-auth/jwt"
import { JwtUtils, UrlUtils } from "@/lib/utils";
import { RefreshTokenResponse, LoginResponse } from "@/types/auth";
namespace NextAuthUtils {

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
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                email: { label: "Username", type: "text" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials: any, req: any) {
                const url = UrlUtils.makeUrl(
                    process.env.BACKEND_API_BASE as string,
                    "auth",
                    "login",
                );
                const response = await fetch(url, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(credentials),
                });

                const data = await response.json() as LoginResponse;
                console.log('Credentials authorize:', {
                    credentials,
                    data,
                    response,
                });
                if (response.ok && data) {
                    return {
                        id: data.user.pk.toString(),
                        email: data.user.email,
                        name: data.user.first_name,
                        accessToken: data.access,
                        refreshToken: data.refresh
                    }
                }
                return null;
            }
        }),
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID as string,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
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
            if (account && account.provider && account.provider === "google") {
                try {
                    const url = UrlUtils.makeUrl(
                        process.env.BACKEND_API_BASE as string,
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
