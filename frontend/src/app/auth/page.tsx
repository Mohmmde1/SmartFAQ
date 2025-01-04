'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Link from 'next/link'
import { FcGoogle } from 'react-icons/fc'
import { toast } from "sonner"
import { SignUpFormData } from '@/types/auth'
import { AppError } from '@/lib/errors';
import { LoginRequestBody } from '@/types/api'

export default function AuthPage() {
    const [isLoading, setIsLoading] = useState(false)
    const handleSignUp = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault()
        setIsLoading(true)

        const formData = new FormData(event.currentTarget)
        const data: SignUpFormData = {
            email: formData.get('signup-email') as string,
            password1: formData.get('signup-password') as string,
            password2: formData.get('signup-password') as string,
            first_name: formData.get('signup-name') as string,
        }
        console.log('Form submitted:', data)

        try {
            const response = await fetch('/api/auth/signup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            })

            const result = await response.json()

            if (!response.ok) {
                throw new AppError(
                    result.error.message,
                    result.error.code,
                    result.error.details
                );
            }

            toast.success("Registration successful!")
            // Auto sign in after registration
            await signIn('credentials', {
                email: data.email,
                password: data.password1,
                callbackUrl: '/'
            })
        } catch (error) {
            if (error instanceof AppError) {
                toast.error(error.message);
                // Handle field-specific errors
                if (error.details) {
                    Object.entries(error.details).forEach(([field, messages]) => {
                        toast.error(`${field}: ${messages.join(', ')}`);
                    });
                }
            } else {
                toast.error('An unexpected error occurred');
            }
        } finally {
            setIsLoading(false)
        }
    }
    const handleLogin = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault()
        setIsLoading(true)

        const formData = new FormData(event.currentTarget)
        const data: LoginRequestBody = {
            email: formData.get('login-email') as string,
            password: formData.get('login-password') as string,
        }

        try {
            const result = await signIn('credentials', {
                email: data.email,
                password: data.password,
                redirect: false,
            })

            if (result?.error) {
                console.log('Login failed:', result.error)
                throw new Error('Login failed')
            }

            if (result?.ok) {
                toast.success('Logged in successfully')
                window.location.href = '/'
            }
        } catch (error) {
            console.log('Error logging in:', error)
            toast.error('Invalid credentials')

        } finally {
            setIsLoading(false)
        }
    }

    const handleGoogleLogin = async () => {
        setIsLoading(true)
        try {
            await signIn('google', { callbackUrl: '/' })
        } catch (error) {
            console.error('Error signing in with Google', error)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="container mx-auto flex items-center justify-center min-h-screen py-12 px-4 sm:px-6 lg:px-8">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle className="text-2xl font-bold text-center">Welcome to SmartFAQ</CardTitle>
                    <CardDescription className="text-center">
                        Sign in to your account or create a new one
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Tabs defaultValue="login" className="w-full">
                        <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="login">Login</TabsTrigger>
                            <TabsTrigger value="signup">Sign Up</TabsTrigger>
                        </TabsList>
                        <TabsContent value="login">
                            <form onSubmit={handleLogin} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="login-email">Email</Label>
                                    <Input
                                        id="login-email"
                                        name="login-email"
                                        type="email"
                                        placeholder="Enter your email"
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="login-password">Password</Label>
                                    <Input
                                        id="login-password"
                                        name="login-password"
                                        type="password"
                                        placeholder="Enter your password"
                                        required
                                    />
                                </div>
                                <Button type="submit" className="w-full" disabled={isLoading}>
                                    {isLoading ? 'Logging in...' : 'Log In'}
                                </Button>
                            </form>
                        </TabsContent>
                        <TabsContent value="signup">
                            <form onSubmit={handleSignUp} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="name">Name</Label>
                                    <Input
                                        id="signup-name"
                                        name="signup-name"
                                        type="text"
                                        placeholder="Enter your name"
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="email">Email</Label>
                                    <Input
                                        id="signup-email"
                                        name="signup-email"
                                        type="email"
                                        placeholder="Enter your email"
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="password">Password</Label>
                                    <Input
                                        id="signup-password"
                                        name="signup-password"
                                        type="password"
                                        placeholder="Create a password"
                                        required
                                    />
                                </div>
                                <Button type="submit" className="w-full" disabled={isLoading}>
                                    {isLoading ? 'Signing up...' : 'Sign Up'}
                                </Button>
                            </form>
                        </TabsContent>
                    </Tabs>
                    <div className="mt-6">
                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <span className="w-full border-t" />
                            </div>
                            <div className="relative flex justify-center text-xs uppercase">
                                <span className="bg-background px-2 text-muted-foreground">
                                    Or continue with
                                </span>
                            </div>
                        </div>
                        <Button
                            onClick={handleGoogleLogin}
                            disabled={isLoading}
                            className="w-full mt-6 flex items-center justify-center space-x-2"
                            variant="outline"
                        >
                            <FcGoogle className="w-5 h-5" />
                            <span>{isLoading ? 'Logging in...' : 'Continue with Google'}</span>
                        </Button>
                    </div>
                </CardContent>
                <CardFooter className="flex justify-center">
                    <Link href="/" className="text-sm text-muted-foreground hover:text-primary">
                        Back to Home
                    </Link>
                </CardFooter>
            </Card>
        </div>
    )
}
