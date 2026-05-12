"use client";

import { useEffect, useState, useCallback } from "react";

const KEY = "echo_auth";

export interface AuthUser {
  name: string;
  email: string;
  isDemo: boolean;
}

function readStorage(): AuthUser | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as AuthUser) : null;
  } catch {
    return null;
  }
}

export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setUser(readStorage());
    setReady(true);
  }, []);

  const signIn = useCallback((u: AuthUser) => {
    localStorage.setItem(KEY, JSON.stringify(u));
    setUser(u);
  }, []);

  const signInDemo = useCallback(() => {
    const demo: AuthUser = { name: "Kasey Baylor", email: "demo@echo.app", isDemo: true };
    localStorage.setItem(KEY, JSON.stringify(demo));
    setUser(demo);
  }, []);

  const signOut = useCallback(() => {
    localStorage.removeItem(KEY);
    setUser(null);
  }, []);

  return { user, ready, signIn, signInDemo, signOut, isAuthed: !!user };
}
