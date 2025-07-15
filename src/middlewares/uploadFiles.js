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
const { clearScreenDown } = require("readline");
const clientID = CLIENT_ID;
const clientSecret = CLIENT_SECRET;
const callbackURL = REDIRECT_URI; //"http://localhost:5000/callback";
const tenantID = TENANT_ID;

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
  let { user, tipo, token, ActualizarEntregable } = req.body;
  let obj_ActualizarEntregable = {};

  if (ActualizarEntregable) {
    obj_ActualizarEntregable = JSON.parse(ActualizarEntregable);
  }
console.log(SaveDatos, "datossssssssssssssssss")
return
  try {
    if (!req.files || Object.keys(req.files).length === 0) {
      return res.status(400).json({ msg: "Debe subir al menos un archivo" });
    }

    const SaveDatos = { ...obj_ActualizarEntregable };
   
   
    const campos = {
      imagenOCR: "URLArchivo",
      imagenRUT: "URLRUT",
      imagenOTRO: "URLOTRO",
    };

    // 👉 Inicializar todos los campos en blanco
    for (const key in campos) {
      SaveDatos[campos[key]] = "";
    }

    for (const key in campos) {
      if (req.files[key]) {
        const archivo = req.files[key];
        const archivos = Array.isArray(archivo) ? archivo : [archivo];

        for (const archivoIndividual of archivos) {
          const uploadPath = `uploads/${archivoIndividual.name}`;

          const url = await moveupload(
            tipo,
            archivoIndividual,
            uploadPath,
            user,
            token,
            archivoIndividual.name
          );

          // ✅ Guardar la URL
          SaveDatos[campos[key]] = url;

          // ✅ Número de entregable si aplica
          if (tipo === "entregable" && key === "imagenOCR") {
            SaveDatos.NumeroEntregable = archivoIndividual.name.split("-")[0];
          }
        }
      }
    }

    await insertInto(SaveDatos, tipo);

    res.send("archivos enviados correctamente");
  } catch (error) {
    console.error("Error en dashboard:", error);
    res.status(500).json({ error });
  }
};



const moveupload = (
  tipo,
  imgs,
  uploadPath,
  user,
  token,
  archivo
) => {
  return new Promise((resolve, reject) => {
    imgs.mv(uploadPath, (err) => {
      if (err) {
        console.error("Error al mover archivo:", err);
        return reject(err);
      }

      const file = path.join(__dirname, "../..", "uploads", imgs.name);
      const nomuser = user.split(" ").join("_").normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      const fechaActual = new Date();
      const añoActual = fechaActual.getFullYear();
      const mesFormateado = (fechaActual.getMonth() + 1).toString().padStart(2, "0");

      const onedrive_folder = tipo === "OCR"
        ? `CONTABILIDAD/Recibos_Caja/${añoActual}/${mesFormateado}/${nomuser}`
        : `GESTION PROYECTO/${nomuser}/${añoActual}/${mesFormateado}`;

      const onedrive_filename = path.basename(file);

      fs.readFile(file, (err, data) => {
        if (err) {
          console.error("Error al leer archivo:", err);
          return reject(err);
        }

        const uploadOptions = {
          url: `https://graph.microsoft.com/v1.0/drive/root:/${onedrive_folder}/${onedrive_filename}:/content`,
          headers: {
            Authorization: "Bearer " + token,
            "Content-Type": "application/json",
          },
          body: data,
        };

        request.put(uploadOptions, (err, response, body) => {
          if (err) {
            console.error("Error en subida a OneDrive:", err);
            return reject(err);
          }

          const responseBody = JSON.parse(body);
          const driveId = responseBody.parentReference.driveId;
          const itemId = responseBody.id;

          const shareOptions = {
            url: `https://graph.microsoft.com/v1.0/drives/${driveId}/items/${itemId}/createLink`,
            headers: {
              Authorization: "Bearer " + token,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ type: "view", scope: "anonymous" }),
          };

          request.post(shareOptions, (err, response, shareBody) => {
            if (err) {
              console.error("Error al crear enlace público:", err);
              return reject(err);
            }

            const sharedResponse = JSON.parse(shareBody);
            if (sharedResponse.link && sharedResponse.link.webUrl) {
              const sharedUrl = sharedResponse.link.webUrl;
              eliminar(file); // Limpieza local
              resolve(sharedUrl);
            } else {
              reject("No se pudo obtener la URL compartida.");
            }
          });
        });
      });
    });
  });
};








