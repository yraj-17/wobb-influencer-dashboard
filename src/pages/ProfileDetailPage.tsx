import { useEffect, useState, useCallback } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { VerifiedBadge } from "@/components/VerifiedBadge";
import type { FullUserProfile, Platform, ProfileDetailResponse } from "@/types";
import {
  formatFollowers,
  formatEngagementRate,
  formatCount,
  formatNumber,
} from "@/utils/formatters";
import { loadProfileByUsername } from "@/utils/profileLoader";
import { getPlatformLabel } from "@/utils/dataHelpers";
import { useInfluencerStore } from "@/store/useInfluencerStore";

// ─── Stat Card ──────────────────────────────────────────────────────────────
function StatCard({
  label,
  value,
  highlight = false,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={`p-4 rounded-xl border ${
        highlight
          ? "border-purple-100 bg-purple-50"
          : "border-gray-100 bg-gray-50"
      }`}
    >
      <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">
        {label}
      </p>
      <p
        className={`text-xl font-bold mt-1 ${
          highlight ? "text-purple-700" : "text-gray-900"
        }`}
      >
        {value}
      </p>
    </div>
  );
}

// ─── Tag Pill ────────────────────────────────────────────────────────────────
function TagPill({ tag }: { tag: string }) {
  return (
    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700 hover:bg-purple-50 hover:text-purple-700 transition-colors">
      #{tag}
    </span>
  );
}

// ─── Platform Badge ──────────────────────────────────────────────────────────
const platformColors: Record<string, string> = {
  instagram: "bg-pink-100 text-pink-700",
  youtube: "bg-red-100 text-red-700",
  tiktok: "bg-gray-900 text-white",
};

