import NextAuth, { type User, type Session } from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import { JWT } from "next-auth/jwt"
import { signIn } from "next-auth/react";

export const authOptions = {

    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID || '',
            clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
            authorization: {
                params: {
                    redirect_uri: process.env.NEXTAUTH_URL + "/auth/callback/google",
                    scope: "openid email profile",
                    access_type: "offline", // Ensures you get a refresh token
                },
            },
        }),

    ],
    callbacks: {
        async jwt({ token, account }: { token: JWT; account?: any }) {
            console.log('jwt:', token);
            if (account) {
                console.log('account:', account);
                try {
                    const response = await fetch('http://localhost:8000/api/v1/auth/google/', {
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
                    token.accessToken = data.access_token;
                    token.refreshToken = data.refresh_token;
                    console.log(data);
                } catch (error) {
                    console.error('Error during social auth:', error);
                }
            }
            return token;
        },
        async session({ session, user }: { session: Session; user?: User }) {
            if (user) {
                // do whatever here
            }
            return session;
        },
    },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
