import { ApiErrorReponse, ClientApiError } from '@/types/api';

export class AppError extends Error {
    public code: string;
    public details?: Record<string, string[]>;

    constructor(message: string, code: string, details?: Record<string, string[]>) {
        super(message);
        this.code = code;
        this.details = details;
        this.name = 'AppError';
    }
}

export const handleAxiosError = (error: any): ClientApiError => {
    if (error.response?.data) {
        const responseError:ApiErrorReponse = error.response?.data;
        const detail = responseError.errors?.at(0)?.detail;
        return {
            code: `HTTP_${error.response.status}`,
            message: detail || 'An error occurred'
        };
    }

    return {
        code: 'UNKNOWN_ERROR',
        message: 'An unexpected error occurred'
    };
};
