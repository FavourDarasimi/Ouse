export type Role = "tenant" | "landlord" | "admin";
export type PropertyType = "house" | "apartment" | "room" | "duplex" | "flat";
export type RentType = "monthly" | "yearly";
export type KycStatus = "unverified" | "pending" | "verified" | "failed";
export type KycMethod = "nin" | "bvn";

export interface Profile {
  id: string;
  role: Role;
  full_name: string | null;
  avatar_url: string | null;
  phone: string | null;
  onboarded: boolean;
  created_at: string;
  kyc_status: KycStatus;
  kyc_method: KycMethod | null;
  kyc_verified_at: string | null;
  kyc_reference: string | null;
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

export interface ThreadItem {
  id: string;
  listingId: string;
  listingTitle: string;
  listingPrice: number;
  listingLocation: string;
  listingImage: string | null;
  otherUserId: string;
  otherUserName: string | null;
  otherUserAvatar: string | null;
  kyc_status?: KycStatus;
  lastMessage: string | null;
  lastMessageTime: string | null;
  unreadCount: number;
}
