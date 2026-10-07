"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UPLOAD_ABSOLUTE_DIR = exports.upload = void 0;
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const uploadDir = process.env.UPLOAD_DIR || "uploads";
const absoluteUploadDir = path_1.default.resolve(uploadDir);
if (!fs_1.default.existsSync(absoluteUploadDir)) {
    fs_1.default.mkdirSync(absoluteUploadDir, { recursive: true });
}
const storage = multer_1.default.diskStorage({
    destination: (_req, _file, cb) => {
        cb(null, absoluteUploadDir);
    },
    filename: (_req, file, cb) => {
        const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
        const ext = path_1.default.extname(file.originalname || "").toLowerCase() || ".bin";
        const safeName = `${file.fieldname}-${uniqueSuffix}${ext}`;
        cb(null, safeName);
    },
});
const fileFilter = (_req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp|bmp/;
    const mimetypeOk = allowedTypes.test(file.mimetype.toLowerCase());
    const extnameOk = allowedTypes.test(path_1.default.extname(file.originalname || "").toLowerCase());
    if (mimetypeOk && extnameOk) {
        return cb(null, true);
    }
    cb(new Error("Only image files (jpeg/jpg/png/gif/webp/bmp) are allowed"));
};
exports.upload = (0, multer_1.default)({
    storage,
    fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 },
});
exports.UPLOAD_ABSOLUTE_DIR = absoluteUploadDir;
exports.default = exports.upload;
//# sourceMappingURL=upload.js.map