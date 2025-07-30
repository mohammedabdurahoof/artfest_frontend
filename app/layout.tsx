import type React from "react"
import { ThemeProvider } from "@/components/theme-provider"
import "./globals.css"

export default function LoginLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <html lang="en" suppressHydrationWarning>
            <body>
                <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
                    {children}
                </ThemeProvider>
            </body>
        </html>
    )
}

export const metadata = {
    generator: 'v0.dev'
};
