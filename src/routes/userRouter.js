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
const { CLIENT_ID, CLIENT_SECRET, REDIRECT_URI, TENANT_ID, REDIRECT_URIW,SESSIONSECRET } = process.env;
const clientID = CLIENT_ID;
const clientSecret = CLIENT_SECRET;
const callbackURL = REDIRECT_URI; //"http://localhost:5000/callback";
const callbackURLW = REDIRECT_URIW; //"http://localhost:5000/validation";
const tenantID = TENANT_ID;
const rateLimit = require("express-rate-limit");
const userRouter = Router();
const optionCors = {
  origin: "*",
  methods: "GET, POST, OPTIONS, PUT, DELETE",
  allowedHeaders: "Content-Type,Authorization",
  credentials: true,
};
userRouter.use(cors());
// const userRouter = express()
const sessionSecret = SESSIONSECRET || crypto.randomBytes(64).toString("hex");
console.log(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI, TENANT_ID, REDIRECT_URIW);
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
  "web-openidconnect",
  new AzureAdOAuth2Strategy(
    {
      clientID: clientID,
      clientSecret: clientSecret,
      callbackURL: callbackURLW,
      tenant: tenantID,
      resource: "https://graph.microsoft.com/",
    },
    (accessToken, refreshToken, params, profile, done) => {
     
      // aca puede realizar acciones para obtener los datos de los usuarios
      //para enviar ala base datos o lo que desee y se pueda hacer

      return done(null, { accessToken, refreshToken, profile });
    }
  )
);

//todo **************************************
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
//todo **************************************

passport.use(
  "azuread-openidconnect",
  new AzureAdOAuth2Strategy(
    {
      clientID: process.env.CLIENT_ID,
      clientSecret: process.env.CLIENT_SECRET,
      callbackURL: process.env.REDIRECT_URI,
      tenant: process.env.TENANT_ID,
      resource: "https://graph.microsoft.com/",
    },
    async (accessToken, refreshToken, params, profile, done) => {
      try {
        // Calculamos expiración
        const expiresAt = new Date(Date.now() + params.expires_in * 1000);

        const user = {
          accessToken,
          refreshToken,
          expiresAt,
          profile,
        };

        return done(null, user);
      } catch (err) {
        return done(err, null);
      }
    }
  )
);

// Serialización/deserialización
passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((obj, done) => done(null, obj));

// Configura la serialización de usuarios
// passport.serializeUser((user, done) => {
//   done(null, user);
// });

// passport.deserializeUser((user, done) => {
//   done(null, user);
// });

userRouter.get("/api/auth",(req,res)=>{
  if (req.isAuthenticated()) {
    res.send("true")
  }else{
    res.send("false")
  }
})

// const loginLimiter = rateLimit({
//   windowMs: 10 * 60 * 1000,
//   max: 5,
//   message: {
//     error: "Demasiados intentos de login, intenta en 10 minutos"
//   },
//   skipSuccessfulRequests: true // solo cuenta intentos fallidos
// });

const loginLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 10,
  keyGenerator: (req, res) => {
    const ip = rateLimit.ipKeyGenerator(req); 
    const email = req.body.email || "unknown";
    return `${ip}-${email}`;
  },
  skipSuccessfulRequests: true
});

// userRouter.post("/api/login", login);
userRouter.post("/api/login", loginLimiter, login);
// userRouter.get("/api/files", authUpload);
// userRouter.get("/api/callback", uploadFiles);
// userRouter.get("/api/dashboard", ensureAuthenticated, dashboard);

userRouter.get("/api/microsoft",(req,res)=>{
  res.redirect("/user/api/callbacks")
})

userRouter.get("/api/files", passport.authenticate("azuread-openidconnect"));
userRouter.get("/api/web", passport.authenticate("web-openidconnect"));

userRouter.get(
  "/api/callbacks",
  passport.authenticate("azuread-openidconnect", {
    failureRedirect: "/user/api/files",
  }),
  (req, res) => {
    
    const auth = req.isAuthenticated()
    const datos = {pass:"pass",token:auth,tokenSecret:req.user.accessToken,profile:req.user.profile}
    res.json(datos)

  }
);

//todo **************************************
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
//todo **************************************

userRouter.get(
  "/api/validation",
  passport.authenticate("azuread-openidconnect", { failureRedirect: "/user/api/web" }),
  async (req, res) => {
    const auth = req.isAuthenticated();

    if (!auth) {
      return res.send(`
        <script>
          alert('Usuario no autenticado');
          window.close();
        </script>
      `);
    }

    let tokenSecret = req.user.accessToken;
    const now = new Date();

    // Verificar expiración
    if (!tokenSecret || (req.user.expiresAt && now > new Date(req.user.expiresAt))) {
      tokenSecret = await refreshAccessToken(req.user);

      if (!tokenSecret) {
        return res.send(`
          <script>
            alert('Sesion expirada, por favor logueate de nuevo');
            window.close();
          </script>
        `);
      }
    }

    const datos = {
      pass: "pass",
      token: true,
      tokenSecret,
    };

    res.send(`
      <!DOCTYPE html>
      <html lang="en">
      <body></body>
      <script>
        try {
          if (window.opener) {
            const urls = [
              'https://app.creame.com.co/actividades',
              'https://app.creame.com.co/Gastos'
            ];
            urls.forEach(url => {
              window.opener.postMessage(${JSON.stringify(datos)}, url);
            });
          }
        } catch(e) {
          console.error('Error enviando postMessage', e);
        }

        // Esperamos un microsegundo antes de cerrar
        setTimeout(() => window.close(), 100);
      </script>
      </html>
    `);
  }
);

async function refreshAccessToken(user) {
  if (!user.refreshToken) return null;

  try {
    const params = new URLSearchParams();
    params.append("grant_type", "refresh_token");
    params.append("client_id", process.env.CLIENT_ID);
    params.append("client_secret", process.env.CLIENT_SECRET);
    params.append("refresh_token", user.refreshToken);
    params.append("scope", "https://graph.microsoft.com/.default");

    const response = await axios.post(
      `https://login.microsoftonline.com/${process.env.TENANT_ID}/oauth2/token`,
      params
    );

    const data = response.data;

    // Actualizamos user
    user.accessToken = data.access_token;
    user.refreshToken = data.refresh_token || user.refreshToken; // a veces no viene
    user.expiresAt = new Date(Date.now() + data.expires_in * 1000);

    return user.accessToken;
  } catch (err) {
    console.error("Error refrescando token:", err.message);
    return null;
  }
}


userRouter.post("/api/dashboard",ensureAuthenticated,dashboard);
userRouter.post("/api/creame-dashboard",dashboard);
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