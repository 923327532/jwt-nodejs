import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import mongoose from "mongoose";
import path from "path";
import session from "express-session";
import methodOverride from "method-override";
import { fileURLToPath } from "url";

import authRoutes from "./routes/auth.routes.js";
import userRoutes from "./routes/users.routes.js";
import webRoutes from "./routes/web.routes.js";
import seedRoles from "./utils/seedRoles.js";
import seedUsers from "./utils/seedUsers.js";

dotenv.config();

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));

app.use(
  session({
    secret: process.env.SESSION_SECRET || "super-secret-session",
    resave: false,
    saveUninitialized: false,
  })
);

app.use(express.static(path.join(__dirname, "public")));

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/", webRoutes);

app.get("/health", (req, res) => {
  res.status(200).json({ ok: true });
});

app.use((req, res) => {
  if (req.originalUrl.startsWith("/api/")) {
    return res.status(404).json({ message: "Ruta no encontrada" });
  }

  return res.status(404).render("pages/404", {
    title: "404 - No encontrada",
  });
});

app.use((err, req, res, next) => {
  console.error(err);

  if (req.originalUrl.startsWith("/api/")) {
    return res.status(err.status || 500).json({
      message: err.message || "Error interno del servidor",
    });
  }

  return res.status(err.status || 500).render("pages/403", {
    title: `${err.status || 500} - Error`,
    message: err.message || "Error interno del servidor",
  });
});

const PORT = process.env.PORT || 3000;
const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error("Falta la variable de entorno MONGODB_URI");
  process.exit(1);
}

mongoose
  .connect(MONGODB_URI, { autoIndex: true })
  .then(async () => {
    console.log("Mongo connected");
    await seedRoles();
    await seedUsers();

    app.listen(PORT, () => {
      console.log(`Servidor corriendo en el puerto ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("Error al conectar con Mongo", err);
    process.exit(1);
  });