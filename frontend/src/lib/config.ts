const requiredEnvVars = [
    'NEXTAUTH_SECRET',
    'JWT_SECRET',
    'GOOGLE_CLIENT_ID',
    'GOOGLE_CLIENT_SECRET',
    'NEXT_PUBLIC_BACKEND_API_BASE',
] as const;

export function validateEnv() {
    const missingVars = requiredEnvVars.filter(
        envVar => !process.env[envVar]
    );

    if (missingVars.length > 0) {
        throw new Error(
            `Missing required environment variables: ${missingVars.join(', ')}`
        );
    }
}
