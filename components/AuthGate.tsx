/* eslint-disable jsx-a11y/label-has-associated-control */
"use client";
import { FormEvent, useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase, isConfigured } from "@/lib/supabase";
import { Check, LoaderCircle, Mail } from "./icons";

const passwordRule = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{12,}$/;
export const passwordHelp = "Use at least 12 characters with uppercase, lowercase, a number, and a symbol.";

export function AuthGate({ children }: { children: (session: Session) => React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(isConfigured);
  const [flow, setFlow] = useState<"login"|"forgot"|"magic"|"recovery">("login");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  useEffect(() => {
    if (!isConfigured) return;
    supabase.auth.getSession().then(({ data }) => { setSession(data.session); setLoading(false); });
    const { data } = supabase.auth.onAuthStateChange((event, next) => { setSession(next); if(event==="PASSWORD_RECOVERY") setFlow("recovery"); });
    return () => data.subscription.unsubscribe();
  }, []);
  async function login(event: FormEvent<HTMLFormElement>) { event.preventDefault(); setError(""); setLoading(true); const form=new FormData(event.currentTarget); const result=await supabase.auth.signInWithPassword({email:String(form.get("email")),password:String(form.get("password"))}); if(result.error)setError(result.error.message);setLoading(false); }
  async function emailAction(event: FormEvent<HTMLFormElement>) { event.preventDefault();setError("");setMessage("");setLoading(true);const email=String(new FormData(event.currentTarget).get("email"));const redirectTo=`${window.location.origin}/account`;const result=flow==="forgot"?await supabase.auth.resetPasswordForEmail(email,{redirectTo}):await supabase.auth.signInWithOtp({email,options:{emailRedirectTo:redirectTo,shouldCreateUser:false}});if(result.error)setError(result.error.message);else setMessage(flow==="forgot"?"Password reset email sent.":"Magic sign-in link sent.");setLoading(false); }
  async function resetPassword(event: FormEvent<HTMLFormElement>) { event.preventDefault();setError("");const f=new FormData(event.currentTarget),password=String(f.get("password")),confirm=String(f.get("confirm"));if(!passwordRule.test(password)){setError(passwordHelp);return}if(password!==confirm){setError("Passwords do not match.");return}setLoading(true);const result=await supabase.auth.updateUser({password});if(result.error)setError(result.error.message);else{setMessage("Password updated successfully.");setFlow("login")}setLoading(false); }
  if (loading) return <div className="auth"><LoaderCircle className="spin" size={32}/></div>;
  if (!isConfigured) return <div className="auth"><div className="authbox"><div className="authbrand">clay</div><p className="tagline">Capture today.<br/>Close tomorrow.</p><div className="card warn"><b>Connect Supabase to begin</b><p className="muted small">Add your Supabase settings to .env.local, then restart Clay.</p></div></div></div>;
  if (session && flow!=="recovery") return <>{children(session)}</>;
  return <div className="auth"><div className="authbox"><div className="authbrand">clay</div><p className="tagline">Capture today.<br/>Close tomorrow.</p>{flow==="login"?<form className="form" onSubmit={login}><div className="field"><label>Email</label><input className="input" name="email" type="email" autoComplete="email" required/></div><div className="field"><label>Password</label><input className="input" name="password" type="password" autoComplete="current-password" required/></div>{error&&<div className="card error small">{error}</div>}<button className="primary">Sign in</button><div className="row spread"><button type="button" className="link" onClick={()=>setFlow("forgot")}>Forgot password?</button><button type="button" className="link" onClick={()=>setFlow("magic")}>Email me a sign-in link</button></div><div className="card small"><b>Clay is invite only</b><p className="muted" style={{marginBottom:0}}>Ask an administrator to invite your email address.</p></div></form>:flow==="recovery"?<form className="form" onSubmit={resetPassword}><h2>Choose a new password</h2><div className="field"><label>New password</label><input className="input" name="password" type="password" autoComplete="new-password" required/></div><div className="field"><label>Confirm password</label><input className="input" name="confirm" type="password" autoComplete="new-password" required/></div><p className="small muted">{passwordHelp}</p>{error&&<div className="card error small">{error}</div>}<button className="primary">Update password</button></form>:<form className="form" onSubmit={emailAction}><div className="successmark" style={{marginBottom:4}}><Mail/></div><h2>{flow==="forgot"?"Reset your password":"Passwordless sign in"}</h2><p className="muted">{flow==="forgot"?"We’ll email a secure reset link.":"We’ll email a one-time sign-in link. Only invited users can sign in."}</p><div className="field"><label>Email</label><input className="input" name="email" type="email" autoComplete="email" required/></div>{message&&<div className="card location"><Check/>{message}</div>}{error&&<div className="card error small">{error}</div>}<button className="primary">Send email</button><button type="button" className="secondary" onClick={()=>{setFlow("login");setMessage("");setError("")}}>Back to sign in</button></form>}</div></div>;
}
