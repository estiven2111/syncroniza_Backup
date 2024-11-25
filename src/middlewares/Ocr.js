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
const { key, endpoint,apiKey,apiUrl} = process.env
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
              console.log(typeof datos,"datooooooooooss", datos.nit)
             
            
              objeto.nit =  datos.nit
              objeto.numFact = datos.numFact
              objeto.total = datos.total
              objeto.totalSinIva = datos.total
              objeto.razon_social = datos.razon_social
              objeto.fecha = datos.fecha
              objeto.iva = datos.iva
              objeto.rete = datos.rete
              objeto.ipc = datos.ipc
              objeto.concepto = datos.Concepto
              objeto.ica =  datos.ica
              
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
              content: `Extrae la siguiente información de la factura pones dos puntos y el dato al frente separado por 2 puntos y si el dato es vacío
                entonces dejas el dato con "" o si los valores son dinero no les pongas el signo de $ solo el numero y sin puntos decimales dejalo completo
                ten encuenta que el total no puede ser el mismo que el subtotal ya que el total es con el iva incluido y el subtotal es sin el iba si la factura no tiene 
                subtotal no lo pongas como si fuera el total o igual si solo tiene subtotal no lo pongas como si fuera el total pon los datos que la factura trae
                entiente que el total es mas el iva y el subtotal es sin el iva  entonces son valores totalmente diferences y si en la factura esta en iva incluyelo en el iva 
                ademas en concepto si en la factura es producto lo pones al frente de concepto o servicio necesito saber si el concepto es
                servicio o producto:
                - NITdelemisor pero lo dejas como nit 
                - RazonSocial pero lo dejas como razon_social
                - Destinatarioadquiriente
                - NITdeldestinatario
                - Subtotaldelafactura pero lo dejas como totalSinIva
                - valoriva pero lo dejas como iva
                - Totaldelafactura pero lo dejas como total
                - fechadefactura pero lo dejas como fecha si la fecha viene con texto me lo dejas siempre en formato DD/MM/YYYY
                - ValorIpoconsumo pero lo dejas como ipc
                - ValordelreteICA pero lo dejas como ica
                - valorderetefuente pero lo dejas como rete
                - numerofactura pero lo dejas como numFact
                - Concepto aca el valor que me vas a poner siempre va ser o producto o servicio nada mas eso depende de la factura si lo trae o no sino lo dejas vacio si la factura no esta para este concepto
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
    const objeto = {};
    const lineas = texto.split("\n"); // Dividir por líneas
  
    lineas.forEach((linea) => {
      const lineaLimpia = linea.replace(/^- /, "").trim();
      const [clave, valor] = lineaLimpia.split(":").map((parte) => parte.trim()); // Separar clave y valor
  
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
