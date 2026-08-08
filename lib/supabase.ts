import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";
export const isConfigured = Boolean(url && key);
export const supabase = createClient(
  url || "https://placeholder.supabase.co",
  key || "placeholder",
  { auth: { persistSession: true, autoRefreshToken: true } },
);

export async function signedMediaUrl(path: string) {
  const { data } = await supabase.storage.from("property-media").createSignedUrl(path, 3600);
  return data?.signedUrl;
}
