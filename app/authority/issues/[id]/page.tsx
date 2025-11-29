import { headers } from "next/headers"

type PageProps = { params: { id: string } }

export const dynamic = "force-dynamic"

export default async function IssueDetailsPage({ params }: PageProps) {
  const { id } = params

  // Build absolute URL so it works on Vercel + locally
  const headersList = headers()
  const host = headersList.get("host")
  const protocol = process.env.NODE_ENV === "development" ? "http" : "https"

  const res = await fetch(`${protocol}://${host}/api/issues/${id}`, {
    cache: "no-store",
  })

  if (!res.ok) {
    console.error("Error loading issue:", await res.text())
    return <div className="p-6">Issue not found.</div>
  }

  const apiIssue = await res.json()

  // Map API issue -> UI shape expected by your JSX
  const issue = {
    id: apiIssue.id,
    title: apiIssue.title ?? "",
    description: apiIssue.description ?? "",
    status: apiIssue.status ?? "pending",
    priority: apiIssue.priority ?? "medium",
    locationName: apiIssue.location?.address ?? "Not specified",
    createdAt: apiIssue.createdAt,
    updatedAt: apiIssue.updatedAt ?? apiIssue.createdAt,
    images: Array.isArray(apiIssue.images) ? apiIssue.images : [],
  }

  // Comments – keep UI but empty for now (no table needed)
  const comments: any[] = []

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
