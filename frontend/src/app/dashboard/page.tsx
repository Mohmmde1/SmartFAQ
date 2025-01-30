"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChartIcon, FileText, Plus, ArrowRight, Users, Clock } from "lucide-react"
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useFAQs } from "@/hooks/useFAQs"
import { formatDistance } from "date-fns"
import { useStatistics } from '@/hooks/useStatistics'

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"]

export default function Dashboard() {
    const { faqs, isFetchingFaqs } = useFAQs()
    const { data: stats, isLoading: isLoadingStats } = useStatistics()

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-8">Dashboard</h1>

            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total FAQs</CardTitle>
                        <FileText className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {isLoadingStats ? "..." : stats?.total_faqs}
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Questions</CardTitle>
                        <BarChartIcon className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {isLoadingStats ? "..." : stats?.total_questions}
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Avg. Questions per FAQ</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {isLoadingStats ? "..." : stats?.avg_questions_per_faq}
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Last FAQ Created</CardTitle>
                        <Clock className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        {stats?.last_faq_created && (
                            <>
                                <div className="text-2xl font-bold">
                                    {formatDistance(new Date(stats.last_faq_created.created_at), new Date(), {
                                        addSuffix: true,
                                    })}
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    {stats.last_faq_created.title}
                                </p>
                            </>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Main Content Grid */}
            <div className="grid gap-8 lg:grid-cols-2">
                {/* Recent FAQs - Left Column */}
                <Card className="h-full">
                    <CardHeader>
                        <CardTitle>Recent FAQs</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ScrollArea className="h-[400px]">
                            <div className="space-y-6">
                                {isFetchingFaqs ? (
                                    <div className="flex items-center justify-center h-[300px]">
                                        <div className="animate-spin">Loading...</div>
                                    </div>
                                    // ) : error ? (
                                    //     <div className="text-destructive text-center">{error}</div>
                                ) : faqs.length === 0 ? (
                                    <div className="text-muted-foreground text-center">
                                        No FAQs created yet
                                    </div>
                                ) : (
                                    faqs.map((faq) => (
                                        <div key={faq.id} className="flex items-center justify-between">
                                            <div>
                                                <h3 className="text-sm font-semibold">{faq.title}</h3>
                                                <p className="text-xs text-muted-foreground">
                                                    {faq.generated_faqs.length} questions • Created{' '}
                                                    {formatDistance(new Date(faq.created_at), new Date(), {
                                                        addSuffix: true,
                                                    })}
                                                </p>
                                            </div>
                                            <Button variant="ghost" size="sm" asChild>
                                                <Link href={`/faq/${faq.id}`}>
                                                    <ArrowRight className="h-4 w-4" />
                                                </Link>
                                            </Button>
                                        </div>
                                    ))
                                )}
                            </div>
                        </ScrollArea>
                        <Button variant="outline" className="w-full mt-6" asChild>
                            <Link href="/faqs">View All FAQs</Link>
                        </Button>
                    </CardContent>
                </Card>

                {/* Charts - Right Column */}
                <div className="space-y-4">
                    {/* Pie Chart */}
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle>FAQ Categories</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ResponsiveContainer width="100%" height={200}>
                                <PieChart>
                                    <Pie
                                        data={stats?.tones}
                                        cx="50%"
                                        cy="50%"
                                        labelLine={false}
                                        outerRadius={80}
                                        fill="#8884d8"
                                        dataKey="value"
                                        label={({ tone, percent }) =>
                                            `${tone} ${(percent * 100).toFixed(0)}%`
                                        }
                                    >
                                        {stats?.tones.map((entry, index) => (
                                            <Cell
                                                key={`cell-${index}`}
                                                fill={COLORS[index % COLORS.length]}
                                            />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                </PieChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>

                    {/* Bar Chart */}
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle>FAQ Creation Over Time</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ResponsiveContainer width="100%" height={200}>
                                {stats?.daily_trends && stats.daily_trends.length > 0 ? (
                                    <BarChart
                                        data={stats.daily_trends}
                                        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                                    >
                                        <XAxis
                                            dataKey="day"
                                            tick={{ fontSize: 12 }}
                                        />
                                        <YAxis
                                            allowDecimals={false}
                                            tick={{ fontSize: 12 }}
                                            domain={[0, 'dataMax + 1']}
                                        />
                                        <Tooltip />
                                        <Bar
                                            dataKey="count"
                                            fill="#8884d8"
                                            radius={[4, 4, 0, 0]}
                                            maxBarSize={50}
                                        />
                                    </BarChart>
                                ) : (
                                    <div className="flex items-center justify-center h-full text-muted-foreground">
                                        No data available
                                    </div>
                                )}
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>

                </div>
            </div>

            <div className="flex justify-end pt-4">
                <Button asChild>
                    <Link href="/faq/new">
                        <Plus className="mr-2 h-4 w-4" /> Create New FAQ
                    </Link>
                </Button>
            </div>
        </div>
    )
}
