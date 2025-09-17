// const { Op } = require("sequelize");
const { sequelize } = require("../db");
const { LocalStorage } = require("node-localstorage");
const localStorage = new LocalStorage("./local-storage");

// const LoadProyect = async (Doc_id, email) => {
//   //? se piden los datos del usuario en el localStorage
//   // const user = JSON.parse(localStorage.getItem("user"));
//   //? se selecciona los idNodo para saber que proyectos tiene el usuario
//   try {
//     const idnodo = await sequelize.query(
//       `SELECT idNodoProyecto,Terminada FROM TBL_SER_ProyectoActividadesEmpleados where N_DocumentoEmpleado = ${Doc_id}`
//     );

//     const idnodo1 = await sequelize.query(
//       `SELECT idNodoProyecto FROM TBL_SER_ProyectoActividadesEmpleados where N_DocumentoEmpleado = ${Doc_id}`
//     );
//     // select* from TBL_ESP_Procesos  where ID = 324

//     let proyect;
//     let Cod_parte;
//     let idNodo_falta = [];
//     let codpar_falta = [];
//     let obj_proyecto = {
//       proyectos: [],
//     };
//     let con = 0;
//     const validateproyect = await sequelize.query(
//       `
//       select A.SKU_Logistica
// from TBL_INV_UNIDAD_ALMACENAMIENTO A inner join TBL_INV_ITEM B on A.Referencia=B.Referencia 
// inner join TBL_INV_TipoEstructuraITEM C on B.Referencia=C.Referencia left join TBL_SER_ValoracionEncabezado V on A.SKU_Logistica=V.SKU 
// left join TBL_CON_TERCEROS Ter on V.NitCliente=Ter.N_Documento left join TBL_PRO_OrdenesPlan OP on A.SKU_Logistica=OP.RefDistr and V.OP=op.OP
// where c.TipoItem=9 
// order by SKU_Logistica desc
//       `
//     );

//     try {
//       for (const i of idnodo[0]) {
//         proyect = await sequelize.query(
//           `SELECT * FROM TBL_SER_PROYECTOS WHERE SKU IN (SELECT DISTINCT(SKU_Proyecto) 
//       FROM TBL_SER_ProyectoActividadesEmpleados WHERE 
//       N_DocumentoEmpleado = :docId AND idNodo = ${i.idNodoProyecto}) ORDER BY sku, idNodo`,
//           { replacements: { docId: Doc_id } }
//         );

//         //todo Validar que el proyecto este correcto

//         // const existe = validateproyect[0].some(SKU => SKU.SKU_Logistica === proyect[0][0].SKU)

//         if (proyect[0].length > 0) {
//           if (proyect[0]) {
//             let ID_parte = parseInt(proyect[0][0].Cod_parte);
//             let idPadre = proyect[0][0].idPadre;
//             let componentes = [];
//             let actividades = [];
//             let tipoParte;
//             let Parte = idPadre;
//             let actividad = "";
//             let componente = "";
//             let proyecto = "";
//             let fecha = "";
//             let frecuencia = 0;
//             let entregable = false;
//             let nitCliente = "";
//             let Codi_parteP = "";
//             let idNodoP = "";
//             let idPadreP = "";
//             let Codi_parteC = "";
//             let idNodoC = "";
//             let idPadreC = "";
//             let Codi_parteA = "";
//             let idNodoA = "";
//             let idPadreA = "";
//             let skuP = "";
//             let skuC = "";
//             let skuA = "";
//             let terminada = i.Terminada;

//             Cod_parte = await sequelize.query(
//               `select * from TBL_ESP_Procesos  where ID = ${ID_parte}`
//               // {replacements:{Codigo:}}
//             );

           
//             let nomEntregable;
//             if (Cod_parte[0].length > 0) {
//               console.log(Cod_parte[0].length, "entrooooooooooooooooooooo",Cod_parte[0].ID);
//               Cod_parte = await sequelize.query(
//                 `select * from TBL_ESP_Procesos  where ID = ${ID_parte} and Descripcion =  '${proyect[0][0].Nombre}'`
//                 // {replacements:{Codigo:}}
//               );

