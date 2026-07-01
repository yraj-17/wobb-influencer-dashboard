import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { SavedProfile } from "@/types";
import { VerifiedBadge } from "./VerifiedBadge";
import { formatFollowers } from "@/utils/formatters";
import { getPlatformLabel } from "@/utils/dataHelpers";

interface SortableSavedItemProps {
  id: string;
  entry: SavedProfile;
  onNavigate: (username: string, platform: string) => void;
  onRemove: (userId: string) => void;
}

export function SortableSavedItem({
  id,
  entry,
  onNavigate,
  onRemove,
}: SortableSavedItemProps) {
  const { profile, platform } = entry;
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 50 : "auto",
  };

  return (
    <li
      ref={setNodeRef}
      style={style}
      className={`flex items-center gap-3 px-5 py-3.5 bg-white dark:bg-gray-800 border-b border-gray-105 dark:border-gray-700/50 hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors group ${
        isDragging ? "shadow-lg" : ""
      }`}
    >
      {/* Drag handle */}
      <button
        type="button"
        className="flex-shrink-0 cursor-grab active:cursor-grabbing p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400 hover:text-gray-650 dark:hover:text-gray-300 focus:outline-none focus:ring-1 focus:ring-purple-500"
        aria-label="Drag to reorder"
        {...attributes}
        {...listeners}
      >
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path d="M7 2a2 2 0 10-2 2 2 2 0 002-2zm0 6a2 2 0 10-2 2 2 2 0 002-2zm0 6a2 2 0 10-2 2 2 2 0 002-2zm8-12a2 2 0 11-2 2 2 2 0 012-2zm0 6a2 2 0 11-2 2 2 2 0 012-2zm0 6a2 2 0 11-2 2 2 2 0 012-2z" />
        </svg>
      </button>

      {/* Avatar — click to navigate */}
      <button
        onClick={() => onNavigate(profile.username, platform)}
        className="flex-shrink-0 focus:outline-none focus:ring-2 focus:ring-purple-400 rounded-full"
        aria-label={`View ${profile.fullname}'s profile`}
      >
        <img
          src={profile.picture}
          alt={profile.fullname}
          className="w-10 h-10 rounded-full object-cover border border-gray-200 dark:border-gray-700"
          loading="lazy"
          onError={(e) => {
            (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.fullname)}&background=7c3aed&color=fff&size=40`;
          }}
        />
      </button>

      {/* Info */}
      <div
        className="flex-1 min-w-0 cursor-pointer"
        onClick={() => onNavigate(profile.username, platform)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === "Enter" && onNavigate(profile.username, platform)}
      >
        <div className="flex items-center gap-1">
          <span className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">
            @{profile.username}
          </span>
          <VerifiedBadge verified={profile.is_verified} />
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{profile.fullname}</p>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-xs text-gray-400">
            {formatFollowers(profile.followers)} followers
          </span>
          <span className="w-1 h-1 rounded-full bg-gray-300 dark:bg-gray-600" />
          <span className="text-xs text-purple-500 dark:text-purple-400 font-medium">
            {getPlatformLabel(platform)}
          </span>
        </div>
      </div>

      {/* Remove */}
      <button
        onClick={() => onRemove(profile.user_id)}
        className="flex-shrink-0 p-1.5 rounded-lg text-gray-455 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors focus:outline-none focus:ring-2 focus:ring-red-300"
        aria-label={`Remove ${profile.fullname} from list`}
      >
        <svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          viewBox="0 0 24 24"
        >
          <path d="M3 6h18" />
          <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
          <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
          <line x1="10" x2="10" y1="11" y2="17" />
          <line x1="14" x2="14" y1="11" y2="17" />
        </svg>
      </button>
    </li>
  );
}
