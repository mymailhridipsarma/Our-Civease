"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2 } from "lucide-react"

interface AuthFormProps {
  type: "login" | "register"
  role: "citizen" | "authority"
  title: string
  description: string
}

export function AuthForm({ type, role, title, description }: AuthFormProps) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [name, setName] = useState("")
  const [phone, setPhone] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const body: any = {
        type,        // "login" or "register" → backend can switch on this
        role,        // "citizen" | "authority"
        email,
        password,
      }

      if (type === "register") {
        body.name = name
        body.phone = phone
      }

      const response = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })

      const data = await response.json()

      if (!response.ok) {
        // backend can send { error: "message" }
        throw new Error(data?.error || "Authentication failed")
      }

      // Support both shapes:
      // { user, token? } OR just { id, email, ... }
      const user = data.user ?? data
      const token = data.token

      if (!user) {
        throw new Error("No user returned from server")
      }

      // Store user data in localStorage (for now; in real app use httpOnly cookie/session)
      if (typeof window !== "undefined") {
        localStorage.setItem("user", JSON.stringify(user))
        if (token) {
          localStorage.setItem("token", token)
        }
      }

      // Redirect based on role
      if (role === "citizen") {
        router.push("/citizen/dashboard")
      } else {
        router.push("/authority/dashboard")
      }
    } catch (err: any) {
      setError(err?.message || "Invalid credentials. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-green-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {type === "register" && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>
              </>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {type === "login" ? "Sign In" : "Create Account"}
            </Button>
          </form>

          <div className="mt-4 text-center text-sm">
            {type === "login" ? (
              <p>
                {"Don't have an account? "}
                <a href={`/${role}/register`} className="text-blue-600 hover:underline">
                  Sign up
                </a>
              </p>
            ) : (
              <p>
                Already have an account?{" "}
                <a href={`/${role}/login`} className="text-blue-600 hover:underline">
                  Sign in
                </a>
              </p>
            )}
          </div>

          {/* Demo credentials */}
          <div className="mt-6 p-3 bg-gray-50 rounded-lg text-xs">
            <p className="font-medium mb-1">Demo Credentials:</p>
            {role === "citizen" ? (
              <p>
                Email: citizen@gmail.com
                <br />
                Password: demo@123
              </p>
            ) : (
              <p>
                Email: authority@cityworks.gov
                <br />
                Password: password123
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