//               const entrega = await sequelize.query(
//                 `select * from TBL_SER_EntregablesActividad where id_Proceso = ${Cod_parte[0][0].ID}`
//               );

//               nomEntregable = entrega[0]?.map((nom) => {
//                 return {
//                   id_proceso: nom.id_Proceso,
//                   Numero: nom.Numero,
//                   Nom_Entregable: nom.Nombre,
//                   subido: nom.Subido,
//                 };
//               });

//               if (proyect[0][0].TipoParte === "Actividad") {
//                 actividad = proyect[0][0].Nombre;
//                 frecuencia = Cod_parte[0][0].FrecuenciaVeces;
//                 entregable = Cod_parte[0][0].AplicaEntregables;
//                 nom_entregable = nomEntregable;
//                 idNodoA = proyect[0][0].idNodo;
//                 Codi_parteA = proyect[0][0].Cod_parte;
//                 idPadreA = proyect[0][0].idPadre;
//                 skuA = proyect[0][0].SKU;
//                 terminada = terminada;
//               }
//               // if (Cod_parte[0].length === 0) {
//               //   continue;
//               // }
//             } else {
//               //?  ******************* VALIDACION SI EXISTE EL COD PARTE ************************** */
//               console.log(
//                 Cod_parte[0].length,
//                 "eeeeeeeeeeeeeeeeeeeeeeeeeeewwwwwwww",Cod_parte[0].ID
//               );
//               codpar_falta.push(ID_parte);
//               continue;
//             }
//             try {
//               do {
//                 console.log("entro al DOWHILEEEEE  DO WHILE")
//                 tipoParte = await sequelize.query(
//                   `SELECT * FROM TBL_SER_PROYECTOS WHERE SKU IN (SELECT DISTINCT(SKU_Proyecto) FROM TBL_SER_ProyectoActividadesEmpleados WHERE N_DocumentoEmpleado = :docId AND idNodo = ${Parte}) ORDER BY sku, idNodo`,
//                   { replacements: { docId: Doc_id } }
//                 );
//                 if (tipoParte[0]) {
//                   //todo validar tipoparte cabecera
//                   Parte = tipoParte[0][0].idPadre;
//                   if (tipoParte[0][0].TipoParte === "PP") {
//                     componente = tipoParte[0][0].Nombre;
//                     //? saca la fecha exacta del string
//                     fecha = new Date(proyect[0][0].Fecha)
//                       .toISOString()
//                       .split("T")[0];
//                     idNodoC = tipoParte[0][0].idNodo;
//                     Codi_parteC = tipoParte[0][0].Cod_parte;
//                     idPadreC = tipoParte[0][0].idPadre;
//                     skuC = tipoParte[0][0].SKU;
//                     nitCliente = tipoParte[0][0].NitCliente;
//                   }
//                   if (tipoParte[0][0].TipoParte === "Cabecera") {
//                     proyecto = tipoParte[0][0].Nombre;
//                     idNodoP = tipoParte[0][0].idNodo;
//                     Codi_parteP = tipoParte[0][0].Cod_parte;
//                     idPadreP = tipoParte[0][0].idPadre;
//                     skuP = tipoParte[0][0].SKU;
//                     //fecha = new Date(proyect[0][0].Fecha).toISOString().split("T")[0];
//                   }
//                   //? Verificar si el proyecto ya existe en el objeto obj_proyecto
//                   let proyectoExistente = obj_proyecto.proyectos.find(
//                     (p) => p.proyecto === proyecto
//                   );

//                   if (proyectoExistente) {
//                     //? Verificar si el componente ya existe en el proyecto
//                     let componenteExistente =
//                       proyectoExistente.componentes.find(
//                         (c) => c.componente === componente
//                       );

//                     if (componenteExistente) {
//                       //? Agregar la actividad al componente existente

//                       componenteExistente.actividades.push({
//                         actividad: actividad,
//                         frecuencia,
//                         entregable,
//                         nombre_entregable: nom_entregable,
//                         idNodoA,
//                         Codi_parteA,
//                         idPadreA,
//                         skuA,
//                         terminada,
//                       });
//                     } else {
//                       //? Agregar un nuevo componente con la actividad al proyecto existente

