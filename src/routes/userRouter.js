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
// const { CLIENT_ID, CLIENT_SECRET, REDIRECT_URI, TENANT_ID, REDIRECT_URIW,SESSIONSECRET } = process.env;
// const clientID = CLIENT_ID;
// const clientSecret = CLIENT_SECRET;
// const callbackURL = REDIRECT_URI; //"http://localhost:5000/callback";
// const callbackURLW = REDIRECT_URIW; //"http://localhost:5000/validation";
// const tenantID = TENANT_ID;
// const rateLimit = require("express-rate-limit");
// const userRouter = Router();
// const optionCors = {
//   origin: "*",
//   methods: "GET, POST, OPTIONS, PUT, DELETE",
//   allowedHeaders: "Content-Type,Authorization",
//   credentials: true,
// };
// userRouter.use(cors());
// // const userRouter = express()
// const sessionSecret = SESSIONSECRET || crypto.randomBytes(64).toString("hex");
// console.log(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI, TENANT_ID, REDIRECT_URIW);
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
//   "web-openidconnect",
//   new AzureAdOAuth2Strategy(
//     {
//       clientID: clientID,
//       clientSecret: clientSecret,
//       callbackURL: callbackURLW,
//       tenant: tenantID,
//       resource: "https://graph.microsoft.com/",
//     },
//     (accessToken, refreshToken, params, profile, done) => {
     
//       // aca puede realizar acciones para obtener los datos de los usuarios
//       //para enviar ala base datos o lo que desee y se pueda hacer

//       return done(null, { accessToken, refreshToken, profile });
//     }
//   )
// );

// //todo **************************************
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
//       console.log("params", params);
     
//       // aca puede realizar acciones para obtener los datos de los usuarios
//       //para enviar ala base datos o lo que desee y se pueda hacer

//       return done(null, { accessToken, refreshToken, profile });
//     }
//   )
// );
// //todo **************************************



// // Configura la serialización de usuarios
// passport.serializeUser((user, done) => {
//   done(null, user);
// });

// passport.deserializeUser((user, done) => {
//   done(null, user);
// });

// userRouter.get("/api/auth",(req,res)=>{
//   if (req.isAuthenticated()) {
//     res.send("true")
//   }else{
//     res.send("false")
//   }
// })

// // const loginLimiter = rateLimit({
// //   windowMs: 10 * 60 * 1000,
// //   max: 5,
// //   message: {
// //     error: "Demasiados intentos de login, intenta en 10 minutos"
// //   },
// //   skipSuccessfulRequests: true // solo cuenta intentos fallidos
// // });

// const loginLimiter = rateLimit({
//   windowMs: 10 * 60 * 1000,
//   max: 10,
//   keyGenerator: (req, res) => {
//     const ip = rateLimit.ipKeyGenerator(req); 
//     const email = req.body.email || "unknown";
//     return `${ip}-${email}`;
//   },
//   skipSuccessfulRequests: true
// });

// // userRouter.post("/api/login", login);
// userRouter.post("/api/login", loginLimiter, login);
// // userRouter.get("/api/files", authUpload);
// // userRouter.get("/api/callback", uploadFiles);
// // userRouter.get("/api/dashboard", ensureAuthenticated, dashboard);

// userRouter.get("/api/microsoft",(req,res)=>{
//   res.redirect("/user/api/callbacks")
// })

// userRouter.get("/api/files", passport.authenticate("azuread-openidconnect"));
// userRouter.get("/api/web", passport.authenticate("web-openidconnect"));

// userRouter.get(
//   "/api/callbacks",
//   passport.authenticate("azuread-openidconnect", {
//     failureRedirect: "/user/api/files",
//   }),
//   (req, res) => {
    
//     const auth = req.isAuthenticated()
//     const datos = {pass:"pass",token:auth,tokenSecret:req.user.accessToken,profile:req.user.profile}
//     res.json(datos)

//   }
// );

// //todo **************************************
// userRouter.get(
//   "/api/validation",
//   passport.authenticate("web-openidconnect", {
//     failureRedirect: "/user/api/web",
//   }),
//   (req, res) => {

//     const auth = req.isAuthenticated()
//     const datos = {pass:"pass",token:auth,tokenSecret:req.user.accessToken}
//     res.send(
//       ` 
//       <!DOCTYPE html>
//       <html lang="en">

//       <body>

