export type GeocodedPoint={latitude:number;longitude:number;matchedAddress:string};

export async function coordinatesFromAddress(address:string):Promise<GeocodedPoint|null>{
  const apiKey=process.env.NEXT_PUBLIC_HERE_API_KEY;
  if(!apiKey||!address.trim())return null;
  const params=new URLSearchParams({q:address.trim(),apiKey,limit:"1",lang:"en-US"});
  const response=await fetch(`https://geocode.search.hereapi.com/v1/geocode?${params}`);
  if(!response.ok)throw new Error("Address lookup failed. Check the HERE API key and Geocoding & Search access.");
  const data=await response.json();
  const item=data.items?.[0],position=item?.position;
  if(!position)return null;
  return {longitude:Number(position.lng),latitude:Number(position.lat),matchedAddress:item.address?.label??item.title??address};
}

export async function addressFromCoordinates(latitude:number,longitude:number){
  const apiKey=process.env.NEXT_PUBLIC_HERE_API_KEY;if(!apiKey)return null;
  const params=new URLSearchParams({at:`${latitude},${longitude}`,apiKey,limit:"1",lang:"en-US"});
  const response=await fetch(`https://revgeocode.search.hereapi.com/v1/revgeocode?${params}`);if(!response.ok)throw new Error("Reverse geocoding failed.");
  const item=(await response.json()).items?.[0];if(!item)return null;const address=item.address??{};
  return {address:address.label??item.title??"",city:address.city??address.district??"",state:address.stateCode??address.state??"",zip:address.postalCode??""};
}
