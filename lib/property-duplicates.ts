import { supabase } from "./supabase";

export type PropertyDuplicate = {
  id: string;
  address: string;
  reason: "address" | "coordinates";
  distanceMeters?: number;
};

const aliases: Record<string, string> = {
  street: "st", avenue: "ave", boulevard: "blvd", road: "rd", drive: "dr",
  lane: "ln", court: "ct", place: "pl", parkway: "pkwy", highway: "hwy",
  north: "n", south: "s", east: "e", west: "w",
};

export function normalizePropertyAddress(...parts: Array<string | null | undefined>) {
  return parts.join(" ").normalize("NFKD").toLowerCase()
    .replace(/[.,#'’]/g, " ")
    .replace(/\b(street|avenue|boulevard|road|drive|lane|court|place|parkway|highway|north|south|east|west)\b/g, word => aliases[word])
    .replace(/\s+/g, " ").trim();
}

export function distanceMeters(lat1: number, lon1: number, lat2: number, lon2: number) {
  const radians = (degrees: number) => degrees * Math.PI / 180;
  const dLat = radians(lat2 - lat1), dLon = radians(lon2 - lon1);
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(radians(lat1)) * Math.cos(radians(lat2)) * Math.sin(dLon / 2) ** 2;
  return 6371000 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export async function findDuplicateProperty(input: {address:string;city:string;state:string;zip:string;latitude:number|null;longitude:number|null;excludeId?:string}) {
  const result = await supabase.from("properties").select("id,address,city,state,zip,latitude,longitude");
  if (result.error) throw result.error;
  const target = normalizePropertyAddress(input.address, input.city, input.state, input.zip);
  for (const row of result.data ?? []) {
    if (row.id === input.excludeId) continue;
    if (target && normalizePropertyAddress(row.address, row.city, row.state, row.zip) === target)
      return {id:row.id,address:row.address,reason:"address"} satisfies PropertyDuplicate;
  }
  if (input.latitude == null || input.longitude == null) return null;
  for (const row of result.data ?? []) {
    if (row.id === input.excludeId || row.latitude == null || row.longitude == null) continue;
    const distance = distanceMeters(input.latitude, input.longitude, row.latitude, row.longitude);
    if (distance <= 25) return {id:row.id,address:row.address,reason:"coordinates",distanceMeters:distance} satisfies PropertyDuplicate;
  }
  return null;
}