//                       proyectoExistente.componentes.push({
//                         fecha,
//                         componente: componente,
//                         idNodoC,
//                         Codi_parteC,
//                         idPadreC,
//                         skuC,
//                         actividades: [
//                           {
//                             actividad: actividad,
//                             frecuencia,
//                             entregable,
//                             nombre_entregable: nom_entregable,
//                             idNodoA,
//                             Codi_parteA,
//                             idPadreA,
//                             skuA,
//                             terminada,
//                           },
//                         ],
//                       });
//                     }
//                   } else {
//                     //? Agregar un nuevo proyecto con el componente y actividad
//                     if (proyecto !== "") {
//                       obj_proyecto.proyectos?.push({
//                         proyecto: proyecto,
//                         idNodoP,
//                         Codi_parteP,
//                         idPadreP,
//                         skuP,
//                         nitCliente,
//                         componentes: [
//                           {
//                             fecha,
//                             componente: componente,
//                             idNodoC,
//                             Codi_parteC,
//                             idPadreC,
//                             skuC,
//                             actividades: [
//                               {
//                                 actividad: actividad,
//                                 frecuencia,
//                                 entregable,
//                                 nombre_entregable: nom_entregable,
//                                 idNodoA,
//                                 Codi_parteA,
//                                 idPadreA,
//                                 skuA,
//                                 terminada,
//                               },
//                             ],
//                           },
//                         ],
//                       });
//                     }
//                   }
//                 } else {
//                   //?  ******************* VALIDACION DO WHILE ************************** */
//                   continue;
//                 }
//               } while (tipoParte[0][0].TipoParte !== "Cabecera");
//             } catch (error) {
//               console.log("error", error);
//             }
//           } else {
//             //?  ******************* VALIDACION SI EXISTE EL PROYECTO 2DA VEZ************************** */
//             continue;
//           }
//         } else {
//           //?  ******************* VALIDACION SI EXISTE EL PROYECTO 1ERA VEZ************************** */
//           idNodo_falta.push(i.idNodoProyecto);
//           continue;
//         }
//       } //?  *******************  FINALIZA EL FOR PRINCIPAL ************************** */
//     } catch (error) {
//       console.log({ error: error });
//     }
//     console.log("codigo parte faltantes", codpar_falta);
//     console.log("idNodo faltantes", idNodo_falta);
//     localStorage.setItem(`${email}Proyecto`, JSON.stringify(obj_proyecto));
//     console.log(JSON.stringify(obj_proyecto))
//     return;
//     //! en el deploy validar que el archivo no se sobreescriba
//   } catch (error) {
//     console.log({ error: error });
//     // res.json({ error: error });
//   }
// };

//todo hacer consulta para proyectos enviando respuesta automatica



