import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function RegisterPage() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    const result = await register(username, email, password, displayName);
    setLoading(false);

    if (result.code === 0) {
      navigate("/search");
      return;
    }

    setMessage(result.msg || "Register failed");
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        <div className="auth-title">Create account</div>
        <div className="auth-subtitle">Join Music Share and start sharing music</div>

        <form className="form-grid" onSubmit={onSubmit}>
          <label className="form-field">
            Username
            <input
              id="register-username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Choose a username"
              required
            />
          </label>
          <label className="form-field">
            Email
            <input
              id="register-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              required
            />
          </label>
          <label className="form-field">
            Password
            <input
              id="register-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 6 characters"
              required
            />
          </label>
          <label className="form-field">
            Display Name <span className="muted" style={{ fontSize: 11 }}>(optional)</span>
            <input
              id="register-display-name"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="How others will see your name"
            />
          </label>

          {message && <p className="error-text">{message}</p>}

          <button id="register-submit" type="submit" disabled={loading} style={{ marginTop: 4 }}>
            {loading ? "Submitting…" : "Create Account"}
          </button>
        </form>

        <div className="auth-divider"><span>or</span></div>

        <p style={{ textAlign: "center", fontSize: 13, color: "var(--fg-secondary)" }}>
          Already have an account?{" "}
          <Link to="/login" className="auth-link">Log In</Link>
        </p>
      </div>
    </div>
  );
}
