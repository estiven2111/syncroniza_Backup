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
const { ComputerVisionClient } = require("@azure/cognitiveservices-computervision");
const { ApiKeyCredentials } = require("@azure/ms-rest-js");

const { apiKey, apiUrl, key, endpoint } = process.env;

const computerVisionClient = new ComputerVisionClient(
  new ApiKeyCredentials({ inHeader: { "Ocp-Apim-Subscription-Key": key } }),
  endpoint
);

async function Ocr(req, res) {
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
      const optimizedImageBuffer = await sharp(uploadPath)
        .resize({ width: 1500 })
        .normalize()
        .sharpen()
        .toBuffer();

      base64Image = optimizedImageBuffer.toString("base64");
    }
const prompt = `
Extrae la información de la siguiente imagen de factura. Devuelve SOLO el siguiente objeto JSON, sin explicaciones ni texto adicional:

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
  "ciudad_detectada": ""
}

⚠️ Reglas estrictas:

1. Todos los campos deben estar presentes. Si algún dato no está visible en la factura, deja el campo con comillas vacías: "".

2. Usa exactamente los nombres de los campos indicados arriba, sin alterarlos.

3. Para los valores numéricos:
   - No uses comas, puntos, decimales ni el símbolo de pesos.
   - Ejemplo correcto: "19000"
   - Ejemplo incorrecto: "$19.000,00", "19,000.00", "19000.00"

4. El campo "fecha" debe ir en formato DD/MM/YYYY. Si está visible, siempre debes ponerlo.

5. El campo "nit" debe contener solo números (sin guiones ni dígito de verificación).

6. El campo "concepto" debe ser uno de: "producto", "servicio", "honorario" o "".

7. Rete fuente:
   - Si aparece en la factura (ej: "RETE FUENTE: 37.065,88"), úsalo limpiando comas, puntos y decimales.
   - Si NO aparece, calcula:
     - "producto" → 2.5% de "totalSinIva"
     - "servicio" → 4%
     - "honorario" → 11%
   - El resultado debe estar sin decimales y redondeado hacia abajo.
   - El campo "porcentaje_rete" debe reflejar el porcentaje aplicado (ejemplo: "2.5")

8. Si no se puede determinar el concepto, deja "rete" y "porcentaje_rete" vacíos: ""

9. No inventes datos. Extrae solo lo que esté visible.

10. Devuelve solo el JSON. No incluyas texto fuera del objeto.

11. Los valores en pesos deben estar sin centavos, sin puntos ni comas. Ejemplo correcto: "19000".

12. El campo **"OrdenCompra"** debe contener únicamente el número de la **orden de compra**.
   - Puede aparecer como: "Orden de compra", "OC", "PO", "Purchase Order", "Orden #", etc.
   - No lo confundas con el número de factura u otros documentos.
   - La orden de compra debe ir en el campo "OrdenCompra". No la confundas con el número de factura.
   - Si  no aparece en la factura, deja su valor como una cadena vacía: "".

13. El campo **"NumFactura"** debe contener únicamente el **número de factura**.
   - Puede aparecer como: "Factura No.", "N° Factura", "Factura #", "Número de Factura", "Factura: 12345", etc.
   - Asegúrate de que no sea un número de orden de compra, guía, o remisión.
   -El campo "NumFactura" debe tener el número de factura, no la orden de compra.
   - Si  no aparece en la factura, deja su valor como una cadena vacía: "".

14. El campo "porcentaje_rete" debe ser el valor numérico del porcentaje aplicado (ej: "4"). Sin el símbolo de porcentaje (%).

15. El campo "iva" debe extraerse **únicamente si aparece de forma explícita** en la factura.  
   - Si el valor del IVA está escrito, **usa exactamente ese valor**.
   - **Nunca lo calcules ni lo estimes**, sin importar si aparece el subtotal o el total.
   - No infieras el IVA bajo ninguna circunstancia.
   - Si no aparece, simplemente **omite el campo "iva"** en la respuesta.

   16. El campo "porcentaje_iva" siempre debe ser el porcentaje **vigente oficialmente en Colombia**, independientemente del valor que tenga el IVA en la factura.  
   - Actualmente, en el año **2025**, este valor es **19**.
   - Si este porcentaje cambia en el futuro, debes reflejar el nuevo porcentaje correspondiente al año actual.
   - **Nunca lo recalcules a partir del valor del IVA ni de ningún otro campo** de la factura.

17. Si hay un valor de ICA, ponlo en el campo "ica" pero valida bien por que te he pasado facturas que lo traen y no lo pones.
 Si no, déjalo como "" pero ante VALIDA BIEN EL DOCUMENTO Y PON EL DATO CORRECTO NO ASUMAS SINO ENTIENDES NO LO PONGAS.
 PORFAVOR NO CALCULES DATOS PORFAVOR NO ASUMAS BUSCA BIEN SI NO EXISTE EL DATO NO LO PONGAS.

18. Si hay valor de IPC o INC, colócalo en "ipc" pero valida bien por que te he pasado facturas que lo traen y no lo pones.
 Si no hay ninguno, déjalo como  "" pero ante VALIDA BIEN EL DOCUMENTO Y PON EL DATO CORRECTO NO ASUMAS SINO ENTIENDES NO LO PONGAS
 PORFAVOR NO CALCULES DATOS PORFAVOR NO ASUMAS BUSCA BIEN SI NO EXISTE EL DATO NO LO PONGAS.

19. El campo "razon_social" es la empresa que emite la factura, no a quien va dirigida.

20. Explica brevemente qué hiciste en "textoExplicativo". explicame basicamente que datos encontraste y que datos no y por que no los encontraste
ademas de como me pasaste los que llevan porcentaje.

21. Determina el tipo de factura:
    - "electronica": si ves timbres electrónicos, códigos QR o CUFE.
    - "formal": si tiene logo, número, resolución y formato físico tradicional.
    - "comprobante": si es simple, sin logo, sin datos fiscales completos.
    Usa el campo "tipo_factura" para poner uno de esos tres valores.

22. Campo direccion_detectada (Dirección del emisor)
Eres un experto en lectura de direcciones postales en Colombia. Tu tarea es encontrar la dirección de la razón social que genera la factura y devolverla en el campo direccion_detectada. Sigue estas reglas:

Busca primero una dirección urbana estructurada que contenga:

Abreviaciones como: kr, kra, cr, cra, cl, calle, av, avenida.

Símbolos como: #, -, números, piso, etc.

Ejemplos válidos:
"KR 45 #45-34"
"CRA 7 #23-45 piso 3"
"CL 90 #11-45"
"AV 30 #10-23"

Si no se encuentra una dirección estructurada válida, puedes usar como dirección un establecimiento como:

Centro comercial, local, edificio, zona empresarial, etc.

Ejemplos: "CC Paseo de la Castellana local 113-136", "Edificio Bogotá Trade Center oficina 504"

Si hay tanto una dirección estructurada como un establecimiento, debes priorizar la dirección estructurada.

Si no se detecta ninguna dirección válida del emisor, devuelve el campo como cadena vacía ("").

Ejemplos de salida JSON:{"direccion_detectada": "KR 45 #45-34", "direccion_detectada": "CC Paseo de la Castellana local 113-136" :  "direccion_detectada": ""}

23. Campo municipio (Ciudad o municipio del emisor)
Tu tarea es identificar el municipio o ciudad de la razón social que genera la factura y devolverlo en el campo municipio. Sigue estas reglas:

El campo municipio debe contener únicamente el nombre de la ciudad o municipio, sin dirección ni ningún otro dato adicional.

Solo se acepta si aparece de forma explícita y legible en la información del emisor. Ejemplos válidos: "Bogotá", "Medellín", "Cali", "Barranquilla", "Cartagena".

No uses nombres de centros comerciales, edificios, barrios, zonas ni otros establecimientos como municipio.

Si no hay ciudad o municipio visible del emisor, deja el campo municipio como cadena vacía ("").

Ejemplos de salida JSON: {"municipio": "Medellín": "", "municipio": "Bogotá", "municipio": ""}

24. El campo "codepostal" debe ser el código postal obtenido a partir del valor en municipio (el cual puede contener dirección + ciudad) o en su defecto por latitud y longitud si no hay dirección.

25. Eres un experto en contabilidad e impuestos en Colombia. Analiza el texto de la siguiente factura y
 extrae el valor del impuesto a productos ultraprocesados (ICUI), también conocido como impuesto saludable.

Sigue estas reglas:
- Si la factura muestra explícitamente el impuesto ICUI, extrae ese valor y centrate en el de la factura solamente.
- Si no aparece, pero hay productos que comúnmente tienen ICUI (como gaseosas, bebidas azucaradas, snacks, dulces, embutidos), estima el valor del impuesto aplicando el porcentaje correspondiente sobre el valor de esos productos.
- Usa este porcentaje según el año indicado en la fecha de la factura:
  - 10% si es 2023
  - 15% si es 2024
  - 20% si es 2025 o después
- Si no hay productos gravados o no se puede determinar el ICUI, responde "".

Devuelve solo el valor del impuesto ICUI en formato JSON así:

{
  "icui": 2500,
  "porcentaje_icui": "15%",
}

26.Eres un experto en lectura e interpretación de facturas, recibos y comprobantes de pago en Colombia. Vas a analizar el texto de un documento y devolver únicamente el campo detalles_compra, siguiendo cuidadosamente estas instrucciones:

Determina si el documento es:

Una factura formal o electrónica (estructura clara con NIT, número de factura, tabla de ítems con columnas como cantidad, descripción, valor, etc.).

O una factura informal o manual (recibos escritos a mano, cuentas de restaurante, comprobantes simples con conceptos sueltos).

En ambos casos, identifica y extrae únicamente los conceptos o ítems comprados. Estos se encuentran generalmente en campos como “Descripción”, “Concepto”, o dentro de tablas.

Ignora precios, cantidades, subtotales, totales, valores unitarios, formas de pago, encabezados o información del proveedor.

El campo detalles_compra debe:

Contener una sola cadena de texto.

Todos los ítems deben ir separados por comas (,) sin saltos de línea.

Ser claro y conciso. Ejemplo: “impresora multifuncional, portátil acer a315, almuerzo, gaseosa, servicio de restaurante”.

Si no se detectan conceptos de compra válidos, devuelve detalles_compra como cadena vacía.

Devuelve únicamente el siguiente formato JSON:

agragalo a el resto de datos como detalles_compra:
que pasa pues agrega el campo detalles_compra al objeto JSON final: 

27. Cuando el documento sea un recibo de caja, una factura a mano, o una factura no formal, analiza únicamente los datos que estén explícitamente visibles en el documento o imagen.

Por lo general, estos documentos incluyen los siguientes elementos:

Total

Fecha

Concepto (descripción del servicio o producto)

Pagado a (que corresponde a la razón social o nombre y la cédula/NIT del receptor)

Instrucciones clave:
No inventes ni asumas información. Extrae solo los datos que el documento realmente muestre.

El campo subtotal casi nunca aparece en este tipo de documentos:

Si no está visible, déjalo vacío.

Si sí aparece, inclúyelo tal como está.

En el campo "Detalles de la compra", transcribe fielmente el concepto descrito en el documento. Esta información es muy importante y debe coincidir con lo escrito por el emisor.

NOTA
si algun dato no lo encuentras ponlo como "" no me devuelvas undefinido o null.
Recuerda, eres un contador experto, extrae solo lo que esté en la factura y realiza los cálculos si es necesario, con precisión contable.

`;
    const messages = [
      {
        role: "system",
        content: "Eres un experto en contabilidad que extrae datos de facturas de manera excepcional sin fallas.",
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
  console.log(content,"contenido de la IA");
    try {
      const jsonClean = content
        .replace(/^```json/i, "")
        .replace(/^```/, "")
        .replace(/```$/, "")
        .trim();

      datos = JSON.parse(jsonClean);
    } catch (err) {
      console.error("❌ Error al convertir respuesta en JSON:", err.message);
      await eliminar(uploadPath);
      return res.status(400).json({ error: "Formato inválido desde la IA" });
    }

    // 📍 Obtener municipio y código postal
    let municipio = "";
    let codepostal = "";

    const direccion = datos?.direccion_detectada || "";
    const ciudad = datos?.ciudad_detectada || "";
    const direccionCompleta = direccion && ciudad
      ? `${direccion}, ${ciudad}`
      : direccion
        ? `${direccion}`
        : "";

    if (direccionCompleta) {
      try {
        const geoUrl = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(direccionCompleta)}&format=json&addressdetails=1&limit=1`;

        const geoResponse = await axios.get(geoUrl, {
          headers: { "User-Agent": "TuAplicacion/1.0 (tu_email@ejemplo.com)" },
        });

        const geoData = Array.isArray(geoResponse.data) ? geoResponse.data[0] : geoResponse.data;
        const address = geoData?.address;

        municipio = [
          ciudad,
          address?.city,
          address?.town,
          address?.county
        ].find(val => val && val.trim() !== "") || "";

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

        municipio = [
          address?.city,
          address?.town,
          address?.county
        ].find(val => val && val.trim() !== "") || "";

        codepostal = address?.postcode || "";
      } catch (err) {
        console.warn("⚠️ Error con geolocalización por latitud/longitud:", err.message);
      }
    }

    const cleanNumber = (val) =>
      val && typeof val === "string" ? val.replace(/[^\d]/g, "") : val;

    const nitLimpio = datos.nit ? datos.nit.split("-")[0] : "";
console.log(datos,"datos de la IA");
    const resultadoFinal = {
      nit: nitLimpio || "",
      NumFactura: datos.NumFactura || "",
      OrdenCompra: datos.OrdenCompra || "",
      doc: datos.doc || "",
      total: cleanNumber(datos.total),
      totalSinIva: cleanNumber(datos.totalSinIva),
      nombre: datos.nombre || "",
      razon_social: datos.razon_social || "",
      fecha: datos.fecha || "",
      iva: cleanNumber(datos.iva),
      rete: cleanNumber(datos.rete),
      porcentaje_rete: datos.porcentaje_rete || "",
      ipc: cleanNumber(datos.ipc),
      Tipo_Documento: datos.concepto || "",
      ica: cleanNumber(datos.ica),
      municipio,
      codepostal,
      porcentaje_iva: datos.porcentaje_iva || "19",
      textoExplicativo: datos.textoExplicativo || "",
      tipo_factura: datos.tipo_factura || "",
      Direccion: datos.direccion_detectada || "",
      ciudad_detectada: datos.ciudad_detectada || "",
      icui: datos.icui || "",
      porcentaje_icui: datos.porcentaje_icui || "",
      concepto: datos.detalles_compra || ""
    };

    console.log(resultadoFinal);
    await eliminar(uploadPath);
    return res.json(resultadoFinal);
  } catch (error) {
    console.error("❌ Error en Azure OpenAI:", error?.response?.data || error.message);
    await eliminar(uploadPath);
    return res.status(500).json({ error: "Error al procesar con IA" });
  }
}

async function eliminar(filePath) {
  if (fs_extra.existsSync(filePath)) {
    await fs_extra.unlink(filePath);
  }
}

module.exports = Ocr;
