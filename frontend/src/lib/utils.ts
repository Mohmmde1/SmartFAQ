import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import jwt from "jsonwebtoken";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export namespace JwtUtils {
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
