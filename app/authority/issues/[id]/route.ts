import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabaseClient"

export const dynamic = "force-dynamic"

type RouteParams = {
  params: { id: string }
}

// helper: map DB → frontend Issue (same shape as /api/issues)
function mapDbIssue(row: any) {
  const statusMap: Record<string, string> = {
    open: "pending",
    in_progress: "in-progress",
    resolved: "resolved",
    closed: "closed",
  }

  return {
    id: row.id,
    title: row.title ?? "",
    description: row.description ?? "",
    status: statusMap[row.status] ?? row.status ?? "pending",
    priority: row.priority ?? "medium",
    category: "General",
    location: {
      address: row.location_name ?? "Not specified",
    },
    images: Array.isArray(row.photo_urls) ? row.photo_urls : [],
    assignedTo: row.assigned_to ?? null,
    createdAt: row.created_at,
    updatedAt: row.updated_at ?? row.created_at,
  }
}

// PATCH /api/issues/:id  – update status / assigned_to
export async function PATCH(req: Request, { params }: RouteParams) {
  const { id } = params

  try {
    const body = await req.json()
    const { status, assignedTo } = body as {
      status?: string
      assignedTo?: string | null
    }

    const update: any = {}

    if (status) {
      // app status -> DB status
      const reverseStatusMap: Record<string, string> = {
        pending: "open",
        "in-progress": "in_progress",
        resolved: "resolved",
        closed: "closed",
      }
      update.status = reverseStatusMap[status] ?? status
    }

    if (typeof assignedTo !== "undefined") {
      update.assigned_to = assignedTo
    }

    if (Object.keys(update).length === 0) {
      return NextResponse.json(
        { error: "Nothing to update" },
        { status: 400 },
      )
    }

    const { data, error } = await supabase
      .from("issues")
      .update(update)
      .eq("id", id)
      .select("*")
      .single()

    if (error || !data) {
      console.error("Error updating issue:", error)
      return NextResponse.json(
        { error: error?.message || "Failed to update issue" },
        { status: 500 },
      )
    }

    return NextResponse.json(mapDbIssue(data))
  } catch (err: any) {
    console.error("PATCH /api/issues/[id] error:", err)
    return NextResponse.json(
      { error: err?.message || "Failed to update issue" },
      { status: 500 },
    )
  }
}
