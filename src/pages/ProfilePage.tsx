import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api, type Favorite, type FollowUser, type MyProfile, type Playlist, type Review } from "../lib/api";
import LoadingSpinner from "../components/LoadingSpinner";

export default function ProfilePage() {
  const [user, setUser] = useState<MyProfile | null>(null);
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [followers, setFollowers] = useState<FollowUser[]>([]);
  const [following, setFollowing] = useState<FollowUser[]>([]);
  const [form, setForm] = useState({
    displayName: "",
    email: "",
    bio: "",
    favoriteGenre: "",
    favoritesVisibility: "PRIVATE" as "PRIVATE" | "PUBLIC",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingReviewId, setEditingReviewId] = useState("");
  const [editRating, setEditRating] = useState(5);
  const [editText, setEditText] = useState("");
  const [message, setMessage] = useState("");
  const [saveFeedback, setSaveFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Pagination states
  const PAGE_SIZE = 5;
  const [favMeta, setFavMeta] = useState({ page: 1, totalPages: 1, total: 0 });
  const [revMeta, setRevMeta] = useState({ page: 1, totalPages: 1, total: 0 });
  const [followerMeta, setFollowerMeta] = useState({ page: 1, totalPages: 1, total: 0 });
  const [followingMeta, setFollowingMeta] = useState({ page: 1, totalPages: 1, total: 0 });
  const [playlistTotal, setPlaylistTotal] = useState(0);

  const loadFavorites = async (page: number) => {
    const resp = await api.getMyFavorites(page, PAGE_SIZE);
    if (resp.code === 0) {
      setFavorites(resp.data.list);
      setFavMeta({
        page: resp.data.page,
        totalPages: Math.ceil(resp.data.total / PAGE_SIZE) || 1,
        total: resp.data.total
      });
    }
  };

  const loadReviews = async (page: number) => {
    const resp = await api.getMyReviews(page, PAGE_SIZE);
    if (resp.code === 0) {
      setReviews(resp.data.list);
      setRevMeta({
        page: resp.data.page,
        totalPages: Math.ceil(resp.data.total / PAGE_SIZE) || 1,
        total: resp.data.total
      });
    }
  };

  const loadFollowers = async (userId: string, page: number) => {
    const resp = await api.getFollowers(userId, page, PAGE_SIZE);
    if (resp.code === 0) {
      setFollowers(resp.data.list);
      setFollowerMeta({
        page: resp.data.page,
        totalPages: Math.ceil(resp.data.total / PAGE_SIZE) || 1,
        total: resp.data.total
      });
    }
  };

  const loadFollowing = async (userId: string, page: number) => {
    const resp = await api.getFollowing(userId, page, PAGE_SIZE);
    if (resp.code === 0) {
      setFollowing(resp.data.list);
      setFollowingMeta({
        page: resp.data.page,
        totalPages: Math.ceil(resp.data.total / PAGE_SIZE) || 1,
        total: resp.data.total
      });
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      const meResp = await api.getMyProfile();

      if (meResp.code !== 0) {
        setLoading(false);
        setMessage(meResp.msg || "Failed to load profile");
        return;
      }

      const meUser = meResp.data.user;
      setUser(meUser);
      setForm({
        displayName: meUser.displayName || "",
        email: meUser.email || "",
        bio: meUser.bio || "",
        favoriteGenre: meUser.favoriteGenre || "",
        favoritesVisibility: meUser.favoritesVisibility || "PRIVATE",
      });

      await Promise.all([
        loadFavorites(1),
        loadReviews(1),
        loadFollowers(meUser.id, 1),
        loadFollowing(meUser.id, 1),
        (async () => {
          const playlistsResp = await api.getMyPlaylists();
          if (playlistsResp.code === 0) {
            setPlaylists(playlistsResp.data.list);
            setPlaylistTotal(playlistsResp.data.total);
          }
        })(),
      ]);

      setLoading(false);
    };

    void loadData();
  }, []);

  const reloadMyReviews = () => loadReviews(revMeta.page);

  const saveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaveFeedback(null);
    const resp = await api.updateMyProfile(form);
    setSaving(false);
    if (resp.code !== 0) {
      setSaveFeedback({ type: "error", text: resp.msg || "Failed to update profile" });
      return;
    }
    setUser(resp.data.user);
    setSaveFeedback({ type: "success", text: "Profile updated successfully." });
  };

  const startEditReview = (review: Review) => {
    setEditingReviewId(review.id);
    setEditRating(review.rating);
    setEditText(review.text);
  };

  const cancelEditReview = () => {
    setEditingReviewId("");
    setEditRating(5);
    setEditText("");
  };

  const submitEditReview = async (reviewId: string) => {
    const resp = await api.updateReview(reviewId, editRating, editText);
    setMessage(resp.msg || "");
    if (resp.code === 0) {
      cancelEditReview();
      await reloadMyReviews();
    }
  };

  const removeReview = async (reviewId: string) => {
    const resp = await api.deleteReview(reviewId);
    setMessage(resp.msg || "");
    if (resp.code === 0) {
      if (editingReviewId === reviewId) cancelEditReview();
      await reloadMyReviews();
    }
  };

  const avatarLetter = user
    ? (user.displayName || user.username || "?")[0].toUpperCase()
    : "?";

  return (
    <section>
      <div className="page-header">
        <h1>My Profile</h1>
      </div>

      {message && <div key={message} className="feedback-bar error">{message}</div>}
      {loading && <LoadingSpinner fullPage message="Loading your profile..." />}

      {user && (
        <>
          {/* Profile header */}
          <div className="profile-header">
            <div className="profile-avatar">{avatarLetter}</div>
            <div>
              <div className="profile-name">{user.displayName || user.username}</div>
              <div className="profile-handle">@{user.username} · {user.email}</div>
              {user.bio && <div className="profile-bio">{user.bio}</div>}
              {user.favoriteGenre && (
                <div style={{ marginTop: 8 }}>
                  <span className="tag tag-blue">{user.favoriteGenre}</span>
                </div>
              )}
            </div>
          </div>

          {/* Stats */}
          <div className="card" style={{ marginBottom: 16 }}>
            <div className="card-title">Stats</div>
            <div className="stat-row">
              <div className="stat-pill">
                <div className="stat-value">{favMeta.total}</div>
                <div className="stat-label">Favorites</div>
              </div>
              <div className="stat-pill">
                <div className="stat-value">{playlistTotal}</div>
                <div className="stat-label">Playlists</div>
              </div>
              <div className="stat-pill">
                <div className="stat-value">{revMeta.total}</div>
                <div className="stat-label">Reviews</div>
              </div>
              <div className="stat-pill">
                <div className="stat-value">{followerMeta.total}</div>
                <div className="stat-label">Followers</div>
              </div>
              <div className="stat-pill">
                <div className="stat-value">{followingMeta.total}</div>
                <div className="stat-label">Following</div>
              </div>
            </div>
          </div>

          {/* Edit Profile */}
          <div className="card">
            <div className="card-title">Edit Profile</div>
            <form className="form-grid" onSubmit={saveProfile}>
              <label className="form-field">
                Display Name
                <input
                  value={form.displayName}
                  onChange={(e) => setForm((p) => ({ ...p, displayName: e.target.value }))}
                  placeholder="Your display name"
                />
              </label>
              <label className="form-field">
                Email
                <input
                  value={form.email}
                  onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                  placeholder="name@example.com"
                />
              </label>
              <label className="form-field">
                Favorite Genre
                <input
                  value={form.favoriteGenre}
                  onChange={(e) => setForm((p) => ({ ...p, favoriteGenre: e.target.value }))}
                  placeholder="e.g. Pop, Rock, Jazz"
                />
              </label>
              <label className="form-field">
                Bio
                <textarea
                  value={form.bio}
                  rows={3}
                  onChange={(e) => setForm((p) => ({ ...p, bio: e.target.value }))}
                  placeholder="Write a short intro…"
                />
              </label>
              <label className="form-field">
                Favorites Visibility
                <select
                  value={form.favoritesVisibility}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, favoritesVisibility: e.target.value as "PRIVATE" | "PUBLIC" }))
                  }
                >
                  <option value="PRIVATE">Private</option>
                  <option value="PUBLIC">Public</option>
                </select>
              </label>
              <div>
                <button type="submit" disabled={saving} style={{ minWidth: 100 }}>
                  {saving ? <div className="spinner spinner-sm" style={{borderColor: "rgba(255,255,255,0.2)", borderTopColor: "#fff"}} /> : "Save Changes"}
                </button>
                {saveFeedback && (
                  <p className={saveFeedback.type === "success" ? "success-text" : "error-text"}>
                    {saveFeedback.text}
                  </p>
                )}
              </div>
            </form>
          </div>

          {/* My Favorites */}
          <div className="card">
            <div className="card-header">
              <div className="card-title">My Favorites</div>
              <div className="pagination-controls">
                <button
                  className="btn-ghost btn-sm"
                  disabled={favMeta.page <= 1}
                  onClick={() => void loadFavorites(favMeta.page - 1)}
                >
                  &lt;
                </button>
                <span>{favMeta.page}/{favMeta.totalPages}</span>
                <button
                  className="btn-ghost btn-sm"
                  disabled={favMeta.page >= favMeta.totalPages}
                  onClick={() => void loadFavorites(favMeta.page + 1)}
                >
                  &gt;
                </button>
              </div>
            </div>
            <div className="track-list">
              {favorites.map((item) => (
                <div key={item.id} className="track-row">
                  <div className="track-main">
                    {item.artworkUrl100 && (
                      <img className="cover" src={item.artworkUrl100} alt={item.trackName} />
                    )}
                    <div className="track-info">
                      <Link
                        to={`/details/${item.appleTrackId}`}
                        className="track-name"
                        style={{ color: "var(--fg-primary)" }}
                      >
                        {item.trackName}
                      </Link>
                      <div className="track-meta">{item.artistName}</div>
                    </div>
                  </div>
                </div>
              ))}
              {favorites.length === 0 && <p className="muted">No favorites yet.</p>}
            </div>
          </div>

          {/* My Reviews */}
          <div className="card">
            <div className="card-header">
              <div className="card-title">My Reviews</div>
              <div className="pagination-controls">
                <button
                  className="btn-ghost btn-sm"
                  disabled={revMeta.page <= 1}
                  onClick={() => void loadReviews(revMeta.page - 1)}
                >
                  &lt;
                </button>
                <span>{revMeta.page}/{revMeta.totalPages}</span>
                <button
                  className="btn-ghost btn-sm"
                  disabled={revMeta.page >= revMeta.totalPages}
                  onClick={() => void loadReviews(revMeta.page + 1)}
                >
                  &gt;
                </button>
              </div>
            </div>
            <div className="review-list">
              {reviews.map((review) => (
                <div key={review.id} className="review-item">
                  {editingReviewId === review.id ? (
                    <div className="form-grid">
                      <label className="form-field">
                        Rating (1–5)
                        <input
                          type="number"
                          min={1}
                          max={5}
                          value={editRating}
                          onChange={(e) => setEditRating(Number(e.target.value))}
                        />
                      </label>
                      <label className="form-field">
                        Content
                        <textarea
                          rows={3}
                          value={editText}
                          onChange={(e) => setEditText(e.target.value)}
                        />
                      </label>
                      <div className="actions-row">
                        <button type="button" onClick={() => void submitEditReview(review.id)}>
                          Save
                        </button>
                        <button type="button" className="btn-ghost" onClick={cancelEditReview}>
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="review-header" style={{ display: "flex", alignItems: "center", gap: 12, justifyContent: "space-between" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 6, minWidth: 0, flex: 1 }}>
                          <div className="user-avatar-sm" style={{ flexShrink: 0 }}>
                            {(user.displayName || user.username || "?")[0].toUpperCase()}
                          </div>
                          <span className="review-author" style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            {user.displayName || user.username}
                          </span>
                        </div>
                        <Link
                          to={`/details/${review.appleTrackId}?focusReview=${review.id}`}
                          style={{
                            color: "var(--fg-primary)",
                            fontWeight: 600,
                            fontSize: 13,
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                            maxWidth: "30%",
                            flexShrink: 1,
                            textAlign: "right",
                            display: "inline-block",
                            verticalAlign: "middle"
                          }}
                          title={review.trackName || `Track #${review.appleTrackId}`}
                        >
                          {review.trackName || `Track #${review.appleTrackId}`}
                        </Link>
                        <span className="review-rating" style={{ flexShrink: 0, whiteSpace: "nowrap" }}>★ {review.rating}/5</span>
                      </div>
                      <p className="review-text">{review.text}</p>
                      <div className="actions-row" style={{ marginTop: 8 }}>
                        <button
                          type="button"
                          className="btn-ghost btn-sm"
                          onClick={() => startEditReview(review)}
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          className="btn-danger btn-sm"
                          onClick={() => void removeReview(review.id)}
                        >
                          Delete
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ))}
              {reviews.length === 0 && <p className="muted">No reviews yet.</p>}
            </div>
          </div>

          {/* Following */}
          <div className="card">
            <div className="card-header">
              <div className="card-title">Following ({followingMeta.total})</div>
              <div className="pagination-controls">
                <button
                  className="btn-ghost btn-sm"
                  disabled={followingMeta.page <= 1}
                  onClick={() => void loadFollowing(user.id, followingMeta.page - 1)}
                >
                  &lt;
                </button>
                <span>{followingMeta.page}/{followingMeta.totalPages}</span>
                <button
                  className="btn-ghost btn-sm"
                  disabled={followingMeta.page >= followingMeta.totalPages}
                  onClick={() => void loadFollowing(user.id, followingMeta.page + 1)}
                >
                  &gt;
                </button>
              </div>
            </div>
            <div className="track-list">
              {following.map((item) => (
                <div key={item.id} className="user-row">
                  <div className="user-info">
                    <div className="user-avatar-sm">
                      {(item.displayName || item.username || "?")[0].toUpperCase()}
                    </div>
                    <div>
                      <Link to={`/profile/${item.id}`} className="user-display-name">
                        {item.displayName || item.username}
                      </Link>
                      <div className="user-handle">@{item.username}</div>
                    </div>
                  </div>
                </div>
              ))}
              {following.length === 0 && <p className="muted">Not following anyone yet.</p>}
            </div>
          </div>

          {/* Followers */}
          <div className="card">
            <div className="card-header">
              <div className="card-title">Followers ({followerMeta.total})</div>
              <div className="pagination-controls">
                <button
                  className="btn-ghost btn-sm"
                  disabled={followerMeta.page <= 1}
                  onClick={() => void loadFollowers(user.id, followerMeta.page - 1)}
                >
                  &lt;
                </button>
                <span>{followerMeta.page}/{followerMeta.totalPages}</span>
                <button
                  className="btn-ghost btn-sm"
                  disabled={followerMeta.page >= followerMeta.totalPages}
                  onClick={() => void loadFollowers(user.id, followerMeta.page + 1)}
                >
                  &gt;
                </button>
              </div>
            </div>
            <div className="track-list">
              {followers.map((item) => (
                <div key={item.id} className="user-row">
                  <div className="user-info">
                    <div className="user-avatar-sm">
                      {(item.displayName || item.username || "?")[0].toUpperCase()}
                    </div>
                    <div>
                      <Link to={`/profile/${item.id}`} className="user-display-name">
                        {item.displayName || item.username}
                      </Link>
                      <div className="user-handle">@{item.username}</div>
                    </div>
                  </div>
                </div>
              ))}
              {followers.length === 0 && <p className="muted">No followers yet.</p>}
            </div>
          </div>
        </>
      )}
    </section>
  );
}
