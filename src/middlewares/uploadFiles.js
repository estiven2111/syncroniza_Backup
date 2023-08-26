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
const { sequelize } = require("../db");
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
  const {
    user,
    tipo,
    SKU_Proyecto,
    NitCliente,
    idNodoProyecto,
    idProceso,
    N_DocumentoEmpleado,
    NumeroEntregable,
    Fecha,
  } = req.body;

  //   const {
  //     SKU_Proyecto,
  //     NitCliente,
  //     idNodoProyecto,
  //     idProceso,
  //     N_DocumentoEmpleado,
  //     NumeroEntregable,
  //     URLArchivo,
  //     Fecha,
  //   } = req.params
  // //ActualizarProyecto
  //TODO creo un objeto con los valores que me llegan por el body
  const objTable = {
    SKU_Proyecto,
    NitCliente,
    idNodoProyecto,
    idProceso,
    N_DocumentoEmpleado,
    NumeroEntregable,
    Fecha
  };
  
  console.log("tipooo", tipo);
  let token = req.user.accessToken;
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
          users = await moveupload(tipo, imgs, uploadPath, user, token);
          console.log("urlssssssssssss",users)
          objTable.URLArchivo = users
          console.log("objetooooooooooo",objTable.URLArchivo)
          // insertInto(objTable)
          res.send("datos guardados")
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
          try {
            let imgs;
            let imagePath;
            let imageBuffer;
            let uploadPath;
            imgs = archivo;
            uploadPath = `uploads/${archivo.name}`;
            users = await moveupload(tipo, imgs, uploadPath, user, token);
            console.log("urlssssssssssss",users)
            objTable.URLArchivo = users
          console.log("objetooooooooooo",objTable.URLArchivo)
          // insertInto(objTable)
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

const moveupload = (tipo, imgs, uploadPath, user, token) => {
  console.log("el token es ", token);
  imgs.mv(`${uploadPath}`, (err) => {
    if (err) return res.status(500).send(err);
    const file = path.join(__dirname, "../..", "uploads", imgs.name);

    const onedrive_folder = `${tipo}/${user}`;
    const onedrive_filename = path.basename(file);
    // const accessToken = process.env.ACCESS_TOKEN; // Tu propio token de acceso

    fs.readFile(file, function (err, data) {
      if (err) {
        console.error(err);
        return;
      }
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
        console.log("aca vamos ");
        const accessUrl = JSON.parse(body)["webUrl"];
        console.log("URL de acceso:", accessUrl);
        const responseBody = JSON.parse(body);
        const driveId = responseBody.parentReference.driveId; // Obtener el driveId
        const itemId = responseBody.id;
        console.log("aca vamos 1");
        // Compartir el archivo de OneDrive públicamente
        const shareOptions = {
          url: `https://graph.microsoft.com/v1.0/drives/${driveId}/items/${itemId}/createLink`,
          headers: {
            Authorization: "Bearer " + token,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            type: "view",
            scope: "anonymous",
          }),
        };
        console.log("aca vamos 2");
        request.post(shareOptions, function (err, response, shareBody) {
          if (err) {
            console.error(err);
            return;
          }

          const sharedResponse = JSON.parse(shareBody);
          console.log("aca vamos 3");
          if (sharedResponse.link && sharedResponse.link.webUrl) {
            const sharedUrl = sharedResponse.link.webUrl;
            console.log("URL de acceso compartida:", sharedUrl);
            eliminar(file);
            return sharedUrl;
          } else {
            console.log("No se pudo obtener la URL de acceso compartida.");
          }
        });
      });
    });
    //TODO este
  });
};

const insertInto = async(data) =>{

 try {
  await sequelize.query(
    `INSERT INTO TBL_SER_ProyectoActividadesEmpleadosEntregables
    ([SKU_Proyecto]
    ,[NitCliente]
    ,[idNodoProyecto]
    ,[idProceso]
    ,[N_DocumentoEmpleado]
    ,[NumeroEntregable]
    ,[URLArchivo]
    ,[Fecha])
VALUES
    ('${data.SKU_Proyecto}',
    '${data.NitCliente}',
    ${data.idNodoProyecto},
    ${data.idProceso},
    '${data.N_DocumentoEmpleado}',
    ${data.NumeroEntregable},
     '${data.URLArchivo}',
     '${data.Fecha}')
`
  );
 } catch (error) {
  console.log(eror)
 }
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
