import { BrowserRouter, Route, Routes, useParams } from "react-router-dom";
import { SearchPage } from "@/pages/SearchPage";
import { ProfileDetailPage } from "@/pages/ProfileDetailPage";

// Wrapper that uses username as key so the component fully remounts on navigation
function ProfileDetailPageWrapper() {
  const { username } = useParams<{ username: string }>();
  return <ProfileDetailPage key={username} />;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<SearchPage />} />
        <Route path="/profile/:username" element={<ProfileDetailPageWrapper />} />
        <Route path="*" element={<SearchPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
