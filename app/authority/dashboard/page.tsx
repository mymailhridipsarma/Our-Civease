"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { AuthorityNav } from "@/components/authority-nav"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Eye, AlertTriangle, CheckCircle, Clock } from "lucide-react"
import type { Issue } from "@/lib/types"

type Analytics = {
  totalIssues: number
  openIssues: number
  inProgressIssues: number
  resolvedIssues: number
  closedIssues: number
}

export default function AuthorityDashboardPage() {
  const [analytics, setAnalytics] = useState<Analytics | null>(null)
  const [recentIssues, setRecentIssues] = useState<Issue[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      try {
        // 1) analytics
        const analyticsRes = await fetch("/api/analytics")
        const analyticsData = await analyticsRes.json()

        // 2) recent issues (last few, any status)
        const issuesRes = await fetch("/api/issues")
        const issuesData: Issue[] = await issuesRes.json()

        setAnalytics(analyticsData)
        setRecentIssues(issuesData.slice(0, 5)) // show top 5
      } catch (err) {
        console.error("Error loading authority dashboard:", err)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

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

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <header>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Authority Dashboard
          </h1>
          <p className="text-gray-600">
            Monitor and manage issues reported by citizens in your jurisdiction.
          </p>
        </header>

        {/* Stats cards */}
        <section className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Total Issues</CardTitle>
            </CardHeader>
            <CardContent className="text-3xl font-bold">
              {analytics?.totalIssues ?? 0}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-4 h-4" /> Open
              </CardTitle>
            </CardHeader>
            <CardContent className="text-3xl font-bold">
              {analytics?.openIssues ?? 0}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" /> In Progress
              </CardTitle>
            </CardHeader>
            <CardContent className="text-3xl font-bold">
              {analytics?.inProgressIssues ?? 0}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4" /> Resolved
              </CardTitle>
            </CardHeader>
            <CardContent className="text-3xl font-bold">
              {analytics?.resolvedIssues ?? 0}
            </CardContent>
          </Card>
        </section>

        {/* Recent issues */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">
              Recent Issues
            </h2>
            <Link href="/authority/issues">
              <Button variant="outline" size="sm">
                View all issues
              </Button>
            </Link>
          </div>

          {recentIssues.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-gray-500">
                No issues reported yet.
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {recentIssues.map((issue) => (
                <Card key={issue.id} className="hover:shadow-sm transition-shadow">
                  <CardContent className="p-4 flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold">{issue.title}</h3>
                      <p className="text-sm text-gray-600 line-clamp-2">
                        {issue.description}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {issue.location?.address || "Location not specified"}
                      </p>
                    </div>

                    <div className="flex flex-col items-end gap-2">
                      <Badge variant="outline">{issue.status}</Badge>
                      <Link href={`/authority/issues/${issue.id}`}>
                        <Button size="sm" variant="outline" className="flex items-center gap-1">
                          <Eye className="w-4 h-4" />
                          View
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  )
}
