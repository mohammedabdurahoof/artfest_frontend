"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Search,
  Plus,
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  Calendar,
  Clock,
  MapPin,
  Users,
  Trophy,
  FileText,
  UserPlus,
} from "lucide-react"
import { toast } from "@/hooks/use-toast"
import axios from "@/lib/axios"
import Link from "next/link"
import { Program, Student, Team } from "@/types"
import { formatTimeTo12Hour } from "@/lib/utils"
import { useAuth } from "@/components/auth-provider"
import { categories, programName, venues } from "@/lib/const"


export default function ProgramsPage() {

  const { user } = useAuth()


  const [programs, setPrograms] = useState<Program[]>([])
  const [students, setStudents] = useState<Student[]>([])
  const [teams, setTeams] = useState<Team[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [editingProgram, setEditingProgram] = useState<Program | null>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isParticipantsDialogOpen, setIsParticipantsDialogOpen] = useState(false)
  const [programToDelete, setProgramToDelete] = useState<Program | null>(null)
  const [selectedProgramForParticipants, setSelectedProgramForParticipants] = useState<Program | null>(null)
  const [availableStudents, setAvailableStudents] = useState<Student[]>([])
  const [selectedStudents, setSelectedStudents] = useState<string[][]>([]) // Changed to nested array
  const [studentSearchTerm, setStudentSearchTerm] = useState<string[]>([]) // Changed to array
  const [selectedTeam, setSelectedTeam] = useState<string | null>(user?.teamId?._id || null) // Add team filter state
  const [editParticipantIds, setEditParticipantIds] = useState<string[]>([]) // For editing participants

  const [programFormData, setProgramFormData] = useState({
    programCode: "",
    name: "",
    description: "",
    duration: 15,
    category: "",
    isStage: true,
    isGroup: false,
    noOfParticipation: 1,
    candidatesPerParticipation: 1,
    venue: "",
    date: "",
    startingTime: "",
    endingTime: "",
  })

  // Add new state for viewing participants
  const [isViewParticipantsDialogOpen, setIsViewParticipantsDialogOpen] = useState(false)
  const [viewingProgramParticipants, setViewingProgramParticipants] = useState<Program | null>(null)
  const [programParticipations, setProgramParticipations] = useState<any[]>([])

  // Add these new state variables
  const [isChecklistDialogOpen, setIsChecklistDialogOpen] = useState(false)
  const [selectedParticipationForChecklist, setSelectedParticipationForChecklist] = useState<any>(null)
  const [checklistData, setChecklistData] = useState<any>({})

  useEffect(() => {
    fetchPrograms()
    fetchStudents()
    fetchTeams()
  }, [])

  const fetchPrograms = async () => {
    try {
      setLoading(true)
      const response = await axios.get("/programs")
      setPrograms(response.data.data || [])
    } catch (error) {
      console.error("Error fetching programs:", error)
      toast({
        title: "Error",
        description: "Failed to fetch programs",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const fetchTeams = async () => {
    try {
      const response = await axios.get("/teams")
      setTeams(response.data.data || [])
    } catch (error) {
      console.error("Error fetching teams:", error)
      toast({
        title: "Error",
        description: "Failed to fetch teams",
        variant: "destructive",
      })
    }
  }

  const handleEditProgram = (program: Program) => {
    setEditingProgram(program)
    setProgramFormData({
      programCode: program.programCode || "",
      name: program.name || "",
      description: "",
      duration: program.duration || 15,
      category: program.category || "",
      isStage: program.isStage || true,
      isGroup: program.isGroup || false,
      noOfParticipation: program.noOfParticipation || 1,
      candidatesPerParticipation: program.candidatesPerParticipation || 1,
      venue: program.venue || "",
      date: program.date ? program.date.slice(0, 10) : "",
      startingTime: program.startingTime || "",
      endingTime: program.endingTime || "",
    })
    setIsEditDialogOpen(true)
  }

  const handleUpdateProgram = async () => {
    if (!editingProgram) return

    try {
      await axios.patch(`/programs/${editingProgram._id}`, programFormData)
      toast({
        title: "Success",
        description: "Program updated successfully",
      })
      setIsEditDialogOpen(false)
      setEditingProgram(null)
      fetchPrograms()
    } catch (error) {
      console.error("Error updating program:", error)
      toast({
        title: "Error",
        description: "Failed to update program",
        variant: "destructive",
      })
    }
  }

  const handleDeleteProgram = async () => {
    if (!programToDelete) return

    try {
      await axios.delete(`/programs/${programToDelete._id}`)
      toast({
        title: "Success",
        description: "Program deleted successfully",
      })
      setIsDeleteDialogOpen(false)
      setProgramToDelete(null)
      fetchPrograms()
    } catch (error) {
      console.error("Error deleting program:", error)
      toast({
        title: "Error",
        description: "Failed to delete program",
        variant: "destructive",
      })
    }
  }

  const fetchStudents = async () => {
    try {
      const response = await axios.get("/students")
      setStudents(response.data.data || [])
      setAvailableStudents(response.data.data || [])
    } catch (error) {
      console.error("Error fetching students:", error)
      toast({
        title: "Error",
        description: "Failed to fetch students",
        variant: "destructive",
      })
    }
  }

  const addStudentToSelection = (studentId: string, participationIndex: number) => {
    setSelectedStudents(prev => {
      const newSelected = [...prev]
      if (!newSelected[participationIndex]) {
        newSelected[participationIndex] = []
      }

      const maxCandidatesPerParticipation = selectedProgramForParticipants?.candidatesPerParticipation || 0

      if (!newSelected[participationIndex].includes(studentId)) {
        if (newSelected[participationIndex].length < maxCandidatesPerParticipation) {
          newSelected[participationIndex] = [...newSelected[participationIndex], studentId]
        } else {
          toast({
            title: "Maximum participants reached",
            description: `Cannot add more than ${maxCandidatesPerParticipation} participants to participation ${participationIndex + 1}`,
            variant: "destructive",
          })
        }
      }

      return newSelected
    })
  }

  const removeStudentFromSelection = (studentId: string, participationIndex: number) => {
    setSelectedStudents(prev => {
      const newSelected = [...prev]
      if (newSelected[participationIndex]) {
        newSelected[participationIndex] = newSelected[participationIndex].filter(id => id !== studentId)
      }
      return newSelected
    })
  }

  const clearSelectedStudents = () => {
    const noOfParticipation = selectedProgramForParticipants?.noOfParticipation || 0
    setSelectedStudents(Array.from({ length: noOfParticipation }, () => []))
  }

  const initializeSelectedStudents = async (teamId: string) => {
    if (!teamId || !selectedProgramForParticipants) return

    try {
      const response = await axios.get(`/participations/program/${selectedProgramForParticipants?._id}/team/${teamId}`)

      setSelectedStudents(
        response.data.data.map((participation: any) =>
          (participation.candidateId || []).map((candidate: any) => candidate._id)
        )
      )
      setEditParticipantIds(response.data.data.map((participation: any) => participation._id))
      setStudentSearchTerm(Array.from({ length: selectedProgramForParticipants?.noOfParticipation || 1 }, () => ""))
      setAvailableStudents(students.filter(student => student.category === selectedProgramForParticipants?.category))
    } catch (error) {
      console.error("Error initializing participants:", error)
      toast({
        title: "Error",
        description: "Failed to initialize participants",
        variant: "destructive",
      })
    }
  }

  const handleManageParticipants = (program: Program) => {
    setSelectedProgramForParticipants(program)
    const filtered = students.filter((student) => student.category === program.category)

    // Initialize nested arrays based on noOfParticipation
    const noOfParticipation = program.noOfParticipation || 0

    selectedTeam && initializeSelectedStudents(selectedTeam)

    setStudentSearchTerm(Array.from({ length: noOfParticipation }, () => ""))
    setIsParticipantsDialogOpen(true)
  }

  const handleViewParticipants = async (program: Program) => {
    setViewingProgramParticipants(program)
    try {
      const response = await axios.get(`/participations/program/${program._id}`)
      setProgramParticipations(response.data.data || [])
      setIsViewParticipantsDialogOpen(true)
    } catch (error) {
      console.error("Error fetching participations:", error)
      toast({
        title: "Error",
        description: "Failed to fetch participations",
        variant: "destructive",
      })
    }
  }

  const handleUpdateParticipants = async () => {
    if (!selectedProgramForParticipants) return
    if (selectedStudents.length === 0 || selectedStudents.every(participation => participation.length === 0)) {
      toast({
        title: "No participants selected",
        description: "Please select at least one participant for each participation.",
        variant: "destructive",
      })
      return
    }

    // check if the participents are in editparticipantIds
    const isEditing = editParticipantIds.length > 0

    try {
      if (isEditing) {
        // Update existing participations
        for (let i = 0; i < editParticipantIds.length; i++) {
          const participationId = editParticipantIds[i]
          const participation = selectedStudents[i]
          if (participation.length === 0) continue // Skip empty participations
          await axios.patch(`/participations/${participationId}`, {
            candidateId: participation,
            programId: selectedProgramForParticipants._id,
            team: selectedTeam,
          })
        }

        // Ensure we have the same number of participations as selected students
        if (editParticipantIds.length !== selectedStudents.length) {
          // If the number of participations has changed, edit the existing ones and create new ones
          const newParticipations = selectedStudents.slice(editParticipantIds.length)
          for (let i = 0; i < newParticipations.length; i++) {
            const participation = newParticipations[i]
            if (!participation || participation.length === 0) continue // Skip empty participations
            await axios.post(`/participations`, {
              candidateId: participation,
              programId: selectedProgramForParticipants._id,
              team: selectedTeam,
            })
          }
        }
      } else {
        // Create new participations
        for (let i = 0; i < selectedStudents.length; i++) {
          const participation = selectedStudents[i]
          if (participation.length === 0) continue // Skip empty participations
          await axios.post(`/participations`, {
            candidateId: participation,
            programId: selectedProgramForParticipants._id,
            team: selectedTeam,
          })
        }
      }
      toast({
        title: "Success",
        description: "Participants updated successfully",
      })
      setIsParticipantsDialogOpen(false)
      setSelectedProgramForParticipants(null)
      setSelectedStudents([])
      setStudentSearchTerm([])
      setSelectedTeam(user?.teamId?._id || null) // Reset to user's team
    } catch (error: any) {
      console.error("Error updating participants:", error.response.data.message || error)
      toast({
        title: "Error",
        description: error.response.data.message || "Failed to update participants",
        variant: "destructive",
      })
    }
  }


  const filteredPrograms = programs.filter(
    (program) =>
      program.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      program.programCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      program.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      program.venue.toLowerCase().includes(searchTerm.toLowerCase()),
  )


  const getStatusColor = (status: string) => {
    const colors = {
      Active: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
      Completed: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
      Scheduled: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
      Cancelled: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
    }
    return colors[status as keyof typeof colors] || "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300"
  }

  const getResultStatusColor = (status: string) => {
    const colors = {
      Published: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
      Pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
      "Not Started": "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300",
    }
    return colors[status as keyof typeof colors] || "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300"
  }

  const getFilteredStudentsForParticipation = (participationIndex: number) => {
    let filtered = availableStudents.filter((student) => {
      // Filter by category first
      if (student.category !== selectedProgramForParticipants?.category) {
        return false
      }

      // Filter by team if selected
      if (selectedTeam !== "all") {
        if (selectedTeam === "no-team") {
          return !student.team
        } else {
          return student.team?._id === selectedTeam
        }
      }

      return true
    })

    // Filter by search term for this specific participation
    const searchTerm = studentSearchTerm[participationIndex] || ""
    if (searchTerm) {
      filtered = filtered.filter((student) =>
        student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.chestNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (Array.isArray(student.class)
          ? student.class.some(cls => cls.toLowerCase().includes(searchTerm.toLowerCase()))
          : student.class.toLowerCase().includes(searchTerm.toLowerCase())
        )
      )
    }

    return filtered
  }

  const updateSearchTerm = (value: string, index: number) => {
    setStudentSearchTerm(prev => {
      const newSearchTerms = [...prev]
      newSearchTerms[index] = value
      return newSearchTerms
    })
  }

  const clearSearchTerms = () => {
    const noOfParticipation = selectedProgramForParticipants?.noOfParticipation || 0
    setStudentSearchTerm(Array.from({ length: noOfParticipation }, () => ""))
  }

  const totalPrograms = programs.length
  const scheduledPrograms = programs.filter((p) => p.status === "Scheduled").length
  const completedPrograms = programs.filter((p) => p.status === "completed").length
  const resultAnnounced = programs.filter((p) => p.resultStatus === "published").length

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="h-8 w-48 bg-gray-200 rounded animate-pulse" />
            <div className="h-4 w-64 bg-gray-200 rounded animate-pulse mt-2" />
          </div>
          <div className="flex gap-2">
            <div className="h-10 w-32 bg-gray-200 rounded animate-pulse" />
            <div className="h-10 w-32 bg-gray-200 rounded animate-pulse" />
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 bg-gray-200 rounded animate-pulse" />
          ))}
        </div>
        <div className="h-96 bg-gray-200 rounded animate-pulse" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Programs</h1>
          <p className="text-muted-foreground">Manage competition programs and schedules</p>
        </div>
        <div className="flex gap-2">
          <Link href="/admin/programs/schedule">
            <Button variant="outline">
              <Calendar className="mr-2 h-4 w-4" />
              Schedule View
            </Button>
          </Link>
          <Link href="/admin/programs/results">
            <Button variant="outline">
              <Trophy className="mr-2 h-4 w-4" />
              Results
            </Button>
          </Link>
          <Link href="/admin/programs/add">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Program
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Programs</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalPrograms}</div>
            <p className="text-xs text-muted-foreground">{scheduledPrograms} active programs</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Programs</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{scheduledPrograms}</div>
            <p className="text-xs text-muted-foreground">Currently running</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedPrograms}</div>
            <p className="text-xs text-muted-foreground">Programs finished</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Result Announced</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{resultAnnounced}</div>
            <p className="text-xs text-muted-foreground">Across all programs</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Programs</CardTitle>
          <CardDescription>Manage all competition programs and their details</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2 mb-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search programs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Code</TableHead>
                  <TableHead>Program Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Participants</TableHead>
                  <TableHead>Schedule</TableHead>
                  <TableHead>Venue</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Results</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPrograms.map((program) => (
                  <TableRow key={program._id}>
                    <TableCell className="font-medium">{program.programCode}</TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{program.name}</div>
                        <div className="text-sm text-muted-foreground flex items-center gap-2">
                          <Clock className="h-3 w-3" />
                          {program.duration} min
                          {program.isGroup && (
                            <Badge variant="outline" className="text-xs">
                              Group
                            </Badge>
                          )}
                          {program.isStage && (
                            <Badge variant="outline" className="text-xs">
                              Stage
                            </Badge>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{program.category}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {/* <span>
                          {program.participants?.length || 0}/{program.maxParticipants}
                        </span> */}
                        <Button variant="outline" size="sm" onClick={() => handleManageParticipants(program)}>
                          <UserPlus className="h-3 w-3" />
                        </Button>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div>{program.date && new Date(program.date).toLocaleDateString()}</div>
                        <div className="text-muted-foreground">
                          {program.startingTime && formatTimeTo12Hour(program.startingTime)} - {program.endingTime && formatTimeTo12Hour(program.endingTime)}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-sm">
                        <MapPin className="h-3 w-3" />
                        {program.venue || "N/A"}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(program.status)}>{program.status}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={getResultStatusColor(program.resultStatus)}>{program.resultStatus}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem>
                            <Eye className="mr-2 h-4 w-4" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleEditProgram(program)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit Program
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleViewParticipants(program)}>
                            <Users className="mr-2 h-4 w-4" />
                            View Participants
                          </DropdownMenuItem>
                          {/* Add this new menu item */}
                          <DropdownMenuItem onClick={() => handleDownloadJudgeFormPDF(program)}>
                            <FileText className="mr-2 h-4 w-4" />
                            Download Judge Form
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-red-600"
                            onClick={() => {
                              setProgramToDelete(program)
                              setIsDeleteDialogOpen(true)
                            }}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete Program
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Edit Program Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Program</DialogTitle>
            <DialogDescription>Update the program details below.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-programCode">Program Code</Label>
                <Input
                  id="edit-programCode"
                  value={programFormData.programCode}
                  onChange={(e) => setProgramFormData({ ...programFormData, programCode: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-category">Category</Label>
                <Select
                  value={programFormData.category}
                  onValueChange={(value) => setProgramFormData({ ...programFormData, category: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-name">Program Name</Label>
              <Input
                id="edit-name"
                value={programFormData.name}
                onChange={(e) => setProgramFormData({ ...programFormData, name: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                value={programFormData.description}
                onChange={(e) => setProgramFormData({ ...programFormData, description: e.target.value })}
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-duration">Duration (minutes)</Label>
                <Input
                  id="edit-duration"
                  type="number"
                  value={programFormData.duration}
                  onChange={(e) =>
                    setProgramFormData({ ...programFormData, duration: Number.parseInt(e.target.value) })
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-candidatesPerParticipation"> Candidates per Participation </Label>
                <Input
                  id="edit-candidatesPerParticipation"
                  type="number"
                  value={programFormData.candidatesPerParticipation}
                  onChange={(e) =>
                    setProgramFormData({ ...programFormData, candidatesPerParticipation: Number.parseInt(e.target.value) })
                  }
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-noOfParticipation">Number of Participation</Label>
                <Input
                  id="edit-noOfParticipation"
                  type="number"
                  value={programFormData.noOfParticipation}
                  onChange={(e) =>
                    setProgramFormData({ ...programFormData, noOfParticipation: Number.parseInt(e.target.value) })
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-venue">Venue</Label>
                <Select
                  value={programFormData.venue}
                  onValueChange={(value) => setProgramFormData({ ...programFormData, venue: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select venue" />
                  </SelectTrigger>
                  <SelectContent>
                    {venues.map((venue) => (
                      <SelectItem key={venue} value={venue}>
                        {venue}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-date">Date</Label>
                <Input
                  id="edit-date"
                  type="date"
                  value={programFormData.date}
                  onChange={(e) => setProgramFormData({ ...programFormData, date: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-startingTime">Start Time</Label>
                <Input
                  id="edit-startingTime"
                  type="time"
                  value={programFormData.startingTime}
                  onChange={(e) => setProgramFormData({ ...programFormData, startingTime: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-endingTime">End Time</Label>
                <Input
                  id="edit-endingTime"
                  type="time"
                  value={programFormData.endingTime}
                  onChange={(e) => setProgramFormData({ ...programFormData, endingTime: e.target.value })}
                />
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="edit-isStage"
                  checked={programFormData.isStage}
                  onCheckedChange={(checked) => setProgramFormData({ ...programFormData, isStage: checked as boolean })}
                />
                <Label htmlFor="edit-isStage">Stage Program</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="edit-isGroup"
                  checked={programFormData.isGroup}
                  onCheckedChange={(checked) => setProgramFormData({ ...programFormData, isGroup: checked as boolean })}
                />
                <Label htmlFor="edit-isGroup">Group Program</Label>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateProgram}>Update Program</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Manage Participants Dialog */}
      <Dialog open={isParticipantsDialogOpen} onOpenChange={() => { setIsParticipantsDialogOpen(false); setSelectedTeam(user?.teamId?._id || null); }}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Manage Participants</DialogTitle>
            <DialogDescription>
              Add or remove participants for "{selectedProgramForParticipants?.name}"
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="text-sm text-muted-foreground">
              Category: {selectedProgramForParticipants?.category} | No of Participation:{" "}
              {selectedProgramForParticipants?.noOfParticipation} | Candidates per Participation:{" "}
              {selectedProgramForParticipants?.candidatesPerParticipation}
            </div>

            {/* Team Filter */}
            {!user?.teamId?._id && <div className="grid gap-2">
              <Label>Team</Label>
              <Select value={selectedTeam?.toString()} onValueChange={(value) => { setSelectedTeam(value); initializeSelectedStudents(value); }}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select team" />
                </SelectTrigger>
                <SelectContent>
                  {teams.map((team) => (
                    <SelectItem key={team._id} value={team._id}>
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full border"
                          style={{ backgroundColor: team.color || '#gray' }}
                        />
                        {team.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>}

            {selectedTeam && <div className="grid gap-4">
              <div className="space-y-2">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {Array.from({ length: selectedProgramForParticipants?.noOfParticipation || 0 }).map((_, index) => {
                    const filteredStudentsForThisParticipation = getFilteredStudentsForParticipation(index)
                    const selectedForThisParticipation = selectedStudents[index] || []

                    return (
                      <div key={index} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <Label className="font-medium">Participation {index + 1}</Label>
                          <div className="text-sm text-muted-foreground">
                            Selected: {selectedForThisParticipation.length} / {selectedProgramForParticipants?.candidatesPerParticipation || 0}
                          </div>
                        </div>

                        {/* Search Input for this participation */}
                        <div className="relative mb-2">
                          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                          <Input
                            placeholder={`Search for participation ${index + 1}...`}
                            value={studentSearchTerm[index] || ""}
                            onChange={(e) => updateSearchTerm(e.target.value, index)}
                            className="pl-8"
                          />
                        </div>

                        {/* Available students count */}
                        <div className="text-xs text-muted-foreground mb-2">
                          Available: {filteredStudentsForThisParticipation.length} students
                          {selectedTeam !== "all" && (
                            <span className="ml-2">
                              ({selectedTeam === "no-team" ? "No Team" : teams.find(t => t._id === selectedTeam)?.name})
                            </span>
                          )}
                        </div>

                        {/* Students List for this participation */}
                        <div className="max-h-60 overflow-y-auto border rounded-md p-2">
                          {filteredStudentsForThisParticipation.length === 0 ? (
                            <div className="text-center py-4 text-muted-foreground">
                              {studentSearchTerm[index]
                                ? "No students found matching your search"
                                : selectedTeam !== "all"
                                  ? "No students available in selected team"
                                  : "No students available"}
                            </div>
                          ) : (
                            <div className="space-y-2">
                              {filteredStudentsForThisParticipation.map((student) => (
                                <div
                                  key={student._id}
                                  className="flex items-center space-x-2 p-2 rounded hover:bg-muted/50"
                                >
                                  <Checkbox
                                    id={`${student._id}-${index}`}
                                    checked={selectedForThisParticipation.includes(student._id)}
                                    onCheckedChange={(checked) => {
                                      if (checked) {
                                        addStudentToSelection(student._id, index)
                                      } else {
                                        removeStudentFromSelection(student._id, index)
                                      }
                                    }}
                                  />
                                  <Label htmlFor={`${student._id}-${index}`} className="flex-1 cursor-pointer">
                                    <div className="flex items-center justify-between">
                                      <div className="flex-1">
                                        <div className="font-medium">{student.name}</div>
                                        <div className="text-sm text-muted-foreground">
                                          Chest No: <span className="font-mono">{student.chestNo}</span> | Class:{" "}
                                          {Array.isArray(student.class) ? student.class.join(", ") : student.class}
                                        </div>
                                      </div>
                                      <div className="flex items-center gap-2 ml-4">
                                        <div
                                          className="w-3 h-3 rounded-full border"
                                          style={{ backgroundColor: student.team?.color || "#gray" }}
                                        />
                                        <span className="text-sm font-medium">{student.team?.name || "No Team"}</span>
                                      </div>
                                    </div>
                                  </Label>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Selected Students Summary for this participation */}
                        {selectedForThisParticipation.length > 0 && (
                          <div className="space-y-2 mt-4">
                            <Label>Selected for Participation {index + 1} ({selectedForThisParticipation.length})</Label>
                            <div className="max-h-24 overflow-y-auto border rounded-md p-2 bg-muted/20">
                              <div className="flex flex-wrap gap-2">
                                {selectedForThisParticipation.map((studentId) => {
                                  const student = availableStudents.find((s) => s._id === studentId)
                                  if (!student) return null
                                  return (
                                    <div
                                      key={studentId}
                                      className="flex items-center gap-1 bg-primary/10 text-primary px-2 py-1 rounded text-sm"
                                    >
                                      <span>{student.name}</span>
                                      <span className="text-muted-foreground">({student.chestNo})</span>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-4 w-4 p-0 hover:bg-destructive hover:text-destructive-foreground"
                                        onClick={() => removeStudentFromSelection(studentId, index)}
                                      >
                                        ×
                                      </Button>
                                    </div>
                                  )
                                })}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setIsParticipantsDialogOpen(false)
              clearSearchTerms()
              clearSelectedStudents()
              setSelectedTeam(user?.teamId?._id || null) // Reset team filter
            }}>
              Cancel
            </Button>
            <Button onClick={handleUpdateParticipants}>
              Update Participants
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Participants Dialog */}
      <Dialog open={isViewParticipantsDialogOpen} onOpenChange={setIsViewParticipantsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Program Participants</DialogTitle>
            <DialogDescription>
              Viewing participants for "{viewingProgramParticipants?.name}"
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="text-sm text-muted-foreground">
              Category: {viewingProgramParticipants?.category} |
              Total Participations: {programParticipations.length} |
              Total Participants: {programParticipations.reduce((total, p) => total + (p.candidateId?.length || 0), 0)}
            </div>

            {programParticipations.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No participants registered for this program yet.
              </div>
            ) : (
              <div className="space-y-4">
                {programParticipations.map((participation, index) => (
                  <Card key={participation._id} className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-medium">Participation {index + 1}</h3>
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full border"
                          style={{ backgroundColor: participation.team?.color || '#gray' }}
                        />
                        <span className="text-sm font-medium">{participation.team?.name || "No Team"}</span>
                        <Badge variant="outline" className="text-xs">
                          {participation.candidateId?.length || 0} participants
                        </Badge>
                        {/* Add Checklist Button */}
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedParticipationForChecklist(participation)
                            setChecklistData({}) // Reset judgment data
                            setIsChecklistDialogOpen(true)
                          }}
                        >
                          <FileText className="mr-1 h-3 w-3" />
                          Judge
                        </Button>
                      </div>
                    </div>

                    {participation.candidateId && participation.candidateId.length > 0 ? (
                      <div className="grid gap-2">
                        {participation.candidateId.map((candidate: any, candidateIndex: number) => (
                          <div key={candidate._id} className="flex items-center justify-between p-2 bg-muted/20 rounded">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-sm font-medium">
                                {candidateIndex + 1}
                              </div>
                              <div>
                                <div className="font-medium">{candidate.name}</div>
                                <div className="text-sm text-muted-foreground">
                                  Chest No: <span className="font-mono">{candidate.chestNo}</span> |
                                  Class: {Array.isArray(candidate.class) ? candidate.class.join(", ") : candidate.class}
                                </div>
                              </div>
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {/* {candidate.team?.name || "No Team"} */}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-4 text-muted-foreground">
                        No participants in this slot
                      </div>
                    )}
                  </Card>
                ))}
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsViewParticipantsDialogOpen(false)}>
              Close
            </Button>
            <Button onClick={() => {
              setIsViewParticipantsDialogOpen(false)
              handleManageParticipants(viewingProgramParticipants!)
            }}>
              Manage Participants
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Participation Judgment Form Dialog */}
      <Dialog open={isChecklistDialogOpen} onOpenChange={setIsChecklistDialogOpen}>
        <DialogContent className="max-w-6xl max-h-[95vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-center text-xl font-bold">
              JUDGMENT FORM - {viewingProgramParticipants?.name?.toUpperCase()}
            </DialogTitle>
            <DialogDescription className="text-center">
              Program: {viewingProgramParticipants?.name} | Category: {viewingProgramParticipants?.category}
            </DialogDescription>
          </DialogHeader>

          {selectedParticipationForChecklist && (
            <div className="space-y-6">
              {/* Header Section */}
              <div className="bg-gray-50 p-4 rounded-lg border-2 border-gray-200">
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <h3 className="font-bold text-lg">PROGRAM DETAILS</h3>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div><strong>Program Code:</strong></div>
                      <div>{viewingProgramParticipants?.programCode}</div>
                      <div><strong>Duration:</strong></div>
                      <div>{viewingProgramParticipants?.duration} minutes</div>
                      <div><strong>Venue:</strong></div>
                      <div>{viewingProgramParticipants?.venue}</div>
                      <div><strong>Date:</strong></div>
                      <div>{viewingProgramParticipants?.date && new Date(viewingProgramParticipants.date).toLocaleDateString()}</div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <h3 className="font-bold text-lg">TEAM INFORMATION</h3>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div><strong>Team Name:</strong></div>
                      <div>{selectedParticipationForChecklist.team?.name || "N/A"}</div>
                      <div><strong>Team Color:</strong></div>
                      <div className="flex items-center gap-2">
                        <div
                          className="w-4 h-4 rounded border"
                          style={{ backgroundColor: selectedParticipationForChecklist.team?.color || '#gray' }}
                        />
                        {selectedParticipationForChecklist.team?.color || "N/A"}
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <h3 className="font-bold text-lg">EVALUATION CRITERIA</h3>
                    <div className="text-sm">
                      <div><strong>Performance:</strong> 40 points</div>
                      <div><strong>Presentation:</strong> 30 points</div>
                      <div><strong>Creativity:</strong> 20 points</div>
                      <div><strong>Time Management:</strong> 10 points</div>
                      <div className="font-bold mt-2">Total: 100 points</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Judgment Form Table */}
              <div className="border-2 border-gray-300 rounded-lg overflow-hidden">
                <div className="bg-gray-100 p-3 border-b-2 border-gray-300">
                  <h3 className="font-bold text-center">JUDGMENT FORM</h3>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full border-collapse judgment-table">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="border border-gray-300 p-2 text-left w-8">S.No</th>
                        <th className="border border-gray-300 p-2 text-left">Candidate Name</th>
                        <th className="border border-gray-300 p-2 text-left w-20">Chest No</th>
                        <th className="border border-gray-300 p-2 text-left w-24">Class</th>
                        <th className="border border-gray-300 p-2 text-center w-24">Performance<br />(40)</th>
                        <th className="border border-gray-300 p-2 text-center w-24">Presentation<br />(30)</th>
                        <th className="border border-gray-300 p-2 text-center w-24">Creativity<br />(20)</th>
                        <th className="border border-gray-300 p-2 text-center w-24">Time Mgmt<br />(10)</th>
                        <th className="border border-gray-300 p-2 text-center w-20">Total<br />(100)</th>
                        <th className="border border-gray-300 p-2 text-center w-16">Grade</th>
                        <th className="border border-gray-300 p-2 text-left w-32">Remarks</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedParticipationForChecklist.candidateId?.map((candidate: any, index: number) => {
                        const candidateData = checklistData[candidate._id] || {}
                        const performance = candidateData.performance || 0
                        const presentation = candidateData.presentation || 0
                        const creativity = candidateData.creativity || 0
                        const timeManagement = candidateData.timeManagement || 0
                        const total = performance + presentation + creativity + timeManagement

                        // Calculate grade based on total
                        const getGrade = (score: number) => {
                          if (score >= 90) return 'A+'
                          if (score >= 80) return 'A'
                          if (score >= 70) return 'B+'
                          if (score >= 60) return 'B'
                          if (score >= 50) return 'C'
                          return 'F'
                        }

                        return (
                          <tr key={candidate._id} className="hover:bg-gray-50">
                            <td className="border border-gray-300 p-2 text-center font-medium">
                              {index + 1}
                            </td>
                            <td className="border border-gray-300 p-2 font-medium">
                              {candidate.name}
                            </td>
                            <td className="border border-gray-300 p-2 text-center font-mono">
                              {candidate.chestNo}
                            </td>
                            <td className="border border-gray-300 p-2 text-center">
                              {Array.isArray(candidate.class) ? candidate.class.join(", ") : candidate.class}
                            </td>
                            <td className="border border-gray-300 p-2 text-center">
                              <Input
                                type="number"
                                min="0"
                                max="40"
                                value={candidateData.performance || ""}
                                onChange={(e) =>
                                  setChecklistData(prev => ({
                                    ...prev,
                                    [candidate._id]: {
                                      ...prev[candidate._id],
                                      performance: parseInt(e.target.value) || 0
                                    }
                                  }))
                                }
                                className="w-16 h-8 text-center text-xs"
                              />
                            </td>
                            <td className="border border-gray-300 p-2 text-center">
                              <Input
                                type="number"
                                min="0"
                                max="30"
                                value={candidateData.presentation || ""}
                                onChange={(e) =>
                                  setChecklistData(prev => ({
                                    ...prev,
                                    [candidate._id]: {
                                      ...prev[candidate._id],
                                      presentation: parseInt(e.target.value) || 0
                                    }
                                  }))
                                }
                                className="w-16 h-8 text-center text-xs"
                              />
                            </td>
                            <td className="border border-gray-300 p-2 text-center">
                              <Input
                                type="number"
                                min="0"
                                max="20"
                                value={candidateData.creativity || ""}
                                onChange={(e) =>
                                  setChecklistData(prev => ({
                                    ...prev,
                                    [candidate._id]: {
                                      ...prev[candidate._id],
                                      creativity: parseInt(e.target.value) || 0
                                    }
                                  }))
                                }
                                className="w-16 h-8 text-center text-xs"
                              />
                            </td>
                            <td className="border border-gray-300 p-2 text-center">
                              <Input
                                type="number"
                                min="0"
                                max="10"
                                value={candidateData.timeManagement || ""}
                                onChange={(e) =>
                                  setChecklistData(prev => ({
                                    ...prev,
                                    [candidate._id]: {
                                      ...prev[candidate._id],
                                      timeManagement: parseInt(e.target.value) || 0
                                    }
                                  }))
                                }
                                className="w-16 h-8 text-center text-xs"
                              />
                            </td>
                            <td className="border border-gray-300 p-2 text-center font-bold">
                              <div className={`w-16 h-8 flex items-center justify-center rounded ${total >= 80 ? 'bg-green-100 text-green-800' :
                                total >= 60 ? 'bg-yellow-100 text-yellow-800' :
                                  total >= 40 ? 'bg-orange-100 text-orange-800' :
                                    'bg-red-100 text-red-800'
                                }`}>
                                {total}
                              </div>
                            </td>
                            <td className="border border-gray-300 p-2 text-center font-bold">
                              <div className={`w-12 h-8 flex items-center justify-center rounded font-bold ${total >= 80 ? 'bg-green-200 text-green-900' :
                                total >= 60 ? 'bg-yellow-200 text-yellow-900' :
                                  total >= 40 ? 'bg-orange-200 text-orange-900' :
                                    'bg-red-200 text-red-900'
                                }`}>
                                {getGrade(total)}
                              </div>
                            </td>
                            <td className="border border-gray-300 p-2">
                              <Input
                                placeholder="Judge remarks..."
                                value={candidateData.remarks || ""}
                                onChange={(e) =>
                                  setChecklistData(prev => ({
                                    ...prev,
                                    [candidate._id]: {
                                      ...prev[candidate._id],
                                      remarks: e.target.value
                                    }
                                  }))
                                }
                                className="border-0 p-1 h-8 text-xs"
                              />
                            </td>
                          </tr>
                        )
                      })}

                      {/* Add empty rows for additional space */}
                      {Array.from({ length: Math.max(0, 5 - (selectedParticipationForChecklist.candidateId?.length || 0)) }).map((_, index) => (
                        <tr key={`empty-${index}`}>
                          <td className="border border-gray-300 p-2 text-center text-gray-400">
                            {(selectedParticipationForChecklist.candidateId?.length || 0) + index + 1}
                          </td>
                          <td className="border border-gray-300 p-2 text-gray-400">---</td>
                          <td className="border border-gray-300 p-2 text-center text-gray-400">---</td>
                          <td className="border border-gray-300 p-2 text-center text-gray-400">---</td>
                          <td className="border border-gray-300 p-2"></td>
                          <td className="border border-gray-300 p-2"></td>
                          <td className="border border-gray-300 p-2"></td>
                          <td className="border border-gray-300 p-2"></td>
                          <td className="border border-gray-300 p-2"></td>
                          <td className="border border-gray-300 p-2"></td>
                          <td className="border border-gray-300 p-2"></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Summary Section */}
              <div className="grid grid-cols-4 gap-4 bg-gray-50 p-4 rounded-lg border">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {selectedParticipationForChecklist.candidateId?.length || 0}
                  </div>
                  <div className="text-sm text-gray-600">Total Participants</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {Object.values(checklistData).filter((item: any) => {
                      const total = (item?.performance || 0) + (item?.presentation || 0) + (item?.creativity || 0) + (item?.timeManagement || 0)
                      return total >= 80
                    }).length}
                  </div>
                  <div className="text-sm text-gray-600">Grade A (80+)</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-600">
                    {Object.values(checklistData).filter((item: any) => {
                      const total = (item?.performance || 0) + (item?.presentation || 0) + (item?.creativity || 0) + (item?.timeManagement || 0)
                      return total >= 60 && total < 80
                    }).length}
                  </div>
                  <div className="text-sm text-gray-600">Grade B (60-79)</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    {Object.values(checklistData).reduce((avg: number, item: any) => {
                      const total = (item?.performance || 0) + (item?.presentation || 0) + (item?.creativity || 0) + (item?.timeManagement || 0)
                      return avg + total
                    }, 0) / Math.max(Object.keys(checklistData).length, 1)}
                  </div>
                  <div className="text-sm text-gray-600">Average Score</div>
                </div>
              </div>

              {/* Judge Information Section */}
              <div className="grid grid-cols-2 gap-6 border-t-2 pt-4">
                <div className="space-y-4">
                  <h4 className="font-bold">JUDGE 1</h4>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>Name:</div>
                    <div className="border-b border-gray-300 min-h-6"></div>
                    <div>Signature:</div>
                    <div className="border-b border-gray-300 min-h-6"></div>
                    <div>Date:</div>
                    <div className="border-b border-gray-300 min-h-6"></div>
                  </div>
                </div>
                <div className="space-y-4">
                  <h4 className="font-bold">JUDGE 2</h4>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>Name:</div>
                    <div className="border-b border-gray-300 min-h-6"></div>
                    <div>Signature:</div>
                    <div className="border-b border-gray-300 min-h-6"></div>
                    <div>Date:</div>
                    <div className="border-b border-gray-300 min-h-6"></div>
                  </div>
                </div>
              </div>
            </div>
          )}

          <DialogFooter className="flex justify-between">
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setIsChecklistDialogOpen(false)}>
                Close
              </Button>
              <Button variant="outline" onClick={() => window.print()}>
                <FileText className="mr-2 h-4 w-4" />
                Print Form
              </Button>
            </div>
            <div className="flex gap-2">
              <Button
                variant="secondary"
                onClick={async () => {
                  // Save judgment data
                  try {
                    await axios.post(`/participations/${selectedParticipationForChecklist._id}/judgment`, {
                      judgmentData: checklistData,
                      judgeId: user?.id,
                      submittedAt: new Date().toISOString()
                    })
                    toast({
                      title: "Success",
                      description: "Judgment data saved successfully",
                    })
                  } catch (error) {
                    toast({
                      title: "Error",
                      description: "Failed to save judgment data",
                      variant: "destructive",
                    })
                  }
                }}
              >
                Save Scores
              </Button>
              <Button onClick={async () => {
                // Submit final judgment
                try {
                  await axios.post(`/participations/${selectedParticipationForChecklist._id}/judgment/submit`, {
                    judgmentData: checklistData,
                    judgeId: user?.id,
                    finalSubmission: true,
                    submittedAt: new Date().toISOString()
                  })
                  toast({
                    title: "Success",
                    description: "Judgment submitted successfully",
                  })
                  setIsChecklistDialogOpen(false)
                } catch (error) {
                  toast({
                    title: "Error",
                    description: "Failed to submit judgment",
                    variant: "destructive",
                  })
                }
              }}>
                Submit Judgment
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Program</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{programToDelete?.name}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteProgram}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add this style tag in your component or in a global CSS file */}
      <style jsx>{`
        @media print {
          .print-hide {
            display: none !important;
          }
          
          .checklist-print {
            font-size: 12px;
          }
          
          .checklist-table {
            border-collapse: collapse;
            width: 100%;
          }
          
          .checklist-table th,
          .checklist-table td {
            border: 1px solid #000;
            padding: 4px;
          }
          
          .page-break {
            page-break-before: always;
          }
        }
      `}</style>
    </div >
  )
}

const handleDownloadJudgeFormPDF = async (program: Program) => {
  try {
    // First fetch the participations for this program
    const response = await axios.get(`/participations/program/${program._id}`)
    const participations = response.data.data || []

    if (participations.length === 0) {
      toast({
        title: "No Participants",
        description: "This program has no participants yet. Add participants first.",
        variant: "destructive",
      })
      return
    }

    // Generate and download PDF
    await generateAndDownloadPDF(program, participations)

    toast({
      title: "Success",
      description: "Judge form PDF downloaded successfully",
    })
  } catch (error) {
    console.error("Error downloading judge form PDF:", error)
    toast({
      title: "Error",
      description: "Failed to download judge form PDF",
      variant: "destructive",
    })
  }
}

const generateAndDownloadPDF = async (program: Program, participations: any[]) => {
  // Create a temporary div to hold our content
  const element = document.createElement('div')
  element.style.width = '794px' // A4 width in pixels at 96 DPI
  element.style.padding = '40px'
  element.style.fontFamily = 'Arial, sans-serif'
  element.style.fontSize = '12px'
  element.style.lineHeight = '1.4'
  element.style.color = '#333'
  element.style.backgroundColor = 'white'

  // Generate the HTML content
  element.innerHTML = generateJudgeFormHTML(program, participations)

  // Temporarily add to DOM (hidden)
  element.style.position = 'absolute'
  element.style.left = '-9999px'
  document.body.appendChild(element)

  try {
    // Import jsPDF dynamically to avoid SSR issues
    const { default: jsPDF } = await import('jspdf')
    const html2canvas = (await import('html2canvas')).default

    // Convert HTML to canvas
    const canvas = await html2canvas(element, {
      scale: 2, // Higher quality
      useCORS: true,
      allowTaint: false,
      backgroundColor: '#ffffff'
    })

    // Create PDF
    const pdf = new jsPDF('p', 'mm', 'a4')
    const imgData = canvas.toDataURL('image/png')

    // Calculate dimensions
    const imgWidth = 210 // A4 width in mm
    const pageHeight = 295 // A4 height in mm
    const imgHeight = (canvas.height * imgWidth) / canvas.width
    let heightLeft = imgHeight

    let position = 0

    // Add first page
    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
    heightLeft -= pageHeight

    // Add additional pages if needed
    while (heightLeft >= 0) {
      position = heightLeft - imgHeight
      pdf.addPage()
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
      heightLeft -= pageHeight
    }

    // Download the PDF
    pdf.save(`judge-form-${program.programCode}-${program.name.replace(/\s+/g, '-')}.pdf`)

  } finally {
    // Clean up
    document.body.removeChild(element)
  }
}



const generateJudgeFormHTML = (program: Program, participations: any[]) => {
  return `
    <div style="font-family: Arial, sans-serif; font-size: 12px; color: #333; max-width: 794px; margin: 0 auto;">
      <!-- Header -->
      <div style="text-align: center; margin-bottom: 10px; border-bottom: 2px solid #333; padding-bottom: 20px;">
        <h1 style="font-size: 24px; margin: 0 0 10px 0; font-weight: bold;">${programName || "Art Fest"}</h1>
        <h2 style="font-size: 18px; margin: 0 0 10px 0; font-weight: bold;">${program.name.toUpperCase()}</h2>
        <b style="margin: 5px 0; font-size: 14px;">Program Code: ${program.programCode} | Category: ${program.category}</b>
        <p style="margin: 5px 0; font-size: 14px;">Duration: ${program.duration} minutes | Venue: ${program.venue || 'N/A'} 
        | Date: ${program.date ? new Date(program.date).toLocaleDateString() : 'N/A'} 
        | From: ${(program.startingTime && formatTimeTo12Hour(program.startingTime)) || 'N/A'} 
        | To: ${(program.endingTime && formatTimeTo12Hour(program.endingTime)) || 'N/A'}</p>
      </div>
      
      <h2 style="text-align: center; margin-bottom: 20px; font-size: 18px; font-weight: bold;">JUDGMENT FORM</h2>
      <div style="margin-bottom: 40px;">
          <table style="width: 100%; border-collapse: collapse; font-size: 10px;">
            <thead>
              <tr style="background-color: #f9f9f9;">
                <th style="border: 1px solid #333; padding: 8px; text-align: center; width: 30px;">S.No</th>
                <th style="border: 1px solid #333; padding: 8px; text-align: center; width: 60px;">Chest No</th>
                <th style="border: 1px solid #333; padding: 8px; text-align: left; min-width: 120px;">Candidate Name</th>
                <th style="border: 1px solid #333; padding: 8px; text-align: center; width: 50px;">Point 1</th>
                <th style="border: 1px solid #333; padding: 8px; text-align: center; width: 50px;">Point 2</th>
                <th style="border: 1px solid #333; padding: 8px; text-align: center; width: 50px;">Point 3</th>
                <th style="border: 1px solid #333; padding: 8px; text-align: center; width: 50px;">Point 4</th>
                <th style="border: 1px solid #333; padding: 8px; text-align: center; width: 50px;">Point 5</th>
                <th style="border: 1px solid #333; padding: 8px; text-align: center; width: 50px;">Total</th>
                <th style="border: 1px solid #333; padding: 8px; text-align: center; min-width: 80px;">Remarks</th>
              </tr>
            </thead>
            <tbody>
      ${participations.map((participation, index) => `
        
                <tr style="background-color: ${index % 2 === 0 ? '#fff' : '#f9f9f9'};">
                  <td style="border: 1px solid #333; padding: 8px; text-align: center;">${index + 1}</td>
                  <td style="border: 1px solid #333; padding: 8px; text-align: center;">${participation.candidateId[0].chestNo}</td>
                  <td style="border: 1px solid #333; padding: 8px;">${participation.candidateId[0].name}</td>
                  <td style="border: 1px solid #333; padding: 8px; text-align: center; height: 25px;"></td>
                  <td style="border: 1px solid #333; padding: 8px; text-align: center; height: 25px;"></td>
                  <td style="border: 1px solid #333; padding: 8px; text-align: center; height: 25px;"></td>
                  <td style="border: 1px solid #333; padding: 8px; text-align: center; height: 25px;"></td>
                  <td style="border: 1px solid #333; padding: 8px; text-align: center; height: 25px;"></td>
                  <td style="border: 1px solid #333; padding: 8px; text-align: center; height: 25px;"></td>
                  <td style="border: 1px solid #333; padding: 8px; height: 25px;"></td>
                </tr>
              `).join('') || '<tr><td colspan="11" style="border: 1px solid #333; padding: 8px; text-align: center;">No participants</td></tr>'}
              
              ${Array.from({ length: Math.max(0, 15 - (participations?.length || 0)) }, (_, index) => `
                <tr style="background-color: ${((participations?.length || 0) + index) % 2 === 0 ? '#fff' : '#f9f9f9'};">
                  <td style="border: 1px solid #333; padding: 8px; text-align: center; color: #999;">${(participations?.length || 0) + index + 1}</td>
                  <td style="border: 1px solid #333; padding: 8px; color: #999;"></td>
                  <td style="border: 1px solid #333; padding: 8px; text-align: center; color: #999;"></td>
                  <td style="border: 1px solid #333; padding: 8px; height: 25px;"></td>
                  <td style="border: 1px solid #333; padding: 8px; height: 25px;"></td>
                  <td style="border: 1px solid #333; padding: 8px; height: 25px;"></td>
                  <td style="border: 1px solid #333; padding: 8px; height: 25px;"></td>
                  <td style="border: 1px solid #333; padding: 8px; height: 25px;"></td>
                  <td style="border: 1px solid #333; padding: 8px; height: 25px;"></td>
                  <td style="border: 1px solid #333; padding: 8px; height: 25px;"></td>
                </tr>
              `).join('')}

       </tbody>
          </table>
        </div>
      
      <!-- Officials Section -->
      
        <div style="font-size: 15px; margin-top: 20px; border-top: 2px solid #333; padding-top: 10px;">
          <h4 style="font-size: 15px; margin-bottom: 15px; font-weight: bold;">JUDGE DETAILS </h4>
          <div  style="display: flex; align-items: center; margin-bottom: 5px;">
            <strong>Name:</strong>
            <div style=" padding:5px;">....................................................................................</div>
          </div>
          <div  style="display: flex; align-items: center; margin-bottom: 5px;">
            <strong>Mob No:</strong>
            <div style=" padding:5px;">.................................................................................</div>
          </div>
          <div  style="display: flex; align-items: center; margin-bottom: 5px;">
            <strong>Signature:</strong>
            <div style=" padding:5px;">..............................................................................</div>
          </div>
          <div  style="display: flex; align-items: center; margin-bottom: 5px;">
            <strong>Date:</strong>
            <div style=" padding:5px;">.......................................................................................</div>
          </div>
          <div style="display: flex; align-items: center; margin-bottom: 5px;">
            <strong>NB:</strong>
            <div style=" padding:5px;">Please inform students the criteria considered in judging</div>
          </div>
        </div>
      
      <div style="text-align: center; margin-top: 30px; font-size: 10px; color: #666;">
        Generated on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}
      </div>
    </div>
  `
}