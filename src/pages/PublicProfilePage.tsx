import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { api, type FollowUser, type Playlist, type PublicUser } from "../lib/api";

export default function PublicProfilePage() {
  const { profileId } = useParams();
  const { user: currentUser } = useAuth();
  const [user, setUser] = useState<PublicUser | null>(null);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [followers, setFollowers] = useState<FollowUser[]>([]);
  const [following, setFollowing] = useState<FollowUser[]>([]);
  const [followersPage, setFollowersPage] = useState(1);
  const [followingPage, setFollowingPage] = useState(1);
  const [followersTotal, setFollowersTotal] = useState(0);
  const [followingTotal, setFollowingTotal] = useState(0);
  const pageSize = 8;
  const [isFollowing, setIsFollowing] = useState(false);
  const [message, setMessage] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      if (!profileId) return;
      setLoading(true);

      const [userResp, playlistsResp] = await Promise.all([
        api.getUserPublic(profileId),
        api.getUserPublicPlaylists(profileId),
      ]);

      if (userResp.code !== 0) {
        setLoading(false);
        setMessage(userResp.msg || "Failed to load user");
        return;
      }

      setUser(userResp.data.user);
      if (playlistsResp.code === 0) setPlaylists(playlistsResp.data.list);

      if (currentUser && currentUser.id !== profileId) {
        const myFollowingResp = await api.getFollowing(currentUser.id, 1, 100);
        if (myFollowingResp.code === 0) {
          setIsFollowing(myFollowingResp.data.list.some((item) => item.id === profileId));
        }
      }

      setLoading(false);
    };

    void loadData();
  }, [profileId, currentUser]);

  useEffect(() => {
    const loadFollowersFollowing = async () => {
      if (!profileId) return;

      const [followersResp, followingResp] = await Promise.all([
        api.getFollowers(profileId, followersPage, pageSize),
        api.getFollowing(profileId, followingPage, pageSize),
      ]);

      if (followersResp.code === 0) {
        setFollowers(followersResp.data.list);
        setFollowersTotal(followersResp.data.total);
      }

      if (followingResp.code === 0) {
        setFollowing(followingResp.data.list);
        setFollowingTotal(followingResp.data.total);
      }
    };

    void loadFollowersFollowing();
  }, [profileId, followersPage, followingPage]);

  useEffect(() => {
    setFollowersPage(1);
    setFollowingPage(1);
  }, [profileId]);

  const toggleFollow = async () => {
    if (!profileId) return;
    setActionLoading(true);
    setMessage("");
    const resp = isFollowing
      ? await api.unfollowUser(profileId)
      : await api.followUser(profileId);
    if (resp.code !== 0) {
      setActionLoading(false);
      setMessage(resp.msg || "Action failed");
      return;
    }
    setIsFollowing(!isFollowing);
    const followersResp = await api.getFollowers(profileId, followersPage, pageSize);
    if (followersResp.code === 0) {
      setFollowers(followersResp.data.list);
      setFollowersTotal(followersResp.data.total);
    }
    setActionLoading(false);
  };

  const avatarLetter = user
    ? (user.displayName || user.username || "?")[0].toUpperCase()
    : "?";

  const totalFollowersPages = Math.max(1, Math.ceil(followersTotal / pageSize));
  const totalFollowingPages = Math.max(1, Math.ceil(followingTotal / pageSize));

  return (
    <section>
      <div className="page-header">
        <h1>Profile</h1>
      </div>

      {message && <div key={message} className="feedback-bar error">{message}</div>}
      {loading && <p className="loading-text">Loading…</p>}

      {user && (
        <>
          {/* Profile header */}
          <div className="profile-header">
            <div className="profile-avatar">{avatarLetter}</div>
            <div style={{ flex: 1 }}>
              <div className="profile-name">{user.displayName || user.username}</div>
              <div className="profile-handle">@{user.username}</div>
              {user.bio && <div className="profile-bio">{user.bio}</div>}
              {user.favoriteGenre && (
                <div style={{ marginTop: 8 }}>
                  <span className="tag tag-blue">{user.favoriteGenre}</span>
                </div>
              )}
            </div>
            {currentUser && currentUser.id !== profileId && (
              <button
                id="follow-btn"
                onClick={() => void toggleFollow()}
                disabled={actionLoading}
                className={isFollowing ? "btn-ghost" : ""}
              >
                {actionLoading ? "…" : isFollowing ? "Unfollow" : "Follow"}
              </button>
            )}
          </div>

          {/* Stats */}
          <div className="card">
            <div className="stat-row">
              <div className="stat-pill">
                <div className="stat-value">{followersTotal}</div>
                <div className="stat-label">Followers</div>
              </div>
              <div className="stat-pill">
                <div className="stat-value">{followingTotal}</div>
                <div className="stat-label">Following</div>
              </div>
              <div className="stat-pill">
                <div className="stat-value">{playlists.length}</div>
                <div className="stat-label">Playlists</div>
              </div>
            </div>
          </div>

          {/* Public Playlists */}
          <div className="card">
            <div className="card-title">Public Playlists ({playlists.length})</div>
            <div className="track-list">
              {playlists.map((item) => (
                <div key={item.id} className="track-row">
                  <div className="playlist-header" style={{ flex: 1 }}>
                    <span className="playlist-title">{item.title}</span>
                    <span className="playlist-meta">{item.description || "No description"}</span>
                  </div>
                </div>
              ))}
              {playlists.length === 0 && <p className="muted">No public playlists.</p>}
            </div>
          </div>

          {/* Following */}
          <div className="card">
            <div className="card-title">Following</div>
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
              {following.length === 0 && <p className="muted">Not following anyone.</p>}
            </div>
            <div className="pagination-row">
              <button
                type="button"
                className="btn-ghost btn-sm"
                disabled={followingPage <= 1}
                onClick={() => setFollowingPage((p) => Math.max(1, p - 1))}
              >
                ← Prev
              </button>
              <span className="pagination-info">
                {followingPage} / {totalFollowingPages}
              </span>
              <button
                type="button"
                className="btn-ghost btn-sm"
                disabled={followingPage >= totalFollowingPages}
                onClick={() => setFollowingPage((p) => p + 1)}
              >
                Next →
              </button>
            </div>
          </div>

          {/* Followers */}
          <div className="card">
            <div className="card-title">Followers</div>
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
            <div className="pagination-row">
              <button
                type="button"
                className="btn-ghost btn-sm"
                disabled={followersPage <= 1}
                onClick={() => setFollowersPage((p) => Math.max(1, p - 1))}
              >
                ← Prev
              </button>
              <span className="pagination-info">
                {followersPage} / {totalFollowersPages}
              </span>
              <button
                type="button"
                className="btn-ghost btn-sm"
                disabled={followersPage >= totalFollowersPages}
                onClick={() => setFollowersPage((p) => p + 1)}
              >
                Next →
              </button>
            </div>
          </div>
        </>
      )}
    </section>
  );
}
