import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabaseClient"

export const dynamic = "force-dynamic"

export async function GET() {
  // Get counts per status
  const statuses = ["pending", "in_progress", "resolved", "rejected"]

  const counts: Record<string, number> = {}

  for (const status of statuses) {
    const { count, error } = await supabase
      .from("issues")
      .select("*", { count: "exact", head: true })
      .eq("status", status)

    if (error) {
      console.error(`Error counting ${status} issues:`, error)
      return NextResponse.json(
        { error: "Failed to fetch analytics" },
        { status: 500 },
      )
    }

    counts[status] = count ?? 0
  }

  // Total count
  const { count: totalCount, error: totalError } = await supabase
    .from("issues")
    .select("*", { count: "exact", head: true })

  if (totalError) {
    console.error("Error counting total issues:", totalError)
    return NextResponse.json(
      { error: "Failed to fetch analytics" },
      { status: 500 },
    )
  }

  const analytics = {
    totalIssues: totalCount ?? 0,
    pendingIssues: counts["pending"] ?? 0,
    inProgressIssues: counts["in_progress"] ?? 0,
    resolvedIssues: counts["resolved"] ?? 0,
    rejectedIssues: counts["rejected"] ?? 0,
  }

  return NextResponse.json(analytics)
}
