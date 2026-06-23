// const express = require("express");
// const cors = require("cors");
// const morgan = require("morgan");
// const fileupload = require("express-fileupload");
// const bodyParser = require("body-parser");
// const router = require("./routes/index");
// const sequelize = require("sequelize");

// // const helmet = require('helmet');
// // const rateLimit = require("express-rate-limit");

// // const globalLimiter = rateLimit({
// //   windowMs: 15 * 60 * 1000,
// //   max: 200,
// //   standardHeaders: true,
// //   legacyHeaders: false,
// // });

// // require("dotenv").config()
// const app = express();
// // app.use(cors());
// // const optionCors = {
// //     origin: "*",
// //     methods: 'GET, POST, OPTIONS, PUT, DELETE',
// //     allowedHeaders: 'Content-Type, Authorization', // Corregido aquí
// //     credentials: true
// //   };
  
// //   app.use(cors(optionCors));
// // app.use(helmet());
// const allowedOrigins = ["*",'http://localhost:3000', 'https://app.creame.com.co', 'http://localhost:4180','http://localhost:5000/user/api/proyect/ocr','https://app.creame.com.co/user/api/proyect/ocr'];

// const corsOptions = {
//   origin: function (origin, callback) {
//     if (!origin || allowedOrigins.includes(origin)) {
//       callback(null, true); // Permite la solicitud
//     } else {
//       callback(new Error('Not allowed by CORS')); // Bloquea el origen
//     }
//   },
//   methods: 'GET, POST, OPTIONS, PUT, DELETE',
//   allowedHeaders: 'Content-Type, Authorization',
//   credentials: true
// };

// app.use(cors(corsOptions));

// // const allowedOrigins = [
// //   'http://localhost:3000',
// //   'https://app.creame.com.co',
// //   'http://localhost:4180',
// //   'http://localhost:5000'
// // ];

// // const corsOptions = {
// //   origin: function (origin, callback) {
// //     if (!origin) return callback(null, true); // permitir Postman/server-to-server

// //     if (allowedOrigins.includes(origin)) {
// //       callback(null, true);
// //     } else {
// //       callback(new Error("Origen no permitido por CORS"));
// //     }
// //   },
// //   methods: ['GET','POST','PUT','DELETE','OPTIONS'],
// //   allowedHeaders: ['Content-Type','Authorization'],
// //   credentials: true
// // };

// app.use(cors(corsOptions));
  
// app.use(express.json());
// app.use(bodyParser.json());
// app.use(fileupload());
// app.use(sequelize);

// app.use(morgan("dev"));
// // app.use(globalLimiter);


// // const path = require("path");
// // const fs = require("fs");
// // const request = require("request");
// // const session = require("express-session");
// // const passport = require("passport");
// // const AzureAdOAuth2Strategy = require("passport-azure-ad-oauth2").Strategy;
// // const crypto = require("crypto");
// // app.use(express.static("uploads"));


// app.use("/", router);

// // // const sessionSecret = crypto.randomBytes(64).toString("hex");
// // // require("dotenv").config();
// // // const { CLIENT_ID, CLIENT_SECRET, REDIRECT_URI, TENANT_ID } = process.env;
// // // const clientID = CLIENT_ID;
// // // const clientSecret = CLIENT_SECRET;
// // // const callbackURL = REDIRECT_URI; //"http://localhost:5000/callback";
// // // const tenantID = TENANT_ID;

// module.exports = app;






const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const fileupload = require("express-fileupload");
const router = require("./routes/index");

const app = express();

// 🔥 IMPORTANTE (si usas proxy: Render, Nginx, etc)
app.set("trust proxy", 1);

// ================= CORS =================
const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:4180",
  "https://app.creame.com.co"
];

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin) return callback(null, true); // Postman / server-to-server

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    return callback(new Error("Not allowed by CORS"));
  },
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
};

app.use(cors(corsOptions));

// ================= MIDDLEWARES =================
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(fileupload());
app.use(morgan("dev"));

// ================= ROUTES =================
app.use("/", router);

// ================= EXPORT =================
module.exports = app;