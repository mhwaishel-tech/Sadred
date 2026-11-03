export type Profile = { id: string; display_name: string | null; role: "user" | "admin"; created_at: string };
export type Listing = {
  id: string; user_id: string; title: string; description: string; category: string;
  amount_eur: number; city: string; postal_code: string | null; condition: string;
  image_urls: string[]; status: "active" | "reserved" | "completed" | "removed";
  created_at: string; profiles?: { display_name: string | null } | null;
};
export type Conversation = { id: string; listing_id: string; buyer_id: string; owner_id: string; created_at: string; listings?: Listing };
export type Message = { id: string; conversation_id: string; sender_id: string; body: string; created_at: string };