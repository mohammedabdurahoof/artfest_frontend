"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { AlertCircle, Home, RotateCcw } from "lucide-react"
import Link from "next/link"
import { useEffect } from "react"

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error("Application error:", error)
  }, [error])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 p-4">
      <Card className="w-full max-w-md border-orange-200 dark:border-orange-800">
        <CardContent className="p-8 text-center space-y-6">
          <div className="space-y-2">
            <AlertCircle className="h-16 w-16 text-orange-500 mx-auto" />
            <h1 className="text-2xl font-bold text-orange-900 dark:text-orange-100">Oops! Something went wrong</h1>
            <p className="text-orange-700 dark:text-orange-300">
              An unexpected error occurred. Please try again or return to the dashboard.
            </p>
            {process.env.NODE_ENV === "development" && (
              <details className="text-left text-xs text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/30 p-3 rounded">
                <summary className="cursor-pointer font-semibold">Error Details</summary>
                <pre className="mt-2 whitespace-pre-wrap">{error.message}</pre>
                {error.digest && <p className="mt-1">Error ID: {error.digest}</p>}
              </details>
            )}
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button onClick={reset} className="bg-orange-600 hover:bg-orange-700">
              <RotateCcw className="mr-2 h-4 w-4" />
              Try Again
            </Button>
            <Button asChild variant="outline">
              <Link href="/admin">
                <Home className="mr-2 h-4 w-4" />
                Go to Dashboard
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
