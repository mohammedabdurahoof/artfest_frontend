"use client"

import { useState, useEffect } from "react"
import axios from "@/lib/axios"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Checkbox } from "@/components/ui/checkbox"
import { toast } from "@/hooks/use-toast"
import { Plus, Edit, Trash2, MoreHorizontal, Users, Calendar, MapPin, Clock, Users2, Folder, Folders } from "lucide-react"

// Types
interface Program {
    _id: string
    name: string
    programCode: string
    category: string
    venue: string
    date: string
    startingTime: string
    endingTime: string
    duration: number
    noOfParticipation: number
    candidatesPerParticipation: number
}

interface Curb {
    _id: string
    name: string
    maxCountOfProg: number
    programs: Program[]
}

interface CurbFormData {
    name: string
    maxCountOfProg: number
    programs: string[]
}

export default function CurbPage() {
    const [curbs, setCurbs] = useState<Curb[]>([])
    const [programs, setPrograms] = useState<Program[]>([])
    const [loading, setLoading] = useState(true)
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
    const [isManageProgramsDialogOpen, setIsManageProgramsDialogOpen] = useState(false)
    const [selectedCurb, setSelectedCurb] = useState<Curb | null>(null)
    const [curbToDelete, setCurbToDelete] = useState<Curb | null>(null)

    const [curbFormData, setCurbFormData] = useState<CurbFormData>({
        name: "",
        maxCountOfProg: 0,
        programs: []
    })

    const [searchTerm, setSearchTerm] = useState("")
    const [selectedPrograms, setSelectedPrograms] = useState<string[]>([])

    // Fetch curbs
    const fetchCurbs = async () => {
        try {
            setLoading(true)
            const response = await axios.get("/curbs")
            setCurbs(response.data.data || [])
        } catch (error) {
            console.error("Error fetching curbs:", error)
            toast({
                title: "Error",
                description: "Failed to fetch curbs",
                variant: "destructive",
            })
        } finally {
            setLoading(false)
        }
    }

    // Fetch programs
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

    useEffect(() => {
        fetchCurbs()
        fetchPrograms()
    }, [])

    // Reset form data
    const resetFormData = () => {
        setCurbFormData({
            name: "",
            maxCountOfProg: 0,
            programs: []
        })
        setSelectedPrograms([])
    }

    // Handle create curb
    const handleCreateCurb = async () => {
        try {
            if (!curbFormData.name.trim()) {
                toast({
                    title: "Validation Error",
                    description: "Please enter a curb name",
                    variant: "destructive",
                })
                return
            }

            if (curbFormData.maxCountOfProg <= 0) {
                toast({
                    title: "Validation Error",
                    description: "Maximum count of programs must be greater than 0",
                    variant: "destructive",
                })
                return
            }

            await axios.post("/curbs", curbFormData)

            toast({
                title: "Success",
                description: "Curb created successfully",
            })

            setIsCreateDialogOpen(false)
            resetFormData()
            fetchCurbs()
        } catch (error) {
            console.error("Error creating curb:", error)
            toast({
                title: "Error",
                description: "Failed to create curb",
                variant: "destructive",
            })
        }
    }

    // Handle edit curb
    const handleEditCurb = (curb: Curb) => {
        setSelectedCurb(curb)
        setCurbFormData({
            name: curb.name,
            maxCountOfProg: curb.maxCountOfProg,
            programs: curb.programs.map(p => p._id)
        })
        setSelectedPrograms(curb.programs.map(p => p._id))
        setIsEditDialogOpen(true)
    }

    // Handle update curb
    const handleUpdateCurb = async () => {
        try {
            if (!selectedCurb) return

            if (!curbFormData.name.trim()) {
                toast({
                    title: "Validation Error",
                    description: "Please enter a curb name",
                    variant: "destructive",
                })
                return
            }

            if (curbFormData.maxCountOfProg <= 0) {
                toast({
                    title: "Validation Error",
                    description: "Maximum count of programs must be greater than 0",
                    variant: "destructive",
                })
                return
            }

            await axios.patch(`/curbs/${selectedCurb._id}`, curbFormData)

            toast({
                title: "Success",
                description: "Curb updated successfully",
            })

            setIsEditDialogOpen(false)
            resetFormData()
            setSelectedCurb(null)
            fetchCurbs()
        } catch (error) {
            console.error("Error updating curb:", error)
            toast({
                title: "Error",
                description: "Failed to update curb",
                variant: "destructive",
            })
        }
    }

    // Handle delete curb
    const handleDeleteCurb = async () => {
        try {
            if (!curbToDelete) return

            await axios.delete(`/curbs/${curbToDelete._id}`)

            toast({
                title: "Success",
                description: "Curb deleted successfully",
            })

            setIsDeleteDialogOpen(false)
            setCurbToDelete(null)
            fetchCurbs()
        } catch (error) {
            console.error("Error deleting curb:", error)
            toast({
                title: "Error",
                description: "Failed to delete curb",
                variant: "destructive",
            })
        }
    }

    // Handle manage programs
    const handleManagePrograms = (curb: Curb) => {
        setSelectedCurb(curb)
        setSelectedPrograms(curb.programs.map(p => p._id))
        setIsManageProgramsDialogOpen(true)
    }

    // Handle update curb programs
    const handleUpdateCurbPrograms = async () => {
        try {
            if (!selectedCurb) return

            await axios.patch(`/curbs/${selectedCurb._id}`, {
                programs: selectedPrograms
            })

            toast({
                title: "Success",
                description: "Curb programs updated successfully",
            })

            setIsManageProgramsDialogOpen(false)
            setSelectedCurb(null)
            setSelectedPrograms([])
            fetchCurbs()
        } catch (error) {
            console.error("Error updating curb programs:", error)
            toast({
                title: "Error",
                description: "Failed to update curb programs",
                variant: "destructive",
            })
        }
    }

    // Handle program selection
    const handleProgramSelection = (programId: string, checked: boolean) => {
        if (checked) {
            setSelectedPrograms(prev => [...prev, programId])
            setCurbFormData(prev => ({ ...prev, programs: [...prev.programs, programId] }))
        } else {
            setSelectedPrograms(prev => prev.filter(id => id !== programId))
            setCurbFormData(prev => ({ ...prev, programs: prev.programs.filter(id => id !== programId) }))
        }
    }

    const removeProgramFromCurb = (curb: Curb, program: Program) => {
        setSelectedCurb((prev) =>
            prev
                ? {
                    ...prev,
                    programs: prev.programs.filter((p) => p._id !== program._id),
                }
                : prev
        );
        setCurbs((prev) =>
            prev.map((c) =>
                c._id === curb._id
                    ? { ...c, programs: c.programs.filter((p) => p._id !== program._id) }
                    : c
            )
        );
        // Optionally, update on server immediately:
        axios.patch(`/curbs/${curb._id}`, {
            programs: curb.programs.filter((p) => p._id !== program._id).map((p) => p._id),
        });
    }


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
                    <h1 className="text-3xl font-bold tracking-tight">Curbs Management</h1>
                    <p className="text-muted-foreground">
                        Manage curbs and assign programs to organize your art fest events.
                    </p>
                </div>
                <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                    <DialogTrigger asChild>
                        <Button onClick={resetFormData}>
                            <Plus className="mr-2 h-4 w-4" />
                            Add Curb
                        </Button>
                    </DialogTrigger>
                </Dialog>
            </div>

            {/* Curbs Grid */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {curbs.length === 0 ? (
                    <div className="col-span-full flex flex-col items-center justify-center py-12 text-center">
                        <Users className="h-12 w-12 text-muted-foreground mb-4" />
                        <h3 className="text-lg font-semibold mb-2">No curbs found</h3>
                        <p className="text-muted-foreground mb-4">Create your first curb to get started organizing programs.</p>
                        <Button onClick={() => setIsCreateDialogOpen(true)}>
                            <Plus className="mr-2 h-4 w-4" />
                            Add Curb
                        </Button>
                    </div>
                ) : (
                    curbs.map((curb) => (
                        <Card key={curb._id} className="hover:shadow-lg transition-shadow">
                            <CardHeader className="pb-3">
                                <div className="flex items-center justify-between">
                                    <div className="flex-1">
                                        <CardTitle className="text-xl">{curb.name}</CardTitle>
                                        <CardDescription className="mt-1">
                                            <div className="flex items-center gap-4 text-sm">
                                                <span className="flex items-center gap-1">
                                                    <Users className="h-3 w-3" />
                                                    {curb.programs.length}  programs
                                                </span>

                                                <span className="flex items-center gap-1">
                                                    <Folders className="h-3 w-3" />
                                                    Max Programs: {curb.maxCountOfProg}
                                                </span>
                                                {/* <Badge
                                                    variant={
                                                        curb.programs.length === curb.maxCountOfProg
                                                            ? "destructive"
                                                            : curb.programs.length >= curb.maxCountOfProg * 0.8
                                                                ? "default"
                                                                : "secondary"
                                                    }
                                                >
                                                    {Math.round((curb.programs.length / curb.maxCountOfProg) * 100)}% utilized
                                                </Badge> */}

                                            </div>
                                        </CardDescription>
                                    </div>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" className="h-8 w-8 p-0">
                                                <span className="sr-only">Open menu</span>
                                                <MoreHorizontal className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                            <DropdownMenuItem onClick={() => handleEditCurb(curb)}>
                                                <Edit className="mr-2 h-4 w-4" />
                                                Edit Curb
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => handleManagePrograms(curb)}>
                                                <Users className="mr-2 h-4 w-4" />
                                                Manage Programs
                                            </DropdownMenuItem>
                                            <DropdownMenuSeparator />
                                            <DropdownMenuItem
                                                className="text-red-600"
                                                onClick={() => {
                                                    setCurbToDelete(curb)
                                                    setIsDeleteDialogOpen(true)
                                                }}
                                            >
                                                <Trash2 className="mr-2 h-4 w-4" />
                                                Delete Curb
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>

                                {/* Progress Bar */}
                                {/* <div className="w-full bg-gray-200 rounded-full h-2 mt-3">
                                    <div
                                        className={`h-2 rounded-full transition-all duration-300 ${(curb.programs.length / curb.maxCountOfProg) * 100 >= 90
                                            ? 'bg-red-500'
                                            : (curb.programs.length / curb.maxCountOfProg) * 100 >= 70
                                                ? 'bg-yellow-500'
                                                : 'bg-green-500'
                                            }`}
                                        style={{
                                            width: `${Math.min((curb.programs.length / curb.maxCountOfProg) * 100, 100)}%`
                                        }}
                                    />
                                </div> */}
                                <hr />
                            </CardHeader>

                            <CardContent>
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <h4 className="font-medium text-sm">Assigned Programs</h4>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleManagePrograms(curb)}
                                        >
                                            <Plus className="h-3 w-3 mr-1" />
                                            Add
                                        </Button>
                                    </div>

                                    {curb.programs.length === 0 ? (
                                        <div className="text-center py-8 text-muted-foreground">
                                            <Calendar className="h-8 w-8 mx-auto mb-2 opacity-50" />
                                            <p className="text-sm">No programs assigned</p>
                                            <p className="text-xs">Click "Add" to assign programs</p>
                                        </div>
                                    ) : (
                                        <div className="space-y-2 max-h-64 overflow-y-auto">
                                            {curb.programs.map((program) => (
                                                <div
                                                    key={program._id}
                                                    className="flex items-center justify-between p-3 bg-muted/30 rounded-lg border hover:bg-muted/50 transition-colors"
                                                >
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <Badge variant="outline" className="text-xs font-mono">
                                                                {program.programCode}
                                                            </Badge>
                                                            <Badge variant="secondary" className="text-xs">
                                                                {program.category}
                                                            </Badge>
                                                        </div>
                                                        <h5 className="font-medium text-sm truncate">{program.name}</h5>
                                                        <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                                                           
                                                            <span className="flex items-center gap-1">
                                                                <Clock className="h-3 w-3" />
                                                                {program.duration}min
                                                            </span>
                                                            <span className="flex items-center gap-1">
                                                                <Users2 className="h-3 w-3" />
                                                                {program.noOfParticipation}×{program.candidatesPerParticipation}
                                                            </span>
                                                        </div>
                                                        
                                                    </div>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="ml-2"
                                                        onClick={() => removeProgramFromCurb(curb, program)}
                                                        aria-label="Remove Program"
                                                        title="Remove Program"
                                                    >
                                                        <span className="sr-only">Remove</span>
                                                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                                                            <path
                                                                d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z"
                                                                fill="currentColor"
                                                            />
                                                        </svg>
                                                    </Button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>

            {/* Create Curb Dialog */}
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>Create New Curb</DialogTitle>
                        <DialogDescription>
                            Add a new curb to organize and manage programs.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="create-name">Curb Name</Label>
                            <Input
                                id="create-name"
                                placeholder="Enter curb name"
                                value={curbFormData.name}
                                onChange={(e) => setCurbFormData({ ...curbFormData, name: e.target.value })}
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="create-maxCount">Maximum Programs</Label>
                            <Input
                                id="create-maxCount"
                                type="number"
                                min="1"
                                placeholder="Enter maximum number of programs"
                                value={curbFormData.maxCountOfProg || ""}
                                onChange={(e) => setCurbFormData({ ...curbFormData, maxCountOfProg: parseInt(e.target.value) || 0 })}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleCreateCurb}>Create Curb</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Edit Curb Dialog */}
            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>Edit Curb</DialogTitle>
                        <DialogDescription>
                            Update curb information and settings.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="edit-name">Curb Name</Label>
                            <Input
                                id="edit-name"
                                placeholder="Enter curb name"
                                value={curbFormData.name}
                                onChange={(e) => setCurbFormData({ ...curbFormData, name: e.target.value })}
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="edit-maxCount">Maximum Programs</Label>
                            <Input
                                id="edit-maxCount"
                                type="number"
                                min="1"
                                placeholder="Enter maximum number of programs"
                                value={curbFormData.maxCountOfProg || ""}
                                onChange={(e) => setCurbFormData({ ...curbFormData, maxCountOfProg: parseInt(e.target.value) || 0 })}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleUpdateCurb}>Update Curb</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Manage Programs Dialog */}
            <Dialog open={isManageProgramsDialogOpen} onOpenChange={setIsManageProgramsDialogOpen}>
                <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Manage Programs - {selectedCurb?.name}</DialogTitle>
                        <DialogDescription>
                            Select programs to assign to this curb. Maximum: {selectedCurb?.maxCountOfProg} programs.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4">
                        <div className="flex items-center gap-4">
                            <div className="flex-1">
                                <Input
                                    placeholder="Search programs..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                            <Badge variant="outline">
                                Selected: {selectedPrograms.length}
                            </Badge>
                        </div>

                        <div className="grid gap-2 max-h-96 overflow-y-auto border rounded-lg p-4">
                            {programs.filter(program =>
                                program.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                program.programCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                program.category.toLowerCase().includes(searchTerm.toLowerCase())
                            ).map((program) => (
                                <div key={program._id} className="flex items-center space-x-2 p-2 border rounded">
                                    <Checkbox
                                        id={program._id}
                                        checked={selectedPrograms.includes(program._id)}
                                        onCheckedChange={(checked) => handleProgramSelection(program._id, checked as boolean)}
                                    />
                                    <div className="flex-1 grid grid-cols-4 gap-4">
                                        <div>
                                            <div className="font-medium">{program.name}</div>
                                            <div className="text-sm text-muted-foreground">{program.programCode}</div>
                                        </div>
                                        <div className="text-sm">
                                            <Badge variant="outline">{program.category}</Badge>
                                        </div>
                                        <div className="text-sm text-muted-foreground">
                                            {program.venue}
                                        </div>
                                        <div className="text-sm text-muted-foreground">
                                            {program.date && new Date(program.date).toLocaleDateString()}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsManageProgramsDialogOpen(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleUpdateCurbPrograms}>
                            Update Programs
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete Curb</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete "{curbToDelete?.name}"? This action cannot be undone.
                            All programs assigned to this curb will be unassigned.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
                            Cancel
                        </Button>
                        <Button variant="destructive" onClick={handleDeleteCurb}>
                            Delete
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}