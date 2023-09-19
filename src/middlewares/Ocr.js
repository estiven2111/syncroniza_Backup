const sharp = require("sharp");
const async = require("async");
const fs = require("fs");
const fs_extra = require("fs-extra");
const path = require("path");
const sleep = require("util").promisify(setTimeout);
const ComputerVisionClient =
  require("@azure/cognitiveservices-computervision").ComputerVisionClient;
const ApiKeyCredentials = require("@azure/ms-rest-js").ApiKeyCredentials;
const axios = require("axios");
 //const brain = require("brain.js");
const key = "292641e03431470eb7f5c30132318dd7";
const endpoint = "https://erpocr.cognitiveservices.azure.com";

const computerVisionClient = new ComputerVisionClient(
  new ApiKeyCredentials({ inHeader: { "Ocp-Apim-Subscription-Key": key } }),
  endpoint
);

async function Ocr(req, res) {
  const { imagen } = req.files;
  const { latitud, longitud } = req.body;
  const { token } = req.body;
  console.log(imagen);
  let imgs;
  let imagePath;
  let imageBuffer;
  let uploadPath;
  let obj;
  imgs = req.files.imagen;
  uploadPath = `uploads/${imgs.name}`;
  imgs.mv(`${uploadPath}`, (err) => {
    if (err) return res.status(500).send(err);

    const anchoDeseado = 800;
    const altoDeseado = 600;

    // Utilizar una promesa para esperar a que la imagen se guarde
    const resizeImage = new Promise((resolve, reject) => {
      sharp(uploadPath)
        .resize(anchoDeseado, altoDeseado, { fit: "inside" })
        .toFile(`uploads/imagenrender.png`, (err) => {
          if (err) {
            res.json({"error": err});
            reject(err);
            return
          } else {
            console.log("Imagen redimensionada correctamente.");
            resolve();
          }
        });
    });

    // Continuar con el resto de la lógica después de que la imagen se haya redimensionado
    resizeImage
      .then(() => {
        // Aquí puedes realizar otras operaciones con la imagen redimensionada
        // o enviar una respuesta al cliente, si es necesario.
        let municipio;
        let codepostal;
        imagePath = "uploads/imagenrender.png";
        imageBuffer = fs.readFileSync("uploads/imagenrender.png");
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
              const ubicacion = await axios.get(geoUrl);
              codepostal = ubicacion.data.address.postcode;
              municipio = ubicacion.data.address.town;
              const printedResult = await readTextFromStream(
                computerVisionClient,
                imageBuffer
              );
              printRecText(printedResult);

              async function readTextFromStream(client, image) {
                let result = await client.readInStream(image);
                let operation = result.operationLocation
                  .split("/")
                  .slice(-1)[0];

                while (result.status !== "succeeded") {
                  await sleep(1000);
                  result = await client.getReadResult(operation);
                }
                return result.analyzeResult.readResults;
              }

              async function printRecText(readResults) {
                console.log("Recognized text:");

                for (const page in readResults) {
                  console.log("page:" + page)
                  if (readResults.length > 1) {
                    console.log(`==== Page: ${page}`);
                  }
                  const result = readResults[page];
                  if (result.lines.length) {
                    for (const line of result.lines) {
                      texto += line.words.map((w) => w.text).join(" ") + " ";
                      console.log(texto)
                    }
                  } else {
                    //!  CENTRO DE COSTOS EN DONDE LLEGA
                    obj = {
                      nit: "",
                      numFact: "",
                      doc: "",
                      total: "",
                      nombre: "",
                      fecha: "",
                      iva: "",
                      rete: "",
                      concepto: "",
                      municipio: municipio,
                      codepostal: codepostal,
                    };
                    console.log(obj)
                    res.send(obj);
                  }
                }
                // await fs.unlink(uploadPath);
              }
            },
          ],
          async (err) => {
            if (err) {
              console.error(err);
              res.json({"error": err});
              return
            } else {
              let iva;
              let rete;
              const regexReciboCajaMenor =
                /(RECIBO DE CAJA MENOR)|(CAJA MENOR)|(CAJA MENOR)/i;
              if (regexReciboCajaMenor.test(texto)) {
                const fechaRegex = /(\d{1,2}\/\d{1,2}(?:\/\d{2,4})?)/;
                const fechaMatch = texto.match(fechaRegex);
                const fecha = fechaMatch ? fechaMatch[1] : null;
                console.log("Fecha:", fecha); // Output: 7/6/2023

                const cantidadRegex = /\$\s*([\d.,\s]+)/;
                const cantidadMatch = texto.match(cantidadRegex);
                let cantidad = null;
                if (cantidadMatch) {
                  const cantidadSinSeparadores = cantidadMatch[1].replace(
                    /[^\d]/g,
                    ""
                  );
                  cantidad = parseFloat(
                    cantidadSinSeparadores.replace(",", ".")
                  );
                  iva = (cantidad * 19) / 100;
                  rete = (cantidad * 4) / 100;
                }
                console.log("total pagar:", cantidad);

                const pagadoRegex = /PAGADO A:\s*([^:]+)\s+(?:por )?CONCEPTO/i;
                const pagadoMatch = texto.match(pagadoRegex);
                const pagadoA = pagadoMatch ? pagadoMatch[1].trim() : null;
                console.log("Pagado a:", pagadoA);

                const valorRegex =
                  // /(?:POR|por)?\s*(?:CONCEPTO|concepto) DE:\s*([^:\n]+)\s*VALOR \(en letras\) CÓDIGO FIRMA DE RECIBIDO/i;
                  // /(?:POR\s+)?(?:CONCEPTO(?:\s+DE)?:\s*|CONCEPTO\s+DE\s+)?([^:\n]+)\s*VALOR \(en letras\) CÓDIGO FIRMA DE RECIBIDO/i;
                  // /PAGADO A:\s*([^:]+)\s+CONCEPTO/i;
                  // /(?:CONCEPTO|POR CONCEPTO DE:)\s*([^V]+)\s*VALOR/i;
                  /(?:CONCEPTO|POR CONCEPTO DE:)\s*([^V]+)(?:VALOR|la suma de)/i;
                const valorMatch = texto.match(valorRegex);
                const valor = valorMatch ? valorMatch[1].trim() : null;
                console.log("concepto:", valor);

                const codigoRegex = /CÓDIGO(?: FIRMA DE RECIBIDO)?\s*(\d+)/i;
                const codigoMatch = texto.match(codigoRegex);
                const codigo = codigoMatch ? codigoMatch[1].trim() : null;
                console.log("Código:", codigo);

                // const noRegex = /(?:NIT|NO|FIRMA DE RECIBIDO APROBADO|NIT.|NO.|No.|No)\s*([\d\s]+)/i;
                // const noMatch = texto.match(noRegex);
                // const no = noMatch ? noMatch[1] : null;
                // console.log("nit o cc:", no); // Output: 7038626003

                const noRegex =
                  /(?:NIT|NO|FIRMA\s+DE\s+RECIBIDO\s+APROBADO|NIT\.?|NO\.?|No\.?|No)\s*([\d\s]+)/i;
                const noMatch = texto.match(noRegex);
                const no = noMatch ? noMatch[1].trim() : null;
                console.log("nit o cc:", no);
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
                console.log(pathnomimg);
                console.log(pathnomimgR);
                //eliminar(file)
                obj = {
                  nit: no,
                  numFact: codigo,
                  doc: no,
                  total: cantidad,
                  totalSinIva:"",
                  nombre: pagadoA,
                  fecha: fecha,
                  iva,
                  rete,
                  concepto: valor,
                  municipio: municipio,
                  codepostal: codepostal,
                  ipc:""
                };
                console.log(texto)
                eliminar(pathnomimg);
                eliminar(pathnomimgR);
              }
              res.json(obj);
            }
          }
        );
      })
      .catch((error) => {
        // Manejar cualquier error que ocurra durante el redimensionamiento de la imagen
        res.json({"error": error});
              return
      });
  });

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

