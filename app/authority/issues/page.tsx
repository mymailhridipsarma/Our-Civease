"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { AuthorityNav } from "@/components/authority-nav"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Eye, Search } from "lucide-react"
import { Input } from "@/components/ui/input"

// Keep this in sync with what /api/issues returns
type Issue = {
  id: string
  title: string
  description: string
  status: string
  priority: string
  category?: string
  location?: {
    address?: string
  }
  createdAt?: string
  updatedAt?: string
}

export default function AuthorityIssuesPage() {
  const [issues, setIssues] = useState<Issue[]>([])
  const [filteredIssues, setFilteredIssues] = useState<Issue[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")

  // Fetch all issues once
  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/issues")
        const data: Issue[] = await res.json()
        setIssues(data)
        setFilteredIssues(data)
      } catch (err) {
        console.error("Failed to load issues", err)
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [])

  // Simple search filter
  useEffect(() => {
    const term = searchTerm.toLowerCase().trim()
    if (!term) {
      setFilteredIssues(issues)
      return
    }

    const next = issues.filter((issue) => {
      const title = (issue.title || "").toLowerCase()
      const desc = (issue.description || "").toLowerCase()
      const addr = (issue.location?.address || "").toLowerCase()
      return title.includes(term) || desc.includes(term) || addr.includes(term)
    })

    setFilteredIssues(next)
  }, [searchTerm, issues])

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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <AuthorityNav />
        <div className="flex items-center justify-center h-96">
          <div className="text-center">Loading issues...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AuthorityNav />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <header className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Issue Management</h1>
            <p className="text-gray-600">
              View and manage all issues reported by citizens.
            </p>
          </div>
        </header>

        {/* Search */}
        <Card>
          <CardContent className="py-4">
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by title, description or location..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Issues list */}
        <section className="space-y-4">
          {filteredIssues.length === 0 ? (
            <Card>
              <CardContent className="py-10 text-center text-gray-500">
                No issues found.
              </CardContent>
            </Card>
          ) : (
            filteredIssues.map((issue) => (
              <Card key={issue.id} className="hover:shadow-sm transition-shadow">
                <CardContent className="p-4 flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h2 className="font-semibold text-gray-900">{issue.title}</h2>
                      <Badge className={getStatusColor(issue.status)}>
                        {issue.status.replace("-", " ")}
                      </Badge>
                      <Badge
                        variant="outline"
                        className={getPriorityColor(issue.priority)}
                      >
                        {issue.priority}
                      </Badge>
                    </div>

                    <p className="text-sm text-gray-600 mb-2">
                      {issue.description}
                    </p>

                    <div className="text-xs text-gray-500 flex flex-wrap gap-4">
                      <span>
                        Location:{" "}
                        {issue.location?.address || "Not specified"}
                      </span>
                      <span>
                        Category: {issue.category || "General"}
                      </span>
                      {issue.createdAt && (
                        <span>
                          Reported:{" "}
                          {new Date(issue.createdAt).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <Link href={`/authority/issues/${issue.id}`}>
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex items-center gap-1"
                      >
                        <Eye className="w-4 h-4" />
                        Details
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </section>
      </main>
    </div>
  )
}
