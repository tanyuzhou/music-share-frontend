import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api, type Playlist } from "../lib/api";
import LoadingSpinner from "../components/LoadingSpinner";

export default function MyPlaylistsPage() {
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  const loadData = async () => {
    setLoading(true);
    try {
      const result = await api.getMyPlaylists();
      if (result.code !== 0) {
        setMessage(result.msg || "Failed to load playlists");
        return;
      }
      setPlaylists(result.data.list);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadData();
  }, []);

  const createPlaylist = async (event: React.FormEvent) => {
    event.preventDefault();
    const result = await api.createPlaylist(title, description, false);
    setMessage(result.msg);
    if (result.code === 0) {
      setTitle("");
      setDescription("");
      await loadData();
    }
  };

  const togglePublic = async (item: Playlist) => {
    const result = await api.updatePlaylist(item.id, { isPublic: !item.isPublic });
    setMessage(result.msg);
    if (result.code === 0) await loadData();
  };

  const deletePlaylist = async (playlistId: string) => {
    const result = await api.deletePlaylist(playlistId);
    setMessage(result.msg);
    if (result.code === 0) await loadData();
  };

  const removeTrack = async (playlistId: string, trackId: number) => {
    const result = await api.removeTrackFromPlaylist(playlistId, trackId);
    setMessage(result.msg);
    if (result.code === 0) await loadData();
  };

  return (
    <section>
      <div className="page-header">
        <h1>My Playlists</h1>
        <div className="page-subtitle">Manage your personal playlists</div>
      </div>

      {message && (
        <div key={message} className={`feedback-bar ${message.toLowerCase().includes("fail") || message.toLowerCase().includes("error") ? "error" : "success"}`}>
          {message}
        </div>
      )}

      {/* Create playlist */}
      <div className="card">
        <div className="card-title">Create New Playlist</div>
        <form className="form-grid" onSubmit={createPlaylist}>
          <label className="form-field">
            Title
            <input
              id="playlist-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Playlist name"
              required
            />
          </label>
          <label className="form-field">
            Description
            <textarea
              id="playlist-description"
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Optional description…"
            />
          </label>
          <div>
            <button id="create-playlist-btn" type="submit">Create Playlist</button>
          </div>
        </form>
      </div>

      {loading && <LoadingSpinner fullPage message="Loading your playlists..." />}

      {/* Playlists list */}
      <div className="card">
        <div className="card-title">Your Playlists ({playlists.length})</div>

        {!loading && playlists.length === 0 && (
          <p className="muted">No playlists yet. Create one above!</p>
        )}

        {playlists.map((item) => (
          <div key={item.id} className="playlist-item">
            <div className="playlist-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16 }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <span className="playlist-title">{item.title}</span>
                <div
                  className="playlist-meta"
                  style={{
                    wordBreak: 'break-word',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    maxWidth: '100%'
                  }}
                >
                  {item.description || "No description"}
                </div>
              </div>
              <div className="actions-row" style={{ flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
                <span className={`playlist-badge${item.isPublic ? "" : " private"}`}>
                  {item.isPublic ? "Public" : "Private"}
                </span>
                <button
                  type="button"
                  className="btn-ghost btn-sm"
                  onClick={() => void togglePublic(item)}
                >
                  Make {item.isPublic ? "Private" : "Public"}
                </button>
                <button
                  type="button"
                  className="btn-danger btn-sm"
                  onClick={() => void deletePlaylist(item.id)}
                >
                  Delete
                </button>
              </div>
            </div>

            {/* Tracks in playlist */}
            <div className="nested-list">
              {item.trackItems.length === 0 && (
                <p className="muted" style={{ fontSize: 12 }}>
                  No tracks yet. Find music in{" "}
                  <Link to="/search" style={{ color: "var(--accent)" }}>Search</Link>.
                </p>
              )}
              {item.trackItems.map((track) => (
                <div key={track.trackId} className="track-row" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  {track.artworkUrl100 && (
                    <img
                      src={track.artworkUrl100}
                      alt="artwork"
                      style={{ width: 48, height: 48, borderRadius: 8, objectFit: 'cover', marginRight: 10 }}
                    />
                  )}
                  <div className="track-info" style={{ flex: 1 }}>
                    <Link
                      to={`/details/${track.trackId}`}
                      className="track-name"
                      style={{ color: "var(--fg-primary)" }}
                    >
                      {track.trackName}
                    </Link>
                    <div className="track-meta">{track.artistName}</div>
                    {track.collectionName && (
                      <div className="detail-album">{track.collectionName}</div>
                    )}
                  </div>
                  <button
                    type="button"
                    className="btn-danger btn-sm"
                    onClick={() => void removeTrack(item.id, track.trackId)}
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
