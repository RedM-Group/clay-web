export type GeocodedPoint={latitude:number;longitude:number;matchedAddress:string};

export async function coordinatesFromAddress(address:string):Promise<GeocodedPoint|null>{
  const token=process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
  if(!token||!address.trim())return null;
  const params=new URLSearchParams({q:address.trim(),access_token:token,autocomplete:"false",limit:"1",types:"address",permanent:"true"});
  const response=await fetch(`https://api.mapbox.com/search/geocode/v6/forward?${params}`);
  if(!response.ok)throw new Error("Address lookup failed. Check the Mapbox token and permanent-geocoding access.");
  const data=await response.json();
  const feature=data.features?.[0],coordinates=feature?.geometry?.coordinates;
  if(!coordinates||coordinates.length<2)return null;
  return {longitude:Number(coordinates[0]),latitude:Number(coordinates[1]),matchedAddress:feature.properties?.full_address??feature.properties?.name??address};
}
