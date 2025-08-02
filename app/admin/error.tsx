"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { AlertCircle, Home, RotateCcw, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  const router = useRouter()

  useEffect(() => {
    console.error("Admin panel error:", error)
  }, [error])

  return (
    <div className="flex items-center justify-center min-h-[60vh] p-4">
      <Card className="w-full max-w-md border-orange-200 dark:border-orange-800">
        <CardContent className="p-6 text-center space-y-4">
          <div className="space-y-2">
            <AlertCircle className="h-12 w-12 text-orange-500 mx-auto" />
            <h2 className="text-xl font-semibold text-orange-900 dark:text-orange-100">Admin Panel Error</h2>
            <p className="text-sm text-orange-700 dark:text-orange-300">
              Something went wrong in the admin panel. Please try again.
            </p>
          </div>

          <div className="flex flex-col gap-2">
            <Button onClick={reset} size="sm" className="bg-orange-600 hover:bg-orange-700">
              <RotateCcw className="mr-2 h-3 w-3" />
              Try Again
            </Button>
            <div className="flex gap-2">
              <Button onClick={() => router.back()} variant="outline" size="sm" className="flex-1">
                <ArrowLeft className="mr-2 h-3 w-3" />
                Go Back
              </Button>
              <Button asChild variant="outline" size="sm" className="flex-1 bg-transparent">
                <Link href="/admin">
                  <Home className="mr-2 h-3 w-3" />
                  Dashboard
                </Link>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
