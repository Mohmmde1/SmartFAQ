"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChartIcon, FileText, Plus, ArrowRight, Users, Clock } from "lucide-react"
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts"

// Mock data for recent FAQs
const recentFaqs = [
    { id: 1, title: "Company Policy FAQ", questionsCount: 15, createdAt: "2023-06-01" },
    { id: 2, title: "Product Features FAQ", questionsCount: 12, createdAt: "2023-05-28" },
    { id: 3, title: "Customer Support FAQ", questionsCount: 20, createdAt: "2023-05-25" },
    { id: 4, title: "Shipping and Returns FAQ", questionsCount: 10, createdAt: "2023-05-22" },
    { id: 5, title: "Technical Specifications FAQ", questionsCount: 18, createdAt: "2023-05-20" },
]

// Mock data for FAQ creation over time
const faqCreationData = [
    { month: "Jan", count: 4 },
    { month: "Feb", count: 3 },
    { month: "Mar", count: 5 },
    { month: "Apr", count: 7 },
    { month: "May", count: 6 },
    { month: "Jun", count: 8 },
]

// Mock data for FAQ categories
const faqCategoriesData = [
    { name: "Product", value: 35 },
    { name: "Support", value: 25 },
    { name: "Shipping", value: 15 },
    { name: "Billing", value: 10 },
    { name: "Other", value: 15 },
]

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"]

export default function Dashboard() {
    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-8">Dashboard</h1>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total FAQs</CardTitle>
                        <FileText className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">25</div>
                        <p className="text-xs text-muted-foreground">+2 from last month</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Questions</CardTitle>
                        <BarChartIcon className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">345</div>
                        <p className="text-xs text-muted-foreground">+24 from last month</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Avg. Questions per FAQ</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">13.8</div>
                        <p className="text-xs text-muted-foreground">+0.3 from last month</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Last FAQ Created</CardTitle>
                        <Clock className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">2 days ago</div>
                        <p className="text-xs text-muted-foreground">Company Policy FAQ</p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-8 md:grid-cols-2 mb-8">
                <Card>
                    <CardHeader>
                        <CardTitle>FAQ Creation Over Time</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={faqCreationData}>
                                <XAxis dataKey="month" />
                                <YAxis />
                                <Tooltip />
                                <Bar dataKey="count" fill="#8884d8" />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>FAQ Categories</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie
                                    data={faqCategoriesData}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    outerRadius={80}
                                    fill="#8884d8"
                                    dataKey="value"
                                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                >
                                    {faqCategoriesData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>

            <Card className="mb-8">
                <CardHeader>
                    <CardTitle>Recent FAQs</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-6">
                        {recentFaqs.map((faq) => (
                            <div key={faq.id} className="flex items-center justify-between">
                                <div>
                                    <h3 className="text-sm font-semibold">{faq.title}</h3>
                                    <p className="text-xs text-muted-foreground">
                                        {faq.questionsCount} questions • Created on {faq.createdAt}
                                    </p>
                                </div>
                                <Button variant="ghost" size="sm" asChild>
                                    <Link href={`/faq/${faq.id}`}>
                                        <ArrowRight className="h-4 w-4" />
                                    </Link>
                                </Button>
                            </div>
                        ))}
                    </div>
                    <Button variant="outline" className="w-full mt-6">
                        View All FAQs
                    </Button>
                </CardContent>
            </Card>

            <div className="flex justify-end">
                <Button>
                    <Plus className="mr-2 h-4 w-4" /> Create New FAQ
                </Button>
            </div>
        </div>
    )
}
