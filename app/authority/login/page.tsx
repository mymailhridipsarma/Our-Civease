import { AuthForm } from "@/components/auth-form"

export default function AuthorityLoginPage() {
  return (
    <AuthForm
      type="login"
      role="authority"
      title="Authority Portal"
      description="Access your dashboard to manage community issues"
    />
  )
}
