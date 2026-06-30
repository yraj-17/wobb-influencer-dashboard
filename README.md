# Wobb Influencer Dashboard

A modern influencer search and shortlisting tool built with React, TypeScript, Vite, and Tailwind CSS.

---

## Live Demo

> Deploy URL will be added after deployment.

---

## What I Changed

### 1. Bug Fixes
| # | Location | Bug | Fix |
|---|----------|-----|-----|
| 1 | `ProfileDetailPage` | `engagement_rate * 10000` displayed rates 100× too high (e.g. 1.25% showed as 125.00%) | Changed to use shared `formatEngagementRate` which correctly multiplies by 100 |
| 2 | `ProfileDetailPage` | "Engagements" stat tile showed `formatEngagementRate(rate)` — a percentage — instead of the engagement count | Now shows `formatCount(user.engagements)` — the actual integer count |
| 3 | `dataHelpers.ts` | Username search was case-sensitive (`includes(query)`) while fullname search was case-insensitive — inconsistent | Both now use `.toLowerCase()` before comparison |
| 4 | `SearchPage` | `clickCount` state and `handleProfileClick` were dead code — logged to console, never displayed | Removed entirely |
| 5 | `ProfileCard` | `data-search={searchQuery}` DOM attribute served no purpose | Removed |
| 6 | `SearchBar.tsx` | Entire component was dead code — never imported or used | Deleted |

### 2. State Management — React Context → Zustand
Replaced all local/prop-drilled state with a single Zustand store (`src/store/useInfluencerStore.ts`):
- Platform selection and search query
- Saved influencer list
- List panel open/close UI state
- `persist` middleware with `partialize` to save `platform` and `savedList` to `localStorage` — persists across page refreshes

### 3. "Add to List" Feature (fully implemented)
- **Save button** on every `ProfileCard` and the `ProfileDetailPage`
- Prevents duplicate entries (checks `user_id`)
- Button toggles between "Save" and "Saved" with visual feedback
- `SavedListPanel` — a slide-over drawer accessible via the header "My List" button
  - Shows all saved profiles with avatar, name, follower count, platform badge
  - Click any profile to navigate to its detail page
  - Remove individual profiles or clear the entire list
  - Persists to `localStorage` via Zustand `persist`
- Badge on header button shows count of saved profiles

### 4. UI/UX Redesign
- Clean, modern layout with a sticky header and gradient brand mark
- Profile cards redesigned: avatar, verified badge, follower count, engagement rate, save toggle
- Responsive grid layout (1 col mobile → 2 col tablet+)
- Platform tabs with inline SVG icons for Instagram, YouTube, TikTok
- Search bar with clear button and live result count
- Profile detail page rebuilt with:
  - Proper stat cards grid (all platform-specific fields shown)
  - Follower growth timeline with visual bar chart
  - Top hashtags, top mentions, brand affinity, interests sections
  - Similar creators grid
  - Skeleton loading state (no layout shift)
  - Error and not-found states
- `SavedListPanel` slide-over drawer with backdrop blur
- Accessible: all interactive elements have `aria-label`, `role`, keyboard navigation, and `focus-visible` styles

### 5. TypeScript Improvements
- Expanded `FullUserProfile` to include all fields present in the JSON data (`stat_history`, `geo`, `brand_affinity`, `interests`, `top_hashtags`, `top_mentions`, `similar_users`, `contacts`, `language`, etc.)
- Added new types: `StatHistory`, `GeoLocation`, `TagWeight`, `RelevantTag`, `BrandAffinity`, `Interest`, `SimilarUser`, `SavedProfile`
- Removed implicit `any` patterns
- Replaced `JSX.Element` (requires namespace import) with `ReactElement` from React

### 6. Performance
- `ProfileCard` and `ProfileList` wrapped in `memo` to prevent unnecessary re-renders when unrelated state changes
- `useMemo` for `extractProfiles` and `filterProfiles` in `SearchPage` — prevents recomputing on every render
- `useCallback` for event handlers in `ProfileCard` and `ProfileDetailPage`
- Profile JSON files are loaded lazily via `import.meta.glob` — only the requested profile is fetched, not all at once
- `loading="lazy"` on all `<img>` tags in lists

### 7. Code Quality
- Flat, consistent folder structure: `src/store/`, `src/components/`, `src/pages/`, `src/utils/`, `src/types/`
- All components are focused single-responsibility
- Shared formatter functions in `utils/formatters.ts` used consistently everywhere
- `getPlatformLabel` extended with `getPlatformColor` and `getPlatformIcon` helpers

---

## Libraries Added

| Library | Why |
|---------|-----|
| `zustand@5` | Lightweight, boilerplate-free state management to replace the missing React Context. `persist` middleware handles localStorage with zero extra code. |

### Libraries intentionally NOT added
- `@dnd-kit/*` was already installed in the starter but unused. I opted not to implement drag-to-reorder because it wasn't in the core requirements and the simpler list UX is cleaner for the use case. The packages remain available if needed.

---

## Assumptions

- Profile JSON files are loaded by exact username match (case-sensitive filename). Users whose username in the search list doesn't match a profile filename will show a "profile not found" state — this matches the starter's behavior.
- The `engagement_rate` field in all JSON data is a decimal (e.g. `0.0125` = 1.25%), not already a percentage. The original code's `* 10000` was a clear bug.
- "Add to List" persists to localStorage only — no backend/API integration assumed.

---

## Trade-offs

- **No drag-to-reorder**: The list panel uses a simple ordered list. `@dnd-kit` is installed and would be straightforward to add, but adds complexity without clear value for this scope.
- **No pagination**: The data sets are small (10 items each), so client-side rendering of all results is fine. For real-world scale, virtual scrolling or server-side pagination would be needed.
- **No tests written**: Focused on the core requirements first. Test scaffolding with Vitest would be the next step.

---

## Remaining Improvements (given more time)

- [ ] Add Vitest + React Testing Library unit tests for store logic and component behavior
- [ ] Implement `@dnd-kit` drag-to-reorder in the saved list panel
- [ ] Add micro-animations (Framer Motion) for card hover, panel slide-in, save button state change
- [ ] Export saved list as CSV
- [ ] Add follower growth sparkline chart (Recharts or Chart.js)
- [ ] Deploy to Vercel

---

## Getting Started

```bash
npm install
npm run dev       # http://localhost:5173
npm run build     # Production build
npm run lint      # ESLint
```
