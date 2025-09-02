"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "@/hooks/use-toast"
import { Plus, Search, Edit, Trash2, Users, Trophy, Target } from "lucide-react"
import axiosInstance from "@/lib/axios"
import type { Team, User, TeamFormData } from "@/types"
import { useAuth } from "@/components/auth-provider"

export default function TeamsPage() {
  const [teams, setTeams] = useState<Team[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editingTeam, setEditingTeam] = useState<Team | null>(null)
  const [formData, setFormData] = useState<TeamFormData>({
    name: "",
    color: "#3B82F6",
    leader: "",
    asstLeaders: [],
    userId: "",
  })

  const { hasPermission } = useAuth()

  useEffect(() => {
    fetchTeams()
    fetchUsers()
  }, [])

  const fetchTeams = async () => {
    try {
      const response = await axiosInstance.get("/teams")
      setTeams(response.data.data || response.data)
    } catch (error) {
      console.error("Error fetching teams:", error)
      toast({
        title: "Error",
        description: "Failed to fetch teams",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const fetchUsers = async () => {
    try {
      const response = await axiosInstance.get("/users")
      setUsers(response.data.data || response.data)
    } catch (error) {
      console.error("Error fetching users:", error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (editingTeam) {
        await axiosInstance.patch(`/teams/${editingTeam._id}`, formData)
        toast({
          title: "Success",
          description: "Team updated successfully",
        })
        setIsEditDialogOpen(false)
      } else {
        await axiosInstance.post("/teams", formData)
        toast({
          title: "Success",
          description: "Team created successfully",
        })
        setIsAddDialogOpen(false)
      }
      fetchTeams()
      resetForm()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to save team",
        variant: "destructive",
      })
    }
  }

  const handleEdit = (team: Team) => {
    setEditingTeam(team)
    setFormData({
      name: team.name,
      color: team.color,
      leader: team.leader?._id || "",
      asstLeaders: team.asstLeaders.map((leader) => leader._id),
      userId: team.userId?._id || "",
    })
    setIsEditDialogOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this team?")) return

    try {
      await axiosInstance.delete(`/teams/${id}`)
      toast({
        title: "Success",
        description: "Team deleted successfully",
      })
      fetchTeams()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to delete team",
        variant: "destructive",
      })
    }
  }

  const resetForm = () => {
    setFormData({
      name: "",
      color: "#3B82F6",
      leader: "",
      asstLeaders: [],
      userId: "",
    })
    setEditingTeam(null)
  }

  const filteredTeams = teams.filter(
    (team) =>
      team.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      team.leader?.name.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleAssistantLeaderChange = (value: string, index: number) => {
    const newAsstLeaders = [...formData.asstLeaders]
    newAsstLeaders[index] = value
    setFormData({ ...formData, asstLeaders: newAsstLeaders })
  }

  const addAssistantLeader = () => {
    setFormData({ ...formData, asstLeaders: [...formData.asstLeaders, ""] })
  }

  const removeAssistantLeader = (index: number) => {
    const newAsstLeaders = formData.asstLeaders.filter((_, i) => i !== index)
    setFormData({ ...formData, asstLeaders: newAsstLeaders })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Teams</h1>
          <p className="text-muted-foreground">Manage teams and their members</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          {hasPermission("add_team") && <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="mr-2 h-4 w-4" />
              Add Team
            </Button>
          </DialogTrigger>}
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Add New Team</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Team Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="color">Team Color</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="color"
                    type="color"
                    value={formData.color}
                    onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                    className="w-16 h-10"
                  />
                  <Input
                    value={formData.color}
                    onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                    placeholder="#3B82F6"
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="leader">Team Leader</Label>
                <Input
                  id="leader"
                  value={formData.leader}
                  onChange={(e) => setFormData({ ...formData, leader: e.target.value })}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label>Assistant Leaders</Label>
                {formData.asstLeaders.map((leader, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Input
                      value={leader}
                      onChange={(e) => handleAssistantLeaderChange(e.target.value, index)}
                      placeholder="Assistant leader name"
                    />
                    <Button type="button" variant="outline" size="sm" onClick={() => removeAssistantLeader(index)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <Button type="button" variant="outline" onClick={addAssistantLeader}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Assistant Leader
                </Button>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="userId">Assign User</Label>
                <Select value={formData.userId} onValueChange={(value) => setFormData({ ...formData, userId: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a user" />
                  </SelectTrigger>
                  <SelectContent>
                    {users.map((user) => (
                      <SelectItem key={user._id} value={user._id}>
                        {user.username} ({user.role.name})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">Create Team</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Teams</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{teams.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Top Team</CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {teams.length > 0
                ? teams.reduce((prev, current) => (prev.totalPoint.published > current.totalPoint.published ? prev : current)).name
                : "N/A"}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Points</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{teams.reduce((sum, team) => sum + team.totalPoint.published, 0)}</div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search teams..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Teams Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Teams</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Team</TableHead>
                <TableHead>Leader</TableHead>
                <TableHead>Assistant Leaders</TableHead>
                <TableHead>Total Points</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTeams.map((team) => (
                <TableRow key={team._id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded-full" style={{ backgroundColor: team.color }} />
                      <span className="font-medium">{team.name}</span>
                    </div>
                  </TableCell>
                  <TableCell>{team.leader?.name}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {team.asstLeaders.map((leader, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {leader?.name}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="font-mono">
                      {team.totalPoint.published}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {team.userId ? (
                      <Badge variant="secondary">{team.userId.username}</Badge>
                    ) : (
                      <span className="text-muted-foreground">Not assigned</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {hasPermission("edit_team") && (
                        <Button variant="outline" size="sm" onClick={() => handleEdit(team)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                      )}
                      {hasPermission("delete_team") && (
                        <Button variant="outline" size="sm" onClick={() => handleDelete(team._id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Team</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-name">Team Name</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-color">Team Color</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="edit-color"
                  type="color"
                  value={formData.color}
                  onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                  className="w-16 h-10"
                />
                <Input
                  value={formData.color}
                  onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                  placeholder="#3B82F6"
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-leader">Team Leader</Label>
              <Input
                id="edit-leader"
                value={formData.leader}
                onChange={(e) => setFormData({ ...formData, leader: e.target.value })}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label>Assistant Leaders</Label>
              {formData.asstLeaders.map((leader, index) => (
                <div key={index} className="flex items-center gap-2">
                  <Input
                    value={leader}
                    onChange={(e) => handleAssistantLeaderChange(e.target.value, index)}
                    placeholder="Assistant leader name"
                  />
                  <Button type="button" variant="outline" size="sm" onClick={() => removeAssistantLeader(index)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <Button type="button" variant="outline" onClick={addAssistantLeader}>
                <Plus className="mr-2 h-4 w-4" />
                Add Assistant Leader
              </Button>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-userId">Assign User</Label>
              <Select value={formData.userId} onValueChange={(value) => setFormData({ ...formData, userId: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a user" />
                </SelectTrigger>
                <SelectContent>
                  {users.map((user) => (
                    <SelectItem key={user._id} value={user._id}>
                      {user.username} ({user.role.name})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Update Team</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
