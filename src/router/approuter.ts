import express from "express";
import { createUser } from "../controlers/user";

const router = express.Router();

console.log("APP ROUTER LOADED");

router.post("/user", createUser);

export default router;