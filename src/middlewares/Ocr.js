// // const natural = require("natural");
// const sharp = require("sharp");
// const async = require("async");
// const fs = require("fs");
// const fs_extra = require("fs-extra");
// const path = require("path");
// const sleep = require("util").promisify(setTimeout);
// const ComputerVisionClient =
//   require("@azure/cognitiveservices-computervision").ComputerVisionClient;
// const ApiKeyCredentials = require("@azure/ms-rest-js").ApiKeyCredentials;
// const { key, endpoint, apiKey, apiUrl } = process.env;
// const axios = require("axios");
// // const nlp = require('compromise');
// // const { NlpManager } = require("node-nlp");
// //const brain = require("brain.js");

// const computerVisionClient = new ComputerVisionClient(
//   new ApiKeyCredentials({ inHeader: { "Ocp-Apim-Subscription-Key": key } }),
//   endpoint
// );

// async function Ocr(req, res) {
//   const { latitud, longitud } = req.body;

//   const geoUrl = `https://nominatim.openstreetmap.org/reverse?lat=${latitud}&lon=${longitud}&format=json`;

//   const response = await axios.get(geoUrl, {
//     headers: {
//       "User-Agent": "TuAplicacion/1.0 (tu_email@ejemplo.com)", // Cambia esto para identificar tu aplicación
//     },
//   });

//   const { token } = req.body;
//   console.log(latitud, longitud);
//   let imgs;
//   let imagePath;
//   let imageBuffer;
//   let uploadPath;
//   let objeto;
//   imgs = req.files.imagen;
//   if (imgs) {
//     console.log("si hay imagen");
//   } else {
//     return res.send("debes subir una imagen");
//   }
//   uploadPath = `uploads/${imgs.name}`;
//   imgs.mv(`${uploadPath}`, (err) => {
//     if (err) {
//       console.log("el error: " + err.message);
//       return;
//       //  res.status(500).send(err)
//     }

//     if (uploadPath.split(".").pop("") === "pdf") {
//       readOcr(uploadPath);
//     } else {
//       const anchoDeseado = 800;
//       const altoDeseado = 600;

//       // Utilizar una promesa para esperar a que la imagen se guarde
//       const resizeImage = new Promise((resolve, reject) => {
//         sharp(uploadPath)
//           .resize(anchoDeseado, altoDeseado, { fit: "inside" })
//           .toFile(`uploads/imagenrender.png`, (err) => {
//             if (err) {
//               console.error("Error al redimensionar la imagen:", err);
//               reject(err);
//             } else {
//               console.log("Imagen redimensionada correctamente.");
//               resolve();
//             }
//           });
//       });
//       // Continuar con el resto de la lógica después de que la imagen se haya redimensionado
//       resizeImage
//         .then(() => {
//           readOcr("uploads/imagenrender.png");
//         })
//         .catch((error) => {
//           // Manejar cualquier error que ocurra durante el redimensionamiento de la imagen
//           res.status(500).send("Error al redimensionar la imagen.");
//         });
//     }
//   });

//   const readOcr = (paths) => {
//     try {
//       let municipio;
//       let codepostal;
//       imagePath = paths;
//       imageBuffer = fs.readFileSync(paths);
//       let texto = "";
//       let texto1 = [];
//       let cont = 0;
//       async.series(
//         [
//           async function () {
//             console.log("-------------------------------------------------");
//             console.log("READ PRINTED, HANDWRITTEN TEXT AND PDF");
//             console.log();

//             console.log(
//               "Read printed text from local file:",
//               imagePath.split("/").pop()
//             );

//             const geoUrl = `https://nominatim.openstreetmap.org/reverse?lat=${latitud}&lon=${longitud}&format=json`;

//             try {
//               const ubicacion = await axios.get(geoUrl, {
//                 headers: {
//                   "User-Agent": "TuAplicacion/1.0 (tu_email@ejemplo.com)", // Cambia esto para identificar tu aplicación
//                 },
//               });
//               codepostal = ubicacion.data.address.postcode;
//               if (ubicacion.data.address.city) {
//                 municipio = ubicacion.data.address.city;
//               }
//               if (ubicacion.data.address.county) {
//                 municipio = ubicacion.data.address.county;
//               }
//               if (ubicacion.data.address.town) {
//                 municipio = ubicacion.data.address.town;
//               }
//             } catch (error) {}

//             const printedResult = await readTextFromStream(
//               computerVisionClient,
//               imageBuffer
//             );
//             printRecText(printedResult);

//             async function readTextFromStream(client, image) {
//               let result = await client.readInStream(image);
//               let operation = result.operationLocation.split("/").slice(-1)[0];

//               while (result.status !== "succeeded") {
//                 await sleep(1000);
//                 result = await client.getReadResult(operation);
//               }
//               return result.analyzeResult.readResults;
//             }

//             async function printRecText(readResults) {
//               console.log("Recognized text:");

//               for (const page in readResults) {
//                 console.log("page:" + page);
//                 if (readResults.length > 1) {
//                   console.log(`==== Page: ${page}`);
//                 }
//                 const result = readResults[page];
//                 if (result.lines.length) {
//                   for (const line of result.lines) {
//                     texto += line.words.map((w) => w.text).join(" ") + " ";
//                     // console.log("e",texto)
//                   }
//                 } else {
//                   //!  CENTRO DE COSTOS EN DONDE LLEGA
//                   objeto = {
//                     nit: "",
//                     numFact: "",
//                     doc: "",
//                     total: "",
//                     totalSinIva: "",
//                     nombre: "",
//                     razon_social: "",
//                     fecha: "",
//                     iva: "",
//                     rete: "",
//                     ipc: "",
//                     concepto: "",
//                     municipio: municipio,
//                     codepostal: codepostal,
//                   };
//                 }
//               }
//             }
//           },
//         ],
//         async (err) => {
//           if (err) {
//             console.error(err);
//             res.status(500).json({ error: "Error al procesar la imagen" });
//           } else {
//             try {
//               objeto = {
//                 nit: "",
//                 numFact: "",
//                 doc: "",
//                 total: "",
//                 totalSinIva: "",
//                 nombre: "",
//                 razon_social: "",
//                 fecha: "",
//                 iva: "",
//                 rete: "",
//                 ipc: "",
//                 concepto: "",
//                 ica: "",
//                 municipio: municipio,
//                 codepostal: codepostal,
//               };
//               const textoEnMinusculas = texto.toLowerCase();
//               console.log(textoEnMinusculas);

//               const datos = await extraerEntidades(textoEnMinusculas);
//               console.log(typeof datos, "datooooooooooss", datos);

//               objeto.nit = datos.nit;
//               objeto.numFact = datos.numFact;
//               objeto.total = datos.total;
//               objeto.totalSinIva = datos.totalSinIva;
//               objeto.razon_social = datos.razon_social;
//               objeto.fecha = datos.fecha;
//               objeto.iva = datos.iva;
//               objeto.rete = datos.rete;
//               objeto.ipc = datos.ipc;
//               objeto.concepto = datos.Concepto;
//               objeto.ica = datos.ica;
//             } catch (error) {
//               console.log(error);
//             }
//             //? ELIMINACION DE IMAGEN TEMPORAL
//             const pathnomimg = path.join(
//               __dirname,
//               "../..",
//               "uploads",
//               imgs.name
//             );
//             const pathnomimgR = path.join(
//               __dirname,
//               "../..",
//               "uploads",
//               "imagenrender.png"
//             );
//             eliminar(pathnomimg);
//             eliminar(pathnomimgR);
//             if (objeto.total) {
//               console.log(objeto.total);
//               objeto.total = parseFloat(objeto.total);
//             }
//             if (objeto.totalSinIva) {
//               objeto.totalSinIva = parseFloat(objeto.totalSinIva);
//             }
//             console.log(objeto);
//             res.json(objeto);
//           }
//         }
//       );
//     } catch (error) {
//       res.json("error en lectura del archivo");
//     }
//   };

//   async function extraerEntidades(texto) {
//     try {
//       const response = await axios.post(
//         apiUrl,
//         {
//           messages: [
//             {
//               role: "user",
//               content: `
//              Instrucciones para extraer información de la factura:

// Formato de salida:

// Cada dato debe estar en el formato [campo]: [dato].
// Si el dato no está presente en la factura, el valor debe quedar vacío: "".
// Ejemplo: iva: "".
// Reglas para los valores monetarios (importante):

// Todos los valores monetarios deben ser enteros.
// Elimina cualquier parte decimal.
// Por ejemplo:
// Dado: 65430.25.
// Resultado correcto: 65430.
// Incorrecto: 6543025 o 65431.
// No incluyas el símbolo $ ni separadores de miles (como comas o puntos).
// Esta regla aplica a los siguientes campos:
// iva
// totalSinIva
// total
// ipc
// ica
// rete
// Diferenciación de Subtotal, IVA y Total:

// totalSinIva (Subtotal): Es el valor total sin incluir impuestos como el IVA.
// total: Es el valor final, que incluye el IVA y otros impuestos.
// iva: Es el valor específico del IVA registrado en la factura.
// Nota importante:
// Si el campo del subtotal no está en la factura, no lo infieras ni lo calcules.
// Si el IVA o el total no están presentes en la factura, déjalos como "".
// Manejo de fechas:

// El formato de la fecha debe ser siempre DD/MM/YYYY.
// Si la fecha tiene texto adicional, conviértela al formato especificado.
// Ejemplo: 5 de enero de 2025 → 05/01/2025.
// Concepto (producto o servicio):

