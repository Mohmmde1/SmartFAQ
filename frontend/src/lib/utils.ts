import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import jwt from "jsonwebtoken";
import { getToken } from "next-auth/jwt";
import { NextRequest } from "next/server";
import { RefreshTokenResponse } from "@/types/api";
import axios from "axios";
import { getServerSession } from "next-auth";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export namespace JwtUtils {
  export const refreshToken = async (refreshToken: string): Promise<[string | null, string | null]> => {
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
  };

  export const getAccessToken = async (request: NextRequest) => {
    let token = await getToken({
      req: request,
      secret: process.env.JWT_SECRET,
      cookieName: 'next-auth.session-token',
    });

    if (!token) {
      throw new Error('No token found');
    }

    let { accessToken } = token;

    // Check if access token is expired
    if (accessToken && isJwtExpired(accessToken as string)) {

      await getServerSession(); // used to invoke jwt to refersh
      token = await getToken({
        req: request,
        secret: process.env.JWT_SECRET,
        cookieName: 'next-auth.session-token',
      });
      if (!token) {
        throw new Error('No token found');
      }
      const { accessToken, refreshToken } = token;

      if (!accessToken || !refreshToken) {
        throw new Error('Failed to refresh token');
      }

      return accessToken;
    }

    return accessToken;
  }

  export const isJwtExpired = (token: string) => {
    // offset by 60 seconds, so we will check if the token is "almost expired".
    const currentTime: number = Math.round(Date.now() / 1000 + 60);
    const decoded = jwt.decode(token) as jwt.JwtPayload | null;

    console.log(`Current time + 60 seconds: ${new Date(currentTime * 1000)}`);
    if (typeof decoded === "object" && decoded !== null && "exp" in decoded) {
      if (decoded["exp"] !== undefined) {
        console.log(`Token lifetime: ${new Date(decoded["exp"] * 1000)}`);
      }
    }

    if (typeof decoded === "object" && decoded !== null && "exp" in decoded) {
      const adjustedExpiry = decoded["exp"];

      if (adjustedExpiry !== undefined && adjustedExpiry < currentTime) {
        console.log("Token expired");
        return true;
      }

      console.log("Token has not expired yet");
      return false;
    }

    console.log('Token["exp"] does not exist');
    return true;
  };
}

export namespace UrlUtils {
  export const makeUrl = (...endpoints: string[]) => {
    let url = endpoints.reduce((prevUrl, currentPath) => {
      if (prevUrl.length === 0) {
        return prevUrl + currentPath;
      }

      return prevUrl.endsWith("/")
        ? prevUrl + currentPath + "/"
        : prevUrl + "/" + currentPath + "/";
    }, "");
    return url;
  };
}
