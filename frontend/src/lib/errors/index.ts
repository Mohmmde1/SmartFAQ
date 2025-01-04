import { ApiError } from '@/types/api';

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

export const handleAxiosError = (error: any): ApiError => {
    if (error.response?.data) {
        return {
            code: `HTTP_${error.response.status}`,
            message: error.response.data.message || 'An error occurred',
            details: error.response.data
        };
    }

    return {
        code: 'UNKNOWN_ERROR',
        message: 'An unexpected error occurred'
    };
};
