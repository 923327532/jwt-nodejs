export default function viewData(req, res, next) {
  res.locals.currentUser = req.session?.user ?? null;
  res.locals.jwtToken = req.session?.token ?? null;
  res.locals.success = req.session?.success ?? null;
  res.locals.error = req.session?.error ?? null;

  delete req.session.success;
  delete req.session.error;

  next();
}