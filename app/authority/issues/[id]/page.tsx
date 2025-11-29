"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { AuthorityNav } from "@/components/authority-nav"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  MapPin,
  Calendar,
  User,
  MessageSquare,
  Camera,
  ArrowLeft,
  Save,
  Send,
  Clock,
  CheckCircle,
  AlertTriangle,
} from "lucide-react"
import Link from "next/link"
import type { Issue, Comment } from "@/lib/types"
import { supabase } from "@/lib/supabaseClient"

export default function IssueDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [issue, setIssue] = useState<Issue | null>(null)
  const [comments, setComments] = useState<Comment[]>([])
  const [newComment, setNewComment] = useState("")
  const [newStatus, setNewStatus] = useState("")
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)

  useEffect(() => {
    const issueId = params.id as string

    async function load() {
      setLoading(true)
      try {
        // 1) Load issue from Supabase
        const { data: issueRow, error: issueError } = await supabase
          .from("issues")
          .select("*")
          .eq("id", issueId)
          .single()

        if (issueError || !issueRow) {
          console.error("Error loading issue:", issueError)
          setIssue(null)
          setComments([])
          return
        }

        const statusMap: Record<string, string> = {
          open: "pending",
          in_progress: "in-progress",
          resolved: "resolved",
          closed: "closed",
        }

        const mappedIssue: Issue = {
          id: issueRow.id,
          title: issueRow.title ?? "",
          description: issueRow.description ?? "",
          status: statusMap[issueRow.status] ?? issueRow.status ?? "pending",
          priority: issueRow.priority ?? "medium",
          category: "general",
          location: {
            address: issueRow.location_name ?? "Not specified",
          },
          images: Array.isArray(issueRow.photo_urls) ? issueRow.photo_urls : [],
          assignedTo: issueRow.assigned_to ?? null,
          createdAt: issueRow.created_at,
          updatedAt: issueRow.updated_at ?? issueRow.created_at,
        }

        setIssue(mappedIssue)
        setNewStatus(mappedIssue.status)

        // 2) Load comments from Supabase (if table exists)
        const { data: commentRows, error: commentsError } = await supabase
          .from("comments")
          .select("*")
          .eq("issue_id", issueId)
          .order("created_at", { ascending: true })

        if (commentsError || !commentRows) {
          if (commentsError) console.error("Error loading comments:", commentsError)
          setComments([])
        } else {
          const mappedComments: Comment[] = commentRows.map((row: any) => ({
            id: row.id,
            issueId: row.issue_id,
            userId: row.author_id ?? row.user_id ?? "",
            content: row.content ?? "",
            isInternal: row.is_internal ?? false,
            createdAt: row.created_at,
          }))
          setComments(mappedComments)
        }
      } finally {
        setLoading(false)
      }
    }

    if (issueId) {
      load()
    }
  }, [params.id])

  const handleStatusUpdate = async () => {
    if (!issue || !newStatus) return

    setUpdating(true)
    try {
      // Use API so it stays in sync with other pages
      const res = await fetch(`/api/issues/${issue.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      })

      if (!res.ok) {
        console.error("Failed to update status", await res.text())
        return
      }

      const updated: Issue = await res.json()
      setIssue((prev) => (prev ? { ...prev, ...updated } : updated))
    } catch (err) {
      console.error("Error updating status:", err)
    } finally {
      setUpdating(false)
    }
  }

  const handleAddComment = async () => {
    if (!newComment.trim() || !issue) return

    try {
      const userRaw = typeof window !== "undefined" ? localStorage.getItem("user") : null
      const user = userRaw ? JSON.parse(userRaw) : null

      if (!user?.id) {
        console.error("No logged-in user to attach comment to")
        return
      }

      const { data: inserted, error } = await supabase
        .from("comments")
        .insert([
          {
            issue_id: issue.id,
            author_id: user.id,
            content: newComment,
            is_internal: false,
          },
        ])
        .select("*")
        .single()

      if (error || !inserted) {
        console.error("Error inserting comment:", error)
        return
      }

      const newMapped: Comment = {
        id: inserted.id,
        issueId: inserted.issue_id,
        userId: inserted.author_id ?? user.id,
        content: inserted.content ?? "",
        isInternal: inserted.is_internal ?? false,
        createdAt: inserted.created_at,
      }

      setComments((prev) => [...prev, newMapped])
      setNewComment("")
    } catch (err) {
      console.error("Error adding comment:", err)
    }
  }

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
          <div className="text-center">Loading issue details...</div>
        </div>
      </div>
    )
  }

  if (!issue) {
    return (
      <div className="min-h-screen bg-gray-50">
        <AuthorityNav />
        <div className="max-w-4xl mx-auto px-4 py-16 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Issue Not Found</h1>
          <p className="text-gray-600 mb-8">The issue you're looking for doesn't exist or has been removed.</p>
          <Link href="/authority/issues">
            <Button>Back to Issues</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AuthorityNav />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link href="/authority/issues" className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4">
            <ArrowLeft className="w-4 h-4" />
            Back to Issues
          </Link>
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{issue.title}</h1>
              <div className="flex items-center gap-3">
                <Badge className={getStatusColor(issue.status)}>{issue.status.replace("-", " ")}</Badge>
                <Badge variant="outline" className={getPriorityColor(issue.priority)}>
                  {issue.priority} priority
                </Badge>
                <span className="text-sm text-gray-500">Issue #{issue.id}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Issue Details */}
            <Card>
              <CardHeader>
                <CardTitle>Issue Description</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 leading-relaxed mb-6">{issue.description}</p>

                {/* Issue Images */}
                {issue.images && issue.images.length > 0 && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                      <Camera className="w-4 h-4" />
                      Attached Photos ({issue.images.length})
                    </h4>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {issue.images.map((image, index) => (
                        <div key={index} className="relative group">
                          <img
                            src={image || "/placeholder.svg"}
                            alt={`Issue photo ${index + 1}`}
                            className="w-full h-32 object-cover rounded-lg border cursor-pointer hover:opacity-90"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Comments Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="w-5 h-5" />
                  Comments & Updates ({comments.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 mb-6">
                  {comments.length === 0 ? (
                    <p className="text-gray-500 text-center py-8">No comments yet. Be the first to add an update.</p>
                  ) : (
                    comments.map((comment) => (
                      <div key={comment.id} className="border-l-4 border-blue-200 pl-4 py-2">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="font-medium text-gray-900">Authority Response</span>
                          <span className="text-xs text-gray-500">
                            {new Date(comment.createdAt).toLocaleDateString()} at{" "}
                            {new Date(comment.createdAt).toLocaleTimeString()}
                          </span>
                          {comment.isInternal && (
                            <Badge variant="outline" className="text-xs">
                              Internal
                            </Badge>
                          )}
                        </div>
                        <p className="text-gray-700">{comment.content}</p>
                      </div>
                    ))
                  )}
                </div>

                <Separator className="my-6" />

                {/* Add Comment */}
                <div className="space-y-4">
                  <h4 className="font-medium text-gray-900">Add Update</h4>
                  <Textarea
                    placeholder="Provide an update to the citizen about this issue..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    rows={3}
                  />
                  <Button
                    onClick={handleAddComment}
                    disabled={!newComment.trim()}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <Send className="w-4 h-4 mr-2" />
                    Send Update
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Status Management */}
            <Card>
              <CardHeader>
                <CardTitle>Status Management</CardTitle>
                <CardDescription>Update the current status of this issue</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">Current Status</label>
                  <Select value={newStatus} onValueChange={setNewStatus}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending Review</SelectItem>
                      <SelectItem value="in-progress">In Progress</SelectItem>
                      <SelectItem value="resolved">Resolved</SelectItem>
                      <SelectItem value="closed">Closed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {newStatus !== issue.status && (
                  <Alert>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      Status will be updated from "{issue.status.replace("-", " ")}" to "{newStatus.replace("-", " ")}"
                    </AlertDescription>
                  </Alert>
                )}

                <Button
                  onClick={handleStatusUpdate}
                  disabled={newStatus === issue.status || updating}
                  className="w-full bg-green-600 hover:bg-green-700"
                >
                  {updating ? (
                    <>
                      <Clock className="w-4 h-4 mr-2 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Update Status
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Issue Information */}
            <Card>
              <CardHeader>
                <CardTitle>Issue Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3">
                  <MapPin className="w-4 h-4 text-gray-400 mt-1" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Location</p>
                    <p className="text-sm text-gray-600">{issue.location.address}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Calendar className="w-4 h-4 text-gray-400 mt-1" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Reported</p>
                    <p className="text-sm text-gray-600">{new Date(issue.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Clock className="w-4 h-4 text-gray-400 mt-1" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Last Updated</p>
                    <p className="text-sm text-gray-600">{new Date(issue.updatedAt).toLocaleDateString()}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <User className="w-4 h-4 text-gray-400 mt-1" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Category</p>
                    <p className="text-sm text-gray-600 capitalize">{issue.category}</p>
                  </div>
                </div>

                {issue.assignedTo && (
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-4 h-4 text-green-400 mt-1" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">Assigned To</p>
                      <p className="text-sm text-gray-600">Department Staff</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="outline" className="w-full justify-start bg-transparent">
                  <User className="w-4 h-4 mr-2" />
                  Assign to Team Member
                </Button>
                <Button variant="outline" className="w-full justify-start bg-transparent">
                  <Calendar className="w-4 h-4 mr-2" />
                  Schedule Site Visit
                </Button>
                <Button variant="outline" className="w-full justify-start bg-transparent">
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Contact Citizen
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
