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

  // 🗺 Geolocalización
  let municipio = "";
  let codepostal = "";

  try {
    const geoUrl = `https://nominatim.openstreetmap.org/reverse?lat=${latitud}&lon=${longitud}&format=json`;
    const response = await axios.get(geoUrl, {
      headers: {
        "User-Agent": "TuAplicacion/1.0 (tu_email@ejemplo.com)",
      },
    });

    const addr = response.data.address;
    codepostal = addr.postcode || "";
    municipio = addr.city || addr.county || addr.town || "";
  } catch (err) {
    console.warn("No se pudo obtener ubicación:", err.message);
  }

  // 🧠 Si es PDF → usar OCR para extraer texto plano
  if (extension === ".pdf") {
    try {
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
    } catch (error) {
      console.error("❌ Error al procesar PDF:", error.message);
      await eliminar(uploadPath);
      return res.status(500).json({ error: "Error al extraer texto del PDF" });
    }
  } else {
    // 🧠 Si es imagen → optimizar con Sharp y convertir a base64
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
  "codepostal": ""
}

⚠️ Reglas estrictas:

1. Todos los campos deben estar presentes. Si algún dato no está visible en la factura, deja el campo con comillas vacías: "".

2. Usa exactamente los nombres de los campos indicados arriba, sin alterarlos.

3. Para los valores numéricos:
   - No uses comas, puntos, decimales ni el símbolo de pesos.
   - Ejemplo correcto: "19000"
   - Ejemplo incorrecto: "$19.000,00", "19,000.00", "19000.00"

4. El campo "fecha" debe ir en formato DD/MM/YYYY siempre debes ponerlo si lo trae casi todas lo traen.

5. El campo "nit" debe contener solo números (sin guiones ni dígito de verificación).

6. El campo "concepto" debe ser uno de: "producto", "servicio", "honorario" o "".

7. Rete fuente:
   - Si el valor de la retefuente aparece en la factura (ej: "RETE FUENTE: 37.065,88"), úsalo exactamente como está, limpiando comas, puntos y decimales.
   - Solo si NO aparece, calcula:
     - "producto" → 2.5% de "totalSinIva"
     - "servicio" → 4%
     - "honorario" → 11%
   - El resultado se redondea hacia abajo (sin decimales).
   - El campo "porcentaje_rete" debe reflejar el porcentaje aplicado (ej: "2.5%")

8. Si no se puede determinar el concepto, deja "rete" y "porcentaje_rete" vacíos: ""

9. No inventes datos. Extrae solo lo que esté visible.

10. Devuelve solo el JSON. Sin texto fuera del objeto.

11. no pongas los centavos solo deja el valor en pesos colombianos sin comas ni puntos,
 por ejemplo: "19000" y no "19.000,00" o "$19.000,00 omite los valores .00 ,00 o otro numero despues si es centavos 

12 pasame el numero de la factura en campo texto no lo omitas si la factura lo trae o la orden de compra si la trae

13 en el campo de porcentaje_rete debes darme el dato del porcentaje que se aplica a la retefuente, 
por ejemplo: "2.5%" si es un producto, "4%" si es un servicio o "11%" si es un honorario,
 si no lo trae la factura dejalo vacio con comillas: "".
 
 14.si la factura no trae el porcentaje y tu sabes cual es el porcentaje que se aplico por lo que la factura lo trae o no lo traiga y tu lo apliques
 deacuerdo al concepto agregamelo en el campo dl json en el campo de iva siempre necesito ese valor ahi si la factura no trae el concepto
 pero trae el iva deduce cual es el porcentaje que se aplico y ponlo en el campo porcentaje_rete pero si trae el concepto y el iva pon el 
 porcentaje que se aplico en cualquier caso sea que traiga el concepto o no o la retencion o no siempre ponlos sea calculado o sea que lo 
 traiga eso si dale prioridad ala factura que si se ve el dato priorices ese dato sino lo tra calculalo eres un contador experto y
  sabes que hacer dejalo sin el simbolo % solo dame el valor no pongas el simbolo de porcentaje, recuerda no se te olvide el 
  valor de la retefuente si la factura no lo trae aplicalo tu eres un contador experto y sabes que hacer si no lo trae la factura

15. dame un campo porcentaje_iva dentro del json y pon el porcentaje que se aplico al iva de la factura,
por ejemplo: "19%" si es el iva colombiano, si no lo trae la factura pon el que este actualmente vigente en colombia,

16. valida la factura si trae el valor del ica debes ponerlo en el campo ica es muy importante valida bien la facutra para
que no me falte este dato ya si no lo trae la factura ponlo vacio con comillas: "".

17. valida la factura si trae el valor del ipc debes ponerlo en el campo ipc revisa bien la factura ya que 
no solo puede llegar como ipc sino tambien como inc o INC tu sabes como puede llegar valida bien toda la factura y ponme este 
valor que es muy importante y si no lo trae la factura ponlo vacio con comillas: "".

18. la razon social no es la empresa a la que le facturas es la empresa que te factura a ti, eres contador experto sabes 
cual es la razon social de una empresa y cual es el nit de la empresa que te factura a ti ese es el valor que debes poner 

 19. explicame que hiciste , en el campo explicativo textoExplicativo ingresalo dentro del json y explicame lo que haces como sacas los datos 
 explicamelo cortamente pero siempre explicame que hiciste y como lo hiciste, el porcentaje por que es el 19% que es el iva es por la norma colombiana 
 o por que dice la factura tambien dime por que sacaste el 19% en el campo del iva 
`;

  // 🎯 Llamar a Azure OpenAI
  try {
    const messages = [
      {
        role: "system",
        content: "Eres un experto en contabilidad que extrae datos de facturas de manera exepional sin fallas.",
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
      messages.push({
        role: "user",
        content: textoPlano,
      });
    }

    const response = await axios.post(
      apiUrl,
      {
        messages,
        max_tokens: 800,
      },
      {
        headers: {
          "Content-Type": "application/json",
          "api-key": apiKey,
        },
      }
    );

    const content = response.data.choices[0].message.content.trim();
    let datos = {};

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

    const cleanNumber = (val) =>
      val && typeof val === "string" ? val.replace(/[^\d]/g, "") : val;

    const nitLimpio = datos.nit ? datos.nit.split("-")[0] : "";

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
      concepto: datos.concepto || "",
      ica: cleanNumber(datos.ica),
      municipio,
      codepostal,
      porcentaje_iva: datos.porcentaje_iva || "19",
      textoExplicativo: datos.textoExplicativo || "",
    };
    console.log(resultadoFinal)
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


