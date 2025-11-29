import Link from "next/link"
import { CitizenNav } from "@/components/citizen-nav"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  ArrowLeft,
  MapPin,
  Calendar,
  Clock,
  CheckCircle,
  AlertTriangle,
  Camera,
} from "lucide-react"
import { supabase } from "@/lib/supabaseClient"

type PageProps = { params: { id: string } }

export const dynamic = "force-dynamic"

export default async function CitizenIssueDetailPage({ params }: PageProps) {
  const { id } = params

  const { data: row, error } = await supabase
    .from("issues")
    .select("*")
    .eq("id", id)
    .single()

  if (error || !row) {
    console.error("Error loading citizen issue:", error)
    return (
      <div className="min-h-screen bg-gray-50">
        <CitizenNav />
        <div className="max-w-4xl mx-auto px-4 py-16 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Issue not found</h1>
          <p className="text-gray-600 mb-6">
            We couldn&apos;t find this issue. It may have been removed or the link is incorrect.
          </p>
          <Link href="/citizen/issues">
            <span className="inline-flex items-center text-sm text-green-600 hover:underline">
              <ArrowLeft className="w-4 h-4 mr-1" />
              Back to my issues
            </span>
          </Link>
        </div>
      </div>
    )
  }

  // Map DB -> UI shape
  const statusMap: Record<string, string> = {
    open: "pending",
    in_progress: "in-progress",
    resolved: "resolved",
    closed: "closed",
  }

  const status = statusMap[row.status] ?? row.status ?? "pending"

  const getStatusColor = (s: string) => {
    switch (s) {
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

  const getPriorityColor = (priority: string | null | undefined) => {
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

  const images = Array.isArray(row.photo_urls) ? row.photo_urls : []
  const createdAt = row.created_at ? new Date(row.created_at) : null
  const updatedAt = row.updated_at ? new Date(row.updated_at) : createdAt
  const locationName = row.location_name || "Not specified"
  const priority = row.priority || "medium"

  return (
    <div className="min-h-screen bg-gray-50">
      <CitizenNav />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header / Back link */}
        <div className="mb-6 sm:mb-8">
          <Link
            href="/citizen/issues"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 text-sm mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to my issues
          </Link>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="space-y-2">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 break-words">
                {row.title || "Issue"}
              </h1>
              <div className="flex flex-wrap items-center gap-2">
                <Badge className={getStatusColor(status)}>{status.replace("-", " ")}</Badge>
                <Badge variant="outline" className={getPriorityColor(priority)}>
                  {priority} priority
                </Badge>
                <span className="text-xs sm:text-sm text-gray-500">
                  Issue ID: <span className="font-mono">{row.id}</span>
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Layout grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Left: main details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Description */}
            <Card>
              <CardHeader>
                <CardTitle>Issue Details</CardTitle>
                <CardDescription>Information you submitted to the authorities</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-700 whitespace-pre-line">
                  {row.description || "No description provided."}
                </p>

                {images.length > 0 && (
                  <div className="mt-4">
                    <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2 text-sm">
                      <Camera className="w-4 h-4" />
                      Attached Photos ({images.length})
                    </h4>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {images.map((url: string, idx: number) => (
                        <div key={idx} className="relative group">
                          <img
                            src={url || "/placeholder.svg"}
                            alt={`Issue photo ${idx + 1}`}
                            className="w-full h-28 sm:h-32 object-cover rounded-lg border bg-gray-100"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Status explanation for citizen */}
            <Card>
              <CardHeader>
                <CardTitle>What this status means</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-gray-700">
                {status === "pending" && (
                  <div className="flex gap-2">
                    <AlertTriangle className="w-4 h-4 text-yellow-500 mt-0.5" />
                    <p>
                      Your issue has been received and is waiting for review by the concerned
                      department.
                    </p>
                  </div>
                )}
                {status === "in-progress" && (
                  <div className="flex gap-2">
                    <Clock className="w-4 h-4 text-blue-500 mt-0.5" />
                    <p>
                      The department is currently working on resolving this issue. You can check
                      here for updates.
                    </p>
                  </div>
                )}
                {status === "resolved" && (
                  <div className="flex gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
                    <p>
                      This issue has been marked as resolved by the authorities. If you still face
                      problems, you can report a new issue with updated details.
                    </p>
                  </div>
                )}
                {status === "closed" && (
                  <div className="flex gap-2">
                    <CheckCircle className="w-4 h-4 text-gray-500 mt-0.5" />
                    <p>
                      The case for this issue is closed by the department. You can still see all
                      details here for your records.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right: meta info */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Issue Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm text-gray-700">
                <div className="flex items-start gap-3">
                  <MapPin className="w-4 h-4 text-gray-400 mt-1" />
                  <div>
                    <p className="font-medium text-gray-900">Location</p>
                    <p>{locationName}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Calendar className="w-4 h-4 text-gray-400 mt-1" />
                  <div>
                    <p className="font-medium text-gray-900">Reported on</p>
                    <p>{createdAt ? createdAt.toLocaleString() : "—"}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Clock className="w-4 h-4 text-gray-400 mt-1" />
                  <div>
                    <p className="font-medium text-gray-900">Last updated</p>
                    <p>{updatedAt ? updatedAt.toLocaleString() : "—"}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-4 h-4 text-gray-400 mt-1" />
                  <div>
                    <p className="font-medium text-gray-900">Priority</p>
                    <p className="capitalize">{priority}</p>
                  </div>
                </div>

                {typeof row.satisfaction_rating === "number" && (
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-4 h-4 text-green-500 mt-1" />
                    <div>
                      <p className="font-medium text-gray-900">Your feedback</p>
                      <p>
                        Satisfaction rating:{" "}
                        <span className="font-semibold">{row.satisfaction_rating}/5</span>
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Need more help?</CardTitle>
                <CardDescription>What you can do if the problem continues</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-gray-700">
                <p>
                  If the issue has not improved even after being marked as resolved, you can submit
                  a new report with updated photos and description.
                </p>
                <Link href="/citizen/report">
                  <span className="inline-flex text-sm text-green-600 hover:underline">
                    Report another issue
                  </span>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
