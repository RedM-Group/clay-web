/* eslint-disable react-hooks/set-state-in-effect, jsx-a11y/label-has-associated-control */
"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import type { Session } from "@supabase/supabase-js";
import { Bell, Camera, Check, CircleAlert, FileDown, KeyRound, LockKeyhole, Map, Route, Settings, UserRound } from "lucide-react";
import { passwordHelp } from "./AuthGate";
import { DataExport } from "./DataExport";
import { Nav } from "./Nav";
import { TopBar } from "./TopBar";
import { supabase } from "@/lib/supabase";
import { notificationSupport, showClayNotification } from "@/lib/notifications";

type Preferences={mapStyle:"street"|"satellite";compactCards:boolean};
type Profile={full_name:string;phone:string;email:string};
type Verification={kind:"email"|"phone";value:string}|null;
const defaults:Preferences={mapStyle:"street",compactCards:false};

function normalizePhone(value:string){
  const trimmed=value.trim();
  if(trimmed.startsWith("+"))return `+${trimmed.slice(1).replace(/\D/g,"")}`;
  const digits=trimmed.replace(/\D/g,"");
  return digits.length===10?`+1${digits}`:digits?`+${digits}`:"";
}

export function SettingsPage({session}:{session:Session}){
  const initial={full_name:"",phone:session.user.phone??"",email:session.user.email??""};
  const [profile,setProfile]=useState<Profile>(initial),[saved,setSaved]=useState<Profile>(initial),[preferences,setPreferences]=useState<Preferences>(defaults),[verification,setVerification]=useState<Verification>(null),[code,setCode]=useState(""),[message,setMessage]=useState(""),[error,setError]=useState(""),[saving,setSaving]=useState(false),[notifications,setNotifications]=useState<NotificationPermission>("default");

  useEffect(()=>{
    supabase.from("profiles").select("full_name,phone,email").eq("id",session.user.id).maybeSingle().then(({data})=>{
      const next={full_name:data?.full_name??session.user.user_metadata.full_name??"",phone:data?.phone??session.user.phone??"",email:session.user.email??data?.email??""};
      setProfile(next);setSaved(next);
    });
    try{const stored=localStorage.getItem("clay-preferences");if(stored){const next={...defaults,...JSON.parse(stored)};setPreferences(next);document.documentElement.dataset.clayCompact=String(next.compactCards)}}catch{/* Ignore preferences from an older Clay version. */}
    if("Notification" in window&&Notification.permission!=="granted")setNotifications(Notification.permission);
  },[session.user.id,session.user.email,session.user.phone,session.user.user_metadata.full_name]);

  function notice(text:string){setError("");setMessage(text);window.setTimeout(()=>setMessage(""),4000)}
  async function upsertProfile(next:Profile){return supabase.from("profiles").upsert({id:session.user.id,email:next.email,full_name:next.full_name,phone:next.phone,onboarding_completed:true,updated_at:new Date().toISOString()},{onConflict:"id"})}

  async function authenticatedPost(path:string,body:Record<string,string>){
    const {data}=await supabase.auth.getSession(),token=data.session?.access_token;
    if(!token)throw new Error("Your session expired. Sign in again.");
    const response=await fetch(path,{method:"POST",headers:{"Content-Type":"application/json",Authorization:`Bearer ${token}`},body:JSON.stringify(body)}),payload=await response.json();
    if(!response.ok)throw new Error(payload.error||"The verification request failed.");
    return payload;
  }

  async function saveProfile(event:FormEvent<HTMLFormElement>){
    event.preventDefault();setSaving(true);setError("");
    const email=profile.email.trim().toLowerCase(),phone=normalizePhone(profile.phone),emailChanged=email!==saved.email.toLowerCase(),phoneChanged=phone!==normalizePhone(saved.phone);
    if(emailChanged&&phoneChanged){setError("Change and verify either your email or phone first, then change the other.");setSaving(false);return}
    if(phoneChanged&&!/^\+[1-9]\d{7,14}$/.test(phone)){setError("Enter a valid phone number, including country code. Example: +16463449233.");setSaving(false);return}
    const base={...saved,full_name:profile.full_name};
    const profileResult=await upsertProfile(base);
    if(profileResult.error){setError(profileResult.error.message);setSaving(false);return}
    await supabase.auth.updateUser({data:{full_name:profile.full_name}});
    if(emailChanged){
      const result=await supabase.auth.updateUser({email});
      if(result.error)setError(result.error.message);else{setVerification({kind:"email",value:email});notice(`Verification code sent to ${email}.`)}
    }else if(phoneChanged){
      try{const result=await authenticatedPost("/api/profile/phone-code",{phone});setProfile({...profile,phone});setVerification({kind:"phone",value:phone});notice(`Verification code sent to ${result.email}.`)}catch(reason){setError(reason instanceof Error?reason.message:"The verification email could not be sent.")}
    }else{setSaved({...base,email:saved.email,phone:saved.phone});notice("Profile saved.")}
    setSaving(false);
  }

  async function verifyChange(event:FormEvent<HTMLFormElement>){
    event.preventDefault();if(!verification)return;setSaving(true);setError("");
    if(verification.kind==="phone"){
      try{await authenticatedPost("/api/profile/verify-phone",{phone:verification.value,code:code.trim()})}catch(reason){setError(reason instanceof Error?reason.message:"The code could not be verified.");setSaving(false);return}
    }else{
      const result=await supabase.auth.verifyOtp({email:verification.value,token:code.trim(),type:"email_change"});
      if(result.error){setError(result.error.message);setSaving(false);return}
    }
    const next={...profile,email:verification.kind==="email"?verification.value:saved.email,phone:verification.kind==="phone"?verification.value:saved.phone};
    const savedResult=await upsertProfile(next);
    if(savedResult.error)setError(savedResult.error.message);else{setProfile(next);setSaved(next);setVerification(null);setCode("");notice(`${verification.kind==="email"?"Email":"Phone number"} verified and saved.`)}
    setSaving(false);
  }

  async function resendCode(){if(!verification)return;setError("");if(verification.kind==="phone"){try{await authenticatedPost("/api/profile/phone-code",{phone:verification.value});notice("A new verification code was emailed to you.")}catch(reason){setError(reason instanceof Error?reason.message:"The verification email could not be sent.")}return}const result=await supabase.auth.updateUser({email:verification.value});if(result.error)setError(result.error.message);else notice("A new verification code was sent.")}
  function savePreferences(next:Preferences){setPreferences(next);localStorage.setItem("clay-preferences",JSON.stringify(next));document.documentElement.dataset.clayCompact=String(next.compactCards);window.dispatchEvent(new CustomEvent("clay-preferences-changed"));notice("Preferences saved on this device.")}
  async function requestNotifications(){const support=notificationSupport();if(!support.supported){setError(support.reason);return}if(Notification.permission==="denied"){setNotifications("denied");setError("Notifications are blocked. Allow notifications for Clay in your browser settings, then reload.");return}const permission=await Notification.requestPermission();if(permission==="granted"){setNotifications("default");try{await showClayNotification("Clay notifications enabled","Task and follow-up reminders will appear here.");notice("Test notification sent.")}catch(reason){setError(reason instanceof Error?reason.message:"Clay could not send a test notification.")}}else{setNotifications(permission);setError("Notification permission was not granted.")}}
  async function changePassword(event:FormEvent<HTMLFormElement>){event.preventDefault();setSaving(true);setError("");const form=event.currentTarget,data=new FormData(form),password=String(data.get("password")),confirm=String(data.get("confirm"));if(!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{12,}$/.test(password)){setError(passwordHelp);setSaving(false);return}if(password!==confirm){setError("Passwords do not match.");setSaving(false);return}const result=await supabase.auth.updateUser({password});if(result.error)setError(result.error.message);else{form.reset();notice("Password changed successfully.")}setSaving(false)}

  return <div className="app"><div className="page settingspage"><TopBar title="Settings" subtitle="Account & app preferences"/>{message&&<div className="location settingsnotice"><Check/>{message}</div>}{error&&<div className="card error settingsnotice"><CircleAlert/>{error}</div>}<div className="settingslayout"><aside className="settingsmenu card"><a href="#profile"><UserRound/>Profile</a><a href="#preferences"><Settings/>Preferences</a><a href="#notifications"><Bell/>Notifications</a><a href="#security"><LockKeyhole/>Security</a><a href="#data"><FileDown/>Data</a></aside><div className="settingscontent"><section className="settingssection" id="profile"><div className="settingsheading"><UserRound/><div><h2>Profile & sign-in</h2><p className="small muted">Email and phone changes require verification.</p></div></div><form className="form card" onSubmit={saveProfile}><div className="field"><label htmlFor="settings-name">Full name</label><input id="settings-name" className="input" value={profile.full_name} onChange={event=>setProfile({...profile,full_name:event.target.value})} required/></div><div className="field"><label htmlFor="settings-phone">Phone number</label><input id="settings-phone" className="input" type="tel" inputMode="tel" value={profile.phone} onChange={event=>setProfile({...profile,phone:event.target.value})} placeholder="+16463449233"/><span className="small muted">SMS verification requires Phone Auth and an SMS provider in Supabase.</span></div><div className="field"><label htmlFor="settings-email">Email</label><input id="settings-email" className="input" type="email" value={profile.email} onChange={event=>setProfile({...profile,email:event.target.value})} required/></div><button className="primary settingssave" disabled={saving}>{saving?"Saving…":"Save changes"}</button></form>{verification&&<form className="card verificationbox form" onSubmit={verifyChange}><div className="settingsheading"><KeyRound/><div><h2>Verify {verification.kind}</h2><p className="small muted">Enter the code sent to {verification.value}.</p></div></div><input className="input verificationcode" value={code} onChange={event=>setCode(event.target.value.replace(/\D/g,"").slice(0,8))} inputMode="numeric" autoComplete="one-time-code" placeholder="Verification code" required/><div className="verificationactions"><button className="primary" disabled={saving||code.length<6}>{saving?"Verifying…":"Verify code"}</button><button className="secondary" type="button" onClick={resendCode}>Resend code</button><button className="link" type="button" onClick={()=>{setVerification(null);setCode("");setProfile(saved)}}>Cancel</button></div></form>}</section><section className="settingssection" id="preferences"><div className="settingsheading"><Settings/><div><h2>App preferences</h2><p className="small muted">Customize Clay on this device.</p></div></div><div className="card form"><div className="field"><label>Default map view</label><div className="settingchoices"><button type="button" className={`chip ${preferences.mapStyle==="street"?"on":""}`} onClick={()=>savePreferences({...preferences,mapStyle:"street"})}>Street</button><button type="button" className={`chip ${preferences.mapStyle==="satellite"?"on":""}`} onClick={()=>savePreferences({...preferences,mapStyle:"satellite"})}>Satellite</button></div></div><label className="settingswitch"><span><b>Compact property cards</b><small className="muted">Show more records on each screen.</small></span><input type="checkbox" checked={preferences.compactCards} onChange={event=>savePreferences({...preferences,compactCards:event.target.checked})}/></label></div></section><section className="settingssection" id="notifications"><div className="settingsheading"><Bell/><div><h2>Notifications</h2><p className="small muted">Receive reminders for tasks and follow-ups.</p></div></div><div className="card notificationrow"><div><b>Browser notifications</b><div className="small muted">Tap to enable or send a test notification.</div></div><button className="secondary settingsaction" onClick={requestNotifications}>{notifications==="denied"?"Try again":"Enable / Test"}</button></div></section><section className="settingssection" id="security"><div className="settingsheading"><LockKeyhole/><div><h2>Security</h2><p className="small muted">Use a strong, unique password.</p></div></div><form className="form card" onSubmit={changePassword}><div className="field"><label htmlFor="new-password">New password</label><input id="new-password" className="input" name="password" type="password" autoComplete="new-password" required/></div><div className="field"><label htmlFor="confirm-password">Confirm new password</label><input id="confirm-password" className="input" name="confirm" type="password" autoComplete="new-password" required/></div><p className="small muted">{passwordHelp}</p><button className="primary settingssave" disabled={saving}>Change password</button></form></section><section className="settingssection"><div className="settingsheading"><Map/><div><h2>Clay tools</h2></div></div><div className="settingslinks"><Link className="secondary" href="/drives"><Route/>Drive sessions</Link><Link className="secondary" href="/media"><Camera/>Media library</Link><Link className="secondary" href="/tasks"><Bell/>Tasks</Link></div></section><section className="settingssection" id="data"><DataExport/></section><button className="secondary signout" onClick={()=>supabase.auth.signOut()}>Sign out of Clay</button></div></div></div><Nav/></div>
}