const LoadProyect = async (Doc_id, email) => {
  try {
    // Obtener idNodo para saber qué proyectos tiene el usuario
    const idnodo = await sequelize.query(
      `SELECT idNodoProyecto, Terminada FROM TBL_SER_ProyectoActividadesEmpleados WHERE N_DocumentoEmpleado = :docId`,
      { replacements: { docId: Doc_id } }
    );

    let obj_proyecto = { proyectos: [] };
    let codpar_falta = [];
    let idNodo_falta = [];

    // Validar proyectos
    const validateproyect = await sequelize.query(
      `
      SELECT A.SKU_Logistica
      FROM TBL_INV_UNIDAD_ALMACENAMIENTO A
      INNER JOIN TBL_INV_ITEM B ON A.Referencia = B.Referencia
      INNER JOIN TBL_INV_TipoEstructuraITEM C ON B.Referencia = C.Referencia
      LEFT JOIN TBL_SER_ValoracionEncabezado V ON A.SKU_Logistica = V.SKU
      LEFT JOIN TBL_CON_TERCEROS Ter ON V.NitCliente = Ter.N_Documento
      LEFT JOIN TBL_PRO_OrdenesPlan OP ON A.SKU_Logistica = OP.RefDistr AND V.OP = OP.OP
      WHERE C.TipoItem = 9
      ORDER BY SKU_Logistica DESC
      `
    );

    for (const i of idnodo[0]) {
      try {
        const proyect = await sequelize.query(
          `SELECT * FROM TBL_SER_PROYECTOS WHERE SKU IN (SELECT DISTINCT(SKU_Proyecto) FROM TBL_SER_ProyectoActividadesEmpleados WHERE N_DocumentoEmpleado = :docId AND idNodo = :idNodo) ORDER BY SKU, idNodo`,
          { replacements: { docId: Doc_id, idNodo: i.idNodoProyecto } }
        );

        if (proyect[0].length > 0) {
          let ID_parte = parseInt(proyect[0][0].Cod_parte);
          let Cod_parte = await sequelize.query(
            `SELECT * FROM TBL_ESP_Procesos WHERE ID = :id`,
            { replacements: { id: ID_parte } }
          );

          if (Cod_parte[0].length > 0) {
            Cod_parte = await sequelize.query(
              `SELECT * FROM TBL_ESP_Procesos WHERE ID = :id AND Descripcion = :descripcion`,
              { replacements: { id: ID_parte, descripcion: proyect[0][0].Nombre } }
            );

            const entrega = await sequelize.query(
              `SELECT * FROM TBL_SER_EntregablesActividad WHERE id_Proceso = :idProceso`,
              { replacements: { idProceso: Cod_parte[0][0].ID } }
            );

            let nomEntregable = entrega[0]?.map((nom) => ({
              id_proceso: nom.id_Proceso,
              Numero: nom.Numero,
              Nom_Entregable: nom.Nombre,
              subido: nom.Subido,
            }));

            let actividad = "";
            let frecuencia = 0;
            let entregable = false;
            let idNodoA = "";
            let Codi_parteA = "";
            let idPadreA = "";
            let skuA = "";
            let terminada = i.Terminada;

            if (proyect[0][0].TipoParte === "Actividad") {
              actividad = proyect[0][0].Nombre;
              frecuencia = Cod_parte[0][0].FrecuenciaVeces;
              entregable = Cod_parte[0][0].AplicaEntregables;
              idNodoA = proyect[0][0].idNodo;
              Codi_parteA = proyect[0][0].Cod_parte;
              idPadreA = proyect[0][0].idPadre;
              skuA = proyect[0][0].SKU;
            }

            let tipoParte;
            let Parte = proyect[0][0].idPadre;
            let fecha = new Date(proyect[0][0].Fecha).toISOString().split("T")[0];
            let componente = "";
            let proyecto = "";
            let nitCliente = "";
            let idNodoC = "";
            let Codi_parteC = "";
            let idPadreC = "";
            let skuC = "";
            let idNodoP = "";
            let Codi_parteP = "";
            let idPadreP = "";
            let skuP = "";

            do {
              tipoParte = await sequelize.query(
                `SELECT * FROM TBL_SER_PROYECTOS WHERE SKU IN (SELECT DISTINCT(SKU_Proyecto) FROM TBL_SER_ProyectoActividadesEmpleados WHERE N_DocumentoEmpleado = :docId AND idNodo = :idNodo) ORDER BY SKU, idNodo`,
                { replacements: { docId: Doc_id, idNodo: Parte } }
              );

              if (tipoParte[0].length > 0) {
                Parte = tipoParte[0][0].idPadre;

                if (tipoParte[0][0].TipoParte === "PP") {
                  componente = tipoParte[0][0].Nombre;
                  idNodoC = tipoParte[0][0].idNodo;
                  Codi_parteC = tipoParte[0][0].Cod_parte;
                  idPadreC = tipoParte[0][0].idPadre;
                  skuC = tipoParte[0][0].SKU;
                  nitCliente = tipoParte[0][0].NitCliente;
                }

                if (tipoParte[0][0].TipoParte === "Cabecera") {
                  proyecto = tipoParte[0][0].Nombre;
                  idNodoP = tipoParte[0][0].idNodo;
                  Codi_parteP = tipoParte[0][0].Cod_parte;
                  idPadreP = tipoParte[0][0].idPadre;
                  skuP = tipoParte[0][0].SKU;
                }

                // Verificar si el proyecto ya existe en obj_proyecto
                let proyectoExistente = obj_proyecto.proyectos.find(
                  (p) => p.proyecto === proyecto
                );

                if (proyectoExistente) {
                  let componenteExistente = proyectoExistente.componentes.find(
                    (c) => c.componente === componente
                  );

                  if (componenteExistente) {
                    // Agregar la actividad al componente existente
                    componenteExistente.actividades.push({
                      actividad,
                      frecuencia,
                      entregable,
                      nombre_entregable: nomEntregable,
                      idNodoA,
                      Codi_parteA,
                      idPadreA,
                      skuA,
                      terminada,
                    });
                  } else {
                    // Agregar un nuevo componente con la actividad al proyecto existente
                    proyectoExistente.componentes.push({
                      fecha,
                      componente,
                      idNodoC,
                      Codi_parteC,
                      idPadreC,
                      skuC,
                      actividades: [
                        {
                          actividad,
                          frecuencia,
                          entregable,
                          nombre_entregable: nomEntregable,
                          idNodoA,
                          Codi_parteA,
                          idPadreA,
                          skuA,
                          terminada,
                        },
                      ],
                    });
                  }
                } else {
                  // Agregar un nuevo proyecto con el componente y actividad
                  if (proyecto !== "") {
                    obj_proyecto.proyectos.push({
                      proyecto,
                      idNodoP,
                      Codi_parteP,
                      idPadreP,
                      skuP,
                      nitCliente,
                      componentes: [
                        {
                          fecha,
                          componente,
                          idNodoC,
                          Codi_parteC,
                          idPadreC,
                          skuC,
                          actividades: [
                            {
                              actividad,
                              frecuencia,
                              entregable,
                              nombre_entregable: nomEntregable,
                              idNodoA,
                              Codi_parteA,
                              idPadreA,
                              skuA,
                              terminada,
                            },
                          ],
                        },
                      ],
                    });
                  }
                }
              }
            } while (tipoParte[0].length > 0 && tipoParte[0][0].TipoParte !== "Cabecera");

          } else {
            // Validación si existe el código de parte
            codpar_falta.push(ID_parte);
            continue;
          }
        } else {
          // Validación si existe el proyecto
          idNodo_falta.push(i.idNodoProyecto);
          continue;
        }
      } catch (error) {
        console.error("Error en el procesamiento del proyecto:", error);
      }
    }

    // Guardar resultado en localStorage
    localStorage.setItem(`${email}Proyecto`, JSON.stringify(obj_proyecto));
    console.log("Proyecto cargado:", JSON.stringify(obj_proyecto));
    
  } catch (error) {
    console.error("Error en LoadProyect:", error);
  }
};







