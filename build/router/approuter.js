"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const user_1 = require("../controlers/user");
const router = express_1.default.Router();
console.log("APP ROUTER LOADED");
router.post("/user", user_1.createUser);
exports.default = router;
//# sourceMappingURL=approuter.js.map