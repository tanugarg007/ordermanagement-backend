import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import Router from "./router/approuter";

dotenv.config();

const app = express();

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || "";

app.use(cors());
app.use(express.json());

app.use("/users", Router);
app.post("/test", (req, res) => {
  res.json({
    message: "POST route is working"
  });
});
app.get("/", (req, res) => {
  res.json({
    message: "Order Management Backend is running",
  });
});

mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log("Connected to MongoDB");

    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error("MongoDB connection failed:", error);
  });