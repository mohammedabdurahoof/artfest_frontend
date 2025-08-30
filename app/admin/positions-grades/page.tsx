"use client"

import { useState, useEffect } from "react"
import { Search, MoreHorizontal, Edit, Trash2, Trophy, Award } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import api from "@/lib/axios"
import { Grade, Position } from "@/types"
import { is } from "date-fns/locale"


const gradeColors = [
  { value: "green", label: "Green", class: "bg-green-500" },
  { value: "blue", label: "Blue", class: "bg-blue-500" },
  { value: "yellow", label: "Yellow", class: "bg-yellow-500" },
  { value: "orange", label: "Orange", class: "bg-orange-500" },
  { value: "red", label: "Red", class: "bg-red-500" },
  { value: "purple", label: "Purple", class: "bg-purple-500" },
]

export default function PositionsGradesPage() {
  const [positions, setPositions] = useState<Position[]>([])
  const [grades, setGrades] = useState<Grade[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [isAddPositionDialogOpen, setIsAddPositionDialogOpen] = useState(false)
  const [isEditPositionDialogOpen, setIsEditPositionDialogOpen] = useState(false)
  const [isAddGradeDialogOpen, setIsAddGradeDialogOpen] = useState(false)
  const [isEditGradeDialogOpen, setIsEditGradeDialogOpen] = useState(false)
  const [selectedPosition, setSelectedPosition] = useState<Position | null>(null)
  const [selectedGrade, setSelectedGrade] = useState<Grade | null>(null)
  const [positionFormData, setPositionFormData] = useState({
    isGroup: false,
    isKulliyya: false,
    category: "First",
    points: 0,
    rank: 1,
    isActive: true,
  })
  const [gradeFormData, setGradeFormData] = useState({
    isStarred: false,
    category: "A",
    points: 0,
    from: 0,
    to: 0,
    color: "green",
    isActive: true,
  })
  const { toast } = useToast()

  useEffect(() => {
    fetchPositions()
    fetchGrades()
  }, [])

  const fetchPositions = async () => {
    try {
      const response = await api.get("/positions")
      setPositions(response.data.data)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch positions",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const fetchGrades = async () => {
    try {
      const response = await api.get("/grades")
      setGrades(response.data.data)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch grades",
        variant: "destructive",
      })
    }
  }

  const handleAddPosition = async () => {
    try {
      const response = await api.post("/positions", positionFormData)
      setPositions([...positions, response.data.data])
      setIsAddPositionDialogOpen(false)
      setPositionFormData({ isGroup: false, category: "first", points: 0, rank: 1, isActive: true, isKulliyya: false })
      toast({
        title: "Success",
        description: "Position added successfully",
      })
    } catch (error: any) {
      console.error("Error adding position:", error.response?.data.message || error)
      toast({
        title: "Error",
        description: error.response?.data.message || "Failed to add position",
        variant: "destructive",
      })
    }
  }

  const handleEditPosition = async () => {
    if (!selectedPosition) return

    try {
      const response = await api.patch(`/positions/${selectedPosition._id}`, positionFormData)
      setPositions(positions.map((position) => (position._id === selectedPosition._id ? response.data.data : position)))
      setIsEditPositionDialogOpen(false)
      setSelectedPosition(null)
      setPositionFormData({ isGroup: false, category: "first", points: 0, rank: 1, isActive: true, isKulliyya: false })
      toast({
        title: "Success",
        description: "Position updated successfully",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update position",
        variant: "destructive",
      })
    }
  }

  const handleDeletePosition = async (positionId: string) => {
    try {
      await api.delete(`/positions/${positionId}`)
      setPositions(positions.filter((position) => position._id !== positionId))
      toast({
        title: "Success",
        description: "Position deleted successfully",
      })
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete position",
        variant: "destructive",
      })
    }
  }

  const handleAddGrade = async () => {
    try {
      const response = await api.post("/grades", gradeFormData)
      setGrades([...grades, response.data.data])
      setIsAddGradeDialogOpen(false)
      setGradeFormData({ isStarred: false, category: "A", points: 0, from: 0, to: 0, color: "green", isActive: true })
      toast({
        title: "Success",
        description: "Grade added successfully",
      })
    } catch (error: any) {
      console.error("Error adding grade:", error.response?.data.message || error)
      toast({
        title: "Error",
        description: error.response?.data.message || "Failed to add grade",
        variant: "destructive",
      })
    }
  }

  const handleEditGrade = async () => {
    if (!selectedGrade) return

    try {
      const response = await api.patch(`/grades/${selectedGrade._id}`, gradeFormData)
      setGrades(grades.map((grade) => (grade._id === selectedGrade._id ? response.data.data : grade)))
      setIsEditGradeDialogOpen(false)
      setSelectedGrade(null)
      setGradeFormData({ isStarred: false, category: "A", points: 0, from: 0, to: 0, color: "green", isActive: true })
      toast({
        title: "Success",
        description: "Grade updated successfully",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update grade",
        variant: "destructive",
      })
    }
  }

  const handleDeleteGrade = async (gradeId: string) => {
    try {
      await api.delete(`/grades/${gradeId}`)
      setGrades(grades.filter((grade) => grade._id !== gradeId))
      toast({
        title: "Success",
        description: "Grade deleted successfully",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete grade",
        variant: "destructive",
      })
    }
  }

  const openEditPositionDialog = (position: Position) => {
    setSelectedPosition(position)
    setPositionFormData({
      isGroup: position.isGroup,
      category: position.category,
      points: position.points,
      rank: position.rank,
      isActive: position.isActive,
      isKulliyya: position.isKulliyya,
    })
    setIsEditPositionDialogOpen(true)
  }

  const openEditGradeDialog = (grade: Grade) => {
    setSelectedGrade(grade)
    setGradeFormData({
      isStarred: grade.isStarred,
      category: grade.category,
      points: grade.points,
      from: grade.from,
      to: grade.to,
      color: grade.color,
      isActive: grade.isActive,
    })
    setIsEditGradeDialogOpen(true)
  }

  const filteredPositions = positions.filter(
    (position) =>
      position.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      position.points.toString().includes(searchTerm.toLowerCase()),
  )

  const filteredGrades = grades.filter(
    (grade) =>
      grade.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      grade.points.toString().includes(searchTerm.toLowerCase()),
  )

  const getColorClass = (color: string) => {
    const colorObj = gradeColors.find((c) => c.value === color)
    return colorObj?.class || "bg-gray-500"
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Positions & Grades</h1>
            <p className="text-muted-foreground">Manage competition positions and grading system</p>
          </div>
        </div>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Positions & Grades</h1>
          <p className="text-muted-foreground">Manage competition positions and grading system</p>
        </div>
      </div>

      <Tabs defaultValue="positions" className="space-y-4">
        <TabsList>
          <TabsTrigger value="positions">Positions</TabsTrigger>
          <TabsTrigger value="grades">Grades</TabsTrigger>
        </TabsList>

        <TabsContent value="positions" className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search positions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-sm"
              />
            </div>
            <Dialog open={isAddPositionDialogOpen} onOpenChange={setIsAddPositionDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Trophy className="mr-2 h-4 w-4" />
                  Add Position
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Position</DialogTitle>
                  <DialogDescription>Create a new competition position</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="position-category">Position Category</Label>
                    <Select
                      value={positionFormData.category}
                      onValueChange={(value) => setPositionFormData({ ...positionFormData, category: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="First">First</SelectItem>
                        <SelectItem value="Second">Second</SelectItem>
                        <SelectItem value="Third">Third</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="position-points">Points</Label>
                      <Input
                        id="position-points"
                        type="number"
                        value={positionFormData.points}
                        onChange={(e) =>
                          setPositionFormData({ ...positionFormData, points: Number.parseInt(e.target.value) || 0 })
                        }
                        placeholder="Points awarded"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="position-rank">Rank</Label>
                      <Select
                        value={positionFormData.rank.toString()}
                        onValueChange={(value) =>
                          setPositionFormData({ ...positionFormData, rank: Number.parseInt(value) })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select rank" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">1</SelectItem>
                          <SelectItem value="2">2</SelectItem>
                          <SelectItem value="3">3</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="position-isgroup">Is Group</Label>
                      <Select
                        value={positionFormData.isGroup ? "true" : "false"}
                        onValueChange={(value) =>
                          setPositionFormData({ ...positionFormData, isGroup: value === "true" })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="true">Group</SelectItem>
                          <SelectItem value="false">Individual</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="position-isKulliyya">Is Kulliyya</Label>
                      <Select
                        value={positionFormData.isKulliyya ? "true" : "false"}
                        onValueChange={(value) =>
                          setPositionFormData({ ...positionFormData, isKulliyya: value === "true" })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="true">Kulliyya</SelectItem>
                          <SelectItem value="false">Non-Kulliyya</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="position-isactive">Is Active</Label>
                      <Select
                        value={positionFormData.isActive ? "true" : "false"}
                        onValueChange={(value) =>
                          setPositionFormData({ ...positionFormData, isActive: value === "true" })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="true">Active</SelectItem>
                          <SelectItem value="false">Inactive</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsAddPositionDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleAddPosition}>Add Position</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Competition Positions</CardTitle>
              <CardDescription>Manage positions and their point values</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Position</TableHead>
                    <TableHead>Rank</TableHead>
                    <TableHead>Points</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPositions.map((position) => (
                    <TableRow key={position._id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{position.category}</div>
                          <div className="text-sm text-muted-foreground">{position.isGroup ? "Group" : "Individual"}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">#{position.rank}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">{position.points} pts</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={position.isActive ? "default" : "secondary"}>
                          {position.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell>{new Date(position.createdAt).toLocaleDateString()}</TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => openEditPositionDialog(position)}>
                              <Edit className="mr-2 h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleDeletePosition(position._id)}
                              className="text-destructive"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="grades" className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search grades..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-sm"
              />
            </div>
            <Dialog open={isAddGradeDialogOpen} onOpenChange={setIsAddGradeDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Award className="mr-2 h-4 w-4" />
                  Add Grade
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Grade</DialogTitle>
                  <DialogDescription>Create a new grading level</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="grade-category">Grade Category</Label>
                    <Select
                      value={gradeFormData.category}
                      onValueChange={(value) => setGradeFormData({ ...gradeFormData, category: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select grade category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="A">A</SelectItem>
                        <SelectItem value="B">B</SelectItem>
                        <SelectItem value="C">C</SelectItem>
                      </SelectContent>
                    </Select>

                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="points"> Points</Label>
                      <Input
                        id="points"
                        type="number"
                        value={gradeFormData.points}
                        onChange={(e) =>
                          setGradeFormData({ ...gradeFormData, points: Number.parseInt(e.target.value) || 0 })
                        }
                        placeholder="Enter points"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="is-starred">Is Starred</Label>
                      <Select
                        value={gradeFormData.isStarred ? "true" : "false"}
                        onValueChange={(value) =>
                          setGradeFormData({ ...gradeFormData, isStarred: value === "true" })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="true">Yes</SelectItem>
                          <SelectItem value="false">No</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="from">From</Label>
                      <Input
                        id="from"
                        type="number"
                        value={gradeFormData.from}
                        onChange={(e) =>
                          setGradeFormData({ ...gradeFormData, from: Number.parseInt(e.target.value) || 0 })
                        }
                        placeholder="Enter From Percentage"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="to">To</Label>
                      <Input
                        id="to"
                        type="number"
                        value={gradeFormData.to}
                        onChange={(e) =>
                          setGradeFormData({ ...gradeFormData, to: Number.parseInt(e.target.value) || 0 })
                        }
                        placeholder="Enter To Percentage"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="grade-color">Color</Label>
                      <Select
                        value={gradeFormData.color}
                        onValueChange={(value) => setGradeFormData({ ...gradeFormData, color: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select color" />
                        </SelectTrigger>
                        <SelectContent>
                          {gradeColors.map((color) => (
                            <SelectItem key={color.value} value={color.value}>
                              <div className="flex items-center gap-2">
                                <div className={`w-4 h-4 rounded-full ${color.class}`} />
                                {color.label}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="is-active">Is Active</Label>
                      <Select
                        value={gradeFormData.isActive ? "true" : "false"}
                        onValueChange={(value) =>
                          setGradeFormData({ ...gradeFormData, isActive: value === "true" })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="true">Yes</SelectItem>
                          <SelectItem value="false">No</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsAddGradeDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleAddGrade}>Add Grade</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Grading System</CardTitle>
              <CardDescription>Manage grade levels and score ranges</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Grade</TableHead>
                    <TableHead>Score Range</TableHead>
                    <TableHead>From</TableHead>
                    <TableHead>To</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredGrades.map((grade) => (
                    <TableRow key={grade._id}>
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <div className={`w-4 h-4 rounded-full ${getColorClass(grade.color)}`} />
                          <div>
                            <div className="font-medium">{grade.category}</div>
                            <div className="text-sm text-muted-foreground">{grade.isStarred ? "Starred" : "Not Starred"}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {grade.points}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {grade.from}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {grade.to}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={grade.isActive ? "default" : "secondary"}>
                          {grade.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell>{new Date(grade.createdAt).toLocaleDateString()}</TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => openEditGradeDialog(grade)}>
                              <Edit className="mr-2 h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleDeleteGrade(grade._id)} className="text-destructive">
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Edit Position Dialog */}
      <Dialog open={isEditPositionDialogOpen} onOpenChange={setIsEditPositionDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Position</DialogTitle>
            <DialogDescription>Update position information</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="position-category">Position Category</Label>
              <Select
                value={positionFormData.category}
                onValueChange={(value) => setPositionFormData({ ...positionFormData, category: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="First">First</SelectItem>
                  <SelectItem value="Second">Second</SelectItem>
                  <SelectItem value="Third">Third</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="position-points">Points</Label>
                <Input
                  id="position-points"
                  type="number"
                  value={positionFormData.points}
                  onChange={(e) =>
                    setPositionFormData({ ...positionFormData, points: Number.parseInt(e.target.value) || 0 })
                  }
                  placeholder="Points awarded"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="position-rank">Rank</Label>
                <Select
                  value={positionFormData.rank.toString()}
                  onValueChange={(value) =>
                    setPositionFormData({ ...positionFormData, rank: Number.parseInt(value) })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select rank" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1</SelectItem>
                    <SelectItem value="2">2</SelectItem>
                    <SelectItem value="3">3</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="position-isgroup">Is Group</Label>
                <Select
                  value={positionFormData.isGroup ? "true" : "false"}
                  onValueChange={(value) =>
                    setPositionFormData({ ...positionFormData, isGroup: value === "true" })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="true">Group</SelectItem>
                    <SelectItem value="false">Individual</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="position-isKulliyya">Is Kulliyya</Label>
                <Select
                  value={positionFormData.isKulliyya ? "true" : "false"}
                  onValueChange={(value) =>
                    setPositionFormData({ ...positionFormData, isKulliyya: value === "true" })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="true">Kulliyya</SelectItem>
                    <SelectItem value="false">Non-Kulliyya</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="position-isactive">Is Active</Label>
                <Select
                  value={positionFormData.isActive ? "true" : "false"}
                  onValueChange={(value) =>
                    setPositionFormData({ ...positionFormData, isActive: value === "true" })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="true">Active</SelectItem>
                    <SelectItem value="false">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditPositionDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditPosition}>Update Position</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Grade Dialog */}
      <Dialog open={isEditGradeDialogOpen} onOpenChange={setIsEditGradeDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Grade</DialogTitle>
            <DialogDescription>Update grade information</DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="grade-category">Grade Category</Label>
              <Select
                value={gradeFormData.category}
                onValueChange={(value) => setGradeFormData({ ...gradeFormData, category: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select grade category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="A">A</SelectItem>
                  <SelectItem value="B">B</SelectItem>
                  <SelectItem value="C">C</SelectItem>
                </SelectContent>
              </Select>

            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="points"> Points</Label>
                <Input
                  id="points"
                  type="number"
                  value={gradeFormData.points}
                  onChange={(e) =>
                    setGradeFormData({ ...gradeFormData, points: Number.parseInt(e.target.value) || 0 })
                  }
                  placeholder="Enter points"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="is-starred">Is Starred</Label>
                <Select
                  value={gradeFormData.isStarred ? "true" : "false"}
                  onValueChange={(value) =>
                    setGradeFormData({ ...gradeFormData, isStarred: value === "true" })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="true">Yes</SelectItem>
                    <SelectItem value="false">No</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="from">From</Label>
                <Input
                  id="from"
                  type="number"
                  value={gradeFormData.from}
                  onChange={(e) =>
                    setGradeFormData({ ...gradeFormData, from: Number.parseInt(e.target.value) || 0 })
                  }
                  placeholder="Enter From Percentage"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="to">To</Label>
                <Input
                  id="to"
                  type="number"
                  value={gradeFormData.to}
                  onChange={(e) =>
                    setGradeFormData({ ...gradeFormData, to: Number.parseInt(e.target.value) || 0 })
                  }
                  placeholder="Enter To Percentage"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="grade-color">Color</Label>
                <Select
                  value={gradeFormData.color}
                  onValueChange={(value) => setGradeFormData({ ...gradeFormData, color: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select color" />
                  </SelectTrigger>
                  <SelectContent>
                    {gradeColors.map((color) => (
                      <SelectItem key={color.value} value={color.value}>
                        <div className="flex items-center gap-2">
                          <div className={`w-4 h-4 rounded-full ${color.class}`} />
                          {color.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="is-active">Is Active</Label>
                <Select
                  value={gradeFormData.isActive ? "true" : "false"}
                  onValueChange={(value) =>
                    setGradeFormData({ ...gradeFormData, isActive: value === "true" })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="true">Yes</SelectItem>
                    <SelectItem value="false">No</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          {/* <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-grade-name">Grade Name</Label>
              <Input
                id="edit-grade-name"
                value={gradeFormData.name}
                onChange={(e) => setGradeFormData({ ...gradeFormData, name: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-grade-description">Description</Label>
              <Textarea
                id="edit-grade-description"
                value={gradeFormData.description}
                onChange={(e) => setGradeFormData({ ...gradeFormData, description: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-grade-min">Min Score</Label>
                <Input
                  id="edit-grade-min"
                  type="number"
                  value={gradeFormData.minScore}
                  onChange={(e) =>
                    setGradeFormData({ ...gradeFormData, minScore: Number.parseInt(e.target.value) || 0 })
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-grade-max">Max Score</Label>
                <Input
                  id="edit-grade-max"
                  type="number"
                  value={gradeFormData.maxScore}
                  onChange={(e) =>
                    setGradeFormData({ ...gradeFormData, maxScore: Number.parseInt(e.target.value) || 100 })
                  }
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-grade-color">Color</Label>
              <Select
                value={gradeFormData.color}
                onValueChange={(value) => setGradeFormData({ ...gradeFormData, color: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {gradeColors.map((color) => (
                    <SelectItem key={color.value} value={color.value}>
                      <div className="flex items-center gap-2">
                        <div className={`w-4 h-4 rounded-full ${color.class}`} />
                        {color.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div> */}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditGradeDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditGrade}>Update Grade</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
