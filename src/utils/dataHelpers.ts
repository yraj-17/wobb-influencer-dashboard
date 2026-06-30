import instagramData from "@/assets/data/search/instagram.json";
import youtubeData from "@/assets/data/search/youtube.json";
import tiktokData from "@/assets/data/search/tiktok.json";
import type { Platform, SearchData, UserProfileSummary } from "@/types";

const platformData: Record<Platform, SearchData> = {
  instagram: instagramData as SearchData,
  youtube: youtubeData as SearchData,
  tiktok: tiktokData as SearchData,
};

export function getSearchData(platform: Platform): SearchData {
  return platformData[platform];
}

export function extractProfiles(platform: Platform): UserProfileSummary[] {
  const data = getSearchData(platform);
  return data.accounts.map((item) => item.account.user_profile);
}

export function filterProfiles(
  profiles: UserProfileSummary[],
  query: string
): UserProfileSummary[] {
  if (!query.trim()) return profiles;
  const lower = query.toLowerCase();
  return profiles.filter((p) => {
    // Fix: both username and fullname are now case-insensitive
    const matchUsername = p.username.toLowerCase().includes(lower);
    const matchFullname = p.fullname.toLowerCase().includes(lower);
    return matchUsername || matchFullname;
  });
}

export const PLATFORMS: Platform[] = ["instagram", "youtube", "tiktok"];

export function getPlatformLabel(platform: Platform): string {
  const labels: Record<Platform, string> = {
    instagram: "Instagram",
    youtube: "YouTube",
    tiktok: "TikTok",
  };
  return labels[platform];
}

export function getPlatformColor(platform: Platform): string {
  const colors: Record<Platform, string> = {
    instagram: "#E1306C",
    youtube: "#FF0000",
    tiktok: "#010101",
  };
  return colors[platform];
}

export function getPlatformIcon(platform: Platform): string {
  const icons: Record<Platform, string> = {
    instagram: "📸",
    youtube: "▶️",
    tiktok: "🎵",
  };
  return icons[platform];
}
