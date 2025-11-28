import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabaseClient"
import bcrypt from "bcryptjs"

export const dynamic = "force-dynamic"

// POST /api/auth/login
export async function POST(req: Request) {
  try {
    const { email, password } = await req.json()

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password required" },
        { status: 400 },
      )
    }

    const { data: user, error } = await supabase
      .from("users")
      .select("*")
      .eq("email", email)
      .single()

    if (error || !user) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    }

    // Assuming you have `password_hash` column in `users`
    const isValid = await bcrypt.compare(password, user.password_hash)

    if (!isValid) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    }

    // TODO: create a JWT or session cookie
    // For now just return the user data (without password_hash)
    const { password_hash, ...safeUser } = user

    return NextResponse.json({ user: safeUser })
  } catch (err) {
    console.error("Auth error:", err)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}
