// const sharp = require("sharp");
// const async = require("async");
// const fs = require("fs");
// const fs_extra = require("fs-extra");
// const path = require("path");
// const sleep = require("util").promisify(setTimeout);
// const ComputerVisionClient =
//   require("@azure/cognitiveservices-computervision").ComputerVisionClient;
// const ApiKeyCredentials = require("@azure/ms-rest-js").ApiKeyCredentials;
// const axios = require("axios");
// // const nlp = require('compromise');
// const { NlpManager } = require("node-nlp");
// //const brain = require("brain.js");
// const key = "292641e03431470eb7f5c30132318dd7";
// const endpoint = "https://erpocr.cognitiveservices.azure.com";

// const computerVisionClient = new ComputerVisionClient(
//   new ApiKeyCredentials({ inHeader: { "Ocp-Apim-Subscription-Key": key } }),
//   endpoint
// );

// async function Ocr(req, res) {
//   const { imagen } = req.files;
//   const { latitud, longitud } = req.body;
//   const { token } = req.body;
//   console.log(imagen);
//   let imgs;
//   let imagePath;
//   let imageBuffer;
//   let uploadPath;
//   let obj;
//   imgs = req.files.imagen;
//   console.log(token);
//   uploadPath = `uploads/${imgs.name}`;
//   imgs.mv(`${uploadPath}`, (err) => {
//     if (err) return res.status(500).send(err);

//     const anchoDeseado = 800;
//     const altoDeseado = 600;

//     // Utilizar una promesa para esperar a que la imagen se guarde
//     const resizeImage = new Promise((resolve, reject) => {
//       sharp(uploadPath)
//         .resize(anchoDeseado, altoDeseado, { fit: "inside" })
//         .toFile(`uploads/imagenrender.png`, (err) => {
//           if (err) {
//             console.error("Error al redimensionar la imagen:", err);
//             reject(err);
//           } else {
//             console.log("Imagen redimensionada correctamente.");
//             resolve();
//           }
//         });
//     });

//     // Continuar con el resto de la lógica después de que la imagen se haya redimensionado
//     resizeImage
//       .then(() => {
//         // Aquí puedes realizar otras operaciones con la imagen redimensionada
//         // o enviar una respuesta al cliente, si es necesario.
//         let municipio;
//         let codepostal;
//         imagePath = "uploads/imagenrender.png";
//         imageBuffer = fs.readFileSync("uploads/imagenrender.png");
//         let texto = "";
//         let texto1 = [];
//         let cont = 0;
//         async.series(
//           [
//             async function () {
//               console.log("-------------------------------------------------");
//               console.log("READ PRINTED, HANDWRITTEN TEXT AND PDF");
//               console.log();

//               console.log(
//                 "Read printed text from local file:",
//                 imagePath.split("/").pop()
//               );
//               const geoUrl = `https://nominatim.openstreetmap.org/reverse?lat=${latitud}&lon=${longitud}&format=json`;
//               const ubicacion = await axios.get(geoUrl);
//               codepostal = ubicacion.data.address.postcode;
//               municipio = ubicacion.data.address.town;
//               const printedResult = await readTextFromStream(
//                 computerVisionClient,
//                 imageBuffer
//               );
//               printRecText(printedResult);

//               async function readTextFromStream(client, image) {
//                 let result = await client.readInStream(image);
//                 let operation = result.operationLocation
//                   .split("/")
//                   .slice(-1)[0];

//                 while (result.status !== "succeeded") {
//                   await sleep(1000);
//                   result = await client.getReadResult(operation);
//                 }
//                 return result.analyzeResult.readResults;
//               }

//               async function printRecText(readResults) {
//                 console.log("Recognized text:");

