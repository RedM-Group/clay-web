/* eslint-disable jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */
"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Home, Map, Plus, Building2, Users, HardHat, UserRoundPlus } from "./icons";

export function Nav() {
  const path = usePathname(); const [open,setOpen]=useState(false);
  const items=[{href:"/",label:"Home",Icon:Home},{href:"/map",label:"Map",Icon:Map},{href:"#",label:"Add",Icon:Plus},{href:"/properties",label:"Properties",Icon:Building2},{href:"/contacts",label:"Contacts",Icon:Users}];
  return <><nav className="nav">{items.map(({href,label,Icon},i)=>i===2?<button key={label} aria-label="Add" onClick={()=>setOpen(true)}><span className="navplus"><Icon size={27}/></span></button>:<Link key={href} href={href} className={(href==="/"?path===href:path.startsWith(href))?"active":""}><Icon size={21}/><span>{label}</span></Link>)}</nav>{open&&<div className="sheetback" onClick={()=>setOpen(false)}><div className="sheet" onClick={e=>e.stopPropagation()}><div className="handle"/><h2>Quick capture</h2><p className="muted small">What did you find?</p><Link className="secondary" href="/properties/new" onClick={()=>setOpen(false)}><Building2/>Add Property</Link><Link className="secondary" href="/contacts/new" onClick={()=>setOpen(false)}><UserRoundPlus/>Add Contact</Link><Link className="secondary" href="/contacts/new?construction=1" onClick={()=>setOpen(false)}><HardHat/>Add Construction Sign</Link></div></div>}</>;
}
