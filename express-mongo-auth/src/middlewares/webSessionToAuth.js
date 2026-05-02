export default function webSessionToAuth(req, res, next) {
  const token = req.session?.token;

  if (token) {
    req.headers.authorization = `Bearer ${token}`;
  }

  next();
}