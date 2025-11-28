import { supabase } from "@/lib/supabaseClient"

type PageProps = { params: { id: string } }

export const dynamic = "force-dynamic"

export default async function IssueDetailsPage({ params }: PageProps) {
  const { id } = params

  const [
    { data: issueRow, error: issueError },
    { data: comments, error: commentsError },
  ] = await Promise.all([
    supabase.from("issues").select("*").eq("id", id).single(),
    supabase
      .from("comments")
      .select("*")
      .eq("issue_id", id)
      .order("created_at", { ascending: true }),
  ])

  if (issueError || !issueRow) {
    console.error("Error loading issue:", issueError)
    return <div className="p-6">Issue not found.</div>
  }

  if (commentsError) {
    console.error("Error loading comments:", commentsError)
  }

  // Map DB row -> UI shape
  const statusMap: Record<string, string> = {
    open: "pending",
    in_progress: "in-progress",
    resolved: "resolved",
    closed: "closed",
  }

  const issue = {
    id: issueRow.id,
    title: issueRow.title ?? "",
    description: issueRow.description ?? "",
    status: statusMap[issueRow.status] ?? issueRow.status ?? "pending",
    priority: issueRow.priority ?? "medium",
    locationName: issueRow.location_name ?? "Not specified",
    createdAt: issueRow.created_at,
    updatedAt: issueRow.updated_at ?? issueRow.created_at,
    images: Array.isArray(issueRow.photo_urls) ? issueRow.photo_urls : [],
  }

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-semibold">{issue.title}</h1>

      <p className="text-sm opacity-70">
        Status:{" "}
        <span className="font-medium">
          {issue.status.replace("-", " ")}
        </span>
        {" · "}
        Priority: <span className="font-medium">{issue.priority}</span>
      </p>

      <p className="text-sm opacity-70">
        Location: <span className="font-medium">{issue.locationName}</span>
      </p>

      <p className="mt-2">{issue.description}</p>

      {issue.images.length > 0 && (
        <div className="mt-4 flex gap-2 flex-wrap">
          {issue.images.map((url: string, i: number) => (
            <img
              key={i}
              src={url || "/placeholder.svg"}
              alt={`Issue photo ${i + 1}`}
              className="w-24 h-24 object-cover rounded border"
            />
          ))}
        </div>
      )}

      <hr className="my-4" />

      <h2 className="text-xl font-semibold">Comments</h2>
      {(!comments || comments.length === 0) && (
        <p className="text-sm opacity-70">No comments yet.</p>
      )}

      <ul className="space-y-2">
        {comments?.map((c: any) => (
          <li key={c.id} className="border rounded-md px-3 py-2 text-sm">
            <p>{c.content}</p>
            <p className="text-xs opacity-60 mt-1">
              {c.created_at
                ? new Date(c.created_at).toLocaleString()
                : ""}
            </p>
          </li>
        ))}
      </ul>
    </div>
  )
}
