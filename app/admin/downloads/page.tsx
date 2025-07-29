"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Switch } from "@/components/ui/switch"
import { toast } from "sonner"
import { Plus, Search, Edit, Trash2, Download, FileText, File, ImageIcon, Video, Archive, Filter } from "lucide-react"
import axios from "@/lib/axios"

interface DownloadFile {
  id: string
  title: string
  description: string
  fileName: string
  fileUrl: string
  fileType: string
  fileSize: number
  category: string
  version: string
  isPublic: boolean
  downloadCount: number
  uploadedAt: string
  updatedAt: string
}

const downloadCategories = [
  "Forms & Applications",
  "Rules & Regulations",
  "Schedules & Timetables",
  "Results & Rankings",
  "Certificates & Awards",
  "Guidelines & Instructions",
  "Brochures & Flyers",
  "Reports & Documents",
  "Other",
]

const getFileIcon = (fileType: string) => {
  if (fileType.startsWith("image/")) return ImageIcon
  if (fileType.startsWith("video/")) return Video
  if (fileType.includes("pdf")) return FileText
  if (fileType.includes("zip") || fileType.includes("rar")) return Archive
  return File
}

const getMimeTypeColor = (fileType: string) => {
  if (fileType.startsWith("image/")) return "bg-green-100 text-green-800"
  if (fileType.startsWith("video/")) return "bg-purple-100 text-purple-800"
  if (fileType.includes("pdf")) return "bg-red-100 text-red-800"
  if (fileType.includes("zip") || fileType.includes("rar")) return "bg-yellow-100 text-yellow-800"
  if (fileType.includes("doc")) return "bg-blue-100 text-blue-800"
  return "bg-gray-100 text-gray-800"
}

