const {sequelize} = require("../../db")
const consultaIndicadores2Controller = async(req) =>{
    const {docId, id} = req.query
    console.log(docId, id)
    let HorasProgramadaSinFrecuencia
    let HorasCumplidasSinFrecuencia 
    let hdisp
    let HorasProgramadaConFrecuencia
    let HorasCumplidasConFrecuencia

    let HoraProgramada
    let CumplidasPeriodo
    let HorasFrecuencia
    let atrazo
    let HorasCumplidas
    
try {
    //? consulta uno para sacar Horas programadas y el valor de cumplidas en el periodo

    let consulta1 = await sequelize.query(`
    select B.Horas HorasDias,B.Horas*30 HorasMes, AVG(PorcEF) Eficiencia,(B.Horas*30)*(AVG(PorcEF)/100) hdisp
from TBL_NOM_Empleado A
inner join TBL_ESP_Turnos B on A.turno=b.Id
inner join TBL_ESP_PersonalMO C on A.cedula=C.DocumentoId
inner join TBL_ESP_OperacionMO D on C.ID=D.id_MO
where cedula= '${docId}'
group by B.Horas
    `)
    console.log(Consulta1[0],"consultaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa")
    console.log(Consulta1[0][0],"consultaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa22222222222222222222")
    let Consulta2 = await sequelize.query(
        `
        select sum(RequeridoProyectoHH) HorasProgramadaSinFrecuencia, Sum(HorasRealProyecto) HorasCumplidasSinFrecuencia
from TBL_SER_PROYECTOS A
inner join TBL_SER_ProyectoActividadesEmpleados b on a.idNodo=b.idNodoProyecto
inner join TBL_ESP_Procesos C on A.Cod_parte=C.ID
where (N_DocumentoEmpleado= '${docId}' and C.AplicaFrecuencia=0)

        `,
        // {replacements:{ docId: docId, id:id}}
    )
    // and ((FechaInicio <= (select fin from TBL_CON_PERIODOCONTABLE where id= ${id}) AND FechaInicio >= (select Inicio from TBL_CON_PERIODOCONTABLE where id= ${id}))
    // or (FechaFinal <= (select fin from TBL_CON_PERIODOCONTABLE where id= ${id}) AND FechaFinal >= (select Inicio from TBL_CON_PERIODOCONTABLE where id= ${id})))
       //? consulta dos para sacar Horas programadas y el valor de cumplidas en el periodo
       let Consulta3 = await sequelize.query(
        `
        select sum(RequeridoProyectoHH) HorasProgramadaConFrecuencia, sum(RequeridoProyectoHH) HorasCumplidasConFrecuencia
        from TBL_SER_PROYECTOS A
        inner join TBL_SER_ProyectoActividadesEmpleados b on a.idNodo=b.idNodoProyecto
        inner join TBL_ESP_Procesos C on A.Cod_parte=C.ID
        where (N_DocumentoEmpleado= '${docId}' and C.AplicaFrecuencia=1)
       
        `,
        // {replacements:{ docId: docId, id:id}}
    )

    // and ((FechaInicio <= (select fin from TBL_CON_PERIODOCONTABLE where id=${id}) AND FechaInicio >= (select Inicio from TBL_CON_PERIODOCONTABLE where id=${id}))
    // or (FechaFinal <= (select fin from TBL_CON_PERIODOCONTABLE where id=${id}) AND FechaFinal >= (select Inicio from TBL_CON_PERIODOCONTABLE where id=${id})))
//todo ************************************************


if (Consulta1[0].length > 0) {
    if (Consulta1[0][0].HorasDisponibles) {
        hdisp = Consulta1[0][0].hdisp
       }else{
        hdisp = 0
       }
}


    //? validaciones consulta 1
    if (Consulta2[0].length > 0 ) {
        //! HorasProgramadaSinFrecuencia
       if (Consulta2[0][0].HorasProgramadaSinFrecuencia) {
        HorasProgramadaSinFrecuencia = Consulta2[0][0].HorasProgramadaSinFrecuencia
       }else{
        HorasProgramadaSinFrecuencia = 0
       }
       //! HorasCumplidasSinFrecuencia
       if (Consulta2[0][0].HorasCumplidasSinFrecuencia) {

        HorasCumplidasSinFrecuencia = Consulta2[0][0].HorasCumplidasSinFrecuencia
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

    if (Consulta3[0].length > 0 ) {
        //! HorasCumplidasConFrecuencia
       if (Consulta2[0][0].HorasProgramadaConFrecuencia) {
        HorasProgramadaConFrecuencia = Consulta2[0][0].HorasProgramadaConFrecuencia
       }else{
        HorasProgramadaConFrecuencia = 0
       }
       //! HorasCumplidasConFrecuencia
       if (Consulta2[0][0].HorasCumplidasConFrecuencia) {

        HorasCumplidasConFrecuencia = Consulta2[0][0].HorasCumplidasConFrecuencia
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
        hdisp,
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