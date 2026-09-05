export const portalPath = (user, path = "/dashboard") => {
  if (!user?.id) return path;
  if (!path || path === "/") return `/${user.id}/dashboard`;
  if (path.startsWith(`/${user.id}`) || path.startsWith("/verify/")) return path;
  return `/${user.id}${path.startsWith("/") ? path : `/${path}`}`;
};
