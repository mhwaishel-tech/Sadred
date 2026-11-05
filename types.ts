export type Listing = {
  id: string;
  title: string;
  description: string;
  category: string;
  city: string;
  reward_eur: number;
  image_url?: string | null;
  created_at: string;
};