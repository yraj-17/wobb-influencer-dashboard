import { useEffect, useState, useCallback } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { VerifiedBadge } from "@/components/VerifiedBadge";
import type { FullUserProfile, Platform, ProfileDetailResponse, StatHistory } from "@/types";
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
      className={`p-4 rounded-xl border transition-all ${
        highlight
          ? "border-purple-100 dark:border-purple-950/40 bg-purple-50 dark:bg-purple-950/20"
          : "border-gray-100 dark:border-gray-800/80 bg-gray-50 dark:bg-gray-900/50"
      }`}
    >
      <p className="text-xs text-gray-500 dark:text-gray-400 font-semibold uppercase tracking-wide">
        {label}
      </p>
      <p
        className={`text-xl font-bold mt-1 transition-colors ${
          highlight ? "text-purple-700 dark:text-purple-400" : "text-gray-900 dark:text-gray-100"
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
    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-350 hover:bg-purple-50 dark:hover:bg-purple-950/30 hover:text-purple-700 dark:hover:text-purple-400 transition-colors">
      #{tag}
    </span>
  );
}

// ─── Platform Badge ──────────────────────────────────────────────────────────
const platformColors: Record<string, string> = {
  instagram: "bg-pink-100 dark:bg-pink-950/40 text-pink-700 dark:text-pink-400",
  youtube: "bg-red-100 dark:bg-red-950/40 text-red-700 dark:text-red-400",
  tiktok: "bg-gray-900 dark:bg-gray-800 text-white dark:text-gray-200",
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

// ─── Custom Interactive SVG Growth Chart ──────────────────────────────────────
function FollowerGrowthChart({ history }: { history: StatHistory[] }) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  if (!history || history.length === 0) return null;

  const width = 600;
  const height = 220;
  const padding = { top: 20, right: 20, bottom: 40, left: 60 };

  const followerValues = history.map((h) => h.followers);
  const maxFollowers = Math.max(...followerValues);
  const minFollowers = Math.min(...followerValues);
  const followerRange = maxFollowers - minFollowers || 1;

  const yMax = maxFollowers + followerRange * 0.1;
  const yMin = Math.max(0, minFollowers - followerRange * 0.1);
  const yRange = yMax - yMin;

  const getX = (index: number) => {
    return padding.left + (index / (history.length - 1)) * (width - padding.left - padding.right);
  };

  const getY = (followers: number) => {
    return height - padding.bottom - ((followers - yMin) / yRange) * (height - padding.top - padding.bottom);
  };

  const points = history.map((stat, i) => ({
    x: getX(i),
    y: getY(stat.followers),
    month: stat.month,
    followers: stat.followers,
  }));

  const linePath = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");
  const areaPath = points.length > 0
    ? `${linePath} L ${points[points.length - 1].x} ${height - padding.bottom} L ${points[0].x} ${height - padding.bottom} Z`
    : "";

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const svgX = (mouseX / rect.width) * width;
    
    let closestIdx = 0;
    let minDistance = Infinity;
    
    points.forEach((p, idx) => {
      const distance = Math.abs(p.x - svgX);
      if (distance < minDistance) {
        minDistance = distance;
        closestIdx = idx;
      }
    });

    if (svgX < padding.left - 15 || svgX > width - padding.right + 15) {
      setHoveredIndex(null);
    } else {
      setHoveredIndex(closestIdx);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-5 mb-4 shadow-sm">
      <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-4">Follower Growth</h2>
      <div className="relative w-full overflow-x-auto">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full min-w-[500px] h-auto overflow-visible select-none cursor-crosshair"
          onMouseMove={handleMouseMove}
          onMouseLeave={() => setHoveredIndex(null)}
        >
          <defs>
            <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#a855f7" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#a855f7" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
            const val = yMin + ratio * yRange;
            const y = getY(val);
            return (
              <g key={ratio} className="opacity-40">
                <line
                  x1={padding.left}
                  y1={y}
                  x2={width - padding.right}
                  y2={y}
                  stroke="#e5e7eb"
                  className="dark:stroke-gray-800"
                  strokeDasharray="4 4"
                />
                <text
                  x={padding.left - 8}
                  y={y + 4}
                  textAnchor="end"
                  className="text-[10px] fill-gray-400 dark:fill-gray-500 font-medium"
                >
                  {formatFollowers(val)}
                </text>
              </g>
            );
          })}

          {points.map((p, i) => (
            <text
              key={i}
              x={p.x}
              y={height - padding.bottom + 18}
              textAnchor="middle"
              className="text-[10px] fill-gray-400 dark:fill-gray-500 font-medium"
            >
              {p.month}
            </text>
          ))}

          {hoveredIndex !== null && (
            <line
              x1={points[hoveredIndex].x}
              y1={padding.top}
              x2={points[hoveredIndex].x}
              y2={height - padding.bottom}
              stroke="#a855f7"
              strokeWidth="1.5"
              strokeDasharray="4 4"
              className="opacity-60 dark:opacity-80 transition-all duration-100"
            />
          )}

          {areaPath && <path d={areaPath} fill="url(#chartGradient)" />}

          <path
            d={linePath}
            fill="none"
            stroke="#a855f7"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {points.map((p, i) => {
            const isHovered = hoveredIndex === i;
            return (
              <g key={i}>
                <circle
                  cx={p.x}
                  cy={p.y}
                  r={isHovered ? 6 : 4}
                  className="fill-purple-500 dark:fill-purple-400 stroke-white dark:stroke-gray-900 transition-all duration-150"
                  strokeWidth="2"
                />
                {isHovered && (
                  <circle
                    cx={p.x}
                    cy={p.y}
                    r="12"
                    className="fill-purple-500/25 dark:fill-purple-400/20 stroke-none animate-ping"
                    style={{ animationDuration: "2s" }}
                  />
                )}
              </g>
            );
          })}

          {/* SVG Tooltip to prevent container clipping */}
          {hoveredIndex !== null && (() => {
            const p = points[hoveredIndex];
            const tooltipWidth = 145;
            const tooltipHeight = 52;
            
            // Smart vertical positioning: if point is near the top of the chart, show tooltip below it
            const showBelow = p.y - tooltipHeight - 15 < 0;
            const tooltipX = Math.max(
              padding.left + 5,
              Math.min(width - padding.right - tooltipWidth - 5, p.x - tooltipWidth / 2)
            );
            const tooltipY = showBelow ? p.y + 15 : p.y - tooltipHeight - 15;

            return (
              <g className="pointer-events-none transition-all duration-100">
                {/* Tooltip Background Card */}
                <rect
                  x={tooltipX}
                  y={tooltipY}
                  width={tooltipWidth}
                  height={tooltipHeight}
                  rx="6"
                  className="fill-gray-950/95 dark:fill-gray-800/95 stroke-gray-850 dark:stroke-gray-700"
                  strokeWidth="1.5"
                />
                {/* Tooltip Text - Month */}
                <text
                  x={tooltipX + 12}
                  y={tooltipY + 20}
                  fontSize="10"
                  fontWeight="600"
                  className="fill-gray-400 dark:fill-gray-300 font-sans"
                >
                  {p.month}
                </text>
                {/* Tooltip Text - Followers */}
                <text
                  x={tooltipX + 12}
                  y={tooltipY + 36}
                  fontSize="11"
                  fontWeight="bold"
                  className="fill-purple-400 dark:fill-purple-300 font-sans"
                >
                  {p.followers.toLocaleString()} followers
                </text>
              </g>
            );
          })()}
        </svg>
      </div>
    </div>
  );
}

// ─── Skeleton Loader ─────────────────────────────────────────────────────────
function ProfileSkeleton() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="flex gap-5">
        <div className="w-24 h-24 rounded-full bg-gray-200 dark:bg-gray-800" />
        <div className="flex-1 space-y-3 pt-2">
          <div className="h-5 bg-gray-200 dark:bg-gray-800 rounded w-1/3" />
          <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-1/4" />
          <div className="h-3 bg-gray-200 dark:bg-gray-800 rounded w-1/2" />
        </div>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-20 bg-gray-200 dark:bg-gray-800 rounded-xl" />
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

  const [profileData, setProfileData] = useState<ProfileDetailResponse | null | undefined>(undefined);

  const addToList = useInfluencerStore((s) => s.addToList);
  const removeFromList = useInfluencerStore((s) => s.removeFromList);
  const savedList = useInfluencerStore((s) => s.savedList);

  useEffect(() => {
    if (!username) return;
    let cancelled = false;
    loadProfileByUsername(username).then((data) => {
      if (!cancelled) setProfileData(data ?? null);
    }).catch(() => {
      if (!cancelled) setProfileData(null);
    });
    return () => { cancelled = true; };
  }, [username]);

  const handleListToggle = useCallback(() => {
    if (!profileData || !username) return;
    const user = profileData.data.user_profile;
    const currentlyInList = savedList.some((entry) => entry.profile.user_id === user.user_id);
    if (currentlyInList) {
      removeFromList(user.user_id);
    } else {
      addToList({
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
      }, platform);
    }
  }, [profileData, username, platform, savedList, addToList, removeFromList]);

  if (!username) {
    return (
      <Layout>
        <p className="text-red-650 dark:text-red-400">Invalid profile URL.</p>
        <Link to="/" className="text-purple-600 hover:underline mt-2 inline-block">
          ← Back to search
        </Link>
      </Layout>
    );
  }

  if (profileData === undefined) {
    return (
      <Layout>
        <div className="mb-6">
          <Link to="/" className="text-sm text-gray-500 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors">
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
          <div className="w-16 h-16 bg-red-50 dark:bg-red-950/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <p className="text-gray-700 dark:text-gray-300 font-medium">Profile not found</p>
          <p className="text-gray-400 dark:text-gray-500 text-sm mt-1">
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
  const inList = savedList.some((entry) => entry.profile.user_id === user.user_id);

  return (
    <Layout>
      <div className="mb-6">
        <Link
          to="/"
          className="inline-flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to search
        </Link>
      </div>

      <div className="max-w-3xl">
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 mb-4 shadow-sm transition-all duration-200">
          <div className="flex flex-col sm:flex-row gap-5 items-start">
            <img
              src={user.picture}
              alt={`${user.fullname} profile picture`}
              className="w-24 h-24 rounded-full object-cover border-4 border-gray-100 dark:border-gray-800 shadow-sm flex-shrink-0"
              onError={(e) => {
                (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.fullname)}&background=7c3aed&color=fff&size=96`;
              }}
            />

            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-start gap-2 mb-1">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-1 flex-wrap">
                  @{user.username}
                  <VerifiedBadge verified={user.is_verified} size="md" />
                </h1>
                <PlatformBadge platform={platform} />
              </div>
              <p className="text-gray-600 dark:text-gray-300 text-base">{user.fullname}</p>

              {user.description && (
                <p className="mt-3 text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                  {user.description}
                </p>
              )}

              <div className="flex flex-wrap gap-2 mt-3">
                {user.gender && (
                  <span className="text-xs bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 px-2.5 py-0.5 rounded-full capitalize">
                    {user.gender.toLowerCase()}
                  </span>
                )}
                {user.age_group && (
                  <span className="text-xs bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 px-2.5 py-0.5 rounded-full">
                    {user.age_group}
                  </span>
                )}
                {user.language && (
                  <span className="text-xs bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 px-2.5 py-0.5 rounded-full">
                    {user.language.name}
                  </span>
                )}
                {user.geo?.country && (
                  <span className="text-xs bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 px-2.5 py-0.5 rounded-full">
                    📍 {user.geo.country.name}
                  </span>
                )}
              </div>

              <div className="flex flex-wrap gap-3 mt-5">
                <button
                  onClick={handleListToggle}
                  className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium text-sm transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-1 ${
                    inList
                      ? "bg-purple-600 dark:bg-purple-500 text-white hover:bg-purple-700 dark:hover:bg-purple-600 focus:ring-purple-400"
                      : "bg-gray-900 dark:bg-gray-800 hover:bg-gray-800 dark:hover:bg-gray-700 text-white focus:ring-gray-400"
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
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium text-sm border border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300 hover:border-purple-300 dark:hover:border-purple-500 hover:text-purple-700 dark:hover:text-purple-400 transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-purple-400"
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

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4">
          <StatCard label="Followers" value={formatFollowers(user.followers)} highlight />
          <StatCard label="Engagement Rate" value={formatEngagementRate(user.engagement_rate)} />
          {user.posts_count !== undefined && <StatCard label="Posts" value={formatNumber(user.posts_count)} />}
          {user.engagements !== undefined && <StatCard label="Avg Engagements" value={formatCount(user.engagements)} />}
          {user.avg_likes !== undefined && user.avg_likes > 0 && <StatCard label="Avg Likes" value={formatCount(user.avg_likes)} />}
          {user.avg_comments !== undefined && user.avg_comments > 0 && <StatCard label="Avg Comments" value={formatCount(user.avg_comments)} />}
          {user.avg_views !== undefined && user.avg_views > 0 && <StatCard label="Avg Views" value={formatCount(user.avg_views)} />}
          {user.avg_reels_plays !== undefined && user.avg_reels_plays > 0 && <StatCard label="Avg Reels Plays" value={formatCount(user.avg_reels_plays)} />}
          {user.avg_shares !== undefined && user.avg_shares > 0 && <StatCard label="Avg Shares" value={formatCount(user.avg_shares)} />}
          {user.avg_saves !== undefined && user.avg_saves > 0 && <StatCard label="Avg Saves" value={formatCount(user.avg_saves)} />}
          {user.total_likes !== undefined && user.total_likes > 0 && <StatCard label="Total Likes" value={formatCount(user.total_likes)} />}
          {user.paid_post_performance !== undefined && (
            <StatCard label="Paid Post Performance" value={(user.paid_post_performance * 100).toFixed(1) + "%"} />
          )}
        </div>

        {user.stat_history && user.stat_history.length > 0 && (
          <FollowerGrowthChart history={user.stat_history} />
        )}

        {user.interests && user.interests.length > 0 && (
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-5 mb-4 shadow-sm">
            <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3">Interests</h2>
            <div className="flex flex-wrap gap-2">
              {user.interests.map((interest) => (
                <span
                  key={interest.id}
                  className="px-3 py-1 rounded-full text-xs font-medium bg-purple-50 dark:bg-purple-950/20 text-purple-750 dark:text-purple-300 border border-purple-100 dark:border-purple-900/35"
                >
                  {interest.name}
                </span>
              ))}
            </div>
          </div>
        )}

        {user.brand_affinity && user.brand_affinity.length > 0 && (
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-5 mb-4 shadow-sm">
            <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3">Brand Affinity</h2>
            <div className="flex flex-wrap gap-2">
              {user.brand_affinity.map((brand) => (
                <span
                  key={brand.id}
                  className="px-3 py-1 rounded-full text-xs font-medium bg-amber-50 dark:bg-amber-950/20 text-amber-700 dark:text-amber-400 border border-amber-100 dark:border-amber-900/30"
                >
                  {brand.name}
                </span>
              ))}
            </div>
          </div>
        )}

        {user.top_hashtags && user.top_hashtags.length > 0 && (
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-5 mb-4 shadow-sm">
            <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3">Top Hashtags</h2>
            <div className="flex flex-wrap gap-2">
              {user.top_hashtags.slice(0, 15).map((h) => (
                <TagPill key={h.tag} tag={h.tag} />
              ))}
            </div>
          </div>
        )}

        {user.top_mentions && user.top_mentions.length > 0 && (
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-5 mb-4 shadow-sm">
            <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3">Top Mentions</h2>
            <div className="flex flex-wrap gap-2">
              {user.top_mentions.slice(0, 10).map((m) => (
                <span
                  key={m.tag}
                  className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-50 dark:bg-blue-950/20 text-blue-700 dark:text-blue-400"
                >
                  @{m.tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {user.similar_users && user.similar_users.length > 0 && (
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-5 mb-4 shadow-sm">
            <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-4">Similar Creators</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {user.similar_users.slice(0, 6).map((sim) => (
                <div
                  key={sim.user_id}
                  className="flex items-center gap-2.5 p-2.5 rounded-xl border border-gray-100 dark:border-gray-800 hover:border-purple-100 dark:hover:border-purple-800 hover:bg-purple-50 dark:hover:bg-purple-950/20 transition-colors"
                >
                  <img
                    src={sim.picture}
                    alt={sim.fullname}
                    className="w-9 h-9 rounded-full object-cover border border-gray-200 dark:border-gray-700 flex-shrink-0"
                    loading="lazy"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(sim.fullname)}&background=7c3aed&color=fff&size=36`;
                    }}
                  />
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-gray-900 dark:text-gray-100 truncate">
                      @{sim.username}
                    </p>
                    <p className="text-xs text-gray-400 dark:text-gray-500 truncate">
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
