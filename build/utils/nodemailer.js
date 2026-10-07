"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const nodemailer_1 = __importDefault(require("nodemailer"));
var transport = nodemailer_1.default.createTransport({
    host: "sandbox.smtp.mailtrap.io",
    port: 2525,
    auth: {
        user: "9ed69b9057f036",
        pass: "9183f21a1ea22b"
    }
});
transport.sendMail({
    from: "Private Person <from@example.com>",
    to: "A Test User <to@example.com>",
    subject: "Hello from Mailtrap",
    text: "This is a test e-mail message."
}, (error, info) => {
    if (error) {
        return console.log(error);
    }
    console.log("Message sent: %s", info.messageId);
});
//# sourceMappingURL=nodemailer.js.map