//                 for (const page in readResults) {
//                   console.log("page:" + page);
//                   if (readResults.length > 1) {
//                     console.log(`==== Page: ${page}`);
//                   }
//                   const result = readResults[page];
//                   if (result.lines.length) {
//                     for (const line of result.lines) {
//                       texto += line.words.map((w) => w.text).join(" ") + " ";
//                       // console.log("e",texto)
//                     }
//                   } else {
//                     //!  CENTRO DE COSTOS EN DONDE LLEGA
//                     obj = {
//                       nit: "",
//                       numFact: "",
//                       doc: "",
//                       total: "",
//                       nombre: "",
//                       fecha: "",
//                       iva: "",
//                       rete: "",
//                       concepto: "",
//                       municipio: municipio,
//                       codepostal: codepostal,
//                     };
//                     console.log(obj);
//                     res.send(obj);
//                   }
//                 }
//                 // await fs.unlink(uploadPath);
//               }

//               // async function printRecText(readResults) {
//               //   console.log("Recognized text:");
//               //   let nombre = ""; // Variable para almacenar el nombre
//               //   let valor = ""; // Variable para almacenar el valor

//               //   for (const page in readResults) {
//               //     console.log("page:" + page)
//               //     if (readResults.length > 1) {
//               //       console.log(`==== Page: ${page}`);
//               //     }
//               //     const result = readResults[page];
//               //     if (result.lines.length) {
//               //       for (const line of result.lines) {
//               //         const lineText = line.words.map((w) => w.text).join(" ");
//               //         console.log(lineText);

//               //         // Buscar un patrón de número decimal (valor) en la línea
//               //         const valorMatch = lineText.match(/\d+\.\d+/);
//               //         if (valorMatch) {
//               //           valor = valorMatch[0];
//               //         }
//               //         // Buscar un patrón de texto (nombre) en la línea
//               //         const nombreMatch = lineText.match(/[A-Za-z]+/);
//               //         if (nombreMatch) {
//               //           nombre = nombreMatch[0];
//               //         }
//               //       }
//               //     }
//               //   }

//               //   console.log("Nombre:", nombre);
//               //   console.log("Valor:", valor);
//               // }
//             },
//           ],
//           async (err) => {
//             if (err) {
//               console.error(err);
//               res.status(500).json({ error: "Error al procesar la imagen" });
//             } else {
//               // let iva;
//               // let rete;
//               // const regexReciboCajaMenor =
//               //   /(RECIBO DE CAJA MENOR)|(CAJA MENOR)|(CAJA MENOR)/i;
//               // if (regexReciboCajaMenor.test(texto)) {
//               //   const fechaRegex = /(\d{1,2}\/\d{1,2}(?:\/\d{2,4})?)/;
//               //   const fechaMatch = texto.match(fechaRegex);
//               //   const fecha = fechaMatch ? fechaMatch[1] : null;
//               //   console.log("Fecha:", fecha); // Output: 7/6/2023

//               //   const cantidadRegex = /\$\s*([\d.,\s]+)/;
//               //   const cantidadMatch = texto.match(cantidadRegex);
//               //   let cantidad = null;
//               //   if (cantidadMatch) {
//               //     const cantidadSinSeparadores = cantidadMatch[1].replace(
//               //       /[^\d]/g,
//               //       ""
//               //     );
//               //     cantidad = parseFloat(
//               //       cantidadSinSeparadores.replace(",", ".")
//               //     );
//               //     iva = (cantidad * 19) / 100;
//               //     rete = (cantidad * 4) / 100;
//               //   }
//               //   console.log("total pagar:", cantidad);

//               //   const pagadoRegex = /PAGADO A:\s*([^:]+)\s+(?:por )?CONCEPTO/i;
//               //   const pagadoMatch = texto.match(pagadoRegex);
//               //   const pagadoA = pagadoMatch ? pagadoMatch[1].trim() : null;
//               //   console.log("Pagado a:", pagadoA);

//               //   const valorRegex =
//               //     // /(?:POR|por)?\s*(?:CONCEPTO|concepto) DE:\s*([^:\n]+)\s*VALOR \(en letras\) CÓDIGO FIRMA DE RECIBIDO/i;
//               //     // /(?:POR\s+)?(?:CONCEPTO(?:\s+DE)?:\s*|CONCEPTO\s+DE\s+)?([^:\n]+)\s*VALOR \(en letras\) CÓDIGO FIRMA DE RECIBIDO/i;
//               //     // /PAGADO A:\s*([^:]+)\s+CONCEPTO/i;
//               //     // /(?:CONCEPTO|POR CONCEPTO DE:)\s*([^V]+)\s*VALOR/i;
//               //     /(?:CONCEPTO|POR CONCEPTO DE:)\s*([^V]+)(?:VALOR|la suma de)/i;
//               //   const valorMatch = texto.match(valorRegex);
//               //   const valor = valorMatch ? valorMatch[1].trim() : null;
//               //   console.log("concepto:", valor);

