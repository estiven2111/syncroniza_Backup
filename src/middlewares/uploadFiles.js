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
  
  let {
    user,
    tipo,
    token,
    ActualizarEntregable,
  } = req.body;
  let obj_ActualizarEntregable = {}
  if (ActualizarEntregable) {
    obj_ActualizarEntregable = JSON.parse(ActualizarEntregable)
  }
  console.log(req.files)
  // if (req.files) {
  //   for (const key in req.files) {
  //     const archivo = req.files[key];
  //   console.log(archivo.name.split("-")[0])
  //   console.log(archivo.name.split("-")[1])
  //   }
  // }
  // let obj = {};
  // if (ActualizarEntregable) {
  //   const {
  //     SKU_Proyecto,
  //     NitCliente,
  //     idNodoProyecto,
  //     idProceso,
  //     N_DocumentoEmpleado,
  //     NumeroEntregable,
  //     Fecha,
  //   } = ActualizarEntregable;

  //   obj = {
  //     SKU_Proyecto,
  //     NitCliente,
  //     idNodoProyecto,
  //     idProceso,
  //     N_DocumentoEmpleado,
  //     NumeroEntregable,
  //     Fecha,
  //   };
  // }

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
  
  console.log("tipooo", tipo);
  // let token = req.user.accessToken;
  // console.log("token en peticion dasboard", token)
  // res.send("ok")
  // return
  let users;
  switch (tipo) {
    case "OCR":
      try {
        if (req.files) {
          for (const key in req.files) {
            const  imagen  = req.files[key];
            console.log( "req.files",imagen)
          let imgs;
          let imagePath;
          let imageBuffer;
          let uploadPath;
          imgs = imagen;
          uploadPath = `uploads/${imgs.name}`;
          users = await moveupload(tipo, imgs, uploadPath, user, token,obj_ActualizarEntregable,imgs.name);
         
         
          }
        
        } else {  
          res.json({ msg: "suba almenos un archivo" }); peticionOcr();
          return
        }
      } catch (error) {
        res.json({ error });
      }
      break;
    case "entregable":
      console.log("entro al case")
      console.log(req.files)
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
            // const token = req.user.accessToken;
            // req.session.accessToken = token;
            // res.cookie(`access_token`, token, { httpOnly: true });
  // const nomcookie = `access_token${email}`
  // const token2 = req.cookies.access_token;
            await moveupload(tipo, imgs, uploadPath, user, token,obj_ActualizarEntregable,archivo.name);
           
          } catch (error) {
            console.error("aca2", error);
            res.json({ error });
          }
        }
      }else{
        console.log("no hay archivos")
        res.json({ msg: "suba almenos un archivo" });
        return
      }
      break;

    default:
      break;
  }
 res.send("archivos enviados correctamente")
};

//? funcion para mover el archivo

const moveupload = (tipo, imgs, uploadPath, user, token,SaveDatos,archivo) => {
  console.log(uploadPath,"   imagen ruta")
  
  
  let sharedUrl
  imgs.mv(`${uploadPath}`, (err) => {
    if (err) {
      console.log("error en mv", err)
      return err
    };
    const file = path.join(__dirname, "../..", "uploads", imgs.name);
const nomuser = user.split(" ").join("_")
  const nomfolder  = nomuser.normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    const onedrive_folder = `${tipo}/${nomfolder}`;
    const onedrive_filename = path.basename(file);
    // const accessToken = process.env.ACCESS_TOKEN; // Tu propio token de acceso

    fs.readFile(file, async function(err, data) {
      if (err) {
        console.error(err); 
        return;
      }
      console.log("aca vamos ");
      const uploadOptions = {
        url: `https://graph.microsoft.com/v1.0/drive/root:/${onedrive_folder}/${onedrive_filename}:/content`,
        headers: {
          Authorization: "Bearer " + token,
          "Content-Type": "application/json",
        },
        body: data,
      };
      // Subir el archivo a OneDrive
      try {
      // console.log("aca vamos 2",uploadOptions);
      await request.put(uploadOptions, async function (err, response, body) {
        if (err) {
          console.error(err);
          return;
        }
       
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
       
       try {
       await request.post(shareOptions, function (err, response, shareBody) {
          if (err) {
            console.log("entro al error: " + err.message)
            console.error(err);
            return;
          }

          const sharedResponse = JSON.parse(shareBody);
          console.log("aca vamos 3");
          if (sharedResponse.link && sharedResponse.link.webUrl) {
             sharedUrl = sharedResponse.link.webUrl;
            console.log("URL de acceso compartida:", sharedUrl);
            if (tipo === "entregable") {
              SaveDatos.NumeroEntregable = archivo.split("-")[0]
            }
            SaveDatos.URLArchivo = sharedUrl
            console.log(SaveDatos)
            insertInto(SaveDatos,tipo)
            eliminar(file);
           
          } else {
            console.log("No se pudo obtener la URL de acceso compartida.");
          }
        });
       } catch (error) {
        console.log("el error es ",error)
       }
      });
    } catch (error) {
      console.log("el error es primer ",error)
    }
    });

  
    //TODO este
  });

};

