"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Check, CircleAlert, LoaderCircle } from "./icons";

export const researchChecklistGroups=[
  {label:"Property",items:[["bbl","BBL"],["lot_information","Lot information"],["building_information","Building information"],["current_use","Current use"]]},
  {label:"Ownership",items:[["owner","Owner"],["mailing_address","Mailing address"],["entity_research","Entity research"],["acquisition_history","Acquisition history"]]},
  {label:"Contact",items:[["phone","Phone"],["email","Email"],["decision_maker","Decision maker"],["contact_verification","Contact verification"]]},
  {label:"Financial",items:[["taxes","Taxes"],["sale_history","Sale history"],["mortgage","Mortgage"],["liens","Liens"],["equity","Equity"],["financial_assessment","Financial assessment"]]},
  {label:"Development",items:[["zoning","Zoning"],["far","FAR"],["buildable_sf","Buildable SF"],["development_potential","Development potential"]]},
  {label:"Municipal",items:[["dob","DOB"],["hpd","HPD"],["violations","Violations"],["permits","Permits"],["certificates_orders","Certificates & orders"]]},
  {label:"Market",items:[["sales_comps","Sales comps"],["land_comps","Land comps"],["market_analysis","Market analysis"]]},
  {label:"Exit",items:[["buyer_match","Buyer match"]]},
] as const;
export const researchChecklistItems=researchChecklistGroups.flatMap(group=>group.items.map(([key,label])=>({key,label,group:group.label})));

export function ResearchChecklist({propertyId,userId,onProgress}:{propertyId:string;userId:string;onProgress?:(done:number,total:number)=>void}){
  const [completed,setCompleted]=useState<Set<string>|null>(null),[error,setError]=useState("");
  useEffect(()=>{supabase.from("property_research_items").select("item_key,completed").eq("property_id",propertyId).then(({data,error})=>{if(error)setError(error.message);else setCompleted(new Set((data??[]).filter(row=>row.completed).map(row=>row.item_key)))})},[propertyId]);
  const done=completed?.size??0,total=researchChecklistItems.length,percent=Math.round(done/total*100);
  useEffect(()=>{if(completed)onProgress?.(done,total)},[done,total,completed,onProgress]);
  async function toggle(key:string){if(!completed)return;const previous=new Set(completed),next=new Set(completed),value=!next.has(key);if(value)next.add(key);else next.delete(key);setCompleted(next);setError("");const {error}=await supabase.from("property_research_items").upsert({property_id:propertyId,user_id:userId,created_by:userId,item_key:key,completed:value,completed_at:value?new Date().toISOString():null,updated_at:new Date().toISOString()},{onConflict:"property_id,item_key"});if(error){setCompleted(previous);setError(error.message)}}
  return <section className="section research-progress"><div className="sectionhead"><div><h2>Research Progress</h2><div className="small muted">{done} / {total} completed</div></div><strong className="progresspercent">{percent}%</strong></div><div className="progressbar"><span style={{width:`${percent}%`}}/></div>{error&&<div className="card error"><CircleAlert/> {error}</div>}{!completed&&!error?<div className="card empty"><LoaderCircle className="spin"/></div>:completed&&<div className="checkgroups">{researchChecklistGroups.map(group=><details className="researchpanel" key={group.label}><summary><span>{group.label}</span><span className="small muted">{group.items.filter(([key])=>completed.has(key)).length}/{group.items.length}</span></summary><div className="researchlist">{group.items.map(([key,label])=>{const checked=completed.has(key);return <button type="button" key={key} className={checked?"done":""} onClick={()=>toggle(key)} aria-pressed={checked}><span className="researchcheck">{checked&&<Check/>}</span><span>{label}</span></button>})}</div></details>)}</div>}</section>;
}
