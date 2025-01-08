import { NextRequest, NextResponse } from "next/server";
import { JwtUtils, UrlUtils } from "@/lib/utils";
import axios from "axios";
import { handleAxiosError } from '@/lib/errors';
import { getToken } from "next-auth/jwt";

interface FAQRequestBody {
    content: string;
    no_of_faqs: number;
}
export async function POST(request: NextRequest) {
    try {
        const access_token = await JwtUtils.getAccessToken(request);
        const body: FAQRequestBody = await request.json();

        const url = UrlUtils.makeUrl(
            process.env.NEXT_PUBLIC_BACKEND_API_BASE || "",
            "faq",
        );
        console.log("URL", url);
        const response = await axios.post(url, body, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${access_token}`,
            },
        });

        // dj-rest-auth returns tokens upon successful registration
        return NextResponse.json(response.data, { status: 201 });

    } catch (error: any) {
        if (axios.isAxiosError(error)) {
            const apiError = handleAxiosError(error);
            return NextResponse.json({ error: apiError },
                { status: error.response?.status || 400 }
            );
        }
        return NextResponse.json({
            error: {
                code: 'INTERNAL_ERROR',
                message: 'Internal Server Error'
            }
        }, { status: 500 });
    }
}