//       </body>
//       <script> window.opener.postMessage(${JSON.stringify(datos)}, 'https://app.creame.com.co/actividade') 
//       <script> window.opener.postMessage(${JSON.stringify(datos)}, 'https://app.creame.com.co/Gastos') 
//         window.close();
//     </script>
//       </html>
//       `
//    )
//   //    <script> window.opener.postMessage(${JSON.stringify(datos)}, 'http://localhost:4180/actividades') 
//   //     <script> window.opener.postMessage(${JSON.stringify(datos)}, 'http://localhost:4180/Gastos') 
//   //  <script> window.opener.postMessage(${JSON.stringify(datos)}, 'https://app.creame.com.co/actividades') 
//   //  <script> window.opener.postMessage(${JSON.stringify(datos)}, 'https://app.creame.com.co/Gastos') 
// //    setTimeout(function() {
// //     window.close();
// // }, 1000);
//   }
// );
// //todo **************************************



// userRouter.post("/api/dashboard",ensureAuthenticated,dashboard);
// userRouter.post("/api/creame-dashboard",dashboard);
// // userRouter.post("/api/dashboard", dashboard);
// // ensureAuthenticated
// // userRouter.post("/api/register",registerUser)

// //todo usar para cojer el token por get desde la webs
// // userRouter.get("/api/files", passport.authenticate("azuread-openidconnect"));
// // userRouter.get("/api/callback",passport.authenticate("azuread-openidconnect", { failureRedirect: "/user/api/files" }),(req,res)=>{
// //   res.redirect("/dashboard");
// // });
// // userRouter.get("/api/dashboard",ensureAuthenticated,dashboard);

// module.exports = userRouter;


//todo ********************************


// const { Router } = require("express");
// const session = require("express-session");
// const { login } = require("../middlewares/index");
// const {
//   dashboard,
//   ensureAuthenticated,
// } = require("../middlewares/uploadFiles");
// const crypto = require("crypto");
// const AzureAdOAuth2Strategy = require("passport-azure-ad-oauth2").Strategy;
// const passport = require("passport");
// const cors = require("cors");
// require("dotenv").config();
// const rateLimit = require("express-rate-limit");
// // const rateLimit = require("express-rate-limit");
// const { ipKeyGenerator } = require("express-rate-limit");
// const {
//   CLIENT_ID,
//   CLIENT_SECRET,
//   REDIRECT_URI,
//   TENANT_ID,
//   REDIRECT_URIW,
//   SESSIONSECRET,
// } = process.env;

// const userRouter = Router();

// userRouter.use(cors());

// // ================= SESSION =================
// const sessionSecret =
//   SESSIONSECRET || crypto.randomBytes(64).toString("hex");

// userRouter.use(
//   session({
//     secret: sessionSecret,
//     resave: false,
//     saveUninitialized: false,
//   })
// );

// // ================= PASSPORT =================
// userRouter.use(passport.initialize());
// userRouter.use(passport.session());

// // 🔒 evitar reutilización del code
// const usedCodes = new Set();

// // ================= STRATEGY WEB =================
// passport.use(
//   "web-openidconnect",
//   new AzureAdOAuth2Strategy(
//     {
//       clientID: CLIENT_ID,
//       clientSecret: CLIENT_SECRET,
//       callbackURL: REDIRECT_URIW,
//       tenant: TENANT_ID,
//       resource: "https://graph.microsoft.com/",
//       state: true, // 🔥 IMPORTANTE
//     },
//     (accessToken, refreshToken, params, profile, done) => {
//       return done(null, { accessToken, refreshToken, profile });
//     }
//   )
// );

// // ================= STRATEGY NORMAL =================
// passport.use(
//   "azuread-openidconnect",
//   new AzureAdOAuth2Strategy(
//     {
//       clientID: CLIENT_ID,
//       clientSecret: CLIENT_SECRET,
//       callbackURL: REDIRECT_URI,
//       tenant: TENANT_ID,
//       resource: "https://graph.microsoft.com/",
//       state: true, // 🔥 IMPORTANTE
//     },
//     (accessToken, refreshToken, params, profile, done) => {
//       return done(null, { accessToken, refreshToken, profile });
//     }
//   )
// );

// // ================= SERIALIZE =================
// passport.serializeUser((user, done) => done(null, user));
// passport.deserializeUser((user, done) => done(null, user));

// // ================= AUTH STATUS =================
// userRouter.get("/api/auth", (req, res) => {
//   res.send(req.isAuthenticated() ? "true" : "false");
// });

// // ================= LOGIN NORMAL =================

// const loginLimiter = rateLimit({
//   windowMs: 10 * 60 * 1000,
//   max: 10,

//   keyGenerator: (req) => {
//     const ip = ipKeyGenerator(req); // ✅ correcto
//     const email = req.body.email || "unknown";
//     return `${ip}-${email}`;
//   },

//   skipSuccessfulRequests: true,
// });

// userRouter.post("/api/login", loginLimiter, login);

// // ================= MICROSOFT LOGIN =================
// userRouter.get("/api/web", passport.authenticate("web-openidconnect"));

// // ================= CALLBACK VALIDATION =================
// userRouter.get(
//   "/api/validation",

//   // 🔥 PREVALIDACIONES
//   (req, res, next) => {
//     const code = req.query.code;

