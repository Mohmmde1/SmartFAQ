import { NextRequest, NextResponse } from 'next/server'
import axios from 'axios'
import { JwtUtils, UrlUtils } from '@/lib/utils'
import { handleAxiosError } from '@/lib/errors'

export async function POST(request: NextRequest) {
    try {
        const access_token = await JwtUtils.getAccessToken(request)
        const formData = await request.formData()

        const url = UrlUtils.makeUrl(
            process.env.NEXT_PUBLIC_BACKEND_API_BASE || "",
            "faq",
            "upload-pdf"
        )

        const response = await axios.post(url, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
                'Authorization': `Bearer ${access_token}`,
            },
        })

        return NextResponse.json(response.data, { status: 200 })

    } catch (error: any) {
        if (axios.isAxiosError(error)) {
            const apiError = handleAxiosError(error)
            return NextResponse.json(
                { error: apiError },
                { status: error.response?.status || 400 }
            )
        }
        return NextResponse.json({
            error: {
                code: 'INTERNAL_ERROR',
                message: 'Failed to process PDF'
            }
        }, { status: 500 })
    }
}
