import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabaseClient"

export const dynamic = "force-dynamic"

export async function GET() {
  // Map DB statuses → analytics buckets
  const dbToBucket: Record<string, keyof typeof initialStats> = {
    open: "openIssues",
    in_progress: "inProgressIssues",
    resolved: "resolvedIssues",
    closed: "closedIssues",
  }

  const initialStats = {
    totalIssues: 0,
    openIssues: 0,
    inProgressIssues: 0,
    resolvedIssues: 0,
    closedIssues: 0,
  }

  // Get all counts in one query
  const { data, error } = await supabase
    .from("issues")
    .select("status", { count: "exact", head: false })

  if (error) {
    console.error("Error fetching analytics:", error)
    return NextResponse.json(
      { error: "Failed to fetch analytics" },
      { status: 500 },
    )
  }

  const stats = { ...initialStats }

  if (data) {
    stats.totalIssues = data.length

    for (const row of data) {
      const bucket = dbToBucket[row.status as string]
      if (bucket) {
        stats[bucket] += 1
      }
    }
  }

  return NextResponse.json(stats)
}
