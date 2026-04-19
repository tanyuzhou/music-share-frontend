import { Link, useParams, useSearchParams } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { api, type Playlist, type Review, type Track } from "../lib/api";
import { useAuth } from "../context/AuthContext";

async function checkTrackFavorited(trackId: number) {
  const limit = 50;
  let page = 1;

  while (page <= 20) {
    const response = await api.getMyFavorites(page, limit);
    if (response.code !== 0) {
      return false;
    }

    const found = response.data.list.some((item) => item.appleTrackId === trackId);
    if (found) {
      return true;
    }

    const loaded = page * limit;
    if (loaded >= response.data.total || response.data.list.length === 0) {
      return false;
    }

    page += 1;
  }

  return false;
}

export default function DetailsPage() {
  const { trackId } = useParams();
  const [searchParams] = useSearchParams();
  const focusReviewId = searchParams.get("focusReview") || "";
  const { user } = useAuth();
  const [track, setTrack] = useState<Track | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [selectedPlaylistId, setSelectedPlaylistId] = useState("");
  const [isFavorite, setIsFavorite] = useState(false);
  const [favoriteLoading, setFavoriteLoading] = useState(false);
  const [rating, setRating] = useState(5);
  const [reviewText, setReviewText] = useState("");
  const [editingReviewId, setEditingReviewId] = useState("");
  const [editRating, setEditRating] = useState(5);
  const [editText, setEditText] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const focusRef = useRef<HTMLDivElement | null>(null);

  const loadData = async () => {
    if (!trackId) return;
    setLoading(true);

    const [trackResp, reviewResp] = await Promise.all([
      api.getTrack(trackId),
      api.getTrackReviews(trackId, 1, 20),
    ]);

    if (trackResp.code === 0) {
      setTrack(trackResp.data);
    } else {
      setMessage(trackResp.msg || "Failed to load track");
    }

    if (reviewResp.code === 0) {
      setReviews(reviewResp.data.list);
    }

    if (user) {
      const parsedTrackId = Number.parseInt(trackId, 10);
      const [playlistResp, favoriteStatus] = await Promise.all([
        api.getMyPlaylists(),
        Number.isNaN(parsedTrackId) ? Promise.resolve(false) : checkTrackFavorited(parsedTrackId),
      ]);

      setIsFavorite(favoriteStatus);

      if (playlistResp.code === 0) {
        setPlaylists(playlistResp.data.list);
        if (playlistResp.data.list.length > 0) {
          setSelectedPlaylistId(playlistResp.data.list[0].id);
        }
      }
    } else {
      setIsFavorite(false);
    }

    setLoading(false);
  };

  useEffect(() => {
    void loadData();
  }, [trackId, user?.id]);

  useEffect(() => {
    if (focusRef.current) {
      focusRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [reviews, focusReviewId]);

  const submitReview = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!trackId) return;
    const result = await api.createTrackReview(trackId, rating, reviewText);
    setMessage(result.msg);
    if (result.code === 0) {
      setReviewText("");
      await loadData();
    }
  };

  const toggleFavorite = async () => {
    if (!track) return;
    setFavoriteLoading(true);
    const result = isFavorite
      ? await api.removeFavorite(track.trackId)
      : await api.addFavorite(track);

    setMessage(result.msg);

    if (result.code === 0) {
      setIsFavorite(!isFavorite);
    }

    if (!isFavorite && result.code !== 0 && result.msg.toLowerCase().includes("already exists")) {
      setIsFavorite(true);
    }

    setFavoriteLoading(false);
  };

  const addToPlaylist = async () => {
    if (!track) return;
    if (!selectedPlaylistId) {
      setMessage("Please choose a playlist first");
      return;
    }
    const result = await api.addTrackToPlaylist(selectedPlaylistId, track);
    setMessage(result.msg);
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
    const result = await api.updateReview(reviewId, editRating, editText);
    setMessage(result.msg);
    if (result.code === 0) {
      cancelEditReview();
      await loadData();
    }
  };

  const removeReview = async (reviewId: string) => {
    const result = await api.deleteReview(reviewId);
    setMessage(result.msg);
    if (result.code === 0) {
      if (editingReviewId === reviewId) cancelEditReview();
      await loadData();
    }
  };

  return (
    <section>
      <div className="page-header">
        <h1>Track Details</h1>
      </div>

      {message && (
        <div key={message} className={`feedback-bar ${message.toLowerCase().includes("fail") || message.toLowerCase().includes("error") ? "error" : "success"}`}>
          {message}
        </div>
      )}

      {loading && <p className="loading-text">Loading…</p>}

      {/* Track header */}
      {track && (
        <div className="card">
          <div className="detail-header">
            {track.artworkUrl100 && (
              <img
                className="details-cover"
                src={track.artworkUrl100}
                alt={track.collectionName || track.trackName}
              />
            )}
            <div className="detail-info">
              <div className="detail-title">{track.trackName}</div>
              <div className="detail-artist">{track.artistName}</div>
              <div className="detail-album">{track.collectionName}</div>

              {track.trackViewUrl && (
                <a
                  href={track.trackViewUrl}
                  target="_blank"
                  rel="noreferrer"
                  style={{ display: "inline-block", marginTop: 12 }}
                >
                  <button type="button" className="btn-ghost btn-sm">
                    Open on Apple Music ↗
                  </button>
                </a>
              )}

              {user ? (
                <div className="actions-row" style={{ marginTop: 14 }}>
                  <button
                    type="button"
                    className={isFavorite ? "btn-ghost" : ""}
                    onClick={toggleFavorite}
                    disabled={favoriteLoading}
                  >
                    {favoriteLoading
                      ? "Saving..."
                      : isFavorite
                        ? "Remove from Favorites"
                        : "♥ Add to Favorites"}
                  </button>
                  {playlists.length > 0 && (
                    <>
                      <select
                        value={selectedPlaylistId}
                        onChange={(e) => setSelectedPlaylistId(e.target.value)}
                        style={{ width: "auto" }}
                      >
                        {playlists.map((item) => (
                          <option key={item.id} value={item.id}>
                            {item.title}
                          </option>
                        ))}
                      </select>
                      <button type="button" className="btn-ghost" onClick={addToPlaylist}>
                        + Add to Playlist
                      </button>
                    </>
                  )}
                  {playlists.length === 0 && (
                    <Link to="/my-playlists">
                      <button type="button" className="btn-ghost">
                        Create a Playlist first
                      </button>
                    </Link>
                  )}
                </div>
              ) : (
                <p className="muted" style={{ marginTop: 12, fontSize: 13 }}>
                  <Link to="/login" className="auth-link">Log in</Link> to favorite or add to playlists.
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Reviews list */}
      <div className="card">
        <div className="card-title">Reviews ({reviews.length})</div>
        <div className="review-list">
          {reviews.map((review) => (
            <div
              key={review.id}
              className={`review-item ${focusReviewId === review.id ? "review-focus" : ""}`}
              ref={focusReviewId === review.id ? focusRef : null}
            >
              <div className="review-header">
                <div style={{display: "flex", alignItems: "center", gap: 6}}>
                  <div className="user-avatar-sm">
                    {(review.author.displayName || review.author.username || "?")[0].toUpperCase()}
                  </div>
                  <Link to={`/profile/${review.author.id}`} className="review-author">
                    {review.author.displayName || review.author.username}
                  </Link>
                </div>
                <span className="review-rating">★ {review.rating}/5</span>
              </div>

              {editingReviewId === review.id ? (
                <div className="form-grid nested-list">
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
                      placeholder="Update your review…"
                    />
                  </label>
                  <div className="actions-row">
                    <button type="button" onClick={() => void submitEditReview(review.id)}>
                      Save Review
                    </button>
                    <button type="button" className="btn-ghost" onClick={cancelEditReview}>
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <p className="review-text">{review.text}</p>
              )}

              {user && review.author.id === user.id && editingReviewId !== review.id && (
                <div className="actions-row" style={{ marginTop: 8 }}>
                  <button type="button" className="btn-ghost btn-sm" onClick={() => startEditReview(review)}>
                    Edit
                  </button>
                  <button type="button" className="btn-danger btn-sm" onClick={() => void removeReview(review.id)}>
                    Delete
                  </button>
                </div>
              )}
            </div>
          ))}
          {reviews.length === 0 && !loading && (
            <p className="muted">No reviews for this track yet.</p>
          )}
        </div>
      </div>

      {/* Write review */}
      {user && (
        <div className="card">
          <div className="card-title">Write a Review</div>
          <form className="form-grid" onSubmit={submitReview}>
            <label className="form-field">
              Rating (1–5)
              <input
                type="number"
                min={1}
                max={5}
                value={rating}
                onChange={(e) => setRating(Number(e.target.value))}
              />
            </label>
            <label className="form-field">
              Your Thoughts
              <textarea
                rows={4}
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
                placeholder="Share your thoughts on this track…"
                required
              />
            </label>
            <button type="submit">Submit Review</button>
          </form>
        </div>
      )}
    </section>
  );
}
