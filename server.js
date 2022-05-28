// const dotenv = require("dotenv");
import dotenv from "dotenv";
dotenv.config();

import nodemailer from "nodemailer";
import express from "express";
import cors from "cors";
// const nodemailer = require("nodemailer");
const log = console.log;
const emailApp = express();

emailApp.use(express.urlencoded({ extended: true }));
emailApp.use(express.json());
emailApp.use(cors());
console.log(process.env.EMAIL);
// Step 1
let transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL,
    pass: process.env.PASSWORD,
  },
});

// Step 2
const { domainname, sslcertificate } = {};
let mailOptions = {
  from: "pradnyakasar1913@gmail.com", // TODO: email sender
  to: "pradnyarkasar@gmail.com", // TODO: email receiver
  subject: "Testing",
  html: `<div>Hey ${domainname},
 <div>Hey: ${sslcertificate}</div>
 </div>`,
  text: "Wooohooo it works!!",
};

// Step 3
transporter.sendMail(mailOptions, (err, data) => {
  if (err) {
    return log("Error occurs", err);
  }
  return log("Email sent!!!");
});
