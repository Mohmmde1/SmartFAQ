import { handleAxiosError } from "@/lib/errors";
import { JwtUtils, UrlUtils } from "@/lib/utils";
import { FAQ } from "@/types/api";
import axios from "axios";

import { NextRequest, NextResponse } from "next/server";


export async function PATCH(request: NextRequest, { params }: { params: { slug: string } }) {
    try {
        const access_token = await JwtUtils.getAccessToken(request);
        const body = await request.json();
        const { slug } = await params;
        const url = UrlUtils.makeUrl(
            process.env.NEXT_PUBLIC_BACKEND_API_BASE || "",
            "faq",
            slug
        );
        const response = await axios.patch(url, body, {
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
export async function GET(
    request: NextRequest,
    { params }: { params: { slug: string } }
) {
    try {
        const access_token = await JwtUtils.getAccessToken(request);
        const { slug } = await params;
        const url = UrlUtils.makeUrl(
            process.env.NEXT_PUBLIC_BACKEND_API_BASE || "",
            "faq",
            slug,
        );

        const response = await axios.get<FAQ>(url, {
            headers: {
                'Authorization': `Bearer ${access_token}`,
            },
        });

        return NextResponse.json(response.data);
    } catch (error: any) {
        if (axios.isAxiosError(error)) {
            const apiError = handleAxiosError(error);
            return NextResponse.json(
                { error: apiError },
                { status: error.response?.status || 400 }
            );
        }
        return NextResponse.json(
            {
                error: {
                    code: 'INTERNAL_ERROR',
                    message: 'Internal Server Error'
                }
            },
            { status: 500 }
        );
    }
}