//   // Función para entrenar el modelo
// async function trainModel() {
//   // Aquí deberías utilizar un algoritmo de aprendizaje automático
//   // para entrenar el modelo en base a trainingData.
//   // Puedes usar bibliotecas como TensorFlow, PyTorch o scikit-learn
//   // para crear y entrenar tu modelo.

//   // Datos de entrenamiento (texto_extraído, número_de_factura)
// const trainingData = [
//   { input: "Texto de la imagen 1", output: "123456" },
//   { input: "Texto de la imagen 2", output: "987654" }
// ];

// // Crear una instancia de red neuronal
// const net = new brain.recurrent.LSTM();

// // Formatear los datos para la red neuronal
// const formattedData = trainingData.map(data => ({
//   input: data.input,
//   output: data.output
// }));

// // Entrenar el modelo
// net.train(formattedData);



// // Ejemplo de uso
// const extractedText = "Texto extraído de una imagen";
// const predictedInvoiceNumber = predictInvoiceNumber(extractedText);

// console.log("Número de factura predicho:", predictedInvoiceNumber);

//   // Retorna el modelo entrenado
//   return trainedModel;
// }
// // Función para predecir el número de factura dado el texto
// function predictInvoiceNumber(text) {
//   const output = net.run(text);
//   return output;
// }



}

module.exports = Ocr;
