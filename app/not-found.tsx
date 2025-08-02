import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Home, ArrowLeft } from "lucide-react"

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <Card className="w-full max-w-md text-center">
        <CardHeader className="pb-4">
          <div className="mx-auto mb-4 text-6xl font-bold text-gray-400 dark:text-gray-600">404</div>
          <CardTitle className="text-2xl font-bold text-gray-900 dark:text-gray-100">Page Not Found</CardTitle>
          <CardDescription className="text-gray-600 dark:text-gray-400">
            Sorry, we couldn't find the page you're looking for. The page might have been moved, deleted, or you entered
            the wrong URL.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button asChild variant="default" className="flex items-center gap-2">
              <Link href="/admin">
                <Home className="w-4 h-4" />
                Go to Dashboard
              </Link>
            </Button>
            <Button asChild variant="outline" className="flex items-center gap-2 bg-transparent">
              <Link href="javascript:history.back()">
                <ArrowLeft className="w-4 h-4" />
                Go Back
              </Link>
            </Button>
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400 mt-6">
            If you believe this is an error, please contact the administrator.
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
