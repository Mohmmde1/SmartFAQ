'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Link from 'next/link'
import { FcGoogle } from 'react-icons/fc'

export default function AuthPage() {
    const [isLoading, setIsLoading] = useState(false)

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault()
        setIsLoading(true)
        // Here you would implement the actual login/signup logic
        console.log('Form submitted:', event.currentTarget.getAttribute('data-form-type'))
        // Simulate a delay
        await new Promise(resolve => setTimeout(resolve, 2000))
        setIsLoading(false)
    }

    const handleGoogleLogin = async () => {
        setIsLoading(true)
        // Here you would implement the actual Google login logic
        console.log('Logging in with Google')
        // Simulate a delay
        await new Promise(resolve => setTimeout(resolve, 2000))
        setIsLoading(false)
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
                            <form onSubmit={handleSubmit} data-form-type="login" className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="login-email">Email</Label>
                                    <Input id="login-email" type="email" placeholder="Enter your email" required />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="login-password">Password</Label>
                                    <Input id="login-password" type="password" placeholder="Enter your password" required />
                                </div>
                                <Button type="submit" className="w-full" disabled={isLoading}>
                                    {isLoading ? 'Logging in...' : 'Log In'}
                                </Button>
                            </form>
                        </TabsContent>
                        <TabsContent value="signup">
                            <form onSubmit={handleSubmit} data-form-type="signup" className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="signup-name">Name</Label>
                                    <Input id="signup-name" type="text" placeholder="Enter your name" required />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="signup-email">Email</Label>
                                    <Input id="signup-email" type="email" placeholder="Enter your email" required />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="signup-password">Password</Label>
                                    <Input id="signup-password" type="password" placeholder="Create a password" required />
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
