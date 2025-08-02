"use client"

import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertTriangle, RefreshCw, Home } from "lucide-react"

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error("Global error:", error)
  }, [error])

  return (
    <html>
      <body>
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 p-4">
          <Card className="w-full max-w-md text-center border-red-200 dark:border-red-800">
            <CardHeader className="pb-4">
              <div className="mx-auto mb-4 w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-8 h-8 text-red-600 dark:text-red-400" />
              </div>
              <CardTitle className="text-2xl font-bold text-red-900 dark:text-red-100">Something went wrong!</CardTitle>
              <CardDescription className="text-red-700 dark:text-red-300">
                An unexpected error occurred. This might be a temporary issue.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {error.digest && (
                <div className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 p-2 rounded font-mono">
                  Error ID: {error.digest}
                </div>
              )}
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button
                  onClick={reset}
                  variant="default"
                  className="flex items-center gap-2 bg-red-600 hover:bg-red-700"
                >
                  <RefreshCw className="w-4 h-4" />
                  Try Again
                </Button>
                <Button asChild variant="outline" className="flex items-center gap-2 bg-transparent">
                  <a href="/admin">
                    <Home className="w-4 h-4" />
                    Go to Dashboard
                  </a>
                </Button>
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400 mt-6">
                If this problem persists, please contact the administrator.
              </div>
            </CardContent>
          </Card>
        </div>
      </body>
    </html>
  )
}
