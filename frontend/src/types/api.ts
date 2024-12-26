export interface ApiError {
    code: string;
    message: string;
    details?: Record<string, string[]>;
}

export interface ApiResponse<T> {
    data?: T;
    error?: ApiError;
}
