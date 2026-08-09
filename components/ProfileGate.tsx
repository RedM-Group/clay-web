/* eslint-disable jsx-a11y/label-has-associated-control */
"use client";
import { FormEvent, useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
import { Check, LoaderCircle } from "./icons";
import { passwordHelp } from "./AuthGate";

type Profile={full_name:string;phone:string;onboarding_completed:boolean};
const passwordRule=/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{12,}$/;

export function ProfileGate({session,children}:{session:Session;children:React.ReactNode}){
  const [profile,setProfile]=useState<Profile|null>(null),[loading,setLoading]=useState(true),[error,setError]=useState("");
  useEffect(()=>{const cacheKey=`clay-profile-${session.user.id}`;supabase.from("profiles").select("full_name,phone,onboarding_completed").eq("id",session.user.id).single().then(({data,error})=>{if(data){setProfile(data);localStorage.setItem(cacheKey,JSON.stringify(data))}else if(error){const cached=localStorage.getItem(cacheKey);if(cached)setProfile(JSON.parse(cached));else setError(error.message)}setLoading(false)})},[session.user.id]);
  async function complete(e:FormEvent<HTMLFormElement>){e.preventDefault();setError("");const f=new FormData(e.currentTarget),full_name=String(f.get("full_name")).trim(),phone=String(f.get("phone")).trim(),password=String(f.get("password"));if(!full_name||!phone){setError("Name and phone number are required.");return}if(password&&!passwordRule.test(password)){setError(passwordHelp);return}setLoading(true);if(password){const auth=await supabase.auth.updateUser({password,data:{full_name,phone}});if(auth.error){setError(auth.error.message);setLoading(false);return}}else await supabase.auth.updateUser({data:{full_name,phone}});const result=await supabase.from("profiles").update({full_name,phone,onboarding_completed:true,updated_at:new Date().toISOString()}).eq("id",session.user.id).select("full_name,phone,onboarding_completed").single();if(result.error)setError(result.error.message);else{setProfile(result.data);localStorage.setItem(`clay-profile-${session.user.id}`,JSON.stringify(result.data))}setLoading(false)}
  if(loading)return <div className="auth"><LoaderCircle className="spin"/></div>;
  if(profile?.onboarding_completed)return <>{children}</>;
  return <div className="auth"><div className="authbox"><div className="authbrand">clay</div><div className="successmark"><Check/></div><h1>Finish your account</h1><p className="muted">Your invitation is accepted. Add the details your team will use to identify you.</p><form className="form section" onSubmit={complete}><div className="field"><label>Full name</label><input className="input" name="full_name" defaultValue={profile?.full_name??session.user.user_metadata?.full_name??""} autoComplete="name" required/></div><div className="field"><label>Phone number</label><input className="input" name="phone" type="tel" defaultValue={profile?.phone??session.user.user_metadata?.phone??""} autoComplete="tel" required/></div><div className="field"><label>Set password <span className="muted">(recommended for invited users)</span></label><input className="input" name="password" type="password" autoComplete="new-password"/><span className="small muted">{passwordHelp}</span></div>{error&&<div className="card error">{error}</div>}<button className="primary">Complete account</button></form></div></div>
}
