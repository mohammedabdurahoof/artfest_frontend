"use client"

import type React from "react"

import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { toast } from "@/hooks/use-toast"
import { ArrowLeft, Upload, Download, FileText, CheckCircle, XCircle, AlertCircle, Loader2 } from "lucide-react"
import Link from "next/link"
import axiosInstance from "@/lib/axios"
import type { Team, Category } from "@/types"

interface ImportStudent {
  name: string
  chestNo: string
  class: string
  category: Category
  teamName: string
  teamId?: string
  status: "pending" | "success" | "error"
  error?: string
}

export default function ImportStudentsPage() {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [loading, setLoading] = useState(false)
  const [importing, setImporting] = useState(false)
  const [progress, setProgress] = useState(0)
  const [students, setStudents] = useState<ImportStudent[]>([])
  const [teams, setTeams] = useState<Team[]>([])
  const [validationErrors, setValidationErrors] = useState<string[]>([])

  const downloadTemplate = () => {
    const csvContent = `Name,Chest Number,Class,Category,Team Name
Ahmed Ali,A001,10th Grade,Thanawiyya,Red Team
Fatima Hassan,B002,12th Grade,Aliya,Blue Team
Omar Ibrahim,C003,8th Grade,Ula,Green Team`

    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "students_template.csv"
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)
  }

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (!file.name.endsWith(".csv")) {
      toast({
        title: "Invalid File",
        description: "Please upload a CSV file",
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    setValidationErrors([])

    try {
      // Fetch teams first
      const teamsResponse = await axiosInstance.get("/teams")
      const teamsData = teamsResponse.data.data || []
      setTeams(teamsData)

      const text = await file.text()
      const lines = text.split("\n").filter((line) => line.trim())
      const headers = lines[0].split(",").map((h) => h.trim())

      const expectedHeaders = ["Name", "Chest Number", "Class", "Category", "Team Name"]
      const headerValid = expectedHeaders.every((header) =>
        headers.some((h) => h.toLowerCase().includes(header.toLowerCase())),
      )

      if (!headerValid) {
        setValidationErrors(["Invalid CSV format. Please use the provided template."])
        setLoading(false)
        return
      }

      const parsedStudents: ImportStudent[] = []
      const errors: string[] = []

      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(",").map((v) => v.trim())
        if (values.length < 5) continue

        const [name, chestNo, studentClass, category, teamName] = values

        // Find team
        const team = teamsData.find((t: Team) => t.name.toLowerCase() === teamName.toLowerCase())

        const student: ImportStudent = {
          name,
          chestNo,
          class: studentClass,
          category: category as Category,
          teamName,
          teamId: team?._id,
          status: "pending",
        }

        // Validation
        if (!name || !chestNo || !studentClass || !category || !teamName) {
          student.status = "error"
          student.error = "Missing required fields"
          errors.push(`Row ${i + 1}: Missing required fields`)
        } else if (!["Bidaya", "Ula", "Thaniyya", "Thanawiyya", "Aliya"].includes(category)) {
          student.status = "error"
          student.error = "Invalid category"
          errors.push(`Row ${i + 1}: Invalid category "${category}"`)
        } else if (!team) {
          student.status = "error"
          student.error = "Team not found"
          errors.push(`Row ${i + 1}: Team "${teamName}" not found`)
        }

        parsedStudents.push(student)
      }

      setStudents(parsedStudents)
      setValidationErrors(errors)
    } catch (error) {
      console.error("Error parsing CSV:", error)
      toast({
        title: "Error",
        description: "Failed to parse CSV file",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleImport = async () => {
    const validStudents = students.filter((s) => s.status !== "error")
    if (validStudents.length === 0) {
      toast({
        title: "No Valid Students",
        description: "Please fix validation errors before importing",
        variant: "destructive",
      })
      return
    }

    setImporting(true)
    setProgress(0)

    try {
      for (let i = 0; i < validStudents.length; i++) {
        const student = validStudents[i]

        try {
          await axiosInstance.post("/students", {
            name: student.name,
            chestNo: student.chestNo,
            class: student.class,
            category: student.category,
            teamId: student.teamId,
          })

          student.status = "success"
        } catch (error: any) {
          student.status = "error"
          student.error = error.response?.data?.message || "Import failed"
        }

        setProgress(((i + 1) / validStudents.length) * 100)
        setStudents([...students])
      }

      const successCount = students.filter((s) => s.status === "success").length
      const errorCount = students.filter((s) => s.status === "error").length

      toast({
        title: "Import Complete",
        description: `${successCount} students imported successfully. ${errorCount} failed.`,
      })

      if (successCount > 0) {
        setTimeout(() => {
          router.push("/admin/students")
        }, 2000)
      }
    } catch (error) {
      console.error("Error importing students:", error)
      toast({
        title: "Import Failed",
        description: "An error occurred during import",
        variant: "destructive",
      })
    } finally {
      setImporting(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "success":
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case "error":
        return <XCircle className="h-4 w-4 text-red-600" />
      default:
        return <AlertCircle className="h-4 w-4 text-yellow-600" />
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "success":
        return <Badge className="bg-green-100 text-green-800">Success</Badge>
      case "error":
        return <Badge variant="destructive">Error</Badge>
      default:
        return <Badge variant="secondary">Pending</Badge>
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
          <h1 className="text-3xl font-bold tracking-tight">Import Students</h1>
          <p className="text-muted-foreground">Bulk import students from CSV file</p>
        </div>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Upload CSV File</CardTitle>
            <CardDescription>
              Upload a CSV file containing student information. Download the template to see the required format.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-4">
              <Button onClick={downloadTemplate} variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Download Template
              </Button>
              <Button onClick={() => fileInputRef.current?.click()} disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4 mr-2" />
                    Upload CSV
                  </>
                )}
              </Button>
            </div>

            <Input ref={fileInputRef} type="file" accept=".csv" onChange={handleFileUpload} className="hidden" />

            {validationErrors.length > 0 && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <div className="space-y-1">
                    <p className="font-medium">Validation Errors:</p>
                    <ul className="list-disc list-inside space-y-1">
                      {validationErrors.map((error, index) => (
                        <li key={index} className="text-sm">
                          {error}
                        </li>
                      ))}
                    </ul>
                  </div>
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        {students.length > 0 && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Preview & Import</CardTitle>
                  <CardDescription>Review the students before importing. Fix any errors shown below.</CardDescription>
                </div>
                <Button
                  onClick={handleImport}
                  disabled={importing || students.filter((s) => s.status !== "error").length === 0}
                >
                  {importing ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Importing...
                    </>
                  ) : (
                    <>
                      <FileText className="h-4 w-4 mr-2" />
                      Import Students
                    </>
                  )}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {importing && (
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Import Progress</span>
                    <span className="text-sm text-muted-foreground">{Math.round(progress)}%</span>
                  </div>
                  <Progress value={progress} className="w-full" />
                </div>
              )}

              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Status</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Chest No</TableHead>
                      <TableHead>Class</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Team</TableHead>
                      <TableHead>Error</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {students.map((student, index) => (
                      <TableRow key={index}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getStatusIcon(student.status)}
                            {getStatusBadge(student.status)}
                          </div>
                        </TableCell>
                        <TableCell className="font-medium">{student.name}</TableCell>
                        <TableCell>{student.chestNo}</TableCell>
                        <TableCell>{student.class}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{student.category}</Badge>
                        </TableCell>
                        <TableCell>{student.teamName}</TableCell>
                        <TableCell>
                          {student.error && <span className="text-sm text-red-600">{student.error}</span>}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
