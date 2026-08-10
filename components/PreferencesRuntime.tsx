"use client";

import { useEffect } from "react";

export function PreferencesRuntime(){
  useEffect(()=>{
    const apply=()=>{try{const saved=JSON.parse(localStorage.getItem("clay-preferences")??"{}");document.documentElement.dataset.clayCompact=String(saved.compactCards===true)}catch{document.documentElement.dataset.clayCompact="false"}};
    apply();
    window.addEventListener("storage",apply);
    window.addEventListener("clay-preferences-changed",apply);
    return()=>{window.removeEventListener("storage",apply);window.removeEventListener("clay-preferences-changed",apply)};
  },[]);
  return null;
}