const insertInto = async(data,tipo) =>{
  console.log(data,"data") 
 switch (tipo) {
  case "OCR":
    
  try {
    await sequelize.query(
      `INSERT INTO TBL_SER_ProyectoAnticiposComprobante
      ([SKU_Proyecto]
      ,[NitCliente]
      ,[idNodoProyecto]
      ,[idProceso]
      ,[N_DocumentoEmpleado]
      ,[Nombre_Empleado]
      ,[NumeroComprobante]
      ,[URLArchivo]
      ,[Fecha]
      ,[FechaComprobante]
      ,[ValorComprobante]
      ,[NitComprobante]
      ,[NombreComprobante]
      ,[CiudadComprobante]
      ,[DireccionComprobante]
      ,[CCostos]
      ,[idAnticipo]
      ,[ipc]
      ,[Sub_Total]
      )
  VALUES
      ('${data.SKU_Proyecto}',
      '${data.NitCliente}',
      ${data.idNodoProyecto},
      ${data.idProceso},
      '${data.N_DocumentoEmpleado}',
      '${data.Nombre_Empleado}',
       '${data.NumeroComprobante}',
       '${data.URLArchivo}',
       '${data.Fecha}',
       '${data.FechaComprobante}',
       ${data.ValorComprobante},
       '${data.NitComprobante}',
        '${data.NombreComprobante}',
        '${data.CiudadComprobante}',
        '${data.DireccionComprobante}',
        '${data.CCostos}',
         '${data.idAnticipo}',
         ${data.ipc},
       ${data.Sub_Total}
       )
  `
    );

  // const datos = await sequelize.query(
  //   `
  // INSERT INTO TBL_SER_ProyectoAnticiposComprobante
  // ([SKU_Proyecto]
  // ,[NitCliente]
  // ,[idNodoProyecto]
  // ,[idProceso]
  // ,[N_DocumentoEmpleado]
  // ,[Nombre_Empleado]
  // ,[NumeroComprobante]
  // ,[URLArchivo]
  // ,[Fecha]
  // ,[FechaComprobante]
  // ,[ValorComprobante]
  // ,[NitComprobante]
  // ,[NombreComprobante]
  // ,[CiudadComprobante]
  // ,[DireccionComprobante]
  // ,[CCostos]
  // ,[idAnticipo]
  // ,[ipc]
  // ,[Sub_Total]
  // )
  // VALUES
  // (
  //   :SKU_Proyecto,
  //   :NitCliente,
  //   :idNodoProyecto,
  //   :idProceso,
  //   :N_DocumentoEmpleado,
  //   :Nombre_Empleado,
  //   :NumeroComprobante,
  //   :URLArchivo,
  //   :Fecha,
  //   :FechaComprobante,
  //   :ValorComprobante,
  //   :NitComprobante,
  //   :NombreComprobante,
  //   :CiudadComprobante,
  //   :DireccionComprobante,
  //   :CCostos,
  //   :idAnticipo,
  //   :ipc,
  //   :Sub_Total
  // )`,
  //   {
  //     replacements: {
  //       SKU_Proyecto: data.SKU_Proyecto,
  //       NitCliente: data.NitCliente,
  //       idNodoProyecto: data.idNodoProyecto,
  //       idProceso: data.idProceso,
  //       N_DocumentoEmpleado: data.N_DocumentoEmpleado,
  //       Nombre_Empleado: data.Nombre_Empleado,
  //       NumeroComprobante: data.NumeroComprobante,
  //       URLArchivo: data.URLArchivo,
  //       Fecha: data.Fecha,
  //       FechaComprobante: data.FechaComprobante,
  //       ValorComprobante: data.ValorComprobante,
  //       NitComprobante: data.NitComprobante,
  //       NombreComprobante: data.NombreComprobante,
  //       CiudadComprobante: data.CiudadComprobante,
  //       DireccionComprobante: data.DireccionComprobante,
  //       CCostos: data.CCostos,
  //       idAnticipo: data.idAnticipo,
  //       ipc: data.ipc,
  //       Sub_Total: data.Sub_Total,
  //     },
  //   }
  // );
   } catch (error) {
    console.log(error)
   }


    break;

    case "entregable":

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
        '${data.nitCliente}',
        ${data.idNodoProyecto},
        ${data.idProceso},
        '${data.DocumentoEmpleado}',
        '${data.NumeroEntregable}',
         '${data.URLArchivo}',
         '${data.Fecha}')
    `
      );
    
    //   await sequelize.query( 
    //     `
    //     UPDATE TBL_SER_EntregablesActividad
    // SET Subido = 1
    // WHERE id_Proceso = ${data.idProceso} and Numero = ${data.NumeroEntregable};
    //     `
    //   )
      
    } catch (error) {
      console.log(error)
    }
      break;
 
  default:
    break;
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