const getProyectName = async (req, res) => {
  const { search, email } = req.query;
  console.log("eeeeeeeeeee")
  try {
    const proyects = JSON.parse(localStorage.getItem(`${email}Proyecto`));
    // localStorage.removeItem(`Proyecto`)
    let NomProyect;
   
    if (proyects) {
      NomProyect = proyects.proyectos
        .filter((obj) => obj.proyecto.includes(search.toUpperCase()))
        .map((obj) => obj.proyecto);

      if (NomProyect.length <= 0) {
        return res.json("No hay royectos con este nombre ");
      }
    }
    // const proyect = proyects.proyectos.filter((obj) => {
    //   return obj.proyecto.includes(search);
    // });
 console.log(NomProyect,"qqqqqqqqqqqqqqqqqqqqqqqqqqq")
    res.json(NomProyect);
  } catch (error) {
    res.json({ error: error });
  }
};

//todo me va devolver los nombres de los proyectos en un array
const NameProyects = (req, res) => {
  try {
    const { email } = req.query;
    const proyects = JSON.parse(localStorage.getItem(`${email}Proyecto`));
    const nombres = proyects.proyectos.map((obj) => {
      return obj.proyecto;
    });
    res.json(nombres);
  } catch (error) {
    res.json({ error: error });
  }
};

//todo hacer consulta para enviar el proyectos
const getProyect = async (req, res) => {
  const { search, email } = req.query;
  console.log("holaaaaa",email)
  try {
    const proyects = JSON.parse(localStorage.getItem(`${email}Proyecto`));

    //? me devuelve todo el objeto
    let proyect;

    proyect = proyects.proyectos.filter((obj) => {
      return obj.proyecto.includes(search.toUpperCase());
    });

    const nombres = proyects.proyectos.map((obj) => {
      return obj.proyecto;
    });
    console.log(proyect)
    res.json(proyect);
  } catch (error) {
    res.json({ error: error });
  }
};

