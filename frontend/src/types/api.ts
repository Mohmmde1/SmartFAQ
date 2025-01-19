export interface PaginationError {
    detail: string;
}

export interface ApiError {
    code: string;
    message: string;
    details?: Record<string, string[]> | PaginationError;
}

export type ApiResponse<T> = {
    data?: T;
    error?: ApiError;
}

export type LoginRequestBody = {
    email: string;
    password: string;
}

export type RefreshTokenResponse = {
    access: string;
    refresh: string;
}

export type LoginResponse = {
    access: string;
    refresh: string;
    user: {
        pk: number;
        email: string;
        first_name: string;
        last_name: string;
    }
}

export type RegisterRequestBody = {
    email: string;
    password1: string;
    password2: string;
    first_name?: string;
    last_name?: string;
}

export type QuestionAnswer = {
    id: number;
    question: string;
    answer: string;
}

export type FAQ = {
    id: number;
    user: number;
    title: string;
    content: string;
    generated_faqs: QuestionAnswer[];
    number_of_faqs: number;
    created_at: string;
    updated_at: string;
}

export type FAQRequestBody = {
    content: string;
    number_of_faqs: number;
}

export type FAQListResponse = {
    count: number;
    next?: string;
    previous?: string;
    results: FAQ[] | null;
}

export interface PaginatedResponse<T> {
    count: number;
    next: string | null;
    previous: string | null;
    results: T[];
}
