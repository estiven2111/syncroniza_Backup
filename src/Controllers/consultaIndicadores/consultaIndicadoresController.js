const { sequelize } = require("../../db");
const consultaIndicadoresController_origin = async(req) =>{
const {docId} = req.query
console.log(docId)

try {
  let HDisponibles = await sequelize.query(
        `
        select B.Horas HorasDias,B.Horas*30 HorasMes, AVG(PorcEF) Eficiencia,(B.Horas*30)*(AVG(PorcEF)/100) HorasDisponibles
from TBL_NOM_Empleado A
inner join TBL_ESP_Turnos B on A.turno=b.Id
inner join TBL_ESP_PersonalMO C on A.cedula=C.DocumentoId
inner join TBL_ESP_OperacionMO D on C.ID=D.id_MO
where cedula= :docId
group by B.Horas
        `,
        { replacements: { docId: docId } }
    )
    const fechaActual = new Date()
    const anioActual = fechaActual.getFullYear()

    let fechas = await sequelize.query(
        `
        select id,CONVERT(nvarchar(30),Inicio,106)+' a '+CONVERT(nvarchar(30),Fin,106)Fecha 
        from TBL_CON_PERIODOCONTABLE
        where YEAR(Inicio)=${anioActual} or YEAR(Fin)=${anioActual} 
        order by id
        `
    )
  
    if (HDisponibles[0].length > 0) {
        HDisponibles = HDisponibles[0]
    }else{
        HDisponibles = 0
    }
    const datos = {
        HDisponibles: HDisponibles,
        fechas:fechas[0]
    }
    return datos
} catch (error) {
    console.log("el error es",error.message)
}


}

const consultaIndicadoresController2 = async (req) => {
    const { docId, anio, mes } = req.query;

    try {

        const indicadores = await sequelize.query(
            `
            WITH Indicadores AS
            (
                SELECT

                    SUM(CASE
                            WHEN (Año < :anio)
                              OR (Año = :anio AND mes < :mes)
                            THEN DiasLaborales
                            ELSE 0
                        END) AS DiasProgramados_Acumulado,

                    SUM(CASE
                            WHEN Año = :anio
                             AND mes = :mes
                            THEN DiasLaborales
                            ELSE 0
                        END) AS DiasProgramados_Mes,

                    SUM(CASE
                            WHEN (Año < :anio)
                              OR (Año = :anio AND mes < :mes)
                            THEN HorasDisponibles
                            ELSE 0
                        END) AS HorasDisponibles_Acumulado,

                    SUM(CASE
                            WHEN Año = :anio
                             AND mes = :mes
                            THEN HorasDisponibles
                            ELSE 0
                        END) AS HorasDisponibles_Mes,

                    SUM(CASE
                            WHEN (Año < :anio)
                              OR (Año = :anio AND mes < :mes)
                            THEN Total_Horas_Asignadas_Proy
                            ELSE 0
                        END) AS HorasProgramadas_Acumulado,

                    SUM(CASE
                            WHEN Año = :anio
                             AND mes = :mes
                            THEN Total_Horas_Asignadas_Proy
                            ELSE 0
                        END) AS HorasProgramadas_Mes,

                    SUM(CASE
                            WHEN (Año < :anio)
                              OR (Año = :anio AND mes < :mes)
                            THEN HorasRealesReportadas
                            ELSE 0
                        END) AS HorasCumplidas_Acumulado,

                    SUM(CASE
                            WHEN Año = :anio
                             AND mes = :mes
                            THEN HorasRealesReportadas
                            ELSE 0
                        END) AS HorasCumplidas_Mes,

                    SUM(CASE
                            WHEN (Año < :anio)
                              OR (Año = :anio AND mes < :mes)
                            THEN [Saldo acumulado de horas programadas no ejecutadas]
                            ELSE 0
                        END) AS HorasPendientes_Acumulado,

                    SUM(CASE
                            WHEN Año = :anio
                             AND mes = :mes
                            THEN (
                                ISNULL(Total_Horas_Asignadas_Proy,0)
                                - ISNULL(HorasRealesReportadas,0)
                            )
                            ELSE 0
                        END) AS HorasPendientes_Mes,

                    0 AS HorasFrecuencia_Acumulado,
                    0 AS HorasFrecuencia_Mes

                FROM dbo.VW_ReporteIndicadorProyectos_Actividades
                WHERE Documento = :docId
            )

            SELECT
                *,

                -- ATRASO
                CASE
                    WHEN HorasProgramadas_Acumulado = 0
                    THEN 0
                    ELSE
                        (HorasPendientes_Acumulado * 100.0)
                        / HorasProgramadas_Acumulado
                END AS Atraso,

                -- PRODUCTIVIDAD
                CASE
                    WHEN (HorasProgramadas_Acumulado + HorasProgramadas_Mes) = 0
                    THEN 0
                    ELSE
                    (
                        (HorasCumplidas_Acumulado + HorasCumplidas_Mes)
                        * 100.0
                    )
                    /
                    (
                        HorasProgramadas_Acumulado
                        + HorasProgramadas_Mes
                    )
                END AS Productividad

            FROM Indicadores
            `,
            {
                replacements: {
                    docId,
                    anio: Number(anio),
                    mes: Number(mes)
                },
                type: sequelize.QueryTypes.SELECT
            }
        );
console.log(indicadores)
        return {
            ok: true,
            indicadores: indicadores[0] || {}
        };

    } catch (error) {
        console.error(error);

        return {
            ok: false,
            message: error.message
        };
    }
};

