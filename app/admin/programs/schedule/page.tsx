"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar, Clock, MapPin, Users, ArrowLeft, Filter } from "lucide-react"
import Link from "next/link"
import axios from "@/lib/axios"
import { toast } from "@/hooks/use-toast"

interface Program {
  _id: string
  programCode: string
  name: string
  category: string
  venue: string
  date: string
  startingTime: string
  endingTime: string
  duration: number
  isStage: boolean
  isGroup: boolean
  maxParticipants: number
  noOfCandidates: number
  status: "Active" | "Completed" | "Scheduled" | "Cancelled"
  judge?: string
}

const categories = ["All", "Bidaya", "Ula", "Thaniyya", "Thanawiyya", "Aliya"]
const venues = ["All", "Main Hall", "Auditorium", "Conference Room", "Outdoor Stage", "Classroom A", "Classroom B"]

export default function SchedulePage() {
  const [programs, setPrograms] = useState<Program[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState("All")
  const [selectedVenue, setSelectedVenue] = useState("All")
  const [selectedDate, setSelectedDate] = useState("")

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
    const categoryMatch = selectedCategory === "All" || program.category === selectedCategory
    const venueMatch = selectedVenue === "All" || program.venue === selectedVenue
    const dateMatch = !selectedDate || program.date === selectedDate
    return categoryMatch && venueMatch && dateMatch
  })

  const groupedByDate = filteredPrograms.reduce(
    (acc, program) => {
      const date = program.date
      if (!acc[date]) {
        acc[date] = []
      }
      acc[date].push(program)
      return acc
    },
    {} as Record<string, Program[]>,
  )

  // Sort programs within each date by start time
  Object.keys(groupedByDate).forEach((date) => {
    groupedByDate[date].sort((a, b) => a.startingTime.localeCompare(b.startingTime))
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
          <p className="text-muted-foreground">View and manage program schedules</p>
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
              <label className="text-sm font-medium">Date</label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>
            <div className="flex items-end">
              <Button
                variant="outline"
                onClick={() => {
                  setSelectedCategory("All")
                  setSelectedVenue("All")
                  setSelectedDate("")
                }}
              >
                Clear Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Schedule */}
      <div className="space-y-6">
        {Object.keys(groupedByDate).length === 0 ? (
          <Card>
            <CardContent className="flex items-center justify-center py-12">
              <div className="text-center">
                <Calendar className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No programs scheduled</h3>
                <p className="text-muted-foreground">
                  {selectedCategory !== "All" || selectedVenue !== "All" || selectedDate
                    ? "No programs match your current filters."
                    : "There are no programs scheduled yet."}
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          Object.keys(groupedByDate)
            .sort()
            .map((date) => (
              <Card key={date}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    {formatDate(date)}
                  </CardTitle>
                  <CardDescription>
                    {groupedByDate[date].length} program{groupedByDate[date].length !== 1 ? "s" : ""} scheduled
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {groupedByDate[date].map((program) => (
                      <div
                        key={program._id}
                        className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-semibold">{program.name}</h3>
                            <Badge variant="outline">{program.programCode}</Badge>
                            <Badge variant="outline">{program.category}</Badge>
                            <Badge className={getStatusColor(program.status)}>{program.status}</Badge>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
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
                              {program.noOfCandidates}/{program.maxParticipants}
                            </div>
                            {program.judge && <div className="text-sm">Judge: {program.judge}</div>}
                          </div>
                          <div className="flex gap-2 mt-2">
                            {program.isStage && (
                              <Badge variant="outline" className="text-xs">
                                Stage
                              </Badge>
                            )}
                            {program.isGroup && (
                              <Badge variant="outline" className="text-xs">
                                Group
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))
        )}
      </div>
    </div>
  )
}
