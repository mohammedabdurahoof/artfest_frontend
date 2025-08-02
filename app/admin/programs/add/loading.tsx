export default function AddProgramLoading() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <div className="h-9 w-32 bg-gray-200 rounded animate-pulse" />
        <div>
          <div className="h-8 w-48 bg-gray-200 rounded animate-pulse" />
          <div className="h-4 w-64 bg-gray-200 rounded animate-pulse mt-2" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Form Loading */}
        <div className="lg:col-span-2">
          <div className="h-[800px] bg-gray-200 rounded animate-pulse" />
        </div>

        {/* Sidebar Loading */}
        <div className="space-y-6">
          <div className="h-32 bg-gray-200 rounded animate-pulse" />
          <div className="h-64 bg-gray-200 rounded animate-pulse" />
          <div className="h-48 bg-gray-200 rounded animate-pulse" />
        </div>
      </div>
    </div>
  )
}