//               //   const codigoRegex = /CÓDIGO(?: FIRMA DE RECIBIDO)?\s*(\d+)/i;
//               //   const codigoMatch = texto.match(codigoRegex);
//               //   const codigo = codigoMatch ? codigoMatch[1].trim() : null;
//               //   console.log("Código:", codigo);

//               //   // const noRegex = /(?:NIT|NO|FIRMA DE RECIBIDO APROBADO|NIT.|NO.|No.|No)\s*([\d\s]+)/i;
//               //   // const noMatch = texto.match(noRegex);
//               //   // const no = noMatch ? noMatch[1] : null;
//               //   // console.log("nit o cc:", no); // Output: 7038626003

//               //   const noRegex =
//               //     /(?:NIT|NO|FIRMA\s+DE\s+RECIBIDO\s+APROBADO|NIT\.?|NO\.?|No\.?|No)\s*([\d\s]+)/i;
//               //   const noMatch = texto.match(noRegex);
//               //   const no = noMatch ? noMatch[1].trim() : null;
//               //   console.log("nit o cc:", no);
//               //   const pathnomimg = path.join(
//               //     __dirname,
//               //     "../..",
//               //     "uploads",
//               //     imgs.name
//               //   );
//               //   const pathnomimgR = path.join(
//               //     __dirname,
//               //     "../..",
//               //     "uploads",
//               //     "imagenrender.png"
//               //   );
//               //   console.log(pathnomimg);
//               //   console.log(pathnomimgR);
//               //   //eliminar(file)
//               //   obj = {
//               //     nit: no,
//               //     numFact: codigo,
//               //     doc: no,
//               //     total: cantidad,
//               //     totalSinIva:"",
//               //     nombre: pagadoA,
//               //     fecha: fecha,
//               //     iva,
//               //     rete,
//               //     concepto: valor,
//               //     municipio: municipio,
//               //     codepostal: codepostal,
//               //     ipc:""
//               //   };
//               //   console.log(texto)
//               //   eliminar(pathnomimg);
//               //   eliminar(pathnomimgR);
//               // }
//               // res.json(obj);
//               //               const doc = nlp(texto);

//               // // Extraer la fecha (Agosto 02/23)
//               // const fechaMatch = doc.match('Fecha:');
//               // const fecha = fechaMatch.text();
//               // console.log('Fecha:', fecha);

//               // // Extraer el valor (24.000)
//               // const valorMatch = doc.match('$ #Money');
//               // const valor = valorMatch.text();
//               // console.log('Valor:', valor);

//               // // Extraer "PAGADO A:" (Felipe Ortega)
//               // const pagadoAMatch = doc.match('PAGADO A: #Noun+');
//               // const pagadoA = pagadoAMatch.out('text');
//               // console.log('Pagado A:', pagadoA);

//               // // Extraer "POR CONCEPTO DE:" (Firmo pagaré de aseguradora Solidaria - por Juan Manuel incroll en cáfit y luego en ACOSIRiovisión. 59.000)
//               // const conceptoMatch = doc.match('POR CONCEPTO DE: #Noun+');
//               // const concepto = conceptoMatch.out('text');
//               // console.log('Concepto:', concepto);

//               // // Extraer C.C. O NIT (71211744)
//               // const ccNitMatch = doc.match('C.C. O NIT #Value');
//               // const ccNit = ccNitMatch.out('text');
//               // console.log('C.C. O NIT:', ccNit);




