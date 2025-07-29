"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Breadcrumb, BreadcrumbItem, BreadcrumbList, BreadcrumbPage } from "@/components/ui/breadcrumb"
import { Users, Calendar, Trophy, FileText, ImageIcon, Download, UserCheck, Settings } from "lucide-react"
import api from "@/lib/axios"

interface DashboardStats {
  totalUsers: number
  totalStudents: number
  totalPrograms: number
  totalEvents: number
  totalCategories: number
  totalNews: number
  totalGalleryItems: number
  totalDownloads: number
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalStudents: 0,
    totalPrograms: 0,
    totalEvents: 0,
    totalCategories: 0,
    totalNews: 0,
    totalGalleryItems: 0,
    totalDownloads: 0,
  })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchDashboardStats()
  }, [])

  const fetchDashboardStats = async () => {
    try {
      setIsLoading(true)
      // Fetch stats from multiple endpoints
      const [usersRes, studentsRes, programsRes, eventsRes, categoriesRes, newsRes, galleryRes, downloadsRes] =
        await Promise.all([
          api.get("/users"),
          api.get("/students"),
          api.get("/programs"),
          api.get("/events"),
          api.get("/categories"),
          api.get("/news"),
          api.get("/gallery"),
          api.get("/downloads"),
        ])

      setStats({
        totalUsers: usersRes.data.length || 0,
        totalStudents: studentsRes.data.length || 0,
        totalPrograms: programsRes.data.length || 0,
        totalEvents: eventsRes.data.length || 0,
        totalCategories: categoriesRes.data.length || 0,
        totalNews: newsRes.data.length || 0,
        totalGalleryItems: galleryRes.data.length || 0,
        totalDownloads: downloadsRes.data.length || 0,
      })
    } catch (error) {
      console.error("Error fetching dashboard stats:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const statCards = [
    {
      title: "Total Users",
      value: stats.totalUsers,
      description: "Registered admin users",
      icon: Users,
      color: "text-blue-600",
    },
    {
      title: "Total Students",
      value: stats.totalStudents,
      description: "Registered participants",
      icon: UserCheck,
      color: "text-green-600",
    },
    {
      title: "Programs",
      value: stats.totalPrograms,
      description: "Competition programs",
      icon: Trophy,
      color: "text-yellow-600",
    },
    {
      title: "Events",
      value: stats.totalEvents,
      description: "Scheduled events",
      icon: Calendar,
      color: "text-purple-600",
    },
    {
      title: "Categories",
      value: stats.totalCategories,
      description: "Program categories",
      icon: Settings,
      color: "text-indigo-600",
    },
    {
      title: "News Articles",
      value: stats.totalNews,
      description: "Published articles",
      icon: FileText,
      color: "text-red-600",
    },
    {
      title: "Gallery Items",
      value: stats.totalGalleryItems,
      description: "Media files",
      icon: ImageIcon,
      color: "text-pink-600",
    },
    {
      title: "Downloads",
      value: stats.totalDownloads,
      description: "Available files",
      icon: Download,
      color: "text-teal-600",
    },
  ]

  return (
    <>
      <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 h-4" />
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbPage>Dashboard</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </header>

      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="flex items-center justify-between space-y-2">
          <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
          <div className="flex items-center space-x-2">
            <Button onClick={fetchDashboardStats} disabled={isLoading}>
              Refresh Data
            </Button>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {statCards.map((card, index) => {
            const Icon = card.icon
            return (
              <Card key={index}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
                  <Icon className={`h-4 w-4 ${card.color}`} />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{isLoading ? "..." : card.value.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground">{card.description}</p>
                </CardContent>
              </Card>
            )
          })}
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
          <Card className="col-span-4">
            <CardHeader>
              <CardTitle>Welcome to ArtFest Admin</CardTitle>
              <CardDescription>Manage your festival with ease using this comprehensive dashboard.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <h4 className="text-sm font-medium">Quick Actions</h4>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary">Manage Users</Badge>
                  <Badge variant="secondary">Add Programs</Badge>
                  <Badge variant="secondary">Schedule Events</Badge>
                  <Badge variant="secondary">Upload Media</Badge>
                </div>
              </div>
              <Separator />
              <div className="space-y-2">
                <h4 className="text-sm font-medium">System Status</h4>
                <div className="flex items-center space-x-2">
                  <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm text-muted-foreground">All systems operational</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="col-span-3">
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Latest updates and changes</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <div className="h-2 w-2 bg-blue-500 rounded-full"></div>
                  <span className="text-sm">Dashboard loaded successfully</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm">System ready for management</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="h-2 w-2 bg-yellow-500 rounded-full"></div>
                  <span className="text-sm">Awaiting data synchronization</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  )
}
