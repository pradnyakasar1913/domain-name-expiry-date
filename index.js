// const moment = require("moment");

// const whoisinfo = require("whois-json");

// const bodyParser = require("body-parser");

// var isValidDomain = require("is-valid-domain");

// const express = require("express");

// const app = express();

// app.use(bodyParser.json());

// app.use(bodyParser.urlencoded({ extended: false }));
// app.set("view engine", "ejs");

// app.get("/", (req, res) => {
//   res.render("domainwhoisinfo", {
//     title:
//       "Whos is lookup info domain availability & register checker - freemediatools.com",
//     data: "",
//     flag: false,
//     date: "",
//     domainAge: "",
//   });
// });

// // app.get("/domainwhoisinfo", (req, res) => {
// //   res.render("domainwhoisinfo");
// // });

// app.post("/domainwhoisinfo", async (req, res) => {
//   var domain = req.body.domain;
//   console.log(domain);

//   if (isValidDomain(domain)) {
//     console.log(domain);
//     var results = await whoisinfo(domain);
//     console.log(results);

//     var date = moment(results.creationDate).format("YYYY-MM-DD");
//     var currentDate = moment(new Date()).format("YYYY-MM-DD");

//     console.log(date);
//     console.log(currentDate);

//     var a = moment(date);
//     var b = moment(currentDate);

//     var years = b.diff(a, "year");
//     a.add(years, "years");

//     var months = b.diff(a, "months");

//     res.render("domainwhoisinfo", { data: response });
//   } else {
//     res.send("please enter domain name without http or https");
//   }
// });

// app.get("/domainagechecker", (req, res) => {
//   res.render("domainagechecker", {
//     title:
//       "Check Domain Age Online - Website Age Checker - Domain Age Checker - FreeMediaTools.com",
//     data: "",
//     flag: false,
//     date: "",
//     domainAge: "",
//   });
// });

// app.listen(4000);
// console.log("App is listening on port 4000");

const moment = require("moment");

const XLSX = require("xlsx");

const whoisinfo = require("whois-json");

const fs = require("fs");

const extractDomain = require("extract-domain");

const isValidDomain = require("is-valid-domain");

var spread_sheet = require("spread_sheet");

var json2xls = require("json2xls");

const bodyParser = require("body-parser");

const ExcelJS = require("exceljs");

const wb = new ExcelJS.Workbook();

const express = require("express");

const { exec } = require("child_process");

const app = express();

app.use(bodyParser.json());

let domains = [];

let fileEmpty = true;

app.use(bodyParser.urlencoded({ extended: false }));
app.set("view engine", "ejs");

app.get("/", (req, res) => {
  res.render("domainwhoisinfo", {
    title:
      "Whois Lookup Info Domain Availability & Registrar Checker - FreeMediaTools.com",
    data: "",
    flag: false,
    date: "",
    domainAge: "",
    invalid: false,
  });
});

// app.get("/", (req, res) => {
//   res.render("domainwhoisinfo", { data: "" });
// });

app.get("/domainagechecker", (req, res) => {
  res.render("domainagechecker", {
    title:
      "Check Domain Age Online - Website Age Checker - Domain Age Checker - FreeMediaTools.com",
    data: "",
    flag: false,
    date: "",
    domainAge: "",
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

app.post("/domainwhoisinfo", async (req, res) => {
  var domain = removeHttp(req.body.domain);
  console.log(domain);
  if (isValidDomain(domain)) {
    console.log(domain);
    var results = await whoisinfo(domain);
    console.log(results);
    // const students = [
    //   {
    //     name: Response.domainName,
    //     email: Response.creationDate,
    //     age: Response.registrarRegistrationExpirationDate,
    //     gender: Response.domainAge,
    //   },
    //   { name: "Rahul", email: "rahul@gmail.com", age: 15, gender: "M" },
    // ];

    var date = moment(results.creationDate).format("YYYY-MM-DD");
    var currentDate = moment(new Date()).format("YYYY-MM-DD");

    console.log(date);
    console.log(currentDate);

    var a = moment(date);
    var b = moment(currentDate);

    var years = b.diff(a, "year");
    a.add(years, "years");

    var months = b.diff(a, "months");
    a.add(months, "months");

    var days = b.diff(a, "days");

    var domainAge = years + " years " + months + " months " + days + " days";

    console.log(years);
    console.log(months);
    console.log(days);

    //console.log(year + "-" + month + "-" + dt);

    let json = {
      domainName: results.domainName,
      creationDate: date,
      expiryDate: results.registrarRegistrationExpirationDate,
      domainAge: domainAge,
    };

    var xls = json2xls(json);

    fs.writeFileSync(`downloads/${Date.now()}.xlsx`, xls, "binary");

    exec(`python app.py`, (err, stdout, stderr) => {});

    res.render("domainwhoisinfo", {
      title:
        "Whois Lookup Info Domain Availability & Registrar Checker - FreeMediaTools.com",
      data: results,
      flag: true,
      date: date,
      domainAge: domainAge,
      invalid: false,
    });
  } else {
    res.render("domainwhoisinfo", {
      title:
        "Whois Lookup Info Domain Availability & Registrar Checker - FreeMediaTools.com",
      data: "",
      flag: false,
      date: "",
      domainAge: "",
      invalid: true,
    });
  }
});

app.listen(7000);
console.log("app listening on port 7000");
