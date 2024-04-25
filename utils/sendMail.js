const nodemailer = require("nodemailer");
const transporter = nodemailer.createTransport({
  service: "GMAIL",
  //   host: "smtp.gmail.com",
  //   port: "587",
  auth: {
    user: process.env.EMAIL_USERNAME,
    pass: process.env.EMAIL_PASSWORD,
  },
});

const sendMail = async (options) => {
  await transporter.sendMail({
    // from: `Ankush ${process.env.EMAIL_USERNAME}`,
    from: { name: "Ankush", address: process.env.EMAIL_USERNAME },
    // sender: process.env.EMAIL_USERNAME, // NOT required when using from.
    to: options.recipient,
    subject: options.subject,
    text: options.mailBody,
  });
};

module.exports = sendMail;
