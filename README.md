# Wobb Influencer Dashboard

A modern, production-grade influencer search and shortlisting tool built with React, TypeScript, Vite, Zustand, and Tailwind CSS.

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
| 7 | `dataHelpers.ts` | Search page crashed (TypeError) on search when username or fullname was missing (e.g., Vlad and Niki) | Normalised profiles in `extractProfiles` with default fallbacks and added safe guards in `filterProfiles` |
| 8 | `ProfileCard`, `ProfileDetailPage` | "Save" state did not update instantly due to reading store method via a function instead of subscribing to state | Updated store subscription to use `savedList` dependency directly via selectors, ensuring instant UI synchronization |

### 2. State Management — React Context → Zustand
Replaced all local/prop-drilled state with a single, fine-grained Zustand store (`src/store/useInfluencerStore.ts`):
- Platform selection and search query
- Saved influencer list (with `reorderList` action for sorting)
- List panel open/close UI state
- Persisted state: platform preference, savedList, and theme preference are saved in `localStorage` via Zustand `persist` middleware

### 3. "Add to List" Feature (fully implemented)
- **Save button** on every `ProfileCard` and the `ProfileDetailPage`
- Prevents duplicate entries (checks `user_id`)
- Button toggles between "Save" and "Saved" with visual feedback and instant state update
- **SavedListPanel** — slide-over drawer containing:
  - Drag-and-drop sortable context via `@dnd-kit/core` and `@dnd-kit/sortable`
  - Drag handles on each item to reorder saved creators manually
  - One-click **Export CSV** button to download shortlist data
  - Clear all and close panel features
  - Automatic persistence to `localStorage`
- Count badge on the header "My List" button

### 4. UI/UX Redesign
- **Light/Dark Mode**: Header toggle switches between light and dark themes. Applied CSS transitions and color variants throughout the entire interface (headers, search bar, filters, cards, and drawers).
- **Responsive Layout**: Fluid grids supporting desktop (3-col or 2-col), tablet, and mobile views.
- **Platform Navigation**: SVG tabs with brand colors highlighting Instagram, YouTube, and TikTok.
- **Interactive Follower Growth Chart**: Replaced static bar list with a custom responsive SVG line chart containing Y-axis gridlines, custom purple area gradient, hover nodes, and a floating data tooltip.
- **Aesthetic Cards**: Shadow depth variations, scale-up zoom, and hover transitions.
- **A11y Compliant**: Screen reader descriptive titles, keyboard focus visibility borders, and proper semantic element hierarchies.

### 5. TypeScript Improvements
- Expanded `FullUserProfile` to include all fields present in the JSON data (`stat_history`, `geo`, `brand_affinity`, `interests`, `top_hashtags`, `top_mentions`, `similar_users`, `contacts`, `language`, etc.)
- Added new types: `StatHistory`, `GeoLocation`, `TagWeight`, `RelevantTag`, `BrandAffinity`, `Interest`, `SimilarUser`, `SavedProfile`
- Removed implicit `any` patterns and added type safety for inline dnd-kit event parameters.
- Replaced `JSX.Element` with `ReactElement` from React.

### 6. Performance
- Fine-grained selectors on `useInfluencerStore` hook in components so state updates only trigger relevant re-renders.
- `ProfileCard` and `ProfileList` wrapped in `memo` to prevent unnecessary re-renders when unrelated state changes.
- `useMemo` for `extractProfiles` and `filterProfiles` in `SearchPage` — prevents recomputing on every render.
- `useCallback` for event handlers in `ProfileCard` and `ProfileDetailPage`.
- Profile JSON files are loaded lazily via `import.meta.glob` — only the requested profile is fetched, not all at once.
- `loading="lazy"` on all `<img>` tags in lists.

### 7. Code Quality
- Flat, consistent folder structure: `src/store/`, `src/components/`, `src/pages/`, `src/utils/`, `src/types/`
- All components are focused single-responsibility.
- Shared formatter functions in `utils/formatters.ts` used consistently everywhere.
- `getPlatformLabel` extended with `getPlatformColor` and `getPlatformIcon` helpers.

---

## Libraries Added

| Library | Why |
|---------|-----|
| `zustand@5` | Lightweight, boilerplate-free state management. Handles local storage persistence cleanly. |
| `@dnd-kit/core` | Extensible drag-and-drop primitives for React. Used for saved list panel dragging. |
| `@dnd-kit/sortable` | Built-in sorting behaviors and strategies for list components. |
| `@dnd-kit/utilities` | Drag transforms, transition, and style helpers. |

---

## Assumptions

- Profile JSON files are loaded by exact username match (case-sensitive filename). Users whose username in the search list doesn't match a profile filename will show a "profile not found" state — this matches the starter's behavior.
- The `engagement_rate` field in all JSON data is a decimal (e.g. `0.0125` = 1.25%), not already a percentage. The original code's `* 10000` was a clear bug.
- "Add to List" persists to localStorage only — no backend/API integration assumed.

---

## Trade-offs

- **Client-side Filtering & Sorting**: Since mock data sets are small (10 items each), all computations (filtering, search, reordering) are done client-side. At scale, this would require server-side queries or a virtualized viewport.
- **Local Storage Reordering**: Reordering the saved list saves order arrays inside local state/storage. On database-backed production apps, this would trigger PUT endpoints on a relational schema table.

---

## Remaining Improvements (given more time)

- [ ] Add Vitest + React Testing Library unit tests for store logic and component behavior
- [ ] Add transition animations using Framer Motion
- [ ] Add a visual growth rate calculator indicator next to metrics
- [ ] Deploy to Vercel

---

## Getting Started

```bash
npm install
npm run dev       # http://localhost:5173 (or next port if in use)
npm run build     # Production build
npm run lint      # ESLint
```
