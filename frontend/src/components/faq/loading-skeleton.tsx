import { Card, CardContent, CardHeader } from "../ui/card";
import { Skeleton } from "../ui/skeleton";

export function LoadingSkeleton() {
    return (
        <div className="container mx-auto px-4 py-8">
            <Skeleton className="h-10 w-[250px] mb-8" />

            <div className="grid gap-8 md:grid-cols-2">
                {/* Input Card Skeleton */}
                <Card>
                    <CardHeader>
                        <Skeleton className="h-6 w-[100px]" />
                    </CardHeader>
                    <CardContent>
                        <Skeleton className="h-[200px] w-full" />
                    </CardContent>
                </Card>

                {/* Options Card Skeleton */}
                <Card>
                    <CardHeader>
                        <Skeleton className="h-6 w-[150px]" />
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Skeleton className="h-4 w-[140px]" />
                            <Skeleton className="h-5 w-full" />
                        </div>
                        <div className="space-y-2">
                            <Skeleton className="h-4 w-[80px]" />
                            <Skeleton className="h-10 w-full" />
                        </div>
                        <Skeleton className="h-10 w-full" />
                    </CardContent>
                </Card>

                {/* Generated FAQs Skeleton */}
                <Card className="md:col-span-2">
                    <CardHeader>
                        <Skeleton className="h-6 w-[120px]" />
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="border p-4 rounded-lg space-y-2">
                                    <Skeleton className="h-5 w-3/4" />
                                    <Skeleton className="h-4 w-full" />
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
