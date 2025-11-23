import type { User, Issue, Comment, Analytics } from "./types"

// Mock Users
export const mockUsers: User[] = [
  {
    id: "1",
    email: "john.citizen@email.com",
    name: "John Citizen",
    phone: "+1234567890",
    role: "citizen",
    createdAt: new Date("2024-01-15"),
  },
  {
    id: "2",
    email: "admin@cityworks.gov",
    name: "Sarah Johnson",
    role: "authority",
    department: "Public Works",
    createdAt: new Date("2024-01-10"),
  },
  {
    id: "3",
    email: "safety@cityworks.gov",
    name: "Mike Rodriguez",
    role: "authority",
    department: "Public Safety",
    createdAt: new Date("2024-01-12"),
  },
]

// Mock Issues
export const mockIssues: Issue[] = [
  {
    id: "1",
    title: "Pothole on Main Street",
    description: "Large pothole causing damage to vehicles near the intersection of Main St and Oak Ave.",
    category: "infrastructure",
    priority: "high",
    status: "in-progress",
    location: {
      address: "123 Main Street, Downtown",
      coordinates: { lat: 40.7128, lng: -74.006 },
    },
    images: ["/street-pothole.png"],
    citizenId: "1",
    assignedTo: "2",
    createdAt: new Date("2024-01-20"),
    updatedAt: new Date("2024-01-22"),
  },
  {
    id: "2",
    title: "Broken Streetlight",
    description: "Streetlight has been out for over a week, creating safety concerns for pedestrians.",
    category: "safety",
    priority: "medium",
    status: "pending",
    location: {
      address: "456 Oak Avenue, Residential District",
    },
    citizenId: "1",
    createdAt: new Date("2024-01-18"),
    updatedAt: new Date("2024-01-18"),
  },
  {
    id: "3",
    title: "Illegal Dumping",
    description: "Someone has dumped construction debris in the park area.",
    category: "environment",
    priority: "medium",
    status: "resolved",
    location: {
      address: "Central Park, East Side",
    },
    images: ["/illegal-dumping-debris.jpg"],
    citizenId: "1",
    assignedTo: "2",
    createdAt: new Date("2024-01-15"),
    updatedAt: new Date("2024-01-21"),
    resolvedAt: new Date("2024-01-21"),
  },
]

// Mock Comments
export const mockComments: Comment[] = [
  {
    id: "1",
    issueId: "1",
    userId: "2",
    content:
      "We have received your report and assigned a crew to assess the damage. Work should begin within 48 hours.",
    isInternal: false,
    createdAt: new Date("2024-01-21"),
  },
  {
    id: "2",
    issueId: "1",
    userId: "2",
    content: "Crew dispatched. Materials ordered.",
    isInternal: true,
    createdAt: new Date("2024-01-22"),
  },
]

// Mock Analytics
export const mockAnalytics: Analytics = {
  totalIssues: 247,
  resolvedIssues: 198,
  pendingIssues: 49,
  avgResolutionTime: 4.2,
  satisfactionRate: 89,
  issuesByCategory: {
    infrastructure: 89,
    safety: 67,
    environment: 45,
    utilities: 32,
    other: 14,
  },
  issuesByPriority: {
    low: 45,
    medium: 123,
    high: 67,
    urgent: 12,
  },
}
