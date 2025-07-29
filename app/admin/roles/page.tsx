"use client"

import { useState, useEffect } from "react"
import { Plus, Search, MoreHorizontal, Edit, Trash2, Shield, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { useToast } from "@/hooks/use-toast"
import api from "@/lib/axios"

interface Role {
  id: string
  name: string
  description: string
  permissions: string[]
  userCount: number
  createdAt: string
}

interface Permission {
  id: string
  name: string
  description: string
  category: string
  createdAt: string
}

const availablePermissions = [
  { id: "users.read", name: "View Users", category: "Users" },
  { id: "users.write", name: "Manage Users", category: "Users" },
  { id: "students.read", name: "View Students", category: "Students" },
  { id: "students.write", name: "Manage Students", category: "Students" },
  { id: "programs.read", name: "View Programs", category: "Programs" },
  { id: "programs.write", name: "Manage Programs", category: "Programs" },
  { id: "judges.read", name: "View Judges", category: "Judges" },
  { id: "judges.write", name: "Manage Judges", category: "Judges" },
  { id: "results.read", name: "View Results", category: "Results" },
  { id: "results.write", name: "Manage Results", category: "Results" },
]

export default function RolesPage() {
  const [roles, setRoles] = useState<Role[]>([])
  const [permissions, setPermissions] = useState<Permission[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [isAddRoleDialogOpen, setIsAddRoleDialogOpen] = useState(false)
  const [isEditRoleDialogOpen, setIsEditRoleDialogOpen] = useState(false)
  const [isAddPermissionDialogOpen, setIsAddPermissionDialogOpen] = useState(false)
  const [selectedRole, setSelectedRole] = useState<Role | null>(null)
  const [roleFormData, setRoleFormData] = useState({
    name: "",
    description: "",
    permissions: [] as string[],
  })
  const [permissionFormData, setPermissionFormData] = useState({
    name: "",
    description: "",
    category: "",
  })
  const { toast } = useToast()

  useEffect(() => {
    fetchRoles()
    fetchPermissions()
  }, [])

  const fetchRoles = async () => {
    try {
      const response = await api.get("/roles")
      setRoles(response.data)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch roles",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const fetchPermissions = async () => {
    try {
      const response = await api.get("/permissions")
      setPermissions(response.data)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch permissions",
        variant: "destructive",
      })
    }
  }

  const handleAddRole = async () => {
    try {
      const response = await api.post("/roles", roleFormData)
      setRoles([...roles, response.data])
      setIsAddRoleDialogOpen(false)
      setRoleFormData({ name: "", description: "", permissions: [] })
      toast({
        title: "Success",
        description: "Role added successfully",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add role",
        variant: "destructive",
      })
    }
  }

  const handleEditRole = async () => {
    if (!selectedRole) return

    try {
      const response = await api.put(`/roles/${selectedRole.id}`, roleFormData)
      setRoles(roles.map((role) => (role.id === selectedRole.id ? response.data : role)))
      setIsEditRoleDialogOpen(false)
      setSelectedRole(null)
      setRoleFormData({ name: "", description: "", permissions: [] })
      toast({
        title: "Success",
        description: "Role updated successfully",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update role",
        variant: "destructive",
      })
    }
  }

  const handleDeleteRole = async (roleId: string) => {
    try {
      await api.delete(`/roles/${roleId}`)
      setRoles(roles.filter((role) => role.id !== roleId))
      toast({
        title: "Success",
        description: "Role deleted successfully",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete role",
        variant: "destructive",
      })
    }
  }

  const handleAddPermission = async () => {
    try {
      const response = await api.post("/permissions", permissionFormData)
      setPermissions([...permissions, response.data])
      setIsAddPermissionDialogOpen(false)
      setPermissionFormData({ name: "", description: "", category: "" })
      toast({
        title: "Success",
        description: "Permission added successfully",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add permission",
        variant: "destructive",
      })
    }
  }

  const openEditRoleDialog = (role: Role) => {
    setSelectedRole(role)
    setRoleFormData({
      name: role.name,
      description: role.description,
      permissions: role.permissions,
    })
    setIsEditRoleDialogOpen(true)
  }

  const handlePermissionToggle = (permissionId: string, checked: boolean) => {
    if (checked) {
      setRoleFormData({
        ...roleFormData,
        permissions: [...roleFormData.permissions, permissionId],
      })
    } else {
      setRoleFormData({
        ...roleFormData,
        permissions: roleFormData.permissions.filter((p) => p !== permissionId),
      })
    }
  }

  const filteredRoles = roles.filter(
    (role) =>
      role.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      role.description.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const filteredPermissions = permissions.filter(
    (permission) =>
      permission.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      permission.description.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Roles & Permissions</h1>
            <p className="text-muted-foreground">Manage user roles and system permissions</p>
          </div>
        </div>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Roles & Permissions</h1>
          <p className="text-muted-foreground">Manage user roles and system permissions</p>
        </div>
      </div>

      <Tabs defaultValue="roles" className="space-y-4">
        <TabsList>
          <TabsTrigger value="roles">Roles</TabsTrigger>
          <TabsTrigger value="permissions">Permissions</TabsTrigger>
        </TabsList>

        <TabsContent value="roles" className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search roles..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-sm"
              />
            </div>
            <Dialog open={isAddRoleDialogOpen} onOpenChange={setIsAddRoleDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Shield className="mr-2 h-4 w-4" />
                  Add Role
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Add New Role</DialogTitle>
                  <DialogDescription>Create a new role with specific permissions</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="role-name">Role Name</Label>
                    <Input
                      id="role-name"
                      value={roleFormData.name}
                      onChange={(e) => setRoleFormData({ ...roleFormData, name: e.target.value })}
                      placeholder="Enter role name"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="role-description">Description</Label>
                    <Textarea
                      id="role-description"
                      value={roleFormData.description}
                      onChange={(e) => setRoleFormData({ ...roleFormData, description: e.target.value })}
                      placeholder="Enter role description"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label>Permissions</Label>
                    <div className="grid grid-cols-2 gap-4 max-h-60 overflow-y-auto">
                      {availablePermissions.map((permission) => (
                        <div key={permission.id} className="flex items-center space-x-2">
                          <Checkbox
                            id={permission.id}
                            checked={roleFormData.permissions.includes(permission.id)}
                            onCheckedChange={(checked) => handlePermissionToggle(permission.id, checked as boolean)}
                          />
                          <Label htmlFor={permission.id} className="text-sm">
                            {permission.name}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsAddRoleDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleAddRole}>Add Role</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>All Roles</CardTitle>
              <CardDescription>Manage system roles and their permissions</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Role</TableHead>
                    <TableHead>Permissions</TableHead>
                    <TableHead>Users</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRoles.map((role) => (
                    <TableRow key={role.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{role.name}</div>
                          <div className="text-sm text-muted-foreground">{role.description}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {role.permissions.slice(0, 3).map((permission) => (
                            <Badge key={permission} variant="outline" className="text-xs">
                              {permission}
                            </Badge>
                          ))}
                          {role.permissions.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{role.permissions.length - 3} more
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-1">
                          <Users className="h-4 w-4 text-muted-foreground" />
                          <span>{role.userCount}</span>
                        </div>
                      </TableCell>
                      <TableCell>{new Date(role.createdAt).toLocaleDateString()}</TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => openEditRoleDialog(role)}>
                              <Edit className="mr-2 h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleDeleteRole(role.id)} className="text-destructive">
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="permissions" className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search permissions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-sm"
              />
            </div>
            <Dialog open={isAddPermissionDialogOpen} onOpenChange={setIsAddPermissionDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Permission
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Permission</DialogTitle>
                  <DialogDescription>Create a new system permission</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="permission-name">Permission Name</Label>
                    <Input
                      id="permission-name"
                      value={permissionFormData.name}
                      onChange={(e) => setPermissionFormData({ ...permissionFormData, name: e.target.value })}
                      placeholder="Enter permission name"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="permission-description">Description</Label>
                    <Textarea
                      id="permission-description"
                      value={permissionFormData.description}
                      onChange={(e) => setPermissionFormData({ ...permissionFormData, description: e.target.value })}
                      placeholder="Enter permission description"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="permission-category">Category</Label>
                    <Input
                      id="permission-category"
                      value={permissionFormData.category}
                      onChange={(e) => setPermissionFormData({ ...permissionFormData, category: e.target.value })}
                      placeholder="Enter category"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsAddPermissionDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleAddPermission}>Add Permission</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>All Permissions</CardTitle>
              <CardDescription>Manage system permissions</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Permission</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPermissions.map((permission) => (
                    <TableRow key={permission.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{permission.name}</div>
                          <div className="text-sm text-muted-foreground">{permission.description}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{permission.category}</Badge>
                      </TableCell>
                      <TableCell>{new Date(permission.createdAt).toLocaleDateString()}</TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>
                              <Edit className="mr-2 h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-destructive">
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Edit Role Dialog */}
      <Dialog open={isEditRoleDialogOpen} onOpenChange={setIsEditRoleDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Role</DialogTitle>
            <DialogDescription>Update role information and permissions</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-role-name">Role Name</Label>
              <Input
                id="edit-role-name"
                value={roleFormData.name}
                onChange={(e) => setRoleFormData({ ...roleFormData, name: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-role-description">Description</Label>
              <Textarea
                id="edit-role-description"
                value={roleFormData.description}
                onChange={(e) => setRoleFormData({ ...roleFormData, description: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label>Permissions</Label>
              <div className="grid grid-cols-2 gap-4 max-h-60 overflow-y-auto">
                {availablePermissions.map((permission) => (
                  <div key={permission.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`edit-${permission.id}`}
                      checked={roleFormData.permissions.includes(permission.id)}
                      onCheckedChange={(checked) => handlePermissionToggle(permission.id, checked as boolean)}
                    />
                    <Label htmlFor={`edit-${permission.id}`} className="text-sm">
                      {permission.name}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditRoleDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditRole}>Update Role</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