//todo endpoint para agregar horas de los proyectos
const registerActivities = async (req, res) => {
  const {
    SKU_Proyecto,
    NitCliente,
    DocumentoEmpleado,
    idNodoProyecto,
    idNodoActividad,
    Cod_Parte,
    FechaRegistro,
    FechaInicio,
    FechaFinal,
    DuracionHoras,
  } = req.body;
  try {
    await sequelize.query(
      `INSERT INTO [dbo].[TBL_SER_ReporteHorasActividadEmpleado]
      ([SKU_Proyecto]
      ,[NitCliente]
      ,[DocumentoEmpleado]
      ,[idNodoProyecto]
      ,[idNodoActividad]
      ,[Cod_Parte]
      ,[FechaRegistro]
      ,[FechaInicio]
      ,[FechaFinal]
      ,[DuracionHoras])
  VALUES
      ('${SKU_Proyecto}',
      '${NitCliente}',
      '${DocumentoEmpleado}',
      ${idNodoProyecto},
      ${idNodoActividad},
      ${Cod_Parte},
       '${FechaRegistro}',
       '${FechaInicio}',
       '${FechaFinal}',
       ${DuracionHoras})
  `
    );
    const hours = await sequelize.query(
      `SELECT SUM(DuracionHoras) as horas FROM TBL_SER_ReporteHorasActividadEmpleado where idNodoProyecto = ${idNodoProyecto} AND idNodoActividad = ${idNodoActividad}`
    );

    TotalH = parseFloat(hours[0][0].horas).toFixed(2);
    res.json({ horaTotal: TotalH });
  } catch (error) {
    res.json({ error: error });
  }
};

//todo devuelve la sumatoria de las actividades
const hourActivities = async (req, res) => {
  try {
    const { idNodoProyecto, idNodoActividad } = req.query;
    const hours = await sequelize.query(
      `SELECT SUM(DuracionHoras) as horas FROM TBL_SER_ReporteHorasActividadEmpleado where idNodoProyecto = ${idNodoProyecto} AND idNodoActividad = ${idNodoActividad}`
    );
    const TotalH = parseFloat(hours[0][0].horas).toFixed(2);
    res.json(TotalH);
  } catch (error) {
    res.json({ error: error });
  }
};

const updateProyecto = async (req, res) => {
  const { finished, idNodoProyecto, SKU_Proyecto } = req.body;
  try {
    await sequelize.query(
      `
    UPDATE TBL_SER_ProyectoActividadesEmpleados
   SET Terminada = ${finished}
   WHERE idNodoProyecto = ${idNodoProyecto} and SKU_Proyecto = ${SKU_Proyecto};
    `
    );

    // await sequelize.query(
    //   `
    //   UPDATE TBL_SER_ProyectoActividadesEmpleados
    //   SET Terminada = :finished
    //   WHERE idNodoProyecto = :idNodoProyecto AND SKU_Proyecto = :SKU_Proyecto;
    //   `,
    //   {
    //     replacements: {
    //       finished: finished,
    //       idNodoProyecto: idNodoProyecto,
    //       SKU_Proyecto: SKU_Proyecto,
    //     },
    //   }
    // );

    res.send("actualizacion exitosa");
  } catch (error) {
    console.log(error);
    res.send({ error: error });
  }
};

const UpdatProyect = async (req, res) => {
  try {
    const { doc_id, email } = req.body;
    localStorage.removeItem(`${email}Proyecto`);
    await LoadProyect(doc_id, email);
    res.send("actualizacion exitosa");
  } catch (error) {
    res.json({ error: error });
  }
};

