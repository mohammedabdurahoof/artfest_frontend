import type React from "react"

// Define your user roles
export type UserRole = "admin" | "organizer" | "judge" | "student" | "guest"



// Update the User interface to include roleName and an array of permissions
export interface User {
  id: string
  username: string
  teamId?: {
    _id: string
    name: string
  }
  roleId?: string // Original role ID from backend
  roleName?: string // The name of the role (e.g., "Admin", "Organizer")
  permissions: String[] // Array of permission strings for the current user
}



// Extend your navigation item types to include a requiredPermission
export type NavItem = {
  title: string
  url: string
  icon?: React.ElementType // Use React.ElementType for LucideIcon
  isActive?: boolean
  requiredPermission?: string // New field for permission
  items?: NavSubItem[]
}

export type NavSubItem = {
  title: string
  url: string
  requiredPermission?: string // New field for permission
}

export type ProjectItem = {
  name: string
  url: string
  icon?: React.ElementType // Use React.ElementType for LucideIcon
  requiredPermission?: string // New field for permission
  items?: ProjectSubItem[]
}

export type ProjectSubItem = {
  title: string
  url: string
  requiredPermission?: string // New field for permission
}
