const TEAM_MEMBERS = [
  "Yuzhou Tan - Online"
];

const FRONTEND_REPO_URL = "https://github.com/tanyuzhou/music-share-frontend";
const BACKEND_REPO_URL = "https://github.com/tanyuzhou/music-share-backend";
const FRONTEND_DEPLOY_URL = "https://music-share-frontend.vercel.app";
const BACKEND_DEPLOY_URL = "https://music-share-backend.onrender.com";

export default function AboutPage() {
  return (
    <section>
      <div className="page-header">
        <h1>About</h1>
        <div className="page-subtitle">Music Share — CS4550 Final Project</div>
      </div>

      <div className="card">
        <div className="card-title">Team Members</div>
        {TEAM_MEMBERS.map((member) => (
          <div key={member} className="track-row">
            <div className="user-info">
              <div className="user-avatar-sm">{member[0]}</div>
              <div className="user-display-name">{member}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="card">
        <div className="card-title">Repositories</div>
        <div className="track-list">
          <div className="track-row">
            <div>
              <div className="track-name">Frontend Repository</div>
              <div className="track-meta">
                <a href={FRONTEND_REPO_URL} target="_blank" rel="noreferrer" style={{ color: "var(--accent)" }}>
                  {FRONTEND_REPO_URL}
                </a>
              </div>
            </div>
          </div>
          <div className="track-row">
            <div>
              <div className="track-name">Backend Repository</div>
              <div className="track-meta">
                <a href={BACKEND_REPO_URL} target="_blank" rel="noreferrer" style={{ color: "var(--accent)" }}>
                  {BACKEND_REPO_URL}
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-title">Deployment URLs</div>
        <div className="track-list">
          <div className="track-row">
            <div>
              <div className="track-name">Frontend</div>
              <div className="track-meta">
                <a href={FRONTEND_DEPLOY_URL} target="_blank" rel="noreferrer" style={{ color: "var(--accent)" }}>
                  {FRONTEND_DEPLOY_URL}
                </a>
              </div>
            </div>
          </div>
          <div className="track-row">
            <div>
              <div className="track-name">Backend</div>
              <div className="track-meta">
                <a href={BACKEND_DEPLOY_URL} target="_blank" rel="noreferrer" style={{ color: "var(--accent)" }}>
                  {BACKEND_DEPLOY_URL}
                </a>
              </div>
            </div>
          </div>
        </div>
        <p className="error-text" style={{ marginTop: 12 }}>
          Reminder: replace both <code>example.com</code> URLs with real deployed links before submitting
        </p>
      </div>
    </section>
  );
}
