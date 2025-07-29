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
import { Plus, Search, Edit, Trash2, Eye, Calendar, User, Pin, Filter } from "lucide-react"
import axios from "@/lib/axios"

interface NewsArticle {
  id: string
  title: string
  content: string
  excerpt: string
  featuredImage?: string
  author: string
  category: string
  tags: string[]
  status: "draft" | "published" | "archived"
  isPinned: boolean
  viewCount: number
  publishedAt?: string
  createdAt: string
  updatedAt: string
}

const newsCategories = [
  "Announcements",
  "Competition Updates",
  "Event Coverage",
  "Awards & Recognition",
  "Behind the Scenes",
  "Interviews",
  "Press Releases",
  "General News",
]

const newsStatuses = [
  { value: "draft", label: "Draft", color: "bg-gray-100 text-gray-800" },
  { value: "published", label: "Published", color: "bg-green-100 text-green-800" },
  { value: "archived", label: "Archived", color: "bg-yellow-100 text-yellow-800" },
]

export default function NewsPage() {
  const [articles, setArticles] = useState<NewsArticle[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("")
  const [statusFilter, setStatusFilter] = useState("")
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [editingArticle, setEditingArticle] = useState<NewsArticle | null>(null)
  const [viewingArticle, setViewingArticle] = useState<NewsArticle | null>(null)
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    excerpt: "",
    author: "",
    category: "",
    tags: "",
    status: "draft" as const,
    isPinned: false,
    featuredImage: null as File | null,
  })

  useEffect(() => {
    fetchArticles()
  }, [])

  const fetchArticles = async () => {
    try {
      setLoading(true)
      const response = await axios.get("/news")
      setArticles(response.data)
    } catch (error) {
      toast.error("Failed to fetch news articles")
      console.error("Error fetching articles:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateArticle = async () => {
    try {
      const formDataToSend = new FormData()
      formDataToSend.append("title", formData.title)
      formDataToSend.append("content", formData.content)
      formDataToSend.append("excerpt", formData.excerpt)
      formDataToSend.append("author", formData.author)
      formDataToSend.append("category", formData.category)
      formDataToSend.append("tags", formData.tags)
      formDataToSend.append("status", formData.status)
      formDataToSend.append("isPinned", formData.isPinned.toString())
      if (formData.featuredImage) {
        formDataToSend.append("featuredImage", formData.featuredImage)
      }

      const response = await axios.post("/news", formDataToSend, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })
      setArticles([...articles, response.data])
      setIsCreateDialogOpen(false)
      resetForm()
      toast.success("Article created successfully")
    } catch (error) {
      toast.error("Failed to create article")
      console.error("Error creating article:", error)
    }
  }

  const handleUpdateArticle = async () => {
    if (!editingArticle) return

    try {
      const formDataToSend = new FormData()
      formDataToSend.append("title", formData.title)
      formDataToSend.append("content", formData.content)
      formDataToSend.append("excerpt", formData.excerpt)
      formDataToSend.append("author", formData.author)
      formDataToSend.append("category", formData.category)
      formDataToSend.append("tags", formData.tags)
      formDataToSend.append("status", formData.status)
      formDataToSend.append("isPinned", formData.isPinned.toString())
      if (formData.featuredImage) {
        formDataToSend.append("featuredImage", formData.featuredImage)
      }

      const response = await axios.put(`/news/${editingArticle.id}`, formDataToSend, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })
      setArticles(articles.map((article) => (article.id === editingArticle.id ? response.data : article)))
      setIsEditDialogOpen(false)
      setEditingArticle(null)
      resetForm()
      toast.success("Article updated successfully")
    } catch (error) {
      toast.error("Failed to update article")
      console.error("Error updating article:", error)
    }
  }

  const handleDeleteArticle = async (articleId: string) => {
    try {
      await axios.delete(`/news/${articleId}`)
      setArticles(articles.filter((article) => article.id !== articleId))
      toast.success("Article deleted successfully")
    } catch (error) {
      toast.error("Failed to delete article")
      console.error("Error deleting article:", error)
    }
  }

  const resetForm = () => {
    setFormData({
      title: "",
      content: "",
      excerpt: "",
      author: "",
      category: "",
      tags: "",
      status: "draft",
      isPinned: false,
      featuredImage: null,
    })
  }

  const openEditDialog = (article: NewsArticle) => {
    setEditingArticle(article)
    setFormData({
      title: article.title,
      content: article.content,
      excerpt: article.excerpt,
      author: article.author,
      category: article.category,
      tags: article.tags.join(", "),
      status: article.status,
      isPinned: article.isPinned,
      featuredImage: null,
    })
    setIsEditDialogOpen(true)
  }

  const openViewDialog = (article: NewsArticle) => {
    setViewingArticle(article)
    setIsViewDialogOpen(true)
  }

  const filteredArticles = articles.filter((article) => {
    const matchesSearch =
      article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      article.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      article.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
      article.tags.some((tag) => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    const matchesCategory = !categoryFilter || article.category === categoryFilter
    const matchesStatus = !statusFilter || article.status === statusFilter
    return matchesSearch && matchesCategory && matchesStatus
  })

  const getStatusBadge = (status: string) => {
    const statusConfig = newsStatuses.find((s) => s.value === status)
    return <Badge className={statusConfig?.color}>{statusConfig?.label}</Badge>
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  if (loading) {
    return <div>Loading...</div>
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">News Management</h2>
          <p className="text-muted-foreground">Create and manage news articles and announcements</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="mr-2 h-4 w-4" />
              Create Article
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Article</DialogTitle>
              <DialogDescription>Write a new news article or announcement</DialogDescription>
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
                <Label htmlFor="excerpt" className="text-right">
                  Excerpt
                </Label>
                <Textarea
                  id="excerpt"
                  placeholder="Brief summary of the article"
                  value={formData.excerpt}
                  onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                  className="col-span-3"
                  rows={2}
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="content" className="text-right">
                  Content
                </Label>
                <Textarea
                  id="content"
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  className="col-span-3"
                  rows={8}
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="author" className="text-right">
                  Author
                </Label>
                <Input
                  id="author"
                  value={formData.author}
                  onChange={(e) => setFormData({ ...formData, author: e.target.value })}
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
                    {newsCategories.map((category) => (
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
                <Label htmlFor="status" className="text-right">
                  Status
                </Label>
                <Select
                  value={formData.status}
                  onValueChange={(value: any) => setFormData({ ...formData, status: value })}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    {newsStatuses.map((status) => (
                      <SelectItem key={status.value} value={status.value}>
                        {status.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="featuredImage" className="text-right">
                  Featured Image
                </Label>
                <Input
                  id="featuredImage"
                  type="file"
                  accept="image/*"
                  onChange={(e) => setFormData({ ...formData, featuredImage: e.target.files?.[0] || null })}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="isPinned" className="text-right">
                  Pin Article
                </Label>
                <div className="col-span-3 flex items-center space-x-2">
                  <Switch
                    id="isPinned"
                    checked={formData.isPinned}
                    onCheckedChange={(checked) => setFormData({ ...formData, isPinned: checked })}
                  />
                  <Label htmlFor="isPinned" className="text-sm text-muted-foreground">
                    Pin this article to the top
                  </Label>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" onClick={handleCreateArticle}>
                Create Article
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex items-center space-x-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search articles..."
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
            {newsCategories.map((category) => (
              <SelectItem key={category} value={category}>
                {category}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="All Statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            {newsStatuses.map((status) => (
              <SelectItem key={status.value} value={status.value}>
                {status.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-6">
        {filteredArticles.map((article) => (
          <Card key={article.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="space-y-2 flex-1">
                  <div className="flex items-center space-x-2">
                    <CardTitle className="text-xl font-semibold">{article.title}</CardTitle>
                    {article.isPinned && <Pin className="h-4 w-4 text-yellow-500" />}
                  </div>
                  <CardDescription>{article.excerpt}</CardDescription>
                  <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                    <div className="flex items-center">
                      <User className="mr-1 h-3 w-3" />
                      {article.author}
                    </div>
                    <div className="flex items-center">
                      <Calendar className="mr-1 h-3 w-3" />
                      {formatDate(article.createdAt)}
                    </div>
                    <div className="flex items-center">
                      <Eye className="mr-1 h-3 w-3" />
                      {article.viewCount} views
                    </div>
                    {getStatusBadge(article.status)}
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm" onClick={() => openViewDialog(article)}>
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => openEditDialog(article)}>
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
                          This action cannot be undone. This will permanently delete the article and remove all
                          associated data.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleDeleteArticle(article.id)}>Delete</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Badge variant="outline">{article.category}</Badge>
                {article.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {article.tags.slice(0, 5).map((tag, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                    {article.tags.length > 5 && (
                      <Badge variant="secondary" className="text-xs">
                        +{article.tags.length - 5}
                      </Badge>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Article</DialogTitle>
            <DialogDescription>Update article information</DialogDescription>
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
              <Label htmlFor="edit-excerpt" className="text-right">
                Excerpt
              </Label>
              <Textarea
                id="edit-excerpt"
                placeholder="Brief summary of the article"
                value={formData.excerpt}
                onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                className="col-span-3"
                rows={2}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-content" className="text-right">
                Content
              </Label>
              <Textarea
                id="edit-content"
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                className="col-span-3"
                rows={8}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-author" className="text-right">
                Author
              </Label>
              <Input
                id="edit-author"
                value={formData.author}
                onChange={(e) => setFormData({ ...formData, author: e.target.value })}
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
                  {newsCategories.map((category) => (
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
              <Label htmlFor="edit-status" className="text-right">
                Status
              </Label>
              <Select
                value={formData.status}
                onValueChange={(value: any) => setFormData({ ...formData, status: value })}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  {newsStatuses.map((status) => (
                    <SelectItem key={status.value} value={status.value}>
                      {status.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-featuredImage" className="text-right">
                Featured Image
              </Label>
              <Input
                id="edit-featuredImage"
                type="file"
                accept="image/*"
                onChange={(e) => setFormData({ ...formData, featuredImage: e.target.files?.[0] || null })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-isPinned" className="text-right">
                Pin Article
              </Label>
              <div className="col-span-3 flex items-center space-x-2">
                <Switch
                  id="edit-isPinned"
                  checked={formData.isPinned}
                  onCheckedChange={(checked) => setFormData({ ...formData, isPinned: checked })}
                />
                <Label htmlFor="edit-isPinned" className="text-sm text-muted-foreground">
                  Pin this article to the top
                </Label>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" onClick={handleUpdateArticle}>
              Update Article
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="sm:max-w-[800px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <span>{viewingArticle?.title}</span>
              {viewingArticle?.isPinned && <Pin className="h-4 w-4 text-yellow-500" />}
            </DialogTitle>
            <DialogDescription>
              <div className="flex items-center space-x-4 text-sm">
                <span>By {viewingArticle?.author}</span>
                <span>{viewingArticle && formatDate(viewingArticle.createdAt)}</span>
                <span>{viewingArticle?.viewCount} views</span>
                {viewingArticle && getStatusBadge(viewingArticle.status)}
              </div>
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            {viewingArticle?.featuredImage && (
              <img
                src={viewingArticle.featuredImage || "/placeholder.svg"}
                alt={viewingArticle.title}
                className="w-full h-48 object-cover rounded-lg mb-4"
              />
            )}
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Excerpt</h4>
                <p className="text-muted-foreground">{viewingArticle?.excerpt}</p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Content</h4>
                <div className="prose max-w-none">
                  {viewingArticle?.content.split("\n").map((paragraph, index) => (
                    <p key={index} className="mb-2">
                      {paragraph}
                    </p>
                  ))}
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <Badge variant="outline">{viewingArticle?.category}</Badge>
                {viewingArticle?.tags.map((tag, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
