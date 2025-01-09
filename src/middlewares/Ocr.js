// const natural = require("natural");
const sharp = require("sharp");
const async = require("async");
const fs = require("fs");
const fs_extra = require("fs-extra");
const path = require("path");
const sleep = require("util").promisify(setTimeout);
const ComputerVisionClient =
  require("@azure/cognitiveservices-computervision").ComputerVisionClient;
const ApiKeyCredentials = require("@azure/ms-rest-js").ApiKeyCredentials;
const { key, endpoint, apiKey, apiUrl } = process.env;
const axios = require("axios");
// const nlp = require('compromise');
// const { NlpManager } = require("node-nlp");
//const brain = require("brain.js");

const computerVisionClient = new ComputerVisionClient(
  new ApiKeyCredentials({ inHeader: { "Ocp-Apim-Subscription-Key": key } }),
  endpoint
);

async function Ocr(req, res) {
  const { latitud, longitud } = req.body;

  const geoUrl = `https://nominatim.openstreetmap.org/reverse?lat=${latitud}&lon=${longitud}&format=json`;

  const response = await axios.get(geoUrl, {
    headers: {
      "User-Agent": "TuAplicacion/1.0 (tu_email@ejemplo.com)", // Cambia esto para identificar tu aplicación
    },
  });

  const { token } = req.body;
  console.log(latitud, longitud);
  let imgs;
  let imagePath;
  let imageBuffer;
  let uploadPath;
  let objeto;
  imgs = req.files.imagen;
  if (imgs) {
    console.log("si hay imagen");
  } else {
    return res.send("debes subir una imagen");
  }
  uploadPath = `uploads/${imgs.name}`;
  imgs.mv(`${uploadPath}`, (err) => {
    if (err) {
      console.log("el error: " + err.message);
      return;
      //  res.status(500).send(err)
    }

    if (uploadPath.split(".").pop("") === "pdf") {
      readOcr(uploadPath);
    } else {
      const anchoDeseado = 800;
      const altoDeseado = 600;

      // Utilizar una promesa para esperar a que la imagen se guarde
      const resizeImage = new Promise((resolve, reject) => {
        sharp(uploadPath)
          .resize(anchoDeseado, altoDeseado, { fit: "inside" })
          .toFile(`uploads/imagenrender.png`, (err) => {
            if (err) {
              console.error("Error al redimensionar la imagen:", err);
              reject(err);
            } else {
              console.log("Imagen redimensionada correctamente.");
              resolve();
            }
          });
      });
      // Continuar con el resto de la lógica después de que la imagen se haya redimensionado
      resizeImage
        .then(() => {
          readOcr("uploads/imagenrender.png");
        })
        .catch((error) => {
          // Manejar cualquier error que ocurra durante el redimensionamiento de la imagen
          res.status(500).send("Error al redimensionar la imagen.");
        });
    }
  });

  const readOcr = (paths) => {
    try {
      let municipio;
      let codepostal;
      imagePath = paths;
      imageBuffer = fs.readFileSync(paths);
      let texto = "";
      let texto1 = [];
      let cont = 0;
      async.series(
        [
          async function () {
            console.log("-------------------------------------------------");
            console.log("READ PRINTED, HANDWRITTEN TEXT AND PDF");
            console.log();

            console.log(
              "Read printed text from local file:",
              imagePath.split("/").pop()
            );

            const geoUrl = `https://nominatim.openstreetmap.org/reverse?lat=${latitud}&lon=${longitud}&format=json`;

            try {
              const ubicacion = await axios.get(geoUrl, {
                headers: {
                  "User-Agent": "TuAplicacion/1.0 (tu_email@ejemplo.com)", // Cambia esto para identificar tu aplicación
                },
              });
              codepostal = ubicacion.data.address.postcode;
              if (ubicacion.data.address.city) {
                municipio = ubicacion.data.address.city;
              }
              if (ubicacion.data.address.county) {
                municipio = ubicacion.data.address.county;
              }
              if (ubicacion.data.address.town) {
                municipio = ubicacion.data.address.town;
              }
            } catch (error) {}

            const printedResult = await readTextFromStream(
              computerVisionClient,
              imageBuffer
            );
            printRecText(printedResult);

            async function readTextFromStream(client, image) {
              let result = await client.readInStream(image);
              let operation = result.operationLocation.split("/").slice(-1)[0];

              while (result.status !== "succeeded") {
                await sleep(1000);
                result = await client.getReadResult(operation);
              }
              return result.analyzeResult.readResults;
            }

            async function printRecText(readResults) {
              console.log("Recognized text:");

              for (const page in readResults) {
                console.log("page:" + page);
                if (readResults.length > 1) {
                  console.log(`==== Page: ${page}`);
                }
                const result = readResults[page];
                if (result.lines.length) {
                  for (const line of result.lines) {
                    texto += line.words.map((w) => w.text).join(" ") + " ";
                    // console.log("e",texto)
                  }
                } else {
                  //!  CENTRO DE COSTOS EN DONDE LLEGA
                  objeto = {
                    nit: "",
                    numFact: "",
                    doc: "",
                    total: "",
                    totalSinIva: "",
                    nombre: "",
                    razon_social: "",
                    fecha: "",
                    iva: "",
                    rete: "",
                    ipc: "",
                    concepto: "",
                    municipio: municipio,
                    codepostal: codepostal,
                  };
                }
              }
            }
          },
        ],
        async (err) => {
          if (err) {
            console.error(err);
            res.status(500).json({ error: "Error al procesar la imagen" });
          } else {
            try {
              objeto = {
                nit: "",
                numFact: "",
                doc: "",
                total: "",
                totalSinIva: "",
                nombre: "",
                razon_social: "",
                fecha: "",
                iva: "",
                rete: "",
                ipc: "",
                concepto: "",
                ica: "",
                municipio: municipio,
                codepostal: codepostal,
              };
              const textoEnMinusculas = texto.toLowerCase();
              console.log(textoEnMinusculas);

              const datos = await extraerEntidades(textoEnMinusculas);
              console.log(typeof datos, "datooooooooooss", datos);

              objeto.nit = datos.nit;
              objeto.numFact = datos.numFact;
              objeto.total = datos.total;
              objeto.totalSinIva = datos.totalSinIva;
              objeto.razon_social = datos.razon_social;
              objeto.fecha = datos.fecha;
              objeto.iva = datos.iva;
              objeto.rete = datos.rete;
              objeto.ipc = datos.ipc;
              objeto.concepto = datos.Concepto;
              objeto.ica = datos.ica;
            } catch (error) {
              console.log(error);
            }
            //? ELIMINACION DE IMAGEN TEMPORAL
            const pathnomimg = path.join(
              __dirname,
              "../..",
              "uploads",
              imgs.name
            );
            const pathnomimgR = path.join(
              __dirname,
              "../..",
              "uploads",
              "imagenrender.png"
            );
            eliminar(pathnomimg);
            eliminar(pathnomimgR);
            if (objeto.total) {
              console.log(objeto.total);
              objeto.total = parseFloat(objeto.total);
            }
            if (objeto.totalSinIva) {
              objeto.totalSinIva = parseFloat(objeto.totalSinIva);
            }
            console.log(objeto);
            res.json(objeto);
          }
        }
      );
    } catch (error) {
      res.json("error en lectura del archivo");
    }
  };

  async function extraerEntidades(texto) {
    try {
      const response = await axios.post(
        apiUrl,
        {
          messages: [
            {
              role: "user",
              content: `
             Instrucciones para extraer información de la factura:

Formato de salida:

Cada dato debe estar en el formato [campo]: [dato].
Si el dato no está presente en la factura, el valor debe quedar vacío: "".
Ejemplo: iva: "".
Reglas para los valores monetarios (importante):

Todos los valores monetarios deben ser enteros.
Elimina cualquier parte decimal.
Por ejemplo:
Dado: 65430.25.
Resultado correcto: 65430.
Incorrecto: 6543025 o 65431.
No incluyas el símbolo $ ni separadores de miles (como comas o puntos).
Esta regla aplica a los siguientes campos:
iva
totalSinIva
total
ipc
ica
rete
Diferenciación de Subtotal, IVA y Total:

totalSinIva (Subtotal): Es el valor total sin incluir impuestos como el IVA.
total: Es el valor final, que incluye el IVA y otros impuestos.
iva: Es el valor específico del IVA registrado en la factura.
Nota importante:
Si el campo del subtotal no está en la factura, no lo infieras ni lo calcules.
Si el IVA o el total no están presentes en la factura, déjalos como "".
Manejo de fechas:

El formato de la fecha debe ser siempre DD/MM/YYYY.
Si la fecha tiene texto adicional, conviértela al formato especificado.
Ejemplo: 5 de enero de 2025 → 05/01/2025.
Concepto (producto o servicio):

Si la factura describe un producto, escribe "producto".
Si la factura describe un servicio, escribe "servicio".
Si no hay información sobre el concepto, deja el campo vacío: concepto: "".
Formato de los campos y nombres específicos:
Usa los siguientes nombres de campos:

nit: NIT del emisor.
razon_social: Razón social del emisor.
destinatario: Destinatario adquiriente.
nit_destinatario: NIT del destinatario.
totalSinIva: Subtotal de la factura (sin incluir IVA).
iva: Valor del IVA.
total: Total de la factura (incluyendo IVA).
fecha: Fecha de la factura.
ipc: Valor del impuesto al consumo (ipoconsumo).
ica: Valor de la rete ICA.
rete: Valor de la retefuente.
numFact: Número de la factura.
concepto: Tipo de concepto (producto o servicio).


                Texto: "${texto}"`,
            },
          ],
          max_tokens: 150,
          temperature: 0,
        },
        {
          headers: {
            "Content-Type": "application/json",
            "api-key": apiKey,
          },
        }
      );

      if (response.data.choices && response.data.choices[0].message.content) {
        const completionText = response.data.choices[0].message.content.trim();
        return convertirTextoAObjeto(completionText);
      } else {
        console.error("Estructura inesperada en la respuesta de la API.");
        return null;
      }
    } catch (error) {
      console.error("Error al extraer entidades:", error);
      return null;
    }
  }

  function convertirTextoAObjeto(texto) {
    console.log("inteligencia aaaaaaaaaaaaaaa", texto);
    const objeto = {};
    const lineas = texto.split("\n"); // Dividir por líneas

    lineas.forEach((linea) => {
      const lineaLimpia = linea.replace(/^- /, "").trim();
      const [clave, valor] = lineaLimpia
        .split(":")
        .map((parte) => parte.trim()); // Separar clave y valor

      if (clave && valor !== undefined) {
        objeto[clave] = valor.replace(/^"|"$/g, ""); // Agregar clave y limpiar comillas extra
      }
    });

    return objeto;
  }

  const eliminar = async (file) => {
    if (fs_extra.existsSync(file)) {
      await fs_extra.unlink(file);
    } else {
      console.log("El archivo no existe:", file);
    }
  };

  const ubicacion = async () => {
    try {
    } catch (error) {
      console.error("Error al obtener el código postal:", error.message);
      return null;
    }
  };
}

module.exports = Ocr;
