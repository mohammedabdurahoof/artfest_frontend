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
import { categories, venues } from "@/lib/const"
import type { Program } from "@/types"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"


export default function ProgramSchedulePage() {
  const [programs, setPrograms] = useState<Program[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedDate, setSelectedDate] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("All")
  const [selectedVenue, setSelectedVenue] = useState("All")

  // Add these state variables to your component (update existing ones)
  const [isScheduleDialogOpen, setIsScheduleDialogOpen] = useState(false)
  const [selectedProgram, setSelectedProgram] = useState<Program | null>(null)
  const [scheduleFormData, setScheduleFormData] = useState({
    date: "",
    startingTime: "",
    endingTime: "",
    venue: "",
    status: "Scheduled" as const
  })
  const [isRescheduling, setIsRescheduling] = useState(false) // Add this new state
  // Add this state for confirmation
  const [showRescheduleConfirm, setShowRescheduleConfirm] = useState(false)

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

  // Group programs by date, but handle "Draft" status specially
  const groupedPrograms = filteredPrograms.reduce(
    (groups, program) => {
      if (program.status === "Draft") {
        // Put all drafts under a special "Unscheduled" group
        if (!groups["Unscheduled"]) {
          groups["Unscheduled"] = []
        }
        groups["Unscheduled"].push(program)
      } else {
        const date = program.date
        if (!groups[date]) {
          groups[date] = []
        }
        groups[date].push(program)
      }
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

  // Update the openScheduleDialog function to handle both schedule and reschedule
  const openScheduleDialog = (program: Program, isReschedule = false) => {
    setSelectedProgram(program)
    setIsRescheduling(isReschedule)
    setScheduleFormData({
      date: program.date ? program.date.slice(0, 10) : "",
      startingTime: program.startingTime || "",
      endingTime: program.endingTime || "",
      venue: program.venue || "",
      status: "Scheduled"
    })
    setIsScheduleDialogOpen(true)
  }

  // Add new reschedule handler
  const openRescheduleDialog = (program: Program) => {
    openScheduleDialog(program, true)
  }

  // Update the handleScheduleProgram function to handle both cases
  const handleScheduleProgram = async () => {
    if (!selectedProgram) return

    // Show confirmation for rescheduling
    if (isRescheduling && !showRescheduleConfirm) {
      setShowRescheduleConfirm(true)
      return
    }

    try {
      const response = await axios.patch(`/programs/${selectedProgram._id}`, {
        ...scheduleFormData,
        status: "Scheduled"
      })

      // Update the programs list
      setPrograms(programs.map(program =>
        program._id === selectedProgram._id
          ? { ...program, ...response.data.data }
          : program
      ))

      setIsScheduleDialogOpen(false)
      setSelectedProgram(null)
      setIsRescheduling(false)
      setShowRescheduleConfirm(false)
      setScheduleFormData({
        date: "",
        startingTime: "",
        endingTime: "",
        venue: "",
        status: "Scheduled"
      })

      toast({
        title: "Success",
        description: isRescheduling ? "Program rescheduled successfully" : "Program scheduled successfully",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: isRescheduling ? "Failed to reschedule program" : "Failed to schedule program",
        variant: "destructive",
      })
    }
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
                    {date === "Unscheduled" ? "Unscheduled (Drafts)" : formatDate(date)}
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
                              {program.startingTime && formatTime(program.startingTime)} - {program.endingTime && formatTime(program.endingTime)}
                              <span className="ml-1">({program.duration} min)</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <MapPin className="h-4 w-4" />
                              {program.venue}
                            </div>
                            <div className="flex items-center gap-1">
                              <Users className="h-4 w-4" />
                              {program.candidatesPerParticipation}*{program.noOfParticipation} participants
                            </div>
                            <Badge variant="outline">{program.category}</Badge>
                          </div>
                          {/* {program.description && (
                            <p className="text-sm text-muted-foreground mt-2">{program.description}</p>
                          )} */}
                          {/* {program.judge && (
                            <p className="text-sm text-muted-foreground mt-1">Judge: {program.judge}</p>
                          )} */}
                        </div>
                        {program.status === "Draft" && (
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openScheduleDialog(program)}
                            >
                              Schedule Program
                            </Button>
                          </div>
                        )}
                        {program.status === "Scheduled" && (
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openRescheduleDialog(program)}
                            >
                              Reschedule Program
                            </Button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
        </div>
      )}

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
            <CardTitle className="text-sm font-medium">UnScheduled Programs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{filteredPrograms.filter((p) => p.status === "Draft").length}</div>
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
        {/* <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Participants</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{filteredPrograms.reduce((sum, p) => sum + p.noOfCandidates, 0)}</div>
          </CardContent>
        </Card> */}
      </div>

      {/* Schedule Program Dialog */}
      <Dialog open={isScheduleDialogOpen} onOpenChange={setIsScheduleDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {isRescheduling ? "Reschedule Program" : "Schedule Program"}
            </DialogTitle>
            <DialogDescription>
              {isRescheduling 
                ? `Update the schedule for "${selectedProgram?.name}"`
                : `Set the date, time, and venue for "${selectedProgram?.name}"`
              }
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="schedule-date">Date</Label>
              <Input
                id="schedule-date"
                type="date"
                value={scheduleFormData.date}
                onChange={(e) => setScheduleFormData({
                  ...scheduleFormData,
                  date: e.target.value
                })}
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="schedule-start-time">Start Time</Label>
                <Input
                  id="schedule-start-time"
                  type="time"
                  value={scheduleFormData.startingTime}
                  onChange={(e) => setScheduleFormData({
                    ...scheduleFormData,
                    startingTime: e.target.value
                  })}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="schedule-end-time">End Time</Label>
                <Input
                  id="schedule-end-time"
                  type="time"
                  value={scheduleFormData.endingTime}
                  onChange={(e) => setScheduleFormData({
                    ...scheduleFormData,
                    endingTime: e.target.value
                  })}
                  required
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="schedule-venue">Venue</Label>
              <Select
                value={scheduleFormData.venue}
                onValueChange={(value) => setScheduleFormData({
                  ...scheduleFormData,
                  venue: value
                })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select venue" />
                </SelectTrigger>
                <SelectContent>
                  {venues.filter(venue => venue !== "All").map((venue) => (
                    <SelectItem key={venue} value={venue}>
                      {venue}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            {/* Show current schedule info when rescheduling */}
            {isRescheduling && (
              <div className="grid gap-2">
                <Label>Current Schedule</Label>
                <div className="text-sm text-muted-foreground space-y-1 p-3 bg-muted rounded-md">
                  <p><strong>Date:</strong> {selectedProgram?.date ? formatDate(selectedProgram.date) : "Not set"}</p>
                  <p><strong>Time:</strong> {selectedProgram?.startingTime && selectedProgram?.endingTime 
                    ? `${formatTime(selectedProgram.startingTime)} - ${formatTime(selectedProgram.endingTime)}`
                    : "Not set"
                  }</p>
                  <p><strong>Venue:</strong> {selectedProgram?.venue || "Not set"}</p>
                </div>
              </div>
            )}
            
            <div className="grid gap-2">
              <Label>Program Details</Label>
              <div className="text-sm text-muted-foreground space-y-1">
                <p><strong>Code:</strong> {selectedProgram?.programCode}</p>
                <p><strong>Duration:</strong> {selectedProgram?.duration} minutes</p>
                <p><strong>Category:</strong> {selectedProgram?.category}</p>
                <p><strong>Participants:</strong> {selectedProgram?.candidatesPerParticipation} × {selectedProgram?.noOfParticipation}</p>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsScheduleDialogOpen(false)
                setSelectedProgram(null)
                setIsRescheduling(false)
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleScheduleProgram}
              disabled={!scheduleFormData.date || !scheduleFormData.startingTime || !scheduleFormData.endingTime || !scheduleFormData.venue}
              variant={showRescheduleConfirm ? "destructive" : "default"}
            >
              {showRescheduleConfirm 
                ? "Confirm Reschedule" 
                : isRescheduling 
                  ? "Reschedule Program" 
                  : "Schedule Program"
              }
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
