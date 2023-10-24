// const { Router } = require("express");
// // const express = require("express")
// const session = require("express-session");
// const { login } = require("../middlewares/index");
// const {
//   authUpload,
//   uploadFiles,
//   dashboard,
//   ensureAuthenticated,
// } = require("../middlewares/uploadFiles");
// const crypto = require("crypto");
// const AzureAdOAuth2Strategy = require("passport-azure-ad-oauth2").Strategy;
// const passport = require("passport");
// const path = require("path");
// const fs = require("fs");
// const request = require("request");
// const cors = require("cors");
// require("dotenv").config();
// const { CLIENT_ID, CLIENT_SECRET, REDIRECT_URI, TENANT_ID } = process.env;
// const clientID = CLIENT_ID;
// const clientSecret = CLIENT_SECRET;
// const callbackURL = REDIRECT_URI; //"http://localhost:5000/callback";
// const tenantID = TENANT_ID;

// const userRouter = Router();
// const optionCors = {
//   origin: "*",
//   methods: "GET, POST, OPTIONS, PUT, DELETE",
//   allowedHeaders: "Content-Type,Authorization",
//   credentials: true,
// };
// userRouter.use(cors());
// // const userRouter = express()
// const sessionSecret = crypto.randomBytes(64).toString("hex");
// console.log(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI, TENANT_ID);
// // Configura y utiliza sesiones en Express
// userRouter.use(
//   session({
//     secret: sessionSecret,
//     resave: true,
//     saveUninitialized: false,
//   })
// );
// // Inicializo Passport y lo utilizo en Express
// userRouter.use(passport.initialize());
// userRouter.use(passport.session());

// passport.use(
//   "azuread-openidconnect",
//   new AzureAdOAuth2Strategy(
//     {
//       clientID: clientID,
//       clientSecret: clientSecret,
//       callbackURL: callbackURL,
//       tenant: tenantID,
//       resource: "https://graph.microsoft.com/",
//     },
//     (accessToken, refreshToken, params, profile, done) => {
//       console.log("token", accessToken);
//       // aca puede realizar acciones para obtener los datos de los usuarios
//       //para enviar ala base datos o lo que desee y se pueda hacer

//       return done(null, { accessToken, refreshToken, profile });
//     }
//   )
// );

// // Configura la serialización de usuarios
// passport.serializeUser((user, done) => {
//   done(null, user);
// });

// passport.deserializeUser((user, done) => {
//   done(null, user);
// });

// userRouter.post("/api/login", login);
// // userRouter.get("/api/files", authUpload);
// // userRouter.get("/api/callback", uploadFiles);
// // userRouter.get("/api/dashboard", ensureAuthenticated, dashboard);

// userRouter.get("/api/files", passport.authenticate("azuread-openidconnect"));
// userRouter.get(
//   "/api/callback",
//   passport.authenticate("azuread-openidconnect", {
//     failureRedirect: "/user/api/files",
//   }),
//   (req, res) => {
//     console.log("callbackkkkk");
//     // res.redirect("/user/api/dashboard");
//     res.send("ok")
//   }
// );
// userRouter.post("/api/dashboard",ensureAuthenticated,dashboard);
// // userRouter.post("/api/dashboard", dashboard);
// // ensureAuthenticated
// // userRouter.post("/api/register",registerUser)

// //todo usar para cojer el token por get desde la web
// // userRouter.get("/api/files", passport.authenticate("azuread-openidconnect"));
// // userRouter.get("/api/callback",passport.authenticate("azuread-openidconnect", { failureRedirect: "/user/api/files" }),(req,res)=>{
// //   res.redirect("/dashboard");
// // });
// // userRouter.get("/api/dashboard",ensureAuthenticated,dashboard);

// module.exports = userRouter;



