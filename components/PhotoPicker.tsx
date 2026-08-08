/* eslint-disable @next/next/no-img-element, jsx-a11y/no-autofocus */
"use client";
import type { PendingPhoto } from "@/lib/types";
import { selectPhotos } from "@/lib/media";
import { Camera, X } from "./icons";
export function PhotoPicker({ photos,setPhotos,label="Take Photos",multiple=true,auto=false }:{photos:PendingPhoto[];setPhotos:(p:PendingPhoto[])=>void;label?:string;multiple?:boolean;auto?:boolean}) { return <div className="field"><label>{label}</label>{photos.length>0&&<div className="photos">{photos.map(p=><div className="photo" key={p.id}><img src={p.preview} alt="Preview"/><button type="button" className="remove" aria-label="Remove photo" onClick={()=>{URL.revokeObjectURL(p.preview);setPhotos(photos.filter(x=>x.id!==p.id))}}><X size={15}/></button></div>)}</div>}<label className="secondary camera"><Camera size={22}/>{photos.length?"Add more photos":label}<input hidden type="file" accept="image/*" capture="environment" multiple={multiple} autoFocus={auto} onChange={e=>setPhotos([...photos,...selectPhotos(e.target.files)])}/></label></div> }
