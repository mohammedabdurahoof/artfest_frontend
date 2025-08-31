// Base types
export type Category = "Bidaya" | "Ula" | "Thaniyya" | "Thanawiyya" | "Aliya" | "Kulliyya"
export type Status = "active" | "inactive" | "pending" | "completed" | "cancelled" | "Scheduled" | "Draft" | "Pending" | "Cancelled" | "Completed"
export type PositionCategory = "first" | "second" | "third"
export type GradeCategory = "A" | "B" | "C"
export type ResultStatus = "pending" | "processing" | "completed" | "published" | "archived"

// User and Authentication
export interface Permission {
  _id: string
  name: string
  category: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface Role {
  _id: string
  name: string
  permissions: Permission[]
  createdAt: string
  updatedAt: string
}

export interface User {
  _id: string
  username: string
  password?: string // Optional for security
  role: Role
  teamId?: string
  team?: Team
  createdAt: string
  updatedAt: string
}

// Team Management
export interface Team {
  _id: string
  name: string
  color: string
  leader: Student
  asstLeaders: Student[]
  userId: User | null
  totalPoint: number
  categoriesPoint: {
    [key in Category]: number
  }
  createdAt: string
  updatedAt: string
}

// Student Management
export interface Student {
  _id: string
  name: string
  chestNo: string
  class: string
  category: Category
  team: Team
  totalPoint: Map<string, number>
  createdAt: string
  updatedAt: string
}

// Judge Management
export interface Judge {
  _id: string
  name: string
  phoneNo: string
  email: string
  assignedPrograms?: Program[]
  createdAt: string
  updatedAt: string
}

// Program Management
export interface Program {
  _id: string
  programCode: string
  name: string
  duration: number // in minutes
  judge: Judge[]
  judgeIds: string[]
  noOfParticipation: number
  isStage: boolean
  isGroup: boolean
  isRegistrable: boolean
  isItemRegistration: boolean
  isStarted: boolean
  category: Category
  candidatesPerParticipation: number
  status: Status
  date: string
  startingTime: string
  endingTime: string
  venue: string
  resultStatus: ResultStatus
  resultUpdateTime?: string
  createdAt: string
  updatedAt: string
}

// Curb Management
export interface Curb {
  _id: string
  name: string
  maxCountOfProg: number
  programsId: string[]
  programs?: Program[]
  createdAt: string
  updatedAt: string
}

// Participation Management
export interface Participation {
  _id: string
  candidateId: string
  candidate?: Student
  programId: string
  program?: Program
  team: Team
  teamId: string
  codeLetter: string
  isPresent: boolean
  position?: number
  grade?: string
  createdAt: string
  updatedAt: string
}

// Judgment System
export interface Judgment {
  _id: string
  participationId: string
  participation?: Participation
  remarks?: string
  point1: number
  point2: number
  point3: number
  point4: number
  point5: number
  totalPoints: number
  judgeId: string
  judge?: Judge
  createdAt: string
  updatedAt: string
}

// Item Registration
export interface ItemRegistration {
  _id: string
  participationId: string
  participation?: Participation
  text?: string
  link?: string
  file?: string
  status: Status
  createdAt: string
  updatedAt: string
}

// Position and Grade
export interface Position {
  _id: string
  isGroup: boolean
  isKulliyya: boolean
  category: PositionCategory
  points: number
  rank: number
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface Grade {
  _id: string
  isStarred: boolean
  category: GradeCategory
  points: number
  from: number
  to: number
  color: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

// Content Management
export interface Event {
  _id: string
  title: string
  description: string
  date: string
  time: string
  image?: string
  status: Status
  createdAt: string
  updatedAt: string
}

export interface Gallery {
  _id: string
  title: string
  description: string
  date: string
  time: string
  image: string
  status: Status
  createdAt: string
  updatedAt: string
}

export interface News {
  _id: string
  title: string
  description: string
  date: string
  time: string
  image?: string
  status: Status
  createdAt: string
  updatedAt: string
}

export interface Download {
  _id: string
  title: string
  file: string
  status: Status
  createdAt: string
  updatedAt: string
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean
  data: T
  message?: string
  error?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}

// Form Types
export interface StudentFormData {
  name: string
  chestNo: string
  class: string
  category: Category
  team: string
}

export interface ProgramFormData {
  programCode: string
  name: string
  duration: number
  judgeIds: string[]
  noOfParticipation: number
  isStage: boolean
  isGroup: boolean
  isRegistrable: boolean
  isItemRegistration: boolean
  category: Category
  candidatesPerParticipation: number
  date: string
  startingTime: string
  endingTime: string
  venue: string
}

export interface JudgeFormData {
  name: string
  phoneNo: string
  email: string
}

export interface TeamFormData {
  name: string
  color: string
  leader: string
  asstLeaders: string[]
  userId: string
}

export interface UserFormData {
  username: string
  password?: string
  roleId: string
  teamId?: string
}

export interface ParticipationFormData {
  candidateId: string
  programId: string
  teamId: string
  codeLetter: string
}

export interface JudgmentFormData {
  participationId: string
  remarks?: string
  point1: number
  point2: number
  point3: number
  point4: number
  point5: number
}

// Filter and Search Types
export interface StudentFilters {
  category?: Category
  teamId?: string
  class?: string
  search?: string
}

export interface ProgramFilters {
  category?: Category
  isStage?: boolean
  isGroup?: boolean
  status?: Status
  date?: string
  judgeId?: string
  search?: string
}

export interface ParticipationFilters {
  programId?: string
  teamId?: string
  category?: Category
  isPresent?: boolean
  search?: string
}

// Statistics Types
export interface TeamStatistics {
  teamId: string
  teamName: string
  totalPoints: number
  categoriesPoint: {
    [key in Category]: number
  }
  totalParticipations: number
  totalWins: number
  rank: number
}

export interface ProgramStatistics {
  programId: string
  programName: string
  totalParticipations: number
  completedJudgments: number
  pendingJudgments: number
  averageScore: number
}

export interface DashboardStats {
  totalStudents: number
  totalPrograms: number
  totalTeams: number
  totalJudges: number
  ongoingPrograms: number
  completedPrograms: number
  totalParticipations: number
  totalJudgments: number
}

// Export all types
export type {
  // Re-export all interfaces for easier imports
}
