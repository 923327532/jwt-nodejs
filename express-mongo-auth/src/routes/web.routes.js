import express from "express";
import userService from "../services/UserService.js";
import authService from "../services/AuthService.js";
import authenticate from "../middlewares/authenticate.js";
import authorize from "../middlewares/authorize.js";
import webSessionToAuth from "../middlewares/webSessionToAuth.js";
import viewData from "../middlewares/viewData.js";
import redirectIfAuthenticated from "../middlewares/redirectIfAuthenticated.js";

const router = express.Router();

router.use(viewData);

router.get("/", (req, res) => res.redirect("/signIn"));

router.get("/signIn", redirectIfAuthenticated, (req, res) => {
  res.render("pages/signIn", { title: "Sign In" });
});

router.get("/signUp", redirectIfAuthenticated, (req, res) => {
  res.render("pages/signUp", { title: "Sign Up" });
});

router.post("/signIn", redirectIfAuthenticated, async (req, res) => {
  try {
    const result = await authService.signIn(req.body);
    req.session.token = result.token;
    req.session.user = result.user;

    if (result.user.roles.includes("admin")) {
      return res.redirect("/dashboard-admin");
    }

    return res.redirect("/dashboard-user");
  } catch (error) {
    req.session.error = error.message || "No se pudo iniciar sesión";
    return res.redirect("/signIn");
  }
});

router.post("/signUp", redirectIfAuthenticated, async (req, res) => {
  try {
    await authService.signUp({
      ...req.body,
      roles: ["user"],
    });

    req.session.success = "Usuario registrado correctamente";
    return res.redirect("/signIn");
  } catch (error) {
    req.session.error = error.message || "No se pudo registrar el usuario";
    return res.redirect("/signUp");
  }
});

router.post("/logout", (req, res) => {
  req.session.destroy(() => {
    res.redirect("/signIn");
  });
});

router.get(
  "/profile",
  webSessionToAuth,
  authenticate,
  authorize(),
  async (req, res, next) => {
    try {
      const user = await userService.getById(req.userId);
      res.render("pages/profile", {
        title: "Mi cuenta",
        user,
      });
    } catch (error) {
      next(error);
    }
  }
);

router.post(
  "/profile",
  webSessionToAuth,
  authenticate,
  authorize(),
  async (req, res) => {
    try {
      await userService.updateMe(req.userId, req.body);
      req.session.success = "Perfil actualizado correctamente";
      res.redirect("/profile");
    } catch (error) {
      req.session.error = error.message || "No se pudo actualizar el perfil";
      res.redirect("/profile");
    }
  }
);

router.get(
  "/dashboard-user",
  webSessionToAuth,
  authenticate,
  authorize("user", "admin"),
  async (req, res, next) => {
    try {
      const user = await userService.getById(req.userId);
      res.render("pages/dashboard-user", {
        title: "Dashboard Usuario",
        user,
      });
    } catch (error) {
      next(error);
    }
  }
);

router.get(
  "/dashboard-admin",
  webSessionToAuth,
  authenticate,
  authorize("admin"),
  async (req, res, next) => {
    try {
      const users = await userService.getAll();
      res.render("pages/dashboard-admin", {
        title: "Dashboard Admin",
        users,
      });
    } catch (error) {
      next(error);
    }
  }
);

router.get(
  "/dashboard-admin/users/:id",
  webSessionToAuth,
  authenticate,
  authorize("admin"),
  async (req, res, next) => {
    try {
      const user = await userService.getById(req.params.id);
      res.render("pages/user-detail", {
        title: "Detalle de usuario",
        user,
      });
    } catch (error) {
      next(error);
    }
  }
);

export default router;