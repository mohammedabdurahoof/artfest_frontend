"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar, Clock, MapPin, Users, ArrowLeft, Filter } from "lucide-react"
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
}

const categories = ["All", "Bidaya", "Ula", "Thaniyya", "Thanawiyya", "Aliya"]
const venues = ["All", "Main Hall", "Auditorium", "Conference Room", "Outdoor Stage", "Classroom A", "Classroom B"]

export default function ProgramSchedulePage() {
  const [programs, setPrograms] = useState<Program[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedDate, setSelectedDate] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("All")
  const [selectedVenue, setSelectedVenue] = useState("All")

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

  const filteredPrograms = programs.filter((program) => {
    const matchesDate = !selectedDate || program.date === selectedDate
    const matchesCategory = selectedCategory === "All" || program.category === selectedCategory
    const matchesVenue = selectedVenue === "All" || program.venue === selectedVenue
    return matchesDate && matchesCategory && matchesVenue
  })

  const groupedPrograms = filteredPrograms.reduce(
    (groups, program) => {
      const date = program.date
      if (!groups[date]) {
        groups[date] = []
      }
      groups[date].push(program)
      return groups
    },
    {} as Record<string, Program[]>,
  )

  // Sort programs within each date by start time
  Object.keys(groupedPrograms).forEach((date) => {
    groupedPrograms[date].sort((a, b) => a.startingTime.localeCompare(b.startingTime))
  })

  const getStatusColor = (status: string) => {
    const colors = {
      Active: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
      Completed: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
      Scheduled: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
      Cancelled: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
    }
    return colors[status as keyof typeof colors] || "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300"
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const formatTime = (timeString: string) => {
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    })
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="h-8 w-48 bg-gray-200 rounded animate-pulse" />
            <div className="h-4 w-64 bg-gray-200 rounded animate-pulse mt-2" />
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-20 bg-gray-200 rounded animate-pulse" />
          ))}
        </div>
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-64 bg-gray-200 rounded animate-pulse" />
          ))}
        </div>
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
          <h1 className="text-3xl font-bold tracking-tight">Program Schedule</h1>
          <p className="text-muted-foreground">View and manage program schedules by date and time</p>
        </div>
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
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Date</label>
              <Input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                placeholder="Select date"
              />
            </div>
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
              <label className="text-sm font-medium">Venue</label>
              <Select value={selectedVenue} onValueChange={setSelectedVenue}>
                <SelectTrigger>
                  <SelectValue />
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
            <div className="space-y-2">
              <label className="text-sm font-medium">Actions</label>
              <Button
                variant="outline"
                onClick={() => {
                  setSelectedDate("")
                  setSelectedCategory("All")
                  setSelectedVenue("All")
                }}
                className="w-full"
              >
                Clear Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Schedule Display */}
      {Object.keys(groupedPrograms).length === 0 ? (
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <div className="text-center">
              <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Programs Found</h3>
              <p className="text-muted-foreground">No programs match your current filters.</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedPrograms)
            .sort(([a], [b]) => new Date(a).getTime() - new Date(b).getTime())
            .map(([date, datePrograms]) => (
              <Card key={date}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    {formatDate(date)}
                  </CardTitle>
                  <CardDescription>{datePrograms.length} programs scheduled</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {datePrograms.map((program) => (
                      <div
                        key={program._id}
                        className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h4 className="font-semibold">{program.name}</h4>
                            <Badge variant="outline">{program.programCode}</Badge>
                            <Badge className={getStatusColor(program.status)}>{program.status}</Badge>
                            {program.isGroup && (
                              <Badge variant="secondary" className="text-xs">
                                Group
                              </Badge>
                            )}
                            {program.isStage && (
                              <Badge variant="secondary" className="text-xs">
                                Stage
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-6 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Clock className="h-4 w-4" />
                              {formatTime(program.startingTime)} - {formatTime(program.endingTime)}
                              <span className="ml-1">({program.duration} min)</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <MapPin className="h-4 w-4" />
                              {program.venue}
                            </div>
                            <div className="flex items-center gap-1">
                              <Users className="h-4 w-4" />
                              {program.noOfCandidates}/{program.maxParticipants} participants
                            </div>
                            <Badge variant="outline">{program.category}</Badge>
                          </div>
                          {program.description && (
                            <p className="text-sm text-muted-foreground mt-2">{program.description}</p>
                          )}
                          {program.judge && (
                            <p className="text-sm text-muted-foreground mt-1">Judge: {program.judge}</p>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <Link href={`/admin/programs/${program._id}`}>
                            <Button variant="outline" size="sm">
                              View Details
                            </Button>
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
        </div>
      )}

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Programs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{filteredPrograms.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Active Programs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{filteredPrograms.filter((p) => p.status === "Active").length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Scheduled Programs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{filteredPrograms.filter((p) => p.status === "Scheduled").length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Participants</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{filteredPrograms.reduce((sum, p) => sum + p.noOfCandidates, 0)}</div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
