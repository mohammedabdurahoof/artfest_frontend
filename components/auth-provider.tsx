"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import api from "@/lib/axios"

interface User {
  id: string
  username: string
  email?: string
  role?: string
}

interface AuthContextType {
  user: User | null
  token: string | null
  login: (username: string, password: string) => Promise<void>
  logout: () => void
  isLoading: boolean
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    // Check for existing token on mount
    const storedToken = localStorage.getItem("token")
    const storedUser = localStorage.getItem("user")

    if (storedToken && storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser)
        setToken(storedToken)
        setUser(parsedUser)

        // Set token as cookie for middleware
        document.cookie = `token=${storedToken}; path=/; max-age=${7 * 24 * 60 * 60}` // 7 days
      } catch (error) {
        console.error("Error parsing stored user:", error)
        localStorage.removeItem("token")
        localStorage.removeItem("user")
      }
    }

    setIsLoading(false)
  }, [])

  const login = async (username: string, password: string) => {
    try {
      const response = await api.post("/users/login", {
        username,
        password,
      })

      const { token: newToken, user: newUser } = response.data

      // Store in localStorage
      localStorage.setItem("token", newToken)
      localStorage.setItem("user", JSON.stringify(newUser))

      // Set cookie for middleware
      document.cookie = `token=${newToken}; path=/; max-age=${7 * 24 * 60 * 60}` // 7 days

      setToken(newToken)
      setUser(newUser)

      // Redirect to admin or intended page
      const redirectUrl = new URLSearchParams(window.location.search).get("redirect") || "/admin"
      router.push(redirectUrl)
    } catch (error) {
      throw error
    }
  }

  const logout = () => {
    localStorage.removeItem("token")
    localStorage.removeItem("user")

    // Remove cookie
    document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT"

    setToken(null)
    setUser(null)
    router.push("/login")
  }

  const value = {
    user,
    token,
    login,
    logout,
    isLoading,
    isAuthenticated: !!token && !!user,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
