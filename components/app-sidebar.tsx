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
  Folders,
} from "lucide-react"
import { useTheme } from "next-themes"

import { NavMain } from "@/components/nav-main"
import { NavProjects } from "@/components/nav-projects"
import { NavUser } from "@/components/nav-user"
import { TeamSwitcher } from "@/components/team-switcher"
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarRail } from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useAuth } from "@/components/auth-provider" // Import the real useAuth hook
import type { NavItem, ProjectItem } from "@/types/auth" // Import types

// This is sample data.
// Permissions will be checked against the 'requiredPermission' field for each item.
const data = {
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
      requiredPermission: "view_dashboard",
    },
    {
      title: "Teams",
      url: "/admin/teams",
      icon: Shield,
      requiredPermission: "view_teams",
      items: [
        {
          title: "All Teams",
          url: "/admin/teams",
          requiredPermission: "view_teams",
        },
        {
          title: "Add Team",
          url: "/admin/teams/add",
          requiredPermission: "add_team",
        },
        {
          title: "Leaderboard",
          url: "/admin/teams/leaderboard",
          requiredPermission: "view_leaderboard",
        },
      ],
    },
    {
      title: "Students",
      url: "/admin/students",
      icon: Users,
      requiredPermission: "view_students",
      items: [
        {
          title: "All Students",
          url: "/admin/students",
          requiredPermission: "view_students",
        },
        {
          title: "Add Student",
          url: "/admin/students/add",
          requiredPermission: "add_student",
        },
        {
          title: "Import Students",
          url: "/admin/students/import",
          requiredPermission: "import_students",
        },
      ],
    },
    {
      title: "Programs",
      url: "/admin/programs",
      icon: Calendar,
      requiredPermission: "view_programs",
      items: [
        {
          title: "All Programs",
          url: "/admin/programs",
          requiredPermission: "view_programs",
        },
        {
          title: "Add Program",
          url: "/admin/programs/add",
          requiredPermission: "add_program",
        },
        {
          title: "Schedule",
          url: "/admin/programs/schedule",
          requiredPermission: "view_schedule",
        },
        {
          title: "Results",
          url: "/admin/programs/results",
          requiredPermission: "view_program_results",
        },
      ],
    },


    {
      title: "Curbs",
      url: "/admin/curbs",
      icon: Folders,
      requiredPermission: "view_curbs",
      items: [
        {
          title: "All Curbs",
          url: "/admin/curbs",
          requiredPermission: "view_curbs",
        }
      ],
    },
    {
      title: "Judges",
      url: "/admin/judges",
      icon: UserCheck,
      requiredPermission: "view_judges",
      items: [
        {
          title: "All Judges",
          url: "/admin/judges",
          requiredPermission: "view_judges",
        },
        {
          title: "Add Judge",
          url: "/admin/judges/add",
          requiredPermission: "add_judges",
        },
        {
          title: "Assignments",
          url: "/admin/judges/assignments",
          requiredPermission: "view_judge_assignments",
        },
      ],
    },
    {
      title: "Judgment",
      url: "/admin/judgment",
      icon: Award,
      requiredPermission: "view_judgments",
      items: [
        {
          title: "All Judgments",
          url: "/admin/judgment",
          requiredPermission: "view_judgments",
        },
        {
          title: "Add Judgment",
          url: "/admin/judgment/add",
          requiredPermission: "add_judgments",
        },
        {
          title: "Reports",
          url: "/admin/judgment/reports",
          requiredPermission: "view_judgment_reports",
        },
      ],
    },
  ] as NavItem[], // Cast to NavItem[]
  projects: [
    {
      name: "Content Management",
      url: "#",
      icon: FileText,
      requiredPermission: "view_content_management",
      items: [
        {
          title: "Events",
          url: "/admin/events",
          requiredPermission: "view_events",
        },
        {
          title: "Gallery",
          url: "/admin/gallery",
          requiredPermission: "view_gallery_items",
        },
        {
          title: "News",
          url: "/admin/news",
          requiredPermission: "view_news",
        },
        {
          title: "Downloads",
          url: "/admin/downloads",
          requiredPermission: "view_download_items",
        },
      ],
    },
    {
      name: "System",
      url: "#",
      icon: Settings2,
      requiredPermission: "view_system_settings",
      items: [
        {
          title: "Users",
          url: "/admin/users",
          requiredPermission: "view_users",
        },
        {
          title: "Roles & Permissions",
          url: "/admin/roles",
          requiredPermission: "view_roles",
        },
        {
          title: "Categories",
          url: "/admin/categories",
          requiredPermission: "view_categories",
        },
        {
          title: "Positions & Grades",
          url: "/admin/positions-grades",
          requiredPermission: "view_positions",
        },
      ],
    },
  ] as ProjectItem[], // Cast to ProjectItem[]
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { setTheme, theme } = useTheme()
  const { user } = useAuth() // Get the authenticated user data

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
          {/* NavUser will now display actual user data */}
          <NavUser />
          {/* Theme Toggle remains */}
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
