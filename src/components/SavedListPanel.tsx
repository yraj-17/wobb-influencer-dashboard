import { useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useInfluencerStore } from "@/store/useInfluencerStore";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { SortableSavedItem } from "./SortableSavedItem";

export function SavedListPanel() {
  const savedList = useInfluencerStore((s) => s.savedList);
  const removeFromList = useInfluencerStore((s) => s.removeFromList);
  const clearList = useInfluencerStore((s) => s.clearList);
  const reorderList = useInfluencerStore((s) => s.reorderList);
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

  // CSV Export handler
  const handleExportCSV = useCallback(() => {
    if (savedList.length === 0) return;

    const headers = ["User ID", "Username", "Full Name", "Platform", "Followers", "Saved At"];
    const rows = savedList.map(({ profile, platform, savedAt }) => [
      profile.user_id,
      profile.username,
      profile.fullname,
      platform,
      profile.followers,
      new Date(savedAt).toISOString(),
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.map((val) => `"${String(val).replace(/"/g, '""')}"`).join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `saved_influencers_${Date.now()}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [savedList]);

  // Sensors for DnD reordering
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // Avoid initiating drag on click
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = savedList.findIndex((item) => item.profile.user_id === active.id);
      const newIndex = savedList.findIndex((item) => item.profile.user_id === over.id);

      const newList = arrayMove(savedList, oldIndex, newIndex);
      reorderList(newList);
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-black/40 dark:bg-black/60 backdrop-blur-sm"
        onClick={() => setListPanelOpen(false)}
        aria-hidden="true"
      />

      {/* Panel */}
      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Saved influencer list"
        className="fixed right-0 top-0 z-50 h-full w-full max-w-md bg-white dark:bg-gray-900 shadow-2xl flex flex-col transition-all border-l border-gray-100 dark:border-gray-800"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 dark:border-gray-800">
          <div>
            <h2 className="text-base font-bold text-gray-900 dark:text-gray-100">My List</h2>
            <p className="text-xs text-gray-400 mt-0.5">
              {savedList.length === 0
                ? "No influencers saved yet"
                : `${savedList.length} influencer${savedList.length !== 1 ? "s" : ""} saved`}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {savedList.length > 0 && (
              <>
                <button
                  onClick={handleExportCSV}
                  className="text-xs text-purple-600 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-300 font-medium px-2 py-1 rounded hover:bg-purple-50 dark:hover:bg-purple-950/20 transition-colors"
                  aria-label="Export list to CSV"
                >
                  Export CSV
                </button>
                <span className="text-gray-300 dark:text-gray-700">|</span>
                <button
                  onClick={clearList}
                  className="text-xs text-red-500 hover:text-red-700 dark:hover:text-red-400 font-medium px-2 py-1 rounded hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors"
                  aria-label="Clear all saved profiles"
                >
                  Clear all
                </button>
              </>
            )}
            <button
              onClick={() => setListPanelOpen(false)}
              className="p-2 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              aria-label="Close panel"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-900/50">
          {savedList.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center px-8">
              <div className="w-16 h-16 bg-purple-50 dark:bg-purple-950/20 rounded-full flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                </svg>
              </div>
              <p className="text-gray-700 dark:text-gray-300 font-medium">Your list is empty</p>
              <p className="text-gray-400 dark:text-gray-550 text-sm mt-1">
                Click "Save" on any influencer card to add them here
              </p>
            </div>
          ) : (
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
              <SortableContext items={savedList.map((item) => item.profile.user_id)} strategy={verticalListSortingStrategy}>
                <ul className="divide-y divide-gray-100 dark:divide-gray-800/50" role="list">
                  {savedList.map((entry) => (
                    <SortableSavedItem
                      key={entry.profile.user_id}
                      id={entry.profile.user_id}
                      entry={entry}
                      onNavigate={handleNavigate}
                      onRemove={removeFromList}
                    />
                  ))}
                </ul>
              </SortableContext>
            </DndContext>
          )}
        </div>

        {/* Footer */}
        {savedList.length > 0 && (
          <div className="px-5 py-4 border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900">
            <p className="text-xs text-gray-400 dark:text-gray-500 text-center">
              Drag drag-handles to reorder • persists automatically
            </p>
          </div>
        )}
      </aside>
    </>
  );
}