const AnticipoGastos = async (req, res) => {
  try {
    const { doc, sku } = req.body;
  
console.log(doc, sku,"anticipo")
    //  const datos = await sequelize.query(
    //   `
    //todo
//     select A.Id,A.NumeroDocumento,A.Valor
// from TBL_CON_RegistrosTesorero A inner join TBL_CON_RegistrosTesoreroDETALLES B on A.Id=B.IdRegistrosTesorero
// where A.N_documento= :doc and A.HizoReintegro<>1 and B.anticipo=1 and A.Cumplido=1
//todo

    // select A.Observaciones, A.Consecutivo, C.SKU,B.OP,A.Valor,A.NumeroDocumento,A.Id from TBL_CON_RegistrosTesorero A inner join TBL_CON_RegistrosTesoreroDETALLES B ON A.Id = B.IdRegistrosTesorero inner join TBL_SER_ValoracionEncabezado C ON B.OP = C.OP 
    // WHERE B.Anticipo = 1 and N_documento = :doc AND C.SKU = sku`,
    //   {
    //     replacements: { doc: doc, sku: sku },
    //     type: sequelize.QueryTypes.SELECT,
    //   }
    // );

   
     const datos = await sequelize.query(
      `
       select A.Id,A.NumeroDocumento,A.Valor, 0 EsTarjeta
from TBL_CON_RegistrosTesorero A inner join TBL_CON_RegistrosTesoreroDETALLES B on A.Id=B.IdRegistrosTesorero
where A.N_documento=:doc and A.HizoReintegro<>1 and B.anticipo=1 and A.Cumplido=1
union all
select Id,Nombre NombreTarjeta,saldoActual, 1 EsTarjeta
from TBL_CON_TARJETASCREDITO where N_Doc_Responsable=:doc
      `,
      {
        replacements: { doc: doc, sku: sku },
        type: sequelize.QueryTypes.SELECT,
      }
    );
    let objDatos = [];
    // datos.map((datos) => {
    //   objDatos.push({
    //     NumeroComprobante: datos.NumeroDocumento,
    //     IdResponsable: datos.Id,
    //     Valor: datos.Valor,
    //     DetalleConcepto: datos.OP,
    //     IdCentroCostos: datos.Consecutivo,
    //     Observaciones: datos.Observaciones,
    //     sku: datos.SKU,
    //   });
    // });
     datos.map((datos) => {
      objDatos.push({
        IdResponsable: datos.Id,
        Observaciones: datos.NumeroDocumento,
        Valor: datos.Valor,
        tarjeta: datos.EsTarjeta
      });
    });
    console.log(objDatos,"antici55555555555555555555555555555555555555555")
    res.send(objDatos);
  } catch (error) {
    res.json({ error: error });
  }
};

const Entregables = async (req, res) => {
  const {
    SKU_Proyecto,
    NitCliente,
    idNodoProyecto,
    NumeroEntregable,
    idProceso,
  } = req.query;

  // res.send("ok")
  // return
  let entrega = false;
  try {
    const Entregables = await sequelize.query(
      `
    SELECT * FROM TBL_SER_ProyectoActividadesEmpleadosEntregables WHERE SKU_Proyecto = :sku AND NitCliente = :nit AND idNodoProyecto = :id AND NumeroEntregable = :numE AND idProceso = :proceso`,
      {
        replacements: {
          sku: SKU_Proyecto,
          nit: NitCliente,
          id: idNodoProyecto,
          numE: NumeroEntregable,
          proceso: idProceso,
        },
        type: sequelize.QueryTypes.SELECT,
      }
    );

    if (Entregables.length >= 1) {
      entrega = true;
    }
    res.json(entrega);
  } catch (error) {
    res.json({ error: error });
  }
};

//todo desloguea el usuario
const logout = (req, res) => {
  const { email } = req.query;
  // req.logout();

  // res.clearCookie(`access_token`);

  try {
    // req.session.destroy((err) => {
    //   if (err) {
    //     console.error('Error al eliminar la sesión:', err);
    //   }
    // });
    localStorage.removeItem(`${email}Proyecto`);
    res.json("Logout seccesfull");
  } catch (error) {
    res.json({ error: error });
  }
};

//todo debe enviar el arbol del proyecto con componente y actividad y verificar si requiere entregables
//todo hacer el post de entregable

module.exports = {
  getProyectName,
  getProyect,
  LoadProyect,
  registerActivities,
  hourActivities,
  updateProyecto,
  UpdatProyect,
  AnticipoGastos,
  logout,
  Entregables,
  NameProyects,
};
