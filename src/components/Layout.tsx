import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { useInfluencerStore } from "@/store/useInfluencerStore";
import { SavedListPanel } from "./SavedListPanel";

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const savedList = useInfluencerStore((s) => s.savedList);
  const isListPanelOpen = useInfluencerStore((s) => s.isListPanelOpen);
  const setListPanelOpen = useInfluencerStore((s) => s.setListPanelOpen);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link
            to="/"
            className="flex items-center gap-2 text-gray-900 hover:text-purple-600 transition-colors"
          >
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-600 to-pink-500 flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
              </svg>
            </div>
            <span className="font-bold text-lg tracking-tight">Wobb</span>
            <span className="text-gray-400 font-normal text-sm hidden sm:block">
              / Influencer Search
            </span>
          </Link>

          {/* Saved List Button */}
          <button
            onClick={() => setListPanelOpen(true)}
            className="relative flex items-center gap-2 px-4 py-2 rounded-full bg-purple-50 hover:bg-purple-100 text-purple-700 font-medium text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-purple-400"
            aria-label={`Open saved list — ${savedList.length} profiles`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
            </svg>
            <span className="hidden sm:inline">My List</span>
            {savedList.length > 0 && (
              <span className="flex items-center justify-center w-5 h-5 rounded-full bg-purple-600 text-white text-xs font-bold">
                {savedList.length}
              </span>
            )}
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8">{children}</main>

      {/* Saved List Slide-over Panel */}
      {isListPanelOpen && <SavedListPanel />}
    </div>
  );
}
