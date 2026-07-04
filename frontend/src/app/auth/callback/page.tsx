"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";

export default function AuthCallback() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const token = searchParams.get("token");
    if (token) {
      localStorage.setItem("access_token", token);
      router.push("/dashboard");
    } else {
      router.push("/login?error=AuthenticationFailed");
    }
  }, [router, searchParams]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-950">
      <div className="text-center space-y-4">
        <Loader2 className="w-12 h-12 text-indigo-500 animate-spin mx-auto" />
        <h2 className="text-xl font-semibold text-zinc-200">Authenticating...</h2>
        <p className="text-zinc-400">Please wait while we log you in.</p>
      </div>
    </div>
  );
}
