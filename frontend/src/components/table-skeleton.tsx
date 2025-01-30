export function TableSkeleton() {
    return (
        <div className="space-y-3">
            {[...Array(10)].map((_, i) => (
                <div key={i} className="flex space-x-4 p-4">
                    <div className="w-[40%] h-4 bg-muted animate-pulse rounded" />
                    <div className="w-[15%] h-4 bg-muted animate-pulse rounded" />
                    <div className="w-[15%] h-4 bg-muted animate-pulse rounded" />
                    <div className="w-[15%] h-4 bg-muted animate-pulse rounded" />
                    <div className="w-[15%] h-4 bg-muted animate-pulse rounded" />
                </div>
            ))}
        </div>
    )
}
