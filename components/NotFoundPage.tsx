"use client";
import Link from "next/link";
import { Building2, Home, MapPin } from "lucide-react";
import { Nav } from "./Nav";
export function NotFoundPage(){return <div className="app"><main className="notfound"><Link className="brand" href="/">clay</Link><div className="notfoundmark"><MapPin/></div><span className="eyebrow">Error 404</span><h1>This property isn’t on the map.</h1><p className="muted">The page may have moved, been removed, or never existed.</p><div className="notfoundactions"><Link className="primary" href="/"><Home/>Return home</Link><Link className="secondary" href="/properties"><Building2/>Browse properties</Link></div></main><Nav/></div>}
