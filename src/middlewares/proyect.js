// const { Op } = require("sequelize");
const { sequelize } = require("../db");
const { LocalStorage } = require("node-localstorage");
const localStorage = new LocalStorage("./local-storage");

const LoadProyect = async (Doc_id, email) => {
  //? se piden los datos del usuario en el localStorage
  // const user = JSON.parse(localStorage.getItem("user"));
  //? se selecciona los idNodo para saber que proyectos tiene el usuario
  try {
    const idnodo = await sequelize.query(
      `SELECT idNodoProyecto FROM TBL_SER_ProyectoActividadesEmpleados where N_DocumentoEmpleado = ${Doc_id} and Terminada = 0 `
    );

    let proyect;
    let Cod_parte;
    let obj_proyecto = {
      proyectos: [],
    };
    let con = 0;

    for (const i of idnodo[0]) {
      proyect = await sequelize.query(
        `SELECT * FROM TBL_SER_PROYECTOS WHERE SKU IN (SELECT DISTINCT(SKU_Proyecto) 
      FROM TBL_SER_ProyectoActividadesEmpleados WHERE 
      N_DocumentoEmpleado = :docId AND idNodo = ${i.idNodoProyecto}) ORDER BY sku, idNodo`,
        { replacements: { docId: Doc_id } }
      );

      let ID_parte = parseInt(proyect[0][0].Cod_parte);
      let idPadre = proyect[0][0].idPadre;
      let componentes = [];
      let actividades = [];
      let tipoParte;
      let Parte = idPadre;
      let actividad = "";
      let componente = "";
      let proyecto = "";
      let fecha = "";
      let frecuencia = 0;
      let entregable = false;
      let nitCliente = "";
      let Codi_parteP = "";
      let idNodoP = "";
      let idPadreP = "";
      let Codi_parteC = "";
      let idNodoC = "";
      let idPadreC = "";
      let Codi_parteA = "";
      let idNodoA = "";
      let idPadreA = "";
      let skuP = "";
      let skuC = "";
      let skuA = "";

      Cod_parte = await sequelize.query(
        `select* from TBL_ESP_Procesos  where ID = ${ID_parte}`
        // {replacements:{Codigo:}}
      );
      const entrega = await sequelize.query(
        `select * from TBL_SER_EntregablesActividad where id_Proceso = ${Cod_parte[0][0].ID}`
      );
      const nomEntregable = entrega[0]?.map((nom) => {
        return {
          id_proceso: nom.id_Proceso,
          Numero: nom.Numero,
          Nom_Entregable: nom.Nombre,
          subido: nom.Subido,
        };
      });

      if (proyect[0][0].TipoParte === "Actividad") {
        actividad = proyect[0][0].Nombre;
        frecuencia = Cod_parte[0][0].FrecuenciaVeces;
        entregable = Cod_parte[0][0].AplicaEntregables;
        nom_entregable = nomEntregable;
        idNodoA = proyect[0][0].idNodo;
        Codi_parteA = proyect[0][0].Cod_parte;
        idPadreA = proyect[0][0].idPadre;
        skuA = proyect[0][0].SKU;
      }
      do {
        tipoParte = await sequelize.query(
          `SELECT * FROM TBL_SER_PROYECTOS WHERE SKU IN (SELECT DISTINCT(SKU_Proyecto) FROM TBL_SER_ProyectoActividadesEmpleados WHERE N_DocumentoEmpleado = :docId AND idNodo = ${Parte}) ORDER BY sku, idNodo`,
          { replacements: { docId: Doc_id } }
        );
        Parte = tipoParte[0][0].idPadre;
        if (tipoParte[0][0].TipoParte === "PP") {
          componente = tipoParte[0][0].Nombre;
          //? saca la fecha exacta del string
          fecha = new Date(proyect[0][0].Fecha).toISOString().split("T")[0];
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
          //fecha = new Date(proyect[0][0].Fecha).toISOString().split("T")[0];
        }
        //? Verificar si el proyecto ya existe en el objeto obj_proyecto
        let proyectoExistente = obj_proyecto.proyectos.find(
          (p) => p.proyecto === proyecto
        );

        if (proyectoExistente) {
          //? Verificar si el componente ya existe en el proyecto
          let componenteExistente = proyectoExistente.componentes.find(
            (c) => c.componente === componente
          );

          if (componenteExistente) {
            //? Agregar la actividad al componente existente
            console.log(
              "push Actividad",
              idNodoA,
              Codi_parteA,
              idPadreA,
              actividades
            );
            componenteExistente.actividades.push({
              actividad: actividad,
              frecuencia,
              entregable,
              nombre_entregable: nom_entregable,
              idNodoA,
              Codi_parteA,
              idPadreA,
              skuA,
            });
          } else {
            //? Agregar un nuevo componente con la actividad al proyecto existente
            console.log("push componente");
            proyectoExistente.componentes.push({
              fecha,
              componente: componente,
              idNodoC,
              Codi_parteC,
              idPadreC,
              skuC,
              actividades: [
                {
                  actividad: actividad,
                  frecuencia,
                  entregable,
                  nombre_entregable: nom_entregable,
                  idNodoA,
                  Codi_parteA,
                  idPadreA,
                  skuA,
                },
              ],
            });
          }
        } else {
          //? Agregar un nuevo proyecto con el componente y actividad
          if (proyecto !== "") {
            console.log("entra al if", componentes);
            obj_proyecto.proyectos?.push({
              proyecto: proyecto,
              idNodoP,
              Codi_parteP,
              idPadreP,
              skuP,
              nitCliente,
              componentes: [
                {
                  fecha,
                  componente: componente,
                  idNodoC,
                  Codi_parteC,
                  idPadreC,
                  skuC,
                  actividades: [
                    {
                      actividad: actividad,
                      frecuencia,
                      entregable,
                      nombre_entregable: nom_entregable,
                      idNodoA,
                      Codi_parteA,
                      idPadreA,
                      skuA,
                    },
                  ],
                },
              ],
            });
          }
        }
      } while (tipoParte[0][0].TipoParte !== "Cabecera");
    }

    localStorage.setItem(`${email}Proyecto`, JSON.stringify(obj_proyecto));
    //! en el deploy validar que el archivo no se sobreescriba
  } catch (error) {
    console.log("el error es", error);
    // res.json({ error: error });
  }
};

