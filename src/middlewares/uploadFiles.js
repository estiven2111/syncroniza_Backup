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
const currency = require('currency.js');
const authUpload = (req, res) => {
  console.log("login inicial ");
  return passport.authenticate("azuread-openidconnect");
};

const uploadFiles = async (req, res) => {
  console.log("entro al callback ");
  // Redirige o muestra un mensaje de éxito después de la autenticación exitosa
  res.redirect("/user/api/dashboard");
};


// const dashboard = async (req, res) => {
//   let { user, tipo, token, ActualizarEntregable } = req.body;
//   let obj_ActualizarEntregable = {};

//   if (ActualizarEntregable) {
//     obj_ActualizarEntregable = JSON.parse(ActualizarEntregable);
//   }

//   try {
//     if (!req.files || Object.keys(req.files).length === 0) {
//       return res.status(400).json({ msg: "Debe subir al menos un archivo" });
//     }

//     const SaveDatos = { ...obj_ActualizarEntregable };
   
   
//     const campos = {
//       imagenOCR: "URLArchivo",
//       imagenRUT: "URLRUT",
//       imagenOTRO: "URLOTRO",
//     };

//     // 👉 Inicializar todos los campos en blanco
//     for (const key in campos) {
//       SaveDatos[campos[key]] = "";
//     }

//     for (const key in campos) {
//       if (req.files[key]) {
//         const archivo = req.files[key];
//         const archivos = Array.isArray(archivo) ? archivo : [archivo];

//         for (const archivoIndividual of archivos) {
//           const uploadPath = `uploads/${archivoIndividual.name}`;

//           const url = await moveupload(
//             tipo,
//             archivoIndividual,
//             uploadPath,
//             user,
//             token,
//             archivoIndividual.name
//           );

//           // ✅ Guardar la URL
//           SaveDatos[campos[key]] = url;

//           // ✅ Número de entregable si aplica
//           if (tipo === "entregable" && key === "imagenOCR") {
//             SaveDatos.NumeroEntregable = archivoIndividual.name.split("-")[0];
//           }
//         }
//       }
//     }

//     await insertInto(SaveDatos, tipo);

//     res.send("archivos enviados correctamente");
//   } catch (error) {
//     console.error("Error en dashboard:", error);
//     res.status(500).json({ error });
//   }
// };



// const moveupload = (
//   tipo,
//   imgs,
//   uploadPath,
//   user,
//   token,
//   archivo
// ) => {
//   return new Promise((resolve, reject) => {
//     imgs.mv(uploadPath, (err) => {
//       if (err) {
//         console.error("Error al mover archivo:", err);
//         return reject(err);
//       }

//       const file = path.join(__dirname, "../..", "uploads", imgs.name);
//       const nomuser = user.split(" ").join("_").normalize("NFD").replace(/[\u0300-\u036f]/g, "");
//       const fechaActual = new Date();
//       const añoActual = fechaActual.getFullYear();
//       const mesFormateado = (fechaActual.getMonth() + 1).toString().padStart(2, "0");

//       const onedrive_folder = tipo === "OCR"
//         ? `CONTABILIDAD/Recibos_Caja/${añoActual}/${mesFormateado}/${nomuser}`
//         : `GESTION PROYECTO/${nomuser}/${añoActual}/${mesFormateado}`;

//       const onedrive_filename = path.basename(file);

//       fs.readFile(file, (err, data) => {
//         if (err) {
//           console.error("Error al leer archivo:", err);
//           return reject(err);
//         }

//         const uploadOptions = {
//           url: `https://graph.microsoft.com/v1.0/drive/root:/${onedrive_folder}/${onedrive_filename}:/content`,
//           headers: {
//             Authorization: "Bearer " + token,
//             "Content-Type": "application/json",
//           },
//           body: data,
//         };

//         request.put(uploadOptions, (err, response, body) => {
//           if (err) {
//             console.error("Error en subida a OneDrive:", err);
//             return reject(err);
//           }

//           const responseBody = JSON.parse(body);
//           const driveId = responseBody.parentReference.driveId;
//           const itemId = responseBody.id;

//           const shareOptions = {
//             url: `https://graph.microsoft.com/v1.0/drives/${driveId}/items/${itemId}/createLink`,
//             headers: {
//               Authorization: "Bearer " + token,
//               "Content-Type": "application/json",
//             },
//             body: JSON.stringify({ type: "view", scope: "anonymous" }),
//           };

//           request.post(shareOptions, (err, response, shareBody) => {
//             if (err) {
//               console.error("Error al crear enlace público:", err);
//               return reject(err);
//             }

//             const sharedResponse = JSON.parse(shareBody);
//             if (sharedResponse.link && sharedResponse.link.webUrl) {
//               const sharedUrl = sharedResponse.link.webUrl;
//               eliminar(file); // Limpieza local
//               resolve(sharedUrl);
//             } else {
//               reject("No se pudo obtener la URL compartida.");
//             }
//           });
//         });
//       });
//     });
//   });
// };


