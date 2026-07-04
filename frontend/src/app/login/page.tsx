import { LoginForm } from "@/components/ui/login-form"

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-950 p-4 md:p-8 relative overflow-hidden">
      {/* Dynamic Background Elements */}
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-indigo-600/20 rounded-full blur-[120px] mix-blend-screen animate-pulse" style={{ animationDuration: '8s' }} />
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-violet-600/20 rounded-full blur-[120px] mix-blend-screen animate-pulse" style={{ animationDuration: '10s' }} />
      
      <div className="w-full max-w-md z-10">
        <LoginForm />
      </div>
    </div>
  )
}
