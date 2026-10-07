import multer from "multer";
import path from "path";
import fs from "fs";

const uploadDir = process.env.UPLOAD_DIR || "uploads";
const absoluteUploadDir = path.resolve(uploadDir);

if (!fs.existsSync(absoluteUploadDir)) {
  fs.mkdirSync(absoluteUploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, absoluteUploadDir);
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const ext = path.extname(file.originalname || "").toLowerCase() || ".bin";
    const safeName = `${file.fieldname}-${uniqueSuffix}${ext}`;
    cb(null, safeName);
  },
});

const fileFilter: multer.Options["fileFilter"] = (_req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp|bmp/;
  const mimetypeOk = allowedTypes.test(file.mimetype.toLowerCase());
  const extnameOk = allowedTypes.test(
    path.extname(file.originalname || "").toLowerCase()
  );
  if (mimetypeOk && extnameOk) {
    return cb(null, true);
  }
  cb(new Error("Only image files (jpeg/jpg/png/gif/webp/bmp) are allowed"));
};

export const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
});

export const UPLOAD_ABSOLUTE_DIR = absoluteUploadDir;
export default upload;