const { Router } = require("express");
// const express = require("express")
const session = require("express-session");
const { login } = require("../middlewares/index");
const {
  authUpload,
  uploadFiles,
  dashboard,
  ensureAuthenticated,
} = require("../middlewares/uploadFiles");
const crypto = require("crypto");
const AzureAdOAuth2Strategy = require("passport-azure-ad-oauth2").Strategy;
const passport = require("passport");
const path = require("path");
const fs = require("fs");
const request = require("request");
const cors = require("cors");
require("dotenv").config();
const { CLIENT_ID, CLIENT_SECRET, REDIRECT_URI, TENANT_ID } = process.env;
const clientID = CLIENT_ID;
const clientSecret = CLIENT_SECRET;
const callbackURL = REDIRECT_URI; //"http://localhost:5000/callback";
const tenantID = TENANT_ID;

const userRouter = Router();
const optionCors = {
  origin: "*",
  methods: "GET, POST, OPTIONS, PUT, DELETE",
  allowedHeaders: "Content-Type,Authorization",
  credentials: true,
};
userRouter.use(cors());
// const userRouter = express()
const sessionSecret = crypto.randomBytes(64).toString("hex");
console.log(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI, TENANT_ID);
// Configura y utiliza sesiones en Express
userRouter.use(
  session({
    secret: sessionSecret,
    resave: true,
    saveUninitialized: false,
  })
);
// Inicializo Passport y lo utilizo en Express
userRouter.use(passport.initialize());
userRouter.use(passport.session());

passport.use(
  "azuread-openidconnect",
  new AzureAdOAuth2Strategy(
    {
      clientID: clientID,
      clientSecret: clientSecret,
      callbackURL: callbackURL,
      tenant: tenantID,
      resource: "https://graph.microsoft.com/",
    },
    (accessToken, refreshToken, params, profile, done) => {
      console.log("token", accessToken);
     
      // aca puede realizar acciones para obtener los datos de los usuarios
      //para enviar ala base datos o lo que desee y se pueda hacer

      return done(null, { accessToken, refreshToken, profile });
    }
  )
);

// Configura la serialización de usuarios
passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((user, done) => {
  done(null, user);
});

userRouter.get("/api/auth",(req,res)=>{
  if (req.isAuthenticated()) {
    res.send("true")
  }else{
    res.send("false")
  }
})

userRouter.post("/api/login", login);
// userRouter.get("/api/files", authUpload);
// userRouter.get("/api/callback", uploadFiles);
// userRouter.get("/api/dashboard", ensureAuthenticated, dashboard);

userRouter.get("/api/microsoft",(req,res)=>{
  res.redirect("/user/api/callback")
})

userRouter.get("/api/files", passport.authenticate("azuread-openidconnect"));
userRouter.get(
  "/api/callback",
  passport.authenticate("azuread-openidconnect", {
    failureRedirect: "/user/api/files",
  }),
  (req, res) => {
    const auth = req.isAuthenticated()
    const datos = {pass:"pass",token:auth,tokenSecret:req.user.accessToken}
    const {validation} = req.query
    console.log(validation)
  if (validation === true) {
    res.send(
      ` 
      <!DOCTYPE html>
      <html lang="en">

      <body>

      </body>
      <script> window.opener.postMessage(${JSON.stringify(datos)}, 'http://localhost:5173/Gastos') 
      setTimeout(function() {
        window.close();
    }, 1000); 
    </script>
      </html>
      `
   )
  }else{
    res.json(datos)
  }
   
    
    // const script = `<script>
    //     window.opener.postMessage(${JSON.stringify(datos)}, "https://syncronizabackup-production.up.railway.app");
    //     window.close();
    //   </script>`;
     
    //res.redirect("/user/api/dashboard");
    
  }
);
userRouter.post("/api/dashboard",ensureAuthenticated,dashboard);
// userRouter.post("/api/dashboard", dashboard);
// ensureAuthenticated
// userRouter.post("/api/register",registerUser)

//todo usar para cojer el token por get desde la webs
// userRouter.get("/api/files", passport.authenticate("azuread-openidconnect"));
// userRouter.get("/api/callback",passport.authenticate("azuread-openidconnect", { failureRedirect: "/user/api/files" }),(req,res)=>{
//   res.redirect("/dashboard");
// });
// userRouter.get("/api/dashboard",ensureAuthenticated,dashboard);

module.exports = userRouter;