//     if (!code) {
//       return res.redirect("/");
//     }

//     if (usedCodes.has(code)) {
//       return res.status(400).send("Código ya usado");
//     }

//     usedCodes.add(code);

//     next();
//   },

//   passport.authenticate("web-openidconnect", {
//     failureRedirect: "/user/api/web",
//   }),

//   (req, res) => {
//     try {
//       const auth = req.isAuthenticated();

//       const datos = {
//         pass: "pass",
//         token: auth,
//         tokenSecret: req.user.accessToken,
//       };

//       res.send(`
//         <!DOCTYPE html>
//         <html>
//         <body></body>

//         <script>
//           const data = ${JSON.stringify(datos)};

         
//           window.opener.postMessage(data, 'https://app.creame.com.co/actividade');
//           window.opener.postMessage(data, 'https://app.creame.com.co/Gastos');

//           window.close();
//         </script>

//         </html>
//       `);
//     } catch (error) {
//         // window.opener.postMessage(data, 'http://localhost:4180/actividade');
//         //   window.opener.postMessage(data, 'http://localhost:4180/Gastos');
//       //  window.opener.postMessage(data, 'https://app.creame.com.co/actividade');
//           // window.opener.postMessage(data, 'https://app.creame.com.co/Gastos');
//       console.error("ERROR VALIDATION:", error);
//       res.status(500).send("Error en autenticación");
//     }
//   }
// );

// // ================= DASHBOARD =================
// userRouter.post("/api/dashboard", ensureAuthenticated, dashboard);
// userRouter.post("/api/creame-dashboard", dashboard);

// module.exports = userRouter;



//todo ********************************


// const { Router } = require("express");
// const session = require("express-session");
// const { login } = require("../middlewares/index");
// const {
//   dashboard,
//   ensureAuthenticated,
// } = require("../middlewares/uploadFiles");
// const crypto = require("crypto");
// const AzureAdOAuth2Strategy = require("passport-azure-ad-oauth2").Strategy;
// const passport = require("passport");
// require("dotenv").config();
// const rateLimit = require("express-rate-limit");
// const { ipKeyGenerator } = require("express-rate-limit");

// const {
//   CLIENT_ID,
//   CLIENT_SECRET,
//   REDIRECT_URI,
//   TENANT_ID,
//   REDIRECT_URIW,
//   SESSIONSECRET,
// } = process.env;

// const userRouter = Router();

// // ================= SESSION =================
// userRouter.use(
//   session({
//     secret: SESSIONSECRET || crypto.randomBytes(64).toString("hex"),
//     resave: false,
//     saveUninitialized: false,
//     cookie: {
//       secure: false, // 🔥 en producción (https)
//       httpOnly: true,
//       sameSite: "none", // 🔥 necesario para frontend separado
//     },
//   })
// );

// // ================= PASSPORT =================
// userRouter.use(passport.initialize());
// userRouter.use(passport.session());

// // ================= STRATEGIES =================
// passport.use(
//   "web-openidconnect",
//   new AzureAdOAuth2Strategy(
//     {
//       clientID: CLIENT_ID,
//       clientSecret: CLIENT_SECRET,
//       callbackURL: REDIRECT_URIW,
//       tenant: TENANT_ID,
//       resource: "https://graph.microsoft.com/",
//       state: true,
//     },
//     (accessToken, refreshToken, params, profile, done) => {
//       return done(null, { accessToken, refreshToken, profile });
//     }
//   )
// );

// passport.use(
//   "azuread-openidconnect",
//   new AzureAdOAuth2Strategy(
//     {
//       clientID: CLIENT_ID,
//       clientSecret: CLIENT_SECRET,
//       callbackURL: REDIRECT_URI,
//       tenant: TENANT_ID,
//       resource: "https://graph.microsoft.com/",
//       state: true,
//     },
//     (accessToken, refreshToken, params, profile, done) => {
//       return done(null, { accessToken, refreshToken, profile });
//     }
//   )
// );

// // ================= SERIALIZE =================
// passport.serializeUser((user, done) => done(null, user));
// passport.deserializeUser((user, done) => done(null, user));

// // ================= AUTH STATUS =================
// userRouter.get("/api/auth", (req, res) => {
//   res.send(req.isAuthenticated() ? "true" : "false");
// });

// // ================= LOGIN NORMAL =================
// const loginLimiter = rateLimit({
//   windowMs: 10 * 60 * 1000,
//   max: 10,
//   keyGenerator: (req) => {
//     const ip = ipKeyGenerator(req);
//     const email = req.body.email || "unknown";
//     return `${ip}-${email}`;
//   },
//   skipSuccessfulRequests: true,
// });

// userRouter.post("/api/login", loginLimiter, login);

