
import multer from "multer";

const allowedTypes = [
  "image/jpeg",
  "image/png",
  "image/webp",
];

export const schoolPhotoUpload = multer({
  storage: multer.memoryStorage(),

  fileFilter: (_req, file, cb) => {
    if (!allowedTypes.includes(file.mimetype)) {
      return cb(
        new Error(
          "Only JPG, PNG and WEBP images are allowed"
        )
      );
    }

    cb(null, true);
  },

  limits: {
    fileSize: 5 * 1024 * 1024,
  },
});
