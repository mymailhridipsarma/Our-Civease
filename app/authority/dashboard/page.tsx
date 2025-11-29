"use client"

import { useEffect, useState } from "react"
import { AuthorityNav } from "@/components/authority-nav"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  AlertTriangle,
  Clock,
  CheckCircle,
  TrendingUp,
  Users,
  MapPin,
  Calendar,
  ArrowRight,
  Eye,
  BarChart3,
} from "lucide-react"
import Link from "next/link"
import type { Issue, Analytics } from "@/lib/types"

export default function AuthorityDashboard() {
  const [issues, setIssues] = useState<Issue[]>([])
  const [analytics, setAnalytics] = useState<Analytics | null>(null)
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const userData = localStorage.getItem("user")
    if (userData) {
      const parsedUser = JSON.parse(userData)
      setUser(parsedUser)
    }

    Promise.all([fetch("/api/issues"), fetch("/api/analytics")])
      .then(([issuesRes, analyticsRes]) => Promise.all([issuesRes.json(), analyticsRes.json()]))
      .then(([issuesData, analyticsData]) => {
        setIssues(issuesData || [])
        setAnalytics(analyticsData || null)
        setLoading(false)
      })
      .catch((err) => {
        console.error("Failed to load dashboard:", err)
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

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent":
        return "bg-red-100 text-red-800 border-red-200"
      case "high":
        return "bg-orange-100 text-orange-800 border-orange-200"
      case "medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "low":
        return "bg-green-100 text-green-800 border-green-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const urgentIssues = issues.filter((i) => i.priority === "urgent" && i.status !== "resolved")
  const pendingIssues = issues.filter((i) => i.status === "pending")
  const inProgressIssues = issues.filter((i) => i.status === "in-progress")

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <AuthorityNav />
        <div className="flex items-center justify-center h-96">
          <div className="text-center">Loading dashboard...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <AuthorityNav />

      <main className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 sm:space-y-8">
        {/* Welcome Section */}
        <section className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            Welcome back, {user?.name || "Authority User"}
            {user?.department && (
              <span className="block sm:inline sm:text-xl sm:ml-2 text-gray-600 font-normal">
                – {user.department}
              </span>
            )}
          </h1>
          <p className="text-sm sm:text-base text-gray-600">
            Here&apos;s an overview of community issues and department performance.
          </p>
        </section>

        {/* Urgent Alert */}
        {urgentIssues.length > 0 && (
          <section>
            <Card className="border-red-200 bg-red-50">
              <CardContent className="p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                  <AlertTriangle className="w-6 h-6 text-red-600 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-red-900 text-sm sm:text-base">
                      Urgent Issues Require Attention
                    </h3>
                    <p className="text-xs sm:text-sm text-red-700">
                      {urgentIssues.length} urgent issue
                      {urgentIssues.length > 1 ? "s" : ""} need immediate response.
                    </p>
                  </div>
                  <div className="flex-shrink-0">
                    <Link href="/authority/issues?priority=urgent">
                      <Button size="sm" variant="destructive" className="w-full sm:w-auto">
                        View Urgent Issues
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>
        )}

        {/* Metrics – responsive grid */}
        <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-6">
          <Card className="min-w-0">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium">Total Issues</CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl sm:text-3xl font-bold">{analytics?.totalIssues || 0}</div>
              <p className="text-xs text-muted-foreground">All time reports</p>
            </CardContent>
          </Card>

          <Card className="min-w-0">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium">Pending Review</CardTitle>
              <Clock className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl sm:text-3xl font-bold text-yellow-600">{pendingIssues.length}</div>
              <p className="text-xs text-muted-foreground">Awaiting assignment</p>
            </CardContent>
          </Card>

          <Card className="min-w-0">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium">In Progress</CardTitle>
              <TrendingUp className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl sm:text-3xl font-bold text-blue-600">{inProgressIssues.length}</div>
              <p className="text-xs text-muted-foreground">Being worked on</p>
            </CardContent>
          </Card>

          <Card className="min-w-0">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium">Resolution Rate</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl sm:text-3xl font-bold text-green-600">
                {analytics?.satisfactionRate || 0}%
              </div>
              <p className="text-xs text-muted-foreground">Citizen satisfaction</p>
            </CardContent>
          </Card>
        </section>

        {/* Main content grid – recent issues + performance */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Recent Issues – spans 2 columns on large screens */}
          <div className="lg:col-span-2 min-w-0">
            <Card className="h-full">
              <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="min-w-0">
                  <CardTitle className="text-base sm:text-lg">Recent Issues</CardTitle>
                  <CardDescription className="text-xs sm:text-sm">
                    Latest reports from citizens requiring attention
                  </CardDescription>
                </div>
                <div className="flex-shrink-0">
                  <Link href="/authority/issues">
                    <Button variant="outline" size="sm" className="w-full sm:w-auto">
                      View All
                      <ArrowRight className="w-4 h-4 ml-1 sm:ml-2" />
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent className="space-y-3 sm:space-y-4">
                {issues.slice(0, 5).length === 0 && (
                  <p className="text-sm text-gray-500 text-center py-6">No issues yet.</p>
                )}

                {issues.slice(0, 5).map((issue) => (
                  <div
                    key={issue.id}
                    className="flex flex-col sm:flex-row sm:items-start justify-between p-3 sm:p-4 border rounded-lg hover:bg-gray-50 gap-3 sm:gap-4"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1.5">
                        <h3 className="font-medium text-gray-900 text-sm sm:text-base truncate max-w-full">
                          {issue.title}
                        </h3>
                        <Badge className={getStatusColor(issue.status)}>{issue.status.replace("-", " ")}</Badge>
                        <Badge variant="outline" className={getPriorityColor(issue.priority)}>
                          {issue.priority}
                        </Badge>
                      </div>
                      <p className="text-xs sm:text-sm text-gray-600 mb-2 line-clamp-2">
                        {issue.description}
                      </p>
                      <div className="flex flex-wrap items-center gap-3 text-[11px] sm:text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {issue.location?.address || "Not specified"}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {issue.createdAt ? new Date(issue.createdAt).toLocaleDateString() : "—"}
                        </span>
                        <span className="flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          {issue.category}
                        </span>
                      </div>
                    </div>
                    <div className="flex-shrink-0 flex sm:flex-col gap-2">
                      <Link href={`/authority/issues/${issue.id}`} className="w-full sm:w-auto">
                        <Button variant="outline" size="sm" className="w-full sm:w-auto">
                          <Eye className="w-4 h-4 mr-1" />
                          <span className="hidden sm:inline">View</span>
                        </Button>
                      </Link>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Right column – performance + quick actions */}
          <div className="space-y-6 min-w-0">
            {/* Department Performance */}
            <Card className="w-full">
              <CardHeader>
                <CardTitle className="text-base sm:text-lg">Department Performance</CardTitle>
                <CardDescription className="text-xs sm:text-sm">
                  Current month statistics
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between text-xs sm:text-sm mb-1.5">
                    <span>Issues Resolved</span>
                    <span>
                      {analytics?.resolvedIssues || 0}/{analytics?.totalIssues || 0}
                    </span>
                  </div>
                  <Progress
                    value={
                      analytics?.totalIssues
                        ? ((analytics.resolvedIssues || 0) / analytics.totalIssues) * 100
                        : 0
                    }
                    className="h-2"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs sm:text-sm mb-1.5">
                    <span>Avg Response Time</span>
                    <span>{analytics?.avgResolutionTime || 0} days</span>
                  </div>
                  <Progress value={75} className="h-2" />
                </div>

                <div>
                  <div className="flex justify-between text-xs sm:text-sm mb-1.5">
                    <span>Citizen Satisfaction</span>
                    <span>{analytics?.satisfactionRate || 0}%</span>
                  </div>
                  <Progress value={analytics?.satisfactionRate || 0} className="h-2" />
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="w-full">
              <CardHeader>
                <CardTitle className="text-base sm:text-lg">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Link href="/authority/issues?status=pending" className="block">
                  <Button
                    variant="outline"
                    className="w-full justify-start bg-transparent text-xs sm:text-sm"
                  >
                    <Clock className="w-4 h-4 mr-2" />
                    Review Pending Issues ({pendingIssues.length})
                  </Button>
                </Link>
                <Link href="/authority/issues?priority=urgent" className="block">
                  <Button
                    variant="outline"
                    className="w-full justify-start bg-transparent text-xs sm:text-sm"
                  >
                    <AlertTriangle className="w-4 h-4 mr-2" />
                    Handle Urgent Issues ({urgentIssues.length})
                  </Button>
                </Link>
                <Link href="/authority/analytics" className="block">
                  <Button
                    variant="outline"
                    className="w-full justify-start bg-transparent text-xs sm:text-sm"
                  >
                    <BarChart3 className="w-4 h-4 mr-2" />
                    View Full Analytics
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>
    </div>
  )
}