// // ================= MICROSOFT LOGIN =================
// userRouter.get("/api/web", passport.authenticate("web-openidconnect"));

// // ================= CALLBACK =================
// userRouter.get(
//   "/api/validation",

//   passport.authenticate("web-openidconnect", {
//     failureRedirect: "/login-error", // ✅ FIX
//   }),

//   (req, res) => {
//     try {
//       const datos = {
//         pass: "pass",
//         token: req.isAuthenticated(),
//         tokenSecret: req.user.accessToken,
//       };

//       res.send(`
//         <!DOCTYPE html>
//         <html>
//         <body></body>

//         <script>
//           const data = ${JSON.stringify(datos)};
          
//           window.opener.postMessage(data, 'http://localhost:4180'); // ✅ FIX
//           window.close();
//         </script>

//         </html>
//       `);
//     } catch (error) {
//       // window.opener.postMessage(data, 'https://app.creame.com.co'); // ✅ FIX
//       console.error("ERROR VALIDATION:", error);
//       res.status(500).send("Error en autenticación");
//     }
//   }
// );

// // ================= DASHBOARD =================
// userRouter.post("/api/dashboard", ensureAuthenticated, dashboard);
// userRouter.post("/api/creame-dashboard", dashboard);

// module.exports = userRouter;







const { Router } = require("express");
const session = require("express-session");
const { login } = require("../middlewares/index");
const { dashboard, ensureAuthenticated } = require("../middlewares/uploadFiles");
const crypto = require("crypto");
const AzureAdOAuth2Strategy = require("passport-azure-ad-oauth2").Strategy;
const passport = require("passport");
require("dotenv").config();
const rateLimit = require("express-rate-limit");
const { ipKeyGenerator } = require("express-rate-limit");

const {
  CLIENT_ID,
  CLIENT_SECRET,
  REDIRECT_URIW, // URL de callback (local o prod)
  TENANT_ID,
  FRONTEND_URL, // URL del frontend (local o prod)
  SESSIONSECRET,
  NODE_ENV
} = process.env;

const userRouter = Router();
const isProd = NODE_ENV === "production";

// ================= SESSION =================
userRouter.use(
  session({
    secret: SESSIONSECRET || crypto.randomBytes(64).toString("hex"),
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: isProd, // 🔥 true en producción (requiere HTTPS)
      httpOnly: true,
      sameSite: isProd ? "none" : "lax", // 🔥 'none' requiere secure: true, en local usa 'lax'
    },
  })
);

// ================= PASSPORT =================
userRouter.use(passport.initialize());
userRouter.use(passport.session());

// ================= STRATEGY (UNA SOLA) =================
passport.use(
  "azure-openidconnect",
  new AzureAdOAuth2Strategy(
    {
      clientID: CLIENT_ID,
      clientSecret: CLIENT_SECRET,
      callbackURL: REDIRECT_URIW, // Usa la que venga del .env
      tenant: TENANT_ID,
      resource: "https://graph.microsoft.com/",
      state: true,
    },
    (accessToken, refreshToken, params, profile, done) => {
      return done(null, { accessToken, refreshToken, profile });
    }
  )
);

// ================= SERIALIZE =================
passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((user, done) => done(null, user));

// ================= AUTH STATUS =================
userRouter.get("/api/auth", (req, res) => {
  res.send(req.isAuthenticated() ? "true" : "false");
});

// ================= LOGIN NORMAL =================
const loginLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 10,
  keyGenerator: (req) => {
    const ip = ipKeyGenerator(req);
    const email = req.body.email || "unknown";
    return `${ip}-${email}`;
  },
  skipSuccessfulRequests: true,
});

userRouter.post("/api/login", loginLimiter, login);

// ================= MICROSOFT LOGIN =================
userRouter.get("/api/web", passport.authenticate("azure-openidconnect"));

// ================= CALLBACK =================
userRouter.get(
  "/api/validation",
  passport.authenticate("azure-openidconnect", {
    failureRedirect: "/login-error", 
  }),
  (req, res) => {
    try {
      const datos = {
        pass: "pass",
        token: req.isAuthenticated(),
        tokenSecret: req.user.accessToken,
      };

      // Usamos FRONTEND_URL dinámico para el postMessage de manera segura
      res.send(`
        <!DOCTYPE html>
        <html>
        <body>
          <script>
            const data = ${JSON.stringify(datos)};
            window.opener.postMessage(data, '${FRONTEND_URL}'); 
            window.close();
          </script>
        </body>
        </html>
      `);
    } catch (error) {
      console.error("ERROR VALIDATION:", error);
      res.status(500).send("Error en autenticación");
    }
  }
);

// ================= DASHBOARD =================
userRouter.post("/api/dashboard", ensureAuthenticated, dashboard);
userRouter.post("/api/creame-dashboard", dashboard);

module.exports = userRouter;