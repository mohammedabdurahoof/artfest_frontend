"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Plus, Search, Edit, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { toast } from "sonner"
import api from "@/lib/axios"

interface Position {
  id: string
  name: string
  description: string
  rank: number
  createdAt: string
}

interface Grade {
  id: string
  name: string
  description: string
  minScore: number
  maxScore: number
  color: string
  createdAt: string
}

export default function PositionsGradesPage() {
  const [positions, setPositions] = useState<Position[]>([])
  const [grades, setGrades] = useState<Grade[]>([])
  const [filteredPositions, setFilteredPositions] = useState<Position[]>([])
  const [filteredGrades, setFilteredGrades] = useState<Grade[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [isPositionDialogOpen, setIsPositionDialogOpen] = useState(false)
  const [isGradeDialogOpen, setIsGradeDialogOpen] = useState(false)
  const [editingPosition, setEditingPosition] = useState<Position | null>(null)
  const [editingGrade, setEditingGrade] = useState<Grade | null>(null)
  const [positionFormData, setPositionFormData] = useState({
    name: "",
    description: "",
    rank: 1,
  })
  const [gradeFormData, setGradeFormData] = useState({
    name: "",
    description: "",
    minScore: 0,
    maxScore: 100,
    color: "#3b82f6",
  })

  useEffect(() => {
    fetchPositions()
    fetchGrades()
  }, [])

  useEffect(() => {
    const filteredPos = positions.filter(
      (position) =>
        position.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        position.description.toLowerCase().includes(searchTerm.toLowerCase()),
    )
    setFilteredPositions(filteredPos)

    const filteredGrd = grades.filter(
      (grade) =>
        grade.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        grade.description.toLowerCase().includes(searchTerm.toLowerCase()),
    )
    setFilteredGrades(filteredGrd)
  }, [positions, grades, searchTerm])

  const fetchPositions = async () => {
    try {
      setIsLoading(true)
      const response = await api.get("/positions")
      setPositions(response.data)
    } catch (error) {
      toast.error("Failed to fetch positions")
    } finally {
      setIsLoading(false)
    }
  }

  const fetchGrades = async () => {
    try {
      const response = await api.get("/grades")
      setGrades(response.data)
    } catch (error) {
      toast.error("Failed to fetch grades")
    }
  }

  const handlePositionSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (editingPosition) {
        await api.put(`/positions/${editingPosition.id}`, positionFormData)
        toast.success("Position updated successfully")
      } else {
        await api.post("/positions", positionFormData)
        toast.success("Position created successfully")
      }
      fetchPositions()
      resetPositionForm()
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Operation failed")
    }
  }

  const handleGradeSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (editingGrade) {
        await api.put(`/grades/${editingGrade.id}`, gradeFormData)
        toast.success("Grade updated successfully")
      } else {
        await api.post("/grades", gradeFormData)
        toast.success("Grade created successfully")
      }
      fetchGrades()
      resetGradeForm()
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Operation failed")
    }
  }

  const handleEditPosition = (position: Position) => {
    setEditingPosition(position)
    setPositionFormData({
      name: position.name,
      description: position.description,
      rank: position.rank,
    })
    setIsPositionDialogOpen(true)
  }

  const handleEditGrade = (grade: Grade) => {
    setEditingGrade(grade)
    setGradeFormData({
      name: grade.name,
      description: grade.description,
      minScore: grade.minScore,
      maxScore: grade.maxScore,
      color: grade.color,
    })
    setIsGradeDialogOpen(true)
  }

  const handleDeletePosition = async (id: string) => {
    try {
      await api.delete(`/positions/${id}`)
      toast.success("Position deleted successfully")
      fetchPositions()
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to delete position")
    }
  }

  const handleDeleteGrade = async (id: string) => {
    try {
      await api.delete(`/grades/${id}`)
      toast.success("Grade deleted successfully")
      fetchGrades()
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to delete grade")
    }
  }

  const resetPositionForm = () => {
    setPositionFormData({
      name: "",
      description: "",
      rank: 1,
    })
    setEditingPosition(null)
    setIsPositionDialogOpen(false)
  }

  const resetGradeForm = () => {
    setGradeFormData({
      name: "",
      description: "",
      minScore: 0,
      maxScore: 100,
      color: "#3b82f6",
    })
    setEditingGrade(null)
    setIsGradeDialogOpen(false)
  }

  return (
    <>
      <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 h-4" />
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/admin">Dashboard</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Positions & Grades</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </header>

      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Positions & Grades</h2>
            <p className="text-muted-foreground">Manage competition positions and grading system</p>
          </div>
          <div className="flex items-center space-x-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
          </div>
        </div>

        <Tabs defaultValue="positions" className="space-y-4">
          <TabsList>
            <TabsTrigger value="positions">Positions</TabsTrigger>
            <TabsTrigger value="grades">Grades</TabsTrigger>
          </TabsList>

          <TabsContent value="positions" className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium">Competition Positions</h3>
                <p className="text-sm text-muted-foreground">Manage ranking positions for competitions</p>
              </div>
              <Dialog open={isPositionDialogOpen} onOpenChange={setIsPositionDialogOpen}>
                <DialogTrigger asChild>
                  <Button onClick={() => resetPositionForm()}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Position
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>{editingPosition ? "Edit Position" : "Add New Position"}</DialogTitle>
                    <DialogDescription>
                      {editingPosition ? "Update position information" : "Create a new competition position"}
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handlePositionSubmit}>
                    <div className="grid gap-4 py-4">
                      <div className="grid gap-2">
                        <Label htmlFor="position-name">Position Name</Label>
                        <Input
                          id="position-name"
                          value={positionFormData.name}
                          onChange={(e) => setPositionFormData({ ...positionFormData, name: e.target.value })}
                          required
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="position-description">Description</Label>
                        <Textarea
                          id="position-description"
                          value={positionFormData.description}
                          onChange={(e) => setPositionFormData({ ...positionFormData, description: e.target.value })}
                          required
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="position-rank">Rank</Label>
                        <Input
                          id="position-rank"
                          type="number"
                          min="1"
                          value={positionFormData.rank}
                          onChange={(e) =>
                            setPositionFormData({ ...positionFormData, rank: Number.parseInt(e.target.value) })
                          }
                          required
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button type="button" variant="outline" onClick={resetPositionForm}>
                        Cancel
                      </Button>
                      <Button type="submit">{editingPosition ? "Update" : "Create"}</Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            <Card>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Position</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Rank</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoading ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center">
                          Loading...
                        </TableCell>
                      </TableRow>
                    ) : filteredPositions.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center">
                          No positions found
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredPositions.map((position) => (
                        <TableRow key={position.id}>
                          <TableCell className="font-medium">{position.name}</TableCell>
                          <TableCell className="max-w-xs truncate">{position.description}</TableCell>
                          <TableCell>
                            <Badge variant="outline">#{position.rank}</Badge>
                          </TableCell>
                          <TableCell>{new Date(position.createdAt).toLocaleDateString()}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end space-x-2">
                              <Button variant="outline" size="sm" onClick={() => handleEditPosition(position)}>
                                <Edit className="h-4 w-4" />
                              </Button>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button variant="outline" size="sm">
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      This action cannot be undone. This will permanently delete the position.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => handleDeletePosition(position.id)}>
                                      Delete
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="grades" className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium">Grading System</h3>
                <p className="text-sm text-muted-foreground">Manage score ranges and grade classifications</p>
              </div>
              <Dialog open={isGradeDialogOpen} onOpenChange={setIsGradeDialogOpen}>
                <DialogTrigger asChild>
                  <Button onClick={() => resetGradeForm()}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Grade
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>{editingGrade ? "Edit Grade" : "Add New Grade"}</DialogTitle>
                    <DialogDescription>
                      {editingGrade ? "Update grade information" : "Create a new grade classification"}
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleGradeSubmit}>
                    <div className="grid gap-4 py-4">
                      <div className="grid gap-2">
                        <Label htmlFor="grade-name">Grade Name</Label>
                        <Input
                          id="grade-name"
                          value={gradeFormData.name}
                          onChange={(e) => setGradeFormData({ ...gradeFormData, name: e.target.value })}
                          required
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="grade-description">Description</Label>
                        <Textarea
                          id="grade-description"
                          value={gradeFormData.description}
                          onChange={(e) => setGradeFormData({ ...gradeFormData, description: e.target.value })}
                          required
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                          <Label htmlFor="min-score">Min Score</Label>
                          <Input
                            id="min-score"
                            type="number"
                            min="0"
                            max="100"
                            value={gradeFormData.minScore}
                            onChange={(e) =>
                              setGradeFormData({ ...gradeFormData, minScore: Number.parseInt(e.target.value) })
                            }
                            required
                          />
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="max-score">Max Score</Label>
                          <Input
                            id="max-score"
                            type="number"
                            min="0"
                            max="100"
                            value={gradeFormData.maxScore}
                            onChange={(e) =>
                              setGradeFormData({ ...gradeFormData, maxScore: Number.parseInt(e.target.value) })
                            }
                            required
                          />
                        </div>
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="grade-color">Color</Label>
                        <div className="flex items-center space-x-2">
                          <Input
                            id="grade-color"
                            type="color"
                            value={gradeFormData.color}
                            onChange={(e) => setGradeFormData({ ...gradeFormData, color: e.target.value })}
                            className="w-16 h-10"
                          />
                          <Input
                            value={gradeFormData.color}
                            onChange={(e) => setGradeFormData({ ...gradeFormData, color: e.target.value })}
                            placeholder="#3b82f6"
                          />
                        </div>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button type="button" variant="outline" onClick={resetGradeForm}>
                        Cancel
                      </Button>
                      <Button type="submit">{editingGrade ? "Update" : "Create"}</Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            <Card>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Grade</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Score Range</TableHead>
                      <TableHead>Color</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredGrades.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center">
                          No grades found
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredGrades.map((grade) => (
                        <TableRow key={grade.id}>
                          <TableCell className="font-medium">{grade.name}</TableCell>
                          <TableCell className="max-w-xs truncate">{grade.description}</TableCell>
                          <TableCell>
                            <Badge variant="outline">
                              {grade.minScore} - {grade.maxScore}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <div className="w-4 h-4 rounded-full border" style={{ backgroundColor: grade.color }} />
                              <span className="text-sm text-muted-foreground">{grade.color}</span>
                            </div>
                          </TableCell>
                          <TableCell>{new Date(grade.createdAt).toLocaleDateString()}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end space-x-2">
                              <Button variant="outline" size="sm" onClick={() => handleEditGrade(grade)}>
                                <Edit className="h-4 w-4" />
                              </Button>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button variant="outline" size="sm">
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      This action cannot be undone. This will permanently delete the grade.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => handleDeleteGrade(grade.id)}>
                                      Delete
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </>
  )
}
