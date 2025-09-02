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
import { Search, Edit, FileText, Clock, Filter, X, Printer } from "lucide-react"
import Link from "next/link"
import { Judgment, Participation, Program, Team } from "@/types"
import { MultiSelect } from "@/components/ui/multiselect" // You need to implement or use a multiselect component
import { useAuth } from "@/components/auth-provider"


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
    const [result, setResult] = useState<{ program: Program | null; participation: Participation | null }[]>([])
    const [selectedResultStatuses, setSelectedResultStatuses] = useState<string[]>(["all"]);
    const [selectedCategories, setSelectedCategories] = useState<string[]>(["all"]);
    const [teamPoints, setTeamPoints] = useState<Team[]>([]);

    useEffect(() => {
        fetchJudgments()
        fetchParticipations()
        fetchPrograms()
    }, [])

    const { hasPermission } = useAuth()

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

    const updateStatus = async (program: Program, value: string) => {
        try {
            await axios.patch(`/programs/${program._id}`, { status: value })
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

    const updateResultStatus = async (program: Program, value: string) => {
        try {
            await axios.patch(`/programs/change_result_status/${program._id}`, { resultStatus: value })
            toast({
                title: "Success",
                description: "Program result status updated",
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

    // Fetch team points based on filters
    useEffect(() => {
        const fetchTeamPoints = async () => {
            try {
                const res = await axios.get("/teams");
                setTeamPoints(res.data.teams || []);
            } catch (error) {
                toast({
                    title: "Error",
                    description: "Failed to fetch team points",
                    variant: "destructive",
                });
            }
        };
        fetchTeamPoints();
    }, [selectedResultStatuses, selectedCategories]);


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

    const printAllResultStatuses = async () => {
        const programIds = filteredPrograms.map(program => program._id)
        try {
            setLoading(true)
            const result = await axios.post("/programs/bulk_result", { programIds })
            const printWindow = window.open('', '', 'width=900,height=600');
            if (printWindow) {
                // Sort teams by totalPoint[resultStatusFilter] descending
                const sortedTeams = [...result.data.team].sort((a: Team, b: Team) => {
                    const pointsA = resultStatusFilter === 'all'
                        ? (a.totalPoint?.completed ?? 0) +
                        (a.totalPoint?.archived ?? 0) +
                        (a.totalPoint?.published ?? 0)
                        : (a.totalPoint?.[resultStatusFilter] ?? 0) + (resultStatusFilter !== 'published' ? a.totalPoint?.published ?? 0 : 0);
                    const pointsB = resultStatusFilter === 'all'
                        ? (b.totalPoint?.completed ?? 0) +
                        (b.totalPoint?.archived ?? 0) +
                        (b.totalPoint?.published ?? 0)
                        : (b.totalPoint?.[resultStatusFilter] ?? 0) + (resultStatusFilter !== 'published' ? b.totalPoint?.published ?? 0 : 0);
                    return pointsB - pointsA;
                });

                // Calculate total points of all teams
                const totalPoints = sortedTeams.reduce((sum, team) => {
                    return sum + (team.totalPoint?.[resultStatusFilter] ?? 0) + (resultStatusFilter !== 'published' ? team.totalPoint?.published ?? 0 : 0);
                }, 0);

                printWindow.document.write(`
                    <!DOCTYPE html>
                    <html lang="en">

                    <head>
                    <meta charset="UTF-8">
                    <title>Mafeeh - Result</title>
                    <style>
                        body {
                        font-family: Arial, Helvetica, sans-serif;
                        font-size: 14px;
                        margin: 40px;
                        color: #000;
                        }

                        h1,
                        h2,
                        h3 {
                        text-align: center;
                        margin: 0;
                        padding: 0;
                        }

                        h1 {
                        font-size: 32px;
                        font-weight: bold;
                        margin-bottom: 5px;
                        }

                        h2 {
                        font-size: 28px;
                        font-weight: normal;
                        margin-bottom: 20px;
                        }

                        table {
                        width: 100%;
                        border-collapse: collapse;
                        margin-bottom: 25px;
                        }

                        th,
                        td {
                        border: 1px solid #000;
                        padding: 6px 10px;
                        text-align: center;
                        }

                        th {
                        background: #f2f2f2;
                        font-weight: bold;
                         -webkit-print-color-adjust: exact;
                        }

                        .section-title {
                        font-size: 14px;
                        font-weight: bold;
                        margin: 25px 0 0px 0;
                        text-align: center;
                        background-color: #000;
                        color: #fff;
                        padding: 7px;
                         -webkit-print-color-adjust: exact;
                        }

                        .footer-note {
                        font-size: 12px;
                        margin-top: 30px;
                        text-align: center;
                        }
                        @media print {
                            table {
                                page-break-inside: avoid; /* keep entire table together */
                            }
                            tr {
                                page-break-inside: avoid; /* keep row together */
                                page-break-after: auto;
                            }
                            thead {
                                display: table-header-group; /* repeat header on each new page */
                            }
                            tfoot {
                                display: table-footer-group; /* repeat footer if needed */
                            }
                        }

                        .grand-total-table {
                            width: 50%;
                        }

                        .grand-total {
                            font-weight: bold;
                            text-align: center;
                            display: flex;
                            justify-content: center;  /* Horizontal center */
                            align-items: center; /* Vertical center */
                        }
                        .category-total {
                            font-weight: bold;
                            text-align: center;
                            display: flex;
                            flex-wrap: wrap;
                            justify-content: center;  /* Horizontal center */
                            align-items: center; /* Vertical center */
                            gap: 10px;
                        }

                        .category-total > table {
                            width: 48%;
                        }
                    </style>
                    </head>

                    <body>
                    <h1>MAFEEH 2025</h1>
                    <h2>NAHJ ART FEST</h2>
                    <h3>RESULTS (${resultStatusFilter})</h3>

                    ${(() => {
                        // Group programs in pairs of 2 for each row
                        const programTables = result.data.data.map((data: { program: Program, participations: Participation[] }) => {
                            // Sort participations by position.rank, then grade?.category
                            const sortedParticipations = [...data.participations].sort((a, b) => {
                                const rankA = a.position?.rank ?? 9999;
                                const rankB = b.position?.rank ?? 9999;
                                if (rankA !== rankB) return rankA - rankB;
                                const gradeA = a.grade?.category ?? '';
                                const gradeB = b.grade?.category ?? '';
                                return gradeA.localeCompare(gradeB);
                            });
                            return `
                                <table>
                                <thead>
                                    <tr>
                                        <th class="section-title" colspan="5">
                                            ${data.program.programCode} - ${data.program.name} | ${data.program.category}
                                        </th>
                                    </tr>
                                    <tr>
                                        <th>Position</th>
                                        <th>Grade</th>
                                        <th>Chest No.</th>
                                        <th>Name</th>
                                        <th>Team</th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    ${sortedParticipations.map((participation: Participation) => `
                                        <tr>
                                            <td>${participation.position?.rank || '-'}</td>
                                            <td>${participation.grade?.category || '-'}</td>
                                            <td>${participation.candidateId[0].chestNo}</td>
                                            <td>${participation.candidateId[0].name}${participation.candidateId[1] ? ' & Team' : ''}</td>
                                            <td>${participation.team.name}</td>
                                        </tr>
                                    `).join('')}
                                    </tbody>
                                </table>`;
                        });

                        // Group tables in pairs
                        let html = '';
                        for (let i = 0; i < programTables.length; i += 2) {
                            html += `<div class="programs-row">`;
                            html += programTables[i];
                            if (programTables[i + 1]) html += programTables[i + 1];
                            html += `</div>`;
                        }
                        return html;
                    })()}

                        <h4 style="text-align: center; font-size: 24px;">No of Programs : ${(filteredPrograms.length ?? 0) + (resultStatusFilter !== 'published' ? programs.filter(p => p.resultStatus === 'published').length : 0)}</h4>
                        <h4 style="text-align: center; font-size: 24px;">Total Points : ${totalPoints}</h4>

                    <div class="grand-total">
                        <table class="grand-total-table">
                    <thead>
                        <tr>
                            <th class="section-title" colspan="5">
                                Grand Total
                            </th>
                        </tr>
                        <tr>
                            <th>Position</th>
                            <th>Team</th>
                            <th>Points</th>
                        </tr>
                        </thead>
                        <tbody>
                        ${sortedTeams.map((team: Team, index: number) => `
                            <tr>
                                <td>${index + 1}</td>
                                <td>${team.name || '-'}</td>
                                <td>
                                    ${resultStatusFilter === 'all'
                            ? (team.totalPoint?.completed ?? 0) +
                            (team.totalPoint?.archived ?? 0) +
                            (team.totalPoint?.published ?? 0)
                            : (team.totalPoint?.[resultStatusFilter] ?? 0) + (resultStatusFilter !== 'published' ? team.totalPoint?.published ?? 0 : 0)
                        }
                                </td>
                        
                            </tr>
                        `).join('')}
                        </tbody>
                    </table>
                    </div>
                    <div class="category-total">

                    ${categories.filter(c => c !== 'all').map(category => `<table class="grand-total-table">
                                <thead>
                                    <tr>
                                        <th class="section-title" colspan="5">
                                            ${category}
                                        </th>
                                    </tr>
                                    <tr>
                                        <th>Position</th>
                                        <th>Team</th>
                                        <th>Points</th>
                                    </tr>
                                </thead>
                                <tbody>
                                ${sortedTeams.map((team: Team, index: number) => {
                                // Calculate points for this category and resultStatusFilter
                                let categoryPoints = 0;
                                if (team.categoriesPoint && team.categoriesPoint[category]) {
                                    if (resultStatusFilter === 'all') {
                                        categoryPoints =
                                            (team.categoriesPoint[category]?.completed ?? 0) +
                                            (team.categoriesPoint[category]?.archived ?? 0) +
                                            (team.categoriesPoint[category]?.published ?? 0);
                                    } else {
                                        categoryPoints =
                                            (team.categoriesPoint[category]?.[resultStatusFilter] ?? 0) +
                                            (resultStatusFilter !== 'published' ? team.categoriesPoint[category]?.published ?? 0 : 0);
                                    }
                                }
                                return `
                                        <tr>
                                            <td>${index + 1}</td>
                                            <td>${team.name || '-'}</td>
                                            <td>${categoryPoints}</td>
                                        </tr>
                                    `;
                            }).join('')}
                            </tbody>
                            </table>`
                        ).join('')}
                    </div>
                    
                    <div class="footer-note">
                    Result Generated @ ${new Date().toLocaleString()}
                </div>
                    </body >

                    </html >
                `);
                printWindow.document.close();
                printWindow.focus();
                // printWindow.print();
            }
        } catch (error) {
            console.error("Error printing all result statuses:", error)
            toast({
                title: "Error",
                description: "Failed to print result statuses.",
                variant: "destructive"
            })
        } finally {
            setLoading(false)
        }
    }


    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        )
    }

    // Filter display helpers
    const resultStatusDisplay = selectedResultStatuses.length === 0
        ? "All"
        : selectedResultStatuses.join(" + ");
    const categoryDisplay = selectedCategories.length === 0
        ? "All"
        : selectedCategories.join(" + ");

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
                </div>
            </div>

            {/* Team Points Card */}
            {hasPermission('view_team_points') && (
                <Card>
                    <CardHeader>
                        <CardTitle>Team Points</CardTitle>
                        <CardDescription>
                            Showing team points for result status: <b>{resultStatusDisplay}</b>
                            {categoryDisplay !== "All" && (
                                <> &nbsp;|&nbsp; Category: <b>{categoryDisplay}</b></>
                            )}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex gap-4 mb-4">
                            <MultiSelect
                                options={resultStatuses.filter(s => s !== "all")}
                                selected={selectedResultStatuses.filter(s => s !== "all")}
                                onChange={setSelectedResultStatuses}
                                placeholder="Select Result Status(es)"
                            />
                            <MultiSelect
                                options={categories.filter(c => c !== "all")}
                                selected={selectedCategories.filter(s => s !== "all")}
                                onChange={setSelectedCategories}
                                placeholder="Select Category(ies)"
                            />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {selectedResultStatuses.length === 0 || selectedCategories.length === 0 ? (
                                <div className="col-span-3 text-center text-muted-foreground">
                                    No selection. Points: 0
                                </div>
                            ) : (
                                teamPoints.map(team => (
                                    <Card key={team._id} className="border shadow-sm">
                                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                            <CardTitle className="text-lg font-bold">{team.name}</CardTitle>
                                            <Badge variant="outline">{team.color}</Badge>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="text-2xl font-bold">
                                                {selectedResultStatuses.length === 0 || selectedCategories.length === 0
                                                    ? 0
                                                    : selectedResultStatuses.reduce((sum, status) => sum + (team.totalPoint?.[status] ?? 0), 0)
                                                }
                                            </div>
                                            <div className="text-xs text-muted-foreground">
                                                Points ({selectedResultStatuses.join(" + ") || "None"})
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))
                            )}
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {teamPoints.map(team => (
                                <Card key={team._id} className="border shadow-sm">
                                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                        <CardTitle className="text-lg font-bold">{team.name}</CardTitle>
                                        <Badge variant="outline">{team.color}</Badge>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-2xl font-bold">
                                            {selectedResultStatuses.length === 0 || selectedResultStatuses.includes("all")
                                                ? Object.values(team.totalPoint || {}).reduce((a, b) => a + b, 0)
                                                : selectedResultStatuses.reduce((sum, status) => sum + (team.totalPoint?.[status] ?? 0), 0)
                                            }
                                        </div>
                                        <div className="text-xs text-muted-foreground">
                                            Points ({resultStatusDisplay})
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </CardContent>
                </Card>)}

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

                    {/* Print All Filtered Results Button */}
                    <div className="flex justify-end mb-4">
                        <Button
                            variant="default"
                            size="sm"
                            onClick={printAllResultStatuses}
                        >
                            <Printer className="mr-2 h-4 w-4" />
                            Print All Filtered Results
                        </Button>
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
                                                        onValueChange={(value) => updateStatus(program, value)}
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
                                                                } `}
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
                                                    {program.resultStatus === "pending" || program.resultStatus === "Pending" ? (
                                                        <>
                                                            <div className="w-28 h-6 text-xs rounded-3xl bg-yellow-500 text-white text-center p-1">Pending</div>
                                                        </>
                                                    ) : program.resultStatus === "processing" ? (
                                                        <div className="w-28 h-6 text-xs rounded-3xl bg-blue-500 text-white text-center p-1">Processing</div>
                                                    ) : (
                                                        <Select
                                                            value={program.resultStatus}
                                                            onValueChange={(value) => updateResultStatus(program, value)}
                                                        >
                                                            <SelectTrigger
                                                                className={`w-28 h-6 text-xs rounded-3xl ${program.resultStatus === "completed"
                                                                    ? "bg-green-500 text-white"
                                                                    : program.resultStatus === "archived"
                                                                        ? "bg-gray-500 text-white"
                                                                        : program.resultStatus === "published"
                                                                            ? "bg-purple-500 text-white"
                                                                            : "bg-gray-200 text-black"
                                                                    } `}
                                                            >
                                                                <SelectValue placeholder="Result Status" />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                <SelectItem value="completed">Completed</SelectItem>
                                                                <SelectItem value="archived">Archived</SelectItem>
                                                                <SelectItem value="published">Published</SelectItem>
                                                            </SelectContent>
                                                        </Select>
                                                    )}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <Link href={`/admin/judgment/${program._id}`}>
                                                        <Button variant="outline" size="sm">
                                                            <Edit className="mr-2 h-4 w-4" />
                                                            Mark Entry
                                                        </Button>
                                                    </Link>
                                                </TableCell>
                                            </TableRow>
                                        )
                                    })
                                )}
                            </TableBody>
                        </Table>
                    </div>

                    {/* Results Summary */}
                    {
                        hasActiveFilters && (
                            <div className="mt-4 text-sm text-muted-foreground">
                                Showing {filteredPrograms.length} of {programs.length} programs
                            </div>
                        )
                    }
                </CardContent >
            </Card >


        </div >
    )
}