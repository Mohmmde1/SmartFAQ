import { NextRequest, NextResponse } from "next/server";
import { JwtUtils, UrlUtils } from "@/lib/utils";
import axios from "axios";
import { handleAxiosError } from '@/lib/errors';
import { FAQRequestBody, PaginatedResponse, FAQ } from "@/types/api";

export async function POST(request: NextRequest) {
    try {
        const access_token = await JwtUtils.getAccessToken(request);
        const body: FAQRequestBody = await request.json();
        console.log(body)
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

export async function GET(request: NextRequest) {
    try {
        const access_token = await JwtUtils.getAccessToken(request);
        const { searchParams } = new URL(request.url);
        const page = searchParams.get('page') || '1';

        const url = UrlUtils.makeUrl(
            process.env.NEXT_PUBLIC_BACKEND_API_BASE || "",
            "faq",
        );

        const response = await axios.get(`${url}?page=${page}`, {
            headers: {
                'Authorization': `Bearer ${access_token}`,
            },
        });

        const data: PaginatedResponse<FAQ> = response.data;
        return NextResponse.json(data, { status: 200 });
    } catch (error: any) {
        if (axios.isAxiosError(error)) {
            if (error.response?.data?.detail === 'Invalid page.') {
                return NextResponse.json({
                    error: {
                        code: 'INVALID_PAGE',
                        message: 'No more FAQs available',
                        details: error.response.data
                    }
                }, { status: 400 });
            }
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