const dashboard = async (req, res) => {
  let { user, tipo, token, ActualizarEntregable } = req.body;
  let obj_ActualizarEntregable = {};

  if (ActualizarEntregable) {
    obj_ActualizarEntregable = JSON.parse(ActualizarEntregable);
  }

  try {
    if (!req.files || Object.keys(req.files).length === 0) {
      return res.status(400).json({ msg: "Debe subir al menos un archivo" });
    }

    const SaveDatos = { ...obj_ActualizarEntregable };

    if (tipo === "OCR") {
      // 👉 Procesamiento especial para OCR (campos específicos)
      const campos = {
        imagenOCR: "URLArchivo",
        imagenRUT: "URLRUT",
        imagenOTRO: "URLOTRO",
      };

      // Inicializar campos
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

            SaveDatos[campos[key]] = url;
          }
        }
      }
      await insertInto(SaveDatos, tipo);
    } else if (tipo === "entregable") {
      // 👉 Procesamiento para entregables (archivos generales)
      for (const key in req.files) {
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

          // Extraer NúmeroEntregable del nombre del archivo
          SaveDatos.NumeroEntregable = archivoIndividual.name.split("-")[0];
          SaveDatos.URLArchivo = url;
          await insertInto(SaveDatos, tipo);
        }
      }
    }

    
    res.send("archivos enviados correctamente");
  } catch (error) {
    console.error("Error en dashboard:", error);
    res.status(500).json({ error });
  }
};

// Función auxiliar para subir archivo a OneDrive
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





function parseMoney(value) {
  if (value === null || value === undefined) return 0;

  let str = String(value).trim();

  if (!str) return 0;

  // 1️⃣ Eliminar todo lo que no sea número, punto, coma o signo negativo
  str = str.replace(/[^0-9.,-]/g, '');

  // 2️⃣ Guardar si es negativo
  const isNegative = str.includes('-');
  str = str.replace(/-/g, '');

  const lastComma = str.lastIndexOf(',');
  const lastDot = str.lastIndexOf('.');

  let decimalSeparator = null;

  // 3️⃣ Detectar separador decimal real (el último que aparezca)
  if (lastComma > lastDot) {
    decimalSeparator = ',';
  } else if (lastDot > lastComma) {
    decimalSeparator = '.';
  }

  if (decimalSeparator !== null) {
    const parts = str.split(decimalSeparator);
    const decimals = parts.pop(); // última parte es decimal
    const integer = parts.join('').replace(/[.,]/g, '');
    str = integer + '.' + decimals;
  } else {
    // No hay decimal real → quitar todos los separadores
    str = str.replace(/[.,]/g, '');
  }

  let number = Number(str);

  if (isNaN(number)) return 0;

  if (isNegative) number *= -1;

  return number;
}

function parseMoneytexto(value) {
  if (value === null || value === undefined) return "";

  let str = String(value).trim();

  // 1️⃣ Limpiar todo excepto números, coma, punto y signo negativo
  str = str.replace(/[^0-9.,-]/g, '');
  if (!str) return "";

  const commaCount = (str.match(/,/g) || []).length;
  const dotCount = (str.match(/\./g) || []).length;

  let numericValue;

  // ==============================
  // 🔎 DETECCIÓN DE FORMATO ORIGINAL
  // ==============================

  // 🟢 Caso US: 380,000.00
  if (commaCount >= 1 && dotCount === 1 && str.lastIndexOf('.') > str.lastIndexOf(',')) {
    numericValue = str.replace(/,/g, '');
  }

  // 🟢 Caso Latino: 380.000,00
  else if (dotCount >= 1 && commaCount === 1 && str.lastIndexOf(',') > str.lastIndexOf('.')) {
    numericValue = str.replace(/\./g, '').replace(',', '.');
  }

  // 🟢 Solo comas como miles
  else if (commaCount > 1 && dotCount === 0) {
    numericValue = str.replace(/,/g, '');
  }

  // 🟢 Solo puntos como miles
  else if (dotCount > 1 && commaCount === 0) {
    numericValue = str.replace(/\./g, '');
  }

  // 🟢 Caso ambiguo: 359.900
  else if (dotCount === 1 && commaCount === 0) {
    const parts = str.split('.');
    if (parts[1].length === 3) {
      numericValue = parts.join('');
    } else {
      numericValue = str;
    }
  }

  // 🟢 Número simple
  else {
    numericValue = str.replace(/[.,]/g, '');
  }

  // ==============================
  // 🔢 CONVERTIR A NÚMERO
  // ==============================

  const number = Number(numericValue);
  if (isNaN(number)) return "";

  // Detectar si realmente tenía decimales distintos de 00
  const decimalMatch = numericValue.match(/\.(\d+)/);
  const hasRealDecimals = decimalMatch && decimalMatch[1] !== "00";

  // ==============================
  // 🇺🇸 FORMATO FINAL (COMA miles / PUNTO decimales)
  // ==============================

  if (hasRealDecimals) {
    return number.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  } else {
    return number.toLocaleString('en-US', {
      maximumFractionDigits: 0
    });
  }
}

