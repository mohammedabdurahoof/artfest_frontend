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
import { toast } from "sonner"
import { Plus, Search, Edit, Trash2, ImageIcon, Video, FileText, Download, Eye, Filter } from "lucide-react"
import axios from "@/lib/axios"

interface GalleryItem {
  id: string
  title: string
  description: string
  fileName: string
  fileUrl: string
  fileType: "image" | "video" | "document"
  fileSize: number
  category: string
  tags: string[]
  isPublic: boolean
  downloadCount: number
  createdAt: string
  updatedAt: string
}

const galleryCategories = [
  "Competition Photos",
  "Event Coverage",
  "Behind the Scenes",
  "Awards Ceremony",
  "Workshops",
  "Performances",
  "Exhibitions",
  "Team Photos",
  "Other",
]

const fileTypes = [
  { value: "image", label: "Image", icon: ImageIcon },
  { value: "video", label: "Video", icon: Video },
  { value: "document", label: "Document", icon: FileText },
]

export default function GalleryPage() {
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("")
  const [typeFilter, setTypeFilter] = useState("")
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<GalleryItem | null>(null)
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    tags: "",
    isPublic: true,
    file: null as File | null,
  })

  useEffect(() => {
    fetchGalleryItems()
  }, [])

  const fetchGalleryItems = async () => {
    try {
      setLoading(true)
      const response = await axios.get("/gallery")
      setGalleryItems(response.data)
    } catch (error) {
      toast.error("Failed to fetch gallery items")
      console.error("Error fetching gallery items:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateItem = async () => {
    try {
      const formDataToSend = new FormData()
      formDataToSend.append("title", formData.title)
      formDataToSend.append("description", formData.description)
      formDataToSend.append("category", formData.category)
      formDataToSend.append("tags", formData.tags)
      formDataToSend.append("isPublic", formData.isPublic.toString())
      if (formData.file) {
        formDataToSend.append("file", formData.file)
      }

      const response = await axios.post("/gallery", formDataToSend, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })
      setGalleryItems([...galleryItems, response.data])
      setIsCreateDialogOpen(false)
      resetForm()
      toast.success("Gallery item created successfully")
    } catch (error) {
      toast.error("Failed to create gallery item")
      console.error("Error creating gallery item:", error)
    }
  }

  const handleUpdateItem = async () => {
    if (!editingItem) return

    try {
      const formDataToSend = new FormData()
      formDataToSend.append("title", formData.title)
      formDataToSend.append("description", formData.description)
      formDataToSend.append("category", formData.category)
      formDataToSend.append("tags", formData.tags)
      formDataToSend.append("isPublic", formData.isPublic.toString())
      if (formData.file) {
        formDataToSend.append("file", formData.file)
      }

      const response = await axios.put(`/gallery/${editingItem.id}`, formDataToSend, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })
      setGalleryItems(galleryItems.map((item) => (item.id === editingItem.id ? response.data : item)))
      setIsEditDialogOpen(false)
      setEditingItem(null)
      resetForm()
      toast.success("Gallery item updated successfully")
    } catch (error) {
      toast.error("Failed to update gallery item")
      console.error("Error updating gallery item:", error)
    }
  }

  const handleDeleteItem = async (itemId: string) => {
    try {
      await axios.delete(`/gallery/${itemId}`)
      setGalleryItems(galleryItems.filter((item) => item.id !== itemId))
      toast.success("Gallery item deleted successfully")
    } catch (error) {
      toast.error("Failed to delete gallery item")
      console.error("Error deleting gallery item:", error)
    }
  }

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      category: "",
      tags: "",
      isPublic: true,
      file: null,
    })
  }

  const openEditDialog = (item: GalleryItem) => {
    setEditingItem(item)
    setFormData({
      title: item.title,
      description: item.description,
      category: item.category,
      tags: item.tags.join(", "),
      isPublic: item.isPublic,
      file: null,
    })
    setIsEditDialogOpen(true)
  }

  const filteredItems = galleryItems.filter((item) => {
    const matchesSearch =
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.tags.some((tag) => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    const matchesCategory = !categoryFilter || item.category === categoryFilter
    const matchesType = !typeFilter || item.fileType === typeFilter
    return matchesSearch && matchesCategory && matchesType
  })

  const getFileIcon = (fileType: string) => {
    const type = fileTypes.find((t) => t.value === fileType)
    const IconComponent = type?.icon || FileText
    return <IconComponent className="h-4 w-4" />
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  if (loading) {
    return <div>Loading...</div>
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Gallery Management</h2>
          <p className="text-muted-foreground">Manage media files, images, and documents for ArtFest</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="mr-2 h-4 w-4" />
              Add Media
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Upload New Media</DialogTitle>
              <DialogDescription>Add a new image, video, or document to the gallery</DialogDescription>
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
                    {galleryCategories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="tags" className="text-right">
                  Tags
                </Label>
                <Input
                  id="tags"
                  placeholder="Comma-separated tags"
                  value={formData.tags}
                  onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
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
                  accept="image/*,video/*,.pdf,.doc,.docx"
                  onChange={(e) => setFormData({ ...formData, file: e.target.files?.[0] || null })}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="isPublic" className="text-right">
                  Visibility
                </Label>
                <Select
                  value={formData.isPublic.toString()}
                  onValueChange={(value) => setFormData({ ...formData, isPublic: value === "true" })}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="true">Public</SelectItem>
                    <SelectItem value="false">Private</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" onClick={handleCreateItem}>
                Upload Media
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex items-center space-x-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search gallery..."
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
            {galleryCategories.map((category) => (
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
            {fileTypes.map((type) => (
              <SelectItem key={type.value} value={type.value}>
                {type.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filteredItems.map((item) => (
          <Card key={item.id}>
            <CardHeader className="p-0">
              {item.fileType === "image" ? (
                <img
                  src={item.fileUrl || "/placeholder.svg"}
                  alt={item.title}
                  className="h-48 w-full object-cover rounded-t-lg"
                />
              ) : (
                <div className="h-48 w-full bg-muted rounded-t-lg flex items-center justify-center">
                  {getFileIcon(item.fileType)}
                  <span className="ml-2 text-sm text-muted-foreground">{item.fileType.toUpperCase()}</span>
                </div>
              )}
            </CardHeader>
            <CardContent className="p-4">
              <CardTitle className="text-lg font-semibold mb-2">{item.title}</CardTitle>
              <CardDescription className="mb-3">{item.description}</CardDescription>
              <div className="space-y-2 text-sm">
                <Badge variant="outline">{item.category}</Badge>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">{formatFileSize(item.fileSize)}</span>
                  <div className="flex items-center space-x-1">
                    <Download className="h-3 w-3" />
                    <span className="text-xs">{item.downloadCount}</span>
                  </div>
                </div>
                {item.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {item.tags.slice(0, 3).map((tag, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                    {item.tags.length > 3 && (
                      <Badge variant="secondary" className="text-xs">
                        +{item.tags.length - 3}
                      </Badge>
                    )}
                  </div>
                )}
                <div className="flex items-center justify-between pt-2">
                  <Badge variant={item.isPublic ? "default" : "secondary"}>
                    {item.isPublic ? "Public" : "Private"}
                  </Badge>
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm" onClick={() => window.open(item.fileUrl, "_blank")}>
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => openEditDialog(item)}>
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
                            This action cannot be undone. This will permanently delete the media file and remove it from
                            the gallery.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDeleteItem(item.id)}>Delete</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Edit Media Item</DialogTitle>
            <DialogDescription>Update media information</DialogDescription>
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
                  {galleryCategories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-tags" className="text-right">
                Tags
              </Label>
              <Input
                id="edit-tags"
                placeholder="Comma-separated tags"
                value={formData.tags}
                onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
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
                accept="image/*,video/*,.pdf,.doc,.docx"
                onChange={(e) => setFormData({ ...formData, file: e.target.files?.[0] || null })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-isPublic" className="text-right">
                Visibility
              </Label>
              <Select
                value={formData.isPublic.toString()}
                onValueChange={(value) => setFormData({ ...formData, isPublic: value === "true" })}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="true">Public</SelectItem>
                  <SelectItem value="false">Private</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" onClick={handleUpdateItem}>
              Update Media
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
