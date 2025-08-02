"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { ArrowLeft, Save } from "lucide-react"
import { toast } from "@/hooks/use-toast"
import axios from "@/lib/axios"
import Link from "next/link"
import { useRouter } from "next/navigation"

const categories = ["Bidaya", "Ula", "Thaniyya", "Thanawiyya", "Aliya"]
const venues = ["Main Hall", "Auditorium", "Conference Room", "Outdoor Stage", "Classroom A", "Classroom B"]

export default function AddProgramPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
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
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

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
      await axios.post("/programs", formData)
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

      <Card className="max-w-4xl">
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
                  onChange={(e) => setFormData({ ...formData, maxParticipants: Number.parseInt(e.target.value) || 0 })}
                  className={errors.maxParticipants ? "border-red-500" : ""}
                />
                {errors.maxParticipants && <p className="text-sm text-red-500">{errors.maxParticipants}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="venue">Venue *</Label>
                <Select value={formData.venue} onValueChange={(value) => setFormData({ ...formData, venue: value })}>
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
  )
}
