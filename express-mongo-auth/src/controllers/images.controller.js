import crypto from "crypto";
import {
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
  ListObjectsV2Command,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import s3 from "../utils/s3Client.js";

const BUCKET = process.env.S3_BUCKET;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_SIZE_MB = 5;

export const getUploadUrl = async (req, res) => {
  try {
    const { filename, contentType, sizeBytes } = req.body;
    const fileSize = Number(sizeBytes);

    if (!filename || !contentType || !sizeBytes) {
      return res.status(400).json({ error: "Faltan datos del archivo" });
    }

    if (!ALLOWED_TYPES.includes(contentType)) {
      return res.status(400).json({ error: "Tipo no permitido" });
    }

    if (Number.isNaN(fileSize)) {
      return res.status(400).json({ error: "Tamaño de archivo inválido" });
    }

    if (fileSize > MAX_SIZE_MB * 1024 * 1024) {
      return res.status(400).json({ error: "Archivo demasiado grande" });
    }

    const safeName = filename.replace(/[^a-zA-Z0-9._-]/g, "_");
    const key = `originales/${Date.now()}-${crypto.randomBytes(6).toString("hex")}-${safeName}`;

    const command = new PutObjectCommand({
      Bucket: BUCKET,
      Key: key,
      ContentType: contentType,
    });

    const uploadUrl = await getSignedUrl(s3, command, { expiresIn: 300 });

    return res.json({ uploadUrl, key });
  } catch (error) {
    console.error("getUploadUrl error:", error);
    return res.status(500).json({ error: error.message });
  }
};

export const listImages = async (req, res) => {
  try {
    const command = new ListObjectsV2Command({
      Bucket: BUCKET,
      Prefix: "originales/",
    });

    const result = await s3.send(command);

    const items = await Promise.all(
      (result.Contents || []).map(async (obj) => {
        const url = await getSignedUrl(
          s3,
          new GetObjectCommand({
            Bucket: BUCKET,
            Key: obj.Key,
          }),
          { expiresIn: 900 }
        );

        return {
          key: obj.Key,
          size: obj.Size,
          lastModified: obj.LastModified,
          url,
        };
      })
    );

    return res.json(items);
  } catch (error) {
    console.error("listImages error:", error);
    return res.status(500).json({ error: error.message });
  }
};

export const deleteImage = async (req, res) => {
  try {
    const key = decodeURIComponent(req.params.key);

    await s3.send(
      new DeleteObjectCommand({
        Bucket: BUCKET,
        Key: key,
      })
    );

    return res.json({ deleted: true });
  } catch (error) {
    console.error("deleteImage error:", error);
    return res.status(500).json({ error: error.message });
  }
};