// Si la factura describe un producto, escribe "producto".
// Si la factura describe un servicio, escribe "servicio".
// Si no hay información sobre el concepto, deja el campo vacío: concepto: "".
// Formato de los campos y nombres específicos:
// Usa los siguientes nombres de campos:

// nit: NIT del emisor.
// razon_social: Razón social del emisor.
// destinatario: Destinatario adquiriente.
// nit_destinatario: NIT del destinatario.
// totalSinIva: Subtotal de la factura (sin incluir IVA).
// iva: Valor del IVA.
// total: Total de la factura (incluyendo IVA).
// fecha: Fecha de la factura.
// ipc: Valor del impuesto al consumo (ipoconsumo).
// ica: Valor de la rete ICA.
// rete: Valor de la retefuente.
// numFact: Número de la factura.
// concepto: Tipo de concepto (producto o servicio).

//                 Texto: "${texto}"`,
//             },
//           ],
//           max_tokens: 150,
//           temperature: 0,
//         },
//         {
//           headers: {
//             "Content-Type": "application/json",
//             "api-key": apiKey,
//           },
//         }
//       );

//       if (response.data.choices && response.data.choices[0].message.content) {
//         const completionText = response.data.choices[0].message.content.trim();
//         return convertirTextoAObjeto(completionText);
//       } else {
//         console.error("Estructura inesperada en la respuesta de la API.");
//         return null;
//       }
//     } catch (error) {
//       console.error("Error al extraer entidades:", error);
//       return null;
//     }
//   }

//   function convertirTextoAObjeto(texto) {
//     console.log("inteligencia aaaaaaaaaaaaaaa", texto);
//     const objeto = {};
//     const lineas = texto.split("\n"); // Dividir por líneas

//     lineas.forEach((linea) => {
//       const lineaLimpia = linea.replace(/^- /, "").trim();
//       const [clave, valor] = lineaLimpia
//         .split(":")
//         .map((parte) => parte.trim()); // Separar clave y valor

//       if (clave && valor !== undefined) {
//         objeto[clave] = valor.replace(/^"|"$/g, ""); // Agregar clave y limpiar comillas extra
//       }
//     });

//     return objeto;
//   }

//   const eliminar = async (file) => {
//     if (fs_extra.existsSync(file)) {
//       await fs_extra.unlink(file);
//     } else {
//       console.log("El archivo no existe:", file);
//     }
//   };

//   const ubicacion = async () => {
//     try {
//     } catch (error) {
//       console.error("Error al obtener el código postal:", error.message);
//       return null;
//     }
//   };
// }

// module.exports = Ocr;

//todo

// const fs = require("fs");
// const fs_extra = require("fs-extra");
// const path = require("path");
// const axios = require("axios");
// const sharp = require("sharp");
// const { ComputerVisionClient } = require("@azure/cognitiveservices-computervision");
// const { ApiKeyCredentials } = require("@azure/ms-rest-js");

// const { apiKey, apiUrl, key, endpoint } = process.env;

// const computerVisionClient = new ComputerVisionClient(
//   new ApiKeyCredentials({ inHeader: { "Ocp-Apim-Subscription-Key": key } }),
//   endpoint
// );

// async function Ocr(req, res) {
//   const { latitud, longitud } = req.body;
//   const { imagen } = req.files;

//   if (!imagen) return res.status(400).send("Debes subir una imagen o PDF");

//   const uploadPath = `uploads/${imagen.name}`;
//   await imagen.mv(uploadPath);

//   const extension = path.extname(imagen.name).toLowerCase();
//   let textoPlano = "";
//   let base64Image = "";

//   // 🗺 Geolocalización
//   let municipio = "";
//   let codepostal = "";

//   try {
//     const geoUrl = `https://nominatim.openstreetmap.org/reverse?lat=${latitud}&lon=${longitud}&format=json`;
//     const response = await axios.get(geoUrl, {
//       headers: {
//         "User-Agent": "TuAplicacion/1.0 (tu_email@ejemplo.com)",
//       },
//     });

//     const addr = response.data.address;
//     codepostal = addr.postcode || "";
//     municipio = addr.city || addr.county || addr.town || "";
//   } catch (err) {
//     console.warn("No se pudo obtener ubicación:", err.message);
//   }

//   // 🧠 Si es PDF → usar OCR para extraer texto plano
//   if (extension === ".pdf") {
//     try {
//       const fileBuffer = fs.readFileSync(uploadPath);
//       const result = await computerVisionClient.readInStream(fileBuffer);
//       const operationId = result.operationLocation.split("/").slice(-1)[0];

//       let pollResult;
//       do {
//         await new Promise((r) => setTimeout(r, 1000));
//         pollResult = await computerVisionClient.getReadResult(operationId);
//       } while (pollResult.status !== "succeeded");

//       const lines = pollResult.analyzeResult.readResults.flatMap((r) =>
//         r.lines.map((line) => line.text)
//       );
//       textoPlano = lines.join(" ");
//     } catch (error) {
//       console.error("❌ Error al procesar PDF:", error.message);
//       await eliminar(uploadPath);
//       return res.status(500).json({ error: "Error al extraer texto del PDF" });
//     }
//   } else {
//     // 🧠 Si es imagen → optimizar con Sharp y convertir a base64
//     const optimizedImageBuffer = await sharp(uploadPath)
//       .resize({ width: 1500 })
//       .normalize()
//       .sharpen()
//       .toBuffer();

//     base64Image = optimizedImageBuffer.toString("base64");
//   }

//      const prompt = `
// Extrae la información de la siguiente imagen de factura. Devuelve SOLO el siguiente objeto JSON, sin explicaciones ni texto adicional:

// {
//   "nit": "",
//   "NumFactura": "",
//   "OrdenCompra": "",
//   "doc": "",
//   "total": "",
//   "totalSinIva": "",
//   "nombre": "",
//   "razon_social": "",
//   "fecha": "",
//   "iva": "",
//   "rete": "",
//   "porcentaje_rete": "",
//   "ipc": "",
//   "concepto": "",
//   "ica": "",
//   "municipio": "",
//   "codepostal": ""
// }

// ⚠️ Reglas estrictas:

// 1. Todos los campos deben estar presentes. Si algún dato no está visible en la factura, deja el campo con comillas vacías: "".

// 2. Usa exactamente los nombres de los campos indicados arriba, sin alterarlos.

// 3. Para los valores numéricos:
//    - No uses comas, puntos, decimales ni el símbolo de pesos.
//    - Ejemplo correcto: "19000"
//    - Ejemplo incorrecto: "$19.000,00", "19,000.00", "19000.00"

// 4. El campo "fecha" debe ir en formato DD/MM/YYYY siempre debes ponerlo si lo trae casi todas lo traen.

// 5. El campo "nit" debe contener solo números (sin guiones ni dígito de verificación).

// 6. El campo "concepto" debe ser uno de: "producto", "servicio", "honorario" o "".

// 7. Rete fuente:
//    - Si el valor de la retefuente aparece en la factura (ej: "RETE FUENTE: 37.065,88"), úsalo exactamente como está, limpiando comas, puntos y decimales.
//    - Solo si NO aparece, calcula:
//      - "producto" → 2.5% de "totalSinIva"
//      - "servicio" → 4%
//      - "honorario" → 11%
//    - El resultado se redondea hacia abajo (sin decimales).
//    - El campo "porcentaje_rete" debe reflejar el porcentaje aplicado (ej: "2.5%")

// 8. Si no se puede determinar el concepto, deja "rete" y "porcentaje_rete" vacíos: ""

// 9. No inventes datos. Extrae solo lo que esté visible.

// 10. Devuelve solo el JSON. Sin texto fuera del objeto.

// 11. no pongas los centavos solo deja el valor en pesos colombianos sin comas ni puntos,
//  por ejemplo: "19000" y no "19.000,00" o "$19.000,00 omite los valores .00 ,00 o otro numero despues si es centavos

// 12 pasame la orden de compra de la factura en campo texto no lo omitas si la factura lo trae solo la orden de compra y ponlo en el campo
// que te indique que es el NumFactura ponme ese dato ahi porfavor la orden de compra de la factura

// 13 en el campo de porcentaje_rete debes darme el dato del porcentaje que se aplica a la retefuente,
// por ejemplo: "2.5%" si es un producto, "4%" si es un servicio o "11%" si es un honorario,
//  si no lo trae la factura dejalo vacio con comillas: "".

//  14.si la factura no trae el porcentaje y tu sabes cual es el porcentaje que se aplico por lo que la factura lo trae o no lo traiga y tu lo apliques
//  deacuerdo al concepto agregamelo en el campo dl json en el campo de iva siempre necesito ese valor ahi si la factura no trae el concepto
//  pero trae el iva deduce cual es el porcentaje que se aplico y ponlo en el campo porcentaje_rete pero si trae el concepto y el iva pon el
//  porcentaje que se aplico en cualquier caso sea que traiga el concepto o no o la retencion o no siempre ponlos sea calculado o sea que lo
//  traiga eso si dale prioridad ala factura que si se ve el dato priorices ese dato sino lo tra calculalo eres un contador experto y
//   sabes que hacer dejalo sin el simbolo % solo dame el valor no pongas el simbolo de porcentaje, recuerda no se te olvide el
//   valor de la retefuente si la factura no lo trae aplicalo tu eres un contador experto y sabes que hacer si no lo trae la factura

