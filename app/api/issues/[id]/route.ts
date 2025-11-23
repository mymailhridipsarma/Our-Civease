import { type NextRequest, NextResponse } from "next/server"
import { mockIssues } from "@/lib/mock-data"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const issue = mockIssues.find((i) => i.id === params.id)

  if (!issue) {
    return NextResponse.json({ error: "Issue not found" }, { status: 404 })
  }

  return NextResponse.json(issue)
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const updates = await request.json()
    const issueIndex = mockIssues.findIndex((i) => i.id === params.id)

    if (issueIndex === -1) {
      return NextResponse.json({ error: "Issue not found" }, { status: 404 })
    }

    mockIssues[issueIndex] = {
      ...mockIssues[issueIndex],
      ...updates,
      updatedAt: new Date(),
    }

    return NextResponse.json(mockIssues[issueIndex])
  } catch (error) {
    return NextResponse.json({ error: "Failed to update issue" }, { status: 500 })
  }
}
