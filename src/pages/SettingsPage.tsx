import { useEffect, useState } from "react";
import { api } from "../lib/api";

const PROTECTED_SUPER_ADMIN_USERNAME = "music_share_super_admin";

export default function SettingsPage() {
  const [favoritesVisibility, setFavoritesVisibility] = useState<"PRIVATE" | "PUBLIC">("PRIVATE");
  const [bio, setBio] = useState("");
  const [favoriteGenre, setFavoriteGenre] = useState("");
  const [username, setUsername] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    const loadData = async () => {
      const resp = await api.getMyProfile();
      if (resp.code === 0) {
        setUsername(resp.data.user.username || "");
        setFavoritesVisibility(resp.data.user.favoritesVisibility);
        setBio(resp.data.user.bio || "");
        setFavoriteGenre(resp.data.user.favoriteGenre || "");
      }
    };
    void loadData();
  }, []);

  const saveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    const resp = await api.updateMyProfile({ favoritesVisibility, bio, favoriteGenre });
    setMessage({
      type: resp.code === 0 ? "success" : "error",
      text: resp.msg || (resp.code === 0 ? "Settings saved." : "Failed to save."),
    });
  };

  const changePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    const resp = await api.changeMyPassword(currentPassword, newPassword);
    setMessage({
      type: resp.code === 0 ? "success" : "error",
      text: resp.msg || (resp.code === 0 ? "Password updated." : "Failed to change password."),
    });
    if (resp.code === 0) {
      setCurrentPassword("");
      setNewPassword("");
    }
  };

  return (
    <section>
      <div className="page-header">
        <h1>Settings</h1>
        <div className="page-subtitle">Manage your account preferences</div>
      </div>

      {message && (
        <div key={`${message.type}-${message.text}`} className={`feedback-bar ${message.type}`}>{message.text}</div>
      )}

      {/* Privacy & preferences */}
      <div className="card">
        <div className="card-title">Privacy &amp; Preferences</div>
        <form className="form-grid" onSubmit={saveSettings}>
          <label className="form-field">
            Favorites Visibility
            <select
              value={favoritesVisibility}
              onChange={(e) => setFavoritesVisibility(e.target.value as "PRIVATE" | "PUBLIC")}
            >
              <option value="PRIVATE">Private — only visible to you</option>
              <option value="PUBLIC">Public — visible to everyone</option>
            </select>
          </label>
          <label className="form-field">
            Favorite Genre
            <input
              value={favoriteGenre}
              onChange={(e) => setFavoriteGenre(e.target.value)}
              placeholder="e.g. Pop, Rock, EDM"
            />
          </label>
          <label className="form-field">
            Bio
            <textarea
              rows={3}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell others what music you love…"
            />
          </label>
          <div>
            <button type="submit">Save Settings</button>
          </div>
        </form>
      </div>

      {/* Change Password */}
      {username === PROTECTED_SUPER_ADMIN_USERNAME ? (
        <div className="card">
          <div className="card-title">Change Password</div>
          <p className="muted" style={{ fontSize: 13 }}>
            The built-in <code>music_share_super_admin</code> account password cannot be changed.
          </p>
        </div>
      ) : (
        <div className="card">
          <div className="card-title">Change Password</div>
          <form className="form-grid" onSubmit={changePassword}>
            <label className="form-field">
              Current Password
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Enter your current password"
                required
              />
            </label>
            <label className="form-field">
              New Password
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="At least 6 characters"
                required
              />
            </label>
            <div>
              <button type="submit">Update Password</button>
            </div>
          </form>
        </div>
      )}
    </section>
  );
}
