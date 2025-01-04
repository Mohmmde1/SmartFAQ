export interface AuthUser {
    id: string;
    email: string;
    name?: string;
    accessToken: string;
    refreshToken: string;
}

export interface SignUpFormData {
    email: string;
    password1: string;
    password2: string;
    first_name?: string;
    last_name?: string;
}