// 15. dame un campo porcentaje_iva dentro del json y pon el porcentaje que se aplico al iva de la factura,
// por ejemplo: "19%" si es el iva colombiano, si no lo trae la factura pon el que este actualmente vigente en colombia,

// 16. valida la factura si trae el valor del ica debes ponerlo en el campo ica es muy importante valida bien la facutra para
// que no me falte este dato ya si no lo trae la factura ponlo vacio con comillas: "".

// 17. valida la factura si trae el valor del ipc debes ponerlo en el campo ipc revisa bien la factura ya que
// no solo puede llegar como ipc sino tambien como inc o INC tu sabes como puede llegar valida bien toda la factura y ponme este
// valor que es muy importante y si no lo trae la factura ponlo vacio con comillas: "".

// 18. la razon social no es la empresa a la que le facturas es la empresa que te factura a ti, eres contador experto sabes
// cual es la razon social de una empresa y cual es el nit de la empresa que te factura a ti ese es el valor que debes poner

//  19. explicame que hiciste , en el campo explicativo textoExplicativo ingresalo dentro del json y explicame lo que haces como sacas los datos
//  explicamelo cortamente pero siempre explicame que hiciste y como lo hiciste, el porcentaje por que es el 19% que es el iva es por la norma colombiana
//  o por que dice la factura tambien dime por que sacaste el 19% en el campo del iva
// `;

//   // 🎯 Llamar a Azure OpenAI
//   try {
//     const messages = [
//       {
//         role: "system",
//         content: "Eres un experto en contabilidad que extrae datos de facturas de manera exepional sin fallas.",
//       },
//       { role: "user", content: prompt },
//     ];

//     if (base64Image) {
//       messages.push({
//         role: "user",
//         content: [
//           {
//             type: "image_url",
//             image_url: {
//               url: `data:image/png;base64,${base64Image}`,
//             },
//           },
//         ],
//       });
//     } else if (textoPlano) {
//       messages.push({
//         role: "user",
//         content: textoPlano,
//       });
//     }

//     const response = await axios.post(
//       apiUrl,
//       {
//         messages,
//         max_tokens: 800,
//       },
//       {
//         headers: {
//           "Content-Type": "application/json",
//           "api-key": apiKey,
//         },
//       }
//     );

//     const content = response.data.choices[0].message.content.trim();
//     let datos = {};

//     try {
//       const jsonClean = content
//         .replace(/^```json/i, "")
//         .replace(/^```/, "")
//         .replace(/```$/, "")
//         .trim();

//       datos = JSON.parse(jsonClean);
//     } catch (err) {
//       console.error("❌ Error al convertir respuesta en JSON:", err.message);
//       await eliminar(uploadPath);
//       return res.status(400).json({ error: "Formato inválido desde la IA" });
//     }

//     const cleanNumber = (val) =>
//       val && typeof val === "string" ? val.replace(/[^\d]/g, "") : val;

//     const nitLimpio = datos.nit ? datos.nit.split("-")[0] : "";

//     const resultadoFinal = {
//       nit: nitLimpio || "",
//       NumFactura: datos.NumFactura || "",
//       OrdenCompra: datos.OrdenCompra || "",
//       doc: datos.doc || "",
//       total: cleanNumber(datos.total),
//       totalSinIva: cleanNumber(datos.totalSinIva),
//       nombre: datos.nombre || "",
//       razon_social: datos.razon_social || "",
//       fecha: datos.fecha || "",
//       iva: cleanNumber(datos.iva),
//       rete: cleanNumber(datos.rete),
//       porcentaje_rete: datos.porcentaje_rete || "",
//       ipc: cleanNumber(datos.ipc),
//       concepto: datos.concepto || "",
//       ica: cleanNumber(datos.ica),
//       municipio,
//       codepostal,
//       porcentaje_iva: datos.porcentaje_iva || "19",
//       textoExplicativo: datos.textoExplicativo || "",
//     };
//     console.log(resultadoFinal)
//     await eliminar(uploadPath);
//     return res.json(resultadoFinal);
//   } catch (error) {
//     console.error("❌ Error en Azure OpenAI:", error?.response?.data || error.message);
//     await eliminar(uploadPath);
//     return res.status(500).json({ error: "Error al procesar con IA" });
//   }
// }

// async function eliminar(filePath) {
//   if (fs_extra.existsSync(filePath)) {
//     await fs_extra.unlink(filePath);
//   }
// }

// module.exports = Ocr;

//todo ////////////////////////////////////

// const fs = require("fs");
// const fs_extra = require("fs-extra");
// const path = require("path");
// const axios = require("axios");
// const sharp = require("sharp");
// const { ComputerVisionClient } = require("@azure/cognitiveservices-computervision");
// const { ApiKeyCredentials } = require("@azure/ms-rest-js");

// const { apiKey, apiUrl, key, endpoint } = process.env;

// const computerVisionClient = new ComputerVisionClient(
//   new ApiKeyCredentials({ inHeader: { "Ocp-Apim-Subscription-Key": key } }),
//   endpoint
// );

// async function Ocr(req, res) {
//   const { latitud, longitud } = req.body;
//   const { imagen } = req.files;

//   if (!imagen) return res.status(400).send("Debes subir una imagen o PDF");

//   const uploadPath = `uploads/${imagen.name}`;
//   await imagen.mv(uploadPath);

//   const extension = path.extname(imagen.name).toLowerCase();
//   let textoPlano = "";
//   let base64Image = "";

//   try {
//     if (extension === ".pdf") {
//       const fileBuffer = fs.readFileSync(uploadPath);
//       const result = await computerVisionClient.readInStream(fileBuffer);
//       const operationId = result.operationLocation.split("/").slice(-1)[0];

//       let pollResult;
//       do {
//         await new Promise((r) => setTimeout(r, 1000));
//         pollResult = await computerVisionClient.getReadResult(operationId);
//       } while (pollResult.status !== "succeeded");

//       const lines = pollResult.analyzeResult.readResults.flatMap((r) =>
//         r.lines.map((line) => line.text)
//       );
//       textoPlano = lines.join(" ");
//     } else {
//       const optimizedImageBuffer = await sharp(uploadPath)
//         .resize({ width: 1500 })
//         .normalize()
//         .sharpen()
//         .toBuffer();

//       base64Image = optimizedImageBuffer.toString("base64");
//     }

// //     const prompt = `
// // Extrae la información de la siguiente imagen de factura. Devuelve SOLO el siguiente objeto JSON, sin explicaciones ni texto adicional:

// // {
// //   "nit": "",
// //   "NumFactura": "",
// //   "OrdenCompra": "",
// //   "doc": "",
// //   "total": "",
// //   "totalSinIva": "",
// //   "nombre": "",
// //   "razon_social": "",
// //   "fecha": "",
// //   "iva": "",
// //   "rete": "",
// //   "porcentaje_rete": "",
// //   "ipc": "",
// //   "concepto": "",
// //   "ica": "",
// //   "municipio": "",
// //   "codepostal": "",
// //   "porcentaje_iva": "",
// //   "textoExplicativo": "",
// //   "tipo_factura": "",
// //   "direccion_detectada": "",
// //   "ciudad_detectada": ""
// // }

// // Reglas:

// // 20. Determina si la factura es electrónica, formal o comprobante. Usa el campo tipo_factura con uno de estos tres valores: "electronica", "formal", "comprobante".

// // 21. Si encuentras una dirección o ciudad en la factura, extrae el valor en los campos direccion_detectada y ciudad_detectada. Si no se encuentra alguno de estos, deja el campo vacío con comillas: "".

// // 22. Si no se encuentra dirección o ciudad, se usará la geolocalización por latitud y longitud.

// // 23. El resto de reglas son las mismas que ya conoces: formatos numéricos sin puntos ni comas, razon_social es la empresa que factura, etc.
// // `;

// const prompt = `
// Extrae la información de la siguiente imagen de factura. Devuelve SOLO el siguiente objeto JSON, sin explicaciones ni texto adicional:

// {
//   "nit": "",
//   "NumFactura": "",
//   "OrdenCompra": "",
//   "doc": "",
//   "total": "",
//   "totalSinIva": "",
//   "nombre": "",
//   "razon_social": "",
//   "fecha": "",
//   "iva": "",
//   "rete": "",
//   "porcentaje_rete": "",
//   "ipc": "",
//   "concepto": "",
//   "ica": "",
//   "municipio": "",
//   "codepostal": "",
//   "porcentaje_iva": "",
//   "textoExplicativo": "",
//   "tipo_factura": "",
//   "direccion_detectada": "",
//   "ciudad_detectada": ""
// }

// ⚠️ Reglas estrictas:

// 1. Todos los campos deben estar presentes. Si algún dato no está visible en la factura, deja el campo con comillas vacías: "".

// 2. Usa exactamente los nombres de los campos indicados arriba, sin alterarlos.

// 3. Para los valores numéricos:
//    - No uses comas, puntos, decimales ni el símbolo de pesos.
//    - Ejemplo correcto: "19000"
//    - Ejemplo incorrecto: "$19.000,00", "19,000.00", "19000.00"

// 4. El campo "fecha" debe ir en formato DD/MM/YYYY. Si está visible, siempre debes ponerlo.

// 5. El campo "nit" debe contener solo números (sin guiones ni dígito de verificación).

// 6. El campo "concepto" debe ser uno de: "producto", "servicio", "honorario" o "".

