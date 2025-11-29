"use client"

import { useEffect, useState } from "react"
import { CitizenNav } from "@/components/citizen-nav" // if your nav name differs, adjust this import
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { MapPin, Calendar, AlertTriangle, CheckCircle, Clock, PlusCircle } from "lucide-react"
import Link from "next/link"
import type { Issue } from "@/lib/types"

export default function CitizenDashboardPage() {
  const [issues, setIssues] = useState<Issue[]>([])
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const userData = localStorage.getItem("user")
    if (userData) {
      setUser(JSON.parse(userData))
    }

    fetch("/api/issues?citizenId=self") // adjust if your API expects a real ID
      .then((res) => res.json())
      .then((data) => {
        setIssues(Array.isArray(data) ? data : [])
        setLoading(false)
      })
      .catch((err) => {
        console.error("Failed to load citizen issues:", err)
        setLoading(false)
      })
  }, [])

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "in-progress":
        return "bg-blue-100 text-blue-800"
      case "resolved":
        return "bg-green-100 text-green-800"
      case "closed":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const total = issues.length
  const resolved = issues.filter((i) => i.status === "resolved").length
  const inProgress = issues.filter((i) => i.status === "in-progress").length
  const pending = issues.filter((i) => i.status === "pending").length

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <CitizenNav />
        <div className="flex items-center justify-center h-96">
          <div className="text-center">Loading dashboard...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <CitizenNav />

      <main className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 sm:space-y-8">
        {/* Header */}
        <section className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="space-y-1">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
              Welcome, {user?.full_name || user?.name || "Citizen"}
            </h1>
            <p className="text-sm sm:text-base text-gray-600">
              Track your reported issues and see their progress.
            </p>
          </div>
          <div className="flex-shrink-0">
            <Link href="/citizen/report" className="block">
              <Button className="w-full sm:w-auto flex items-center gap-2">
                <PlusCircle className="w-4 h-4" />
                Report New Issue
              </Button>
            </Link>
          </div>
        </section>

        {/* Stats */}
        <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-6">
          <Card className="min-w-0">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium">Total Reports</CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl sm:text-3xl font-bold">{total}</div>
              <p className="text-xs text-muted-foreground">All issues you have reported</p>
            </CardContent>
          </Card>

          <Card className="min-w-0">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium">Pending</CardTitle>
              <Clock className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl sm:text-3xl font-bold text-yellow-600">{pending}</div>
              <p className="text-xs text-muted-foreground">Waiting for review</p>
            </CardContent>
          </Card>

          <Card className="min-w-0">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium">In Progress</CardTitle>
              <AlertTriangle className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl sm:text-3xl font-bold text-blue-600">{inProgress}</div>
              <p className="text-xs text-muted-foreground">Being worked on</p>
            </CardContent>
          </Card>

          <Card className="min-w-0">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium">Resolved</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl sm:text-3xl font-bold text-green-600">{resolved}</div>
              <p className="text-xs text-muted-foreground">Successfully resolved issues</p>
            </CardContent>
          </Card>
        </section>

        {/* Recent Issues */}
        <section className="space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div>
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Your Recent Issues</h2>
              <p className="text-xs sm:text-sm text-gray-600">
                Latest issues you&apos;ve submitted to the authorities.
              </p>
            </div>
            <div className="flex-shrink-0">
              <Link href="/citizen/issues">
                <Button variant="outline" size="sm" className="w-full sm:w-auto">
                  View All
                </Button>
              </Link>
            </div>
          </div>

          <div className="space-y-3">
            {issues.slice(0, 5).length === 0 && (
              <Card>
                <CardContent className="py-6 text-center text-sm text-gray-500">
                  You haven&apos;t reported any issues yet.
                </CardContent>
              </Card>
            )}

            {issues.slice(0, 5).map((issue) => (
              <Card key={issue.id} className="hover:shadow-sm transition-shadow">
                <CardContent className="p-3 sm:p-4 flex flex-col gap-3">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <h3 className="font-medium text-gray-900 text-sm sm:text-base truncate max-w-full">
                          {issue.title}
                        </h3>
                        <Badge className={getStatusColor(issue.status)}>{issue.status.replace("-", " ")}</Badge>
                      </div>
                      <p className="text-xs sm:text-sm text-gray-600 line-clamp-2">{issue.description}</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-3 text-[11px] sm:text-xs text-gray-500">
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {issue.location?.address || "Not specified"}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {issue.createdAt ? new Date(issue.createdAt).toLocaleDateString() : "—"}
                      </span>
                    </div>
                    <Link href={`/citizen/issues/${issue.id}`}>
                      <Button variant="outline" size="xs" className="h-7 px-2 text-[11px]">
                        View Details
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Progress overview */}
        {total > 0 && (
          <section>
            <Card>
              <CardHeader>
                <CardTitle className="text-base sm:text-lg">Overall Progress</CardTitle>
                <CardDescription className="text-xs sm:text-sm">
                  How many of your issues have moved forward.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between text-xs sm:text-sm mb-1">
                    <span>Resolved</span>
                    <span>
                      {resolved}/{total}
                    </span>
                  </div>
                  <Progress value={(resolved / total) * 100} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between text-xs sm:text-sm mb-1">
                    <span>In Progress</span>
                    <span>
                      {inProgress}/{total}
                    </span>
                  </div>
                  <Progress value={(inProgress / total) * 100} className="h-2" />
                </div>
              </CardContent>
            </Card>
          </section>
        )}
      </main>
    </div>
  )
}
