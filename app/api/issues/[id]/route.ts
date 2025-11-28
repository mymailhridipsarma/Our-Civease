import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabaseClient"

export const dynamic = "force-dynamic"

type RouteParams = {
  params: { id: string }
}

// GET /api/issues/[id]
export async function GET(_req: Request, { params }: RouteParams) {
  const { id } = params

  const { data, error } = await supabase
    .from("issues")
    .select("*")
    .eq("id", id)
    .single()

  if (error) {
    console.error("Error fetching issue:", error)
    return NextResponse.json({ error: "Issue not found" }, { status: 404 })
  }

  return NextResponse.json(data)
}

// PATCH /api/issues/[id] – update status/fields
export async function PATCH(req: Request, { params }: RouteParams) {
  const { id } = params
  const body = await req.json()

  const { data, error } = await supabase
    .from("issues")
    .update(body)
    .eq("id", id)
    .select("*")
    .single()

  if (error) {
    console.error("Error updating issue:", error)
    return NextResponse.json({ error: "Failed to update issue" }, { status: 500 })
  }

  return NextResponse.json(data)
}

// DELETE /api/issues/[id]
export async function DELETE(_req: Request, { params }: RouteParams) {
  const { id } = params

  const { error } = await supabase.from("issues").delete().eq("id", id)

  if (error) {
    console.error("Error deleting issue:", error)
    return NextResponse.json({ error: "Failed to delete issue" }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