// 7. Rete fuente:
//    - Si aparece en la factura (ej: "RETE FUENTE: 37.065,88"), úsalo limpiando comas, puntos y decimales.
//    - Si NO aparece, calcula:
//      - "producto" → 2.5% de "totalSinIva"
//      - "servicio" → 4%
//      - "honorario" → 11%
//    - El resultado debe estar sin decimales y redondeado hacia abajo.
//    - El campo "porcentaje_rete" debe reflejar el porcentaje aplicado (ejemplo: "2.5")

// 8. Si no se puede determinar el concepto, deja "rete" y "porcentaje_rete" vacíos: ""

// 9. No inventes datos. Extrae solo lo que esté visible.

// 10. Devuelve solo el JSON. No incluyas texto fuera del objeto.

// 11. Los valores en pesos deben estar sin centavos, sin puntos ni comas. Ejemplo correcto: "19000".

// 12. La orden de compra debe ir en el campo "OrdenCompra". No la confundas con el número de factura.

// 13. El campo "NumFactura" debe tener el número de factura, no la orden de compra.

// 14. El campo "porcentaje_rete" debe ser el valor numérico del porcentaje aplicado (ej: "4"). Sin el símbolo de porcentaje (%).

// 15. El campo "iva" debe estar presente siempre que se vea en la factura, y si no está, pero el concepto lo implica, calcúlalo como contador experto.

// 16. El campo "porcentaje_iva" debe indicar el porcentaje aplicado al IVA. Ejemplo: "19". Si no se encuentra en la factura, usa el porcentaje vigente en Colombia.

// 17. Si hay un valor de ICA, ponlo en el campo "ica". Si no, déjalo como "".

// 18. Si hay valor de IPC o INC, colócalo en "ipc". Si no hay ninguno, déjalo como "".

// 19. El campo "razon_social" es la empresa que emite la factura, no a quien va dirigida.

// 20. Explica brevemente qué hiciste en "textoExplicativo". Incluye cómo calculaste los valores si fue necesario (ej: porcentaje del IVA, rete, etc.).

// 21. Determina el tipo de factura:
//     - "electronica": si ves timbres electrónicos, códigos QR o CUFE.
//     - "formal": si tiene logo, número, resolución y formato físico tradicional.
//     - "comprobante": si es simple, sin logo, sin datos fiscales completos.
//     Usa el campo "tipo_factura" para poner uno de esos tres valores.

// 22. Si hay dirección y ciudad visibles, ponlas en los campos "direccion_detectada" y "ciudad_detectada". Si no, déjalos como "".

// 23. Si no se encuentra dirección o ciudad, se usará la geolocalización por latitud y longitud fuera del JSON.

// Recuerda, eres un contador experto, extrae solo lo que esté en la factura y realiza los cálculos si es necesario, con precisión contable.
// `;

//     const messages = [
//       {
//         role: "system",
//         content: "Eres un experto en contabilidad que extrae datos de facturas de manera excepcional sin fallas.",
//       },
//       { role: "user", content: prompt },
//     ];

//     if (base64Image) {
//       messages.push({
//         role: "user",
//         content: [
//           {
//             type: "image_url",
//             image_url: {
//               url: `data:image/png;base64,${base64Image}`,
//             },
//           },
//         ],
//       });
//     } else if (textoPlano) {
//       messages.push({
//         role: "user",
//         content: textoPlano,
//       });
//     }

//     const response = await axios.post(
//       apiUrl,
//       {
//         messages,
//         max_tokens: 800,
//       },
//       {
//         headers: {
//           "Content-Type": "application/json",
//           "api-key": apiKey,
//         },
//       }
//     );

//     const content = response.data.choices[0].message.content.trim();
//     let datos = {};

//     try {
//       const jsonClean = content
//         .replace(/^```json/i, "")
//         .replace(/^```/, "")
//         .replace(/```$/, "")
//         .trim();

//       datos = JSON.parse(jsonClean);
//     } catch (err) {
//       console.error("❌ Error al convertir respuesta en JSON:", err.message);
//       await eliminar(uploadPath);
//       return res.status(400).json({ error: "Formato inválido desde la IA" });
//     }

//     // // 📍 Determinar dirección a geolocalizar
// //     let municipio = "";
// //     let codepostal = "";
// //     let direccionGeolocalizar = "";

// //     if (datos.direccion_detectada ) {
// //       direccionGeolocalizar = `${datos.direccion_detectada}, Colombia`;
// //     } else {
// //       direccionGeolocalizar = `${latitud},${longitud}`;
// //     }

// //     try {
// //       const isLatLon = direccionGeolocalizar.includes(",") && !isNaN(parseFloat(direccionGeolocalizar.split(",")[0]));
// //       const geoUrl = isLatLon
// //         ? `https://nominatim.openstreetmap.org/reverse?lat=${latitud}&lon=${longitud}&format=json`
// //         : `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(direccionGeolocalizar)}&format=json&addressdetails=1&limit=1`;

// //       const geoResponse = await axios.get(geoUrl, {
// //         headers: {
// //           "User-Agent": "TuAplicacion/1.0 (tu_email@ejemplo.com)",
// //         },
// //       });

// //       const geoData = Array.isArray(geoResponse.data) ? geoResponse.data[0] : geoResponse.data;
// //       const address = geoData.address;

// //       // municipio = datos?.direccion_detectada || address?.city || address?.town || address?.county || "";
// //     municipio = [
// //   datos?.ciudad_detectada,
// //   address?.city,
// //   datos?.direccion_detectada,
// //   address?.town,
// //   address?.county
// // ].find((val) => val && val.trim() !== "") || "";

// //       codepostal = address?.postcode || "";

// //       console.log("✅ MUNICIPIO DETECTADO:", municipio);
// // console.log("📮 CÓDIGO POSTAL:", codepostal);
// //     } catch (err) {
// //       console.warn("⚠️ Error al obtener municipio y código postal:", err.message);
// //     }

// let municipio = "";
// let codepostal = "";
// let direccionDetectada = datos?.direccion_detectada || "";
// let ciudadDetectada = datos?.ciudad_detectada || "";

// // 🧭 Armar string de dirección para búsqueda
// const direccionCompleta = direccionDetectada && ciudadDetectada
//   ? `${direccionDetectada}, ${ciudadDetectada}, Colombia`
//   : direccionDetectada
//     ? `${direccionDetectada}, Colombia`
//     : "";

// // 📡 Buscar código postal solo si hay dirección detectada
// if (direccionCompleta) {
//   try {
//     const geoUrl = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(direccionCompleta)}&format=json&addressdetails=1&limit=1`;

//     const geoResponse = await axios.get(geoUrl, {
//       headers: {
//         "User-Agent": "TuAplicacion/1.0 (tu_email@ejemplo.com)",
//       },
//     });

//     const geoData = Array.isArray(geoResponse.data) ? geoResponse.data[0] : geoResponse.data;

//     if (geoData?.address) {
//       const address = geoData.address;

//       municipio = [
//         ciudadDetectada,
//         address?.city,
//         address?.town,
//         address?.county
//       ].find((val) => val && val.trim() !== "") || "";

//       codepostal = address?.postcode || "";
//     } else {
//       console.warn("⚠️ No se encontró dirección en la respuesta de Nominatim.");
//     }

//     console.log("✅ MUNICIPIO DETECTADO:", municipio);
//     console.log("📮 CÓDIGO POSTAL DETECTADO:", codepostal);
//   } catch (err) {
//     console.warn("⚠️ Error consultando dirección detectada:", err.message);
//   }
// } else {
//   // Si no hay dirección, usar geolocalización por lat/lon
//   try {
//     const geoUrl = `https://nominatim.openstreetmap.org/reverse?lat=${latitud}&lon=${longitud}&format=json`;
//     const geoResponse = await axios.get(geoUrl, {
//       headers: {
//         "User-Agent": "TuAplicacion/1.0 (tu_email@ejemplo.com)",
//       },
//     });

//     const geoData = geoResponse.data;
//     const address = geoData.address;

//     municipio = [
//       address?.city,
//       address?.town,
//       address?.county
//     ].find((val) => val && val.trim() !== "") || "";

//     codepostal = address?.postcode || "";

//     console.log("🌍 MUNICIPIO (Geo):", municipio);
//     console.log("🌍 CÓDIGO POSTAL (Geo):", codepostal);
//   } catch (err) {
//     console.warn("⚠️ Error con geolocalización por latitud/longitud:", err.message);
//   }
// }

//     // 📍 Obtener municipio y código postal usando SOLO el municipio (sin direccion_detectada)
// // let municipio = "";
// // let codepostal = "";

// // try {
// //   const municipioReferencia = datos.municipio || datos.ciudad_detectada || "";

// //   if (municipioReferencia) {
// //     const geoUrl = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(municipioReferencia + ', Colombia')}&format=json&addressdetails=1&limit=1`;

// //     const geoResponse = await axios.get(geoUrl, {
// //       headers: {
// //         "User-Agent": "TuAplicacion/1.0 (tu_email@ejemplo.com)",
// //       },
// //     });

// //     const geoData = Array.isArray(geoResponse.data) ? geoResponse.data[0] : geoResponse.data;
// //     const address = geoData?.address || {};

// //     municipio = address.city || address.town || address.village || address.county || municipioReferencia;
// //     codepostal = address.postcode || "";
// //   } else {
// //     // Si no se encuentra municipio de la IA, usar lat/lon como fallback
// //     const geoUrlFallback = `https://nominatim.openstreetmap.org/reverse?lat=${latitud}&lon=${longitud}&format=json`;

// //     const geoFallback = await axios.get(geoUrlFallback, {
// //       headers: {
// //         "User-Agent": "TuAplicacion/1.0 (tu_email@ejemplo.com)",
// //       },
// //     });

