import { memo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import type { Platform, UserProfileSummary } from "@/types";
import { VerifiedBadge } from "./VerifiedBadge";
import { formatFollowers, formatEngagementRate } from "@/utils/formatters";
import { useInfluencerStore } from "@/store/useInfluencerStore";

interface ProfileCardProps {
  profile: UserProfileSummary;
  platform: Platform;
}

export const ProfileCard = memo(function ProfileCard({
  profile,
  platform,
}: ProfileCardProps) {
  const navigate = useNavigate();
  const addToList = useInfluencerStore((s) => s.addToList);
  const removeFromList = useInfluencerStore((s) => s.removeFromList);
  const isInList = useInfluencerStore((s) => s.isInList);

  const inList = isInList(profile.user_id);

  const handleCardClick = useCallback(() => {
    navigate(`/profile/${profile.username}?platform=${platform}`);
  }, [navigate, profile.username, platform]);

  const handleListToggle = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      if (inList) {
        removeFromList(profile.user_id);
      } else {
        addToList(profile, platform);
      }
    },
    [inList, addToList, removeFromList, profile, platform]
  );

  return (
    <div
      onClick={handleCardClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && handleCardClick()}
      className="group flex items-center gap-4 p-4 bg-white border border-gray-200 rounded-2xl cursor-pointer hover:border-purple-200 hover:shadow-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-purple-400"
      aria-label={`View profile of ${profile.fullname}`}
    >
      {/* Avatar */}
      <div className="relative flex-shrink-0">
        <img
          src={profile.picture}
          alt={`${profile.fullname} avatar`}
          className="w-14 h-14 rounded-full object-cover border-2 border-gray-100"
          loading="lazy"
          onError={(e) => {
            (e.target as HTMLImageElement).src =
              `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.fullname)}&background=7c3aed&color=fff&size=56`;
          }}
        />
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0 text-left">
        <div className="flex items-center gap-1 flex-wrap">
          <span className="font-semibold text-gray-900 text-sm truncate">
            @{profile.username}
          </span>
          <VerifiedBadge verified={profile.is_verified} />
        </div>
        <p className="text-sm text-gray-500 truncate">{profile.fullname}</p>
        <div className="flex items-center gap-3 mt-1 flex-wrap">
          <span className="text-xs font-medium text-gray-700">
            {formatFollowers(profile.followers)}
            <span className="text-gray-400 font-normal ml-0.5">followers</span>
          </span>
          {profile.engagement_rate !== undefined && (
            <span className="text-xs font-medium text-emerald-600">
              {formatEngagementRate(profile.engagement_rate)}
              <span className="text-gray-400 font-normal ml-0.5">eng.</span>
            </span>
          )}
        </div>
      </div>

      {/* Add to List Button */}
      <button
        onClick={handleListToggle}
        className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-1 ${
          inList
            ? "bg-purple-100 text-purple-700 hover:bg-red-50 hover:text-red-600 focus:ring-red-400"
            : "bg-gray-100 text-gray-600 hover:bg-purple-100 hover:text-purple-700 focus:ring-purple-400"
        }`}
        aria-label={inList ? `Remove ${profile.fullname} from list` : `Add ${profile.fullname} to list`}
        aria-pressed={inList}
      >
        <svg
          className="w-3.5 h-3.5"
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
        <span className="hidden sm:inline">{inList ? "Saved" : "Save"}</span>
      </button>
    </div>
  );
});
