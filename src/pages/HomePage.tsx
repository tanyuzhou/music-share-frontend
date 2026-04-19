import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { api, type HomeMyFeed, type HomePublicFeed } from "../lib/api";
import { useAuth } from "../context/AuthContext";

export default function HomePage() {
  const { user } = useAuth();
  const [publicFeed, setPublicFeed] = useState<HomePublicFeed | null>(null);
  const [myFeed, setMyFeed] = useState<HomeMyFeed | null>(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const loadData = async () => {
      const publicResp = await api.getHomePublicFeed();
      if (publicResp.code === 0) {
        setPublicFeed(publicResp.data);
      } else {
        setMessage(publicResp.msg || "Failed to load home feed");
      }

      if (user) {
        const myResp = await api.getHomeMyFeed();
        if (myResp.code === 0) {
          setMyFeed(myResp.data);
        }
      } else {
        setMyFeed(null);
      }
    };

    void loadData();
  }, [user?.id]);

  return (
    <section>
      {/* Hero */}
      <div className="home-hero">
        <h1>Music Share</h1>
        <p>
          Discover tracks from Apple Music, write reviews, build playlists, and
          connect with other listeners
        </p>
        {!user && (
          <div className="hero-actions">
            <Link to="/register">
              <button type="button">Get Started</button>
            </Link>
            <Link to="/search">
              <button type="button" className="btn-ghost">Browse Music</button>
            </Link>
          </div>
        )}
        {user && (
          <div className="hero-actions">
            <Link to="/search">
              <button type="button">Search Music</button>
            </Link>
            <Link to="/my-playlists">
              <button type="button" className="btn-ghost">My Playlists</button>
            </Link>
          </div>
        )}
      </div>

      {message && <p className="error-text">{message}</p>}

      <div className="home-grid">
        {/* Latest Public Playlists */}
        <div className="card">
          <div className="card-title">Latest Public Playlists</div>
          <div className="track-list">
            {publicFeed?.latestPublicPlaylists.map((item) => (
              <div key={item.id} className="track-row">
                <div>
                  <div className="track-name">{item.title}</div>
                  <div className="track-meta">
                    by {item.owner.displayName || item.owner.username}
                  </div>
                </div>
              </div>
            ))}
            {publicFeed && publicFeed.latestPublicPlaylists.length === 0 && (
              <p className="muted">No public playlists yet</p>
            )}
          </div>
        </div>

        {/* Latest Reviews */}
        <div className="card">
          <div className="card-title">Latest Reviews</div>
          <div className="review-list">
            {publicFeed?.latestReviews.map((item) => (
              <div key={item.id} className="review-item">
                <div className="review-header">
                  <div style={{display: "flex", alignItems: "center", gap: 6}}>
                    <div className="user-avatar-sm">
                      {(item.author.displayName || item.author.username || "?")[0].toUpperCase()}
                    </div>
                    <Link
                      to={`/profile/${item.author.id}`}
                      className="review-author"
                    >
                      {item.author.displayName || item.author.username}
                    </Link>
                  </div>
                  <div className="review-side-info">
                    <div className="review-side-track">
                      {item.artworkUrl100 && (
                        <img className="cover" src={item.artworkUrl100} alt={item.trackName || `Track ${item.appleTrackId}`} />
                      )}
                      <div className="review-side-text">
                        <Link
                          to={`/details/${item.appleTrackId}?focusReview=${item.id}`}
                          className="review-side-track-name"
                        >
                          {item.trackName || `Track #${item.appleTrackId}`}
                        </Link>
                        <div className="review-side-artist">{item.artistName || "Unknown artist"}</div>
                      </div>
                    </div>
                    <span className="review-rating">★ {item.rating}/5</span>
                  </div>
                </div>
                <p className="review-text">{item.text}</p>
                <Link
                  to={`/details/${item.appleTrackId}?focusReview=${item.id}`}
                  style={{ fontSize: 12, color: "var(--accent)" }}
                >
                  View Track →
                </Link>
              </div>
            ))}
            {publicFeed && publicFeed.latestReviews.length === 0 && (
              <p className="muted">No reviews yet</p>
            )}
          </div>
        </div>
      </div>

      {user && myFeed && (
        <div className="home-grid">
          {/* My Recent Reviews */}
          <div className="card">
            <div className="card-title">My Recent Reviews</div>
            <div className="review-list">
              {myFeed.myRecentReviews.map((item) => (
                <div key={item.id} className="review-item">
                  <div className="review-header">
                    <span className="muted">My review</span>
                    <div className="review-side-info">
                      <div className="review-side-track">
                        {item.artworkUrl100 && (
                          <img className="cover" src={item.artworkUrl100} alt={item.trackName || `Track ${item.appleTrackId}`} />
                        )}
                        <div className="review-side-text">
                          <Link
                            to={`/details/${item.appleTrackId}?focusReview=${item.id}`}
                            className="review-side-track-name"
                          >
                            {item.trackName || `Track #${item.appleTrackId}`}
                          </Link>
                          <div className="review-side-artist">{item.artistName || "Unknown artist"}</div>
                        </div>
                      </div>
                      <span className="review-rating">★ {item.rating}/5</span>
                    </div>
                  </div>
                  <p className="review-text">{item.text}</p>
                </div>
              ))}
              {myFeed.myRecentReviews.length === 0 && (
                <p className="muted">No reviews posted yet</p>
              )}
            </div>
          </div>

          {/* My Recent Favorites */}
          <div className="card">
            <div className="card-title">My Recent Favorites</div>
            <div className="track-list">
              {myFeed.myRecentFavorites.map((item) => (
                <div key={item.id} className="track-row">
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
              ))}
              {myFeed.myRecentFavorites.length === 0 && (
                <p className="muted">No favorites yet</p>
              )}
            </div>
          </div>

          {/* My Recent Playlists */}
          <div className="card" style={{ gridColumn: "1 / -1" }}>
            <div className="card-title">My Recent Playlists</div>
            <div className="track-list">
              {myFeed.myRecentPlaylists.map((item) => (
                <div key={item.id} className="track-row">
                  <span className="track-name">{item.title}</span>
                  <span className={`playlist-badge${item.isPublic ? "" : " private"}`}>
                    {item.isPublic ? "Public" : "Private"}
                  </span>
                </div>
              ))}
              {myFeed.myRecentPlaylists.length === 0 && (
                <p className="muted">No playlists yet</p>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
