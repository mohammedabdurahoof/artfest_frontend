"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import axios from "@/lib/axios"

interface User {
  id: string
  username: string
  teamId?: {
    id: string
    name: string
  }
  role?: {
    id: string
    name: string
  }
}

interface AuthContextType {
  user: User | null
  loading: boolean
  login: (username: string, password: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem("token")
      if (!token) {
        setLoading(false)
        return
      }

      const response = await axios.get("/users/me")
      setUser(response.data.user)
    } catch (error) {
      localStorage.removeItem("token")
      document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;"
    } finally {
      setLoading(false)
    }
  }

  const login = async (username: string, password: string) => {
    try {
      const response = await axios.post("/users/login", { username, password })
      const { token, user: userData } = response.data

      localStorage.setItem("token", token)
      document.cookie = `token=${token}; path=/; max-age=604800; secure; samesite=strict`

      setUser(userData)
    } catch (error: any) {
      throw new Error(error.response?.data?.message || "Login failed")
    }
  }

  const logout = () => {
    localStorage.removeItem("token")
    document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;"
    setUser(null)
    router.push("/login")
  }

  return <AuthContext.Provider value={{ user, loading, login, logout }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
