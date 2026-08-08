/* eslint-disable jsx-a11y/label-has-associated-control */
"use client";
import { FormEvent, useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase, isConfigured } from "@/lib/supabase";
import { LoaderCircle } from "./icons";

export function AuthGate({ children }: { children: (session: Session) => React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(isConfigured);
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [error, setError] = useState("");
  useEffect(() => {
    if (!isConfigured) return;
    supabase.auth.getSession().then(({ data }) => { setSession(data.session); setLoading(false); });
    const { data } = supabase.auth.onAuthStateChange((_event, next) => setSession(next));
    return () => data.subscription.unsubscribe();
  }, []);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setError(""); setLoading(true);
    const form = new FormData(event.currentTarget); const email = String(form.get("email")); const password = String(form.get("password"));
    const result = mode === "login" ? await supabase.auth.signInWithPassword({ email, password }) : await supabase.auth.signUp({ email, password });
    if (result.error) setError(result.error.message); else if (mode === "signup" && !result.data.session) setError("Check your email to confirm your account, then sign in.");
    setLoading(false);
  }
  if (loading) return <div className="auth"><LoaderCircle className="spin" size={32}/></div>;
  if (!isConfigured) return <div className="auth"><div className="authbox"><div className="authbrand">clay</div><p className="tagline">Capture today.<br/>Close tomorrow.</p><div className="card warn"><b>Connect Supabase to begin</b><p className="muted small">Copy .env.example to .env.local, add your Supabase URL and anonymous key, then restart the app.</p></div></div></div>;
  if (!session) return <div className="auth"><div className="authbox"><div className="authbrand">clay</div><p className="tagline">Capture today.<br/>Close tomorrow.</p><form className="form" onSubmit={submit}><div className="field"><label>Email</label><input className="input" name="email" type="email" autoComplete="email" required/></div><div className="field"><label>Password</label><input className="input" name="password" type="password" autoComplete={mode === "login" ? "current-password" : "new-password"} minLength={6} required/></div>{error&&<div className="card error small">{error}</div>}<button className="primary" disabled={loading}>{loading ? "Working…" : mode === "login" ? "Sign in" : "Create account"}</button></form><div className="divider"/><button className="link" onClick={() => {setError("");setMode(mode === "login" ? "signup" : "login")}}>{mode === "login" ? "New to Clay? Create an account" : "Already have an account? Sign in"}</button></div></div>;
  return <>{children(session)}</>;
}
