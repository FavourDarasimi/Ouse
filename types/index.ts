export type Role = "tenant" | "landlord";
export type PropertyType = "house" | "apartment" | "room" | "duplex" | "flat";
export type RentType = "monthly" | "yearly";

export interface Profile {
  id: string;
  role: Role;
  full_name: string | null;
  avatar_url: string | null;
  phone: string | null;
  created_at: string;
}

export interface Listing {
  id: string;
  landlord_id: string;
  title: string;
  description: string | null;
  price: number;
  rent_type: RentType;
  location: string;
  area: string | null;
  type: PropertyType;
  bedrooms: number | null;
  bathrooms: number | null;
  available: boolean;
  images: string[];
  created_at: string;
  updated_at: string;
  profiles?: Profile; // joined landlord profile
}

export interface Conversation {
  id: string;
  listing_id: string;
  tenant_id: string;
  landlord_id: string;
  created_at: string;
  listings?: Pick<Listing, "title" | "images">;
  profiles?: Profile;
}

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  body: string;
  read: boolean;
  created_at: string;
}

export interface Favourite {
  id: string;
  tenant_id: string;
  listing_id: string;
  created_at: string;
  listings?: Listing;
}
