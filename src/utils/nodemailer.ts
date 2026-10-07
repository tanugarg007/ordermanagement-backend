import nodemailer from "nodemailer";
var transport = nodemailer.createTransport({
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