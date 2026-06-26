

// //todo ********************************
// const { Router } = require("express");
// const session = require("express-session");
// const { login } = require("../middlewares/index");
// const { dashboard, ensureAuthenticated } = require("../middlewares/uploadFiles");
// const crypto = require("crypto");
// const AzureAdOAuth2Strategy = require("passport-azure-ad-oauth2").Strategy;
// const passport = require("passport");
// require("dotenv").config();
// const rateLimit = require("express-rate-limit");
// const { ipKeyGenerator } = require("express-rate-limit");

// const {
//   CLIENT_ID,
//   CLIENT_SECRET,
//   REDIRECT_URIW, // URL de callback (local o prod)
//   TENANT_ID,
//   FRONTEND_URL,  // URL del frontend (local o prod)
//   SESSIONSECRET,
//   NODE_ENV
// } = process.env;

// const userRouter = Router();
// const isProd = NODE_ENV === "production";

// // ================= SESSION =================
// userRouter.use(
//   session({
//     secret: SESSIONSECRET || crypto.randomBytes(64).toString("hex"),
//     resave: false,
//     saveUninitialized: false,
//     cookie: {
//       secure: isProd, // true en producción (requiere HTTPS)
//       httpOnly: true,
//       sameSite: isProd ? "none" : "lax", 
//     },
//   })
// );

// // ================= PASSPORT =================
// userRouter.use(passport.initialize());
// userRouter.use(passport.session());

// // ================= STRATEGY =================
// passport.use(
//   "azure-openidconnect",
//   new AzureAdOAuth2Strategy(
//     {
//       clientID: CLIENT_ID,
//       clientSecret: CLIENT_SECRET,
//       callbackURL: REDIRECT_URIW,
//       tenant: TENANT_ID,
//       resource: "https://graph.microsoft.com/",
//       // 🍏 SOLUCIÓN AL PROBLEMA DE "SÓLO UNA VEZ": 
//       // Al poner state: false, Passport deja de exigir que la cookie concuerde de forma estricta.
//       // Esto elimina el error intermitente de los intentos consecutivos y te asegura 
//       // recibir SIEMPRE el accessToken real de Microsoft tanto para admins como para usuarios comunes.
//       state: false, 
//       authorizationURL: `https://login.microsoftonline.com/${TENANT_ID}/oauth2/authorize`,
//       tokenURL: `https://login.microsoftonline.com/${TENANT_ID}/oauth2/token`
//     },
//     (accessToken, refreshToken, params, profile, done) => {
//       try {
//         console.log("=========================================");
//         console.log("🟢 MICROSOFT ENTREGÓ EL TOKEN REAL");
//         console.log("Token válido obtenido para subida de archivos.");
//         console.log("=========================================");

//         const usuarioValido = {
//           accessToken,
//           refreshToken,
//           profile: profile || { displayName: "Usuario Corporativo" },
//           id_token: params.id_token
//         };

//         return done(null, usuarioValido);
//       } catch (error) {
//         console.error("❌ ERROR CRÍTICO EN LA ESTRATEGIA PASSPORT:", error);
//         return done(error);
//       }
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
// userRouter.get("/api/web", passport.authenticate("azure-openidconnect"));

// // ================= CALLBACK =================
// userRouter.get("/api/validation", (req, res, next) => {
//   // Limpieza limpia por si acaso quedó rastro de sesión en memoria
//   if (req.isAuthenticated()) {
//     req.logout((err) => {
//       if (err) console.error("Error limpiando sesión previa:", err);
//     });
//   }

//   passport.authenticate("azure-openidconnect", (err, user, info) => {
//     if (err) {
//       console.log("\n=========================================");
//       console.log("❌ ERROR EN EL CALLBACK:");
//       console.error(err);
//       console.log("=========================================\n");
//       return res.redirect("/user/login-error");
//     }

//     if (!user) {
//       console.log("\n=========================================");
//       console.log("⚠️ PASSPORT NEGÓ EL ACCESO (INFO):", info);
//       console.log("=========================================\n");
//       return res.redirect("/user/login-error");
//     }

//     // Login en Express
//     req.logIn(user, (loginErr) => {
//       if (loginErr) {
//         console.error("❌ Error al persistir la sesión:", loginErr);
//         return res.redirect("/user/login-error");
//       }

//       try {
//         // 🚀 Volvemos a la estructura original limpia que te funcionaba con el Admin
//         // Enviando el accessToken legítimo que Passport extrajo de Microsoft.
//         const datos = {
//           pass: "pass",
//           token: req.isAuthenticated(),
//           tokenSecret: req.user.accessToken, 
//         };

//         return res.send(`
//           <!DOCTYPE html>
//           <html>
//           <body>
//             <script>
//               const data = ${JSON.stringify(datos)};
//               window.opener.postMessage(data, '${FRONTEND_URL}'); 
//               window.close();
//             </script>
//           </body>
//           </html>
//         `);
//       } catch (error) {
//         console.error("❌ ERROR EN LA RESPUESTA DE VALIDACIÓN:", error);
//         return res.status(500).send("Error emitiendo tokens al frontend");
//       }
//     });
//   })(req, res, next);
// });

// // ================= RUTA DE CONTROL DE ERROR =================
// userRouter.get("/login-error", (req, res) => {
//   console.log("=========================================");
//   console.log("🔴 LOGIN FALLIDO CONTROLADO");
//   console.log("=========================================");
  
//   res.status(401).send(`
//     <!DOCTYPE html>
//     <html>
//     <body>
//       <script>
//         window.opener.postMessage({ error: 'Auth failed' }, '${FRONTEND_URL}');
//         alert('No se pudo completar el ingreso con Microsoft. Contacte al administrador.');
//         window.close();
//       </script>
//     </body>
//     </html>
//   `);
// });

