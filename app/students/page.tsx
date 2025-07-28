"use client"

import { useState } from "react"
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
import { Search, Plus, MoreHorizontal, Edit, Trash2, Eye, Filter } from "lucide-react"

export default function StudentsPage() {
  const [searchTerm, setSearchTerm] = useState("")

  const students = [
    {
      id: 1,
      name: "Ahmed Ali",
      chestNo: "A001",
      class: "10th Grade",
      category: "Thanawiyya",
      team: "Red Team",
      totalPoint: 85,
    },
    {
      id: 2,
      name: "Fatima Hassan",
      chestNo: "B002",
      class: "12th Grade",
      category: "Aliya",
      team: "Blue Team",
      totalPoint: 92,
    },
    {
      id: 3,
      name: "Omar Ibrahim",
      chestNo: "C003",
      class: "8th Grade",
      category: "Ula",
      team: "Green Team",
      totalPoint: 78,
    },
    {
      id: 4,
      name: "Aisha Mohammed",
      chestNo: "D004",
      class: "6th Grade",
      category: "Bidaya",
      team: "Yellow Team",
      totalPoint: 88,
    },
    {
      id: 5,
      name: "Yusuf Ahmad",
      chestNo: "E005",
      class: "11th Grade",
      category: "Thanawiyya",
      team: "Red Team",
      totalPoint: 76,
    },
  ]

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

  const getTeamColor = (team: string) => {
    const colors = {
      "Red Team": "bg-red-100 text-red-800",
      "Blue Team": "bg-blue-100 text-blue-800",
      "Green Team": "bg-green-100 text-green-800",
      "Yellow Team": "bg-yellow-100 text-yellow-800",
    }
    return colors[team as keyof typeof colors] || "bg-gray-100 text-gray-800"
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Students</h1>
          <p className="text-muted-foreground">Manage student registrations and information</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Filter className="mr-2 h-4 w-4" />
            Filter
          </Button>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Student
          </Button>
        </div>
      </div>

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
                  <TableRow key={student.id}>
                    <TableCell className="font-medium">{student.chestNo}</TableCell>
                    <TableCell>{student.name}</TableCell>
                    <TableCell>{student.class}</TableCell>
                    <TableCell>
                      <Badge className={getCategoryColor(student.category)}>{student.category}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={getTeamColor(student.team)}>{student.team}</Badge>
                    </TableCell>
                    <TableCell>
                      <span className="font-medium">{student.totalPoint}</span>
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
                          <DropdownMenuItem>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit Student
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-red-600">
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete Student
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
    </div>
  )
}
