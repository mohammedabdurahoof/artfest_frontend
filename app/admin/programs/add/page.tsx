"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Save, Users, Trophy } from "lucide-react"
import { toast } from "@/hooks/use-toast"
import axios from "@/lib/axios"
import Link from "next/link"
import { useRouter } from "next/navigation"

interface Student {
  _id: string
  name: string
  chestNo: string
  class: string
  team: {
    _id: string
    name: string
    color: string
  }
  category: string
  isActive: boolean
}

interface Team {
  _id: string
  name: string
  color: string
  captain: string
  members: number
  totalPoints: number
  isActive: boolean
}

const categories = ["Bidaya", "Ula", "Thaniyya", "Thanawiyya", "Aliya"]
const venues = ["Main Hall", "Auditorium", "Conference Room", "Outdoor Stage", "Classroom A", "Classroom B"]

export default function AddProgramPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [students, setStudents] = useState<Student[]>([])
  const [teams, setTeams] = useState<Team[]>([])
  const [availableStudents, setAvailableStudents] = useState<Student[]>([])
  const [selectedParticipants, setSelectedParticipants] = useState<string[]>([])

  const [formData, setFormData] = useState({
    programCode: "",
    name: "",
    description: "",
    duration: 15,
    category: "",
    isStage: true,
    isGroup: false,
    maxParticipants: 1,
    venue: "",
    date: "",
    startingTime: "",
    endingTime: "",
    judge: "",
    participants: [] as string[],
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    fetchStudents()
    fetchTeams()
  }, [])

  useEffect(() => {
    // Filter students by selected category
    if (formData.category) {
      const filtered = students.filter((student) => student.category === formData.category && student.isActive)
      setAvailableStudents(filtered)
      setSelectedParticipants([]) // Reset selected participants when category changes
    } else {
      setAvailableStudents([])
      setSelectedParticipants([])
    }
  }, [formData.category, students])

  const fetchStudents = async () => {
    try {
      const response = await axios.get("/students")
      setStudents(response.data.data || [])
    } catch (error) {
      console.error("Error fetching students:", error)
      toast({
        title: "Error",
        description: "Failed to fetch students",
        variant: "destructive",
      })
    }
  }

  const fetchTeams = async () => {
    try {
      const response = await axios.get("/teams")
      setTeams(response.data.data || [])
    } catch (error) {
      console.error("Error fetching teams:", error)
      toast({
        title: "Error",
        description: "Failed to fetch teams",
        variant: "destructive",
      })
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.programCode.trim()) {
      newErrors.programCode = "Program code is required"
    }
    if (!formData.name.trim()) {
      newErrors.name = "Program name is required"
    }
    if (!formData.category) {
      newErrors.category = "Category is required"
    }
    if (!formData.venue) {
      newErrors.venue = "Venue is required"
    }
    if (!formData.date) {
      newErrors.date = "Date is required"
    }
    if (!formData.startingTime) {
      newErrors.startingTime = "Start time is required"
    }
    if (!formData.endingTime) {
      newErrors.endingTime = "End time is required"
    }
    if (formData.duration <= 0) {
      newErrors.duration = "Duration must be greater than 0"
    }
    if (formData.maxParticipants <= 0) {
      newErrors.maxParticipants = "Max participants must be greater than 0"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      toast({
        title: "Validation Error",
        description: "Please fix the errors in the form",
        variant: "destructive",
      })
      return
    }

    try {
      setLoading(true)
      const programData = {
        ...formData,
        participants: selectedParticipants,
      }
      await axios.post("/programs", programData)
      toast({
        title: "Success",
        description: "Program created successfully",
      })
      router.push("/admin/programs")
    } catch (error: any) {
      console.error("Error creating program:", error)
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to create program",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const generateProgramCode = () => {
    const prefix = formData.category ? formData.category.substring(0, 3).toUpperCase() : "PRG"
    const timestamp = Date.now().toString().slice(-4)
    setFormData({ ...formData, programCode: `${prefix}${timestamp}` })
  }

  const handleParticipantToggle = (studentId: string) => {
    if (selectedParticipants.includes(studentId)) {
      setSelectedParticipants(selectedParticipants.filter((id) => id !== studentId))
    } else {
      if (selectedParticipants.length < formData.maxParticipants) {
        setSelectedParticipants([...selectedParticipants, studentId])
      } else {
        toast({
          title: "Maximum participants reached",
          description: "Cannot add more participants to this program",
          variant: "destructive",
        })
      }
    }
  }

  const getStudentById = (studentId: string) => {
    return students.find((s) => s._id === studentId)
  }

  const categoryStats = teams.reduce(
    (acc, team) => {
      const teamStudents = students.filter((s) => s.team._id === team._id && s.category === formData.category)
      acc[team.name] = teamStudents.length
      return acc
    },
    {} as Record<string, number>,
  )

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
          <h1 className="text-3xl font-bold tracking-tight">Add New Program</h1>
          <p className="text-muted-foreground">Create a new competition program</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Form */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Program Details</CardTitle>
              <CardDescription>Fill in the details for the new program</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="programCode">Program Code *</Label>
                    <div className="flex gap-2">
                      <Input
                        id="programCode"
                        value={formData.programCode}
                        onChange={(e) => setFormData({ ...formData, programCode: e.target.value })}
                        placeholder="e.g., BID001"
                        className={errors.programCode ? "border-red-500" : ""}
                      />
                      <Button type="button" variant="outline" onClick={generateProgramCode}>
                        Generate
                      </Button>
                    </div>
                    {errors.programCode && <p className="text-sm text-red-500">{errors.programCode}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="category">Category *</Label>
                    <Select
                      value={formData.category}
                      onValueChange={(value) => setFormData({ ...formData, category: value })}
                    >
                      <SelectTrigger className={errors.category ? "border-red-500" : ""}>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.category && <p className="text-sm text-red-500">{errors.category}</p>}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="name">Program Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., Classical Dance Competition"
                    className={errors.name ? "border-red-500" : ""}
                  />
                  {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Brief description of the program..."
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="duration">Duration (minutes) *</Label>
                    <Input
                      id="duration"
                      type="number"
                      min="1"
                      value={formData.duration}
                      onChange={(e) => setFormData({ ...formData, duration: Number.parseInt(e.target.value) || 0 })}
                      className={errors.duration ? "border-red-500" : ""}
                    />
                    {errors.duration && <p className="text-sm text-red-500">{errors.duration}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="maxParticipants">Max Participants *</Label>
                    <Input
                      id="maxParticipants"
                      type="number"
                      min="1"
                      value={formData.maxParticipants}
                      onChange={(e) => {
                        const value = Number.parseInt(e.target.value) || 0
                        setFormData({ ...formData, maxParticipants: value })
                        // Reset selected participants if exceeding new limit
                        if (selectedParticipants.length > value) {
                          setSelectedParticipants(selectedParticipants.slice(0, value))
                        }
                      }}
                      className={errors.maxParticipants ? "border-red-500" : ""}
                    />
                    {errors.maxParticipants && <p className="text-sm text-red-500">{errors.maxParticipants}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="venue">Venue *</Label>
                    <Select
                      value={formData.venue}
                      onValueChange={(value) => setFormData({ ...formData, venue: value })}
                    >
                      <SelectTrigger className={errors.venue ? "border-red-500" : ""}>
                        <SelectValue placeholder="Select venue" />
                      </SelectTrigger>
                      <SelectContent>
                        {venues.map((venue) => (
                          <SelectItem key={venue} value={venue}>
                            {venue}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.venue && <p className="text-sm text-red-500">{errors.venue}</p>}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="date">Date *</Label>
                    <Input
                      id="date"
                      type="date"
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                      className={errors.date ? "border-red-500" : ""}
                    />
                    {errors.date && <p className="text-sm text-red-500">{errors.date}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="startingTime">Start Time *</Label>
                    <Input
                      id="startingTime"
                      type="time"
                      value={formData.startingTime}
                      onChange={(e) => setFormData({ ...formData, startingTime: e.target.value })}
                      className={errors.startingTime ? "border-red-500" : ""}
                    />
                    {errors.startingTime && <p className="text-sm text-red-500">{errors.startingTime}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="endingTime">End Time *</Label>
                    <Input
                      id="endingTime"
                      type="time"
                      value={formData.endingTime}
                      onChange={(e) => setFormData({ ...formData, endingTime: e.target.value })}
                      className={errors.endingTime ? "border-red-500" : ""}
                    />
                    {errors.endingTime && <p className="text-sm text-red-500">{errors.endingTime}</p>}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="judge">Judge</Label>
                  <Input
                    id="judge"
                    value={formData.judge}
                    onChange={(e) => setFormData({ ...formData, judge: e.target.value })}
                    placeholder="Judge name (optional)"
                  />
                </div>

                <div className="flex gap-6">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="isStage"
                      checked={formData.isStage}
                      onCheckedChange={(checked) => setFormData({ ...formData, isStage: checked as boolean })}
                    />
                    <Label htmlFor="isStage">Stage Program</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="isGroup"
                      checked={formData.isGroup}
                      onCheckedChange={(checked) => {
                        const newIsGroup = checked as boolean
                        setFormData({
                          ...formData,
                          isGroup: newIsGroup,
                          maxParticipants: newIsGroup ? Math.max(2, formData.maxParticipants) : 1,
                        })
                      }}
                    />
                    <Label htmlFor="isGroup">Group Program</Label>
                  </div>
                </div>

                <div className="flex gap-4 pt-4">
                  <Button type="submit" disabled={loading}>
                    {loading ? (
                      <>
                        <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-b-transparent" />
                        Creating...
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        Create Program
                      </>
                    )}
                  </Button>
                  <Link href="/admin/programs">
                    <Button type="button" variant="outline">
                      Cancel
                    </Button>
                  </Link>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Participants Sidebar */}
        <div className="space-y-6">
          {/* Category Stats */}
          {formData.category && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="h-5 w-5" />
                  Category Stats
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="text-sm text-muted-foreground">
                    Available students in {formData.category}: {availableStudents.length}
                  </div>
                  <div className="space-y-2">
                    {Object.entries(categoryStats).map(([teamName, count]) => {
                      const team = teams.find((t) => t.name === teamName)
                      return (
                        <div key={teamName} className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: team?.color || "#gray" }} />
                            <span className="text-sm">{teamName}</span>
                          </div>
                          <Badge variant="outline">{count}</Badge>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Participants Selection */}
          {formData.category && availableStudents.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Select Participants
                </CardTitle>
                <CardDescription>
                  {selectedParticipants.length} / {formData.maxParticipants} selected
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="max-h-80 overflow-y-auto space-y-2">
                  {availableStudents.map((student) => (
                    <div key={student._id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`participant-${student._id}`}
                        checked={selectedParticipants.includes(student._id)}
                        onCheckedChange={() => handleParticipantToggle(student._id)}
                      />
                      <Label htmlFor={`participant-${student._id}`} className="flex-1 cursor-pointer">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-medium text-sm">{student.name}</div>
                            <div className="text-xs text-muted-foreground">
                              {student.chestNo} | {student.class}
                            </div>
                          </div>
                          <div className="flex items-center gap-1">
                            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: student.team.color }} />
                            <span className="text-xs">{student.team.name}</span>
                          </div>
                        </div>
                      </Label>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Selected Participants Summary */}
          {selectedParticipants.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Selected Participants</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {selectedParticipants.map((participantId) => {
                    const student = getStudentById(participantId)
                    if (!student) return null
                    return (
                      <div key={participantId} className="flex items-center justify-between text-sm">
                        <div>
                          <div className="font-medium">{student.name}</div>
                          <div className="text-muted-foreground">{student.chestNo}</div>
                        </div>
                        <div className="flex items-center gap-1">
                          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: student.team.color }} />
                          <span className="text-xs">{student.team.name}</span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
