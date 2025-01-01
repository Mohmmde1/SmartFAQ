import { NextResponse } from "next/server";
import { UrlUtils } from "@/lib/utils";
import { RegisterRequestBody } from "@/types/api";
import axios from "axios";
import { handleAxiosError } from '@/lib/errors';

export async function POST(request: Request) {
    try {
        const body: RegisterRequestBody = await request.json();

        const url = UrlUtils.makeUrl(
            process.env.BACKEND_API_BASE || "",
            "auth",
            "registration"
        );

        const response = await axios.post(url, body, {
            headers: {
                'Content-Type': 'application/json',
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