//               let objeto = {
//                 nit: "",
//                 numFact: "",
//                 doc: "",
//                 total: "",
//                 subtotal:"",
//                 nombre: "",
//                 fecha: "",
//                 iva: "",
//                 rete: "",
//                 concepto: "",
//                 municipio: municipio,
//                 codepostal: codepostal,
//               };
//               const textoEnMinusculas = texto.toLowerCase();
//               const regexFecha = /(\d{2}[-/]\d{2}[-/]\d{2,4})/;

//               const resultadoFecha = textoEnMinusculas.match(regexFecha);
//               if (resultadoFecha) {
//                 // Si se encontró una fecha, el primer elemento en resultadoFecha contiene la fecha encontrada
//                 const fechaEncontrada = resultadoFecha[0];
//                 console.log("Fecha encontrada:", fechaEncontrada);
//                 objeto.fecha = fechaEncontrada;
//               } else {
//                 const fechaIndex = textoEnMinusculas.indexOf("fecha:");
//                 if (fechaIndex !== -1) {
//                   // Extrae la fecha que sigue a "Fecha"
//                   const fecha = texto
//                     .substr(fechaIndex + "fecha:".length, 10)
//                     .trim();
//                   console.log("FECHA:", fecha);
//                   objeto.fecha = fecha;
//                 }
//               }

//               //todo total se bloquea ********************************
//               // const regexValor =
//               //   /(\$|total:|total a pagar|total \$)\s*(\d+(?:\.\d{3})*(?:,\d{2})?)/i;
//               // // const regexValor = /(\$)?\s*(?!(subtotal:|total:|total a pagar|total \$))(\d+(?:\.\d{3})*(?:,\d{2})?)/i;

//               // const resultadoValor = textoEnMinusculas.match(regexValor);

//               // if (resultadoValor) {
//               //   // El valor se encuentra en el segundo grupo capturado (índice 2)
//               //   console.log(resultadoValor[2], "eeee");
//               //   const valorEncontrado = resultadoValor[2];
//               //   console.log(
//               //     "Valor encontrado con expresión regular:",
//               //     valorEncontrado
//               //   );
//               // } else {
//               //   // Si no se encuentra con la expresión regular, buscar el valor después de "$" utilizando indexOf
//               //   const valorIndex = textoEnMinusculas.indexOf("$");
//               //   if (valorIndex !== -1) {
//               //     // Extraer el valor que sigue a "$" (asumiendo un formato numérico)
//               //     let valorTexto = textoEnMinusculas
//               //       .substr(valorIndex + 1, 10)
//               //       .trim();

//               //     // También puedes realizar más procesamiento para manejar diferentes formatos numéricos, si es necesario
//               //     // Por ejemplo, reemplazar comas por puntos en el caso de números con miles (ej. "1,000.00" -> "1000.00")
//               //     valorTexto = valorTexto.replace(/,/g, "");

//               //     console.log("Valor encontrado con indexOf:", valorTexto);
//               //   } else {
//               //     console.log("Valor no encontrado.");
//               //   }
//               // }
//               //todo total se bloquea ********************************


//               // Expresión regular para buscar "nit:" o "no:" seguido de números
//               const regexNitNo = /nit\s*([\d.-]+)/i;
//               // /(nit|no)\s*(\d+)/i;
//               console.log(regexNitNo, "ddd");
//               const resultadoNitNo = textoEnMinusculas.match(regexNitNo);

