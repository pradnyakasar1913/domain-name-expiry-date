import sslChecker from "ssl-checker";
import express from "express";
import urlExist from "url-exist";
import { createRequire } from "module";
import dotenv from "dotenv";
dotenv.config();

import nodemailer from "nodemailer";

const require = createRequire(import.meta.url);
const moment = require("moment");

const XLSX = require("xlsx");

const whoisinfo = require("whois-json");

const fs = require("fs");

const extractDomain = require("extract-domain");

const isValidDomain = require("is-valid-domain");

const cron = require('node-cron');

var spread_sheet = require("spread_sheet");

var json2xls = require("json2xls");

const data = []
// const { LocalStroage } = require("node-localstorage");
// var localStorage1 = new LocalStroage("./scratch");
// localStorage1.setItem("Name", "Manish Mandal");
// console.log(localStorage1.getItem("Name"));

const bodyParser = require("body-parser");

const ExcelJS = require("exceljs");

const { exec } = require("child_process");

const app = express();

// localStorage.setItem("Name", "Pradnya Kasar");
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

let domains = [];

let fileEmpty = true;

app.use(bodyParser.urlencoded({ extended: false }));
app.set("view engine", "ejs");


app.get("/", (req, res) => {
  res.render("domainwhoisinfo", {
    title:
      "Whois Lookup Info Domain Availability & Registrar Checker - FreeMediaTools.com",
    data: []
  });
});



app.get("/domainagechecker", (req, res) => {
  res.render("domainagechecker", {
    title:
      "Check Domain Age Online - Website Age Checker - Domain Age Checker - FreeMediaTools.com",
    data: "",
  });
});

var smtpTransport = nodemailer.createTransport({
  service: "gmail",
  host: "smtp.gmail.com",
  auth: {
    user: "pradnyakasar1913@gmail.com",
    pass: "pradnya1913",
  },
});

app.get("/", function (req, res) {
  res.sendfile("domainwhoisinfo.ejs");
});

app.get("/sendmail", function (req, res) {
  var mailOptions = {
    to: "pradnyarkasar@gmail.com",
    subject: "Email from nodemailer",
    html:
      "<div>Domain Name: " +
      req.query.Domainname +
      "</div><div>Domain Name expiry data: " +
      req.query.DomainExpiry +
      "</div><div>SSL Certificate Expiry Date: " +
      req.query.sslexpiry +
      "</div><div>Message: " +
      req.query.message +
      "</div>",
  };
  smtpTransport.sendMail(mailOptions, function (error, response) {
    if (error) {
      res.end("error");
    } else {
      res.end("sent");
    }
  });
});

function removeHttp(url) {
  if (url.startsWith("https://www.")) {
    const http = "https://www.";
    return url.slice(http.length);
  }

  if (url.startsWith("http://www.")) {
    const http = "http://www.";
    return url.slice(http.length);
  }

  if (url.startsWith("https://")) {
    const https = "https://";
    return url.slice(https.length);
  }

  if (url.startsWith("http://")) {
    const http = "http://";
    return url.slice(http.length);
  }

  if (url.startsWith("www.")) {
    const http = "www.";
    return url.slice(http.length);
  }

  return url;
}

function addHttp(url) {
  if (!/^https?:\/\//i.test(url)) {
    return "http://" + url;
  }
}

function checkHttppresent(url) {
  if (url.indexOf("http://") == 0 || url.indexOf("https://") == 0) {
    return true;
  } else {
    return false;
  }
}

const getSslDetails = async (hostname) => await sslChecker(hostname);

let results
let json

