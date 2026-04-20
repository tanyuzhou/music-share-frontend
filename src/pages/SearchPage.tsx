import { useEffect, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { api, type Track } from "../lib/api";
import LoadingSpinner from "../components/LoadingSpinner";

function formatDuration(ms?: number) {
  if (!ms) return "--:--";
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

// Search icon inline
const IconSearch = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"
    strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);

export default function SearchPage() {
  const [params, setParams] = useSearchParams();
  const [criteria, setCriteria] = useState(params.get("criteria") || "");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [tracks, setTracks] = useState<Track[]>([]);
  const loaderRef = useRef<HTMLDivElement | null>(null);
  const pageSize = 20;

  const doSearch = async (keyword: string, pageToLoad: number, append = false) => {
    const text = keyword.trim();
    if (!text) {
      setTracks([]);
      setHasMore(false);
      setPage(1);
      setMessage("");
      return;
    }

    setLoading(true);
    setMessage("");
    const result = await api.searchTracks(text, pageToLoad, pageSize);
    setLoading(false);

    if (result.code !== 0) {
      if (!append) {
        setTracks([]);
      }
      setHasMore(false);
      setMessage(result.msg || "Search failed");
      return;
    }

    setTracks((prev) => (append ? [...prev, ...result.data.list] : result.data.list));
    setHasMore(Boolean(result.data.hasMore));
    setPage(result.data.page || pageToLoad);
  };

  useEffect(() => {
    const criteriaFromUrl = params.get("criteria") || "";

    setCriteria(criteriaFromUrl);

    if (criteriaFromUrl) {
      void doSearch(criteriaFromUrl, 1, false);
    } else {
      setTracks([]);
      setHasMore(false);
      setPage(1);
      setMessage("");
    }
  }, [params]);

  useEffect(() => {
    const node = loaderRef.current;
    if (!node) return;
    if (!hasMore || loading) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (!entry?.isIntersecting || loading || !hasMore) return;

        const keyword = (params.get("criteria") || "").trim();
        if (!keyword) return;

        void doSearch(keyword, page + 1, true);
      },
      {
        root: null,
        rootMargin: "200px 0px",
        threshold: 0.1,
      }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [hasMore, loading, page, params]);

  const onSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const keyword = criteria.trim();
    if (keyword) {
      setParams({ criteria: keyword });
    } else {
      setParams({});
    }
  };

  return (
    <section className="search-page">
      <div className="page-header">
        <h1>Search</h1>
        <div className="page-subtitle">Find songs, artists, and albums via Apple Music</div>
      </div>

      {/* Search bar */}
      <form onSubmit={onSubmit} className="search-bar">
        <div className="search-input-wrap">
          <IconSearch />
          <input
            id="search-input"
            value={criteria}
            onChange={(e) => setCriteria(e.target.value)}
            placeholder="Search songs, artists, albums…"
          />
        </div>
        <button id="search-submit" type="submit" disabled={loading} style={{ minWidth: 100 }}>
          {loading ? <div className="spinner spinner-sm" style={{borderColor: "rgba(255,255,255,0.2)", borderTopColor: "#fff"}} /> : "Search"}
        </button>
      </form>

      {message && <p className="error-text" style={{ marginBottom: 12 }}>{message}</p>}

      {/* Results */}
      {(tracks.length > 0 || loading) && (
        <div className="card">
          <div className="card-title">Results</div>
          
          {!loading && tracks.length === 0 && (
            <p className="muted">No results found.</p>
          )}

          {tracks.length > 0 && (
            <div className="track-list">
              {tracks.map((track) => (
                <div className="track-row" key={track.trackId}>
                  <div className="track-main">
                    {track.artworkUrl100 && (
                      <img className="cover" src={track.artworkUrl100} alt={track.trackName} />
                    )}
                    <div className="track-info">
                      <div className="track-name">{track.trackName}</div>
                      <div className="track-meta">
                        {track.artistName}
                        {track.releaseDate
                          ? ` · ${new Date(track.releaseDate).getFullYear()}`
                          : ""}
                        {" · "}
                        {formatDuration(track.trackTimeMillis)}
                      </div>
                    </div>
                  </div>
                  <div className="actions-row">
                    <Link to={`/details/${track.trackId}`}>
                      <button type="button" className="btn-ghost btn-sm">Details</button>
                    </Link>
                    {track.trackViewUrl && (
                      <a href={track.trackViewUrl} target="_blank" rel="noreferrer">
                        <button type="button" className="btn-ghost btn-sm">Apple Music ↗</button>
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          <div ref={loaderRef} style={{ height: 20 }} />
          
          {loading && (
            <div style={{ padding: "20px 0" }}>
              <LoadingSpinner message={tracks.length > 0 ? "Loading more..." : "Searching..."} />
            </div>
          )}
          
          {!hasMore && tracks.length > 0 && <p className="muted" style={{ textAlign: "center", marginTop: 20 }}>No more results.</p>}
        </div>
      )}

      {!loading && tracks.length === 0 && !message && criteria === "" && (
        <div className="card" style={{ textAlign: "center", padding: "40px 20px" }}>
          <p className="muted">Type something above to search for music.</p>
        </div>
      )}
    </section>
  );
}
