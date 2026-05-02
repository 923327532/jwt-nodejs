export default function redirectIfAuthenticated(req, res, next) {
  if (!req.session?.token || !req.session?.user) {
    return next();
  }

  const roles = req.session.user.roles ?? [];

  if (roles.includes("admin")) {
    return res.redirect("/dashboard-admin");
  }

  return res.redirect("/dashboard-user");
}