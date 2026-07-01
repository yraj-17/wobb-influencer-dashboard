import type { ProfileDetailResponse, Platform, UserProfileSummary } from "@/types";
import { extractProfiles, getPlatformLabel } from "./dataHelpers";

const profileModules = import.meta.glob<ProfileDetailResponse>(
  "../assets/data/profiles/*.json"
);

export async function loadProfileByUsername(
  username: string
): Promise<ProfileDetailResponse | null> {
  const path = `../assets/data/profiles/${username}.json`;
  const loader = profileModules[path];

  if (loader) {
    const result = await loader();
    const data =
      (result as { default?: ProfileDetailResponse }).default ?? result;
    return data as ProfileDetailResponse;
  }

  // If no static JSON file is present, try to find the profile in search lists
  let foundPlatform: Platform | null = null;
  let summaryProfile: UserProfileSummary | null = null;
  let siblingsList: UserProfileSummary[] = [];

  for (const plat of ["instagram", "youtube", "tiktok"] as Platform[]) {
    const list = extractProfiles(plat);
    const found = list.find((p) => p.username.toLowerCase() === username.toLowerCase());
    if (found) {
      foundPlatform = plat;
      summaryProfile = found;
      siblingsList = list;
      break;
    }
  }

  if (!summaryProfile || !foundPlatform) {
    return null;
  }

  // Build a realistic mocked profile details object dynamically
  const followers = summaryProfile.followers;
  const er = summaryProfile.engagement_rate || 0.015;
  const postCount = Math.floor(Math.random() * 800) + 120;
  
  // Calculate average engagements, likes, and comments based on ER and followers
  const engagementsCount = summaryProfile.engagements || Math.floor(followers * er);
  const avgLikes = Math.floor(engagementsCount * 0.95);
  const avgComments = Math.floor(engagementsCount * 0.05);

  const mockResponse: ProfileDetailResponse = {
    cached: true,
    contact: {
      showEmail: true,
      showPhone: false,
      email: `${summaryProfile.username.replace(/\./g, "")}@example.com`,
    },
    data: {
      success: true,
      user_profile: {
        user_id: summaryProfile.user_id,
        username: summaryProfile.username,
        fullname: summaryProfile.fullname,
        picture: summaryProfile.picture,
        url: summaryProfile.url,
        is_verified: summaryProfile.is_verified,
        followers: followers,
        engagements: engagementsCount,
        engagement_rate: er,
        avg_views: summaryProfile.avg_views || (foundPlatform === "youtube" || foundPlatform === "tiktok" ? Math.floor(followers * 0.15) : undefined),
        posts_count: postCount,
        avg_likes: avgLikes,
        avg_comments: avgComments,
        description: `Hey there! This is the official ${getPlatformLabel(foundPlatform)} profile of ${summaryProfile.fullname}. Business enquiries: collab_${summaryProfile.username}@example.com`,
        interests: [
          { id: 1, name: "Entertainment" },
          { id: 2, name: "Lifestyle" },
          { id: 3, name: "Content Creation" },
        ],
        brand_affinity: [
          { id: 1, name: "Nike", interest: [] },
          { id: 2, name: "Spotify", interest: [] },
        ],
        top_hashtags: [
          { tag: foundPlatform, weight: 10 },
          { tag: "viral", weight: 8 },
          { tag: "trending", weight: 7 },
          { tag: "creator", weight: 6 },
        ],
        top_mentions: [
          { tag: "collab", weight: 5 },
          { tag: "wobb", weight: 4 },
        ],
        stat_history: [
          { month: "Jan", followers: Math.floor(followers * 0.88) },
          { month: "Feb", followers: Math.floor(followers * 0.91) },
          { month: "Mar", followers: Math.floor(followers * 0.93) },
          { month: "Apr", followers: Math.floor(followers * 0.95) },
          { month: "May", followers: Math.floor(followers * 0.98) },
          { month: "Jun", followers: followers },
        ],
        similar_users: siblingsList
          .filter((p) => p.user_id !== summaryProfile.user_id)
          .slice(0, 3)
          .map((p) => ({
            user_id: p.user_id,
            username: p.username,
            fullname: p.fullname,
            picture: p.picture,
            followers: p.followers,
            url: p.url,
            is_verified: p.is_verified,
          })),
      },
    },
  };

  return mockResponse;
}
