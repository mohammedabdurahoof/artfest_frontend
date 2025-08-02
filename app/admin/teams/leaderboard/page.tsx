"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "@/hooks/use-toast"
import { Trophy, Medal, Award, Target, TrendingUp, Users, ArrowLeft } from "lucide-react"
import axiosInstance from "@/lib/axios"
import type { Team, Category } from "@/types"
import Link from "next/link"

interface TeamWithRank extends Team {
  rank: number
}

export default function LeaderboardPage() {
  const [teams, setTeams] = useState<TeamWithRank[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState<Category | "all">("all")

  const categories: (Category | "all")[] = ["all", "Bidaya", "Ula", "Thaniyya", "Thanawiyya", "Aliya"]

  useEffect(() => {
    fetchTeams()
  }, [])

  const fetchTeams = async () => {
    try {
      const response = await axiosInstance.get("/teams")
      const teamsData = response.data.data || response.data

      // Sort teams by total points and add rank
      const sortedTeams = teamsData
        .sort((a: Team, b: Team) => b.totalPoint - a.totalPoint)
        .map((team: Team, index: number) => ({
          ...team,
          rank: index + 1,
        }))

      setTeams(sortedTeams)
    } catch (error) {
      console.error("Error fetching teams:", error)
      toast({
        title: "Error",
        description: "Failed to fetch leaderboard data",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="h-6 w-6 text-yellow-500" />
      case 2:
        return <Medal className="h-6 w-6 text-gray-400" />
      case 3:
        return <Award className="h-6 w-6 text-amber-600" />
      default:
        return <span className="text-lg font-bold text-muted-foreground">#{rank}</span>
    }
  }

  const getRankBadgeVariant = (rank: number) => {
    switch (rank) {
      case 1:
        return "default"
      case 2:
        return "secondary"
      case 3:
        return "outline"
      default:
        return "outline"
    }
  }

  const getFilteredTeams = () => {
    if (selectedCategory === "all") {
      return teams
    }

    // Filter teams based on category points
    return teams
      .filter((team) => team.categoriesPoint && team.categoriesPoint[selectedCategory] > 0)
      .sort((a, b) => {
        const aPoints = a.categoriesPoint?.[selectedCategory] || 0
        const bPoints = b.categoriesPoint?.[selectedCategory] || 0
        return bPoints - aPoints
      })
      .map((team, index) => ({
        ...team,
        rank: index + 1,
      }))
  }

  const filteredTeams = getFilteredTeams()
  const topTeam = filteredTeams[0]
  const totalPoints = teams.reduce((sum, team) => sum + team.totalPoint, 0)

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
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
          <h1 className="text-3xl font-bold">Team Leaderboard</h1>
          <p className="text-muted-foreground">Current standings and team performance</p>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
            <CardTitle className="text-sm font-medium">Leading Team</CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{topTeam?.name || "N/A"}</div>
            <p className="text-xs text-muted-foreground">{topTeam?.totalPoint || 0} points</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Points</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalPoints}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Points</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{teams.length > 0 ? Math.round(totalPoints / teams.length) : 0}</div>
          </CardContent>
        </Card>
      </div>

      {/* Category Filter */}
      <div className="flex items-center gap-4">
        <label className="text-sm font-medium">Filter by Category:</label>
        <Select value={selectedCategory} onValueChange={(value) => setSelectedCategory(value as Category | "all")}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {categories.map((category) => (
              <SelectItem key={category} value={category}>
                {category === "all" ? "All Categories" : category}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Leaderboard */}
      <div className="grid gap-4">
        {filteredTeams.map((team) => (
          <Card
            key={team._id}
            className={`transition-all hover:shadow-md ${team.rank <= 3 ? "ring-2 ring-primary/20" : ""}`}
          >
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex items-center justify-center w-12 h-12">{getRankIcon(team.rank)}</div>
                  <div className="flex items-center gap-3">
                    <div
                      className="w-6 h-6 rounded-full border-2 border-white shadow-sm"
                      style={{ backgroundColor: team.color }}
                    />
                    <div>
                      <h3 className="text-xl font-semibold">{team.name}</h3>
                      <p className="text-sm text-muted-foreground">Leader: {team.leader}</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="text-2xl font-bold">
                      {selectedCategory === "all" ? team.totalPoint : team.categoriesPoint?.[selectedCategory] || 0}
                    </div>
                    <p className="text-sm text-muted-foreground">points</p>
                  </div>
                  <Badge variant={getRankBadgeVariant(team.rank)} className="text-lg px-3 py-1">
                    #{team.rank}
                  </Badge>
                </div>
              </div>

              {/* Category breakdown for "all" view */}
              {selectedCategory === "all" && team.categoriesPoint && (
                <div className="mt-4 pt-4 border-t">
                  <div className="grid grid-cols-5 gap-2">
                    {Object.entries(team.categoriesPoint).map(([category, points]) => (
                      <div key={category} className="text-center">
                        <div className="text-sm font-medium">{points}</div>
                        <div className="text-xs text-muted-foreground">{category}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Assistant leaders */}
              {team.asstLeaders && team.asstLeaders.length > 0 && (
                <div className="mt-3 pt-3 border-t">
                  <div className="flex flex-wrap gap-1">
                    <span className="text-xs text-muted-foreground mr-2">Assistant Leaders:</span>
                    {team.asstLeaders.map((leader, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {leader}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredTeams.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <Trophy className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No teams found</h3>
            <p className="text-muted-foreground">
              {selectedCategory === "all"
                ? "No teams have been created yet."
                : `No teams have points in the ${selectedCategory} category.`}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
