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
} from "lucide-react"
import { toast } from "@/hooks/use-toast"
import axios from "@/lib/axios"
import Link from "next/link"

interface Program {
  _id: string
  programCode: string
  name: string
  description: string
  duration: number
  category: string
  isStage: boolean
  isGroup: boolean
  maxParticipants: number
  venue: string
  date: string
  startingTime: string
  endingTime: string
  status: "Active" | "Completed" | "Scheduled" | "Cancelled"
  resultStatus: "Published" | "Pending" | "Not Started"
  judge?: string
  noOfCandidates: number
  createdAt: string
  updatedAt: string
}

const categories = ["Bidaya", "Ula", "Thaniyya", "Thanawiyya", "Aliya"]
const venues = ["Main Hall", "Auditorium", "Conference Room", "Outdoor Stage", "Classroom A", "Classroom B"]

export default function ProgramsPage() {
  const [programs, setPrograms] = useState<Program[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [editingProgram, setEditingProgram] = useState<Program | null>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [programToDelete, setProgramToDelete] = useState<Program | null>(null)

  const [programFormData, setProgramFormData] = useState({
    programCode: "",
    name: "",
    description: "",
    duration: 15,
    category: "",
    isStage: true,
    isGroup: false,
    maxParticipants: 1,
    venue: "",
    date: "",
    startingTime: "",
    endingTime: "",
    judge: "",
  })

  useEffect(() => {
    fetchPrograms()
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

  const handleEditProgram = (program: Program) => {
    setEditingProgram(program)
    setProgramFormData({
      programCode: program.programCode,
      name: program.name,
      description: program.description,
      duration: program.duration,
      category: program.category,
      isStage: program.isStage,
      isGroup: program.isGroup,
      maxParticipants: program.maxParticipants,
      venue: program.venue,
      date: program.date,
      startingTime: program.startingTime,
      endingTime: program.endingTime,
      judge: program.judge || "",
    })
    setIsEditDialogOpen(true)
  }

  const handleUpdateProgram = async () => {
    if (!editingProgram) return

    try {
      await axios.put(`/programs/${editingProgram._id}`, programFormData)
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

  const totalPrograms = programs.length
  const activePrograms = programs.filter((p) => p.status === "Active").length
  const completedPrograms = programs.filter((p) => p.status === "Completed").length
  const totalParticipants = programs.reduce((sum, p) => sum + p.noOfCandidates, 0)

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
            <p className="text-xs text-muted-foreground">{activePrograms} active programs</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Programs</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activePrograms}</div>
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
            <CardTitle className="text-sm font-medium">Total Participants</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalParticipants}</div>
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
                      {program.noOfCandidates}/{program.maxParticipants}
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div>{new Date(program.date).toLocaleDateString()}</div>
                        <div className="text-muted-foreground">
                          {program.startingTime} - {program.endingTime}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-sm">
                        <MapPin className="h-3 w-3" />
                        {program.venue}
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
                <Label htmlFor="edit-maxParticipants">Max Participants</Label>
                <Input
                  id="edit-maxParticipants"
                  type="number"
                  value={programFormData.maxParticipants}
                  onChange={(e) =>
                    setProgramFormData({ ...programFormData, maxParticipants: Number.parseInt(e.target.value) })
                  }
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
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
              <div className="grid gap-2">
                <Label htmlFor="edit-judge">Judge</Label>
                <Input
                  id="edit-judge"
                  value={programFormData.judge}
                  onChange={(e) => setProgramFormData({ ...programFormData, judge: e.target.value })}
                />
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
    </div>
  )
}
