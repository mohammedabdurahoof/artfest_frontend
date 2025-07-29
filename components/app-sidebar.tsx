"use client"

import type * as React from "react"
import {
  Bot,
  Calendar,
  Frame,
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
      name: "ArtFest 2024",
      logo: GalleryVerticalEnd,
      plan: "Enterprise",
    },
    {
      name: "ArtFest 2023",
      logo: Bot,
      plan: "Startup",
    },
    {
      name: "ArtFest Archive",
      logo: Frame,
      plan: "Free",
    },
  ],
  navMain: [
    {
      title: "Dashboard",
      url: "/",
      icon: Home,
      isActive: true,
    },
    {
      title: "Students",
      url: "/students",
      icon: Users,
      items: [
        {
          title: "All Students",
          url: "/students",
        },
        {
          title: "Add Student",
          url: "/students/add",
        },
        {
          title: "Import Students",
          url: "/students/import",
        },
      ],
    },
    {
      title: "Programs",
      url: "/programs",
      icon: Calendar,
      items: [
        {
          title: "All Programs",
          url: "/programs",
        },
        {
          title: "Add Program",
          url: "/programs/add",
        },
        {
          title: "Schedule",
          url: "/programs/schedule",
        },
        {
          title: "Results",
          url: "/programs/results",
        },
      ],
    },
    {
      title: "Teams",
      url: "/teams",
      icon: Shield,
      items: [
        {
          title: "All Teams",
          url: "/teams",
        },
        {
          title: "Add Team",
          url: "/teams/add",
        },
        {
          title: "Leaderboard",
          url: "/teams/leaderboard",
        },
      ],
    },
    {
      title: "Judges",
      url: "/judges",
      icon: UserCheck,
      items: [
        {
          title: "All Judges",
          url: "/judges",
        },
        {
          title: "Add Judge",
          url: "/judges/add",
        },
        {
          title: "Assignments",
          url: "/judges/assignments",
        },
      ],
    },
    {
      title: "Participation",
      url: "/participation",
      icon: Trophy,
      items: [
        {
          title: "All Participations",
          url: "/participation",
        },
        {
          title: "Register Participant",
          url: "/participation/register",
        },
        {
          title: "Attendance",
          url: "/participation/attendance",
        },
      ],
    },
    {
      title: "Judgment",
      url: "/judgment",
      icon: Award,
      items: [
        {
          title: "All Judgments",
          url: "/judgment",
        },
        {
          title: "Add Judgment",
          url: "/judgment/add",
        },
        {
          title: "Reports",
          url: "/judgment/reports",
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
          url: "/events",
        },
        {
          title: "Gallery",
          url: "/gallery",
        },
        {
          title: "News",
          url: "/news",
        },
        {
          title: "Downloads",
          url: "/downloads",
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
          url: "/users",
        },
        {
          title: "Roles & Permissions",
          url: "/roles",
        },
        {
          title: "Categories",
          url: "/categories",
        },
        {
          title: "Positions & Grades",
          url: "/positions-grades",
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
