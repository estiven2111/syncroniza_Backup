require("dotenv").config();
const express = require("express");
const axios = require("axios");
const FormData = require("form-data");
const fs = require("fs");
const fs_extra = require("fs-extra");
const mime = require("mime");
const request = require("request");
const path = require("path");
const AzureAdOAuth2Strategy = require("passport-azure-ad-oauth2").Strategy;
const passport = require("../routes/userRouter");
const { CLIENT_ID, CLIENT_SECRET, REDIRECT_URI, TENANT_ID, TOKEN } =
  process.env;

const clientID = CLIENT_ID;
const clientSecret = CLIENT_SECRET;
const callbackURL = REDIRECT_URI; //"http://localhost:5000/callback";
const tenantID = TENANT_ID;

// // Configura la serialización de usuarios
// passport.serializeUser((user, done) => {
//   done(null, user);
// });

// passport.deserializeUser((user, done) => {
//   done(null, user);
// });

const authUpload = (req, res) => {
  console.log("login inicial ");
  return passport.authenticate("azuread-openidconnect");
};

const uploadFiles = async (req, res) => {
  console.log("entro al callback ");
  // Redirige o muestra un mensaje de éxito después de la autenticación exitosa
  res.redirect("/user/api/dashboard");
};

const dashboard = async (req, res) => {
  const { user, tipo } = req.body;
  console.log("tipooo", tipo);
  let token = req.user.accessToken
  let users;
  switch (tipo) {
    case "OCR":
      try {
        if (req.files) {
          const { imagen } = req.files;
          let imgs;
          let imagePath;
          let imageBuffer;
          let uploadPath;
          imgs = req.files.imagen;
          uploadPath = `uploads/${imgs.name}`;
           users =await moveupload(tipo,imgs,uploadPath,user,token) 
        } else {
          res.json({ msg: "suba una imagen" });
        }
      } catch (error) {
        res.json({ error });
      }
      break;
    case "entregable":
      if (req.files) {
        for (const key in req.files) {
          const archivo = req.files[key];
          // console.log("Nombre:", archivo.name);
          // console.log("Tamaño:", archivo.size);
          // console.log("Tipo:", archivo.mimetype);
          // Y así sucesivamente con otros atributos específicos del archivo

          try {
            let imgs;
            let imagePath;
            let imageBuffer;
            let uploadPath;
            imgs = archivo;
            uploadPath = `uploads/${archivo.name}`;
            users = await moveupload(tipo,imgs,uploadPath,user,token) 
            // imgs.mv(`${uploadPath}`, (err) => {
            //   if (err) return res.status(500).send(err);
            //   const file = path.join(
            //     __dirname,
            //     "../..",
            //     "uploads",
            //     archivo.name
            //   );

            //   // const file = path.join(__dirname, "../..", "uploads", "tesla.jpg");

            //   const onedrive_folder = `Entregables/${user}`;
            //   // const onedrive_folder = `OCR`;
            //   const onedrive_filename = path.basename(file);
            //   // const accessToken = process.env.ACCESS_TOKEN; // Tu propio token de acceso

            //   fs.readFile(file, function (err, data) {
            //     if (err) {
            //       console.error(err);
            //       return;
            //     }
            //     // console.log(req.user.accessToken)
            //     request.put(
            //       {
            //         url: `https://graph.microsoft.com/v1.0/drive/root:/${onedrive_folder}/${onedrive_filename}:/content`,
            //         headers: {
            //           Authorization: "Bearer " + req.user.accessToken,
            //           // Authorization: "Bearer " + TOKEN,
            //           "Content-Type": "application/json",
            //         },
            //         body: data,
            //       },
            //       async function (err, response, body) {
            //         if (err) {
            //           console.error("aca", err);
            //           return;
            //         }
            //         const accessUrl = JSON.parse(body)["webUrl"];
            //         console.log("URL de acceso:", accessUrl);
            //         users = {
            //           acces_url: accessUrl,
            //           auth: req.isAuthenticated(),
            //         };

            //         eliminar(file);
            //       }
            //     );
            //   });
            //   //TODO este
            // });
          } catch (error) {
            console.error("aca2", err);
            res.json({ error });
          }
        }
      }
      break;

    default:
      break;
  }
  res.send(users);
};



//? funcion para mover el archivo 

