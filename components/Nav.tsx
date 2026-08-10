/* eslint-disable jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */
"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Home, Map, Plus, Building2, Users, HardHat, UserRoundPlus, Settings, Route, BriefcaseBusiness } from "./icons";

export function Nav() {
  const path = usePathname(); const [open,setOpen]=useState(false);
  const link=({href,label,Icon}:{href:string;label:string;Icon:typeof Home})=><Link key={href} href={href} className={(href==="/"?path===href:path.startsWith(href))?"active":""}><Icon size={21}/><span>{label}</span></Link>;
  return <><nav className="nav"><Link className="desktopnavbrand" href="/">clay</Link><div className="navgroup">{[{href:"/",label:"Home",Icon:Home},{href:"/map",label:"Map",Icon:Map},{href:"/deals",label:"Deals",Icon:BriefcaseBusiness}].map(link)}</div><button className="navadd" aria-label="Add" onClick={()=>setOpen(true)}><span className="navplus"><Plus size={27}/></span></button><div className="navgroup">{[{href:"/properties",label:"Properties",Icon:Building2},{href:"/contacts",label:"Contacts",Icon:Users},{href:"/account",label:"Settings",Icon:Settings}].map(link)}</div></nav>{open&&<div className="sheetback" onClick={()=>setOpen(false)}><div className="sheet" onClick={e=>e.stopPropagation()}><div className="handle"/><h2>Quick capture</h2><p className="muted small">What did you find?</p><Link className="secondary" href="/drives" onClick={()=>setOpen(false)}><Route/>Start Drive</Link><Link className="secondary" href="/properties/new" onClick={()=>setOpen(false)}><Building2/>Add Property</Link><Link className="secondary" href="/contacts/new" onClick={()=>setOpen(false)}><UserRoundPlus/>Add Contact</Link><Link className="secondary" href="/contacts/new?construction=1" onClick={()=>setOpen(false)}><HardHat/>Add Construction Sign</Link></div></div>}</>;
}
