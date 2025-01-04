import NextAuth, { type User, type Session } from "next-auth"
import axios from "axios"
import GoogleProvider from "next-auth/providers/google"
import CredentialsProvider from "next-auth/providers/credentials";
import { JWT } from "next-auth/jwt"
import { JwtUtils, UrlUtils } from "@/lib/utils";
import { RefreshTokenResponse, LoginResponse } from "@/types/api";
import { AppError, handleAxiosError } from "@/lib/errors";
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
                try {
                    const url = UrlUtils.makeUrl(
                        process.env.BACKEND_API_BASE as string,
                        "auth",
                        "login",
                    );
                    const response = await axios.post(url, credentials);

                    const data: LoginResponse = response.data;

                    return {
                        id: data.user.pk.toString(),
                        email: data.user.email,
                        name: data.user.first_name + " " + data.user.last_name,
                        accessToken: data.access,
                        refreshToken: data.refresh
                    };

                } catch (error) {
                    if (axios.isAxiosError(error)) {
                        // Authentication failed
                        if (error.response?.status === 401) {
                            return null; // NextAuth will handle redirect
                        }

                        // Validation errors (400)
                        if (error.response?.status === 400) {
                            throw new AppError(
                                'Invalid credentials',
                                'INVALID_CREDENTIALS',
                                error.response.data
                            );
                        }

                        // Server errors (500+)
                        throw new AppError(
                            'Authentication service unavailable',
                            'AUTH_SERVICE_ERROR'
                        );
                    }

                    // Unknown errors
                    throw new AppError(
                        'An unexpected error occurred',
                        'UNKNOWN_ERROR'
                    );
                }
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
        async jwt({ token, account, user }: { token: JWT; account?: any, user?: any }) {
            try {
                console.log('JWT Callback Called:', {
                    hasUser: !!user,
                    hasAccount: !!account,
                    hasToken: !!token,
                    tokenExpired: token.accessToken ?
                        JwtUtils.isJwtExpired(token.accessToken as string) : null,
                    timestamp: new Date().toISOString(),
                });

                // Initial sign in with Google
                if (account?.provider === "google") {
                    const url = UrlUtils.makeUrl(
                        process.env.BACKEND_API_BASE as string,
                        "auth",
                        "google",
                    );
                    console.log("URL:", url);
                    const response = await axios.post(url, {
                        access_token: account.access_token,
                        id_token: account.id_token,
                    });

                    token.accessToken = response.data.access;
                    token.refreshToken = response.data.refresh;
                    return token;
                }

                // Initial sign in with credentials
                if (account?.provider === "credentials" && user) {
                    token.accessToken = user.accessToken;
                    token.refreshToken = user.refreshToken;
                    return token;
                }

                // Token refresh check
                if (token.accessToken && JwtUtils.isJwtExpired(token.accessToken as string)) {
                    if (!token.refreshToken) {
                        delete token.accessToken;
                        delete token.refreshToken;
                        return token;
                    }

                    const [newAccess, newRefresh] = await NextAuthUtils.refreshToken(
                        token.refreshToken as string
                    );

                    if (newAccess && newRefresh) {
                        token.accessToken = newAccess;
                        token.refreshToken = newRefresh;
                    } else {
                        delete token.accessToken;
                        delete token.refreshToken;
                    }
                }

                return token;
            } catch (error) {
                console.error('JWT callback error:', error);
                delete token.accessToken;
                delete token.refreshToken;
                return token;
            }
        },
    },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