const insertInto = async (data, tipo) => {
  if (!data) return;
console.log(data, "ESTO ES LO QUE VOY A GUARDAR")
  // Declarar values fuera del switch
  const values = {
    SKU_Proyecto: data.SKU_Proyecto ?? "", // [SKU_Proyecto]
    NitCliente: data.NitCliente ?? "", // [NitCliente]
    idNodoProyecto: data.idNodoProyecto ?? 0, // [idNodoProyecto]
    idProceso: data.idProceso ?? 0, // [idProceso]
    N_DocumentoEmpleado: data.N_DocumentoEmpleado ?? "", // [N_DocumentoEmpleado]
    Nombre_Empleado: data.Nombre_Empleado ?? "", // [Nombre_Empleado]
    NumeroComprobante: data.NumFactura ?? "", // [NumeroComprobante]
    URLArchivo: data.URLArchivo ?? "", // [URLArchivo]
    Fecha: data.Fecha ?? "null", // [Fecha]
    FechaComprobante: data.FechaComprobante ?? null, // [FechaComprobante]
    ValorComprobante: parseFloat(data.ValorComprobante) || 0, // [ValorComprobante]
    NitComprobante: data.NitComprobante ?? "", // [NitComprobante]
    NombreComprobante: data.NombreComprobante ?? "", // [NombreComprobante]
    CiudadComprobante: data.CiudadComprobante ?? "", // [CiudadComprobante]
    Direccion: data.Direccion ?? "", // [DireccionComprobante]
    CCostos: data.CCostos ?? "", // [CCostos]
    idAnticipo: data.idAnticipo ?? 0, // [idAnticipo]
    razon_social: data.razon_social ?? "", // [razon_social]
    impoconsumo: parseFloat(data.ipc) || 0, // [impoconsumo]
    Ica: parseFloat(data.ica) || 0, // [Ica]
    iva: parseFloat(data.iva) || 0, // [iva]
    retefuente: parseFloat(data.retefuente || data.reteFuente) || 0, // [retefuente]
    Sub_Total: parseFloat(data.Sub_Total || data.totalSinIva) || 0, // [Sub_Total]
    Descripcion: data.Descripcion ?? "", // [Descripcion]
    Notas: data.notas ?? data.textoExplicativo ?? "", // [Notas]
    Concepto: data.concepto ?? "", // [Concepto]
    URLArchivoRUT: data.URLRUT ?? "", // [URLArchivoRUT]
    URLArchivoOTROS: data.URLOTRO ?? "", // [URLArchivoOTROS]
    NumeroOrdenCompra: data.OrdenCompra ?? "", // [NumeroOrdenCompra]
    ImpuestoUltraProcesados: parseFloat(data.icui) || 0, // [ImpuestoUltraProcesados]
    CodigoPostal: data.CodigoPostal ?? data.codepostal ?? "", // [CodigoPostal]
  };

  switch (tipo) {
    case "OCR":
      try {
        await sequelize.query(
          `INSERT INTO TBL_SER_ProyectoAnticiposComprobante (
            SKU_Proyecto,
            NitCliente,
            idNodoProyecto,
            idProceso,
            N_DocumentoEmpleado,
            Nombre_Empleado,
            NumeroComprobante,
            URLArchivo,
            Fecha,
            FechaComprobante,
            ValorComprobante,
            NitComprobante,
            NombreComprobante,
            CiudadComprobante,
            DireccionComprobante,
            CCostos,
            idAnticipo,
            razon_social,
            impoconsumo,
            Ica,
            iva,
            retefuente,
            Sub_Total,
            Descripcion,
            Notas,
            Concepto,
            URLArchivoRUT,
            URLArchivoOTROS,
            NumeroOrdenCompra,
            ImpuestoUltraProcesados,
            CodigoPostal
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          {
            replacements: [
              values.SKU_Proyecto,
              values.NitCliente,
              values.idNodoProyecto,
              values.idProceso,
              values.N_DocumentoEmpleado,
              values.Nombre_Empleado,
              values.NumeroComprobante,
              values.URLArchivo,
              values.Fecha,
              values.FechaComprobante,
              values.ValorComprobante,
              values.NitComprobante,
              values.NombreComprobante,
              values.CiudadComprobante,
              values.Direccion,
              values.CCostos,
              values.idAnticipo,
              values.razon_social,
              values.impoconsumo,
              values.Ica,
              values.iva,
              values.retefuente,
              values.Sub_Total,
              values.Descripcion,
              values.Notas,
              values.Concepto,
              values.URLArchivoRUT,
              values.URLArchivoOTROS,
              values.NumeroOrdenCompra,
              values.ImpuestoUltraProcesados,
              values.CodigoPostal,
            ],
          }
        );
        console.log("✅ OCR insertado correctamente");
      } catch (error) {
        console.error("❌ Error al insertar OCR:", error);
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
        console.log(error);
      }
      break;

    default:
      break;
  }
};

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
