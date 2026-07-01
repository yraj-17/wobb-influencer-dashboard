import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Platform, SavedProfile, UserProfileSummary } from "@/types";

interface InfluencerStore {
  // Search state
  platform: Platform;
  searchQuery: string;
  setPlatform: (platform: Platform) => void;
  setSearchQuery: (query: string) => void;

  // Saved list state
  savedList: SavedProfile[];
  addToList: (profile: UserProfileSummary, platform: Platform) => void;
  removeFromList: (userId: string) => void;
  isInList: (userId: string) => boolean;
  clearList: () => void;
  reorderList: (list: SavedProfile[]) => void;

  // UI state
  isListPanelOpen: boolean;
  setListPanelOpen: (open: boolean) => void;
  
  // Theme state
  theme: "light" | "dark";
  toggleTheme: () => void;
}

export const useInfluencerStore = create<InfluencerStore>()(
  persist(
    (set, get) => ({
      // Search state
      platform: "instagram",
      searchQuery: "",
      setPlatform: (platform) =>
        set({ platform, searchQuery: "" }),
      setSearchQuery: (searchQuery) => set({ searchQuery }),

      // Saved list state
      savedList: [],
      addToList: (profile, platform) => {
        const { savedList, isInList } = get();
        if (isInList(profile.user_id)) return;
        set({
          savedList: [
            ...savedList,
            { profile, platform, savedAt: Date.now() },
          ],
        });
      },
      removeFromList: (userId) => {
        set((state) => ({
          savedList: state.savedList.filter(
            (entry) => entry.profile.user_id !== userId
          ),
        }));
      },
      isInList: (userId) => {
        return get().savedList.some((entry) => entry.profile.user_id === userId);
      },
      clearList: () => set({ savedList: [] }),
      reorderList: (list) => set({ savedList: list }),

      // UI state — not persisted (excluded below)
      isListPanelOpen: false,
      setListPanelOpen: (open) => set({ isListPanelOpen: open }),

      // Theme state
      theme: "light",
      toggleTheme: () => set((state) => ({ theme: state.theme === "light" ? "dark" : "light" })),
    }),
    {
      name: "wobb-influencer-storage",
      // Only persist platform preference, theme, and savedList
      partialize: (state) => ({
        platform: state.platform,
        savedList: state.savedList,
        theme: state.theme,
      }),
    }
  )
);
