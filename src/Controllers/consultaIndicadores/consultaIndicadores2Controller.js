const {sequelize} = require("../../db")
const consultaIndicadores2Controller = async(req) =>{
    const {docId, id} = req.query
    console.log(docId, id)
    let HorasProgramadaSinFrecuencia
    let HorasCumplidasSinFrecuencia 

    let HorasProgramadaConFrecuencia
    let HorasCumplidasConFrecuencia

    let HoraProgramada
    let CumplidasPeriodo
    let HorasFrecuencia
    let atrazo
    let HorasCumplidas
    
try {
    //? consulta uno para sacar Horas programadas y el valor de cumplidas en el periodo
    let Consulta1 = await sequelize.query(
        `
        select sum(RequeridoProyectoHH) HorasProgramadaSinFrecuencia, Sum(HorasRealProyecto) HorasCumplidasSinFrecuencia
from TBL_SER_PROYECTOS A
inner join TBL_SER_ProyectoActividadesEmpleados b on a.idNodo=b.idNodoProyecto
inner join TBL_ESP_Procesos C on A.Cod_parte=C.ID
where (N_DocumentoEmpleado= ${docId} and C.AplicaFrecuencia=0)

        `,
        // {replacements:{ docId: docId, id:id}}
    )
    // and ((FechaInicio <= (select fin from TBL_CON_PERIODOCONTABLE where id= ${id}) AND FechaInicio >= (select Inicio from TBL_CON_PERIODOCONTABLE where id= ${id}))
    // or (FechaFinal <= (select fin from TBL_CON_PERIODOCONTABLE where id= ${id}) AND FechaFinal >= (select Inicio from TBL_CON_PERIODOCONTABLE where id= ${id})))
       //? consulta dos para sacar Horas programadas y el valor de cumplidas en el periodo
       let Consulta2 = await sequelize.query(
        `
        select sum(RequeridoProyectoHH) HorasProgramadaConFrecuencia, sum(RequeridoProyectoHH) HorasCumplidasConFrecuencia  --son las mismas pues nor equiere reporte
        from TBL_SER_PROYECTOS A
        inner join TBL_SER_ProyectoActividadesEmpleados b on a.idNodo=b.idNodoProyecto
        inner join TBL_ESP_Procesos C on A.Cod_parte=C.ID
        where (N_DocumentoEmpleado= ${docId} and C.AplicaFrecuencia=1)
       
        `,
        // {replacements:{ docId: docId, id:id}}
    )

    // and ((FechaInicio <= (select fin from TBL_CON_PERIODOCONTABLE where id=${id}) AND FechaInicio >= (select Inicio from TBL_CON_PERIODOCONTABLE where id=${id}))
    // or (FechaFinal <= (select fin from TBL_CON_PERIODOCONTABLE where id=${id}) AND FechaFinal >= (select Inicio from TBL_CON_PERIODOCONTABLE where id=${id})))
//todo ************************************************
    //? validaciones consulta 1
    if (Consulta1[0].length > 0 ) {
        //! HorasProgramadaSinFrecuencia
       if (Consulta1[0][0].HorasProgramadaSinFrecuencia) {
        HorasProgramadaSinFrecuencia = Consulta1[0][0].HorasProgramadaSinFrecuencia
       }else{
        HorasProgramadaSinFrecuencia = 0
       }
       //! HorasCumplidasSinFrecuencia
       if (Consulta1[0][0].HorasCumplidasSinFrecuencia) {

        HorasCumplidasSinFrecuencia = Consulta1[0][0].HorasCumplidasSinFrecuencia
       }else{
        HorasCumplidasSinFrecuencia = 0
       }
    }else{
        HorasProgramadaSinFrecuencia = 0
        HorasCumplidasSinFrecuencia = 0
    }
    //todo ************************************************

    //todo ************************************************
    //? validaciones consulta 2

    if (Consulta2[0].length > 0 ) {
        //! HorasCumplidasConFrecuencia
       if (Consulta1[0][0].HorasProgramadaConFrecuencia) {
        HorasProgramadaConFrecuencia = Consulta1[0][0].HorasProgramadaConFrecuencia
       }else{
        HorasProgramadaConFrecuencia = 0
       }
       //! HorasCumplidasConFrecuencia
       if (Consulta1[0][0].HorasCumplidasConFrecuencia) {

        HorasCumplidasConFrecuencia = Consulta1[0][0].HorasCumplidasConFrecuencia
       }else{
        HorasCumplidasConFrecuencia = 0
       }
    }else{
        HorasProgramadaConFrecuencia = 0
        HorasCumplidasConFrecuencia = 0
    }
//todo ************************************************
CumplidasPeriodo = HorasCumplidasSinFrecuencia + HorasCumplidasConFrecuencia
HorasFrecuencia = HorasProgramadaConFrecuencia
HoraProgramada = HorasProgramadaSinFrecuencia
atrazo = (HorasProgramadaSinFrecuencia + HorasProgramadaConFrecuencia - CumplidasPeriodo)
HorasCumplidas = CumplidasPeriodo + atrazo
console.log("HorasCumplidasSinFrecuencia +  HorasCumplidasConFrecuencia = CumplidasPeriodo",CumplidasPeriodo )
console.log("HorasProgramadaConFrecuencia", HorasFrecuencia)
console.log("HorasProgramadaSinFrecuencia",HoraProgramada)
const numero = ((HorasCumplidas + HorasFrecuencia) / HoraProgramada)* 100
// const numero = ((186 + 70) / 312)* 100
let nivActividad = parseFloat(numero.toFixed(1))
if (nivActividad) {
    nivActividad = nivActividad
}else{
    nivActividad = 0
}

    const datos = {
        HoraProgramada,
        HorasCumplidas,
        CumplidasPeriodo,
        atrazo,
        HorasFrecuencia,
        nivActividad
      }
    return datos
} catch (error) {
    console.log("el error es este,",error.message)
}
}
module.exports = consultaIndicadores2Controller