// //     const address = geoFallback.data?.address || {};
// //     municipio = address.city || address.town || address.village || address.county || "";
// //     codepostal = address.postcode || "";
// //   }
// // } catch (err) {
// //   console.warn("⚠️ Error al obtener municipio y código postal:", err.message);
// // }

//     const cleanNumber = (val) =>
//       val && typeof val === "string" ? val.replace(/[^\d]/g, "") : val;

//     const nitLimpio = datos.nit ? datos.nit.split("-")[0] : "";

//     const resultadoFinal = {
//       nit: nitLimpio || "",
//       NumFactura: datos.NumFactura || "",
//       OrdenCompra: datos.OrdenCompra || "",
//       doc: datos.doc || "",
//       total: cleanNumber(datos.total),
//       totalSinIva: cleanNumber(datos.totalSinIva),
//       nombre: datos.nombre || "",
//       razon_social: datos.razon_social || "",
//       fecha: datos.fecha || "",
//       iva: cleanNumber(datos.iva),
//       rete: cleanNumber(datos.rete),
//       porcentaje_rete: datos.porcentaje_rete || "",
//       ipc: cleanNumber(datos.ipc),
//       concepto: datos.concepto || "",
//       ica: cleanNumber(datos.ica),
//       municipio,
//       codepostal,
//       porcentaje_iva: datos.porcentaje_iva || "19",
//       textoExplicativo: datos.textoExplicativo || "",
//       tipo_factura: datos.tipo_factura || "",
//       direccion_detectada: datos.direccion_detectada || "",
//       ciudad_detectada: datos.ciudad_detectada || "",
//     };

//     console.log(resultadoFinal);
//     await eliminar(uploadPath);
//     return res.json(resultadoFinal);
//   } catch (error) {
//     console.error("❌ Error en Azure OpenAI:", error?.response?.data || error.message);
//     await eliminar(uploadPath);
//     return res.status(500).json({ error: "Error al procesar con IA" });
//   }
// }

// async function eliminar(filePath) {
//   if (fs_extra.existsSync(filePath)) {
//     await fs_extra.unlink(filePath);
//   }
// }

// module.exports = Ocr;

//todo ++++++++++++++++++++++++++++++++++++++++++++++++++

// OCR.js
const fs = require("fs");
const fs_extra = require("fs-extra");
const path = require("path");
const axios = require("axios");
const sharp = require("sharp");
const {
  ComputerVisionClient,
} = require("@azure/cognitiveservices-computervision");
const { ApiKeyCredentials } = require("@azure/ms-rest-js");

const { apiKey, apiUrl, key, endpoint } = process.env;

const computerVisionClient = new ComputerVisionClient(
  new ApiKeyCredentials({ inHeader: { "Ocp-Apim-Subscription-Key": key } }),
  endpoint
);
const currency = require('currency.js');

async function Ocr2(req, res) {
  const { latitud, longitud } = req.body;
  const { imagen } = req.files;

  if (!imagen) return res.status(400).send("Debes subir una imagen o PDF");

  const uploadPath = `uploads/${imagen.name}`;
  await imagen.mv(uploadPath);

  const extension = path.extname(imagen.name).toLowerCase();
  let textoPlano = "";
  let base64Image = "";

  try {
    if (extension === ".pdf") {
      const fileBuffer = fs.readFileSync(uploadPath);
      const result = await computerVisionClient.readInStream(fileBuffer);
      const operationId = result.operationLocation.split("/").slice(-1)[0];

      let pollResult;
      do {
        await new Promise((r) => setTimeout(r, 1000));
        pollResult = await computerVisionClient.getReadResult(operationId);
      } while (pollResult.status !== "succeeded");

      const lines = pollResult.analyzeResult.readResults.flatMap((r) =>
        r.lines.map((line) => line.text)
      );
      textoPlano = lines.join(" ");
    } else {
      const metadata = await sharp(uploadPath).metadata();

      const optimizedImageBuffer = await sharp(uploadPath)
        .resize(metadata.width > 3000 ? { width: 3000 } : null) // Solo redimensiona si es mayor
        .normalize()
        .sharpen()
        .jpeg({ quality: 100 })
        .toBuffer();

      base64Image = optimizedImageBuffer.toString("base64");
    }
    // todo verificar este prompt para mejorar los tokens y la extraccion de datos


    const prompt = `
Extract all relevant information from the provided invoice image. Return only the following JSON object, with no extra explanations or text:

{
"nit": "",
"NumFactura": "",
"OrdenCompra": "",
"doc": "",
"total": "",
"totalSinIva": "",
"nombre": "",
"razon_social": "",
"fecha": "",
"iva": "",
"rete": "",
"porcentaje_rete": "",
"ipc": "",
"concepto": "",
"ica": "",
"municipio": "",
"codepostal": "",
"porcentaje_iva": "",
"textoExplicativo": "",
"tipo_factura": "",
"direccion_detectada": "",
"ciudad_detectada": "",
"detalles_compra": "",
"icui": "",
"porcentaje_icui": ""
}

⚠️ STRICT RULES:

Extract the "nit" from the document. Use it to search legal public records in Colombia (DIAN or RUES) online.

If the NIT exists and is linked to a legal entity, assign its official name as "razon_social" and optionally also in "nombre".

If it's a natural person, use the name on the invoice for both "razon_social" and "nombre".

If not found, use the sender’s name on the invoice.

Never assign “Corporación Incubadora de Empresas” to "razon_social" (it's your client, not the issuer).

Always use only what you find online by NIT, not commercial or brand names.

All fields in the JSON must be present. If any value is missing or unreadable, leave it as "".

Use exactly the same field names provided. Do not alter key names.

Date format: DD/MM/YYYY.

"nit" must be numeric only (no dashes or check digits). It can be a NIT, RUT, or Colombian ID (Cédula).

"doc" is the same as "nit", or cédula if it's a natural person. Numbers only.

"total": use the exact value from the invoice. Do not recalculate.

"totalSinIva": only if explicitly shown as "Subtotal", "Total sin IVA", "Valor antes de IVA", "TOTAL BRUTO". If missing, leave as "".

"iva": only if explicitly mentioned as VAT. Never calculate or infer. Use the final value, not per item.
If a field such as “Total Imp.” appears, it must be understood as IPC (consumption tax) and not as VAT.

"porcentaje_iva": Always "19" for 2025 unless Colombian law changes. 

"rete": include only if explicitly shown (e.g., "RETE FUENTE: 37.065,88"). Format properly.

"porcentaje_rete": if explicitly shown. Otherwise, leave blank.

"ipc": only if explicitly stated (e.g., INC). Not the same as ICUI. Leave blank if missing.

"concepto": must be one of ["producto", "servicio", "honorario", ""].

"ica": include only if explicitly shown.

"OrdenCompra": include only if labeled as "Orden de compra", "OC", "PO", etc. Not the invoice number.

"NumFactura": the official invoice number. May have a prefix (e.g., FT-00023). Don’t confuse with OC or delivery notes.

"tipo_factura":

"electronica" → if CUFE, QR, DIAN validation is present

"formal" → if paper with clear legal format, resolution, logo

"comprobante" → simple receipt, informal, handwritten or account payable

"direccion_detectada": structured address from the invoice. Use format like “CRA 45 #22-33” or names like "Centro Comercial". If not present, leave as "".

"municipio": the city or town of the issuer. E.g., "Medellín", "Bogotá". Not neighborhoods.

"codepostal": corresponding postal code. Leave blank if undetermined.

"icui": only if the ICUI tax is explicitly mentioned. Not the same as IPC. Leave blank if missing.

"porcentaje_icui": if ICUI appears, and it’s 2025, set to "20". Otherwise, leave blank.

"detalles_compra": list of purchased items or services. Extract descriptions from the invoice and join with commas. Do not include prices or payment details.

"textoExplicativo": short summary (in Spanish) explaining:

which fields were found and used

which fields were left blank and why

whether “totalSinIva” was used explicitly

if NIT was searched online and whether it was found (include URL if available)

why "razon_social" was assigned the way it was (e.g., TEXTILES Y RETAZOS LOS PAISAS)

DO NOT INVENT values. Do not infer, guess, or estimate. Only extract what is clearly present in the document.

If it's a "cuenta de cobro", extract the legal ID (RUT or cédula) of the person or entity marked as “Debe a” or “Pagado a”.
This ID goes in "nit". The full name goes in both "nombre" and "razon_social".

Monetary values (like total, totalSinIva, rete, ipc, ica, icui) must be:

In the same format as on the invoice

No dollar signs

Use periods (.) as decimal separator only

No commas (",") for thousands. E.g., "130335.55" not "130,335.55"

No decimals if the value doesn’t include them on the invoice

Validate and understand the document carefully. Use correct values, formats, and interpretations.
`;

    
    const messages = [
      {
        role: "system",
        content:
          "Eres un experto en contabilidad que extrae datos de facturas de manera excepcional sin fallas.",
      },
      { role: "user", content: prompt },
    ];

    if (base64Image) {
      messages.push({
        role: "user",
        content: [
          {
            type: "image_url",
            image_url: {
              url: `data:image/png;base64,${base64Image}`,
            },
          },
        ],
      });
    } else if (textoPlano) {
      messages.push({ role: "user", content: textoPlano });
    }

    const response = await axios.post(
      apiUrl,
      { messages, max_tokens: 800 },
      { headers: { "Content-Type": "application/json", "api-key": apiKey } }
    );

    const content = response.data.choices[0].message.content.trim();
    let datos = {};
    console.log(content, "contenido de la IA");
   

    try {
  if (!content || typeof content !== "string") {
    throw new Error("Respuesta vacía o inválida desde la IA");
  }

  // 1️⃣ Limpiar bloques markdown
  let jsonClean = content
    .replace(/```json/gi, "")
    .replace(/```/g, "")
    .trim();

  // 2️⃣ Extraer únicamente el JSON real
  const firstBrace = jsonClean.indexOf("{");
  const lastBrace = jsonClean.lastIndexOf("}");

  if (firstBrace === -1 || lastBrace === -1) {
    throw new Error("No se encontró estructura JSON válida");
  }

  jsonClean = jsonClean.substring(firstBrace, lastBrace + 1);

  // 3️⃣ Parsear
  datos = JSON.parse(jsonClean);

} catch (err) {
  console.error("❌ Error al convertir respuesta en JSON:", err.message);

  // Elimina el archivo solo si existe
  if (uploadPath) {
    await eliminar(uploadPath);
  }

  return res.status(400).json({
    error: "Formato inválido desde la IA",
    detalle: err.message
  });
}

    // 📍 Obtener municipio y código postal
    let municipio = "";
    let codepostal = "";

    const direccion = datos?.direccion_detectada || "";
    const ciudad = datos?.ciudad_detectada || "";
    const direccionCompleta =
      direccion && ciudad
        ? `${direccion}, ${ciudad}`
        : direccion
        ? `${direccion}`
        : "";

    if (direccionCompleta) {
      try {
        const geoUrl = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
          direccionCompleta
        )}&format=json&addressdetails=1&limit=1`;

        const geoResponse = await axios.get(geoUrl, {
          headers: { "User-Agent": "TuAplicacion/1.0 (tu_email@ejemplo.com)" },
        });

        const geoData = Array.isArray(geoResponse.data)
          ? geoResponse.data[0]
          : geoResponse.data;
        const address = geoData?.address;

        municipio =
          [ciudad, address?.city, address?.town, address?.county].find(
            (val) => val && val.trim() !== ""
          ) || "";

        codepostal = address?.postcode || "";
      } catch (err) {
        console.warn("⚠️ Error consultando dirección detectada:", err.message);
      }
    } else {
      try {
        const geoUrl = `https://nominatim.openstreetmap.org/reverse?lat=${latitud}&lon=${longitud}&format=json`;
        const geoResponse = await axios.get(geoUrl, {
          headers: { "User-Agent": "TuAplicacion/1.0 (tu_email@ejemplo.com)" },
        });

        const geoData = geoResponse.data;
        const address = geoData?.address;

        municipio =
          [address?.city, address?.town, address?.county].find(
            (val) => val && val.trim() !== ""
          ) || "";

        codepostal = address?.postcode || "";
      } catch (err) {
        console.warn(
          "⚠️ Error con geolocalización por latitud/longitud:",
          err.message
        );
      }
    }

    const cleanNumber = (val) =>
      val && typeof val === "string" ? val.replace(/[^\d]/g, "") : val;

    const nitLimpio = datos.nit ? datos.nit.split("-")[0] : "";
    console.log(datos, "datos de la IA");
    const resultadoFinal = {
      nit: nitLimpio || "",
      NumFactura: datos.NumFactura || "",
      OrdenCompra: datos.OrdenCompra || "",
      doc: datos.doc || "",
      total: datos.total,
      totalSinIva: datos.totalSinIva,
      nombre: datos.nombre || "",
      razon_social: datos.razon_social || "",
      fecha: datos.fecha || "",
      iva: datos.iva || "",
      rete: datos.rete || "",
      porcentaje_rete: datos.porcentaje_rete || "",
      ipc: datos.ipc || "",
      Tipo_Documento: datos.concepto || "",
      ica: datos.ica || "",
      municipio,
      codepostal,
      porcentaje_iva: datos.porcentaje_iva || "",
      textoExplicativo: datos.textoExplicativo || "",
      tipo_factura: datos.tipo_factura || "",
      Direccion: datos.direccion_detectada || "",
      ciudad_detectada: datos.ciudad_detectada || "",
      icui: datos.icui || "",
      porcentaje_icui: datos.porcentaje_icui || "",
      concepto: datos.detalles_compra || "",
    };

    console.log(resultadoFinal);
    await eliminar(uploadPath);
    return res.json(resultadoFinal);
  } catch (error) {
    console.error(
      "❌ Error en Azure OpenAI:",
      error?.response?.data || error.message
    );
    await eliminar(uploadPath);
    return res.status(500).json({ error: "Error al procesar con IA" });
  }
}

