import type React from "react"

// Define your user roles
export type UserRole = "admin" | "organizer" | "judge" | "student" | "guest"

// Define specific permissions that your backend can provide
// These should match the 'name' field in your IPermission Mongoose schema
export type Permission =
  | "view_dashboard"
  | "view_students"
  | "add_student"
  | "import_students"
  | "view_programs"
  | "add_program"
  | "view_schedule"
  | "view_program_results"
  | "view_teams"
  | "add_team"
  | "view_leaderboard"
  | "view_judges"
  | "add_judge"
  | "view_judge_assignments"
  | "view_participation"
  | "register_participant"
  | "view_attendance"
  | "view_judgment"
  | "add_judgment"
  | "view_judgment_reports"
  | "view_content_management"
  | "view_events"
  | "view_gallery"
  | "view_news"
  | "view_downloads"
  | "view_system_settings"
  | "manage_users"
  | "manage_roles_permissions"
  | "manage_categories"
  | "manage_positions_grades"
  | "toggle_theme" // Example for a button/action permission
// Add any other permissions from your backend here

// Update the User interface to include roleName and an array of permissions
export interface User {
  id: string
  username: string
  teamId?: {
    id: string
    name: string
  }
  roleId?: string // Original role ID from backend
  roleName?: string // The name of the role (e.g., "Admin", "Organizer")
  permissions: Permission[] // Array of permission strings for the current user
}

// Map roles to their allowed permissions
export const rolePermissions: Record<UserRole, Permission[]> = {
  admin: [
    "view_dashboard",
    "view_students",
    "add_student",
    "import_students",
    "view_programs",
    "add_program",
    "view_schedule",
    "view_program_results",
    "view_teams",
    "add_team",
    "view_leaderboard",
    "view_judges",
    "add_judge",
    "view_judge_assignments",
    "view_participation",
    "register_participant",
    "view_attendance",
    "view_judgment",
    "add_judgment",
    "view_judgment_reports",
    "view_content_management",
    "view_events",
    "view_gallery",
    "view_news",
    "view_downloads",
    "view_system_settings",
    "manage_users",
    "manage_roles_permissions",
    "manage_categories",
    "manage_positions_grades",
    "toggle_theme",
  ],
  organizer: [
    "view_dashboard",
    "view_students",
    "add_student",
    "import_students",
    "view_programs",
    "add_program",
    "view_schedule",
    "view_program_results",
    "view_teams",
    "add_team",
    "view_leaderboard",
    "view_judges",
    "add_judge",
    "view_judge_assignments",
    "view_participation",
    "register_participant",
    "view_attendance",
    "view_content_management",
    "view_events",
    "view_gallery",
    "view_news",
    "view_downloads",
    "toggle_theme",
  ],
  judge: ["view_dashboard", "view_judge_assignments", "view_judgment", "add_judgment", "toggle_theme"],
  student: [
    "view_dashboard",
    "view_schedule",
    "view_program_results",
    "view_leaderboard",
    "view_attendance",
    "toggle_theme",
  ],
  guest: ["view_dashboard", "toggle_theme"],
}

// Extend your navigation item types to include a requiredPermission
export type NavItem = {
  title: string
  url: string
  icon?: React.ElementType // Use React.ElementType for LucideIcon
  isActive?: boolean
  requiredPermission?: Permission // New field for permission
  items?: NavSubItem[]
}

export type NavSubItem = {
  title: string
  url: string
  requiredPermission?: Permission // New field for permission
}

export type ProjectItem = {
  name: string
  url: string
  icon?: React.ElementType // Use React.ElementType for LucideIcon
  requiredPermission?: Permission // New field for permission
  items?: ProjectSubItem[]
}

export type ProjectSubItem = {
  title: string
  url: string
  requiredPermission?: Permission // New field for permission
}
