"use client"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { MessageSquare, Home, Plus, List, User, LogOut } from "lucide-react"

export function CitizenNav() {
  const router = useRouter()

  const handleLogout = () => {
    localStorage.removeItem("user")
    localStorage.removeItem("token")
    router.push("/")
  }

  return (
    <header className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/citizen/dashboard" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <MessageSquare className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-bold text-gray-900">CivEase</h1>
          </Link>

          <nav className="hidden md:flex items-center gap-6">
            <Link href="/citizen/dashboard" className="flex items-center gap-2 text-gray-600 hover:text-blue-600">
              <Home className="w-4 h-4" />
              Dashboard
            </Link>
            <Link href="/citizen/report" className="flex items-center gap-2 text-gray-600 hover:text-blue-600">
              <Plus className="w-4 h-4" />
              Report Issue
            </Link>
            <Link href="/citizen/issues" className="flex items-center gap-2 text-gray-600 hover:text-blue-600">
              <List className="w-4 h-4" />
              My Issues
            </Link>
            <Link href="/citizen/profile" className="flex items-center gap-2 text-gray-600 hover:text-blue-600">
              <User className="w-4 h-4" />
              Profile
            </Link>
          </nav>

          <Button variant="outline" onClick={handleLogout} className="flex items-center gap-2 bg-transparent">
            <LogOut className="w-4 h-4" />
            Logout
          </Button>
        </div>
      </div>
    </header>
  )
}
