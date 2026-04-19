export type RoleValue = "LISTENER" | "MODERATOR" | "SUPER_ADMIN";

export function formatRoleLabel(role: RoleValue | string) {
  if (role === "SUPER_ADMIN") return "Super Admin";
  if (role === "MODERATOR") return "Moderator";
  if (role === "LISTENER") return "Listener";
  return String(role || "");
}
