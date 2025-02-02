import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import { JwtUtils, UrlUtils } from '@/lib/utils';
import { handleAxiosError } from '@/lib/errors';

interface ScrapeRequestBody {
    url: string;
}

export async function POST(request: NextRequest) {
    try {
        const access_token = await JwtUtils.getAccessToken(request);
        const body: ScrapeRequestBody = await request.json();

        const url = UrlUtils.makeUrl(
            process.env.NEXT_PUBLIC_BACKEND_API_BASE || "",
            "faq",
            "scrape",
        );

        const response = await axios.post(url, body, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${access_token}`,
            },
        });

        return NextResponse.json(response.data, { status: 200 });

    } catch (error: any) {
        if (axios.isAxiosError(error)) {
            const apiError = handleAxiosError(error);
            return NextResponse.json(
                { error: apiError },
                { status: error.response?.status || 400 }
            );
        }
        return NextResponse.json({
            error: {
                code: 'INTERNAL_ERROR',
                message: 'Failed to scrape URL'
            }
        }, { status: 500 });
    }
}
