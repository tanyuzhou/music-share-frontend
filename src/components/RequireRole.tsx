import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

type Props = {
  roles: Array<"LISTENER" | "MODERATOR" | "SUPER_ADMIN">;
  children: React.ReactNode;
};

export default function RequireRole({ roles, children }: Props) {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!roles.includes(user.role)) {
    return (
      <section className="card">
        <h2>Permission Denied</h2>
        <p className="muted">This page is only available to authorized roles.</p>
      </section>
    );
  }

  return <>{children}</>;
}