const moveupload = (tipo,imgs,uploadPath,user,token) =>{

  imgs.mv(`${uploadPath}`, (err) => {
    if (err) return res.status(500).send(err);
    const file = path.join(__dirname, "../..", "uploads", imgs.name);

    // const file = path.join(__dirname, "../..", "uploads", "tesla.jpg");

    const onedrive_folder = `${tipo}/${user}`;
    // const onedrive_folder = `OCR`;
    const onedrive_filename = path.basename(file);
    // const accessToken = process.env.ACCESS_TOKEN; // Tu propio token de acceso

    fs.readFile(file, function (err, data) {
      if (err) {
        console.error(err);
        return;
      }
      // request.put(
      //   {
      //     url: `https://graph.microsoft.com/v1.0/drive/root:/${onedrive_folder}/${onedrive_filename}:/content`,
      //     headers: {
      //       Authorization: "Bearer " + token,
      //       // Authorization: "Bearer " + TOKEN,
      //       "Content-Type": "application/json",
      //     },
      //     body: data,
      //   },
      //   async function (err, response, body) {
      //     if (err) {
      //       console.error(err);
      //       return;
      //     }
      //     const accessUrl = JSON.parse(body)["webUrl"];
      //     console.log("URL de acceso:", accessUrl);
      //     users = {
      //       acces_url: accessUrl,
      //     };

      //     eliminar(file);
      //     return users;
      //   }
      // );

      // request.put(
      //   {
      //     url: `https://graph.microsoft.com/v1.0/drive/root:/${onedrive_folder}/${onedrive_filename}:/content`,
      //     headers: {
      //       Authorization: "Bearer " + token,
      //       "Content-Type": "application/json",
      //     },
      //     body: data,
      //   },
      //   async function (err, response, body) {
      //     if (err) {
      //       console.error(err);
      //       return;
      //     }
          
      //     const responseBody = JSON.parse(body);
      //     const accessUrl = responseBody["webUrl"];
      //     console.log("URL de acceso:", accessUrl);
      
      //     // Obtener el driveId
      //     const driveInfoResponse = await request.get({
      //       url: "https://graph.microsoft.com/v1.0/me/drives",
      //       headers: {
      //         Authorization: "Bearer " + token,
      //       },
      //     });
      //     console.log("aca va bien0",driveInfoResponse)
      //     const drives = JSON.parse(driveInfoResponse).value;
      //     const driveId = drives[0].id; // Puedes ajustar esto según tus necesidades
      //     console.log("aca va bien1")
      //     // Compartir el archivo públicamente
      //     const shareResponse = await request.post(
      //       {
      //         url: `https://graph.microsoft.com/v1.0/drives/${driveId}/items/${responseBody.id}/createLink`,
      //         headers: {
      //           Authorization: "Bearer " + token,
      //           "Content-Type": "application/json",
      //         },
      //         body: JSON.stringify({
      //           type: "view", // Puedes cambiar el tipo según tus necesidades
      //           scope: "anonymous",
      //         }),
      //       }
      //     );
      //  console.log("aca va bien2")
      //     const shareResponseBody = JSON.parse(shareResponse);
      //     const accessUrlShared = shareResponseBody.link.webUrl;
      //     console.log("URL de acceso compartida:", accessUrlShared);
      
      //     eliminar(file);
      //     return users;
      //   }
      // );
   

      const uploadOptions = {
        url: `https://graph.microsoft.com/v1.0/drive/root:/${onedrive_folder}/${onedrive_filename}:/content`,
        headers: {
          Authorization: "Bearer " + token,
          "Content-Type": "application/json",
        },
        body: data,
      };
      
      // Subir el archivo a OneDrive
      request.put(uploadOptions, async function (err, response, body) {
        if (err) {
          console.error(err);
          return;
        }
      
        const responseBody = JSON.parse(body);
        const itemId = responseBody.id;
      
        // Compartir el archivo de OneDrive públicamente
        const shareOptions = {
          url: `https://graph.microsoft.com/v1.0/me/drive/items/${itemId}/createLink`,
          headers: {
            Authorization: "Bearer " + token,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            type: "view",
            scope: "anonymous",
          }),
        };
      
        request.post(shareOptions, function (err, response, shareBody) {
          if (err) {
            console.error(err);
            return;
          }
      
          const sharedResponse = JSON.parse(shareBody);
          const sharedUrl = sharedResponse.link.webUrl;
          console.log("URL de acceso compartida:", sharedUrl);
          return sharedUrl;
        });
      });
   
    });
    //TODO este
  });
}


//! Eliminar archivo en uploads

const eliminar = (file) => {
  if (fs_extra.existsSync(file)) {
    fs_extra.unlink(file);
  } else {
    console.log("El archivo no existe:", file);
  }
};



// Middleware para proteger rutas
function ensureAuthenticated(req, res, next) {
  console.log(req.isAuthenticated());
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect("/user/api/callback");
}

module.exports = { authUpload, uploadFiles, dashboard, ensureAuthenticated };