//               if (resultadoNitNo) {
//                 const palabraClave = resultadoNitNo[1];
//                 console.log(`Palabra clave encontrada: ${palabraClave}`);
//                 objeto.nit = palabraClave;
//               } else {
//                 const regexNitNo = /nit:\s*([\d.-]+)/i;
//                 const resultadoNitNo = textoEnMinusculas.match(regexNitNo);
//                 if (resultadoNitNo) {
//                   const palabraClave = resultadoNitNo[1];
//                   console.log(`Palabra clave encontrada1: ${palabraClave}`);
//                   objeto.nit = palabraClave;
//                 } else {
//                   const regexNitNo = /nit.\s*([\d.-]+)/i;
//                   const resultadoNitNo = textoEnMinusculas.match(regexNitNo);
//                   if (resultadoNitNo) {
//                     const palabraClave = resultadoNitNo[1];
//                     console.log(`Palabra clave encontrada2: ${palabraClave}`);
//                     objeto.nit = palabraClave;
//                   } else {
//                     // const regexNitNo = /no\s*([\d.-]+)/i;
//                     const regexNitNo = /no[:.]?\s*([\d.-]+)/gi;
//                     const resultadoNitNo = textoEnMinusculas.match(regexNitNo);
//                     if (resultadoNitNo) {
//                       const palabraClave = resultadoNitNo[1];
//                       console.log(`Palabra clave encontrada2: ${palabraClave}`);
//                       objeto.nit = palabraClave;
//                     } else {
//                       // Buscar "nit:" o "no:" en el texto utilizando indexOf
//                       const indiceNitNo =
//                         textoEnMinusculas.toLowerCase().indexOf("nit:") !== -1
//                           ? textoEnMinusculas.toLowerCase().indexOf("nit:")
//                           : textoEnMinusculas.toLowerCase().indexOf("no:");
//                       if (indiceNitNo !== -1) {
//                         const valorTexto = texto.substr(indiceNitNo).trim();
//                         console.log("indexof valor: " + valorTexto);
//                         objeto.nit = valorTexto;
//                       }
//                     }
//                   }
//                 }
//               }

//               //todo ***********************************
//               // Expresión regular para buscar "nit:" o "no:" seguido de números
//               const regexvalor = /\$\s*([\d,.]+)/;
//               // /(nit|no)\s*(\d+)/i;
//               console.log(regexvalor, "ddd");
//               const resultadoValor2 = textoEnMinusculas.match(regexvalor);

//               if (resultadoValor2) {
//                 //  const palabraClave =  resultadoValor2[1].replace(',', '');
//                 console.log(`VALORRRR encontrada: ${resultadoValor2[1]}`);
//                 const total =  resultadoValor2[1].replace(',', '');
//                 objeto.total = total
//               } else {
//                 //  const regexvalor = /total:(?!\s*subtotal:)\s*([\d,.]+)/i;
//                 const regexvalor = /total:\s*([\d,.]+)/i;
//                 const resultadoValor2 = textoEnMinusculas.match(regexvalor);
//                 if (resultadoValor2) {
//                   //  const palabraClave =  resultadoValor2[1].replace(',', '');
//                   console.log(`VALORRRR encontrada1: ${resultadoValor2[1]}`);
//                   const total =  resultadoValor2[1].replace(',', '');
//                   objeto.total = total
//                 } else {
//                   const regexvalor = /total\s*a\s*pagar:\s*([\d,.]+)/i;
//                   const resultadoValor2 = textoEnMinusculas.match(regexvalor);
//                   if (resultadoValor2) {
//                     //  const palabraClave =  resultadoValor2[1].replace(',', '');
//                     console.log(`VALORRRR encontrada2: ${resultadoValor2[1]}`);
//                     const total =  resultadoValor2[1].replace(',', '');
//                     objeto.total = total
//                   } else {
//                     const regexvalor = /\bvalor\b/i;
//                     const resultadoValor2 = textoEnMinusculas.match(regexvalor);
//                     if (resultadoValor2) {
//                       //  const palabraClave =  resultadoValor2[1].replace(',', '');
//                       console.log(
//                         `VALORRRR encontrada2: ${resultadoValor2[1]}`
//                       );
//                       const total =  resultadoValor2[1].replace(',', '');
//                       objeto.total = total
//                     } else {
//                       // Buscar "nit:" o "no:" en el texto utilizando indexOf
//                       const indiceNitNo =
//                         textoEnMinusculas.toLowerCase().indexOf("$") !== -1
//                           ? textoEnMinusculas.toLowerCase().indexOf("total:")
//                           : textoEnMinusculas.toLowerCase().indexOf("total");
//                       if (indiceNitNo !== -1) {
//                         const valorTexto = texto.substr(indiceNitNo).trim();
//                         console.log("indexof valor: " + valorTexto);
//                         const total =  valorTexto.replace(',', '');
//                         objeto.total = total
//                       }
//                     }
//                   }
//                 }
//               }

