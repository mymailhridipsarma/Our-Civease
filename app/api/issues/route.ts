import { type NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabaseClient"

export const dynamic = "force-dynamic"

// Map DB row -> frontend Issue shape
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

// GET /api/issues
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const citizenId = searchParams.get("citizenId")
  const status = searchParams.get("status")

  let query = supabase.from("issues").select("*").order("created_at", { ascending: false })

  if (citizenId) {
    query = query.eq("citizen_id", citizenId)
  }

  if (status && status !== "all") {
    const reverseStatusMap: Record<string, string> = {
      pending: "open",
      "in-progress": "in_progress",
      resolved: "resolved",
      closed: "closed",
    }
    query = query.eq("status", reverseStatusMap[status] ?? status)
  }

  const { data, error } = await query

  if (error) {
    console.error("Error fetching issues:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json((data ?? []).map(mapDbIssue))
}

// POST /api/issues – citizen reporting
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Read the known fields
    const {
      title,
      description,
      priority,
      citizenId,
      categoryId,
      departmentId,
      latitude,
      longitude,
      locationName,
      photoUrls,
    } = body

    // Also support a `location` object or plain `address` coming from frontend
    const location = body.location || null

    const derivedLocationName =
      (location && (location.address || location.name)) ||
      locationName ||
      body.address || // just in case
      null

    const derivedLatitude =
      latitude ??
      (location && (location.lat ?? location.latitude)) ??
      null

    const derivedLongitude =
      longitude ??
      (location && (location.lng ?? location.longitude)) ??
      null

    const derivedPhotoUrls = Array.isArray(photoUrls)
      ? photoUrls
      : Array.isArray(body.images)
      ? body.images
      : []

    if (!title || !description || !citizenId) {
      return NextResponse.json(
        { error: "title, description and citizenId are required" },
        { status: 400 },
      )
    }

    const payload = {
      title,
      description,
      priority: priority ?? "medium",
      status: "open",
      citizen_id: citizenId,
      category_id: categoryId ?? null,
      department_id: departmentId ?? null,
      latitude: derivedLatitude,
      longitude: derivedLongitude,
      location_name: derivedLocationName,
      photo_urls: derivedPhotoUrls,
    }

    const { data, error } = await supabase
      .from("issues")
      .insert([payload])
      .select("*")
      .single()

    if (error || !data) {
      console.error("Error creating issue:", error)
      return NextResponse.json(
        { error: error?.message || "Failed to create issue" },
        { status: 500 },
      )
    }

    return NextResponse.json(mapDbIssue(data), { status: 201 })
  } catch (err: any) {
    console.error("Error in POST /api/issues:", err)
    return NextResponse.json(
      { error: err?.message || "Failed to create issue" },
      { status: 500 },
    )
  }
}
