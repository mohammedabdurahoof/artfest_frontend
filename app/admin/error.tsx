"use client"

import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle, RefreshCw, Home, ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error("Admin panel error:", error)
  }, [error])

  return (
    <div className="flex items-center justify-center min-h-[60vh] p-4">
      <Card className="w-full max-w-lg text-center border-red-200 dark:border-red-800">
        <CardHeader className="pb-4">
          <div className="mx-auto mb-4 w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
            <AlertCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
          </div>
          <CardTitle className="text-xl font-bold text-red-900 dark:text-red-100">Admin Panel Error</CardTitle>
          <CardDescription className="text-red-700 dark:text-red-300">
            An error occurred while loading this admin page. This might be a temporary issue.
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
            <Button onClick={reset} variant="default" className="flex items-center gap-2">
              <RefreshCw className="w-4 h-4" />
              Try Again
            </Button>
            <Button asChild variant="outline" className="flex items-center gap-2 bg-transparent">
              <Link href="/admin">
                <Home className="w-4 h-4" />
                Dashboard
              </Link>
            </Button>
            <Button onClick={() => window.history.back()} variant="ghost" className="flex items-center gap-2">
              <ArrowLeft className="w-4 h-4" />
              Go Back
            </Button>
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400 mt-6">
            If this error persists, please contact the system administrator.
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
