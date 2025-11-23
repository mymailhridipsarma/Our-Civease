"use client"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Shield, LayoutDashboard, FileText, BarChart3, Settings, LogOut, Bell } from "lucide-react"

export function AuthorityNav() {
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
          <Link href="/authority/dashboard" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">CivEase Authority</h1>
              <p className="text-xs text-gray-500">Government Portal</p>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-6">
            <Link href="/authority/dashboard" className="flex items-center gap-2 text-gray-600 hover:text-green-600">
              <LayoutDashboard className="w-4 h-4" />
              Dashboard
            </Link>
            <Link href="/authority/issues" className="flex items-center gap-2 text-gray-600 hover:text-green-600">
              <FileText className="w-4 h-4" />
              Issues
              <Badge variant="secondary" className="ml-1">
                12
              </Badge>
            </Link>
            <Link href="/authority/analytics" className="flex items-center gap-2 text-gray-600 hover:text-green-600">
              <BarChart3 className="w-4 h-4" />
              Analytics
            </Link>
            <Link href="/authority/settings" className="flex items-center gap-2 text-gray-600 hover:text-green-600">
              <Settings className="w-4 h-4" />
              Settings
            </Link>
          </nav>

          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" className="relative">
              <Bell className="w-4 h-4" />
              <Badge className="absolute -top-1 -right-1 w-5 h-5 p-0 flex items-center justify-center text-xs bg-red-500">
                3
              </Badge>
            </Button>
            <Button variant="outline" onClick={handleLogout} className="flex items-center gap-2 bg-transparent">
              <LogOut className="w-4 h-4" />
              Logout
            </Button>
          </div>
        </div>
      </div>
    </header>
  )
}
