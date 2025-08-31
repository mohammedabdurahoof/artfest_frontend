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
import { toast } from "@/hooks/use-toast"
import { Search, Plus, MoreHorizontal, Edit, Trash2, Upload, Users, Trophy, Target } from "lucide-react"
import Link from "next/link"
import axiosInstance from "@/lib/axios"
import type { Student, Team, Category, StudentFormData } from "@/types"
import { useAuth } from "@/components/auth-provider"

const categories: Category[] = ["Bidaya", "Ula", "Thaniyya", "Thanawiyya", "Aliya"]

export default function StudentsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [students, setStudents] = useState<Student[]>([])
  const [teams, setTeams] = useState<Team[]>([])
  const [loading, setLoading] = useState(true)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null)
  const [editFormData, setEditFormData] = useState<StudentFormData>({
    name: "",
    chestNo: "",
    class: "",
    category: "Bidaya",
    team: "",
  })

  const { hasPermission } = useAuth()

  useEffect(() => {
    fetchStudents()
    fetchTeams()
  }, [])

  const fetchStudents = async () => {
    try {
      const response = await axiosInstance.get("/students")
      setStudents(response.data.data || [])
    } catch (error) {
      console.error("Error fetching students:", error)
      toast({
        title: "Error",
        description: "Failed to fetch students",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const fetchTeams = async () => {
    try {
      const response = await axiosInstance.get("/teams")
      setTeams(response.data.data || [])
    } catch (error) {
      console.error("Error fetching teams:", error)
    }
  }

  const filteredStudents = students.filter(
    (student) =>
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.chestNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.class.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const getCategoryColor = (category: string) => {
    const colors = {
      Bidaya: "bg-green-100 text-green-800",
      Ula: "bg-blue-100 text-blue-800",
      Thaniyya: "bg-purple-100 text-purple-800",
      Thanawiyya: "bg-orange-100 text-orange-800",
      Aliya: "bg-red-100 text-red-800",
    }
    return colors[category as keyof typeof colors] || "bg-gray-100 text-gray-800"
  }

  const getTeamColor = (team: Team) => {

    if (!team || !team.color) return { backgroundColor: "transparent", color: "inherit", borderColor: "transparent" }
    return {
      backgroundColor: `${team.color}20`,
      color: team.color,
      borderColor: `${team.color}40`,
    }
  }

  const handleEdit = (student: Student) => {
    setSelectedStudent(student)
    setEditFormData({
      name: student.name,
      chestNo: student.chestNo,
      class: student.class,
      category: student.category,
      team: student.team?._id,
    })
    setEditDialogOpen(true)
  }

  const handleDelete = (student: Student) => {
    setSelectedStudent(student)
    setDeleteDialogOpen(true)
  }

  const handleEditSubmit = async () => {
    if (!selectedStudent) return

    try {
      await axiosInstance.patch(`/students/${selectedStudent._id}`, editFormData)
      toast({
        title: "Success",
        description: "Student updated successfully",
      })
      setEditDialogOpen(false)
      fetchStudents()
    } catch (error: any) {
      console.error("Error updating student:", error)
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to update student",
        variant: "destructive",
      })
    }
  }

  const handleDeleteConfirm = async () => {
    if (!selectedStudent) return

    try {
      await axiosInstance.delete(`/students/${selectedStudent._id}`)
      toast({
        title: "Success",
        description: "Student deleted successfully",
      })
      setDeleteDialogOpen(false)
      fetchStudents()
    } catch (error: any) {
      console.error("Error deleting student:", error)
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to delete student",
        variant: "destructive",
      })
    }
  }

  const totalStudents = students.length
  const totalPoints = students.reduce((sum, student) => sum + student.totalPoint, 0)
  const topStudent = students.reduce(
    (top, student) => (student.totalPoint > (top?.totalPoint || 0) ? student : top),
    null as Student | null,
  )

  if (loading) {
    return <div>Loading...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Students</h1>
          <p className="text-muted-foreground">Manage student registrations and information</p>
        </div>
        <div className="flex gap-2">
          {hasPermission("import_students") && (
            <Button variant="outline" asChild>
              <Link href="/admin/students/import">
                <Upload className="mr-2 h-4 w-4" />
                Import Students
              </Link>
            </Button>
          )}
          {hasPermission("add_student") && (
            <Button asChild>
              <Link href="/admin/students/add">
                <Plus className="mr-2 h-4 w-4" />
                Add Student
              </Link>
            </Button>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      {/* <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Students</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalStudents}</div>
            <p className="text-xs text-muted-foreground">Registered in the system</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Top Performer</CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{topStudent?.name || "N/A"}</div>
            <p className="text-xs text-muted-foreground">
              {topStudent ? `${topStudent.totalPoint} points` : "No data"}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Points</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalPoints}</div>
            <p className="text-xs text-muted-foreground">Across all students</p>
          </CardContent>
        </Card>
      </div> */}

      <Card>
        <CardHeader>
          <CardTitle>All Students</CardTitle>
          <CardDescription>A list of all registered students in the system</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2 mb-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search students..."
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
                  <TableHead>Chest No</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Class</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Team</TableHead>
                  <TableHead>Total Points</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredStudents.map((student) => (
                  <TableRow key={student._id}>
                    <TableCell className="font-medium">{student.chestNo}</TableCell>
                    <TableCell>{student.name}</TableCell>
                    <TableCell>{student.class}</TableCell>
                    <TableCell>
                      <Badge className={getCategoryColor(student.category)}>{student.category}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge style={getTeamColor(student.team)} className="border">
                        {student.team?.name}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className="font-medium">{typeof student.totalPoint === "object"
                        ? student.totalPoint.published || 0
                        : student.totalPoint || 0}</span>
                    </TableCell>
                    <TableCell className="text-right">
                      {hasPermission("edit_students") || hasPermission("delete_students") ? (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <span className="sr-only">Open menu</span>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            {hasPermission("edit_students") && (
                              <DropdownMenuItem onClick={() => handleEdit(student)}>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit Student
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuSeparator />
                            {hasPermission("delete_students") && (
                              <DropdownMenuItem className="text-red-600" onClick={() => handleDelete(student)}>
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete Student
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      ) : (
                        ""
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Student</DialogTitle>
            <DialogDescription>Make changes to the student information here.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-name" className="text-right">
                Name
              </Label>
              <Input
                id="edit-name"
                value={editFormData.name}
                onChange={(e) => setEditFormData((prev) => ({ ...prev, name: e.target.value }))}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-chestNo" className="text-right">
                Chest No
              </Label>
              <Input
                id="edit-chestNo"
                value={editFormData.chestNo}
                onChange={(e) => setEditFormData((prev) => ({ ...prev, chestNo: e.target.value }))}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-class" className="text-right">
                Class
              </Label>
              <Input
                id="edit-class"
                value={editFormData.class}
                onChange={(e) => setEditFormData((prev) => ({ ...prev, class: e.target.value }))}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-category" className="text-right">
                Category
              </Label>
              <Select
                value={editFormData.category}
                onValueChange={(value: Category) => setEditFormData((prev) => ({ ...prev, category: value }))}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue />
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
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-team" className="text-right">
                Team
              </Label>
              <Select
                value={editFormData.team}
                onValueChange={(value) => setEditFormData((prev) => ({ ...prev, team: value }))}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {teams.map((team) => (
                    <SelectItem key={team._id} value={team._id}>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: team.color }} />
                        {team.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" onClick={handleEditSubmit}>
              Save changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Student</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete {selectedStudent?.name}? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteConfirm}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
