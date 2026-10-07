import express, { ErrorRequestHandler } from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import Router from "./router/approuter";
import { UPLOAD_ABSOLUTE_DIR } from "./middleware/upload";

dotenv.config();

const app = express();

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || "";

app.use(cors());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

app.use("/uploads", express.static(UPLOAD_ABSOLUTE_DIR));

app.use("/users", Router);

app.post("/test", (req, res) => {
  res.json({
    message: "POST route is working",
    body: req.body,
  });
});

app.get("/", (_req, res) => {
  res.json({
    message: "Order Management Backend is running",
    endpoints: {
      health: "GET /api/health",
      auth: {
        register: "POST /api/register { name, email, password, role }",
        login: "POST /api/login { email, password }",
        deliveryAddress: "PATCH /users/me/delivery-address [authenticated]",
        me: "GET /api/me [Bearer <token>]",
        users: "GET /api/users [Bearer <token>]",
      },
      items: {
        list: "GET /api/items?category=&status=&search=&sortBy=&order=&limit=&page=",
        get: "GET /api/items/:id",
        create:
          "POST /api/items [multipart/form-data, field 'image' file upload, Bearer <token>]",
        update:
          "PATCH /api/items/:id [multipart/form-data, field 'image' file upload, Bearer <token>]",
        delete: "DELETE /api/items/:id [Bearer <token>]",
      },
    },
  });
});

const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  if (err && typeof err === "object" && "code" in err && err.code === "LIMIT_FILE_SIZE") {
    return res
      .status(413)
      .json({ message: "File too large. Max 5MB allowed." });
  }
  const msg = err instanceof Error ? err.message : "Unknown server error";
  if (msg.toLowerCase().includes("only image files")) {
    return res.status(415).json({ message: msg });
  }
  console.error("SERVER ERROR:", err);
  return res.status(500).json({ message: msg });
};
app.use(errorHandler);

mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log("Connected to MongoDB");

    app.listen(Number(PORT), () => {
      console.log(`Server is running on port ${PORT}`);
      console.log(
        `Uploads served at /uploads (folder: ${UPLOAD_ABSOLUTE_DIR})`
      );
    });
  })
  .catch((error) => {
    console.error("MongoDB connection failed:", error);
  });
