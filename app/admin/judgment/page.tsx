"use client"

import { useState, useEffect } from "react"
import axios from "@/lib/axios"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "@/hooks/use-toast"
import { Search, Plus, Edit, FileText, Trophy, Award, Clock, Filter, X, Printer } from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/components/auth-provider"
import { Judgment, Participation, Program } from "@/types"


export default function JudgmentPage() {
    const [judgments, setJudgments] = useState<Judgment[]>([])
    const [participations, setParticipations] = useState<Participation[]>([])
    const [programs, setPrograms] = useState<Program[]>([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState("")
    const [statusFilter, setStatusFilter] = useState("all")
    const [resultStatusFilter, setResultStatusFilter] = useState("all")
    const [programFilter, setProgramFilter] = useState("all")
    const [categoryFilter, setCategoryFilter] = useState("all")

    // Dialog states
    const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)

    // Selected items
    const [selectedJudgment, setSelectedJudgment] = useState<Judgment | null>(null)
    const [selectedParticipation, setSelectedParticipation] = useState<Participation | null>(null)
    const [judgmentToDelete, setJudgmentToDelete] = useState<Judgment | null>(null)


    const { hasPermission } = useAuth()

    useEffect(() => {
        fetchJudgments()
        fetchParticipations()
        fetchPrograms()
    }, [])

    const fetchJudgments = async () => {
        try {
            setLoading(true)
            const response = await axios.get("/judgments")
            setJudgments(response.data.data || [])
        } catch (error) {
            console.error("Error fetching judgments:", error)
            toast({
                title: "Error",
                description: "Failed to fetch judgments",
                variant: "destructive",
            })
        } finally {
            setLoading(false)
        }
    }

    const fetchParticipations = async () => {
        try {
            const response = await axios.get("/participations")
            setParticipations(response.data.data || [])
        } catch (error) {
            console.error("Error fetching participations:", error)
            toast({
                title: "Error",
                description: "Failed to fetch participations",
                variant: "destructive",
            })
        }
    }

    const fetchPrograms = async () => {
        try {
            const response = await axios.get("/programs")
            setPrograms(response.data.data || [])
        } catch (error) {
            console.error("Error fetching programs:", error)
            toast({
                title: "Error",
                description: "Failed to fetch programs",
                variant: "destructive",
            })
        }
    }

    const updateStatus = async (program: Program, value: string, status: string) => {
        try {
            await axios.patch(`/programs/${program._id}`, status === "status" ? { status: value } : { resultStatus: value })
            toast({
                title: "Success",
                description: "Program status updated",
            })
            fetchPrograms()
        } catch (error: any) {
            toast({
                title: "Error",
                description: error.response?.data?.message || "Failed to update status",
                variant: "destructive",
            })
        }
    }


    // Clear all filters
    const clearFilters = () => {
        setSearchTerm("")
        setStatusFilter("all")
        setResultStatusFilter("all")
        setCategoryFilter("all")
        setProgramFilter("all")
    }

    // Check if any filters are active
    const hasActiveFilters = searchTerm !== "" || statusFilter !== "all" || resultStatusFilter !== "all" || categoryFilter !== "all" || programFilter !== "all"



    const filteredPrograms = programs.filter(program => {
        const matchesSearch =
            program.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            program.programCode.toLowerCase().includes(searchTerm.toLowerCase())

        const matchesCategory = categoryFilter === "all" || program.category === categoryFilter
        const matchesStatus = statusFilter === "all" || program.status === statusFilter
        const matchesResultStatus = resultStatusFilter === "all" || program.resultStatus === resultStatusFilter

        return matchesSearch && matchesCategory && matchesStatus && matchesResultStatus
    })


    const categories = ["all", "Bidaya", "Ula", "Thaniyya", "Thanawiyya", "Aliya", "Kulliyya"]
    const statuses = ["all", "Draft", "Pending", "Scheduled", "Cancelled", "Completed"]
    const resultStatuses = ["all", "pending", "processing", "completed", "archived", "published"]

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Judgments</h1>
                    <p className="text-muted-foreground">
                        Manage program judgments and evaluations
                    </p>
                </div>
                <div className="flex gap-2">
                    <Link href="/admin/programs">
                        <Button variant="outline">
                            <FileText className="mr-2 h-4 w-4" />
                            Programs
                        </Button>
                    </Link>
                    {hasPermission("add_judgments") && (
                        <Button onClick={() => setIsCreateDialogOpen(true)}>
                            <Plus className="mr-2 h-4 w-4" />
                            Create Judgment
                        </Button>
                    )}
                </div>
            </div>

            {/* Stats Cards */}
            {/* <div className="grid gap-4 md:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Judgments</CardTitle>
                        <FileText className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{judgments.length}</div>
                        <p className="text-xs text-muted-foreground">Active judgments</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Draft</CardTitle>
                        <Edit className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {judgments.filter(j => j.status === 'draft').length}
                        </div>
                        <p className="text-xs text-muted-foreground">Pending completion</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Submitted</CardTitle>
                        <Trophy className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {judgments.filter(j => j.status === 'submitted').length}
                        </div>
                        <p className="text-xs text-muted-foreground">Ready for review</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Finalized</CardTitle>
                        <Award className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {judgments.filter(j => j.status === 'finalized').length}
                        </div>
                        <p className="text-xs text-muted-foreground">Completed</p>
                    </CardContent>
                </Card>
            </div> */}

            {/* Programs List for Judgment */}
            <Card>
                <CardHeader>
                    <CardTitle>Programs Available for Judgment</CardTitle>
                    <CardDescription>All programs that can be judged</CardDescription>
                </CardHeader>
                <CardContent>
                    {/* Enhanced Search and Filters */}
                    <div className="space-y-4 mb-6">
                        <div className="flex items-center justify-between">
                            <div className="relative flex-1 max-w-sm">
                                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search programs..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-8"
                                />
                            </div>
                            <div className="flex items-center gap-2">
                                <Filter className="h-4 w-4 text-muted-foreground" />
                                <span className="text-sm text-muted-foreground">Filters:</span>
                                {hasActiveFilters && (
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={clearFilters}
                                        className="h-8 px-2 lg:px-3"
                                    >
                                        Clear filters
                                        <X className="ml-2 h-4 w-4" />
                                    </Button>
                                )}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Category" />
                                </SelectTrigger>
                                <SelectContent>
                                    {categories.map((category) => (
                                        <SelectItem key={category} value={category}>
                                            {category === "all" ? "All Categories" : category}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>

                            <Select value={statusFilter} onValueChange={setStatusFilter}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Program Status" />
                                </SelectTrigger>
                                <SelectContent>
                                    {statuses.map((status) => (
                                        <SelectItem key={status} value={status}>
                                            {status === "all" ? "All Statuses" : status}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>

                            <Select value={resultStatusFilter} onValueChange={setResultStatusFilter}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Result Status" />
                                </SelectTrigger>
                                <SelectContent>
                                    {resultStatuses.map((resultStatus) => (
                                        <SelectItem key={resultStatus} value={resultStatus}>
                                            {resultStatus === "all" ? "All Result Statuses" : resultStatus.charAt(0).toUpperCase() + resultStatus.slice(1)}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Active Filters Display */}
                        {hasActiveFilters && (
                            <div className="flex flex-wrap gap-2">
                                <span className="text-sm text-muted-foreground">Active filters:</span>
                                {searchTerm && (
                                    <Badge variant="secondary" className="gap-1">
                                        Search: {searchTerm}
                                        <X className="h-3 w-3 cursor-pointer" onClick={() => setSearchTerm("")} />
                                    </Badge>
                                )}
                                {categoryFilter !== "all" && (
                                    <Badge variant="secondary" className="gap-1">
                                        Category: {categoryFilter}
                                        <X className="h-3 w-3 cursor-pointer" onClick={() => setCategoryFilter("all")} />
                                    </Badge>
                                )}
                                {statusFilter !== "all" && (
                                    <Badge variant="secondary" className="gap-1">
                                        Status: {statusFilter}
                                        <X className="h-3 w-3 cursor-pointer" onClick={() => setStatusFilter("all")} />
                                    </Badge>
                                )}
                                {resultStatusFilter !== "all" && (
                                    <Badge variant="secondary" className="gap-1">
                                        Result: {resultStatusFilter}
                                        <X className="h-3 w-3 cursor-pointer" onClick={() => setResultStatusFilter("all")} />
                                    </Badge>
                                )}
                            </div>
                        )}
                    </div>

                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Code</TableHead>
                                    <TableHead>Program Name</TableHead>
                                    <TableHead>Category</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Result Status</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredPrograms.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={7} className="text-center py-8">
                                            {hasActiveFilters ? "No programs match your filters" : "No programs found"}
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filteredPrograms.map((program) => {
                                        return (
                                            <TableRow key={program._id}>
                                                <TableCell className="font-medium">{program.programCode}</TableCell>
                                                <TableCell>
                                                    <div>
                                                        <div className="font-medium">{program.name}</div>
                                                        <div className="text-sm text-muted-foreground flex items-center gap-2">
                                                            <Clock className="h-3 w-3" />
                                                            {program.duration} min
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant="outline">{program.category}</Badge>
                                                </TableCell>
                                                <TableCell>
                                                    <Select
                                                        value={program.status}
                                                        onValueChange={(value) => updateStatus(program, value, "status")}
                                                    >
                                                        <SelectTrigger
                                                            className={`w-28 h-6 text-xs rounded-3xl ${program.status === "Completed"
                                                                ? "bg-green-500 text-white"
                                                                : program.status === "Cancelled"
                                                                    ? "bg-red-500 text-white"
                                                                    : program.status === "Pending"
                                                                        ? "bg-yellow-500 text-black"
                                                                        : program.status === "Scheduled"
                                                                            ? "bg-blue-500 text-white"
                                                                            : "bg-gray-200 text-black"
                                                                }`}
                                                        >
                                                            <SelectValue placeholder="Status" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="Draft">Draft</SelectItem>
                                                            <SelectItem value="Pending">Pending</SelectItem>
                                                            <SelectItem value="Scheduled">Scheduled</SelectItem>
                                                            <SelectItem value="Cancelled">Cancelled</SelectItem>
                                                            <SelectItem value="Completed">Completed</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </TableCell>
                                                <TableCell>
                                                    <Select
                                                        value={program.resultStatus}
                                                        onValueChange={(value) => updateStatus(program, value, "resultStatus")}
                                                    >
                                                        <SelectTrigger
                                                            className={`w-28 h-6 text-xs rounded-3xl ${program.resultStatus === "completed"
                                                                ? "bg-green-500 text-white"
                                                                : program.resultStatus === "pending"
                                                                    ? "bg-yellow-500 text-black"
                                                                    : program.resultStatus === "processing"
                                                                        ? "bg-blue-500 text-white"
                                                                        : program.resultStatus === "archived"
                                                                            ? "bg-gray-500 text-white"
                                                                            : program.resultStatus === "published"
                                                                                ? "bg-purple-500 text-white"
                                                                                : "bg-gray-200 text-black"
                                                                }`}
                                                        >
                                                            <SelectValue placeholder="Result Status" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="pending">Pending</SelectItem>
                                                            <SelectItem value="processing">Processing</SelectItem>
                                                            <SelectItem value="completed">Completed</SelectItem>
                                                            <SelectItem value="archived">Archived</SelectItem>
                                                            <SelectItem value="published">Published</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <Link href={`/admin/judgment/${program._id}`}>
                                                        <Button variant="outline" size="sm">
                                                            <Edit className="mr-2 h-4 w-4" />
                                                            Mark Entry
                                                        </Button>
                                                    </Link>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => window.print()}
                                                        className="ml-2"
                                                    >
                                                        <Printer className="mr-2 h-4 w-4" />
                                                        Print
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        )
                                    })
                                )}
                            </TableBody>
                        </Table>
                    </div>

                    {/* Results Summary */}
                    {hasActiveFilters && (
                        <div className="mt-4 text-sm text-muted-foreground">
                            Showing {filteredPrograms.length} of {programs.length} programs
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}