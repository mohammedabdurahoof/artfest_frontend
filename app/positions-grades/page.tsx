"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Search, Plus, MoreHorizontal, Edit, Trash2, Award, Medal } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface Position {
  id: number
  category: "first" | "second" | "third"
  isGroup: boolean
  points: number
  usageCount: number
  createdAt: string
}

interface Grade {
  id: number
  category: "A" | "B" | "C"
  isGroup: boolean
  points: number
  usageCount: number
  createdAt: string
}

export default function PositionsGradesPage() {
  const [positions, setPositions] = useState<Position[]>([])
  const [grades, setGrades] = useState<Grade[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [isPositionDialogOpen, setIsPositionDialogOpen] = useState(false)
  const [isGradeDialogOpen, setIsGradeDialogOpen] = useState(false)
  const [editingPosition, setEditingPosition] = useState<Position | null>(null)
  const [editingGrade, setEditingGrade] = useState<Grade | null>(null)
  const [positionFormData, setPositionFormData] = useState({
    category: "first" as "first" | "second" | "third",
    isGroup: false,
    points: 0,
  })
  const [gradeFormData, setGradeFormData] = useState({
    category: "A" as "A" | "B" | "C",
    isGroup: false,
    points: 0,
  })

  useEffect(() => {
    fetchPositions()
    fetchGrades()
  }, [])

  const fetchPositions = async () => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch("http://localhost:5001/api/positions", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setPositions(data)
      } else {
        setError("Failed to fetch positions")
      }
    } catch (error) {
      setError("Network error")
    } finally {
      setLoading(false)
    }
  }

  const fetchGrades = async () => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch("http://localhost:5001/api/grades", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setGrades(data)
      }
    } catch (error) {
      console.error("Failed to fetch grades")
    }
  }

  const handlePositionSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const token = localStorage.getItem("token")
      const url = editingPosition
        ? `http://localhost:5001/api/positions/${editingPosition.id}`
        : "http://localhost:5001/api/positions"

      const method = editingPosition ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(positionFormData),
      })

      if (response.ok) {
        fetchPositions()
        setIsPositionDialogOpen(false)
        resetPositionForm()
      } else {
        const data = await response.json()
        setError(data.message || "Operation failed")
      }
    } catch (error) {
      setError("Network error")
    } finally {
      setLoading(false)
    }
  }

  const handleGradeSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const token = localStorage.getItem("token")
      const url = editingGrade
        ? `http://localhost:5001/api/grades/${editingGrade.id}`
        : "http://localhost:5001/api/grades"

      const method = editingGrade ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(gradeFormData),
      })

      if (response.ok) {
        fetchGrades()
        setIsGradeDialogOpen(false)
        resetGradeForm()
      } else {
        const data = await response.json()
        setError(data.message || "Operation failed")
      }
    } catch (error) {
      setError("Network error")
    } finally {
      setLoading(false)
    }
  }

  const handleDeletePosition = async (id: number) => {
    if (!confirm("Are you sure you want to delete this position?")) return

    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`http://localhost:5001/api/positions/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        fetchPositions()
      } else {
        setError("Failed to delete position")
      }
    } catch (error) {
      setError("Network error")
    }
  }

  const handleDeleteGrade = async (id: number) => {
    if (!confirm("Are you sure you want to delete this grade?")) return

    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`http://localhost:5001/api/grades/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        fetchGrades()
      } else {
        setError("Failed to delete grade")
      }
    } catch (error) {
      setError("Network error")
    }
  }

  const resetPositionForm = () => {
    setPositionFormData({
      category: "first",
      isGroup: false,
      points: 0,
    })
    setEditingPosition(null)
  }

  const resetGradeForm = () => {
    setGradeFormData({
      category: "A",
      isGroup: false,
      points: 0,
    })
    setEditingGrade(null)
  }

  const openEditPositionDialog = (position: Position) => {
    setEditingPosition(position)
    setPositionFormData({
      category: position.category,
      isGroup: position.isGroup,
      points: position.points,
    })
    setIsPositionDialogOpen(true)
  }

  const openEditGradeDialog = (grade: Grade) => {
    setEditingGrade(grade)
    setGradeFormData({
      category: grade.category,
      isGroup: grade.isGroup,
      points: grade.points,
    })
    setIsGradeDialogOpen(true)
  }

  const getPositionBadgeColor = (category: string) => {
    const colors = {
      first: "bg-yellow-100 text-yellow-800",
      second: "bg-gray-100 text-gray-800",
      third: "bg-orange-100 text-orange-800",
    }
    return colors[category as keyof typeof colors] || "bg-gray-100 text-gray-800"
  }

  const getGradeBadgeColor = (category: string) => {
    const colors = {
      A: "bg-green-100 text-green-800",
      B: "bg-blue-100 text-blue-800",
      C: "bg-purple-100 text-purple-800",
    }
    return colors[category as keyof typeof colors] || "bg-gray-100 text-gray-800"
  }

  const filteredPositions = positions.filter((position) =>
    position.category.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const filteredGrades = grades.filter((grade) => grade.category.toLowerCase().includes(searchTerm.toLowerCase()))

  if (loading && positions.length === 0) {
    return <div className="flex items-center justify-center h-64">Loading...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Positions & Grades</h1>
          <p className="text-muted-foreground">Manage competition positions and grading system</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Positions</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{positions.length}</div>
            <p className="text-xs text-muted-foreground">Position types</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Grades</CardTitle>
            <Medal className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{grades.length}</div>
            <p className="text-xs text-muted-foreground">Grade types</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Position Usage</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{positions.reduce((sum, pos) => sum + pos.usageCount, 0)}</div>
            <p className="text-xs text-muted-foreground">Total assignments</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Grade Usage</CardTitle>
            <Medal className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{grades.reduce((sum, grade) => sum + grade.usageCount, 0)}</div>
            <p className="text-xs text-muted-foreground">Total assignments</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="positions" className="space-y-4">
        <TabsList>
          <TabsTrigger value="positions" className="flex items-center gap-2">
            <Award className="h-4 w-4" />
            Positions
          </TabsTrigger>
          <TabsTrigger value="grades" className="flex items-center gap-2">
            <Medal className="h-4 w-4" />
            Grades
          </TabsTrigger>
        </TabsList>

        <TabsContent value="positions" className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search positions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
            <Dialog open={isPositionDialogOpen} onOpenChange={setIsPositionDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={resetPositionForm}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Position
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{editingPosition ? "Edit Position" : "Add New Position"}</DialogTitle>
                  <DialogDescription>
                    {editingPosition ? "Update position details" : "Create a new position type"}
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handlePositionSubmit}>
                  <div className="grid gap-4 py-4">
                    {error && (
                      <Alert variant="destructive">
                        <AlertDescription>{error}</AlertDescription>
                      </Alert>
                    )}

                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="positionCategory" className="text-right">
                        Category
                      </Label>
                      <Select
                        value={positionFormData.category}
                        onValueChange={(value) =>
                          setPositionFormData({ ...positionFormData, category: value as "first" | "second" | "third" })
                        }
                      >
                        <SelectTrigger className="col-span-3">
                          <SelectValue placeholder="Select position category" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="first">First</SelectItem>
                          <SelectItem value="second">Second</SelectItem>
                          <SelectItem value="third">Third</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="positionPoints" className="text-right">
                        Points
                      </Label>
                      <Input
                        id="positionPoints"
                        type="number"
                        value={positionFormData.points}
                        onChange={(e) =>
                          setPositionFormData({ ...positionFormData, points: Number.parseInt(e.target.value) || 0 })
                        }
                        className="col-span-3"
                        required
                      />
                    </div>

                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="positionIsGroup" className="text-right">
                        Group Position
                      </Label>
                      <div className="col-span-3">
                        <Checkbox
                          id="positionIsGroup"
                          checked={positionFormData.isGroup}
                          onCheckedChange={(checked) =>
                            setPositionFormData({ ...positionFormData, isGroup: !!checked })
                          }
                        />
                      </div>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="submit" disabled={loading}>
                      {loading ? "Saving..." : editingPosition ? "Update" : "Create"}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>All Positions</CardTitle>
              <CardDescription>Manage competition position types and their point values</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Category</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Points</TableHead>
                      <TableHead>Usage</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredPositions.map((position) => (
                      <TableRow key={position.id}>
                        <TableCell>
                          <Badge className={getPositionBadgeColor(position.category)}>{position.category}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{position.isGroup ? "Group" : "Individual"}</Badge>
                        </TableCell>
                        <TableCell className="font-medium">{position.points}</TableCell>
                        <TableCell>{position.usageCount}</TableCell>
                        <TableCell>{new Date(position.createdAt).toLocaleDateString()}</TableCell>
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
                              <DropdownMenuItem onClick={() => openEditPositionDialog(position)}>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit Position
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                className="text-red-600"
                                onClick={() => handleDeletePosition(position.id)}
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete Position
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
        </TabsContent>

        <TabsContent value="grades" className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search grades..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
            <Dialog open={isGradeDialogOpen} onOpenChange={setIsGradeDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={resetGradeForm}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Grade
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{editingGrade ? "Edit Grade" : "Add New Grade"}</DialogTitle>
                  <DialogDescription>
                    {editingGrade ? "Update grade details" : "Create a new grade type"}
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleGradeSubmit}>
                  <div className="grid gap-4 py-4">
                    {error && (
                      <Alert variant="destructive">
                        <AlertDescription>{error}</AlertDescription>
                      </Alert>
                    )}

                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="gradeCategory" className="text-right">
                        Category
                      </Label>
                      <Select
                        value={gradeFormData.category}
                        onValueChange={(value) =>
                          setGradeFormData({ ...gradeFormData, category: value as "A" | "B" | "C" })
                        }
                      >
                        <SelectTrigger className="col-span-3">
                          <SelectValue placeholder="Select grade category" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="A">Grade A</SelectItem>
                          <SelectItem value="B">Grade B</SelectItem>
                          <SelectItem value="C">Grade C</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="gradePoints" className="text-right">
                        Points
                      </Label>
                      <Input
                        id="gradePoints"
                        type="number"
                        value={gradeFormData.points}
                        onChange={(e) =>
                          setGradeFormData({ ...gradeFormData, points: Number.parseInt(e.target.value) || 0 })
                        }
                        className="col-span-3"
                        required
                      />
                    </div>

                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="gradeIsGroup" className="text-right">
                        Group Grade
                      </Label>
                      <div className="col-span-3">
                        <Checkbox
                          id="gradeIsGroup"
                          checked={gradeFormData.isGroup}
                          onCheckedChange={(checked) => setGradeFormData({ ...gradeFormData, isGroup: !!checked })}
                        />
                      </div>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="submit" disabled={loading}>
                      {loading ? "Saving..." : editingGrade ? "Update" : "Create"}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>All Grades</CardTitle>
              <CardDescription>Manage grading system and point values</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Category</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Points</TableHead>
                      <TableHead>Usage</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredGrades.map((grade) => (
                      <TableRow key={grade.id}>
                        <TableCell>
                          <Badge className={getGradeBadgeColor(grade.category)}>Grade {grade.category}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{grade.isGroup ? "Group" : "Individual"}</Badge>
                        </TableCell>
                        <TableCell className="font-medium">{grade.points}</TableCell>
                        <TableCell>{grade.usageCount}</TableCell>
                        <TableCell>{new Date(grade.createdAt).toLocaleDateString()}</TableCell>
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
                              <DropdownMenuItem onClick={() => openEditGradeDialog(grade)}>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit Grade
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem className="text-red-600" onClick={() => handleDeleteGrade(grade.id)}>
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete Grade
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
        </TabsContent>
      </Tabs>
    </div>
  )
}
