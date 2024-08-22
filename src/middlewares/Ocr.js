const natural = require("natural");
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
  const { latitud, longitud } = req.body;

  //   const geoUrl = `https://nominatim.openstreetmap.org/reverse?lat=${latitud}&lon=${longitud}&format=json`;
  //   try {
  //    const ubicacion = await axios.get(geoUrl, {
  //      headers: {
  //        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
  //      },
  //      xsrfCookieName: '',
  //      xsrfHeaderName: ''
  //    });
  //    console.log(ubicacion.data);
  //    return ubicacion.data;
  //  } catch (error) {
  //    if (error.response) {
  //      console.error('Error data:', error.response.data);
  //      console.error('Error status:', error.response.status);
  //      console.error('Error headers:', error.response.headers);
  //    } else if (error.request) {
  //      console.error('Error request:', error.request);
  //    } else {
  //      console.error('Error message:', error.message);
  //    }
  //  }

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

    // res.json("imagen")
    // return
  });

  const readOcr = (paths) => {
    try {
      // Aquí puedes realizar otras operaciones con la imagen redimensionada
      // o enviar una respuesta al cliente, si es necesario.
      // console.log(path)
      // res.json(path)
      // return
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
            // const geoUrl = `https://nominatim.openstreetmap.org/reverse?lat=${latitud}&lon=${longitud}&format=json`;
            // const ubicacion = await axios.get(geoUrl);
            // codepostal = ubicacion.data.address.postcode;
            // if (ubicacion.data.address.city) {
            //   municipio = ubicacion.data.address.city;
            // }
            // if (ubicacion.data.address.county) {
            //   municipio = ubicacion.data.address.county;
            // }
            // if (ubicacion.data.address.town) {
            //   municipio = ubicacion.data.address.town;
            // }

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

            //   const geoUrl = `https://nominatim.openstreetmap.org/reverse?lat=${latitud}&lon=${longitud}&format=json`;
            //   try {
            //    const ubicacion = await axios.get(geoUrl, {
            //      headers: {
            //        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            //      },
            //      xsrfCookieName: '',
            //      xsrfHeaderName: ''
            //    });
            //    console.log(ubicacion.data);
            //    return ubicacion.data;
            //  } catch (error) {
            //    if (error.response) {
            //      console.error('Error data:', error.response.data);
            //      console.error('Error status:', error.response.status);
            //      console.error('Error headers:', error.response.headers);
            //    } else if (error.request) {
            //      console.error('Error request:', error.request);
            //    } else {
            //      console.error('Error message:', error.message);
            //    }
            //  }

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
                  // console.log(objeto);
                  // res.send(objeto);
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
                console.log(`nit encontrado: ${palabraClave.split("-")[0]}`);

                objeto.nit = palabraClave.split("-")[0];
              } else {
                const regexNitNo = /nit:\s*([\d.-]+)/i;
                const resultadoNitNo = textoEnMinusculas.match(regexNitNo);
                if (resultadoNitNo) {
                  const palabraClave = resultadoNitNo[1];
                  console.log(`nit encontrado1: ${palabraClave}`);

                  objeto.nit = palabraClave.split("-")[0];
                } else {
                  const regexNitNo = /nit.\s*([\d.-]+)/i;
                  const resultadoNitNo = textoEnMinusculas.match(regexNitNo);
                  if (resultadoNitNo) {
                    const palabraClave = resultadoNitNo[1];
                    console.log(`nit encontrado2: ${palabraClave}`);

                    objeto.nit = palabraClave.split("-")[0];
                  } else {
                    // const regexNitNo = /no\s*([\d.-]+)/i;
                    const regexNitNo = /no[:.]?\s*([\d.-]+)/gi;
                    const resultadoNitNo = textoEnMinusculas.match(regexNitNo);
                    if (resultadoNitNo) {
                      const palabraClave = resultadoNitNo[1];
                      console.log(`nit encontrado2: ${palabraClave}`);

                      objeto.nit = palabraClave.split("-")[0];
                    } else {
                      // Buscar "nit:" o "no:" en el texto utilizando indexOf
                      const indiceNitNo =
                        textoEnMinusculas.toLowerCase().indexOf("nit:") !== -1
                          ? textoEnMinusculas.toLowerCase().indexOf("nit:")
                          : textoEnMinusculas.toLowerCase().indexOf("no:");
                      if (indiceNitNo !== -1) {
                        const valorTexto = texto.substr(indiceNitNo).trim();
                        console.log("nit encontrado 3: " + valorTexto);

                        objeto.nit = valorTexto.split("-")[0];
                      }
                    }
                  }
                }
              }

              //todo TOTAL *****************************************
              let regexvalor = /\$\s*([\d,.]+)/;
              // regexvalor = /Total a Pagar (\d{1,3}(?:,\d{3})*(?:\.\d{2}))/i

              let resultadoValor2 = textoEnMinusculas.match(regexvalor);

              if (resultadoValor2) {
                console.log(`TOTAL: : ${resultadoValor2[1]}`);
                const valorSinComas = resultadoValor2[1].replace(/,/g, "");
                const total = Math.floor(parseFloat(valorSinComas));
                objeto.total = total;
              }

              regexvalor = /total:\s*([\d,.]+)/i;
              // const regex = /TOTAL:\s*([\d,]+\.\d{2})/;
              resultadoValor2 = textoEnMinusculas.match(regexvalor);
              if (resultadoValor2) {
                console.log(`TOTAL: 1: ${resultadoValor2[1]}`);
                const valorSinComas = resultadoValor2[1].replace(/,/g, "");
                const total = Math.floor(parseFloat(valorSinComas));
                objeto.total = total;
              }

              regexvalor =
                /total\s*a\s*pagar:\s*([\d.]+(?:,\d{3})*(?:\.\d{2})?)/i;
              resultadoValor2 = textoEnMinusculas.match(regexvalor);
              if (resultadoValor2) {
                console.log(`TOTAL: a pagar: ${resultadoValor2[1]}`);
                const valorSinComas = resultadoValor2[1].replace(/,/g, "");
                const total = Math.floor(parseFloat(valorSinComas));
                objeto.total = total;
              }

              regexvalorNumerico = /\bvalor\s*:\s*([\d,.]+)/i;
              resultadoValor2 = textoEnMinusculas.match(regexvalor);
              if (resultadoValor2) {
                console.log(`TOTAL: 2333: ${resultadoValor2[1]}`);
                const valorSinComas = resultadoValor2[1].replace(/,/g, "");
                const total = Math.floor(parseFloat(valorSinComas));
                objeto.total = total;
              }

              regexvalor =
                /total\s*a\s*pagar:\s*([\d.]+(?:,\d{3})*(?:\.\d{2})?)/i;
              resultadoValor2 = textoEnMinusculas.match(regexvalor);
              if (resultadoValor2) {
                console.log(`TOTAL: a pagar: ${resultadoValor2[1]}`);
                const valorSinComas = resultadoValor2[1].replace(/,/g, "");
                const total = Math.floor(parseFloat(valorSinComas));
                objeto.total = total;
              }
              regexvalor = /Total a Pagar (\d{1,3}(?:,\d{3})*(?:\.\d{2}))/i;
              resultadoValor2 = textoEnMinusculas.match(regexvalor);
              if (resultadoValor2) {
                console.log(`TOTAL: a pagar: ${resultadoValor2[1]}`);
                // const total = resultadoValor2[1].replace(",", "");
                const valorSinComas = resultadoValor2[1].replace(/,/g, "");
                const total = Math.floor(parseFloat(valorSinComas));
                objeto.total = total;
              }

              // const indiceNitNo =
              //   textoEnMinusculas.toLowerCase().indexOf("$") !== -1
              //     ? textoEnMinusculas.toLowerCase().indexOf("total:")
              //     : textoEnMinusculas.toLowerCase().indexOf("total");
              // if (indiceNitNo !== -1) {
              //   const valorTexto = texto.substr(indiceNitNo).trim();
              //   // console.log("TOTAL 3: " + valorTexto);
              //   // const total = valorTexto.replace(",", "");
              //   const valorSinComas = valorTexto.replace(/,/g, '');
              //     const total = Math.floor(parseFloat(valorSinComas));
              //   objeto.total = total;
              // }

              //todo totalSinIva SUBTOTAL *************************************************
              const regextotalSinIva = /subtotal:\s*([\d,.]+)/i;
              const resultadototalSinIva =
                textoEnMinusculas.match(regextotalSinIva);

              if (resultadototalSinIva) {
                console.log(`totalSinIva: ${resultadototalSinIva[1]}`);
                const valorSinComas = resultadototalSinIva[1].replace(/,/g, "");
                const totalSinIva = Math.floor(parseFloat(valorSinComas));
                objeto.totalSinIva = totalSinIva;
              } else {
                const regextotalSinIva = /subtotali\s*([\d,.]+)/i;
                const resultadototalSinIva =
                  textoEnMinusculas.match(regextotalSinIva);
                if (resultadototalSinIva) {
                  const valorSinComas = resultadototalSinIva[1].replace(
                    /,/g,
                    ""
                  );
                  const totalSinIva = Math.floor(parseFloat(valorSinComas));
                  objeto.totalSinIva = totalSinIva;
                } else {
                  const regextotalSinIva =
                    /Total Bruto (\d{1,3}(?:,\d{3})*(?:\.\d{2}))/i;
                  const resultadototalSinIva =
                    textoEnMinusculas.match(regextotalSinIva);

                  if (resultadototalSinIva) {
                    console.log(`totalSinIva: ${resultadototalSinIva[1]}`);

                    // Eliminar las comas
                    const valorSinComas = resultadototalSinIva[1].replace(
                      /,/g,
                      ""
                    );
                    const valorFinal = Math.floor(parseFloat(valorSinComas));
                    objeto.totalSinIva = valorFinal;
                  }
                }
              }

              // const regexvalor = /\$\s*([\d,.]+)/;
              // // const regexvalor = /Total a Pagar (\d{1,3}(?:,\d{3})*(?:\.\d{2}))/i

              // const resultadoValor2 = textoEnMinusculas.match(regexvalor);

              // if (resultadoValor2) {
              //   console.log(`TOTAL: : ${resultadoValor2[1]}`);
              //   const total = resultadoValor2[1].replace(",", "");
              //   objeto.total = total;
              // }
              // else {
              //   const regexvalor = /total:\s*([\d,.]+)/i;
              //   const resultadoValor2 = textoEnMinusculas.match(regexvalor);
              //   if (resultadoValor2) {
              //     console.log(`TOTAL: 1: ${resultadoValor2[1]}`);
              //     const total = resultadoValor2[1].replace(",", "");
              //     objeto.total = total;
              //   } else {
              //     // const regexvalor = /total\s*a\s*pagar:\s*([\d,.]+)/i;
              //     const regexValor = /total\s*a\s*pagar:\s*([\d.]+(?:,\d{3})*(?:\.\d{2})?)/i
              //     const resultadoValor2 = textoEnMinusculas.match(regexvalor);
              //     if (resultadoValor2) {
              //       console.log(`TOTAL: a pagar: ${resultadoValor2[1]}`);
              //       const total = resultadoValor2[1].replace(",", "");
              //       objeto.total = total;

              //     } else {
              //       // const regexvalor = /\bvalor\b/i;
              //       const regexValorNumerico = /\bvalor\s*:\s*([\d,.]+)/i;
              //       const resultadoValor2 = textoEnMinusculas.match(regexvalor);
              //       if (resultadoValor2) {
              //         console.log(
              //           `TOTAL: 2333: ${resultadoValor2[1]}`
              //         );
              //         const total = resultadoValor2[1].replace(",", "");
              //         objeto.total = total;
              //       } else {
              //         const regexValor = /total\s*a\s*pagar:\s*([\d.]+(?:,\d{3})*(?:\.\d{2})?)/i
              //     const resultadoValor2 = textoEnMinusculas.match(regexvalor);
              //     if (resultadoValor2) {
              //       console.log(`TOTAL: a pagar: ${resultadoValor2[1]}`);
              //       const total = resultadoValor2[1].replace(",", "");
              //       objeto.total = total;

              //     }else{
              //       const regexValor = /Total a Pagar (\d{1,3}(?:,\d{3})*(?:\.\d{2}))/i
              //     const resultadoValor2 = textoEnMinusculas.match(regexvalor);
              //     if (resultadoValor2) {
              //       console.log(`TOTAL: a pagar: ${resultadoValor2[1]}`);
              //       const total = resultadoValor2[1].replace(",", "");
              //       objeto.total = total;

              //     }else{
              //       const indiceNitNo =
              //       textoEnMinusculas.toLowerCase().indexOf("$") !== -1
              //         ? textoEnMinusculas.toLowerCase().indexOf("total:")
              //         : textoEnMinusculas.toLowerCase().indexOf("total");
              //     if (indiceNitNo !== -1) {
              //       const valorTexto = texto.substr(indiceNitNo).trim();
              //       console.log("TOTAL 3: " + valorTexto);
              //       const total = valorTexto.replace(",", "");
              //       objeto.total = total;
              //     }
              //     }

              //     }

              //       }
              //     }
              //   }
              // }

              // todo descripcion conceptos esto para descripcion si se llegase a necesitar por el momento servicio o producto
              // const regexDescrip = /descripción\s+(\d+)/;
              // const resultadoDescrip = textoEnMinusculas.match(regexDescrip);

              // if (resultadoDescrip) {
              //   const palabraClave = resultadoDescrip[1];
              //   console.log(`DESCRIPCION ${palabraClave}`);
              //   objeto.concepto = palabraClave;
              // } else {
              //   const regexDescrip = /descripcion\s+(\d+)/;
              //   const resultadoDescrip =
              //     textoEnMinusculas.match(regexDescrip);
              //   if (resultadoDescrip) {
              //     const palabraClave = resultadoDescrip[1];
              //     console.log(`DESCRIPCION 1: ${palabraClave}`);
              //     objeto.concepto = palabraClave;
              //   } else {
              //     const regexDescrip = /por\s+concepto\s+de:\s*([^0-9]+)/i;
              //     const resultadoDescrip =
              //       textoEnMinusculas.match(regexDescrip);
              //     if (resultadoDescrip) {
              //       const palabraClave = resultadoDescrip[1];
              //       console.log(`CONCEPTO ${palabraClave}`);
              //       objeto.concepto = palabraClave;
              //     } else {
              //       const regexDescrip = /descripción:\s*([^0-9]+)/i;
              //       const resultadoDescrip =
              //         textoEnMinusculas.match(regexDescrip);
              //       if (resultadoDescrip) {
              //         const palabraClave = resultadoDescrip[1];
              //         console.log(`CONCEPTO 1 ${palabraClave}`);
              //         objeto.concepto = palabraClave;
              //       } else {
              //         const regexobservacion = /observaciones:\s*([\s\S]*)/i;

              //         // Buscar la dirección del cliente en el texto
              //         const match = textoEnMinusculas.match(regexobservacion);

              //         // Si se encontró la dirección del cliente, extraer el valor
              //         if (match && match[1]) {
              //           const observacion = match[1].trim();
              //           console.log(
              //             `observaciones: ${observacion}`
              //           );
              //           objeto.concepto = observacion
              //         } else {
              //           console.log(
              //             "no se encontraron observaciones"
              //           );
              //         }
              //       }
              //     }
              //   }
              // }

              //TODO CONCEPTO SERVICIO O PRODUCTO

              // Buscar la palabra "servicio" o "producto" en el texto
              var servicioRegex = /\bservicio\b/gi;
              var productoRegex = /\bproducto\b/gi;

              // Verificar si se encuentra la palabra "servicio"
              if (servicioRegex.test(textoEnMinusculas)) {
                console.log("Se encontró la palabra 'servicio'.");
                objeto.concepto = "servicio";
                // Aquí puedes hacer más acciones si se encuentra la palabra "servicio"
              } else if (productoRegex.test(textoEnMinusculas)) {
                console.log("Se encontró la palabra 'producto'.");
                objeto.concepto = "producto";
                // Aquí puedes hacer más acciones si se encuentra la palabra "producto"
              } else {
                objeto.concepto = "";
              }

              //TODO: RAZON SOCIAL

              // const regexRazonSocial =
              // /razón\s+social\/nombre:\s+(.*?)(?=\s*razón\s+social\/nombre:|$)/i;
              const regexRazonSocial =
                /razón\s+social\/nombre:\s+(.*?)(?=\s*nit:|$)/i;

              // Buscar la razón social en el texto
              const resultadoRazonSocial =
                textoEnMinusculas.match(regexRazonSocial);

              // Si se encontró la razón social, extraer el valor
              if (resultadoRazonSocial) {
                const razonSocial = resultadoRazonSocial[1];
                console.log(
                  `Razón Social************************: ${razonSocial}`
                );
                objeto.razon_social = razonSocial;
              } else {
                const regexDestinatario = /destinatario\s+([^0-9]+)/i;

                // Buscar el destinatario en el texto
                const match = textoEnMinusculas.match(regexDestinatario);

                // Si se encontró el destinatario, extraer el valor
                if (match && match[1]) {
                  const destinatario = match[1].trim();
                  console.log(`Destinatario: ${destinatario}`);
                  objeto.razon_social = destinatario;
                } else {
                  const regexPagadoA = /pagado\s+a:\s+([^:\n]+)/i;

                  // Buscar "pagado a" en el texto
                  const match = textoEnMinusculas.match(regexPagadoA);

                  // Si se encontró "pagado a", extraer el valor
                  if (match && match[1]) {
                    const pagadoA = match[1].trim();
                    console.log(`Pagado a: ${pagadoA}`);
                    objeto.razon_social = pagadoA;
                  } else {
                    console.log(
                      'Información de "pagado a" no encontrada en el texto.'
                    );
                  }
                }
              }

              //todo *********nlp natural
              //

              // todo numero de factura
              const regexNoFact = /no.\s*([\d.-]+)/i;
              const resultadoNoFact = textoEnMinusculas.match(regexNoFact);

              if (resultadoNoFact) {
                const palabraClave = resultadoNoFact[1];
                console.log(`Numero Factura ${palabraClave}`);
                objeto.numFact = palabraClave;
              } else {
                const regexNoFact = /no\s*([\d.-]+)/i;
                const resultadoNoFact = textoEnMinusculas.match(regexNoFact);
                if (resultadoNoFact) {
                  const palabraClave = resultadoNoFact[1];
                  console.log(`Numero Factura ${palabraClave}`);
                  objeto.numFact = palabraClave;
                }
              }

              //todo IPC
              //  const regexIPC = /inc : 8\.00% (\d{1,3}(?:,\d{3})*(?:\.\d{2})?)/;

              // const regexIPC =
              //   /inc : 8\.00% (\d{1,3}(?:,\d{3})*(?:\.\d{2})?)/;

              // const resultadoIPC = textoEnMinusculas.match(regexIPC);
              // if (resultadoIPC !== null && resultadoIPC !== undefined) {
              //   console.log(`ipccccccccccccccccccc: ${resultadoIPC[1]}`);
              //   const IPC = resultadoIPC[1].replace(",", "");
              //   objeto.ipc = IPC;
              // } else {
              //   const regexIPC =
              //     /Impoconsumo 8% (\d{1,3}(?:,\d{3})*(?:\.\d{2}))/i;

              //   const resultadoIPC = textoEnMinusculas.match(regexIPC);
              //   if (resultadoIPC !== null && resultadoIPC !== undefined) {
              //     const IPC = resultadoIPC[1].replace(",", "");
              //     objeto.ipc = IPC;
              //   }
              // }

              const variableipc = /impoconsumo (\d+(\.\d+)?)%/i; // La "i" al final hace que la búsqueda sea insensible a mayúsculas/minúsculas
              const porcentajeVariableipc =
                textoEnMinusculas.match(variableipc);

              if (porcentajeVariableipc) {
                const regex = new RegExp(
                  `impoconsumo\\s*${porcentajeVariableipc[1]}%\\s*(\\d{1,3}(?:,\\d{3})*(?:\\.\\d{2}))`
                );
                const match = textoEnMinusculas.match(regex);

                if (match) {
                  const impoconsumoValue = match[1];
                  console.log("Valor de Impoconsumo:", impoconsumoValue);
                } else {
                  console.log("No se encontró el valor de Impoconsumo");
                }
              } else {
                console.log("No se encontró el porcentaje de Impoconsumo");
              }

              const variableipc1 = /inc (\d+(\.\d+)?)%/i; // La "i" al final hace que la búsqueda sea insensible a mayúsculas/minúsculas
              const porcentajeVariableipc1 =
                textoEnMinusculas.match(variableipc1);

              if (porcentajeVariableipc1) {
                const regex = new RegExp(
                  `inc\\s*${porcentajeVariableipc1[1]}%\\s*(\\d{1,3}(?:,\\d{3})*(?:\\.\\d{2}))`
                );
                const match = textoEnMinusculas.match(regex);

                if (match) {
                  const impoconsumoValue = match[1];
                  console.log("Valor de Impoconsumo:", impoconsumoValue);
                } else {
                  const regex = /inc(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)/;
                  const match = textoEnMinusculas.match(regex);

                  if (match) {
                    const impoconsumoValue = match[1];
                    console.log("Valor de Impoconsumo:", impoconsumoValue);
                  }
                }
              } else {
                console.log("No se encontró el porcentaje de Impoconsumo");
              }

              //TODO RETE ICA ********
              const variableica = /reteica (\d+(\.\d+)?)%/;
              const porcentajeVariableica =
                textoEnMinusculas.match(variableica);
              if (porcentajeVariableica) {
                // const regex = /reteica \d+% (\d{1,3}(?:,\d{3})*(?:\.\d{2})?)/;

                const regex = new RegExp(
                  `reteica ${porcentajeVariableica[1]}% (\\d{1,3}(?:,\\d{3})*(?:\\.\\d{2}))`
                );
                const match = textoEnMinusculas.match(regex);

                if (match) {
                  const icaValue = match[1];
                  // objeto.ica = icaValue
                  // Eliminar las comas
                  const icaSinComas = icaValue.replace(/,/g, "");
                  const icaFinal = Math.floor(parseFloat(icaSinComas));
                  objeto.ica = icaFinal;

                  console.log("Valor de reteica:", icaFinal);
                } else {
                  console.log("No se encontró el valor de reteica");
                }
              }
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
              // const total = objeto.total.replace(".", "");
              // console.log(total)
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
