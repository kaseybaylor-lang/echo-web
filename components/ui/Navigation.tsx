"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Mic2, Zap, LogOut, User } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

export default function Navigation() {
  const { user, ready, signOut } = useAuth();
  const router = useRouter();

  // Avoid a flash of wrong state before localStorage is read
  if (!ready) {
    return (
      <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-white/5 h-[64px]" />
    );
  }

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-white/5">
      <div className="grid grid-cols-3 items-center px-6 py-4">

        {/* Col 1: Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded-lg bg-[#6C63FF]/20 flex items-center justify-center group-hover:bg-[#6C63FF]/30 transition-colors">
            <Mic2 size={16} className="text-[#6C63FF]" />
          </div>
          <span className="font-semibold text-base tracking-tight">Echo</span>
        </Link>

        {/* Col 2: Center links */}
        <div className="hidden md:flex items-center justify-center gap-6">
          <Link href="/" className="text-sm font-medium text-white/60 hover:text-white transition-colors">
            Home
          </Link>
          {user ? (
            <>
              <Link href="/dashboard" className="text-sm font-medium text-white/60 hover:text-white transition-colors">
                Dashboard
              </Link>
              <Link href="/dashboard/professor" className="text-sm font-medium text-white/60 hover:text-white transition-colors">
                Professor View
              </Link>
            </>
          ) : (
            <Link
              href="/try"
              className="border border-white/15 text-white/70 hover:text-white hover:border-white/30 rounded-xl px-4 py-2 text-sm font-semibold transition-all"
            >
              Try for Free
            </Link>
          )}
        </div>

        {/* Col 3: Auth actions */}
        <div className="flex items-center justify-end gap-3">
          {user ? (
            <>
              {/* Signed-in state */}
              <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/8">
                <div className="w-5 h-5 rounded-full bg-[#6C63FF]/30 flex items-center justify-center">
                  <User size={11} className="text-[#6C63FF]" />
                </div>
                <span className="text-xs font-medium text-white/60 max-w-[100px] truncate">
                  {user.isDemo ? "Demo Account" : user.name}
                </span>
              </div>
              <button
                onClick={() => { signOut(); router.push("/"); }}
                className="flex items-center gap-1.5 text-sm text-white/40 hover:text-white/70 transition-colors"
                title="Sign out"
              >
                <LogOut size={14} />
                <span className="hidden md:inline text-xs">Sign out</span>
              </button>
            </>
          ) : (
            <>
              {/* Signed-out state */}
              <Link
                href="/onboarding"
                className="hidden md:inline text-sm text-white/50 hover:text-white transition-colors"
              >
                Sign in
              </Link>
              <Link
                href="/onboarding"
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#6C63FF] hover:bg-[#7B74FF] text-white text-sm font-semibold transition-all hover:shadow-lg hover:shadow-[#6C63FF]/25 active:scale-95"
              >
                <Zap size={14} />
                Start Free
              </Link>
            </>
          )}
        </div>

      </div>
    </nav>
  );
}
