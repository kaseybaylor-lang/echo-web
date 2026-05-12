"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Mail, Lock, Mic2, ArrowRight } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import Link from "next/link";

export default function SignInPage() {
  const router = useRouter();
  const { signInWithCredentials } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      setError("");
      const result = signInWithCredentials(email, password);
      if (result.success) {
        router.push("/dashboard");
      } else {
        setError(result.error || "Sign in failed");
      }
    },
    [email, password, signInWithCredentials, router]
  );

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#0A0A0A] px-4">
      <div className="w-full max-w-sm flex flex-col gap-6">
        {/* Logo */}
        <div className="flex flex-col items-center gap-3 mb-2">
          <div className="w-14 h-14 rounded-2xl bg-[#6C63FF]/15 flex items-center justify-center">
            <Mic2 size={24} className="text-[#6C63FF]" />
          </div>
          <h1 className="text-2xl font-bold text-white">Sign in to Echo</h1>
          <p className="text-sm text-white/45">Welcome back. Enter your credentials below.</p>
        </div>

        {/* Error */}
        {error && (
          <div className="px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-sm text-red-400">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <div className="relative">
            <Mail size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@university.edu"
              required
              className="w-full pl-10 pr-4 py-3.5 rounded-xl glass border border-white/8 text-sm text-white placeholder:text-white/25 focus:outline-none focus:border-[#6C63FF]/50 focus:bg-white/6 transition-all"
            />
          </div>
          <div className="relative">
            <Lock size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              required
              className="w-full pl-10 pr-4 py-3.5 rounded-xl glass border border-white/8 text-sm text-white placeholder:text-white/25 focus:outline-none focus:border-[#6C63FF]/50 focus:bg-white/6 transition-all"
            />
          </div>

          <button
            type="submit"
            disabled={!email || !password}
            className="w-full py-4 rounded-2xl bg-[#6C63FF] hover:bg-[#7B74FF] disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold text-sm transition-all hover:shadow-xl hover:shadow-[#6C63FF]/30 active:scale-[0.98] flex items-center justify-center gap-2"
          >
            Sign In
            <ArrowRight size={16} />
          </button>
        </form>

        {/* Link to sign up */}
        <p className="text-center text-sm text-white/40">
          Don&apos;t have an account?{" "}
          <Link href="/onboarding" className="text-[#6C63FF] hover:text-[#7B74FF] font-medium transition-colors">
            Sign up free
          </Link>
        </p>
      </div>
    </div>
  );
}