//todo hacer consulta para proyectos enviando respuesta automatica
const getProyectName = async (req, res) => {
  const { search, email } = req.query;
  console.log("entro", email);
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
    res.json(NomProyect);
  } catch (error) {
    res.json({ error: error });
  }
};

//todo hacer consulta para enviar el proyectos
const getProyect = async (req, res) => {
  const { search, email } = req.query;
  try {
    const proyects = JSON.parse(localStorage.getItem(`${email}Proyecto`));

    //? me devuelve todo el objeto
    let proyect;

    proyect = proyects.proyectos.filter((obj) => {
      return obj.proyecto.includes(search.toUpperCase());
    });

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
  console.log(req.body)
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
    console.log(idNodoProyecto, idNodoActividad);
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
    res.send("error en la actualizacion");
  }
};

const UpdatProyect = async (req, res) => {
  const { doc_id, email } = req.body;
  localStorage.removeItem(`${email}Proyecto`);
  await LoadProyect(doc_id, email);
  res.send("Proyeco actualizado");
};

const AnticipoGastos = async (req, res) => {
    const {doc,sku} = req.body

  const datos = await sequelize.query(
    `
    SELECT * FROM TBL_CON_TES_ListaComprobantesCajaMenor WHERE N_Documento = :doc AND SKU = :sku`,
    {
      replacements: { doc: doc, sku: sku },
      type: sequelize.QueryTypes.SELECT
    }
  );

  let objDatos = []
  datos.map((datos) =>{
    objDatos.push({
    NumeroComprobante: datos.NumeroComprobante,
    IdResponsable: datos.IdResponsable,
    Valor: datos.Valor,
    DetalleConcepto:datos.DetalleConcepto,
    IdCentroCostos: datos.IdCentroCostos,
    sku:datos.SKU

  })
  })

  res.send(objDatos)
};


const Entregables = async(req,res) =>{
const {SKU_Proyecto,NitCliente,idNodoProyecto,NumeroEntregable} =  req.query

console.log(SKU_Proyecto,NitCliente,idNodoProyecto,NumeroEntregable)
// res.send("ok")
// return
let entrega = false
try {
  const Entregables = await sequelize.query(
    `
    SELECT * FROM TBL_SER_ProyectoActividadesEmpleadosEntregables WHERE SKU_Proyecto = :sku AND NitCliente = :nit AND idNodoProyecto = :id AND NumeroEntregable = :numE`,
    {
      replacements: { sku: SKU_Proyecto, nit: NitCliente, id: idNodoProyecto, numE:NumeroEntregable },
      type: sequelize.QueryTypes.SELECT
    }
  );
  
  if (Entregables.length >= 1) {
    entrega = true
  }
  res.json(entrega)
} catch (error) {
  res.json(error)
}


}

//todo desloguea el usuario
const logout = (req, res) => {
  const { email } = req.query;
  try {
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
  Entregables
};
