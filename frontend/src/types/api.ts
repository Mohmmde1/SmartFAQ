export interface ApiError {
    code: string;
    message: string;
    details?: Record<string, string[]>;
}

export interface ApiResponse<T> {
    data?: T;
    error?: ApiError;
}

export interface LoginRequestBody {
    email: string;
    password: string;
}

export interface RefreshTokenResponse {
    access: string;
    refresh: string;
}

export interface LoginResponse {
    access: string;
    refresh: string;
    user: {
        pk: number;
        email: string;
        first_name: string;
        last_name: string;
    }
}

export interface RegisterRequestBody {
    email: string;
    password1: string;
    password2: string;
    first_name?: string;
    last_name?: string;
}
