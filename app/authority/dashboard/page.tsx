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
    const userData = localStorage.getItem("user")
    if (userData) {
      const parsedUser = JSON.parse(userData)
      setUser(parsedUser)

      // Fetch all issues for authority view
      Promise.all([fetch("/api/issues"), fetch("/api/analytics")])
        .then(([issuesRes, analyticsRes]) => Promise.all([issuesRes.json(), analyticsRes.json()]))
        .then(([issuesData, analyticsData]) => {
          setIssues(issuesData)
          setAnalytics(analyticsData)
          setLoading(false)
        })
        .catch(() => setLoading(false))
    }
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
    <div className="min-h-screen bg-gray-50">
      <AuthorityNav />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {user?.name}
            {user?.department && <span className="text-xl text-gray-600 font-normal"> - {user.department}</span>}
          </h1>
          <p className="text-gray-600">Here's an overview of community issues and department performance.</p>
        </div>

        {/* Alert for Urgent Issues */}
        {urgentIssues.length > 0 && (
          <Card className="mb-8 border-red-200 bg-red-50">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <AlertTriangle className="w-6 h-6 text-red-600" />
                <div className="flex-1">
                  <h3 className="font-semibold text-red-900">Urgent Issues Require Attention</h3>
                  <p className="text-red-700">
                    {urgentIssues.length} urgent issue{urgentIssues.length > 1 ? "s" : ""} need immediate response.
                  </p>
                </div>
                <Link href="/authority/issues?priority=urgent">
                  <Button variant="destructive">View Urgent Issues</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Issues</CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics?.totalIssues || 0}</div>
              <p className="text-xs text-muted-foreground">All time reports</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Review</CardTitle>
              <Clock className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{pendingIssues.length}</div>
              <p className="text-xs text-muted-foreground">Awaiting assignment</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">In Progress</CardTitle>
              <TrendingUp className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{inProgressIssues.length}</div>
              <p className="text-xs text-muted-foreground">Being worked on</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Resolution Rate</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{analytics?.satisfactionRate || 0}%</div>
              <p className="text-xs text-muted-foreground">Citizen satisfaction</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Issues */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Recent Issues</CardTitle>
                    <CardDescription>Latest reports from citizens requiring attention</CardDescription>
                  </div>
                  <Link href="/authority/issues">
                    <Button variant="outline" size="sm">
                      View All
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {issues.slice(0, 5).map((issue) => (
                    <div
                      key={issue.id}
                      className="flex items-start justify-between p-4 border rounded-lg hover:bg-gray-50"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-medium text-gray-900">{issue.title}</h3>
                          <Badge className={getStatusColor(issue.status)}>{issue.status.replace("-", " ")}</Badge>
                          <Badge variant="outline" className={getPriorityColor(issue.priority)}>
                            {issue.priority}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 mb-2 line-clamp-1">{issue.description}</p>
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {issue.location.address}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {new Date(issue.createdAt).toLocaleDateString()}
                          </span>
                          <span className="flex items-center gap-1">
                            <Users className="w-3 h-3" />
                            {issue.category}
                          </span>
                        </div>
                      </div>
                      <div className="ml-4 flex gap-2">
                        <Link href={`/authority/issues/${issue.id}`}>
                          <Button variant="outline" size="sm">
                            <Eye className="w-4 h-4" />
                          </Button>
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Department Performance */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Department Performance</CardTitle>
                <CardDescription>Current month statistics</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Issues Resolved</span>
                    <span>
                      {analytics?.resolvedIssues || 0}/{analytics?.totalIssues || 0}
                    </span>
                  </div>
                  <Progress
                    value={analytics?.totalIssues ? ((analytics.resolvedIssues || 0) / analytics.totalIssues) * 100 : 0}
                    className="h-2"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Avg Response Time</span>
                    <span>{analytics?.avgResolutionTime || 0} days</span>
                  </div>
                  <Progress value={75} className="h-2" />
                </div>

                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Citizen Satisfaction</span>
                    <span>{analytics?.satisfactionRate || 0}%</span>
                  </div>
                  <Progress value={analytics?.satisfactionRate || 0} className="h-2" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Issues by Category</CardTitle>
                <CardDescription>Distribution of current issues</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {analytics?.issuesByCategory &&
                    Object.entries(analytics.issuesByCategory).map(([category, count]) => (
                      <div key={category} className="flex items-center justify-between">
                        <span className="text-sm capitalize">{category}</span>
                        <div className="flex items-center gap-2">
                          <div className="w-16 bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-green-600 h-2 rounded-full"
                              style={{
                                width: `${((count as number) / (analytics.totalIssues || 1)) * 100}%`,
                              }}
                            />
                          </div>
                          <span className="text-sm font-medium w-8 text-right">{count}</span>
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Link href="/authority/issues?status=pending" className="block">
                  <Button variant="outline" className="w-full justify-start bg-transparent">
                    <Clock className="w-4 h-4 mr-2" />
                    Review Pending Issues ({pendingIssues.length})
                  </Button>
                </Link>
                <Link href="/authority/issues?priority=urgent" className="block">
                  <Button variant="outline" className="w-full justify-start bg-transparent">
                    <AlertTriangle className="w-4 h-4 mr-2" />
                    Handle Urgent Issues ({urgentIssues.length})
                  </Button>
                </Link>
                <Link href="/authority/analytics" className="block">
                  <Button variant="outline" className="w-full justify-start bg-transparent">
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