export default function DownloadsPage() {
  const [files, setFiles] = useState<DownloadFile[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("")
  const [typeFilter, setTypeFilter] = useState("")
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editingFile, setEditingFile] = useState<DownloadFile | null>(null)
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    version: "1.0",
    isPublic: true,
    file: null as File | null,
  })

  useEffect(() => {
    fetchFiles()
  }, [])

  const fetchFiles = async () => {
    try {
      setLoading(true)
      const response = await axios.get("/downloads")
      setFiles(response.data)
    } catch (error) {
      toast.error("Failed to fetch download files")
      console.error("Error fetching files:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateFile = async () => {
    try {
      const formDataToSend = new FormData()
      formDataToSend.append("title", formData.title)
      formDataToSend.append("description", formData.description)
      formDataToSend.append("category", formData.category)
      formDataToSend.append("version", formData.version)
      formDataToSend.append("isPublic", formData.isPublic.toString())
      if (formData.file) {
        formDataToSend.append("file", formData.file)
      }

      const response = await axios.post("/downloads", formDataToSend, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })
      setFiles([...files, response.data])
      setIsCreateDialogOpen(false)
      resetForm()
      toast.success("File uploaded successfully")
    } catch (error) {
      toast.error("Failed to upload file")
      console.error("Error uploading file:", error)
    }
  }

  const handleUpdateFile = async () => {
    if (!editingFile) return

    try {
      const formDataToSend = new FormData()
      formDataToSend.append("title", formData.title)
      formDataToSend.append("description", formData.description)
      formDataToSend.append("category", formData.category)
      formDataToSend.append("version", formData.version)
      formDataToSend.append("isPublic", formData.isPublic.toString())
      if (formData.file) {
        formDataToSend.append("file", formData.file)
      }

      const response = await axios.put(`/downloads/${editingFile.id}`, formDataToSend, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })
      setFiles(files.map((file) => (file.id === editingFile.id ? response.data : file)))
      setIsEditDialogOpen(false)
      setEditingFile(null)
      resetForm()
      toast.success("File updated successfully")
    } catch (error) {
      toast.error("Failed to update file")
      console.error("Error updating file:", error)
    }
  }

  const handleDeleteFile = async (fileId: string) => {
    try {
      await axios.delete(`/downloads/${fileId}`)
      setFiles(files.filter((file) => file.id !== fileId))
      toast.success("File deleted successfully")
    } catch (error) {
      toast.error("Failed to delete file")
      console.error("Error deleting file:", error)
    }
  }

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      category: "",
      version: "1.0",
      isPublic: true,
      file: null,
    })
  }

  const openEditDialog = (file: DownloadFile) => {
    setEditingFile(file)
    setFormData({
      title: file.title,
      description: file.description,
      category: file.category,
      version: file.version,
      isPublic: file.isPublic,
      file: null,
    })
    setIsEditDialogOpen(true)
  }

  const filteredFiles = files.filter((file) => {
    const matchesSearch =
      file.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      file.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      file.fileName.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = !categoryFilter || file.category === categoryFilter
    const matchesType = !typeFilter || file.fileType.includes(typeFilter)
    return matchesSearch && matchesCategory && matchesType
  })

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  if (loading) {
    return <div>Loading...</div>
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Downloads Management</h2>
          <p className="text-muted-foreground">Manage downloadable files and resources for ArtFest</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="mr-2 h-4 w-4" />
              Upload File
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Upload New File</DialogTitle>
              <DialogDescription>Add a new downloadable file or resource</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="title" className="text-right">
                  Title
                </Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="description" className="text-right">
                  Description
                </Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="category" className="text-right">
                  Category
                </Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => setFormData({ ...formData, category: value })}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {downloadCategories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="version" className="text-right">
                  Version
                </Label>
                <Input
                  id="version"
                  value={formData.version}
                  onChange={(e) => setFormData({ ...formData, version: e.target.value })}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="file" className="text-right">
                  File
                </Label>
                <Input
                  id="file"
                  type="file"
                  onChange={(e) => setFormData({ ...formData, file: e.target.files?.[0] || null })}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="isPublic" className="text-right">
                  Access
                </Label>
                <div className="col-span-3 flex items-center space-x-2">
                  <Switch
                    id="isPublic"
                    checked={formData.isPublic}
                    onCheckedChange={(checked) => setFormData({ ...formData, isPublic: checked })}
                  />
                  <Label htmlFor="isPublic" className="text-sm text-muted-foreground">
                    {formData.isPublic ? "Public access" : "Private access"}
                  </Label>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" onClick={handleCreateFile}>
                Upload File
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex items-center space-x-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search files..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-[180px]">
            <Filter className="mr-2 h-4 w-4" />
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {downloadCategories.map((category) => (
              <SelectItem key={category} value={category}>
                {category}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="All Types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="pdf">PDF</SelectItem>
            <SelectItem value="doc">Documents</SelectItem>
            <SelectItem value="image">Images</SelectItem>
            <SelectItem value="zip">Archives</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredFiles.map((file) => {
          const FileIcon = getFileIcon(file.fileType)
          return (
            <Card key={file.id}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="flex items-center space-x-2">
                  <FileIcon className="h-8 w-8 text-muted-foreground" />
                  <CardTitle className="text-lg font-semibold">{file.title}</CardTitle>
                </div>
                <Badge className={getMimeTypeColor(file.fileType)}>v{file.version}</Badge>
              </CardHeader>
              <CardContent>
                <CardDescription className="mb-4">{file.description}</CardDescription>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Size:</span>
                    <span>{formatFileSize(file.fileSize)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Downloads:</span>
                    <span>{file.downloadCount}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Uploaded:</span>
                    <span>{formatDate(file.uploadedAt)}</span>
                  </div>
                  <Badge variant="outline" className="mt-2">
                    {file.category}
                  </Badge>
                  <div className="flex items-center justify-between pt-2">
                    <Badge variant={file.isPublic ? "default" : "secondary"}>
                      {file.isPublic ? "Public" : "Private"}
                    </Badge>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm" onClick={() => window.open(file.fileUrl, "_blank")}>
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => openEditDialog(file)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="outline" size="sm">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This action cannot be undone. This will permanently delete the file and remove it from
                              downloads.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDeleteFile(file.id)}>Delete</AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Edit File</DialogTitle>
            <DialogDescription>Update file information</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-title" className="text-right">
                Title
              </Label>
              <Input
                id="edit-title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-description" className="text-right">
                Description
              </Label>
              <Textarea
                id="edit-description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-category" className="text-right">
                Category
              </Label>
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData({ ...formData, category: value })}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {downloadCategories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-version" className="text-right">
                Version
              </Label>
              <Input
                id="edit-version"
                value={formData.version}
                onChange={(e) => setFormData({ ...formData, version: e.target.value })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-file" className="text-right">
                Replace File
              </Label>
              <Input
                id="edit-file"
                type="file"
                onChange={(e) => setFormData({ ...formData, file: e.target.files?.[0] || null })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-isPublic" className="text-right">
                Access
              </Label>
              <div className="col-span-3 flex items-center space-x-2">
                <Switch
                  id="edit-isPublic"
                  checked={formData.isPublic}
                  onCheckedChange={(checked) => setFormData({ ...formData, isPublic: checked })}
                />
                <Label htmlFor="edit-isPublic" className="text-sm text-muted-foreground">
                  {formData.isPublic ? "Public access" : "Private access"}
                </Label>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" onClick={handleUpdateFile}>
              Update File
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
