"use client"

import { useEffect, useState } from "react"
import { AuthorityNav } from "@/components/authority-nav"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import {
  AlertTriangle,
  CheckCircle,
  Clock,
  BarChart3,
  TrendingUp,
  PieChart as PieIcon,
} from "lucide-react"
import type { Analytics } from "@/lib/types"

export default function AuthorityAnalyticsPage() {
  const [analytics, setAnalytics] = useState<Analytics | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await fetch("/api/analytics")
        const data = await res.json()
        setAnalytics(data)
      } catch (err) {
        console.error("Failed to load analytics:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchAnalytics()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <AuthorityNav />
        <div className="flex items-center justify-center h-96">
          <div className="text-center">Loading analytics...</div>
        </div>
      </div>
    )
  }

  if (!analytics) {
    return (
      <div className="min-h-screen bg-gray-50">
        <AuthorityNav />
        <div className="max-w-4xl mx-auto px-4 py-16 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Analytics unavailable</h1>
          <p className="text-gray-600">
            We couldn&apos;t load analytics data right now. Please try again later.
          </p>
        </div>
      </div>
    )
  }

  const resolutionRate =
    analytics.totalIssues > 0
      ? Math.round((analytics.resolvedIssues / analytics.totalIssues) * 100)
      : 0

  return (
    <div className="min-h-screen bg-gray-50">
      <AuthorityNav />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Analytics</h1>
          <p className="text-gray-600">
            Insight into community issues, resolution performance, and citizen satisfaction.
          </p>
        </div>

        {/* Top metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Issues</CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.totalIssues}</div>
              <p className="text-xs text-muted-foreground">All-time reported issues</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Resolved Issues</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{analytics.resolvedIssues}</div>
              <p className="text-xs text-muted-foreground">
                {resolutionRate}% resolution rate
              </p>
              <Progress value={resolutionRate} className="mt-2 h-2" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Resolution Time</CardTitle>
              <Clock className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {analytics.avgResolutionTime ?? 0}d
              </div>
              <p className="text-xs text-muted-foreground">From report to closure</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Citizen Satisfaction</CardTitle>
              <TrendingUp className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">
                {analytics.satisfactionRate ?? 0}%
              </div>
              <p className="text-xs text-muted-foreground">Based on feedback ratings</p>
              <Progress value={analytics.satisfactionRate ?? 0} className="mt-2 h-2" />
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Issues by category */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PieIcon className="w-4 h-4" />
                Issues by Category
              </CardTitle>
              <CardDescription>Distribution of issues across categories</CardDescription>
            </CardHeader>
            <CardContent>
              {analytics.issuesByCategory &&
              Object.keys(analytics.issuesByCategory).length > 0 ? (
                <div className="space-y-3">
                  {Object.entries(analytics.issuesByCategory).map(([category, count]) => {
                    const percentage =
                      analytics.totalIssues > 0
                        ? ((count as number) / analytics.totalIssues) * 100
                        : 0

                    return (
                      <div key={category} className="flex items-center justify-between">
                        <div className="flex flex-col">
                          <span className="text-sm font-medium capitalize">
                            {category.replace(/_/g, " ")}
                          </span>
                          <span className="text-xs text-gray-500">
                            {count} issues ({percentage.toFixed(1)}%)
                          </span>
                        </div>
                        <div className="flex items-center gap-2 w-1/2">
                          <Progress value={percentage} className="h-2 flex-1" />
                          <span className="text-sm font-medium w-10 text-right">
                            {count}
                          </span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <p className="text-sm text-gray-500">No issues recorded yet.</p>
              )}
            </CardContent>
          </Card>

          {/* Summary / insights */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4" />
                Insights
              </CardTitle>
              <CardDescription>Quick overview of performance</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-sm text-gray-700">
              <div className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-green-600 mt-0.5" />
                <p>
                  {resolutionRate >= 80
                    ? "Great resolution rate. Keep maintaining fast responses."
                    : resolutionRate >= 50
                    ? "Resolution rate is moderate. Focus on clearing backlog issues."
                    : "Resolution rate is low. Consider prioritizing older unresolved cases."}
                </p>
              </div>
              <div className="flex items-start gap-2">
                <Clock className="w-4 h-4 text-blue-600 mt-0.5" />
                <p>
                  Average resolution time is{" "}
                  <span className="font-medium">
                    {analytics.avgResolutionTime ?? 0} days
                  </span>
                  . Reducing this improves citizen trust.
                </p>
              </div>
              <div className="flex items-start gap-2">
                <TrendingUp className="w-4 h-4 text-purple-600 mt-0.5" />
                <p>
                  Citizen satisfaction is{" "}
                  <span className="font-medium">
                    {analytics.satisfactionRate ?? 0}%
                  </span>
                  . Use comments and feedback to identify areas to improve.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
