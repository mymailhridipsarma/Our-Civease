import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabaseClient"

export const dynamic = "force-dynamic"

type RouteParams = {
  params: { id: string }
}

const statusMap: Record<string, string> = {
  open: "pending",
  in_progress: "in-progress",
  resolved: "resolved",
  closed: "closed",
}

const reverseStatusMap: Record<string, string> = {
  pending: "open",
  "in-progress": "in_progress",
  resolved: "resolved",
  closed: "closed",
}

function mapDbIssue(row: any) {
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

// GET /api/issues/:id – single issue if you ever need it
export async function GET(_req: Request, { params }: RouteParams) {
  const { id } = params

  const { data, error } = await supabase
    .from("issues")
    .select("*")
    .eq("id", id)
    .single()

  if (error || !data) {
    console.error("GET /api/issues/[id] error:", error)
    return NextResponse.json(
      { error: error?.message || "Issue not found" },
      { status: 404 },
    )
  }

  return NextResponse.json(mapDbIssue(data))
}

// PATCH /api/issues/:id – assign / change status
export async function PATCH(req: Request, { params }: RouteParams) {
  const { id } = params

  try {
    const body = await req.json()
    const { status, assignedTo, assignedBy, notes } = body as {
      status?: string
      assignedTo?: string | null
      assignedBy?: string | null
      notes?: string | null
    }

    const update: any = {}

    if (status) {
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

    // 1) Update main issue
    const { data, error } = await supabase
      .from("issues")
      .update(update)
      .eq("id", id)
      .select("*")
      .single()

    if (error || !data) {
      console.error("PATCH /api/issues/[id] update error:", error)
      return NextResponse.json(
        { error: error?.message || "Failed to update issue" },
        { status: 500 },
      )
    }

    // 2) Log into issue_assignments (for audit history)
    const effectiveAssignedTo = assignedTo ?? null
    const effectiveAssignedBy = assignedBy ?? assignedTo // for "Assign to me" both are same

    if (effectiveAssignedBy) {
      const { error: assignError } = await supabase
        .from("issue_assignments")
        .insert([
          {
            issue_id: id,
            assigned_to: effectiveAssignedTo,
            assigned_by: effectiveAssignedBy,
            assignment_status: "assigned",
            notes: notes ?? null,
          },
        ])

      if (assignError) {
        console.error(
          "Error inserting issue_assignments row:",
          assignError,
        )
        // we don't fail the whole request, just log it
      }
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
