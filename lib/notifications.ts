export function notificationSupport(){
  if(typeof window==="undefined"||!("Notification" in window))return {supported:false as const,reason:"This browser does not support notifications. On iPhone, install Clay to the Home Screen first."};
  if(!window.isSecureContext)return {supported:false as const,reason:"Notifications require HTTPS or localhost."};
  return {supported:true as const,reason:""};
}

export async function showClayNotification(title:string,body:string){
  const support=notificationSupport();
  if(!support.supported)throw new Error(support.reason);
  if(Notification.permission!=="granted")throw new Error("Notification permission has not been granted.");
  if("serviceWorker" in navigator){
    try{const registration=await navigator.serviceWorker.register("/sw.js");await navigator.serviceWorker.ready;await registration.showNotification(title,{body,icon:"/icon.svg",badge:"/icon.svg",tag:`clay-${title}-${body}`});return}catch{/* Fall back to an in-page notification where supported. */}
  }
  new Notification(title,{body,icon:"/icon.svg"});
}
