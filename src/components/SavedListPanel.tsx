import { useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useInfluencerStore } from "@/store/useInfluencerStore";
import { VerifiedBadge } from "./VerifiedBadge";
import { formatFollowers } from "@/utils/formatters";
import { getPlatformLabel } from "@/utils/dataHelpers";

export function SavedListPanel() {
  const savedList = useInfluencerStore((s) => s.savedList);
  const removeFromList = useInfluencerStore((s) => s.removeFromList);
  const clearList = useInfluencerStore((s) => s.clearList);
  const setListPanelOpen = useInfluencerStore((s) => s.setListPanelOpen);
  const navigate = useNavigate();

  // Close on Escape key
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setListPanelOpen(false);
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [setListPanelOpen]);

  // Prevent body scroll while panel is open
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  const handleNavigate = useCallback(
    (username: string, platform: string) => {
      setListPanelOpen(false);
      navigate(`/profile/${username}?platform=${platform}`);
    },
    [navigate, setListPanelOpen]
  );

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
        onClick={() => setListPanelOpen(false)}
        aria-hidden="true"
      />

      {/* Panel */}
      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Saved influencer list"
        className="fixed right-0 top-0 z-50 h-full w-full max-w-md bg-white shadow-2xl flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200">
          <div>
            <h2 className="text-base font-semibold text-gray-900">My List</h2>
            <p className="text-xs text-gray-400 mt-0.5">
              {savedList.length === 0
                ? "No influencers saved yet"
                : `${savedList.length} influencer${savedList.length !== 1 ? "s" : ""} saved`}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {savedList.length > 0 && (
              <button
                onClick={clearList}
                className="text-xs text-red-500 hover:text-red-700 font-medium px-2 py-1 rounded hover:bg-red-50 transition-colors"
                aria-label="Clear all saved profiles"
              >
                Clear all
              </button>
            )}
            <button
              onClick={() => setListPanelOpen(false)}
              className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
              aria-label="Close panel"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto">
          {savedList.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center px-8">
              <div className="w-16 h-16 bg-purple-50 rounded-full flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-purple-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                </svg>
              </div>
              <p className="text-gray-600 font-medium">Your list is empty</p>
              <p className="text-gray-400 text-sm mt-1">
                Click "Save" on any influencer card to add them here
              </p>
            </div>
          ) : (
            <ul className="divide-y divide-gray-100" role="list">
              {savedList.map(({ profile, platform }) => (
                <li
                  key={profile.user_id}
                  className="flex items-center gap-3 px-5 py-3.5 hover:bg-gray-50 transition-colors"
                >
                  {/* Avatar — click to navigate */}
                  <button
                    onClick={() => handleNavigate(profile.username, platform)}
                    className="flex-shrink-0 focus:outline-none focus:ring-2 focus:ring-purple-400 rounded-full"
                    aria-label={`View ${profile.fullname}'s profile`}
                  >
                    <img
                      src={profile.picture}
                      alt={profile.fullname}
                      className="w-11 h-11 rounded-full object-cover border border-gray-200"
                      loading="lazy"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.fullname)}&background=7c3aed&color=fff&size=44`;
                      }}
                    />
                  </button>

                  {/* Info */}
                  <div
                    className="flex-1 min-w-0 cursor-pointer"
                    onClick={() => handleNavigate(profile.username, platform)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => e.key === "Enter" && handleNavigate(profile.username, platform)}
                  >
                    <div className="flex items-center gap-1">
                      <span className="text-sm font-medium text-gray-900 truncate">
                        @{profile.username}
                      </span>
                      <VerifiedBadge verified={profile.is_verified} />
                    </div>
                    <p className="text-xs text-gray-500 truncate">{profile.fullname}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs text-gray-400">
                        {formatFollowers(profile.followers)} followers
                      </span>
                      <span className="w-1 h-1 rounded-full bg-gray-300" />
                      <span className="text-xs text-purple-500 font-medium">
                        {getPlatformLabel(platform)}
                      </span>
                    </div>
                  </div>

                  {/* Remove */}
                  <button
                    onClick={() => removeFromList(profile.user_id)}
                    className="flex-shrink-0 p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors focus:outline-none focus:ring-2 focus:ring-red-300"
                    aria-label={`Remove ${profile.fullname} from list`}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Footer */}
        {savedList.length > 0 && (
          <div className="px-5 py-4 border-t border-gray-200 bg-gray-50">
            <p className="text-xs text-gray-400 text-center">
              List is saved to your browser — persists across refreshes
            </p>
          </div>
        )}
      </aside>
    </>
  );
}
