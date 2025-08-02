"use client"

import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle, RefreshCw, Home } from "lucide-react"
import Link from "next/link"

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error("Application error:", error)
  }, [error])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 p-4">
      <Card className="w-full max-w-md text-center border-orange-200 dark:border-orange-800">
        <CardHeader className="pb-4">
          <div className="mx-auto mb-4 w-16 h-16 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center">
            <AlertCircle className="w-8 h-8 text-orange-600 dark:text-orange-400" />
          </div>
          <CardTitle className="text-2xl font-bold text-orange-900 dark:text-orange-100">
            Oops! Something went wrong
          </CardTitle>
          <CardDescription className="text-orange-700 dark:text-orange-300">
            We encountered an unexpected error while processing your request.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {process.env.NODE_ENV === "development" && (
            <div className="text-xs text-left text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 p-3 rounded font-mono max-h-32 overflow-y-auto">
              <div className="font-semibold mb-1">Error Details:</div>
              <div>{error.message}</div>
              {error.digest && (
                <div className="mt-2">
                  <span className="font-semibold">Digest:</span> {error.digest}
                </div>
              )}
            </div>
          )}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button
              onClick={reset}
              variant="default"
              className="flex items-center gap-2 bg-orange-600 hover:bg-orange-700"
            >
              <RefreshCw className="w-4 h-4" />
              Try Again
            </Button>
            <Button asChild variant="outline" className="flex items-center gap-2 bg-transparent">
              <Link href="/admin">
                <Home className="w-4 h-4" />
                Go to Dashboard
              </Link>
            </Button>
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400 mt-6">
            If this problem continues, please contact support.
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
