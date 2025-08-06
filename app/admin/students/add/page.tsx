"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "@/hooks/use-toast"
import { ArrowLeft, Save, Loader2 } from "lucide-react"
import Link from "next/link"
import axiosInstance from "@/lib/axios"
import type { Team, Category, StudentFormData } from "@/types"

const categories: Category[] = ["Bidaya", "Ula", "Thaniyya", "Thanawiyya", "Aliya"]

export default function AddStudentPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [teams, setTeams] = useState<Team[]>([])
  const [formData, setFormData] = useState<StudentFormData>({
    name: "",
    chestNo: "",
    class: "",
    category: "Bidaya",
    team: "",
  })

  useEffect(() => {
    fetchTeams()
  }, [])

  const fetchTeams = async () => {
    try {
      const response = await axiosInstance.get("/teams")
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

  const handleInputChange = (field: keyof StudentFormData, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.name || !formData.chestNo || !formData.class || !formData.category) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    try {
      await axiosInstance.post("/students", formData)
      toast({
        title: "Success",
        description: "Student added successfully",
      })
      router.push("/admin/students")
    } catch (error: any) {
      console.error("Error adding student:", error)
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to add student",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/students">
          <Button variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Students
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Add Student</h1>
          <p className="text-muted-foreground">Create a new student record</p>
        </div>
      </div>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Student Information</CardTitle>
          <CardDescription>Enter the details for the new student</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  placeholder="Enter student's full name"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="chestNo">Chest Number *</Label>
                <Input
                  id="chestNo"
                  value={formData.chestNo}
                  onChange={(e) => handleInputChange("chestNo", e.target.value)}
                  placeholder="e.g., A001"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="class">Class *</Label>
                <Input
                  id="class"
                  value={formData.class}
                  onChange={(e) => handleInputChange("class", e.target.value)}
                  placeholder="e.g., 10th Grade"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Category *</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value: Category) => handleInputChange("category", value)}
                >
                  <SelectTrigger>
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
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="team">Team</Label>
                <Select value={formData.team} onValueChange={(value) => handleInputChange("team", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select team" />
                  </SelectTrigger>
                  <SelectContent>
                    {teams.map((team) => (
                      <SelectItem key={team._id} value={team._id}>
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: team.color }} />
                          {team.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex gap-4 pt-4">
              <Button type="submit" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Adding Student...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Add Student
                  </>
                )}
              </Button>
              <Link href="/admin/students">
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