// // ================= DASHBOARD =================
// userRouter.post("/api/dashboard", ensureAuthenticated, dashboard);
// userRouter.post("/api/creame-dashboard", dashboard);

// module.exports = userRouter;


const { Router } = require("express");
const session = require("express-session");
const crypto = require("crypto");
const passport = require("passport");
const rateLimit = require("express-rate-limit");
const AzureAdOAuth2Strategy = require("passport-azure-ad-oauth2").Strategy;
require("dotenv").config();

// Middlewares internos
const { login } = require("../middlewares/index");
const { dashboard, ensureAuthenticated } = require("../middlewares/uploadFiles");

const {
  CLIENT_ID,
  CLIENT_SECRET,
  REDIRECT_URIW, 
  TENANT_ID,
  FRONTEND_URL,  
  SESSIONSECRET,
  NODE_ENV
} = process.env;

const userRouter = Router();
const isProd = NODE_ENV === "production";

// ================= 1. MIDDLEWARES DE SESIÓN =================
userRouter.use(
  session({
    secret: SESSIONSECRET || crypto.randomBytes(64).toString("hex"),
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: isProd, 
      httpOnly: true,
      sameSite: isProd ? "none" : "lax", 
    },
  })
);

userRouter.use(passport.initialize());
userRouter.use(passport.session());

// ================= 2. ESTRATEGIA PASSPORT =================
passport.use(
  "azure-openidconnect",
  new AzureAdOAuth2Strategy(
    {
      clientID: CLIENT_ID,
      clientSecret: CLIENT_SECRET,
      callbackURL: REDIRECT_URIW,
      tenant: TENANT_ID,
      resource: "https://graph.microsoft.com/",
      state: false, 
      authorizationURL: `https://login.microsoftonline.com/${TENANT_ID}/oauth2/authorize`,
      tokenURL: `https://login.microsoftonline.com/${TENANT_ID}/oauth2/token`
    },
    (accessToken, refreshToken, params, profile, done) => {
      try {
        console.log("🟢 Token válido obtenido de Microsoft.");
        const usuarioValido = {
          accessToken,
          refreshToken,
          profile: profile || { displayName: "Usuario Corporativo" },
          id_token: params.id_token
        };
        return done(null, usuarioValido);
      } catch (error) {
        console.error("❌ Error en la estrategia de Passport:", error);
        return done(error);
      }
    }
  )
);

passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((user, done) => done(null, user));

// ================= 3. LIMITADOR DE PETICIONES =================
const loginLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 10,
  keyGenerator: (req) => {
    const ip = req.ip || "unknown-ip";
    const email = req.body.email || "unknown-email";
    return `${ip}-${email}`;
  },
  skipSuccessfulRequests: true,
});

// ================= 4. RUTAS DE AUTENTICACIÓN =================

// Estado de autenticación local
userRouter.get("/api/auth", (req, res) => {
  res.send(req.isAuthenticated() ? "true" : "false");
});

// Login tradicional
userRouter.post("/api/login", loginLimiter, login);

// Endpoint que dispara el login de Microsoft
userRouter.get("/api/web", passport.authenticate("azure-openidconnect"));

// Callback de redirección de Azure
userRouter.get("/api/validation", (req, res, next) => {
  if (req.isAuthenticated()) {
    req.logout((err) => {
      if (err) console.error("Error al limpiar sesión previa:", err);
    });
  }

  passport.authenticate("azure-openidconnect", (err, user, info) => {
    // 💡 IMPORTANTE: Si tu router se monta sobre '/user', redirigir a '/user/login-error'
    if (err) {
      console.error("❌ ERROR EN EL CALLBACK:", err);
      return res.redirect("/user/login-error");
    }

    if (!user) {
      console.warn("⚠️ PASSPORT NEGÓ EL ACCESO:", info);
      return res.redirect("/user/login-error");
    }

    // Login en Express
    req.logIn(user, (loginErr) => {
      if (loginErr) {
        console.error("❌ Error al persistir la sesión:", loginErr);
        return res.redirect("/user/login-error");
      }

      try {
        // 🔥 CORRECCIÓN: Forzamos 'token: true' como un booleano real
        const datos = {
          pass: "pass",
          token: true, 
          tokenSecret: req.user.accessToken, 
        };

        console.log("🟢 Enviando mensaje postMessage al frontend con el token...");

        return res.send(`
          <!DOCTYPE html>
          <html>
          <body>
            <script>
              const data = ${JSON.stringify(datos)};
              // Enviamos los datos de manera segura al Frontend
              window.opener.postMessage(data, '${FRONTEND_URL}'); 
              window.close();
            </script>
          </body>
          </html>
        `);
      } catch (error) {
        console.error("❌ ERROR EN LA RESPUESTA DE VALIDACIÓN:", error);
        return res.status(500).send("Error emitiendo tokens al frontend");
      }
    });
  })(req, res, next);
});

// Ruta controlada de fallos
userRouter.get("/login-error", (req, res) => {
  console.log("🔴 LOGIN FALLIDO EN AZURE AD");
  res.status(401).send(`
    <!DOCTYPE html>
    <html>
      <body>
        <script>
          window.opener.postMessage({ error: 'Auth failed' }, '${FRONTEND_URL}');
          alert('No se pudo completar el ingreso con Microsoft. Contacte al administrador.');
          window.close();
        </script>
      </body>
    </html>
  `);
});

// ================= 5. CONEXIÓN DE PROYECTOS / DASHBOARD =================
userRouter.post("/api/dashboard", ensureAuthenticated, dashboard);
userRouter.post("/api/creame-dashboard", dashboard);

module.exports = userRouter;