const consultaIndicadoresController = async (req, res) => {

  const { docId } = req.query;
  const anio = Number(req.query.anio);
  const mes = Number(req.query.mes);
console.log("docId", docId, "anio", anio, "mes", mes)
  try {

    const indicadores = await sequelize.query(
      `
      SELECT

          -- =========================
          -- DÍAS PROGRAMADOS
          -- =========================
          ROUND(SUM(CASE
              WHEN Año < :anio OR (Año = :anio AND mes < :mes)
              THEN ISNULL(DiasLaborales,0)
              ELSE 0
          END), 1) AS DiasProgramados_Acumulado,

          ROUND(SUM(CASE
              WHEN Año = :anio AND mes = :mes
              THEN ISNULL(DiasLaborales,0)
              ELSE 0
          END), 1) AS DiasProgramados_Mes,

          -- =========================
          -- HORAS DISPONIBLES
          -- =========================
          ROUND(SUM(CASE
              WHEN Año < :anio OR (Año = :anio AND mes < :mes)
              THEN ISNULL(HorasDisponibles,0)
              ELSE 0
          END), 1) AS HorasDisponibles_Acumulado,

          ROUND(SUM(CASE
              WHEN Año = :anio AND mes = :mes
              THEN ISNULL(HorasDisponibles,0)
              ELSE 0
          END), 1) AS HorasDisponibles_Mes,

          -- =========================
          -- HORAS PROGRAMADAS
          -- =========================
          ROUND(SUM(CASE
              WHEN Año < :anio OR (Año = :anio AND mes < :mes)
              THEN ISNULL(Total_Horas_Asignadas_Proy,0)
              ELSE 0
          END), 1) AS HorasProgramadas_Acumulado,

          ROUND(SUM(CASE
              WHEN Año = :anio AND mes = :mes
              THEN ISNULL(Total_Horas_Asignadas_Proy,0)
              ELSE 0
          END), 1) AS HorasProgramadas_Mes,

          -- =========================
          -- HORAS CUMPLIDAS
          -- =========================
          ROUND(SUM(CASE
              WHEN Año < :anio OR (Año = :anio AND mes < :mes)
              THEN ISNULL(HorasRealesReportadas,0)
              ELSE 0
          END), 1) AS HorasCumplidas_Acumulado,

          ROUND(SUM(CASE
              WHEN Año = :anio AND mes = :mes
              THEN ISNULL(HorasRealesReportadas,0)
              ELSE 0
          END), 1) AS HorasCumplidas_Mes,

          -- =========================
          -- HORAS PENDIENTES
          -- =========================
          ROUND(SUM(CASE
              WHEN Año < :anio OR (Año = :anio AND mes < :mes)
              THEN (ISNULL(Total_Horas_Asignadas_Proy,0) - ISNULL(HorasRealesReportadas,0))
              ELSE 0
          END), 1) AS HorasPendientes_Acumulado,

          ROUND(SUM(CASE
              WHEN Año = :anio AND mes = :mes
              THEN (ISNULL(Total_Horas_Asignadas_Proy,0) - ISNULL(HorasRealesReportadas,0))
              ELSE 0
          END), 1) AS HorasPendientes_Mes,

          -- =========================
          -- FRECUENCIA (TEMPORAL)
          -- =========================
          CAST(0 AS DECIMAL(18,1)) AS HorasFrecuencia_Acumulado,
          CAST(0 AS DECIMAL(18,1)) AS HorasFrecuencia_Mes

      FROM dbo.VW_ReporteIndicadorProyectos_Actividades
      WHERE Documento = :docId
      `,
      {
        replacements: {
          docId,
          anio,
          mes
        },
        type: sequelize.QueryTypes.SELECT
      }
    );
    console.log("indicadores", indicadores)
    return {
      ok: true,
      indicadores: indicadores[0] || {}
    };

  } catch (error) {
    console.error("Error consulta indicadores:", error);

    return res.status(500).json({
      ok: false,
      message: error.message
    });
  }
};



module.exports = consultaIndicadoresController