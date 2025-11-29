import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabaseClient"

type RouteParams = { params: { id: string } }

export const dynamic = "force-dynamic"

// PATCH /api/issues/:id  (update assigned_to, status)
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
      // map app status -> DB status
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

    // return same shape as /api/issues
    const statusMap: Record<string, string> = {
      open: "pending",
      in_progress: "in-progress",
      resolved: "resolved",
      closed: "closed",
    }

    const mapped = {
      id: data.id,
      title: data.title ?? "",
      description: data.description ?? "",
      status: statusMap[data.status] ?? data.status ?? "pending",
      priority: data.priority ?? "medium",
      category: "General",
      location: { address: data.location_name ?? "Not specified" },
      images: Array.isArray(data.photo_urls) ? data.photo_urls : [],
      assignedTo: data.assigned_to ?? null,
      createdAt: data.created_at,
      updatedAt: data.updated_at ?? data.created_at,
    }

    return NextResponse.json(mapped)
  } catch (err: any) {
    console.error("PATCH /api/issues/:id error:", err)
    return NextResponse.json(
      { error: err?.message || "Failed to update issue" },
      { status: 500 },
    )
  }
}
