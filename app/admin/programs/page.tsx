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
import { Search, Plus, MoreHorizontal, Edit, Trash2, Eye, Calendar, Clock, MapPin } from "lucide-react"

export default function ProgramsPage() {
  const [searchTerm, setSearchTerm] = useState("")

  const programs = [
    {
      id: 1,
      programCode: "P001",
      name: "Classical Dance",
      duration: "15 min",
      judge: "Dr. Sarah Ahmed",
      noOfCandidates: 12,
      isStage: true,
      isGroup: false,
      category: "Thanawiyya",
      venue: "Main Hall",
      status: "Active",
      date: "2024-01-15",
      startingTime: "10:00 AM",
      endingTime: "11:30 AM",
      resultStatus: "Pending",
    },
    {
      id: 2,
      programCode: "P002",
      name: "Quranic Recitation",
      duration: "10 min",
      judge: "Sheikh Mohammed Ali",
      noOfCandidates: 8,
      isStage: true,
      isGroup: false,
      category: "Aliya",
      venue: "Auditorium",
      status: "Completed",
      date: "2024-01-15",
      startingTime: "09:00 AM",
      endingTime: "10:00 AM",
      resultStatus: "Published",
    },
    {
      id: 3,
      programCode: "P003",
      name: "Group Song",
      duration: "20 min",
      judge: "Prof. Amina Hassan",
      noOfCandidates: 6,
      isStage: true,
      isGroup: true,
      category: "Bidaya",
      venue: "Main Hall",
      status: "Scheduled",
      date: "2024-01-16",
      startingTime: "02:00 PM",
      endingTime: "04:00 PM",
      resultStatus: "Not Started",
    },
  ]

  const filteredPrograms = programs.filter(
    (program) =>
      program.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      program.programCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      program.category.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const getStatusColor = (status: string) => {
    const colors = {
      Active: "bg-green-100 text-green-800",
      Completed: "bg-blue-100 text-blue-800",
      Scheduled: "bg-yellow-100 text-yellow-800",
      Cancelled: "bg-red-100 text-red-800",
    }
    return colors[status as keyof typeof colors] || "bg-gray-100 text-gray-800"
  }

  const getResultStatusColor = (status: string) => {
    const colors = {
      Published: "bg-green-100 text-green-800",
      Pending: "bg-yellow-100 text-yellow-800",
      "Not Started": "bg-gray-100 text-gray-800",
    }
    return colors[status as keyof typeof colors] || "bg-gray-100 text-gray-800"
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Programs</h1>
          <p className="text-muted-foreground">Manage competition programs and schedules</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Calendar className="mr-2 h-4 w-4" />
            Schedule View
          </Button>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Program
          </Button>
        </div>
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
                  <TableRow key={program.id}>
                    <TableCell className="font-medium">{program.programCode}</TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{program.name}</div>
                        <div className="text-sm text-muted-foreground flex items-center gap-2">
                          <Clock className="h-3 w-3" />
                          {program.duration}
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
                    <TableCell>{program.noOfCandidates}</TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div>{program.date}</div>
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
                          <DropdownMenuItem>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit Program
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-red-600">
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
    </div>
  )
}
