/* eslint-disable react-hooks/exhaustive-deps */
"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
import { distanceMeters } from "@/lib/property-duplicates";
import { Route, Square } from "./icons";

type Point={lat:number;lng:number;at:string};
type Drive={id:string;started_at:string;route:Point[];distance_meters:number};
const totalDistance=(points:Point[])=>points.slice(1).reduce((total,point,index)=>total+distanceMeters(points[index].lat,points[index].lng,point.lat,point.lng),0);

export function ActiveDriveControl({session}:{session:Session}){
  const path=usePathname(),[drive,setDrive]=useState<Drive|null>(null),watch=useRef<number|null>(null);
  useEffect(()=>{supabase.from("drive_sessions").select("id,started_at,route,distance_meters").eq("user_id",session.user.id).eq("status","active").maybeSingle().then(({data})=>setDrive(data as Drive|null))},[path,session.user.id]);
  useEffect(()=>{if(!drive||path==="/drives"||watch.current!==null)return;watch.current=navigator.geolocation.watchPosition(position=>{const point={lat:position.coords.latitude,lng:position.coords.longitude,at:new Date().toISOString()};setDrive(current=>{if(!current)return current;const previous=current.route.at(-1);if(previous&&distanceMeters(previous.lat,previous.lng,point.lat,point.lng)<5)return current;const route=[...current.route,point],distance_meters=totalDistance(route),duration_seconds=Math.floor((Date.now()-new Date(current.started_at).getTime())/1000);supabase.from("drive_sessions").update({route,distance_meters,duration_seconds,updated_at:new Date().toISOString()}).eq("id",current.id).then();return {...current,route,distance_meters}})},()=>undefined,{enableHighAccuracy:true,maximumAge:3000,timeout:15000});return()=>{if(watch.current!==null)navigator.geolocation.clearWatch(watch.current);watch.current=null}},[drive?.id,path]);
  async function stop(){if(!drive||!window.confirm("Stop and save this drive session?"))return;const duration_seconds=Math.floor((Date.now()-new Date(drive.started_at).getTime())/1000),result=await supabase.from("drive_sessions").update({status:"completed",ended_at:new Date().toISOString(),duration_seconds,route:drive.route,distance_meters:drive.distance_meters,updated_at:new Date().toISOString()}).eq("id",drive.id);if(!result.error)setDrive(null)}
  if(!drive||path==="/drives")return null;
  return <div className="drivecontrol"><Link href="/drives"><Route/><span><b>Drive active</b><small>Route tracking continues</small></span></Link><button onClick={stop}><Square/>Stop Drive</button></div>;
}
