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
            <br />
            <span className="text-xs text-zinc-500 mt-2 block">(Hint: Use admin@example.com / password123)</span>
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
                placeholder="name@example.com"
                type="email"
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
                placeholder="••••••••"
                type="password"
                disabled={isLoading}
                className="bg-zinc-900/50 border-zinc-700/50 text-white placeholder:text-zinc-500 h-12 focus-visible:ring-indigo-500 focus-visible:border-indigo-500"
                required
              />
            </div>
            <Button 
              type="submit"
              className="w-full h-12 bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-500/20 transition-all hover:shadow-indigo-500/40 relative overflow-hidden group border-none" 
              disabled={isLoading}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-[pulse_2s_ease-in-out_infinite]" />
              {isLoading ? (
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              ) : (
                <>
                  Sign In
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </Button>
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
          
          <div className="grid grid-cols-2 gap-4">
            <Button 
              variant="outline" 
              type="button" 
              onClick={() => window.location.href = `${API_URL}/auth/github/login`}
              disabled={isLoading} 
              className="border-zinc-700/50 bg-zinc-900/30 hover:bg-zinc-800 text-zinc-300 h-11"
            >
              <svg className="mr-2 h-4 w-4" aria-hidden="true" fill="currentColor" viewBox="0 0 24 24">
                <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
              </svg>
              GitHub
            </Button>
            <Button 
              variant="outline" 
              type="button" 
              onClick={() => window.location.href = `${API_URL}/auth/google/login`}
              disabled={isLoading} 
              className="border-zinc-700/50 bg-zinc-900/30 hover:bg-zinc-800 text-zinc-300 h-11"
            >
              <svg className="mr-2 h-4 w-4" aria-hidden="true" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z" />
              </svg>
              Google
            </Button>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4 pb-8 relative z-10">
          <p className="text-center text-sm text-zinc-400">
            Don't have an account?{" "}
            <a href="#" className="font-semibold text-indigo-400 hover:text-indigo-300 transition-colors">
              Sign up
            </a>
          </p>
        </CardFooter>
      </Card>
    </motion.div>
  )
}
