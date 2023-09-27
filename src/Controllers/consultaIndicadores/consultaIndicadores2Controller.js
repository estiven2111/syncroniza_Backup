const {sequelize} = require("../../db")
const consultaIndicadores2Controller = async(req) =>{
    const {docId, id} = req.query
    console.log(docId, id)
try {
    let CumplidadPeriodo1 = await sequelize.query(
        `
        select sum(RequeridoProyectoHH) HorasProgramadaSinFrecuencia, Sum(HorasRealProyecto) HorasCumplidasSinFrecuencia
from TBL_SER_PROYECTOS A
inner join TBL_SER_ProyectoActividadesEmpleados b on a.idNodo=b.idNodoProyecto
inner join TBL_ESP_Procesos C on A.Cod_parte=C.ID
where (N_DocumentoEmpleado= :docId and C.AplicaFrecuencia=0)
and ((FechaInicio <= (select fin from TBL_CON_PERIODOCONTABLE where id= :id) AND FechaInicio >= (select Inicio from TBL_CON_PERIODOCONTABLE where id= :id))
  or (FechaFinal <= (select fin from TBL_CON_PERIODOCONTABLE where id= :id) AND FechaFinal >= (select Inicio from TBL_CON_PERIODOCONTABLE where id= :id)))
        `,
        {replacements:{ docId: docId, id:id}}
    )
    if (CumplidadPeriodo1[0].length > 0) {
        CumplidadPeriodo1 = CumplidadPeriodo1[0]
    }else{
        CumplidadPeriodo1 = ""
    }
    const datos = {
        HoraProgramada: CumplidadPeriodo1,
        cumplidadperiodo : CumplidadPeriodo1,
        Horafrecuencia:""
    }
    return datos
} catch (error) {
    console.log("el error es este,",error.message)
}
}
module.exports = consultaIndicadores2Controller