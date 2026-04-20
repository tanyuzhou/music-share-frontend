import { useEffect, useState } from "react";
import { api, type User } from "../lib/api";
import { useAuth } from "../context/AuthContext";
import { formatRoleLabel } from "../lib/roleLabel";
import LoadingSpinner from "../components/LoadingSpinner";

type AdminUser = User & { createdAt?: string };

export default function AdminUsersPage() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    try {
      const resp = await api.adminListUsers();
      if (resp.code !== 0) {
        setMessage({ type: "error", text: resp.msg || "Failed to load users" });
        return;
      }
      setUsers(resp.data.list as AdminUser[]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadData();
  }, []);

  const updateRole = async (userId: string, role: "LISTENER" | "MODERATOR" | "SUPER_ADMIN") => {
    const resp = await api.adminUpdateUserRole(userId, role);
    setMessage({
      type: resp.code === 0 ? "success" : "error",
      text: resp.msg || "",
    });
    if (resp.code === 0) await loadData();
  };

  const toggleActive = async (userId: string, isActive: boolean) => {
    const resp = await api.adminUpdateUserActive(userId, !isActive);
    setMessage({
      type: resp.code === 0 ? "success" : "error",
      text: resp.msg || "",
    });
    if (resp.code === 0) await loadData();
  };

  const roleColor = (role: string) => {
    if (role === "SUPER_ADMIN") return "var(--accent)";
    if (role === "MODERATOR") return "var(--warning)";
    return "var(--fg-muted)";
  };

  return (
    <section>
      <div className="page-header">
        <h1>Admin — Users</h1>
        <div className="page-subtitle">Manage roles and account status</div>
      </div>

      {message && (
        <div key={`${message.type}-${message.text}`} className={`feedback-bar ${message.type}`}>{message.text}</div>
      )}

      {loading && <LoadingSpinner fullPage message="Loading users..." />}

      <div className="card">
        <div className="card-title">All Users ({users.length})</div>
        {users.map((item) => {
          const isProtected = item.username === "music_share_super_admin";
          const isSelf = currentUser?.id === item.id;
          const roleLocked = isProtected || isSelf;

          return (
            <div key={item.id} className="admin-row">
            <div className="user-info">
              <div className="user-avatar-sm">
                {(item.displayName || item.username || "?")[0].toUpperCase()}
              </div>
              <div>
                <div className="user-display-name">{item.displayName || item.username}</div>
                <div className="user-handle">
                  @{item.username} · {item.email}
                  {isSelf && (
                    <span style={{ color: "var(--fg-secondary)", marginLeft: 8, fontWeight: 700 }}>
                      YOU
                    </span>
                  )}
                  {isProtected && (
                    <span style={{ color: "var(--warning)", marginLeft: 8, fontWeight: 700 }}>
                      PROTECTED
                    </span>
                  )}
                  {!item.isActive && (
                    <span style={{ color: "var(--error)", marginLeft: 8, fontWeight: 700 }}>
                      DISABLED
                    </span>
                  )}
                </div>
              </div>
            </div>
            <div className="actions-row">
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  color: roleColor(item.role),
                  letterSpacing: 0.5,
                  minWidth: 98,
                  textAlign: "right",
                }}
              >
                {formatRoleLabel(item.role)}
              </span>
              <select
                value={item.role}
                onChange={(e) =>
                  void updateRole(
                    item.id,
                    e.target.value as "LISTENER" | "MODERATOR" | "SUPER_ADMIN"
                  )
                }
                style={{ width: "auto" }}
                disabled={roleLocked}
              >
                <option value="LISTENER">Listener</option>
                <option value="MODERATOR">Moderator</option>
                <option value="SUPER_ADMIN">Super Admin</option>
              </select>
              <button
                type="button"
                className={item.isActive ? "btn-danger btn-sm" : "btn-ghost btn-sm"}
                onClick={() => void toggleActive(item.id, item.isActive)}
                disabled={isProtected}
              >
                {item.isActive ? "Disable" : "Enable"}
              </button>
            </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
