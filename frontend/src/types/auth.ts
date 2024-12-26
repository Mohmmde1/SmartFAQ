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

export interface SignUpFormData {
    email: string;
    password1: string;
    password2: string;
    first_name?: string;
    last_name?: string;
}


export interface RegisterRequestBody {
    email: string;
    password1: string;
    password2: string;
    first_name?: string;
    last_name?: string;
}

export interface AuthUser {
    id: string;
    email: string;
    name?: string;
    accessToken: string;
    refreshToken: string;
}
