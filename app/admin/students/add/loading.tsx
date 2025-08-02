export default function Loading() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <div className="h-9 w-32 bg-muted animate-pulse rounded" />
        <div>
          <div className="h-8 w-48 bg-muted animate-pulse rounded mb-2" />
          <div className="h-4 w-64 bg-muted animate-pulse rounded" />
        </div>
      </div>

      <div className="max-w-2xl">
        <div className="h-96 bg-muted animate-pulse rounded-lg" />
      </div>
    </div>
  )
}
