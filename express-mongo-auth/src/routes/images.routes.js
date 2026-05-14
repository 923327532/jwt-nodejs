import { Router } from "express";
import {
  getUploadUrl,
  listImages,
  deleteImage,
} from "../controllers/images.controller.js";

const router = Router();

router.post("/upload-url", getUploadUrl);
router.get("/", listImages);
router.delete("/:key(*)", deleteImage);

export default router;