import { type NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabaseClient"

export const dynamic = "force-dynamic"

// 🔧 Make DB row look like the Issue type your frontend uses
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
    status: statusMap[row.status] ?? "pending",
    priority: row.priority ?? "medium",

    // Your frontend expects a string "category"
    // For now we just send something readable (you can improve later with a join)
    category: "General",

    // Your frontend uses issue.location.address
    location: {
      address: row.location_name ?? "Not specified",
    },

    // Frontend expects an array of image URLs
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
      status: "open",                 // DB value
      citizen_id: citizenId,          // NOT NULL in your schema
      category_id: categoryId ?? null,
      department_id: departmentId ?? null,
      latitude: latitude ?? null,
      longitude: longitude ?? null,
      location_name: locationName ?? null,
      photo_urls: Array.isArray(photoUrls) ? photoUrls : [],
    }

    const { data, error } = await supabase
      .from("issues")
      .insert([payload])
      .select("*")
      .single()

    if (error) {
      console.error("Error creating issue:", error)
      return NextResponse.json(
        { error: error.message || "Failed to create issue" },
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
