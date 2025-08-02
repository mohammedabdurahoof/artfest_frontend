"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ArrowLeft, Trophy, Medal, Award, Search, Download, Eye, Users, Target, Calendar } from "lucide-react"
import { toast } from "@/hooks/use-toast"
import axios from "@/lib/axios"
import Link from "next/link"

interface Program {
  _id: string
  programCode: string
  name: string
  category: string
  venue: string
  date: string
  status: string
  resultStatus: "Published" | "Pending" | "Not Started"
  noOfCandidates: number
}

interface Result {
  _id: string
  programId: string
  program: Program
  studentId: string
  student: {
    _id: string
    name: string
    chestNo: string
    team: {
      _id: string
      name: string
      color: string
    }
  }
  position: number
  points: number
  grade: string
  remarks?: string
  createdAt: string
}

const categories = ["All", "Bidaya", "Ula", "Thaniyya", "Thanawiyya", "Aliya"]
const resultStatuses = ["All", "Published", "Pending", "Not Started"]

export default function ProgramResultsPage() {
  const [programs, setPrograms] = useState<Program[]>([])
  const [results, setResults] = useState<Result[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("All")
  const [selectedStatus, setSelectedStatus] = useState("All")
  const [selectedProgram, setSelectedProgram] = useState<Program | null>(null)
  const [programResults, setProgramResults] = useState<Result[]>([])
  const [isResultsDialogOpen, setIsResultsDialogOpen] = useState(false)

  useEffect(() => {
    fetchPrograms()
    fetchResults()
  }, [])

  const fetchPrograms = async () => {
    try {
      const response = await axios.get("/programs")
      setPrograms(response.data.data || [])
    } catch (error) {
      console.error("Error fetching programs:", error)
      toast({
        title: "Error",
        description: "Failed to fetch programs",
        variant: "destructive",
      })
    }
  }

  const fetchResults = async () => {
    try {
      setLoading(true)
      const response = await axios.get("/results")
      setResults(response.data.data || [])
    } catch (error) {
      console.error("Error fetching results:", error)
      toast({
        title: "Error",
        description: "Failed to fetch results",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const fetchProgramResults = async (programId: string) => {
    try {
      const response = await axios.get(`/results/program/${programId}`)
      setProgramResults(response.data.data || [])
    } catch (error) {
      console.error("Error fetching program results:", error)
      toast({
        title: "Error",
        description: "Failed to fetch program results",
        variant: "destructive",
      })
    }
  }

  const handleViewResults = async (program: Program) => {
    setSelectedProgram(program)
    await fetchProgramResults(program._id)
    setIsResultsDialogOpen(true)
  }

  const handleExportResults = async (programId: string) => {
    try {
      const response = await axios.get(`/results/export/${programId}`, {
        responseType: "blob",
      })
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement("a")
      link.href = url
      link.setAttribute("download", `results-${programId}.csv`)
      document.body.appendChild(link)
      link.click()
      link.remove()
      toast({
        title: "Success",
        description: "Results exported successfully",
      })
    } catch (error) {
      console.error("Error exporting results:", error)
      toast({
        title: "Error",
        description: "Failed to export results",
        variant: "destructive",
      })
    }
  }

  const filteredPrograms = programs.filter((program) => {
    const matchesSearch =
      program.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      program.programCode.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === "All" || program.category === selectedCategory
    const matchesStatus = selectedStatus === "All" || program.resultStatus === selectedStatus
    return matchesSearch && matchesCategory && matchesStatus
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
        return <span className="text-lg font-bold">{position}</span>
    }
  }

  const getPositionColor = (position: number) => {
    switch (position) {
      case 1:
        return "bg-yellow-100 text-yellow-800 border-yellow-300"
      case 2:
        return "bg-gray-100 text-gray-800 border-gray-300"
      case 3:
        return "bg-amber-100 text-amber-800 border-amber-300"
      default:
        return "bg-blue-100 text-blue-800 border-blue-300"
    }
  }

  const publishedPrograms = programs.filter((p) => p.resultStatus === "Published").length
  const pendingPrograms = programs.filter((p) => p.resultStatus === "Pending").length
  const totalResults = results.length
  const totalParticipants = programs.reduce((sum, p) => sum + p.noOfCandidates, 0)

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="h-8 w-48 bg-gray-200 rounded animate-pulse" />
            <div className="h-4 w-64 bg-gray-200 rounded animate-pulse mt-2" />
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-24 bg-gray-200 rounded animate-pulse" />
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
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Published Results</CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{publishedPrograms}</div>
            <p className="text-xs text-muted-foreground">Results available</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Results</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingPrograms}</div>
            <p className="text-xs text-muted-foreground">Awaiting publication</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Results</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalResults}</div>
            <p className="text-xs text-muted-foreground">Individual results</p>
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
          <CardTitle>Program Results</CardTitle>
          <CardDescription>View and manage results for all programs</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search programs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                {resultStatuses.map((status) => (
                  <SelectItem key={status} value={status}>
                    {status}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Program Code</TableHead>
                  <TableHead>Program Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Participants</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPrograms.map((program) => (
                  <TableRow key={program._id}>
                    <TableCell className="font-medium">{program.programCode}</TableCell>
                    <TableCell>{program.name}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{program.category}</Badge>
                    </TableCell>
                    <TableCell>{program.noOfCandidates}</TableCell>
                    <TableCell>{new Date(program.date).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(program.resultStatus)}>{program.resultStatus}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center gap-2 justify-end">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewResults(program)}
                          disabled={program.resultStatus === "Not Started"}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleExportResults(program._id)}
                          disabled={program.resultStatus !== "Published"}
                        >
                          <Download className="h-4 w-4 mr-1" />
                          Export
                        </Button>
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
      <Dialog open={isResultsDialogOpen} onOpenChange={setIsResultsDialogOpen}>
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
          <div className="space-y-4">
            {programResults.length === 0 ? (
              <div className="text-center py-8">
                <Trophy className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Results Available</h3>
                <p className="text-muted-foreground">Results have not been published for this program yet.</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="grid gap-4">
                  {programResults
                    .sort((a, b) => a.position - b.position)
                    .map((result) => (
                      <div
                        key={result._id}
                        className={`flex items-center justify-between p-4 border rounded-lg ${getPositionColor(
                          result.position,
                        )}`}
                      >
                        <div className="flex items-center gap-4">
                          <div className="flex items-center justify-center w-12 h-12 rounded-full bg-white border-2">
                            {getPositionIcon(result.position)}
                          </div>
                          <div>
                            <h4 className="font-semibold">{result.student.name}</h4>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <span>Chest No: {result.student.chestNo}</span>
                              <span>•</span>
                              <div className="flex items-center gap-1">
                                <div
                                  className="w-3 h-3 rounded-full"
                                  style={{ backgroundColor: result.student.team.color }}
                                />
                                {result.student.team.name}
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold">{result.points} points</div>
                          <div className="text-sm text-muted-foreground">Grade: {result.grade}</div>
                          {result.remarks && <div className="text-xs text-muted-foreground mt-1">{result.remarks}</div>}
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
