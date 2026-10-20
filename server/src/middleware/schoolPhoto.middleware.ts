import multer from "multer";
import path from "path";
import fs from "fs";
import { randomUUID } from "node:crypto";

const directory = path.resolve(
  process.cwd(),
  "uploads",
  "school-teachers"
);

fs.mkdirSync(directory, { recursive: true });

export const schoolPhotoUpload = multer({
  storage: multer.diskStorage({
    destination: (_req, _file, cb) => {
      cb(null, directory);
    },

    filename: (_req, file, cb) => {
      const extensions: Record<string, string> = {
        "image/jpeg": ".jpg",
        "image/png": ".png",
        "image/webp": ".webp",
      };

      cb(
        null,
        `${randomUUID()}${extensions[file.mimetype] || ".bin"}`
      );
    },
  }),

  fileFilter: (_req, file, cb) => {
    const allowed = [
      "image/jpeg",
      "image/png",
      "image/webp",
    ];

    cb(null, allowed.includes(file.mimetype));
  },

  limits: {
    fileSize: 5 * 1024 * 1024,
  },
});