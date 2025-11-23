import { type NextRequest, NextResponse } from "next/server"
import { mockIssues } from "@/lib/mock-data"

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const citizenId = searchParams.get("citizenId")
  const status = searchParams.get("status")
  const category = searchParams.get("category")

  let filteredIssues = [...mockIssues]

  if (citizenId) {
    filteredIssues = filteredIssues.filter((issue) => issue.citizenId === citizenId)
  }

  if (status) {
    filteredIssues = filteredIssues.filter((issue) => issue.status === status)
  }

  if (category) {
    filteredIssues = filteredIssues.filter((issue) => issue.category === category)
  }

  return NextResponse.json(filteredIssues)
}

export async function POST(request: NextRequest) {
  try {
    const issueData = await request.json()

    const newIssue = {
      id: String(mockIssues.length + 1),
      ...issueData,
      status: "pending",
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    mockIssues.push(newIssue)

    return NextResponse.json(newIssue, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: "Failed to create issue" }, { status: 500 })
  }
}
