export type PropertyStatus = "New" | "Researching" | "Contacted" | "Hot Lead" | "Under Contract" | "Closed" | "Dead";
export type PropertyRecord = {
  id: string; user_id: string; address: string; city: string; state: string; zip: string;
  latitude: number | null; longitude: number | null; gps_accuracy: number | null; source: string;
  property_type: string; status: PropertyStatus; notes: string; condition_tags: string[];
  created_at: string; updated_at: string; property_photos?: PhotoRecord[];
};
export type ContactRecord = {
  id: string; user_id: string; company_name: string; contact_name: string; contact_type: string;
  phone: string; email: string; website: string; source: string; found_at_address: string;
  latitude: number | null; longitude: number | null; notes: string; created_at: string; updated_at: string;
  contact_photos?: PhotoRecord[];
};
export type PhotoRecord = { id: string; storage_path: string; signed_url?: string; created_at: string };
export type PendingPhoto = { id: string; file: File; preview: string };
