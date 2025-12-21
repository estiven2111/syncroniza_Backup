// const { Op } = require("sequelize");
const { sequelize } = require("../db");
const { LocalStorage } = require("node-localstorage");
const localStorage = new LocalStorage("./local-storage");

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
              {
                replacements: {
                  id: ID_parte,
                  descripcion: proyect[0][0].Nombre,
                },
              }
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
            let fecha = new Date(proyect[0][0].Fecha)
              .toISOString()
              .split("T")[0];
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
            } while (
              tipoParte[0].length > 0 &&
              tipoParte[0][0].TipoParte !== "Cabecera"
            );
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

    // Validar y filtrar proyectos con actividades no terminadas
    ValidacionProyectos(email);
    console.log("Proyecto cargado:", JSON.stringify(obj_proyecto));
  } catch (error) {
    console.error("Error en LoadProyect:", error);
  }
};

const ValidacionProyectos = (email) => {
  try {
    // Leer los proyectos desde localStorage y filtrar los que tienen actividades no terminadas
    const proyects = JSON.parse(localStorage.getItem(`${email}Proyecto`));

    if (!proyects || !Array.isArray(proyects.proyectos)) {
      return res
        .status(400)
        .json({ error: "Estructura de proyectos inválida o vacía." });
    }

    const proyectosFiltrados = proyects.proyectos
      .map((proyecto) => {
        // Filtramos las actividades no terminadas en cada componente
        const componentesFiltrados = proyecto.componentes
          .map((componente) => {
            const actividadesPendientes = componente.actividades.filter(
              (a) => !a.terminada
            );

            // Solo conservamos componentes que aún tengan actividades sin terminar
            if (actividadesPendientes.length > 0) {
              return {
                ...componente,
                actividades: actividadesPendientes,
              };
            }
            return null;
          })
          .filter((c) => c !== null);

        // Solo conservamos proyectos que aún tengan componentes con actividades pendientes
        if (componentesFiltrados.length > 0) {
          return {
            ...proyecto,
            componentes: componentesFiltrados,
          };
        }
        return null;
      })
      .filter((p) => p !== null);

    const resultadoFinal = {
      totalProyectosPendientes: proyectosFiltrados.length,
      proyectos: proyectosFiltrados,
    };

    localStorage.setItem(`${email}Proyecto`, JSON.stringify(resultadoFinal));
    // res.json(resultadoFinal);
  } catch (error) {
    console.error("❌ Error al procesar proyectos:", error);
    res.status(500).json({ error: "Error interno procesando los proyectos" });
  }
};