async function Ocr(req, res) {
  const { latitud, longitud } = req.body;
  const { imagen } = req.files || {};

  if (!imagen) {
    return res.status(400).send("Debes subir una imagen o PDF");
  }

  const uploadPath = `uploads/${Date.now()}_${imagen.name}`;
  await imagen.mv(uploadPath);

  const extension = path.extname(imagen.name).toLowerCase();
  let textoPlano = "";
  let base64Image = "";

  try {
    // ==============================
    // 1️⃣ PROCESAMIENTO DE ARCHIVO
    // ==============================

    if (extension === ".pdf") {
      const fileBuffer = await fs.promises.readFile(uploadPath);

      const result = await computerVisionClient.readInStream(fileBuffer);
      const operationId = result.operationLocation.split("/").slice(-1)[0];

      let pollResult;
      do {
        await new Promise((r) => setTimeout(r, 1000));
        pollResult = await computerVisionClient.getReadResult(operationId);
      } while (pollResult.status !== "succeeded");

      const lines = pollResult.analyzeResult.readResults.flatMap((r) =>
        r.lines.map((line) => line.text)
      );

      textoPlano = lines.join(" ");
    } else {
      const metadata = await sharp(uploadPath).metadata();

      const optimizedImageBuffer = await sharp(uploadPath)
        .resize(metadata.width > 3000 ? { width: 3000 } : null)
        .normalize()
        .sharpen()
        .jpeg({ quality: 100 })
        .toBuffer();

      base64Image = optimizedImageBuffer.toString("base64");
    }

    // ==============================
    // 2️⃣ MENSAJES PARA IA
    // ==============================

//     const prompt = `
// Extract all relevant information from the provided invoice image. Return only the following JSON object, with no extra explanations or text:

// {
// "nit": "",
// "NumFactura": "",
// "OrdenCompra": "",
// "doc": "",
// "total": "",
// "totalSinIva": "",
// "nombre": "",
// "razon_social": "",
// "fecha": "",
// "iva": "",
// "rete": "",
// "porcentaje_rete": "",
// "ipc": "",
// "concepto": "",
// "ica": "",
// "municipio": "",
// "codepostal": "",
// "porcentaje_iva": "",
// "textoExplicativo": "",
// "tipo_factura": "",
// "direccion_detectada": "",
// "ciudad_detectada": "",
// "detalles_compra": "",
// "icui": "",
// "porcentaje_icui": ""
// }

// ⚠️ STRICT RULES:

// Extract the "nit" from the document. Use it to search legal public records in Colombia (DIAN or RUES) online.

// If the NIT exists and is linked to a legal entity, assign its official name as "razon_social" and optionally also in "nombre".

// If it's a natural person, use the name on the invoice for both "razon_social" and "nombre".

// If not found, use the sender’s name on the invoice.

// Never assign “Corporación Incubadora de Empresas” to "razon_social" (it's your client, not the issuer).

// Always use only what you find online by NIT, not commercial or brand names.

// All fields in the JSON must be present. If any value is missing or unreadable, leave it as "".

// Use exactly the same field names provided. Do not alter key names.

// Date format: DD/MM/YYYY.

// "nit" must be numeric only (no dashes or check digits). It can be a NIT, RUT, or Colombian ID (Cédula).

// "doc" is the same as "nit", or cédula if it's a natural person. Numbers only.

// "total": use the exact value from the invoice. Do not recalculate.

// "totalSinIva": only if explicitly shown as "Subtotal", "Total sin IVA", "Valor antes de IVA", "TOTAL BRUTO". If missing, leave as "".

// "iva": only if explicitly mentioned as VAT. Never calculate or infer. Use the final value, not per item.
// If a field such as “Total Imp.” appears, it must be understood as IPC (consumption tax) and not as VAT.

// "porcentaje_iva": Always "19" for 2025 unless Colombian law changes. 

// "rete": include only if explicitly shown (e.g., "RETE FUENTE: 37.065,88"). Format properly.

// "porcentaje_rete": if explicitly shown. Otherwise, leave blank.

// "ipc": only if explicitly stated (e.g., INC). Not the same as ICUI. Leave blank if missing.

// "concepto": must be one of ["producto", "servicio", "honorario", ""].

// "ica": include only if explicitly shown.

// "OrdenCompra": include only if labeled as "Orden de compra", "OC", "PO", etc. Not the invoice number.

// "NumFactura": the official invoice number. May have a prefix (e.g., FT-00023). Don’t confuse with OC or delivery notes.

// "tipo_factura":

// "electronica" → if CUFE, QR, DIAN validation is present

// "formal" → if paper with clear legal format, resolution, logo

// "comprobante" → simple receipt, informal, handwritten or account payable

// "direccion_detectada": structured address from the invoice. Use format like “CRA 45 #22-33” or names like "Centro Comercial". If not present, leave as "".

// "municipio": the city or town of the issuer. E.g., "Medellín", "Bogotá". Not neighborhoods.

// "codepostal": corresponding postal code. Leave blank if undetermined.

// "icui": only if the ICUI tax is explicitly mentioned. Not the same as IPC. Leave blank if missing.

// "porcentaje_icui": if ICUI appears, and it’s 2025, set to "20". Otherwise, leave blank.

// "detalles_compra": list of purchased items or services. Extract descriptions from the invoice and join with commas. Do not include prices or payment details.

// "textoExplicativo": short summary (in Spanish) explaining:

// which fields were found and used

// which fields were left blank and why

// whether “totalSinIva” was used explicitly

// if NIT was searched online and whether it was found (include URL if available)

// why "razon_social" was assigned the way it was (e.g., TEXTILES Y RETAZOS LOS PAISAS)

// DO NOT INVENT values. Do not infer, guess, or estimate. Only extract what is clearly present in the document.

// If it's a "cuenta de cobro", extract the legal ID (RUT or cédula) of the person or entity marked as “Debe a” or “Pagado a”.
// This ID goes in "nit". The full name goes in both "nombre" and "razon_social".

// Monetary values (like total, totalSinIva, rete, ipc, ica, icui) must be:

// In the same format as on the invoice

// No dollar signs

// Use periods (.) as decimal separator only

// No commas (",") for thousands. E.g., "130335.55" not "130,335.55"

// No decimals if the value doesn’t include them on the invoice

// Validate and understand the document carefully. Use correct values, formats, and interpretations.
// `;

// const prompt = `
// Extract all relevant information from the provided invoice image.

// Return ONLY the following JSON object.
// Do NOT include explanations outside the JSON.

// {
// "nit": "",
// "NumFactura": "",
// "OrdenCompra": "",
// "doc": "",
// "total": "",
// "totalSinIva": "",
// "nombre": "",
// "razon_social": "",
// "fecha": "",
// "iva": "",
// "rete": "",
// "porcentaje_rete": "",
// "ipc": "",
// "concepto": "",
// "ica": "",
// "municipio": "",
// "codepostal": "",
// "porcentaje_iva": "",
// "textoExplicativo": "",
// "tipo_factura": "",
// "direccion_detectada": "",
// "ciudad_detectada": "",
// "detalles_compra": "",
// "icui": "",
// "porcentaje_icui": ""
// }

// ========================
// GENERAL EXTRACTION RULES
// ========================

// - ALL fields must exist in the JSON.
// - If a value is missing, unreadable, or not explicitly present → return "".
// - NEVER invent, infer, calculate, assume or estimate values.
// - Use EXACT field names. Do NOT rename keys.
// - Date format MUST be: DD/MM/YYYY.
// - Do not confuse invoice number with purchase order.

// ========================
// IDENTIFICATION RULES
// ========================

// - "nit" must contain NUMBERS ONLY (no dashes, no check digit).
// - It may be NIT, RUT, or Colombian ID (cédula).
// - "doc" must be the same numeric value as "nit".
// - Extract the NIT from the document.
// - Use the NIT to search official Colombian public records (DIAN or RUES).

// If NIT is found:
//     - Use the OFFICIAL registered legal name as "razon_social".
//     - Optionally also use it in "nombre".

// If it is a natural person:
//     - Use the invoice name for both "razon_social" and "nombre".

// If not found online:
//     - Use the issuer name shown in the invoice.

// NEVER assign “Corporación Incubadora de Empresas” as razon_social.

// Always use legal registered name, not brand or commercial name.

// ========================
// MONETARY STANDARDIZATION (VERY IMPORTANT)
// ========================

// ALL monetary values MUST follow this STRICT Colombian numeric format:

// - Use PERIOD (.) as decimal separator ONLY.
// - NEVER use commas (,) as thousand separators.
// - Remove ALL thousand separators.
// - Do NOT include currency symbols.
// - Keep EXACT numeric value shown in invoice.
// - Do NOT recalculate any value.
// - If the invoice shows no decimals → return no decimals.
// - If decimals appear → preserve them exactly as shown.

// Examples of correct output:
// "15451541"
// "2935792.79"
// "18387333.79"
// "130335.55"

// Examples of incorrect output:
// "15,451,541"
// "15.451.541"
// "$15451541"
// "15451.541" (if this was not explicitly shown)

// The values that MUST follow this rule are:
// - total
// - totalSinIva
// - iva
// - rete
// - ipc
// - ica
// - icui

// ========================
// TAX RULES
// ========================

// - "total": exact total value shown. Do NOT calculate.
// - "totalSinIva": ONLY if explicitly shown as:
//   "Subtotal", "Total sin IVA", "Valor antes de IVA", "TOTAL BRUTO".
//   If not explicitly present → "".

// - "iva": ONLY if explicitly labeled as VAT or IVA.
//   Never calculate.
//   Use final IVA value, not per-item tax.

// - "porcentaje_iva": Always "19" for 2025 unless Colombian law changes.

// - "rete": ONLY if explicitly shown.
// - "porcentaje_rete": ONLY if explicitly shown.

// - "ipc": ONLY if explicitly stated (e.g., INC).
// - "ica": ONLY if explicitly shown.
// - "icui": ONLY if explicitly mentioned.
// - "porcentaje_icui": if ICUI appears and document is 2025 → "20".
//   Otherwise → "".

// IMPORTANT:
// If the invoice shows "Total Imp." it must be interpreted as IPC (consumption tax), NOT IVA.

// ========================
// DOCUMENT CLASSIFICATION
// ========================

// "tipo_factura" must be:

// - "electronica" → if CUFE, QR, or DIAN validation appears
// - "formal" → legal formatted invoice with resolution
// - "comprobante" → simple receipt or informal document

// ========================
// OTHER FIELDS
// ========================

// - "OrdenCompra": only if explicitly labeled as OC, PO, Orden de Compra.
// - "NumFactura": official invoice number (may include prefix).
// - "direccion_detectada": structured address from issuer.
// - "municipio": issuer city.
// - "ciudad_detectada": city if separately identifiable.
// - "codepostal": only if explicitly shown.
// - "concepto": must be one of:
//   ["producto", "servicio", "honorario", ""]

// - "detalles_compra":
//   Extract descriptions of purchased items/services.
//   Join with commas.
//   Do NOT include prices or payment terms.

// ========================
// SPECIAL CASE
// ========================

// If document is a "cuenta de cobro":
// - Extract ID of person marked as “Debe a” or “Pagado a”.
// - That ID goes in "nit".
// - Full name goes in both "nombre" and "razon_social".

// ========================
// textoExplicativo (REQUIRED)
// ========================

// Write a short explanation in Spanish describing:

// - Which fields were found and used
// - Which fields were blank and why
// - Whether "totalSinIva" was explicitly used
// - If NIT was searched online and whether it was found (include URL if available)
// - Why razon_social was assigned the way it was

// Be concise and factual.
// Do NOT invent information.

// Validate and understand the document carefully.
// Return ONLY the JSON.
// `;

const prompt = `
Extract all relevant information from the provided invoice image.

Return ONLY the following JSON object.
Do NOT include explanations outside the JSON.

{
"nit": "",
"NumFactura": "",
"OrdenCompra": "",
"doc": "",
"total": "",
"totalSinIva": "",
"nombre": "",
"razon_social": "",
"fecha": "",
"iva": "",
"rete": "",
"porcentaje_rete": "",
"ipc": "",
"concepto": "",
"ica": "",
"municipio": "",
"codepostal": "",
"porcentaje_iva": "",
"textoExplicativo": "",
"tipo_factura": "",
"direccion_detectada": "",
"ciudad_detectada": "",
"detalles_compra": "",
"icui": "",
"porcentaje_icui": ""
}

========================
GENERAL EXTRACTION RULES
========================

- ALL fields must exist in the JSON.
- If a value is missing, unreadable, or not explicitly present → return "".
- NEVER invent, infer, calculate, assume or estimate values.
- Use EXACT field names. Do NOT rename keys.
- Date format MUST be: DD/MM/YYYY.
- Do not confuse invoice number with purchase order.

========================
IDENTIFICATION RULES
========================

- "nit" must contain NUMBERS ONLY (no dashes, no check digit).
- It may be NIT, RUT, or Colombian ID (cédula).
- "doc" must be the same numeric value as "nit".
- Extract the NIT from the document.
- Use the NIT to search official Colombian public records (DIAN or RUES).

If NIT is found:
    - Use the OFFICIAL registered legal name as "razon_social".
    - Optionally also use it in "nombre".

If it is a natural person:
    - Use the invoice name for both "razon_social" and "nombre".

If not found online:
    - Use the issuer name shown in the invoice.

NEVER assign “Corporación Incubadora de Empresas” as razon_social.

Always use legal registered name, not brand or commercial name.

========================
MONETARY STANDARDIZATION (VERY IMPORTANT)
========================

ALL monetary values MUST follow this strict format:

FINAL OUTPUT FORMAT:
1. Comma (,) as thousand separator.
2. Period (.) as decimal separator ONLY if real cents exist.
3. If there are NO cents → do NOT add decimals.
4. Keep all real decimals exactly as they appear.
5. Remove any currency symbols ($, COP, etc.).
6. Do NOT invent decimals or recalculate values.
7. Preserve the exact numeric value represented in the invoice.

STEP 1 — Analyze the format of the value:
- US format (e.g., 380,000.50) → preserve correctly.
- Colombian format (e.g., 380.000,50) → convert properly to US-style (380,000.50).
- Plain numbers without separators → return exactly as shown (do not add separators if none existed).

CRITICAL RULES:
- "380.000,00" → "380,000"
- "380000.00" → "380,000"
- "380000" → "380000"
- "7,320" → "7,320"
- NEVER return values like "380.000,00"
- NEVER mix thousand and decimal separators incorrectly.
- Keep decimals if they exist (e.g., 1500.75 → "1,500.75").

FIELDS THAT MUST FOLLOW THIS RULE:
- total
- totalSinIva
- iva
- rete
- ipc
- ica
- icui

========================
TAX RULES
========================

- "total": exact total value shown. Do NOT calculate.
- "totalSinIva": ONLY if explicitly shown as:
  "Subtotal", "Total sin IVA", "Valor antes de IVA", "TOTAL BRUTO".
  If not explicitly present → "".

- "iva": ONLY if explicitly labeled as VAT or IVA.
  Never calculate.
  Use final IVA value, not per-item tax.

- "porcentaje_iva": Always "19" for 2025 unless Colombian law changes.

- "rete": ONLY if explicitly shown.
- "porcentaje_rete": ONLY if explicitly shown.

- "ipc": ONLY if explicitly stated (e.g., INC).
- "ica": ONLY if explicitly shown.
- "icui": ONLY if explicitly mentioned.
- "porcentaje_icui": if ICUI appears and document is 2025 → "20".
  Otherwise → "".

IMPORTANT:
If the invoice shows "Total Imp." it must be interpreted as IPC (consumption tax), NOT IVA.

========================
DOCUMENT CLASSIFICATION
========================

"tipo_factura" must be:

- "electronica" → if CUFE, QR, or DIAN validation appears
- "formal" → legal formatted invoice with resolution
- "comprobante" → simple receipt or informal document

========================
OTHER FIELDS
========================

- "OrdenCompra": only if explicitly labeled as OC, PO, Orden de Compra.
- "NumFactura": official invoice number (may include prefix).
- "direccion_detectada": structured address from issuer.
- "municipio": issuer city.
- "ciudad_detectada": city if separately identifiable.
- "codepostal": only if explicitly shown.
- "concepto": must be one of:
  ["producto", "servicio", "honorario", ""]

- "detalles_compra":
  Extract descriptions of purchased items/services.
  Join with commas.
  Do NOT include prices or payment terms.

========================
SPECIAL CASE
========================

If document is a "cuenta de cobro":
- Extract ID of person marked as “Debe a” or “Pagado a”.
- That ID goes in "nit".
- Full name goes in both "nombre" and "razon_social".

========================
textoExplicativo (REQUIRED)
========================

Write a short explanation in Spanish describing:

- Which fields were found and used
- Which fields were blank and why
- Whether "totalSinIva" was explicitly used
- If NIT was searched online and whether it was found (include URL if available)
- Why razon_social was assigned the way it was

Be concise and factual.
Do NOT invent information.

Validate and understand the document carefully.
Return ONLY the JSON.
`;

    const messages = [
      {
        role: "system",
        content:
          "Eres un experto en contabilidad que extrae datos de facturas de manera excepcional sin fallas.",
      },
      { role: "user", content: prompt }, // 👈 TU PROMPT ORIGINAL SIN CAMBIOS
    ];

    if (base64Image) {
      messages.push({
        role: "user",
        content: [
          {
            type: "image_url",
            image_url: {
              url: `data:image/png;base64,${base64Image}`,
            },
          },
        ],
      });
    } else if (textoPlano) {
      messages.push({ role: "user", content: textoPlano });
    }

    // ==============================
    // 3️⃣ LLAMADO A AZURE OPENAI
    // ==============================

    const response = await axios.post(
      apiUrl,
      {
        messages,
        max_tokens: 1500,
        temperature: 0,
      },
      {
        headers: {
          "Content-Type": "application/json",
          "api-key": apiKey,
        },
      }
    );

    const content =
      response?.data?.choices?.[0]?.message?.content?.trim() || "";

    if (!content) {
      throw new Error("La IA no devolvió contenido");
    }

    console.log("📦 Respuesta IA:", content);

    // ==============================
    // 4️⃣ PARSER ROBUSTO
    // ==============================

    let datos = {};

    try {
      let jsonClean = content
        .replace(/```json/gi, "")
        .replace(/```/g, "")
        .trim();

      const jsonMatch = jsonClean.match(/\{[\s\S]*\}/);

      if (!jsonMatch) {
        throw new Error("No se encontró estructura JSON válida");
      }

      datos = JSON.parse(jsonMatch[0]);
    } catch (err) {
      console.error("❌ Error parseando JSON:", err.message);
      console.log("📦 Respuesta cruda:", content);

      await eliminar(uploadPath);

      return res.status(400).json({
        error: "Formato inválido desde la IA",
        detalle: err.message,
      });
    }

    // ==============================
    // 5️⃣ VALIDAR CAMPOS OBLIGATORIOS
    // ==============================

    const expectedKeys = [
      "nit","NumFactura","OrdenCompra","doc","total","totalSinIva",
      "nombre","razon_social","fecha","iva","rete","porcentaje_rete",
      "ipc","concepto","ica","municipio","codepostal",
      "porcentaje_iva","textoExplicativo","tipo_factura",
      "direccion_detectada","ciudad_detectada",
      "detalles_compra","icui","porcentaje_icui"
    ];

    expectedKeys.forEach(key => {
      if (!datos.hasOwnProperty(key)) {
        datos[key] = "";
      }
    });

    // ==============================
    // 6️⃣ GEOLOCALIZACIÓN
    // ==============================

    let municipio = "";
    let codepostal = "";

    const direccion = datos?.direccion_detectada || "";
    const ciudad = datos?.ciudad_detectada || "";
    const direccionCompleta =
      direccion && ciudad
        ? `${direccion}, ${ciudad}`
        : direccion || "";

    try {
      if (direccionCompleta) {
        const geoUrl = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
          direccionCompleta
        )}&format=json&addressdetails=1&limit=1`;

        const geoResponse = await axios.get(geoUrl, {
          headers: { "User-Agent": "TuAplicacion/1.0 (tu_email@ejemplo.com)" },
        });

        const geoData = geoResponse.data?.[0];
        const address = geoData?.address;

        municipio =
          [ciudad, address?.city, address?.town, address?.county].find(
            (val) => val && val.trim() !== ""
          ) || "";

        codepostal = address?.postcode || "";
      }
    } catch (err) {
      console.warn("⚠️ Error geolocalización:", err.message);
    }

    // ==============================
    // 7️⃣ RESULTADO FINAL
    // ==============================

    const nitLimpio = datos.nit ? datos.nit.split("-")[0] : "";
console.log( "datos finales antes de formatear");
    const resultadoFinal = {
      nit: nitLimpio || "",
      NumFactura: datos.NumFactura,
      OrdenCompra: datos.OrdenCompra,
      doc: datos.doc,
      total: parseMoney(datos.total),
      totalSinIva: parseMoney(datos.totalSinIva),
      nombre: datos.nombre,
      razon_social: datos.razon_social,
      fecha: datos.fecha,
      iva: parseMoney(datos.iva),
      rete: parseMoney(datos.rete),
      porcentaje_rete: datos.porcentaje_rete,
      ipc: parseMoney(datos.ipc),
      Tipo_Documento: datos.concepto,
      ica: parseMoney(datos.ica),
      municipio,
      codepostal,
      porcentaje_iva: datos.porcentaje_iva,
      textoExplicativo: datos.textoExplicativo,
      tipo_factura: datos.tipo_factura,
      Direccion: datos.direccion_detectada,
      ciudad_detectada: datos.ciudad_detectada,
      icui: datos.icui,
      porcentaje_icui: datos.porcentaje_icui,
      concepto: datos.detalles_compra,
    };

    //   const resultadoFinal = {
    //   nit: nitLimpio || "",
    //   NumFactura: datos.NumFactura,
    //   OrdenCompra: datos.OrdenCompra,
    //   doc: datos.doc,
    //   total: datos.total,
    //   totalSinIva: datos.totalSinIva,
    //   nombre: datos.nombre,
    //   razon_social: datos.razon_social,
    //   fecha: datos.fecha,
    //   iva: datos.iva,
    //   rete: datos.rete,
    //   porcentaje_rete: datos.porcentaje_rete,
    //   ipc: datos.ipc,
    //   Tipo_Documento: datos.concepto,
    //   ica: datos.ica,
    //   municipio,
    //   codepostal,
    //   porcentaje_iva: datos.porcentaje_iva,
    //   textoExplicativo: datos.textoExplicativo,
    //   tipo_factura: datos.tipo_factura,
    //   Direccion: datos.direccion_detectada,
    //   ciudad_detectada: datos.ciudad_detectada,
    //   icui: datos.icui,
    //   porcentaje_icui: datos.porcentaje_icui,
    //   concepto: datos.detalles_compra,
    // };

    await eliminar(uploadPath);

    return res.json(resultadoFinal);

  } catch (error) {
    console.error(
      "❌ Error general:",
      error?.response?.data || error.message
    );

    await eliminar(uploadPath);

    return res.status(500).json({
      error: "Error al procesar con IA",
    });
  }
}




function parseMoney(value) {
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
function parseMoney3(value) {
   if (!value) return "";
const normalized = normalizeInput(value);
    return normalized;
}








async function eliminar(filePath) {
  if (fs_extra.existsSync(filePath)) {
    await fs_extra.unlink(filePath);
  }
}

module.exports = Ocr;
