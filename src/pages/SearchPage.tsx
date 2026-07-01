import { useMemo } from "react";
import { Layout } from "@/components/Layout";
import { PlatformFilter } from "@/components/PlatformFilter";
import { ProfileList } from "@/components/ProfileList";
import { extractProfiles, filterProfiles } from "@/utils/dataHelpers";
import { useInfluencerStore } from "@/store/useInfluencerStore";

export function SearchPage() {
  const platform = useInfluencerStore((s) => s.platform);
  const searchQuery = useInfluencerStore((s) => s.searchQuery);
  const setPlatform = useInfluencerStore((s) => s.setPlatform);
  const setSearchQuery = useInfluencerStore((s) => s.setSearchQuery);

  const allProfiles = useMemo(() => extractProfiles(platform), [platform]);
  const filtered = useMemo(
    () => filterProfiles(allProfiles, searchQuery),
    [allProfiles, searchQuery]
  );

  return (
    <Layout>
      {/* Hero */}
      <div className="mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-gray-100 tracking-tight">
          Find Influencers
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-2 text-base">
          Discover and shortlist top creators across Instagram, YouTube, and TikTok.
        </p>
      </div>

      <PlatformFilter
        selected={platform}
        onChange={setPlatform}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        totalResults={allProfiles.length}
        filteredResults={filtered.length}
      />

      <ProfileList profiles={filtered} platform={platform} />
    </Layout>
  );
}
