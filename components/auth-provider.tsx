"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import axios from "@/lib/axios"
import {  User } from "@/types/auth"



interface AuthContextType {
  user: User | null
  loading: boolean
  hasPermission: (permission: string) => boolean
  login: (username: string, password: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  // Function to set user data, including role name and permissions
  const setUserData = (userData: any) => {
    // Assuming your backend sends user.role.name and user.role.permissions
    // Adjust these paths based on your actual backend response structure
    setUser({
      id: userData.id,
      username: userData.username,
      teamId: userData.teamId,
      roleId: userData.role?._id, // If you need the role ID
      roleName: userData.role?.name, // Role name like "Admin", "Organizer"
      permissions: userData.role?.permissions?.map((p: any) => p.name) || [], // Array of permission names
    })
  }

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
      setUserData(response.data.user)
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
      setUserData(userData)
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

  const hasPermission = useCallback(
    (permission: string): boolean => {
      // If user is loading, we can't check permissions yet
      if (loading) {
        return false
      }
      if (user?.roleName === "Super Admin") {
        return true // Super Admin has all permissions
      }
      // If user is null or permissions array is not available, return false
      if (!user || !user.permissions) {
        return false
      }
      // Check if the user's permissions array includes the required permission
      return user.permissions.includes(permission)
    },
    [user],
  )

  return <AuthContext.Provider value={{ user, loading, login, logout, hasPermission }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