app.post("/domainwhoisinfo", async (req, res) => {
  var domain = removeHttp(req.body.domain);
  let sslInfo;
  console.log(domain);
  if (isValidDomain(domain)) {
    console.log(domain);
    results = await whoisinfo(domain);
    console.log(results)

    var date = moment(results.creationDate).format("YYYY-MM-DD");
    var expiryDate = moment(results.registrarRegistrationExpirationDate).format("YYYY-MM-DD")
    var currentDate = moment(new Date()).format("YYYY-MM-DD");

    console.log(date);
    console.log(currentDate);

    var a = moment(date);
    var ed = moment(expiryDate)
    var b = moment(currentDate);

    var years = b.diff(a, "year");
    a.add(years, "years");

    var months = b.diff(a, "months");
    a.add(months, "months");

    var days = b.diff(a, "days");

    var ddays = ed.diff(b,"days")

    console.log("expiration days is" + ddays)

    var domainAge = years + " years " + months + " months " + days + " days";

    console.log(years);
    console.log(months);
    console.log(days);

    //console.log(year + "-" + month + "-" + dt);



    //get ssl info

    let exists;
    let httpPresent = checkHttppresent(domain);
    console.log(httpPresent);
    if (httpPresent) {
      exists = await urlExist(domain);
    } else {
      exists = await urlExist(addHttp(domain));
    }
    console.log(exists);
    if (exists) {
      //let domain = req.body.domain;
      var domain = removeHttp(domain);
      console.log(domain);

      getSslDetails(domain).then((response) => {
        sslInfo = response;
        console.log(sslInfo.valid)
        console.log(sslInfo.daysRemaining)
        console.log(sslInfo.validFrom)
        

        json = {
          domainName: results.domainName,
          creationDate: date,
          expiryDate: moment(results.registrarRegistrationExpirationDate).format("YYYY-MM-DD"),
          domainAge: domainAge,
          valid:sslInfo.valid,
          days:sslInfo.daysRemaining,
          validFrom:sslInfo.validFrom,
          validTo:sslInfo.validTo,
          expiryDays:ddays
        };


        data.push(json)

        var xls = json2xls(json);

        fs.writeFileSync(`downloads/${Date.now()}.xlsx`, xls, "binary");
    
        exec(`python app.py`, (err, stdout, stderr) => {});

      



        console.log(data)

        res.render("domainwhoisinfo", {
          title:
            "Whois Lookup Info Domain Availability & Registrar Checker - FreeMediaTools.com",
          data:data
        });
      });
    } else {
    }
  } else {
    res.render("domainwhoisinfo", {
      title:
        "Whois Lookup Info Domain Availability & Registrar Checker - FreeMediaTools.com",
      data: []
    });
  }
});

cron.schedule('* * * * *', () => {
  console.log(data)

  // for domain email 

  data.forEach(domain => {
    if(domain.expiryDays <=3300){
      let transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.EMAIL,
          pass: process.env.PASSWORD,
        },
      });
        let mailOptions = {
        from: "pradnyakasar1913@gmail.com", // TODO: email sender
        to: "pradnyarkasar@gmail.com", // TODO: email receiver
        subject: `${domain.domainName} is going to expire in ${domain.expiryDays} days please renew`,
        html: `Hey Your ${domain.domainName} is going to expire in ${domain.expiryDays} days please renew`,
        text: `Hey Your ${domain.domainName} is going to expire in ${domain.expiryDays} days please renew`,
      };
      
      // Step 3
      transporter.sendMail(mailOptions, (err, data) => {
        if (err) {
          return log("Error occurs", err);
        }
        return log("Email sent!!!");
      });
    }

    // for ssl email

    if(domain.days <=15){
      let transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.EMAIL,
          pass: process.env.PASSWORD,
        },
      });
        let mailOptions = {
        from: "pradnyakasar1913@gmail.com", // TODO: email sender
        to: "pradnyarkasar@gmail.com", // TODO: email receiver
        subject: `${domain.domainName} SSL going to expire in ${domain.days} days please renew`,
        html: `Hey Your ${domain.domainName} SSL is going to expire in ${domain.days} days please renew`,
        text: `Hey Your ${domain.domainName} SSL is going to expire in ${domain.days} days please renew`,
      };
      
      // Step 3
      transporter.sendMail(mailOptions, (err, data) => {
        if (err) {
          return log("Error occurs", err);
        }
        return log("Email sent!!!");
      });
    }

    
  });


});


app.listen(8000);
console.log("app listening on port 8000");
