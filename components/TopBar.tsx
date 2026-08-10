"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronLeft, LogOut } from "./icons";
import { supabase } from "@/lib/supabase";
export function TopBar({ title, subtitle, back=false, logout=false }:{title:string;subtitle?:string;back?:boolean;logout?:boolean}) { const router=useRouter(); return <header className="topbar"><Link className="brand" href="/" aria-label="Clay home">clay</Link><div className="row topbartitle">{back&&<button className="back" aria-label="Go back" onClick={()=>router.back()}><ChevronLeft/></button>}<div>{subtitle&&<div className="eyebrow">{subtitle}</div>}<h1>{title}</h1></div></div>{logout&&<button className="iconbtn" aria-label="Log out" onClick={()=>supabase.auth.signOut()}><LogOut size={19}/></button>}</header> }