function PlatformBadge({ platform }: { platform: string }) {
  const cls =
    platformColors[platform.toLowerCase()] ?? "bg-gray-100 text-gray-700";
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${cls}`}>
      {getPlatformLabel(platform as Platform)}
    </span>
  );
}

// ─── Skeleton Loader ─────────────────────────────────────────────────────────
function ProfileSkeleton() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="flex gap-5">
        <div className="w-24 h-24 rounded-full bg-gray-200" />
        <div className="flex-1 space-y-3 pt-2">
          <div className="h-5 bg-gray-200 rounded w-1/3" />
          <div className="h-4 bg-gray-200 rounded w-1/4" />
          <div className="h-3 bg-gray-200 rounded w-1/2" />
        </div>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-20 bg-gray-200 rounded-xl" />
        ))}
      </div>
    </div>
  );
}

// ─── Main Page ───────────────────────────────────────────────────────────────
export function ProfileDetailPage() {
  const { username } = useParams<{ username: string }>();
  const [searchParams] = useSearchParams();
  const platform = (searchParams.get("platform") || "instagram") as Platform;

  const [profileData, setProfileData] = useState<ProfileDetailResponse | null | undefined>(
    undefined // undefined = still loading, null = not found, object = loaded
  );

  const addToList = useInfluencerStore((s) => s.addToList);
  const removeFromList = useInfluencerStore((s) => s.removeFromList);
  const isInList = useInfluencerStore((s) => s.isInList);

  useEffect(() => {
    if (!username) return;

    let cancelled = false;

    loadProfileByUsername(username)
      .then((data) => {
        if (!cancelled) setProfileData(data ?? null);
      })
      .catch(() => {
        if (!cancelled) setProfileData(null);
      });

    return () => {
      cancelled = true;
    };
  }, [username]);

  const handleListToggle = useCallback(() => {
    if (!profileData || !username) return;
    const user = profileData.data.user_profile;
    if (isInList(user.user_id)) {
      removeFromList(user.user_id);
    } else {
      // Build a UserProfileSummary from the full profile
      addToList(
        {
          user_id: user.user_id,
          username: user.username,
          fullname: user.fullname,
          picture: user.picture,
          url: user.url,
          is_verified: user.is_verified,
          followers: user.followers,
          engagements: user.engagements,
          engagement_rate: user.engagement_rate,
          avg_views: user.avg_views,
        },
        platform
      );
    }
  }, [profileData, username, platform, isInList, addToList, removeFromList]);

  // ── Guards ────────────────────────────────────────────────────────────────
  if (!username) {
    return (
      <Layout>
        <p className="text-red-600">Invalid profile URL.</p>
        <Link to="/" className="text-purple-600 hover:underline mt-2 inline-block">
          ← Back to search
        </Link>
      </Layout>
    );
  }

  // profileData === undefined → loading
  // profileData === null    → error / not found
  if (profileData === undefined) {
    return (
      <Layout>
        <div className="mb-6">
          <Link to="/" className="text-sm text-gray-500 hover:text-purple-600 transition-colors">
            ← Back to search
          </Link>
        </div>
        <ProfileSkeleton />
      </Layout>
    );
  }

  if (profileData === null) {
    return (
      <Layout>
        <div className="text-center py-20">
          <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <p className="text-gray-700 font-medium">Profile not found</p>
          <p className="text-gray-400 text-sm mt-1">
            Could not load profile for <span className="font-mono">@{username}</span>
          </p>
          <Link
            to="/"
            className="mt-4 inline-block px-4 py-2 bg-purple-600 text-white rounded-xl text-sm font-medium hover:bg-purple-700 transition-colors"
          >
            ← Back to search
          </Link>
        </div>
      </Layout>
    );
  }

  const user: FullUserProfile = profileData.data.user_profile;
  const inList = isInList(user.user_id);

  return (
    <Layout>
      {/* Back link */}
      <div className="mb-6">
        <Link
          to="/"
          className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-purple-600 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to search
        </Link>
      </div>

      <div className="max-w-3xl">
        {/* ── Profile header ──────────────────────────────────────────── */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6 mb-4">
          <div className="flex flex-col sm:flex-row gap-5 items-start">
            {/* Avatar */}
            <img
              src={user.picture}
              alt={`${user.fullname} profile picture`}
              className="w-24 h-24 rounded-full object-cover border-4 border-gray-100 shadow-sm flex-shrink-0"
              onError={(e) => {
                (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.fullname)}&background=7c3aed&color=fff&size=96`;
              }}
            />

            {/* Details */}
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-start gap-2 mb-1">
                <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-1 flex-wrap">
                  @{user.username}
                  <VerifiedBadge verified={user.is_verified} size="md" />
                </h1>
                <PlatformBadge platform={platform} />
              </div>
              <p className="text-gray-600 text-base">{user.fullname}</p>

              {user.description && (
                <p className="mt-3 text-sm text-gray-600 leading-relaxed">
                  {user.description}
                </p>
              )}

              {/* Meta tags */}
              <div className="flex flex-wrap gap-2 mt-3">
                {user.gender && (
                  <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full capitalize">
                    {user.gender.toLowerCase()}
                  </span>
                )}
                {user.age_group && (
                  <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                    {user.age_group}
                  </span>
                )}
                {user.language && (
                  <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                    {user.language.name}
                  </span>
                )}
                {user.geo?.country && (
                  <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                    📍 {user.geo.country.name}
                  </span>
                )}
              </div>

              {/* Actions */}
              <div className="flex flex-wrap gap-3 mt-5">
                <button
                  onClick={handleListToggle}
                  className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium text-sm transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-1 ${
                    inList
                      ? "bg-purple-600 text-white hover:bg-purple-700 focus:ring-purple-400"
                      : "bg-gray-900 text-white hover:bg-gray-800 focus:ring-gray-400"
                  }`}
                  aria-pressed={inList}
                >
                  <svg
                    className="w-4 h-4"
                    fill={inList ? "currentColor" : "none"}
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
                    />
                  </svg>
                  {inList ? "Saved to List" : "Add to List"}
                </button>

                {user.url && (
                  <a
                    href={user.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium text-sm border border-gray-200 text-gray-700 hover:border-purple-300 hover:text-purple-700 transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-purple-400"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                    View Profile
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ── Stats grid ──────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4">
          <StatCard
            label="Followers"
            value={formatFollowers(user.followers)}
            highlight
          />
          <StatCard
            label="Engagement Rate"
            // FIX: was * 10000, correct is * 100 via formatEngagementRate
            value={formatEngagementRate(user.engagement_rate)}
          />
          {user.posts_count !== undefined && (
            <StatCard
              label="Posts"
              value={formatNumber(user.posts_count)}
            />
          )}
          {user.engagements !== undefined && (
            <StatCard
              label="Avg Engagements"
              // FIX: was showing rate % here, now correctly shows count
              value={formatCount(user.engagements)}
            />
          )}
          {user.avg_likes !== undefined && user.avg_likes > 0 && (
            <StatCard label="Avg Likes" value={formatCount(user.avg_likes)} />
          )}
          {user.avg_comments !== undefined && user.avg_comments > 0 && (
            <StatCard label="Avg Comments" value={formatCount(user.avg_comments)} />
          )}
          {user.avg_views !== undefined && user.avg_views > 0 && (
            <StatCard label="Avg Views" value={formatCount(user.avg_views)} />
          )}
          {user.avg_reels_plays !== undefined && user.avg_reels_plays > 0 && (
            <StatCard label="Avg Reels Plays" value={formatCount(user.avg_reels_plays)} />
          )}
          {user.avg_shares !== undefined && user.avg_shares > 0 && (
            <StatCard label="Avg Shares" value={formatCount(user.avg_shares)} />
          )}
          {user.avg_saves !== undefined && user.avg_saves > 0 && (
            <StatCard label="Avg Saves" value={formatCount(user.avg_saves)} />
          )}
          {user.total_likes !== undefined && user.total_likes > 0 && (
            <StatCard label="Total Likes" value={formatCount(user.total_likes)} />
          )}
          {user.paid_post_performance !== undefined && (
            <StatCard
              label="Paid Post Performance"
              value={(user.paid_post_performance * 100).toFixed(1) + "%"}
            />
          )}
        </div>

        {/* ── Interests ───────────────────────────────────────────────── */}
        {user.interests && user.interests.length > 0 && (
          <div className="bg-white border border-gray-200 rounded-2xl p-5 mb-4">
            <h2 className="text-sm font-semibold text-gray-900 mb-3">Interests</h2>
            <div className="flex flex-wrap gap-2">
              {user.interests.map((interest) => (
                <span
                  key={interest.id}
                  className="px-3 py-1 rounded-full text-xs font-medium bg-purple-50 text-purple-700 border border-purple-100"
                >
                  {interest.name}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* ── Brand Affinity ──────────────────────────────────────────── */}
        {user.brand_affinity && user.brand_affinity.length > 0 && (
          <div className="bg-white border border-gray-200 rounded-2xl p-5 mb-4">
            <h2 className="text-sm font-semibold text-gray-900 mb-3">Brand Affinity</h2>
            <div className="flex flex-wrap gap-2">
              {user.brand_affinity.map((brand) => (
                <span
                  key={brand.id}
                  className="px-3 py-1 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-100"
                >
                  {brand.name}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* ── Top Hashtags ────────────────────────────────────────────── */}
        {user.top_hashtags && user.top_hashtags.length > 0 && (
          <div className="bg-white border border-gray-200 rounded-2xl p-5 mb-4">
            <h2 className="text-sm font-semibold text-gray-900 mb-3">
              Top Hashtags
            </h2>
            <div className="flex flex-wrap gap-2">
              {user.top_hashtags.slice(0, 15).map((h) => (
                <TagPill key={h.tag} tag={h.tag} />
              ))}
            </div>
          </div>
        )}

        {/* ── Top Mentions ────────────────────────────────────────────── */}
        {user.top_mentions && user.top_mentions.length > 0 && (
          <div className="bg-white border border-gray-200 rounded-2xl p-5 mb-4">
            <h2 className="text-sm font-semibold text-gray-900 mb-3">
              Top Mentions
            </h2>
            <div className="flex flex-wrap gap-2">
              {user.top_mentions.slice(0, 10).map((m) => (
                <span
                  key={m.tag}
                  className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700"
                >
                  @{m.tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* ── Follower Growth ─────────────────────────────────────────── */}
        {user.stat_history && user.stat_history.length > 0 && (
          <div className="bg-white border border-gray-200 rounded-2xl p-5 mb-4">
            <h2 className="text-sm font-semibold text-gray-900 mb-4">
              Follower Growth
            </h2>
            <div className="space-y-2">
              {user.stat_history.map((stat) => {
                const pct =
                  (stat.followers / user.followers) * 100;
                return (
                  <div key={stat.month} className="flex items-center gap-3">
                    <span className="text-xs text-gray-500 w-16 flex-shrink-0">
                      {stat.month}
                    </span>
                    <div className="flex-1 bg-gray-100 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-purple-500 h-2 rounded-full transition-all"
                        style={{ width: `${Math.min(pct, 100)}%` }}
                      />
                    </div>
                    <span className="text-xs font-medium text-gray-700 w-14 text-right flex-shrink-0">
                      {formatFollowers(stat.followers)}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── Similar Users ───────────────────────────────────────────── */}
        {user.similar_users && user.similar_users.length > 0 && (
          <div className="bg-white border border-gray-200 rounded-2xl p-5 mb-4">
            <h2 className="text-sm font-semibold text-gray-900 mb-4">
              Similar Creators
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {user.similar_users.slice(0, 6).map((sim) => (
                <div
                  key={sim.user_id}
                  className="flex items-center gap-2.5 p-2.5 rounded-xl border border-gray-100 hover:border-purple-100 hover:bg-purple-50 transition-colors"
                >
                  <img
                    src={sim.picture}
                    alt={sim.fullname}
                    className="w-9 h-9 rounded-full object-cover border border-gray-200 flex-shrink-0"
                    loading="lazy"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(sim.fullname)}&background=7c3aed&color=fff&size=36`;
                    }}
                  />
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-gray-900 truncate">
                      @{sim.username}
                    </p>
                    <p className="text-xs text-gray-400 truncate">
                      {formatFollowers(sim.followers)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
