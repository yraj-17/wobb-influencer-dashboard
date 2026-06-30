export type Platform = "instagram" | "youtube" | "tiktok";

export interface UserProfileSummary {
  user_id: string;
  username: string;
  url: string;
  picture: string;
  fullname: string;
  is_verified: boolean;
  followers: number;
  engagements?: number;
  engagement_rate?: number;
  handle?: string;
  avg_views?: number;
  sec_uid?: string;
  custom_name?: string;
  account_type?: number;
}

export interface SearchAccount {
  account: {
    user_profile: UserProfileSummary;
    audience_source: string;
  };
}

export interface SearchData {
  total: number;
  accounts: SearchAccount[];
}

export interface StatHistory {
  month: string;
  followers: number;
  following?: number;
  avg_likes?: number;
  avg_views?: number;
  avg_comments?: number;
}

export interface GeoLocation {
  city?: { id: number; name: string; coords?: { lat: number; lon: number } };
  state?: { id: number; name: string; coords?: { lat: number; lon: number } };
  country?: {
    id: number;
    name: string;
    code: string;
    coords?: { lat: number; lon: number };
  };
}

export interface TagWeight {
  tag: string;
  weight: number;
}

export interface RelevantTag {
  tag: string;
  distance: number;
  freq: number;
}

export interface BrandAffinity {
  id: number;
  name: string;
  interest: { id: number; name: string }[];
}

export interface Interest {
  id: number;
  name: string;
}

export interface Contact {
  type: string;
  value: string;
  formatted_value?: string;
}

export interface SimilarUser {
  user_id: string;
  username: string;
  picture: string;
  followers: number;
  fullname: string;
  url: string;
  is_verified: boolean;
  engagements?: number;
  score?: number;
  geo?: GeoLocation;
}

export interface FullUserProfile extends UserProfileSummary {
  type?: string;
  description?: string;
  is_business?: boolean;
  is_hidden?: boolean;
  posts_count?: number;
  avg_likes?: number;
  avg_comments?: number;
  avg_reels_plays?: number;
  avg_shares?: number;
  avg_saves?: number;
  avg_dislikes?: number;
  total_likes?: number;
  total_views?: number;
  gender?: string;
  age_group?: string;
  language?: { code: string; name: string };
  geo?: GeoLocation;
  stat_history?: StatHistory[];
  top_hashtags?: TagWeight[];
  top_mentions?: TagWeight[];
  brand_affinity?: BrandAffinity[];
  interests?: Interest[];
  relevant_tags?: RelevantTag[];
  similar_users?: SimilarUser[];
  contacts?: Contact[];
  paid_post_performance?: number;
}

export interface ProfileDetailResponse {
  cached?: boolean;
  contact?: {
    showEmail: boolean;
    showPhone: boolean;
    email?: string;
    phone?: string;
  };
  data: {
    success: boolean;
    version?: string;
    user_profile: FullUserProfile;
  };
}

// Saved list entry — includes the platform for context
export interface SavedProfile {
  profile: UserProfileSummary;
  platform: Platform;
  savedAt: number;
}
