"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "@/hooks/use-toast"
import { ArrowLeft, Plus, Trash2 } from "lucide-react"
import axiosInstance from "@/lib/axios"
import type { User, TeamFormData } from "@/types"
import Link from "next/link"

export default function AddTeamPage() {
  const router = useRouter()
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState<TeamFormData>({
    name: "",
    color: "#3B82F6",
    leader: "",
    asstLeaders: [""],
    userId: "defaultUserId", // Updated default value to be a non-empty string
  })

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      const response = await axiosInstance.get("/users")
      setUsers(response.data.data || response.data)
    } catch (error) {
      console.error("Error fetching users:", error)
      toast({
        title: "Error",
        description: "Failed to fetch users",
        variant: "destructive",
      })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Filter out empty assistant leaders
      const cleanedData = {
        ...formData,
        asstLeaders: formData.asstLeaders.filter((leader) => leader.trim() !== ""),
      }

      await axiosInstance.post("/teams", cleanedData)
      toast({
        title: "Success",
        description: "Team created successfully",
      })
      router.push("/admin/teams")
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to create team",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleAssistantLeaderChange = (value: string, index: number) => {
    const newAsstLeaders = [...formData.asstLeaders]
    newAsstLeaders[index] = value
    setFormData({ ...formData, asstLeaders: newAsstLeaders })
  }

  const addAssistantLeader = () => {
    setFormData({ ...formData, asstLeaders: [...formData.asstLeaders, ""] })
  }

  const removeAssistantLeader = (index: number) => {
    if (formData.asstLeaders.length > 1) {
      const newAsstLeaders = formData.asstLeaders.filter((_, i) => i !== index)
      setFormData({ ...formData, asstLeaders: newAsstLeaders })
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" asChild>
          <Link href="/admin/teams">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Teams
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Add New Team</h1>
          <p className="text-muted-foreground">Create a new team for the competition</p>
        </div>
      </div>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Team Information</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Team Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Enter team name"
                  required
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="color">Team Color *</Label>
                <div className="flex items-center gap-4">
                  <Input
                    id="color"
                    type="color"
                    value={formData.color}
                    onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                    className="w-20 h-12"
                  />
                  <Input
                    value={formData.color}
                    onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                    placeholder="#3B82F6"
                    className="flex-1"
                  />
                  <div
                    className="w-12 h-12 rounded-md border-2 border-gray-200"
                    style={{ backgroundColor: formData.color }}
                  />
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="leader">Team Leader *</Label>
                <Input
                  id="leader"
                  value={formData.leader}
                  onChange={(e) => setFormData({ ...formData, leader: e.target.value })}
                  placeholder="Enter team leader name"
                  required
                />
              </div>

              <div className="grid gap-2">
                <Label>Assistant Leaders</Label>
                <div className="space-y-2">
                  {formData.asstLeaders.map((leader, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <Input
                        value={leader}
                        onChange={(e) => handleAssistantLeaderChange(e.target.value, index)}
                        placeholder={`Assistant leader ${index + 1}`}
                        className="flex-1"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeAssistantLeader(index)}
                        disabled={formData.asstLeaders.length === 1}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    onClick={addAssistantLeader}
                    className="w-full bg-transparent"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Add Assistant Leader
                  </Button>
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="userId">Assign User</Label>
                <Select value={formData.userId} onValueChange={(value) => setFormData({ ...formData, userId: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a user to assign to this team" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="defaultUserId">No user assigned</SelectItem>{" "}
                    {/* Updated value to be a non-empty string */}
                    {users.map((user) => (
                      <SelectItem key={user._id} value={user._id}>
                        <div className="flex items-center gap-2">
                          <span>{user.username}</span>
                          <span className="text-xs text-muted-foreground">({user.role.name})</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex justify-end gap-4 pt-4 border-t">
              <Button type="button" variant="outline" onClick={() => router.back()}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? "Creating..." : "Create Team"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