// TODO ENDPOINT PARA VALIDAR SI EL PROYECTO ESTA COMPLETO O NO
//? ESTE ENDPONIT NO ESTA EN USO
const ValidarTotalProyectos = (req, res) => {


   //todo valida si el proyecto esta completo o no devuelve un objeto con el total de proyectos y su estado
    //todo si el proyecto tiene todas las actividades terminadas completado true si no false
    //todo si el proyecto tiene todas las actividades terminadas en todos sus componentes completado true si no false

    // try {
    //   const { email } = req.query;
    //   console.log(email);
    //   const proyects = JSON.parse(localStorage.getItem(`${email}Proyecto`));

    //   if (!proyects || !Array.isArray(proyects.proyectos)) {
    //     return res
    //       .status(400)
    //       .json({ error: "Estructura de proyectos inválida o vacía." });
    //   }

    //   const proyectosArray = proyects.proyectos;

    //   const resumenProyectos = proyectosArray.map((proyecto) => {
    //     let totalActividadesProyecto = 0;
    //     let actividadesTerminadas = 0;

    //     const componentesData = proyecto.componentes.map((componente) => {
    //       const totalActividades = componente.actividades.length;
    //       const terminadas = componente.actividades.filter(
    //         (a) => a.terminada
    //       ).length;

    //       totalActividadesProyecto += totalActividades;
    //       actividadesTerminadas += terminadas;

    //       return {
    //         componente: componente.componente,
    //         totalActividades,
    //         terminadas,
    //         faltantes: totalActividades - terminadas,
    //         completado: terminadas === totalActividades,
    //       };
    //     });

    //     const faltantes = totalActividadesProyecto - actividadesTerminadas;
    //     const completado = faltantes === 0;

    //     return {
    //       proyecto: proyecto.proyecto,
    //       totalComponentes: proyecto.componentes.length,
    //       totalActividades: totalActividadesProyecto,
    //       terminadas: actividadesTerminadas,
    //       faltantes,
    //       completado,
    //       componentes: componentesData,
    //     };
    //   });

    //   const resultadoFinal = {
    //     totalProyectos: proyectosArray.length,
    //     proyectos: resumenProyectos,
    //   };

    //   res.json(resultadoFinal);
    // } catch (error) {
    //   console.error("❌ Error al procesar proyectos:", error);
    //   res.status(500).json({ error: "Error interno procesando los proyectos" });
    // }


    //todo valida si el proyecto esta completo o no devuelve un objeto con el total de proyectos y su estado
    //todo este me devuelve mas informacion ya que devuelve el idnodo del componente y el idnodo de la actividad
    try {
  const { email } = req.query;
  console.log("📧 Email recibido:", email);

  // ⚙️ Cargar proyectos desde el localStorage (según tu estructura actual)
  const proyects = JSON.parse(localStorage.getItem(`${email}Proyecto`));

  if (!proyects || !Array.isArray(proyects.proyectos)) {
    return res
      .status(400)
      .json({ error: "Estructura de proyectos inválida o vacía." });
  }

  // 🔍 Procesar todos los proyectos
  const proyectosProcesados = proyects.proyectos.map((proyecto) => {
    let totalActividadesProyecto = 0;
    let actividadesTerminadasProyecto = 0;
    let actividadesFaltantesProyecto = 0;

    // 📦 Procesar componentes del proyecto
    const componentesProcesados = proyecto.componentes.map((componente) => {
      const totalActividades = componente.actividades.length;

      // Dividir las actividades entre terminadas y pendientes
      const actividadesTerminadas = componente.actividades.filter((a) => a.terminada);
      const actividadesFaltantes = componente.actividades.filter((a) => !a.terminada);

      totalActividadesProyecto += totalActividades;
      actividadesTerminadasProyecto += actividadesTerminadas.length;
      actividadesFaltantesProyecto += actividadesFaltantes.length;

      return {
        componente: componente.componente,
        idNodoC: componente.idNodoC,
        totalActividades,
        totalTerminadas: actividadesTerminadas.length,
        totalFaltantes: actividadesFaltantes.length,
        completado: actividadesFaltantes.length === 0,
        actividadesTerminadas: actividadesTerminadas.map((a) => ({
          idNodoA: a.idNodoA,
          actividad: a.actividad,
          terminada: a.terminada,
        })),
        actividadesFaltantes: actividadesFaltantes.map((a) => ({
          idNodoA: a.idNodoA,
          actividad: a.actividad,
          terminada: a.terminada,
        })),
      };
    });

    const completado = actividadesFaltantesProyecto === 0;

    return {
      proyecto: proyecto.proyecto,
      idNodoP: proyecto.idNodoP,
      totalComponentes: proyecto.componentes.length,
      totalActividades: totalActividadesProyecto,
      totalTerminadas: actividadesTerminadasProyecto,
      totalFaltantes: actividadesFaltantesProyecto,
      completado,
      componentes: componentesProcesados,
    };
  });

  // 📊 Resultado general
  const resultadoFinal = {
    totalProyectos: proyectosProcesados.length,
    proyectos: proyectosProcesados,
  };

  res.json(resultadoFinal);

} catch (error) {
  console.error("❌ Error al procesar proyectos:", error);
  res.status(500).json({ error: "Error interno procesando los proyectos" });
}

}

const getProyectName = async (req, res) => {
  const { search, email } = req.query;
  console.log("eeeeeeeeeee");
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
    console.log(NomProyect, "qqqqqqqqqqqqqqqqqqqqqqqqqqq");
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
  console.log("holaaaaa", email);
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
    console.log(proyect);
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
    console.log("ENTRO A HORAS")
    const { idNodoProyecto, idNodoActividad,DocumentoEmpleado } = req.query;
    const hours = await sequelize.query(
      `SELECT SUM(DuracionHoras) as horas FROM TBL_SER_ReporteHorasActividadEmpleado where idNodoProyecto = ${idNodoProyecto} AND idNodoActividad = ${idNodoActividad} AND DocumentoEmpleado = ${DocumentoEmpleado}`
    );


    const TotalH = parseFloat(hours[0][0].horas).toFixed(2);
    console.log(TotalH,"Total de horas")
    res.json(TotalH);
  } catch (error) {
    res.json({ error: error });
  }
};

// const hourActivities = async (req, res) => {
//   try {
//     const { idNodoProyecto, idNodoActividad, DocumentoEmpleado } = req.query;

