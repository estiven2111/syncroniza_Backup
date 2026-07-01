const { sequelize } = require("../../db");

const consultaIndicadoresController_original = async (req, res) => {
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
console.log("Horas Pendientessssssssssssssssssss", indicadores[0]);

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



const consultaIndicadoresController_no = async (req, res) => {
  const { docId } = req.query;
  const anio = Number(req.query.anio);
  const mes = Number(req.query.mes);

  try {
    if (!docId || isNaN(anio) || isNaN(mes)) {
      return res.json({
        ok: true,
        indicadores: {}
      });
    }

    const indicadores = await sequelize.query(
      `
SELECT

    -- ==========================
    -- DIAS PROGRAMADOS
    -- ==========================
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

    -- ==========================
    -- HORAS DISPONIBLES
    -- ==========================
    ROUND(SUM(CASE
        WHEN Año >= 2026
         AND (
            Año < :anio
            OR (Año = :anio AND mes < :mes)
         )
        THEN ISNULL(HorasDisponibles,0)
        ELSE 0
    END),1) AS HorasDisponibles_Acumulado,

    ROUND(SUM(CASE
        WHEN Año = :anio
         AND mes = :mes
        THEN ISNULL(HorasDisponibles,0)
        ELSE 0
    END),1) AS HorasDisponibles_Mes,

    -- ==========================
    -- HORAS PROGRAMADAS
    -- ==========================
    ROUND(SUM(CASE
        WHEN Año >= 2026
         AND (
            Año < :anio
            OR (Año = :anio AND mes < :mes)
         )
        THEN ISNULL(Total_Horas_Asignadas_Proy,0)
        ELSE 0
    END),1) AS HorasProgramadas_Acumulado,

    ROUND(SUM(CASE
        WHEN Año = :anio
         AND mes = :mes
        THEN ISNULL(Total_Horas_Asignadas_Proy,0)
        ELSE 0
    END),1) AS HorasProgramadas_Mes,

    -- ==========================
    -- HORAS CUMPLIDAS
    -- ==========================
    ROUND(SUM(CASE
        WHEN Año >= 2026
         AND (
            Año < :anio
            OR (Año = :anio AND mes < :mes)
         )
        THEN ISNULL(HorasRealesReportadas,0)
        ELSE 0
    END),1) AS HorasCumplidas_Acumulado,

    ROUND(SUM(CASE
        WHEN Año = :anio
         AND mes = :mes
        THEN ISNULL(HorasRealesReportadas,0)
        ELSE 0
    END),1) AS HorasCumplidas_Mes,

    -- ==========================
    -- HORAS PENDIENTES
    -- ==========================
    ROUND(SUM(CASE
        WHEN Año >= 2026
         AND (
            (Año = :anio AND mes = :mes - 1)
            OR (:mes = 1 AND Año = :anio - 1 AND mes = 12)
         )
        THEN ISNULL([Diferencia en Horas PptoReal],0)
        ELSE 0
    END),1) AS HorasPendientes_Acumulado,

    ROUND(SUM(CASE
        WHEN Año = :anio
         AND mes = :mes
        THEN ISNULL([Diferencia en Horas PptoReal],0)
        ELSE 0
    END),1) AS HorasPendientes_Mes,

    -- ==========================
    -- ATRASO
    -- ==========================
    CAST(AVG(CASE
        WHEN Año = :anio
         AND mes = :mes
        THEN ISNULL([% Atraso],0)
        ELSE NULL
    END) AS DECIMAL(18,6)) AS Atraso_Mes,

    CAST(AVG(CASE
        WHEN Año >= 2026
         AND (
            (Año = :anio AND mes = :mes - 1)
            OR (:mes = 1 AND Año = :anio - 1 AND mes = 12)
         )
        THEN ISNULL([% Atraso],0)
        ELSE NULL
    END) AS DECIMAL(18,6)) AS Atraso_Acumulado,

    -- ==========================
    CAST(0 AS DECIMAL(18,1)) AS HorasFrecuencia_Acumulado,
    CAST(0 AS DECIMAL(18,1)) AS HorasFrecuencia_Mes

FROM dbo.VW_ReporteIndicadorProyectos_Actividades
WHERE Documento = :docId
AND Año >= 2026
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
    // ==========================
    if (anio === 2026 && mes === 1) {
      resultado.DiasProgramados_Acumulado = 0;
      console.log("Aplicando regla especial para Enero 2026");
    }

    console.log("indicadores", resultado);

    return {
      ok: true,
      indicadores: resultado
    };

  } catch (error) {
    console.error("Error consulta indicadores:", error);

    return {
      ok: false,
      message: error.message
    };
  }
};


const consultaIndicadoresController_ok = async (req, res) => {
  const { docId } = req.query;
  const anio = Number(req.query.anio);
  const mes = Number(req.query.mes);

  try {

    // ==========================
    // VALIDACIÓN
    // ==========================
    if (!docId || isNaN(anio) || isNaN(mes)) {
      return {
        ok: true,
        indicadores: {}
      };
    }

    // ==========================
    // QUERY
    // ==========================
    const indicadores = await sequelize.query(
`
SELECT

    -- ==========================
    -- DIAS PROGRAMADOS (DESDE 2026)
    -- ==========================
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

    -- ==========================
    -- HORAS DISPONIBLES
    -- ==========================
    ROUND(SUM(CASE
        WHEN Año >= 2026
         AND (
                Año < :anio
             OR (Año = :anio AND mes < :mes)
             )
        THEN ISNULL(HorasDisponibles,0)
        ELSE 0
    END),1) AS HorasDisponibles_Acumulado,

    ROUND(SUM(CASE
        WHEN Año = :anio
         AND mes = :mes
        THEN ISNULL(HorasDisponibles,0)
        ELSE 0
    END),1) AS HorasDisponibles_Mes,

    -- ==========================
    -- HORAS PROGRAMADAS
    -- ==========================
    ROUND(SUM(CASE
        WHEN Año >= 2026
         AND (
                Año < :anio
             OR (Año = :anio AND mes < :mes)
             )
        THEN ISNULL(Total_Horas_Asignadas_Proy,0)
        ELSE 0
    END),1) AS HorasProgramadas_Acumulado,

    ROUND(SUM(CASE
        WHEN Año = :anio
         AND mes = :mes
        THEN ISNULL(Total_Horas_Asignadas_Proy,0)
        ELSE 0
    END),1) AS HorasProgramadas_Mes,

    -- ==========================
    -- HORAS CUMPLIDAS
    -- ==========================
    ROUND(SUM(CASE
        WHEN Año >= 2026
         AND (
                Año < :anio
             OR (Año = :anio AND mes < :mes)
             )
        THEN ISNULL(HorasRealesReportadas,0)
        ELSE 0
    END),1) AS HorasCumplidas_Acumulado,

    ROUND(SUM(CASE
        WHEN Año = :anio
         AND mes = :mes
        THEN ISNULL(HorasRealesReportadas,0)
        ELSE 0
    END),1) AS HorasCumplidas_Mes,

    -- ==========================
    -- HORAS PENDIENTES
    -- ==========================
    ROUND(SUM(CASE
        WHEN 
            (Año = :anio AND mes = :mes - 1)
            OR (:mes = 1 AND Año = :anio - 1 AND mes = 12)
        THEN ISNULL([Diferencia en Horas PptoReal],0)
        ELSE 0
    END),1) AS HorasPendientes_Acumulado,

    ROUND(SUM(CASE
        WHEN Año = :anio
         AND mes = :mes
        THEN ISNULL([Diferencia en Horas PptoReal],0)
        ELSE 0
    END),1) AS HorasPendientes_Mes,

    -- ==========================
    -- 🔥 ATRASO (CORREGIDO)
    -- ==========================
    ISNULL(CAST(AVG(CASE
        WHEN Año = :anio
         AND mes = :mes
        THEN TRY_CAST([% Atraso] AS DECIMAL(18,6))
        ELSE NULL
    END) AS DECIMAL(18,6)),0) AS Atraso_Mes,

    ISNULL(CAST(AVG(CASE
        WHEN 
            (Año = :anio AND mes = :mes - 1)
            OR (:mes = 1 AND Año = :anio - 1 AND mes = 12)
        THEN TRY_CAST([% Atraso] AS DECIMAL(18,6))
        ELSE NULL
    END) AS DECIMAL(18,6)),0) AS Atraso_Acumulado,

    -- ==========================
    CAST(0 AS DECIMAL(18,1)) AS HorasFrecuencia_Acumulado,
    CAST(0 AS DECIMAL(18,1)) AS HorasFrecuencia_Mes

FROM dbo.VW_ReporteIndicadorProyectos_Actividades
WHERE Documento = :docId
`,
    {
      replacements: { docId, anio, mes },
      type: sequelize.QueryTypes.SELECT
    }
    );

    let resultado = indicadores[0] || {};

    // ==========================
    // REGLA ESPECIAL
    // ==========================
    if (anio === 2026 && mes === 1) {
      resultado.DiasProgramados_Acumulado = 0;
    }

    console.log("indicadores:", resultado);

    return {
      ok: true,
      indicadores: resultado
    };

  } catch (error) {
    console.error("Error consulta indicadores:", error);

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

    -- ==========================
    -- DIAS PROGRAMADOS
    -- ==========================
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

    -- ==========================
    -- HORAS DISPONIBLES
    -- ==========================
    ROUND(SUM(CASE
        WHEN Año >= 2026
         AND (
            Año < :anio
            OR (Año = :anio AND mes < :mes)
         )
        THEN ISNULL(HorasDisponibles,0)
        ELSE 0
    END),1) AS HorasDisponibles_Acumulado,

    ROUND(SUM(CASE
        WHEN Año = :anio
         AND mes = :mes
        THEN ISNULL(HorasDisponibles,0)
        ELSE 0
    END),1) AS HorasDisponibles_Mes,

    -- ==========================
    -- HORAS PROGRAMADAS
    -- ==========================
    ROUND(SUM(CASE
        WHEN Año >= 2026
         AND (
            Año < :anio
            OR (Año = :anio AND mes < :mes)
         )
        THEN ISNULL(Total_Horas_Asignadas_Proy,0)
        ELSE 0
    END),1) AS HorasProgramadas_Acumulado,

    ROUND(SUM(CASE
        WHEN Año = :anio
         AND mes = :mes
        THEN ISNULL(Total_Horas_Asignadas_Proy,0)
        ELSE 0
    END),1) AS HorasProgramadas_Mes,

    -- ==========================
    -- HORAS CUMPLIDAS
    -- ==========================
    ROUND(SUM(CASE
        WHEN Año >= 2026
         AND (
            Año < :anio
            OR (Año = :anio AND mes < :mes)
         )
        THEN ISNULL(HorasRealesReportadas,0)
        ELSE 0
    END),1) AS HorasCumplidas_Acumulado,

    ROUND(SUM(CASE
        WHEN Año = :anio
         AND mes = :mes
        THEN ISNULL(HorasRealesReportadas,0)
        ELSE 0
    END),1) AS HorasCumplidas_Mes,

    -- ==========================
    -- HORAS PENDIENTES
    -- ==========================
    ROUND(SUM(CASE
        WHEN Año >= 2026
         AND (
            (Año = :anio AND mes = :mes - 1)
            OR (:mes = 1 AND Año = :anio - 1 AND mes = 12)
         )
        THEN ISNULL([Diferencia en Horas PptoReal],0)
        ELSE 0
    END),1) AS HorasPendientes_Acumulado,

    ROUND(SUM(CASE
        WHEN Año = :anio
         AND mes = :mes
        THEN ISNULL([Diferencia en Horas PptoReal],0)
        ELSE 0
    END),1) AS HorasPendientes_Mes,

    -- ==========================
    -- ATRASO (VIENE COMO TEXTO → SE CONVIERTE)
    -- ==========================
    AVG(CASE
        WHEN Año = :anio
         AND mes = :mes
        THEN TRY_CAST(REPLACE([% Atraso], '%', '') AS DECIMAL(18,6)) / 100
        ELSE NULL
    END) AS Atraso_Mes,

    -- ==========================
    -- COMPLETADO (VIENE COMO TEXTO → SE CONVIERTE)
    -- ==========================
    AVG(CASE
        WHEN Año = :anio
         AND mes = :mes
        THEN TRY_CAST(REPLACE([Nivel de Desempeño], '%', '') AS DECIMAL(18,6)) / 100
        ELSE NULL
    END) AS Completado_Mes,

    -- ==========================
    CAST(0 AS DECIMAL(18,1)) AS HorasFrecuencia_Acumulado,
    CAST(0 AS DECIMAL(18,1)) AS HorasFrecuencia_Mes

FROM dbo.VW_ReporteIndicadorProyectos_Actividades
WHERE Documento = :docId
AND Año >= 2026
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
    // ==========================
    if (anio === 2026 && mes === 1) {
      resultado.DiasProgramados_Acumulado = 0;
      console.log("Aplicando regla especial para Enero 2026");
    }

    console.log("indicadores", resultado);

    return {
      ok: true,
      indicadores: resultado
    };

  } catch (error) {
    console.error("Error consulta indicadores:", error);

    return {
      ok: false,
      message: error.message
    };
  }
};

module.exports = {
  consultaIndicadoresController
};



module.exports = consultaIndicadoresController