// lib/mock-data.ts
// Temporary stub so imports don't break while we move to Supabase

export type IssueStatus = 'open' | 'in_progress' | 'resolved' | 'rejected'

export const mockIssues: any[] = []       // not used once Supabase is wired
export const mockComments: any[] = []
export const mockUsers: any[] = []

export const mockAnalytics = {
  totalIssues: 0,
  openIssues: 0,
  inProgressIssues: 0,
  resolvedIssues: 0,
  rejectedIssues: 0,
}
