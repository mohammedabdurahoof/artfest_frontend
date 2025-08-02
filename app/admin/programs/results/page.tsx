"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Trophy, Medal, Award, ArrowLeft, Search, Eye, Download, Filter, Star } from "lucide-react"
import Link from "next/link"
import axios from "@/lib/axios"
import { toast } from "@/hooks/use-toast"

interface Result {
  _id: string
  programId: string
  studentId: string
  position: number
  points: number
  remarks?: string
  createdAt: string
}

interface Program {
  _id: string
  programCode: string
  name: string
  category: string
  venue: string
  date: string
  status: "Active" | "Completed" | "Scheduled" | "Cancelled"
  resultStatus: "Published" | "Pending" | "Not Started"
  results?: Result[]
}

interface Student {
  _id: string
  name: string
  chestNumber: string
  class: string
  team: {
    name: string
    color: string
  }
}

const categories = ["All", "Bidaya", "Ula", "Thaniyya", "Thanawiyya", "Aliya"]

export default function ResultsPage() {
  const [programs, setPrograms] = useState<Program[]>([])
  const [students, setStudents] = useState<Student[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState("All")
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedProgram, setSelectedProgram] = useState<Program | null>(null)
  const [isResultDialogOpen, setIsResultDialogOpen] = useState(false)

  useEffect(() => {
    fetchPrograms()
    fetchStudents()
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

  const fetchStudents = async () => {
    try {
      const response = await axios.get("/students")
      setStudents(response.data.data || [])
    } catch (error) {
      console.error("Error fetching students:", error)
    }
  }

  const getStudentById = (studentId: string) => {
    return students.find((s) => s._id === studentId)
  }

  const filteredPrograms = programs.filter((program) => {
    const categoryMatch = selectedCategory === "All" || program.category === selectedCategory
    const searchMatch =
      program.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      program.programCode.toLowerCase().includes(searchTerm.toLowerCase())
    return categoryMatch && searchMatch
  })

  const getStatusColor = (status: string) => {
    const colors = {
      Published: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
      Pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
      "Not Started": "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300",
    }
    return colors[status as keyof typeof colors] || "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300"
  }

  const getPositionIcon = (position: number) => {
    switch (position) {
      case 1:
        return <Trophy className="h-5 w-5 text-yellow-500" />
      case 2:
        return <Medal className="h-5 w-5 text-gray-400" />
      case 3:
        return <Award className="h-5 w-5 text-amber-600" />
      default:
        return <Star className="h-5 w-5 text-blue-500" />
    }
  }

  const getPositionColor = (position: number) => {
    switch (position) {
      case 1:
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
      case 2:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300"
      case 3:
        return "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300"
      default:
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
    }
  }

  const handleViewResults = (program: Program) => {
    setSelectedProgram(program)
    setIsResultDialogOpen(true)
  }

  const publishedPrograms = filteredPrograms.filter((p) => p.resultStatus === "Published")
  const pendingPrograms = filteredPrograms.filter((p) => p.resultStatus === "Pending")
  const notStartedPrograms = filteredPrograms.filter((p) => p.resultStatus === "Not Started")

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <div className="h-9 w-32 bg-gray-200 rounded animate-pulse" />
          <div>
            <div className="h-8 w-48 bg-gray-200 rounded animate-pulse" />
            <div className="h-4 w-64 bg-gray-200 rounded animate-pulse mt-2" />
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-32 bg-gray-200 rounded animate-pulse" />
          ))}
        </div>
        <div className="h-96 bg-gray-200 rounded animate-pulse" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/programs">
          <Button variant="outline" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Programs
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Program Results</h1>
          <p className="text-muted-foreground">View and manage competition results</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Published Results</CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{publishedPrograms.length}</div>
            <p className="text-xs text-muted-foreground">Results available</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Results</CardTitle>
            <Medal className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingPrograms.length}</div>
            <p className="text-xs text-muted-foreground">Awaiting publication</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Not Started</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{notStartedPrograms.length}</div>
            <p className="text-xs text-muted-foreground">Programs not judged</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Category</label>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger>
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
            <div className="space-y-2">
              <label className="text-sm font-medium">Search</label>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search programs..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            <div className="flex items-end">
              <Button
                variant="outline"
                onClick={() => {
                  setSelectedCategory("All")
                  setSearchTerm("")
                }}
              >
                Clear Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results Table */}
      <Card>
        <CardHeader>
          <CardTitle>Program Results</CardTitle>
          <CardDescription>View results for all programs</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Program</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Venue</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Result Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPrograms.map((program) => (
                  <TableRow key={program._id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{program.name}</div>
                        <div className="text-sm text-muted-foreground">{program.programCode}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{program.category}</Badge>
                    </TableCell>
                    <TableCell>{new Date(program.date).toLocaleDateString()}</TableCell>
                    <TableCell>{program.venue}</TableCell>
                    <TableCell>
                      <Badge variant={program.status === "Completed" ? "default" : "secondary"}>{program.status}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(program.resultStatus)}>{program.resultStatus}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex gap-2 justify-end">
                        {program.resultStatus === "Published" && (
                          <>
                            <Button variant="outline" size="sm" onClick={() => handleViewResults(program)}>
                              <Eye className="mr-2 h-4 w-4" />
                              View
                            </Button>
                            <Button variant="outline" size="sm">
                              <Download className="mr-2 h-4 w-4" />
                              Export
                            </Button>
                          </>
                        )}
                        {program.resultStatus === "Pending" && (
                          <Button variant="outline" size="sm" disabled>
                            Pending Review
                          </Button>
                        )}
                        {program.resultStatus === "Not Started" && (
                          <Button variant="outline" size="sm" disabled>
                            Not Available
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Results Detail Dialog */}
      <Dialog open={isResultDialogOpen} onOpenChange={setIsResultDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5" />
              {selectedProgram?.name} Results
            </DialogTitle>
            <DialogDescription>
              Program Code: {selectedProgram?.programCode} | Category: {selectedProgram?.category}
            </DialogDescription>
          </DialogHeader>

          {selectedProgram?.results && selectedProgram.results.length > 0 ? (
            <div className="space-y-4">
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Position</TableHead>
                      <TableHead>Student</TableHead>
                      <TableHead>Chest No.</TableHead>
                      <TableHead>Team</TableHead>
                      <TableHead>Points</TableHead>
                      <TableHead>Remarks</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {selectedProgram.results
                      .sort((a, b) => a.position - b.position)
                      .map((result) => {
                        const student = getStudentById(result.studentId)
                        return (
                          <TableRow key={result._id}>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                {getPositionIcon(result.position)}
                                <Badge className={getPositionColor(result.position)}>
                                  {result.position === 1
                                    ? "1st"
                                    : result.position === 2
                                      ? "2nd"
                                      : result.position === 3
                                        ? "3rd"
                                        : `${result.position}th`}
                                </Badge>
                              </div>
                            </TableCell>
                            <TableCell className="font-medium">{student?.name || "Unknown Student"}</TableCell>
                            <TableCell>{student?.chestNumber || "N/A"}</TableCell>
                            <TableCell>
                              {student?.team && (
                                <div className="flex items-center gap-2">
                                  <div
                                    className="w-3 h-3 rounded-full"
                                    style={{ backgroundColor: student.team.color }}
                                  />
                                  {student.team.name}
                                </div>
                              )}
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline">{result.points} pts</Badge>
                            </TableCell>
                            <TableCell className="text-sm text-muted-foreground">
                              {result.remarks || "No remarks"}
                            </TableCell>
                          </TableRow>
                        )
                      })}
                  </TableBody>
                </Table>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <Trophy className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Results Available</h3>
              <p className="text-muted-foreground">Results for this program have not been published yet.</p>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsResultDialogOpen(false)}>
              Close
            </Button>
            {selectedProgram?.results && selectedProgram.results.length > 0 && (
              <Button>
                <Download className="mr-2 h-4 w-4" />
                Export Results
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
