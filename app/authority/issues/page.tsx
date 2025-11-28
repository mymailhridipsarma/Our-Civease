import { supabase } from "@/lib/supabaseClient"

type PageProps = { params: { id: string } }

export const dynamic = "force-dynamic"

export default async function IssueDetailsPage({ params }: PageProps) {
  const { id } = params

  const [{ data: issue, error: issueError }, { data: comments, error: commentsError }] =
    await Promise.all([
      supabase.from("issues").select("*").eq("id", id).single(),
      supabase
        .from("comments")
        .select("*")
        .eq("issue_id", id)
        .order("created_at", { ascending: true }),
    ])

  if (issueError || !issue) {
    console.error("Error loading issue:", issueError)
    return <div className="p-6">Issue not found.</div>
  }

  if (commentsError) {
    console.error("Error loading comments:", commentsError)
  }

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-semibold">{issue.title}</h1>
      <p className="text-sm opacity-70">
        Status: <span className="font-medium">{issue.status}</span>
      </p>
      <p className="mt-2">{issue.description}</p>

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
              {new Date(c.created_at).toLocaleString()}
            </p>
          </li>
        ))}
      </ul>
    </div>
  )
}
