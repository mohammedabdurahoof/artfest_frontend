"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Users, Calendar, Trophy, UserCheck, Award, Clock, Target, TrendingUp } from "lucide-react"

export default function Dashboard() {
  const stats = [
    {
      title: "Total Students",
      value: "1,234",
      change: "+12%",
      icon: Users,
      color: "text-blue-600",
    },
    {
      title: "Active Programs",
      value: "45",
      change: "+3",
      icon: Calendar,
      color: "text-green-600",
    },
    {
      title: "Teams",
      value: "8",
      change: "0",
      icon: Trophy,
      color: "text-purple-600",
    },
    {
      title: "Judges",
      value: "24",
      change: "+2",
      icon: UserCheck,
      color: "text-orange-600",
    },
  ]

  const recentPrograms = [
    {
      name: "Classical Dance",
      category: "Thanawiyya",
      participants: 12,
      status: "ongoing",
      time: "10:30 AM",
    },
    {
      name: "Quranic Recitation",
      category: "Aliya",
      participants: 8,
      status: "completed",
      time: "09:00 AM",
    },
    {
      name: "Arabic Poetry",
      category: "Ula",
      participants: 15,
      status: "upcoming",
      time: "02:00 PM",
    },
    {
      name: "Group Song",
      category: "Bidaya",
      participants: 20,
      status: "ongoing",
      time: "11:15 AM",
    },
  ]

  const teamStandings = [
    { name: "Red Team", points: 245, position: 1, color: "bg-red-500" },
    { name: "Blue Team", points: 238, position: 2, color: "bg-blue-500" },
    { name: "Green Team", points: 225, position: 3, color: "bg-green-500" },
    { name: "Yellow Team", points: 210, position: 4, color: "bg-yellow-500" },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">Welcome to ArtFest Admin Dashboard. Here's what's happening today.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-green-600">{stat.change}</span> from last month
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Recent Programs */}
        <Card className="col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Today's Programs
            </CardTitle>
            <CardDescription>Current and upcoming programs for today</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentPrograms.map((program, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium">{program.name}</h4>
                      <Badge variant="outline">{program.category}</Badge>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        {program.participants} participants
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {program.time}
                      </span>
                    </div>
                  </div>
                  <Badge
                    variant={
                      program.status === "completed"
                        ? "default"
                        : program.status === "ongoing"
                          ? "destructive"
                          : "secondary"
                    }
                  >
                    {program.status}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Team Standings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5" />
              Team Standings
            </CardTitle>
            <CardDescription>Current leaderboard positions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {teamStandings.map((team) => (
                <div key={team.name} className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-muted text-sm font-medium">
                    {team.position}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <div className={`w-3 h-3 rounded-full ${team.color}`} />
                      <span className="font-medium">{team.name}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">{team.points} points</span>
                      <Progress value={(team.points / 250) * 100} className="w-16 h-2" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Quick Actions
          </CardTitle>
          <CardDescription>Frequently used actions and shortcuts</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card className="cursor-pointer hover:bg-muted/50 transition-colors">
              <CardContent className="flex items-center gap-3 p-4">
                <Users className="h-8 w-8 text-blue-600" />
                <div>
                  <h4 className="font-medium">Add Student</h4>
                  <p className="text-sm text-muted-foreground">Register new student</p>
                </div>
              </CardContent>
            </Card>
            <Card className="cursor-pointer hover:bg-muted/50 transition-colors">
              <CardContent className="flex items-center gap-3 p-4">
                <Calendar className="h-8 w-8 text-green-600" />
                <div>
                  <h4 className="font-medium">Create Program</h4>
                  <p className="text-sm text-muted-foreground">Add new program</p>
                </div>
              </CardContent>
            </Card>
            <Card className="cursor-pointer hover:bg-muted/50 transition-colors">
              <CardContent className="flex items-center gap-3 p-4">
                <Award className="h-8 w-8 text-purple-600" />
                <div>
                  <h4 className="font-medium">Enter Results</h4>
                  <p className="text-sm text-muted-foreground">Update program results</p>
                </div>
              </CardContent>
            </Card>
            <Card className="cursor-pointer hover:bg-muted/50 transition-colors">
              <CardContent className="flex items-center gap-3 p-4">
                <TrendingUp className="h-8 w-8 text-orange-600" />
                <div>
                  <h4 className="font-medium">View Reports</h4>
                  <p className="text-sm text-muted-foreground">Generate reports</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
