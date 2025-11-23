"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { AuthorityNav } from "@/components/authority-nav"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Search, Filter, Eye, UserCheck, Clock, CheckCircle, AlertTriangle } from "lucide-react"
import Link from "next/link"
import type { Issue } from "@/lib/types"

export default function AuthorityIssuesPage() {
  const [issues, setIssues] = useState<Issue[]>([])
  const [filteredIssues, setFilteredIssues] = useState<Issue[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [priorityFilter, setPriorityFilter] = useState("all")
  const [activeTab, setActiveTab] = useState("all")

  const searchParams = useSearchParams()

  useEffect(() => {
    // Set initial filters from URL params
    const status = searchParams.get("status")
    const priority = searchParams.get("priority")
    const category = searchParams.get("category")

    if (status) setStatusFilter(status)
    if (priority) setPriorityFilter(priority)
    if (category) setCategoryFilter(category)

    fetch("/api/issues")
      .then((res) => res.json())
      .then((data) => {
        setIssues(data)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [searchParams])

  useEffect(() => {
    let filtered = issues

    // Tab filtering
    if (activeTab !== "all") {
      filtered = filtered.filter((issue) => issue.status === activeTab)
    }

    if (searchTerm) {
      filtered = filtered.filter(
        (issue) =>
          issue.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          issue.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          issue.location.address.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter((issue) => issue.status === statusFilter)
    }

    if (categoryFilter !== "all") {
      filtered = filtered.filter((issue) => issue.category === categoryFilter)
    }

    if (priorityFilter !== "all") {
      filtered = filtered.filter((issue) => issue.priority === priorityFilter)
    }

    setFilteredIssues(filtered)
  }, [issues, searchTerm, statusFilter, categoryFilter, priorityFilter, activeTab])

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

  const handleAssignToMe = async (issueId: string) => {
    // In real app, make API call to assign issue
    console.log("Assigning issue", issueId, "to current user")
    // Update local state for demo
    setIssues(
      issues.map((issue) =>
        issue.id === issueId ? { ...issue, status: "in-progress" as const, assignedTo: "current-user" } : issue,
      ),
    )
  }

  const stats = {
    all: issues.length,
    pending: issues.filter((i) => i.status === "pending").length,
    inProgress: issues.filter((i) => i.status === "in-progress").length,
    resolved: issues.filter((i) => i.status === "resolved").length,
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

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Issue Management</h1>
          <p className="text-gray-600">Review, assign, and track community issues reported by citizens.</p>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="all" className="flex items-center gap-2">
              All Issues
              <Badge variant="secondary">{stats.all}</Badge>
            </TabsTrigger>
            <TabsTrigger value="pending" className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Pending
              <Badge variant="secondary">{stats.pending}</Badge>
            </TabsTrigger>
            <TabsTrigger value="in-progress" className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              In Progress
              <Badge variant="secondary">{stats.inProgress}</Badge>
            </TabsTrigger>
            <TabsTrigger value="resolved" className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              Resolved
              <Badge variant="secondary">{stats.resolved}</Badge>
            </TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="mt-6">
            {/* Filters */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Filter className="w-5 h-5" />
                  Advanced Filters
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search issues..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>

                  <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Filter by priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Priorities</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="low">Low</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Filter by category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      <SelectItem value="infrastructure">Infrastructure</SelectItem>
                      <SelectItem value="safety">Public Safety</SelectItem>
                      <SelectItem value="environment">Environment</SelectItem>
                      <SelectItem value="utilities">Utilities</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Statuses</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="in-progress">In Progress</SelectItem>
                      <SelectItem value="resolved">Resolved</SelectItem>
                      <SelectItem value="closed">Closed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Issues List */}
            <div className="space-y-4">
              {filteredIssues.length === 0 ? (
                <Card>
                  <CardContent className="text-center py-12">
                    <div className="text-gray-400 mb-4">
                      <Search className="w-12 h-12 mx-auto" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No issues found</h3>
                    <p className="text-gray-600">Try adjusting your search or filter criteria.</p>
                  </CardContent>
                </Card>
              ) : (
                filteredIssues.map((issue) => (
                  <Card key={issue.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-3">
                            <h3 className="text-lg font-semibold text-gray-900">{issue.title}</h3>
                            <Badge className={getStatusColor(issue.status)}>{issue.status.replace("-", " ")}</Badge>
                            <Badge variant="outline" className={getPriorityColor(issue.priority)}>
                              {issue.priority}
                            </Badge>
                            {issue.assignedTo && (
                              <Badge variant="outline" className="bg-blue-50 text-blue-700">
                                Assigned
                              </Badge>
                            )}
                          </div>

                          <p className="text-gray-600 mb-4 line-clamp-2">{issue.description}</p>

                          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm text-gray-500 mb-4">
                            <div>
                              <span className="font-medium">Location:</span>
                              <br />
                              {issue.location.address}
                            </div>
                            <div>
                              <span className="font-medium">Category:</span>
                              <br />
                              {issue.category}
                            </div>
                            <div>
                              <span className="font-medium">Reported:</span>
                              <br />
                              {new Date(issue.createdAt).toLocaleDateString()}
                            </div>
                            <div>
                              <span className="font-medium">Last Updated:</span>
                              <br />
                              {new Date(issue.updatedAt).toLocaleDateString()}
                            </div>
                          </div>

                          {issue.images && issue.images.length > 0 && (
                            <div className="mb-4">
                              <div className="flex gap-2">
                                {issue.images.slice(0, 4).map((image, index) => (
                                  <img
                                    key={index}
                                    src={image || "/placeholder.svg"}
                                    alt={`Issue ${index + 1}`}
                                    className="w-20 h-20 object-cover rounded border"
                                  />
                                ))}
                                {issue.images.length > 4 && (
                                  <div className="w-20 h-20 bg-gray-100 rounded border flex items-center justify-center text-xs text-gray-600">
                                    +{issue.images.length - 4}
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                        </div>

                        <div className="ml-6 flex flex-col gap-2">
                          <Link href={`/authority/issues/${issue.id}`}>
                            <Button variant="outline" size="sm" className="flex items-center gap-2 bg-transparent">
                              <Eye className="w-4 h-4" />
                              View Details
                            </Button>
                          </Link>

                          {issue.status === "pending" && !issue.assignedTo && (
                            <Button
                              variant="default"
                              size="sm"
                              onClick={() => handleAssignToMe(issue.id)}
                              className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
                            >
                              <UserCheck className="w-4 h-4" />
                              Assign to Me
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>

            {/* Summary */}
            {filteredIssues.length > 0 && (
              <div className="mt-8 text-center text-sm text-gray-600">
                Showing {filteredIssues.length} of {issues.length} issues
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
