"use client"

import type * as React from "react"
import {
  Calendar,
  GalleryVerticalEnd,
  Home,
  Settings2,
  Trophy,
  Users,
  UserCheck,
  Award,
  FileText,
  Shield,
  Moon,
  Sun,
  Monitor,
} from "lucide-react"
import { useTheme } from "next-themes"

import { NavMain } from "@/components/nav-main"
import { NavProjects } from "@/components/nav-projects"
import { NavUser } from "@/components/nav-user"
import { TeamSwitcher } from "@/components/team-switcher"
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarRail } from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

// This is sample data.
const data = {
  user: {
    name: "Admin User",
    email: "admin@artfest.com",
    avatar: "/placeholder.svg?height=32&width=32",
  },
  teams: [
    {
      name: "ArtFest 2025",
      logo: GalleryVerticalEnd,
      plan: "Enterprise",
    },
  ],
  navMain: [
    {
      title: "Dashboard",
      url: "/admin",
      icon: Home,
      isActive: true,
    },
    {
      title: "Students",
      url: "/admin/students",
      icon: Users,
      items: [
        {
          title: "All Students",
          url: "/admin/students",
        },
        {
          title: "Add Student",
          url: "/admin/students/add",
        },
        {
          title: "Import Students",
          url: "/admin/students/import",
        },
      ],
    },
    {
      title: "Programs",
      url: "/admin/programs",
      icon: Calendar,
      items: [
        {
          title: "All Programs",
          url: "/admin/programs",
        },
        {
          title: "Add Program",
          url: "/admin/programs/add",
        },
        {
          title: "Schedule",
          url: "/admin/programs/schedule",
        },
        {
          title: "Results",
          url: "/admin/programs/results",
        },
      ],
    },
    {
      title: "Teams",
      url: "/admin/teams",
      icon: Shield,
      items: [
        {
          title: "All Teams",
          url: "/admin/teams",
        },
        {
          title: "Add Team",
          url: "/admin/teams/add",
        },
        {
          title: "Leaderboard",
          url: "/admin/teams/leaderboard",
        },
      ],
    },
    {
      title: "Judges",
      url: "/admin/judges",
      icon: UserCheck,
      items: [
        {
          title: "All Judges",
          url: "/admin/judges",
        },
        {
          title: "Add Judge",
          url: "/admin/judges/add",
        },
        {
          title: "Assignments",
          url: "/admin/judges/assignments",
        },
      ],
    },
    {
      title: "Participation",
      url: "/admin/participation",
      icon: Trophy,
      items: [
        {
          title: "All Participations",
          url: "/admin/participation",
        },
        {
          title: "Register Participant",
          url: "/admin/participation/register",
        },
        {
          title: "Attendance",
          url: "/admin/participation/attendance",
        },
      ],
    },
    {
      title: "Judgment",
      url: "/admin/judgment",
      icon: Award,
      items: [
        {
          title: "All Judgments",
          url: "/admin/judgment",
        },
        {
          title: "Add Judgment",
          url: "/admin/judgment/add",
        },
        {
          title: "Reports",
          url: "/admin/judgment/reports",
        },
      ],
    },
  ],
  projects: [
    {
      name: "Content Management",
      url: "#",
      icon: FileText,
      items: [
        {
          title: "Events",
          url: "/admin/events",
        },
        {
          title: "Gallery",
          url: "/admin/gallery",
        },
        {
          title: "News",
          url: "/admin/news",
        },
        {
          title: "Downloads",
          url: "/admin/downloads",
        },
      ],
    },
    {
      name: "System",
      url: "#",
      icon: Settings2,
      items: [
        {
          title: "Users",
          url: "/admin/users",
        },
        {
          title: "Roles & Permissions",
          url: "/admin/roles",
        },
        {
          title: "Categories",
          url: "/admin/categories",
        },
        {
          title: "Positions & Grades",
          url: "/admin/positions-grades",
        },
      ],
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { setTheme, theme } = useTheme()

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={data.teams} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavProjects projects={data.projects} />
      </SidebarContent>
      <SidebarFooter>
        <div className="flex items-center justify-between p-2">
          <NavUser user={data.user} />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                <span className="sr-only">Toggle theme</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setTheme("light")}>
                <Sun className="mr-2 h-4 w-4" />
                Light
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme("dark")}>
                <Moon className="mr-2 h-4 w-4" />
                Dark
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme("system")}>
                <Monitor className="mr-2 h-4 w-4" />
                System
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
