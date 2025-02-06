import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import jwt from "jsonwebtoken";
import { getToken, JWT } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";
import { RefreshTokenResponse } from "@/types/api";
import axios from "axios";


export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const JwtUtils = {
  refreshToken: async (refreshToken: string): Promise<[string | null, string | null]> => {
    try {
      const response = await axios.post<RefreshTokenResponse>(
        UrlUtils.makeUrl(
          process.env.NEXT_PUBLIC_BACKEND_API_BASE || '',
          "auth",
          "token",
          "refresh",
        ),
        { refresh: refreshToken }
      );

      return [response.data.access, response.data.refresh];
    } catch {
      return [null, null];
    }
  },

  getAccessToken: async (request: NextRequest) => {
    const token = await getToken({
      req: request,
      secret: process.env.JWT_SECRET,
    });

    if (!token) {
      throw new Error('No token found');
    }

    const oldAccessToken = token.accessToken;

    if (!oldAccessToken || isJwtExpired(oldAccessToken as string)) {
      if (!token.refreshToken) {
        throw new Error('No refresh token available');
      }

      // Refresh token
      const [newAccess, newRefresh] = await refreshToken(token.refreshToken as string);
      if (!newAccess || !newRefresh) {
        throw new Error('Failed to refresh token');
      }

      // Create updated token
      const updatedToken = {
        ...token,
        accessToken: newAccess,
        refreshToken: newRefresh
      };

      // Encode and set cookie
      const encoded = jwt.sign(updatedToken, process.env.JWT_SECRET!);
      const response = new NextResponse(null);
      response.cookies.set('next-auth.session-token', encoded, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
      });
      request.cookies.set('next-auth.session-token', encoded);

      return newAccess;
    }

    return oldAccessToken;
  },

  isJwtExpired: (token: string): boolean => {
    try {
      const currentTime = Math.round(Date.now() / 1000);
      const decoded = jwt.decode(token) as jwt.JwtPayload | null;

      if (!decoded || !decoded.exp) {
        return true;
      }

      // Add 60-second buffer for token refresh
      const expiryWithBuffer = decoded.exp - 60;
      const isExpired = currentTime >= expiryWithBuffer;

      if (process.env.NODE_ENV === 'development') {
        console.log({
          currentTime: new Date(currentTime * 1000).toISOString(),
          tokenExpiry: new Date(decoded.exp * 1000).toISOString(),
          expiryWithBuffer: new Date(expiryWithBuffer * 1000).toISOString(),
          isExpired
        });
      }

      return isExpired;
    } catch (error) {
      console.error('Error checking JWT expiry:', error);
      return true;
    }
  }
};

export const UrlUtils = {
  makeUrl: (...endpoints: string[]) => {
    const url = endpoints.reduce((prevUrl, currentPath) => {
      if (prevUrl.length === 0) {
        return prevUrl + currentPath;
      }

      return prevUrl.endsWith("/")
        ? prevUrl + currentPath + "/"
        : prevUrl + "/" + currentPath + "/";
    }, "");
    return url;
  }
};
function isJwtExpired(token: string): boolean {
  return JwtUtils.isJwtExpired(token);
}
async function refreshToken(refreshToken: string): Promise<[string | null, string | null]> {
  return JwtUtils.refreshToken(refreshToken);
}
