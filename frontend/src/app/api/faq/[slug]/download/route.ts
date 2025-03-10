import { NextRequest, NextResponse } from 'next/server'
import axios from 'axios'
import { JwtUtils, UrlUtils } from '@/lib/utils'
import { handleAxiosError } from '@/lib/errors'

export async function GET(request: NextRequest) {
    try {
        const access_token = await JwtUtils.getAccessToken(request)
        const url = new URL(request.url)
        const parts = url.pathname.split('/')
        const slug = parts[parts.length - 2]
        console.log(url.pathname.split('/'))

        const apiUrl = UrlUtils.makeUrl(
            process.env.NEXT_PUBLIC_BACKEND_API_BASE || "",
            "faq",
            slug || "",
            "download"
        )

        const response = await axios.get(apiUrl, {
            headers: {
                'Authorization': `Bearer ${access_token}`,
            },
            responseType: 'arraybuffer'
        })

        return new NextResponse(response.data, {
            status: 200,
            headers: {
                'Content-Type': 'application/pdf',
                'Content-Disposition': `attachment; filename=faq_${slug}.pdf`
            }
        })
    } catch (error) {
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
                message: 'Failed to download PDF'
            }
        }, { status: 500 })
    }
}
