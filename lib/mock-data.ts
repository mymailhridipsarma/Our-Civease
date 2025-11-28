// lib/data.ts
import { supabase } from './supabaseClient'

// ---- Types (adjust to match your DB schema) ---- //
export type IssueStatus = 'open' | 'in_progress' | 'resolved' | 'rejected'

export interface Issue {
  id: string
  title: string
  description: string
  status: IssueStatus
  category_id: string | null
  department_id: string | null
  created_at: string
  updated_at: string | null
  created_by: string | null
}

export interface Comment {
  id: string
  issue_id: string
  author_id: string | null
  content: string
  created_at: string
}

export interface Notification {
  id: string
  user_id: string
  title: string
  body: string
  is_read: boolean
  created_at: string
}

export interface Department {
  id: string
  name: string
  slug: string
}

export interface User {
  id: string
  name: string | null
  email: string
  role: 'citizen' | 'authority' | 'admin'
  department_id: string | null
}

// ---- Issues ---- //

export async function getIssuesForAuthority(departmentId?: string) {
  let query = supabase
    .from('issues')
    .select(
      `
      id,
      title,
      description,
      status,
      category_id,
      department_id,
      created_at,
      updated_at,
      created_by
    `
    )
    .order('created_at', { ascending: false })

  if (departmentId) {
    query = query.eq('department_id', departmentId)
  }

  const { data, error } = await query

  if (error) {
    console.error('Error fetching issues:', error.message)
    throw error
  }

  return (data ?? []) as Issue[]
}

export async function getIssueById(issueId: string) {
  const { data, error } = await supabase
    .from('issues')
    .select(
      `
      id,
      title,
      description,
      status,
      category_id,
      department_id,
      created_at,
      updated_at,
      created_by
    `
    )
    .eq('id', issueId)
    .single()

  if (error) {
    console.error('Error fetching issue:', error.message)
    throw error
  }

  return data as Issue
}

export async function updateIssueStatus(issueId: string, status: IssueStatus) {
  const { data, error } = await supabase
    .from('issues')
    .update({ status })
    .eq('id', issueId)
    .select()
    .single()

  if (error) {
    console.error('Error updating issue status:', error.message)
    throw error
  }

  return data as Issue
}

// ---- Comments ---- //

export async function getCommentsForIssue(issueId: string) {
  const { data, error } = await supabase
    .from('comments')
    .select(
      `
      id,
      issue_id,
      author_id,
      content,
      created_at
    `
    )
    .eq('issue_id', issueId)
    .order('created_at', { ascending: true })

  if (error) {
    console.error('Error fetching comments:', error.message)
    throw error
  }

  return (data ?? []) as Comment[]
}

export async function addComment(issueId: string, authorId: string | null, content: string) {
  const { data, error } = await supabase
    .from('comments')
    .insert([{ issue_id: issueId, author_id: authorId, content }])
    .select()
    .single()

  if (error) {
    console.error('Error adding comment:', error.message)
    throw error
  }

  return data as Comment
}

// ---- Notifications ---- //

export async function getNotificationsForUser(userId: string) {
  const { data, error } = await supabase
    .from('notifications')
    .select(
      `
      id,
      user_id,
      title,
      body,
      is_read,
      created_at
    `
    )
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching notifications:', error.message)
    throw error
  }

  return (data ?? []) as Notification[]
}

export async function markNotificationRead(notificationId: string) {
  const { data, error } = await supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('id', notificationId)
    .select()
    .single()

  if (error) {
    console.error('Error marking notification as read:', error.message)
    throw error
  }

  return data as Notification
}

// ---- Departments & Users ---- //

export async function getDepartments() {
  const { data, error } = await supabase
    .from('departments')
    .select('id, name, slug')
    .order('name', { ascending: true })

  if (error) {
    console.error('Error fetching departments:', error.message)
    throw error
  }

  return (data ?? []) as Department[]
}

export async function getUserById(userId: string) {
  const { data, error } = await supabase
    .from('users')
    .select(
      `
      id,
      name,
      email,
      role,
      department_id
    `
    )
    .eq('id', userId)
    .single()

  if (error) {
    console.error('Error fetching user:', error.message)
    throw error
  }

  return data as User
}
