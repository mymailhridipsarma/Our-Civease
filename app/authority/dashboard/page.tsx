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
    // Get user from localStorage
    const userData = typeof window !== "undefined" ? localStorage.getItem("user") : null
    if (userData) {
      const parsedUser = JSON.parse(userData)
      setUser(parsedUser)
    }

    // Fetch all issues + analytics for authority
    Promise.all([fetch("/api/issues"), fetch("/api/analytics")])
      .then(([issuesRes, analyticsRes]) => Promise.all([issuesRes.json(), analyticsRes.json()]))
      .then(([issuesData, analyticsData]) => {
        setIssues(Array.isArray(issuesData) ? issuesData : [])
        setAnalytics(analyticsData || null)
        setLoading(false)
      })
      .catch((err) => {
        console.error("Failed to load authority dashboard:", err)
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
  const resolvedIssuesCount = issues.filter((i) => i.status === "resolved").length

  const totalIssuesCount = issues.length
  const resolutionRate = totalIssuesCount ? Math.round((resolvedIssuesCount / totalIssuesCount) * 100) : 0

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
    <div className="min-h-screen bg-gray-50">
      <AuthorityNav />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Welcome Section */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1 sm:mb-2">
            Welcome back, {user?.name || "Authority"}
          </h1>
          {user?.department && (
            <p className="text-sm sm:text-base text-gray-600 mb-1">
              Department: <span className="font-medium">{user.department}</span>
            </p>
          )}
          <p className="text-sm sm:text-base text-gray-600">
            Here&apos;s an overview of community issues and department performance.
          </p>
        </div>

        {/* Alert for Urgent Issues */}
        {urgentIssues.length > 0 && (
          <Card className="mb-6 sm:mb-8 border-red-200 bg-red-50">
            <CardContent className="p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                <AlertTriangle className="w-6 h-6 text-red-600 flex-shrink-0" />
                <div className="flex-1">
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
                    <Button variant="destructive" size="sm" className="w-full sm:w-auto">
                      View Urgent Issues
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Key Metrics – responsive */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
          {/* TOTAL ISSUES from issues.length */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1.5 sm:pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium">Total Issues</CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl sm:text-3xl font-bold">{totalIssuesCount}</div>
              <p className="text-[11px] sm:text-xs text-muted-foreground mt-1">
                All time reports
              </p>
            </CardContent>
          </Card>

          {/* PENDING */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1.5 sm:pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium">Pending Review</CardTitle>
              <Clock className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl sm:text-3xl font-bold text-yellow-600">
                {pendingIssues.length}
              </div>
              <p className="text-[11px] sm:text-xs text-muted-foreground mt-1">
                Awaiting assignment
              </p>
            </CardContent>
          </Card>

          {/* IN PROGRESS */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1.5 sm:pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium">In Progress</CardTitle>
              <TrendingUp className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl sm:text-3xl font-bold text-blue-600">
                {inProgressIssues.length}
              </div>
              <p className="text-[11px] sm:text-xs text-muted-foreground mt-1">
                Being worked on
              </p>
            </CardContent>
          </Card>

          {/* RESOLUTION RATE calculated from issues */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1.5 sm:pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium">Resolution Rate</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl sm:text-3xl font-bold text-green-600">
                {resolutionRate}%
              </div>
              <p className="text-[11px] sm:text-xs text-muted-foreground mt-1">
                Based on resolved issues
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Recent Issues */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader className="pb-3 sm:pb-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <div>
                    <CardTitle className="text-base sm:text-lg">Recent Issues</CardTitle>
                    <CardDescription className="text-xs sm:text-sm">
                      Latest reports from citizens requiring attention
                    </CardDescription>
                  </div>
                  <Link href="/authority/issues">
                    <Button variant="outline" size="sm" className="w-full sm:w-auto">
                      View All
                      <ArrowRight className="w-4 h-4 ml-1 sm:ml-2" />
                    </Button>
                  </Link>
                </div>
              </CardHeader>

              <CardContent>
                <div className="space-y-3 sm:space-y-4">
                  {issues.slice(0, 5).length === 0 && (
                    <p className="text-xs sm:text-sm text-gray-500 text-center py-4">
                      No issues found.
                    </p>
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
                          <Badge className={getStatusColor(issue.status)}>
                            {issue.status.replace("-", " ")}
                          </Badge>
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
                            {issue.createdAt
                              ? new Date(issue.createdAt).toLocaleDateString()
                              : "—"}
                          </span>
                          <span className="flex items-center gap-1">
                            <Users className="w-3 h-3" />
                            {issue.category}
                          </span>
                        </div>
                      </div>

                      <div className="flex-shrink-0 flex sm:flex-col gap-2">
                        <Link href={`/authority/issues/${issue.id}`} className="w-full sm:w-auto">
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full sm:w-auto flex items-center justify-center"
                          >
                            <Eye className="w-4 h-4 mr-1" />
                            <span className="hidden sm:inline">View</span>
                          </Button>
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Department Performance */}
            <Card>
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
                      {analytics?.resolvedIssues ?? resolvedIssuesCount}/{analytics?.totalIssues ?? totalIssuesCount}
                    </span>
                  </div>
                  <Progress
                    value={
                      (analytics?.totalIssues ?? totalIssuesCount)
                        ? ((analytics?.resolvedIssues ?? resolvedIssuesCount) /
                            (analytics?.totalIssues ?? totalIssuesCount)) *
                          100
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

            {/* Issues by Category */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base sm:text-lg">Issues by Category</CardTitle>
                <CardDescription className="text-xs sm:text-sm">
                  Distribution of current issues
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {analytics?.issuesByCategory &&
                    Object.entries(analytics.issuesByCategory).map(([category, count]) => {
                      const baseTotal = analytics?.totalIssues ?? totalIssuesCount || 1
                      return (
                        <div key={category} className="flex items-center justify-between">
                          <span className="text-xs sm:text-sm capitalize">{category}</span>
                          <div className="flex items-center gap-2">
                            <div className="w-16 sm:w-20 bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-green-600 h-2 rounded-full"
                                style={{
                                  width: `${((count as number) / baseTotal) * 100}%`,
                                }}
                              />
                            </div>
                            <span className="text-xs sm:text-sm font-medium w-6 text-right">
                              {count}
                            </span>
                          </div>
                        </div>
                      )
                    })}
                  {!analytics?.issuesByCategory && (
                    <p className="text-xs sm:text-sm text-gray-500">No category data.</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
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
        </div>
      </main>
    </div>
  )
}
