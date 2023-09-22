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
// const nlp = require('compromise');
// const { NlpManager } = require("node-nlp");
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
  let objeto;
  imgs = req.files.imagen;
  console.log(token);
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
                      fecha: "",
                      iva: "",
                      rete: "",
                      ipc: "",
                      concepto: "",
                      municipio: municipio,
                      codepostal: codepostal,
                    };
                    console.log(objeto);
                    res.send(objeto);
                  }
                }
                // await fs.unlink(uploadPath);
              }

              // async function printRecText(readResults) {
              //   console.log("Recognized text:");
              //   let nombre = ""; // Variable para almacenar el nombre
              //   let valor = ""; // Variable para almacenar el valor

              //   for (const page in readResults) {
              //     console.log("page:" + page)
              //     if (readResults.length > 1) {
              //       console.log(`==== Page: ${page}`);
              //     }
              //     const result = readResults[page];
              //     if (result.lines.length) {
              //       for (const line of result.lines) {
              //         const lineText = line.words.map((w) => w.text).join(" ");
              //         console.log(lineText);

              //         // Buscar un patrón de número decimal (valor) en la línea
              //         const valorMatch = lineText.match(/\d+\.\d+/);
              //         if (valorMatch) {
              //           valor = valorMatch[0];
              //         }
              //         // Buscar un patrón de texto (nombre) en la línea
              //         const nombreMatch = lineText.match(/[A-Za-z]+/);
              //         if (nombreMatch) {
              //           nombre = nombreMatch[0];
              //         }
              //       }
              //     }
              //   }

              //   console.log("Nombre:", nombre);
              //   console.log("Valor:", valor);
              // }
            },
          ],
          async (err) => {
            if (err) {
              console.error(err);
              res.status(500).json({ error: "Error al procesar la imagen" });
            } else {
              objeto = {
                nit: "",
                numFact: "",
                doc: "",
                total: "",
                totalSinIva: "",
                nombre: "",
                fecha: "",
                iva: "",
                rete: "",
                ipc: "",
                concepto: "",
                municipio: municipio,
                codepostal: codepostal,
              };
              const textoEnMinusculas = texto.toLowerCase();
              console.log(textoEnMinusculas)
              const regexFecha = /(\d{2}[-/]\d{2}[-/]\d{2,4})/;

              const resultadoFecha = textoEnMinusculas.match(regexFecha);
              if (resultadoFecha) {
                // Si se encontró una fecha, el primer elemento en resultadoFecha contiene la fecha encontrada
                const fechaEncontrada = resultadoFecha[0];
                console.log("Fecha encontrada:", fechaEncontrada);
                objeto.fecha = fechaEncontrada;
              } else {
                const fechaIndex = textoEnMinusculas.indexOf("fecha:");
                if (fechaIndex !== -1) {
                  // Extrae la fecha que sigue a "Fecha"
                  const fecha = texto
                    .substr(fechaIndex + "fecha:".length, 10)
                    .trim();
                  console.log("FECHA:", fecha);
                  objeto.fecha = fecha;
                }
              }
              // Expresión regular para buscar "nit:" o "no:" seguido de números
              const regexNitNo = /nit\s*([\d.-]+)/i;
              // /(nit|no)\s*(\d+)/i;
              const resultadoNitNo = textoEnMinusculas.match(regexNitNo);

              if (resultadoNitNo) {
                const palabraClave = resultadoNitNo[1];
                console.log(`nit encontrado: ${palabraClave}`);
                objeto.nit = palabraClave;
              } else {
                const regexNitNo = /nit:\s*([\d.-]+)/i;
                const resultadoNitNo = textoEnMinusculas.match(regexNitNo);
                if (resultadoNitNo) {
                  const palabraClave = resultadoNitNo[1];
                  console.log(`nit encontrado1: ${palabraClave}`);
                  objeto.nit = palabraClave;
                } else {
                  const regexNitNo = /nit.\s*([\d.-]+)/i;
                  const resultadoNitNo = textoEnMinusculas.match(regexNitNo);
                  if (resultadoNitNo) {
                    const palabraClave = resultadoNitNo[1];
                    console.log(`nit encontrado2: ${palabraClave}`);
                    objeto.nit = palabraClave;
                  } else {
                    // const regexNitNo = /no\s*([\d.-]+)/i;
                    const regexNitNo = /no[:.]?\s*([\d.-]+)/gi;
                    const resultadoNitNo = textoEnMinusculas.match(regexNitNo);
                    if (resultadoNitNo) {
                      const palabraClave = resultadoNitNo[1];
                      console.log(`nit encontrado2: ${palabraClave}`);
                      objeto.nit = palabraClave;
                    } else {
                      // Buscar "nit:" o "no:" en el texto utilizando indexOf
                      const indiceNitNo =
                        textoEnMinusculas.toLowerCase().indexOf("nit:") !== -1
                          ? textoEnMinusculas.toLowerCase().indexOf("nit:")
                          : textoEnMinusculas.toLowerCase().indexOf("no:");
                      if (indiceNitNo !== -1) {
                        const valorTexto = texto.substr(indiceNitNo).trim();
                        console.log("nit encontrado 3: " + valorTexto);
                        objeto.nit = valorTexto;
                      }
                    }
                  }
                }
              }

              //todo TOTAL
              const regexvalor = /\$\s*([\d,.]+)/;
              const resultadoValor2 = textoEnMinusculas.match(regexvalor);

              if (resultadoValor2) {
                console.log(`TOTAL: : ${resultadoValor2[1]}`);
                const total = resultadoValor2[1].replace(",", "");
                objeto.total = total;
              } else {
                const regexvalor = /total:\s*([\d,.]+)/i;
                const resultadoValor2 = textoEnMinusculas.match(regexvalor);
                if (resultadoValor2) {
                  console.log(`TOTAL: 1: ${resultadoValor2[1]}`);
                  const total = resultadoValor2[1].replace(",", "");
                  objeto.total = total;
                } else {
                  const regexvalor = /total\s*a\s*pagar:\s*([\d,.]+)/i;
                  const resultadoValor2 = textoEnMinusculas.match(regexvalor);
                  if (resultadoValor2) {
                    console.log(`TOTAL: 2: ${resultadoValor2[1]}`);
                    const total = resultadoValor2[1].replace(",", "");
                    objeto.total = total;
                  } else {
                    const regexvalor = /\bvalor\b/i;
                    const resultadoValor2 = textoEnMinusculas.match(regexvalor);
                    if (resultadoValor2) {
                      console.log(
                        `TOTAL: 2: ${resultadoValor2[1]}`
                      );
                      const total = resultadoValor2[1].replace(",", "");
                      objeto.total = total;
                    } else {
                      const indiceNitNo =
                        textoEnMinusculas.toLowerCase().indexOf("$") !== -1
                          ? textoEnMinusculas.toLowerCase().indexOf("total:")
                          : textoEnMinusculas.toLowerCase().indexOf("total");
                      if (indiceNitNo !== -1) {
                        const valorTexto = texto.substr(indiceNitNo).trim();
                        console.log("TOTAL 3: " + valorTexto);
                        const total = valorTexto.replace(",", "");
                        objeto.total = total;
                      }
                    }
                  }
                }
              }

              // todo descripcion conceptos
              const regexDescrip = /descripción\s+(\d+)/;
              const resultadoDescrip = textoEnMinusculas.match(regexDescrip);

              if (resultadoDescrip) {
                const palabraClave = resultadoDescrip[1];
                console.log(`DESCRIPCION ${palabraClave}`);
                objeto.concepto = palabraClave;
              } else {
                const regexDescrip = /descripcion\s+(\d+)/;
                const resultadoDescrip = textoEnMinusculas.match(regexDescrip);
                if (resultadoDescrip) {
                  const palabraClave = resultadoDescrip[1];
                  console.log(`DESCRIPCION 1: ${palabraClave}`);
                  objeto.concepto = palabraClave;
                }else{
                  const regexDescrip = /por\s+concepto\s+de:\s*([^0-9]+)/i;
                const resultadoDescrip = textoEnMinusculas.match(regexDescrip);
                if (resultadoDescrip) {
                  const palabraClave = resultadoDescrip[1];
                  console.log(`CONCEPTO ${palabraClave}`);
                  objeto.concepto = palabraClave;
                } else {
                  const regexDescrip = /descripción:\s*([^0-9]+)/i;
                  const resultadoDescrip =
                    textoEnMinusculas.match(regexDescrip);
                  if (resultadoDescrip) {
                    const palabraClave = resultadoDescrip[1];
                    console.log(`CONCEPTO 1 ${palabraClave}`);
                    objeto.concepto = palabraClave;
                  }
                }
                }
              }

              // todo numero de factura
              const regexNoFact = /no.\s*([\d.-]+)/i;
              const resultadoNoFact = textoEnMinusculas.match(regexNoFact);

              if (resultadoNoFact) {
                const palabraClave = resultadoNoFact[1];
                console.log(`Numero Factura ${palabraClave}`);
                objeto.numFact = palabraClave;
              }else{
                const regexNoFact = /no\s*([\d.-]+)/i;
              const resultadoNoFact = textoEnMinusculas.match(regexNoFact);
                if (resultadoNoFact) {
                  const palabraClave = resultadoNoFact[1];
                  console.log(`Numero Factura ${palabraClave}`);
                  objeto.numFact = palabraClave;
                }
              }

              //todo totalSinIva 
              const regextotalSinIva = /subtotal:\s*([\d,.]+)/i;
              const resultadototalSinIva = textoEnMinusculas.match(regextotalSinIva);

              if (resultadototalSinIva) {
                console.log(`totalSinIva: ${resultadototalSinIva[1]}`);
                const totalSinIva = resultadototalSinIva[1].replace(",", "");
                objeto.totalSinIva = totalSinIva;
              }

               //todo IPC
               const regexIPC = /ipc:\s*([\d,.]+)/i;
               const resultadoIPC = textoEnMinusculas.match(regexIPC);
 
               if (resultadoIPC) {
                 console.log(`ipc: ${resultadoIPC[1]}`);
                 const IPC = resultadoIPC[1].replace(",", "");
                 objeto.ipc = IPC;
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
                console.log(objeto.total)
                // const total = objeto.total.replace(".", "");
                // console.log(total)
                objeto.total = parseFloat(objeto.total)
              }
              if (objeto.totalSinIva) {
                objeto.totalSinIva = parseFloat(objeto.totalSinIva)
              }
              console.log(objeto)
              res.json(objeto);
            }
          }
        );
      })
      .catch((error) => {
        // Manejar cualquier error que ocurra durante el redimensionamiento de la imagen
        res.status(500).send("Error al redimensionar la imagen.");
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
