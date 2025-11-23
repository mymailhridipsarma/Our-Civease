export interface User {
  id: string
  email: string
  name: string
  phone?: string
  role: "citizen" | "authority"
  department?: string
  createdAt: Date
}

export interface Issue {
  id: string
  title: string
  description: string
  category: "infrastructure" | "safety" | "environment" | "utilities" | "other"
  priority: "low" | "medium" | "high" | "urgent"
  status: "pending" | "in-progress" | "resolved" | "closed"
  location: {
    address: string
    coordinates?: { lat: number; lng: number }
  }
  images?: string[]
  citizenId: string
  assignedTo?: string
  createdAt: Date
  updatedAt: Date
  resolvedAt?: Date
}

export interface Comment {
  id: string
  issueId: string
  userId: string
  content: string
  isInternal: boolean
  createdAt: Date
}

export interface Analytics {
  totalIssues: number
  resolvedIssues: number
  pendingIssues: number
  avgResolutionTime: number
  satisfactionRate: number
  issuesByCategory: Record<string, number>
  issuesByPriority: Record<string, number>
}
