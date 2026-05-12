"use client";

import { useEffect, useState, useCallback } from "react";

const KEY = "echo_auth";
const CREDS_KEY = "echo_credentials";

export interface AuthUser {
  name: string;
  email: string;
  isDemo: boolean;
}

interface StoredCredential {
  name: string;
  email: string;
  password: string;
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

function getCredentials(): StoredCredential[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(CREDS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveCredential(cred: StoredCredential) {
  const creds = getCredentials().filter((c) => c.email !== cred.email);
  creds.push(cred);
  localStorage.setItem(CREDS_KEY, JSON.stringify(creds));
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

  const register = useCallback(
    (name: string, email: string, password: string) => {
      saveCredential({ name, email, password });
      const u: AuthUser = { name, email, isDemo: false };
      localStorage.setItem(KEY, JSON.stringify(u));
      setUser(u);
    },
    []
  );

  const signInWithCredentials = useCallback(
    (email: string, password: string): { success: boolean; error?: string } => {
      const creds = getCredentials();
      const match = creds.find((c) => c.email === email);
      if (!match) return { success: false, error: "No account found with that email" };
      if (match.password !== password) return { success: false, error: "Incorrect password" };
      const u: AuthUser = { name: match.name, email: match.email, isDemo: false };
      localStorage.setItem(KEY, JSON.stringify(u));
      setUser(u);
      return { success: true };
    },
    []
  );

  const signInDemo = useCallback(() => {
    const demo: AuthUser = { name: "Kasey Baylor", email: "demo@echo.app", isDemo: true };
    localStorage.setItem(KEY, JSON.stringify(demo));
    setUser(demo);
  }, []);

  const signOut = useCallback(() => {
    localStorage.removeItem(KEY);
    setUser(null);
  }, []);

  return { user, ready, signIn, register, signInWithCredentials, signInDemo, signOut, isAuthed: !!user };
}
