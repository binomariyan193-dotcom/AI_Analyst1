"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Loader2, ArrowRight, Mail } from "lucide-react"
import { useRouter } from "next/navigation"
import { api, API_URL } from "@/lib/api"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

export function LoginForm() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  async function onSubmit(event: React.SyntheticEvent) {
    event.preventDefault()
    setIsLoading(true)
    setError(null)
    
    const form = event.target as HTMLFormElement;
    const email = (form.elements.namedItem('email') as HTMLInputElement).value;
    const password = (form.elements.namedItem('password') as HTMLInputElement).value;

    try {
      const response = await api.post('/auth/login', {
        email,
        password
      });
      
      // Save token and redirect
      localStorage.setItem('access_token', response.data.access_token);
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.response?.data?.detail || "Invalid email or password");
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      <Card className="border-white/10 bg-white/5 backdrop-blur-xl shadow-2xl shadow-black/40 text-zinc-100 overflow-hidden relative">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 via-transparent to-violet-500/10 pointer-events-none" />
        
        <CardHeader className="space-y-2 text-center pb-8 pt-8 relative z-10">
          <motion.div
            initial={{ scale: 0.95 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="w-16 h-16 mx-auto bg-gradient-to-tr from-indigo-500 to-violet-500 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/30 mb-4"
          >
            <div className="w-8 h-8 border-t-2 border-r-2 border-white rounded-full animate-spin" style={{ animationDuration: '3s' }} />
          </motion.div>
          <CardTitle className="text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-br from-white to-zinc-400">
            Welcome back
          </CardTitle>
          <CardDescription className="text-zinc-400 text-sm">
            Enter your credentials to access the AI Analyst
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 relative z-10">
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm p-3 rounded-md">
              {error}
            </div>
          )}
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-medium text-zinc-300 uppercase tracking-wider" htmlFor="email">
                Email Address
              </label>
              <Input
                id="email"
                name="email"
                placeholder="name@example.com"
                type="email"
                defaultValue="admin@example.com"
                autoCapitalize="none"
                autoComplete="email"
                autoCorrect="off"
                disabled={isLoading}
                className="bg-zinc-900/50 border-zinc-700/50 text-white placeholder:text-zinc-500 h-12 focus-visible:ring-indigo-500 focus-visible:border-indigo-500"
                required
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium text-zinc-300 uppercase tracking-wider" htmlFor="password">
                  Password
                </label>
                <a href="#" className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors">
                  Forgot password?
                </a>
              </div>
              <Input
                id="password"
                name="password"
                placeholder="••••••••"
                type="password"
                defaultValue="password123"
                disabled={isLoading}
                className="bg-zinc-900/50 border-zinc-700/50 text-white placeholder:text-zinc-500 h-12 focus-visible:ring-indigo-500 focus-visible:border-indigo-500"
                required
              />
            </div>
            <div className="flex gap-4">
              <Button 
                type="submit"
                className="flex-1 h-12 bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-500/20 transition-all hover:shadow-indigo-500/40 relative overflow-hidden group border-none" 
                disabled={isLoading}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-[pulse_2s_ease-in-out_infinite]" />
                {isLoading ? (
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                ) : (
                  <>Login</>
                )}
              </Button>
              
              <Button 
                type="button"
                variant="outline"
                className="flex-1 h-12 border-zinc-700/50 bg-zinc-900/30 hover:bg-zinc-800 text-zinc-300 transition-all" 
                disabled={isLoading}
                onClick={() => setError("Registration endpoint is coming soon! For now, use the mock credentials to login.")}
              >
                Register
              </Button>
            </div>
          </form>
          
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-zinc-800" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-[#09090b] px-2 text-zinc-500 backdrop-blur-sm rounded-full">
                Or continue with
              </span>
            </div>
          </div>
          
          <div className="grid grid-cols-1 gap-4">
            <Button 
              variant="outline" 
              type="button" 
              onClick={() => window.location.href = `${API_URL}/auth/google/login`}
              disabled={isLoading} 
              className="w-full border-zinc-700/50 bg-zinc-900/30 hover:bg-zinc-800 text-zinc-300 h-11"
            >
              <svg className="mr-2 h-4 w-4" aria-hidden="true" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z" />
              </svg>
              Continue with Google
            </Button>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4 pb-8 relative z-10">
        </CardFooter>
      </Card>
    </motion.div>
  )
}
