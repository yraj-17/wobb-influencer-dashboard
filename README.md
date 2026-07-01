# Wobb Influencer Dashboard

A modern, production-grade influencer search and shortlisting tool built with React, TypeScript, Vite, Zustand, and Tailwind CSS.

---



## Deployment

| Environment | URL |
|-------------|-----|
| Production  | https://wobb-influencer-dashboard.vercel.app/ |

---

## What I Changed

### 1. Bug Fixes
| # | Location | Bug | Fix |
|---|----------|-----|-----|
| 1 | `ProfileDetailPage` | `engagement_rate * 10000` displayed rates 100× too high (e.g. 1.25% showed as 125.00%) | Changed to use shared `formatEngagementRate`, which correctly multiplies by 100 |
| 2 | `ProfileDetailPage` | "Engagements" stat tile showed `formatEngagementRate(rate)` — a percentage — instead of the engagement count | Now shows `formatCount(user.engagements)` — the actual integer count |
| 3 | `dataHelpers.ts` | Username search was case-sensitive (`includes(query)`) while fullname search was case-insensitive — inconsistent | Both now use `.toLowerCase()` before comparison |
| 4 | `SearchPage` | `clickCount` state and `handleProfileClick` were dead code — logged to console, never displayed | Removed entirely |
| 5 | `ProfileCard` | `data-search={searchQuery}` DOM attribute served no purpose | Removed |
| 6 | `SearchBar.tsx` | Entire component was dead code — never imported or used | Deleted |
| 7 | `dataHelpers.ts` | Search page crashed (TypeError) when a profile's username or fullname was missing (e.g. Vlad and Niki) | Normalised profiles in `extractProfiles` with default fallbacks and added safe guards in `filterProfiles` |
| 8 | `ProfileCard`, `ProfileDetailPage` | "Save" state didn't update instantly — the component read the store's save method via a plain function instead of subscribing to state | Updated to select `savedList` directly from the store, so the UI updates immediately on change |

### 2. State Management — React Context → Zustand
Replaced all local/prop-drilled state with a single, fine-grained Zustand store (`src/store/useInfluencerStore.ts`):
- Platform selection and search query
- Saved influencer list (with a `reorderList` action for drag-and-drop sorting)
- List panel open/close UI state
- Persisted state (platform preference, saved list, theme preference) saved to `localStorage` via Zustand's `persist` middleware

### 3. "Add to List" Feature (fully implemented)
- **Save button** on every `ProfileCard` and on `ProfileDetailPage`
- Duplicate prevention (checks `user_id` before adding)
- Button toggles between "Save" / "Saved" with instant visual feedback
- **SavedListPanel** — a slide-over drawer that includes:
  - Drag-and-drop reordering via `@dnd-kit/core` + `@dnd-kit/sortable`
  - Drag handles on each item
  - One-click **Export CSV** for the shortlist
  - Clear-all and close-panel actions
  - Automatic persistence to `localStorage`
- Count badge on the header's "My List" button

### 4. UI/UX Redesign
- **Light/Dark mode** toggle in the header, with consistent theming across headers, search bar, filters, cards, and drawers
- **Responsive layout** — 3-col / 2-col grids on desktop, adapting down to tablet and mobile
- **Platform navigation** — SVG tabs with brand colors for Instagram, YouTube, TikTok
- **Interactive follower growth chart** — replaced the static bar list with a custom responsive SVG line chart (gridlines, gradient fill, hover nodes, floating tooltip)
- **Card polish** — shadow depth, hover/zoom transitions
- **Accessibility** — descriptive labels for screen readers, visible keyboard focus states, semantic element hierarchy

### 5. TypeScript Improvements
- Expanded `FullUserProfile` to cover all fields actually present in the JSON data (`stat_history`, `geo`, `brand_affinity`, `interests`, `top_hashtags`, `top_mentions`, `similar_users`, `contacts`, `language`, etc.)
- Added supporting types: `StatHistory`, `GeoLocation`, `TagWeight`, `RelevantTag`, `BrandAffinity`, `Interest`, `SimilarUser`, `SavedProfile`
- Removed implicit `any` usage, including in dnd-kit event handlers
- Replaced `JSX.Element` with `ReactElement` from React

### 6. Performance
- Fine-grained selectors on `useInfluencerStore` so components only re-render on relevant state changes
- `ProfileCard` and `ProfileList` wrapped in `memo`
- `useMemo` for `extractProfiles` and `filterProfiles` in `SearchPage`
- `useCallback` for event handlers in `ProfileCard` and `ProfileDetailPage`
- Profile JSON loaded lazily via `import.meta.glob` — only the requested profile is fetched
- `loading="lazy"` on all list images

### 7. Code Quality
- Consistent folder structure: `src/store/`, `src/components/`, `src/pages/`, `src/utils/`, `src/types/`
- Single-responsibility components
- Shared formatters in `utils/formatters.ts` used consistently everywhere
- `getPlatformLabel` extended with `getPlatformColor` and `getPlatformIcon`

---

## Libraries Added

| Library | Why |
|---------|-----|
| `zustand@5` | Lightweight, boilerplate-free state management with clean `localStorage` persistence |
| `@dnd-kit/core` | Drag-and-drop primitives for React, used in the saved list panel |
| `@dnd-kit/sortable` | Sorting strategies/behaviors on top of dnd-kit |
| `@dnd-kit/utilities` | Drag transform/transition style helpers |

**Removed:** `react-beautiful-dnd`, which was present in the starter's dependencies but unused and is no longer actively maintained — replaced by `@dnd-kit`, which is actively maintained and has first-class React 19 support.

---

## Assumptions

- Profile JSON files are loaded by exact username match (case-sensitive filename). A username in the search list that doesn't match a profile filename shows a "profile not found" state — matching the starter's original behavior.
- `engagement_rate` in the JSON data is a decimal (e.g. `0.0125` = 1.25%), not already a percentage. The starter's `* 10000` was a clear bug.
- "Add to List" persists to `localStorage` only — no backend/API integration was assumed, since none was provided in the starter.

---

## Trade-offs

- **Client-side filtering & sorting**: mock data sets are small (10 items per platform), so all filtering, search, and reordering run client-side. At real scale, this would move to server-side queries and/or a virtualized list.
- **Local storage for saved-list order**: reordering is persisted to local state/storage. In a database-backed production app, this would instead call an update endpoint against a relational schema.

---

## Remaining Improvements (given more time)

- [ ] Add Vitest + React Testing Library unit tests for store logic and component behavior
- [ ] Add transition animations (e.g. Framer Motion)
- [ ] Add a growth-rate indicator next to the follower chart
- [ ] Deploy to Vercel and link the live demo above

---

## Getting Started

```bash
npm install
npm run dev       # http://localhost:5173 (or next available port)
npm run build     # Production build
npm run lint      # ESLint
```

---

## Author

**Raj**
- Email:ryadav.tech17@gmail.com
- LinkedIn: https://www.linkedin.com/in/raj-yadav-706b60397/