//     const [rows] = await sequelize.query(
//       `SELECT SUM(DuracionHoras) AS horas
//        FROM TBL_SER_ReporteHorasActividadEmpleado
//        WHERE idNodoProyecto = :idNodoProyecto
//          AND idNodoActividad = :idNodoActividad
//          AND DocumentoEmpleado = :DocumentoEmpleado`,
//       {
//         replacements: {
//           idNodoProyecto,
//           idNodoActividad,
//           DocumentoEmpleado
//         }
//       }
//     );

//     const TotalH = parseFloat(rows.horas || 0).toFixed(2);

//     console.log(TotalH, "Total de horas");
//     res.json(TotalH);

//   } catch (error) {
//     res.json({ error: error.message });
//   }
// };


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

    console.log(doc, sku, "anticipo");
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
        tarjeta: datos.EsTarjeta,
      });
    });
    console.log(objDatos, "antici55555555555555555555555555555555555555555");
    res.send(objDatos);
  } catch (error) {
    res.json({ error: error });
  }
};

const tipoTransaccion = async (req, res) => {
  try {
     // ? listado de transacciones 
        const [resultados] = await sequelize.query(`
          SELECT *
          FROM TBL_CON_TipoTransaccion
        `);

        // Devuelve un objeto con la propiedad "transacciones"
        const objDatos = {
      transacciones: resultados.map(t => ({
        id: t.id,
        tipo: t.TipoTransaccion
      }))
    };

        res.json(objDatos);
  } catch (error) {
    console.error("Error obteniendo tipos de transacción:", error);
    res.status(500).json({ error: "Error en el servidor" });
  }
};

const ProyectosGastos = async (req, res) => {
  try {
    const [resultados] = await sequelize.query(`
       SELECT dbo.TBL_SER_ValoracionEncabezado.OP, dbo.TBL_SER_ValoracionEncabezado.SKU, dbo.TBL_SER_PROYECTOS.Nombre,
       dbo.TBL_SER_PROYECTOS.idPadre,dbo.TBL_SER_PROYECTOS.idNodo,dbo.TBL_SER_PROYECTOS.NitCliente,
       dbo.TBL_SER_ValoracionEncabezado.Etapa FROM dbo.TBL_SER_ValoracionEncabezado LEFT OUTER JOIN
       dbo.TBL_SER_PROYECTOS ON dbo.TBL_SER_ValoracionEncabezado.SKU = dbo.TBL_SER_PROYECTOS.SKU
       WHERE (dbo.TBL_SER_PROYECTOS.TipoParte = N'cabecera') AND (dbo.TBL_SER_ValoracionEncabezado.Etapa = N'Activación')
    `);

    // Devuelve un objeto con los proyectos solo activos para la pestaña de gastos
    const Proyectos = {
      ProyectosGastos: resultados.map((t) => ({
        OP: t.OP,
        SKU: t.SKU,
        idPadre: t.idPadre,
        idNodo: t.idNodo,
        NitCliente: t.NitCliente,
        Nombre: t.Nombre,
        Etapa: t.Etapa,
      })),
    };

    res.json(Proyectos);
    // TODO POR SI PIDEN QUE SE ENVIE EL IDNODO Y PADRE
    //select * from TBL_SER_PROYECTOS where SKU = 50138 AND TipoParte = N'cabecera'
  } catch (error) {
    console.error("Error obteniendo tipos de transacción:", error);
    res.status(500).json({ error: "Error en el servidor" });
  }
};

const Entregables = async (req, res) => {
  const {
    SKU_Proyecto,
    NitCliente,
    idNodoProyecto,
    NumeroEntregable,
    idProceso,
    DocumentoEmpleado
  } = req.query;
  // res.send("ok")
  // return
  let entrega = false;
  try {
    const Entregables = await sequelize.query(
      `
    SELECT * FROM TBL_SER_ProyectoActividadesEmpleadosEntregables 
    WHERE SKU_Proyecto = :sku AND NitCliente = :nit AND idNodoProyecto = :id
     AND NumeroEntregable = :numE AND idProceso = :proceso  AND  N_DocumentoEmpleado = :DocEmpleado`,
      {
        replacements: {
          sku: SKU_Proyecto,
          nit: NitCliente,
          id: idNodoProyecto,
          numE: NumeroEntregable,
          proceso: idProceso,
          DocEmpleado : DocumentoEmpleado
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
  tipoTransaccion,
  ProyectosGastos,
  ValidarTotalProyectos
};
