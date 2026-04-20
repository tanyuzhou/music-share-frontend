import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function LoginPage() {
  const [usernameOrEmail, setUsernameOrEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    const result = await login(usernameOrEmail, password);
    setLoading(false);

    if (result.code === 0) {
      navigate("/search");
      return;
    }

    setMessage(result.msg || "Login failed");
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        <div className="auth-title">Welcome back</div>
        <div className="auth-subtitle">Log in to your Music Share account</div>

        <form className="form-grid" onSubmit={onSubmit}>
          <label className="form-field">
            Username or Email
            <input
              id="login-username"
              value={usernameOrEmail}
              onChange={(e) => setUsernameOrEmail(e.target.value)}
              placeholder="username or email"
              required
            />
          </label>
          <label className="form-field">
            Password
            <input
              id="login-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </label>

          {message && <p className="error-text">{message}</p>}

          <button id="login-submit" type="submit" disabled={loading} style={{ marginTop: 4, minWidth: 100 }}>
            {loading ? <div className="spinner spinner-sm" style={{borderColor: "rgba(255,255,255,0.2)", borderTopColor: "#fff"}} /> : "Log In"}
          </button>
        </form>

        <div className="auth-divider"><span>or</span></div>

        <p style={{ textAlign: "center", fontSize: 13, color: "var(--fg-secondary)" }}>
          Don't have an account?{" "}
          <Link to="/register" className="auth-link">Register</Link>
        </p>
      </div>
    </div>
  );
}