function parseMoney(value) {
  if (value === null || value === undefined) return null;

  let str = String(value).trim();

  // Limpiar todo excepto números, coma, punto y signo negativo
  str = str.replace(/[^0-9.,-]/g, '');
  if (!str) return null;

  const commaCount = (str.match(/,/g) || []).length;
  const dotCount = (str.match(/\./g) || []).length;

  let numericValue;

  // Caso US: 380,000.00
  if (commaCount >= 1 && dotCount === 1 && str.lastIndexOf('.') > str.lastIndexOf(',')) {
    numericValue = str.replace(/,/g, '');
  }

  // Caso Latino: 380.000,00
  else if (dotCount >= 1 && commaCount === 1 && str.lastIndexOf(',') > str.lastIndexOf('.')) {
    numericValue = str.replace(/\./g, '').replace(',', '.');
  }

  // Solo comas como miles
  else if (commaCount > 1 && dotCount === 0) {
    numericValue = str.replace(/,/g, '');
  }

  // Solo puntos como miles
  else if (dotCount > 1 && commaCount === 0) {
    numericValue = str.replace(/\./g, '');
  }

  // Caso ambiguo: 359.900
  else if (dotCount === 1 && commaCount === 0) {
    const parts = str.split('.');
    if (parts[1].length === 3) {
      numericValue = parts.join('');
    } else {
      numericValue = str;
    }
  }

  // Número simple
  else {
    numericValue = str.replace(/[.,]/g, '');
  }

  const number = Number(numericValue);
  return isNaN(number) ? null : number;
}

const insertInto = async (data, tipo) => {
  if (!data) return;

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
    Fecha: formatToSQLDate(data.Fecha) ?? null, // [Fecha]
    FechaComprobante: formatToSQLDate(data.FechaComprobante) ?? null, // [FechaComprobante]
    ValorComprobante: parseMoney(data.ValorComprobante) || 0, // [ValorComprobante]
    NitComprobante: data.NitComprobante ?? "", // [NitComprobante]
    NombreComprobante: data.NombreComprobante ?? "", // [NombreComprobante]
    CiudadComprobante: data.CiudadComprobante ?? "", // [CiudadComprobante]
    Direccion: data.Direccion ?? "", // [DireccionComprobante]
    CCostos: data.CCostos ?? "", // [CCostos]
    idAnticipo: data?.tarjeta == 0 ? data.idAnticipo:"", // [idAnticipo]
    razon_social: data.razon_social ?? "", // [razon_social]
    impoconsumo: parseMoney(data.ipc) || 0, // [impoconsumo]
    Ica: parseMoney(data.ica) || 0, // [Ica]
    iva: parseMoney(data.iva) || 0, // [iva]
    retefuente: parseMoney(data.reteFuente) || 0, // [retefuente]
    Sub_Total: parseMoney(data.Sub_Total || data.totalSinIva) || 0, // [Sub_Total]
    Descripcion: data.Descripcion ?? "", // [Descripcion]
    Notas: data.notas ?? data.textoExplicativo ?? "", // [Notas]
    Concepto: data.concepto ?? "", // [Concepto]
    URLArchivoRUT: data.URLRUT ?? "", // [URLArchivoRUT]
    URLArchivoOTROS: data.URLOTRO ?? "", // [URLArchivoOTROS]
    NumeroOrdenCompra: data.OrdenCompra ?? "", // [NumeroOrdenCompra]
    ImpuestoUltraProcesados: parseMoney(data.icui) || 0, // [ImpuestoUltraProcesados]
    CodigoPostal: data.CodigoPostal ?? data.codepostal ?? "", // [CodigoPostal]
    idtarjeta: data?.tarjeta === 1 ? data.idAnticipo : "" ,// [tarjeta]
    idTipoTransaccion: data.tipoTransaccion ? data.tipoTransaccion : "" // [idTipoTransaccion]
   
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
            CodigoPostal,
            IdTarjetaPrepago,
            idTipoTransaccion
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
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
              values.idtarjeta,
              values.idTipoTransaccion,
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

function formatToSQLDate(dateString) {
  if (!dateString) return null;

  // Si ya viene en formato ISO, no tocarla
  if (dateString.includes('-')) return dateString;

  const [day, month, yearAndTime] = dateString.split('/');
  const [year, time] = yearAndTime.includes(' ')
    ? yearAndTime.split(' ')
    : [yearAndTime, '00:00:00'];

  return `${year}-${month}-${day} ${time}`;
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
