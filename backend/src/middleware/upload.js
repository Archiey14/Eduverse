
import multer from "multer";
import path from "node:path";
import fs from "node:fs";
import { randomUUID } from "node:crypto";

// Resolve storage directories relative to the server project.
const uploadsDirectory = path.resolve("uploads");
const privateUploadsDirectory = path.resolve("private-uploads");

// Create both directories if they do not exist.
fs.mkdirSync(uploadsDirectory, { recursive: true });
fs.mkdirSync(privateUploadsDirectory, { recursive: true });

/* =========================================================
   PROFILE PICTURE UPLOADS
   Existing behavior: public uploads directory, 2 MB limit.
========================================================= */

const profileStorage = multer.diskStorage({
  destination: (_req, _file, callback) => {
    callback(null, uploadsDirectory);
  },

  filename: (req, file, callback) => {
    const extension = path.extname(file.originalname).toLowerCase();

    callback(null, `${req.user._id}-${Date.now()}${extension}`);
  },
});

const profileImageTypes = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
]);

const profileFileFilter = (_req, file, callback) => {
  if (!profileImageTypes.has(file.mimetype)) {
    return callback(
      new Error("Only JPG, PNG, and WebP profile pictures are allowed.")
    );
  }

  callback(null, true);
};

export const uploadProfilePicture = multer({
  storage: profileStorage,
  fileFilter: profileFileFilter,
  limits: {
    fileSize: 2 * 1024 * 1024,
    files: 1,
  },
});

/* =========================================================
   PRIVATE CHAT ATTACHMENTS
   Stored outside the public /uploads directory.
   Files must be downloaded through an authorized API route.
========================================================= */

const chatStorage = multer.diskStorage({
  destination: (_req, _file, callback) => {
    callback(null, privateUploadsDirectory);
  },

  filename: (_req, _file, callback) => {
    // Use a random disk name instead of the original filename.
    callback(null, randomUUID());
  },
});

const chatFileTypes = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "application/pdf",
  "text/plain",
  "application/zip",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
]);

const chatFileFilter = (_req, file, callback) => {
  if (!chatFileTypes.has(file.mimetype)) {
    return callback(
      new Error(
        "Unsupported attachment. Upload an image, PDF, TXT, ZIP, DOCX, PPTX, or XLSX file."
      )
    );
  }

  callback(null, true);
};

export const uploadChatFile = multer({
  storage: chatStorage,
  fileFilter: chatFileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10 MB maximum
    files: 1,
  },
});
