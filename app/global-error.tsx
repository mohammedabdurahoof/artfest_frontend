"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { AlertTriangle, Home, RotateCcw } from "lucide-react"
import Link from "next/link"
import { useEffect } from "react"

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error("Global error:", error)
  }, [error])

  return (
    <html>
      <body>
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 p-4">
          <Card className="w-full max-w-md border-red-200 dark:border-red-800">
            <CardContent className="p-8 text-center space-y-6">
              <div className="space-y-2">
                <AlertTriangle className="h-16 w-16 text-red-500 mx-auto" />
                <h1 className="text-2xl font-bold text-red-900 dark:text-red-100">Something went wrong!</h1>
                <p className="text-red-700 dark:text-red-300">
                  A critical error occurred. Please try again or contact support if the problem persists.
                </p>
                {process.env.NODE_ENV === "development" && error.digest && (
                  <p className="text-xs text-red-600 dark:text-red-400 font-mono">Error ID: {error.digest}</p>
                )}
              </div>

              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button onClick={reset} variant="destructive">
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
      </body>
    </html>
  )
}
