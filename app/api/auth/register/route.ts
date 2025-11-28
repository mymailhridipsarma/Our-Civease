import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabaseClient"
import bcrypt from "bcryptjs"

export const dynamic = "force-dynamic"

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const {
      email,
      password,
      fullName,
      phone,
      role,
      departmentId,
    }: {
      email: string
      password: string
      fullName?: string
      phone?: string
      role?: string
      departmentId?: string
    } = body

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 },
      )
    }

    // 1) Check if user already exists
    const { data: existingUser, error: existingError } = await supabase
      .from("users")
      .select("id")
      .eq("email", email)
      .maybeSingle()

    if (existingError) {
      console.error("Error checking existing user:", existingError)
      return NextResponse.json(
        { error: "Failed to check existing user" },
        { status: 500 },
      )
    }

    if (existingUser) {
      return NextResponse.json(
        { error: "An account with this email already exists" },
        { status: 409 },
      )
    }

    // 2) Hash password
    const password_hash = await bcrypt.hash(password, 10)

    // 3) Insert new user
    const insertPayload = {
      email,
      password_hash,
      full_name: fullName ?? null,
      phone: phone ?? null,
      role: role ?? "citizen", // citizen by default
      department_id: departmentId ?? null,
      is_active: true,
    }

    const { data: newUser, error: insertError } = await supabase
      .from("users")
      .insert(insertPayload)
      .select("*")
      .single()

    if (insertError) {
      console.error("Error inserting user:", insertError)
      return NextResponse.json(
        { error: "Failed to create account" },
        { status: 500 },
      )
    }

    // Remove password_hash before sending back
    const { password_hash: _pw, ...safeUser } = newUser

    return NextResponse.json({ user: safeUser }, { status: 201 })
  } catch (error) {
    console.error("Error in POST /api/auth/register:", error)
    return NextResponse.json(
      { error: "Something went wrong while creating account" },
      { status: 500 },
    )
  }
}
