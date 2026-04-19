import { Link, Route, Routes, useLocation } from "react-router-dom";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import SearchPage from "./pages/SearchPage";
import DetailsPage from "./pages/DetailsPage";
import ProfilePage from "./pages/ProfilePage";
import PublicProfilePage from "./pages/PublicProfilePage";
import MyPlaylistsPage from "./pages/MyPlaylistsPage";
import NewReviewPage from "./pages/NewReviewPage";
import SettingsPage from "./pages/SettingsPage";
import AdminUsersPage from "./pages/AdminUsersPage";
import AboutPage from "./pages/AboutPage";
import { useAuth } from "./context/AuthContext";
import RequireAuth from "./components/RequireAuth";
import RequireRole from "./components/RequireRole";
import { formatRoleLabel } from "./lib/roleLabel";

/* ── Inline SVG icons ─────────────────────────────── */
const IconHome = () => (
  <svg viewBox="0 0 24 24"><path d="M3 12l9-9 9 9"/><path d="M9 21V12h6v9"/></svg>
);
const IconSearch = () => (
  <svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
);
const IconList = () => (
  <svg viewBox="0 0 24 24"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>
);
const IconUser = () => (
  <svg viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
);
const IconSettings = () => (
  <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
);
const IconShield = () => (
  <svg viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
);
const IconInfo = () => (
  <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
);
const IconLogout = () => (
  <svg viewBox="0 0 24 24"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
);
const IconMusic = () => (
  <svg viewBox="0 0 18 24" fill="currentColor" stroke="none"><path d="M9 3v10.55A4 4 0 1 0 11 17V7h4V3H9z"/></svg>
);

/* ── NavItem helper ───────────────────────────────── */
function NavItem({
  to,
  icon,
  children,
  currentPath,
}: {
  to: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  currentPath: string;
}) {
  const isActive = currentPath === to || (to !== "/" && currentPath.startsWith(to));
  return (
    <Link to={to} className={`nav-item${isActive ? " active" : ""}`}>
      {icon}
      <span>{children}</span>
    </Link>
  );
}

/* ── App ──────────────────────────────────────────── */
export default function App() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const path = location.pathname;

  const avatarLetter = user
    ? (user.displayName || user.username || "?")[0].toUpperCase()
    : "";

  return (
    <div className="app-shell">
      {/* ── Sidebar ── */}
      <nav className="sidebar">
        {/* Logo */}
        <Link to="/" className="sidebar-logo" aria-label="Go to Home">
          <div className="logo-icon">
            <IconMusic />
          </div>
          <span className="logo-text">Music Share</span>
        </Link>

        {/* Main navigation */}
        <div className="sidebar-section">
          <div className="sidebar-section-label">Browse</div>
          <NavItem to="/" icon={<IconHome />} currentPath={path}>Home</NavItem>
          <NavItem to="/search" icon={<IconSearch />} currentPath={path}>Search</NavItem>
          <NavItem to="/about" icon={<IconInfo />} currentPath={path}>About</NavItem>
        </div>

        {user && (
          <div className="sidebar-section">
            <div className="sidebar-section-label">Library</div>
            <NavItem to="/profile" icon={<IconUser />} currentPath={path}>My Profile</NavItem>
            <NavItem to="/my-playlists" icon={<IconList />} currentPath={path}>My Playlists</NavItem>
            <NavItem to="/settings" icon={<IconSettings />} currentPath={path}>Settings</NavItem>
            {user.role === "SUPER_ADMIN" && (
              <NavItem to="/admin/users" icon={<IconShield />} currentPath={path}>Admin</NavItem>
            )}
          </div>
        )}

        {!user && (
          <div className="sidebar-section">
            <div className="sidebar-section-label">Account</div>
            <NavItem to="/login" icon={<IconUser />} currentPath={path}>Log In</NavItem>
            <NavItem to="/register" icon={<IconInfo />} currentPath={path}>Register</NavItem>
          </div>
        )}

        {/* User footer */}
        {user && (
          <div className="sidebar-footer">
            <div className="sidebar-footer-row">
              <Link to="/profile" className="sidebar-user" aria-label="Go to Profile">
                <div className="sidebar-avatar">{avatarLetter}</div>
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div className="sidebar-username">
                    {user.displayName || user.username}
                  </div>
                  <div className="sidebar-role">{formatRoleLabel(user.role)}</div>
                </div>
              </Link>
              <button
                className="sidebar-logout-btn"
                title="Logout"
                onClick={() => void logout()}
              >
                <IconLogout />
              </button>
            </div>
          </div>
        )}
      </nav>

      {/* ── Main Content ── */}
      <main className="main-content">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/project-info" element={<AboutPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/details/:trackId" element={<DetailsPage />} />
          <Route
            path="/profile"
            element={
              <RequireAuth>
                <ProfilePage />
              </RequireAuth>
            }
          />
          <Route path="/profile/:profileId" element={<PublicProfilePage />} />
          <Route
            path="/my-playlists"
            element={
              <RequireAuth>
                <MyPlaylistsPage />
              </RequireAuth>
            }
          />
          <Route
            path="/reviews/new"
            element={
              <RequireAuth>
                <NewReviewPage />
              </RequireAuth>
            }
          />
          <Route
            path="/settings"
            element={
              <RequireAuth>
                <SettingsPage />
              </RequireAuth>
            }
          />
          <Route
            path="/admin/users"
            element={
              <RequireAuth>
                <RequireRole roles={["SUPER_ADMIN"]}>
                  <AdminUsersPage />
                </RequireRole>
              </RequireAuth>
            }
          />
        </Routes>
      </main>
    </div>
  );
}
