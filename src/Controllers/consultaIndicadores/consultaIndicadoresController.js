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


const consultaIndicadoresController_ok = async (req, res) => {

  const { docId } = req.query;
  const anio = Number(req.query.anio);
  const mes = Number(req.query.mes);
console.log("docId", docId, "anio", anio, "mes", mes)
  try {
if(!docId || isNaN(anio) || isNaN(mes))  return {
      ok: true,
    };
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

const consultaIndicadoresController = async (req, res) => {
  const { docId } = req.query;
  const anio = Number(req.query.anio);
  const mes = Number(req.query.mes);

  try {

    if (!docId || isNaN(anio) || isNaN(mes)) {
      return {
        ok: true,
        indicadores: {}
      };
    }

  const indicadores = await sequelize.query(
`
SELECT

    CASE
        WHEN :anio = 2026 AND :mes = 1
        THEN 0
        ELSE ROUND(SUM(CASE
            WHEN Año >= 2026
             AND (
                    Año < :anio
                 OR (Año = :anio AND mes < :mes)
                 )
            THEN ISNULL(DiasLaborales,0)
            ELSE 0
        END),1)
    END AS DiasProgramados_Acumulado,

    ROUND(SUM(CASE
        WHEN Año = :anio
         AND mes = :mes
        THEN ISNULL(DiasLaborales,0)
        ELSE 0
    END),1) AS DiasProgramados_Mes,

    ROUND(SUM(CASE
        WHEN Año < :anio
         OR (Año = :anio AND mes < :mes)
        THEN ISNULL(HorasDisponibles,0)
        ELSE 0
    END),1) AS HorasDisponibles_Acumulado,

    ROUND(SUM(CASE
        WHEN Año = :anio
         AND mes = :mes
        THEN ISNULL(HorasDisponibles,0)
        ELSE 0
    END),1) AS HorasDisponibles_Mes,

    ROUND(SUM(CASE
        WHEN Año < :anio
         OR (Año = :anio AND mes < :mes)
        THEN ISNULL(Total_Horas_Asignadas_Proy,0)
        ELSE 0
    END),1) AS HorasProgramadas_Acumulado,

    ROUND(SUM(CASE
        WHEN Año = :anio
         AND mes = :mes
        THEN ISNULL(Total_Horas_Asignadas_Proy,0)
        ELSE 0
    END),1) AS HorasProgramadas_Mes,

    ROUND(SUM(CASE
        WHEN Año < :anio
         OR (Año = :anio AND mes < :mes)
        THEN ISNULL(HorasRealesReportadas,0)
        ELSE 0
    END),1) AS HorasCumplidas_Acumulado,

    ROUND(SUM(CASE
        WHEN Año = :anio
         AND mes = :mes
        THEN ISNULL(HorasRealesReportadas,0)
        ELSE 0
    END),1) AS HorasCumplidas_Mes,

    ROUND(SUM(CASE
        WHEN Año < :anio
         OR (Año = :anio AND mes < :mes)
        THEN (
            ISNULL(Total_Horas_Asignadas_Proy,0)
            - ISNULL(HorasRealesReportadas,0)
        )
        ELSE 0
    END),1) AS HorasPendientes_Acumulado,

    ROUND(SUM(CASE
        WHEN Año = :anio
         AND mes = :mes
        THEN (
            ISNULL(Total_Horas_Asignadas_Proy,0)
            - ISNULL(HorasRealesReportadas,0)
        )
        ELSE 0
    END),1) AS HorasPendientes_Mes,

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

    let resultado = indicadores[0] || {};

    // ==========================
    // REGLA ESPECIAL
    // Enero 2026 arranca en cero
    // ==========================
    if (anio === 2026 && mes === 1) {
      resultado.DiasProgramados_Acumulado = 0;
      console.log("Aplicando regla especial para Enero 2026: DiasProgramados_Acumulado se establece en 0");
    }
console.log("indicadores", resultado)
    return {
      ok: true,
      indicadores: resultado
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