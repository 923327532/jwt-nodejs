export default function authorize(...requiredRoles) {
  return (req, res, next) => {
    if (!req.userRoles) {
      return res.status(401).json({ message: "Inautorizado" });
    }

    if (requiredRoles.length === 0) {
      return next();
    }

    const hasRole = req.userRoles.some((role) => requiredRoles.includes(role));

    if (!hasRole) {
      return res
        .status(403)
        .json({ message: "Prohibido: permisos insuficientes" });
    }

    next();
  };
}