//               // todo descripcion
//               const regexDescrip = /descripción\s+(\d+)/;
//               const resultadoDescrip = textoEnMinusculas.match(regexDescrip);

//               if (resultadoDescrip) {
//                 const palabraClave = resultadoDescrip[1];
//                 console.log(`descrip ${palabraClave}`);
//                 objeto.concepto = palabraClave;
//               }else{
//                 const regexDescrip = /por\s+concepto\s+de:\s*([^0-9]+)/i;
//                 const resultadoDescrip = textoEnMinusculas.match(regexDescrip);
//                 if (resultadoDescrip) {
//                   const palabraClave = resultadoDescrip[1];
//                   console.log(`descrip1 ${palabraClave}`);
//                   objeto.concepto = palabraClave;
//                 }else{
//                 const regexDescrip = /descripción:\s*([^0-9]+)/i;
//                 const resultadoDescrip = textoEnMinusculas.match(regexDescrip);
//                 if (resultadoDescrip) {
//                   const palabraClave = resultadoDescrip[1];
//                   console.log(`descrip1 ${palabraClave}`);
//                   objeto.concepto = palabraClave;
//                 }
//                 }
//               }

//               // todo numero de factura 
//                 const regexNoFact = /no.\s*([\d.-]+)/i;
//                 const resultadoNoFact = textoEnMinusculas.match(regexNoFact);
  
//                 if (resultadoNoFact) {
//                   const palabraClave = resultadoNoFact[1];
//                   console.log(`Numero Factura ${palabraClave}`);
//                   objeto.numFact = palabraClave;
//                 }

                
//               //todo subtotal ***********************************
//               const regexsubTotal = /subtotal:\s*([\d,.]+)/i;
//               const resultadoSubTotal = textoEnMinusculas.match(regexsubTotal);

//               if (resultadoSubTotal) {
//                 console.log(`subtotal: ${resultadoSubTotal[1]}`);
//                 const total =  resultadoSubTotal[1].replace(',', '');
//                 objeto.subtotal = total
//               } 
//               const pathnomimg = path.join(
//                 __dirname,
//                 "../..",
//                 "uploads",
//                 imgs.name
//               );
//               const pathnomimgR = path.join(
//                 __dirname,
//                 "../..",
//                 "uploads",
//                 "imagenrender.png"
//               );
//               eliminar(pathnomimg);
//               eliminar(pathnomimgR);
//               console.log(objeto);
//               res.json(objeto);
//             }
//           }
//         );
//       })
//       .catch((error) => {
//         // Manejar cualquier error que ocurra durante el redimensionamiento de la imagen
//         res.status(500).send("Error al redimensionar la imagen.");
//       });
//   });

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

//   //   // Función para entrenar el modelo
//   // async function trainModel() {
//   //   // Aquí deberías utilizar un algoritmo de aprendizaje automático
//   //   // para entrenar el modelo en base a trainingData.
//   //   // Puedes usar bibliotecas como TensorFlow, PyTorch o scikit-learn
//   //   // para crear y entrenar tu modelo.

//   //   // Datos de entrenamiento (texto_extraído, número_de_factura)
//   // const trainingData = [
//   //   { input: "Texto de la imagen 1", output: "123456" },
//   //   { input: "Texto de la imagen 2", output: "987654" }
//   // ];

//   // // Crear una instancia de red neuronal
//   // const net = new brain.recurrent.LSTM();

//   // // Formatear los datos para la red neuronal
//   // const formattedData = trainingData.map(data => ({
//   //   input: data.input,
//   //   output: data.output
//   // }));

//   // // Entrenar el modelo
//   // net.train(formattedData);

//   // // Ejemplo de uso
//   // const extractedText = "Texto extraído de una imagen";
//   // const predictedInvoiceNumber = predictInvoiceNumber(extractedText);

//   // console.log("Número de factura predicho:", predictedInvoiceNumber);

//   //   // Retorna el modelo entrenado
//   //   return trainedModel;
//   // }
//   // // Función para predecir el número de factura dado el texto
//   // function predictInvoiceNumber(text) {
//   //   const output = net.run(text);
//   //   return output;
//   // }
// }

// module.exports = Ocr;
