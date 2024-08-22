const {sequelize} = require("../../db")
const consultaIndicadores2Controller = async(req) =>{
    const {docId, id} = req.query
    console.log(docId, id)
    let HorasProgramadaSinFrecuencia
    let HorasCumplidasSinFrecuencia 
    let hdisp
    let HorasProgramadaConFrecuencia
    let HorasCumplidasConFrecuencia

    let horaPSinFre
    let CumplidasPeriodo
    let horaPConFre
    let atrazo
    let HorasCumplidas
    
try {
    //? consulta uno para sacar Horas programadas y el valor de cumplidas en el periodo

    let consulta1 = await sequelize.query(`
    select B.Horas HorasDias,B.Horas*30 HorasMes, AVG(PorcEF) Eficiencia,(B.Horas*30)*(AVG(PorcEF)/100) HorasDisponibles
from TBL_NOM_Empleado A
inner join TBL_ESP_Turnos B on A.turno=b.Id
inner join TBL_ESP_PersonalMO C on A.cedula=C.DocumentoId
inner join TBL_ESP_OperacionMO D on C.ID=D.id_MO
where cedula= '${docId}'
group by B.Horas
    `)
    // console.log(consulta1[0][0].length,"ddddddddddddddd")
    
    let Consulta2 = await sequelize.query(
        `
        select sum(RequeridoProyectoHH) HorasProgramadaSinFrecuencia, Sum(HorasRealProyecto) HorasCumplidasSinFrecuencia
from TBL_SER_PROYECTOS A
inner join TBL_SER_ProyectoActividadesEmpleados b on a.idNodo=b.idNodoProyecto
inner join TBL_ESP_Procesos C on A.Cod_parte=C.ID
where (N_DocumentoEmpleado= '${docId}' and C.AplicaFrecuencia=0)
 and ((FechaInicio <= (select fin from TBL_CON_PERIODOCONTABLE where id= ${id}) AND FechaInicio >= (select Inicio from TBL_CON_PERIODOCONTABLE where id= ${id}))
     or (FechaFinal <= (select fin from TBL_CON_PERIODOCONTABLE where id= ${id}) AND FechaFinal >= (select Inicio from TBL_CON_PERIODOCONTABLE where id= ${id})))
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
        and ((FechaInicio <= (select fin from TBL_CON_PERIODOCONTABLE where id=${id}) AND FechaInicio >= (select Inicio from TBL_CON_PERIODOCONTABLE where id=${id}))
        or (FechaFinal <= (select fin from TBL_CON_PERIODOCONTABLE where id=${id}) AND FechaFinal >= (select Inicio from TBL_CON_PERIODOCONTABLE where id=${id})))
        `,
        // {replacements:{ docId: docId, id:id}}
    )

    // and ((FechaInicio <= (select fin from TBL_CON_PERIODOCONTABLE where id=${id}) AND FechaInicio >= (select Inicio from TBL_CON_PERIODOCONTABLE where id=${id}))
    // or (FechaFinal <= (select fin from TBL_CON_PERIODOCONTABLE where id=${id}) AND FechaFinal >= (select Inicio from TBL_CON_PERIODOCONTABLE where id=${id})))
//todo ************************************************


//  if (Consulta1[0][0].HorasDisponibles > 0) {
//         hdisp = Consulta1[0][0].HorasDisponibles
//        }else{
//         hdisp = 0
//        }
       hdisp = consulta1[0][0].HorasDisponibles

       if (Consulta2[0].length > 0) {
        if (Consulta2[0][0].HorasProgramadaSinFrecuencia) {
            HorasProgramadaSinFrecuencia = Consulta2[0][0].HorasProgramadaSinFrecuencia
        }else{
            HorasProgramadaSinFrecuencia = 0
        }
        if (Consulta2[0][0].HorasCumplidasSinFrecuencia) {

                HorasCumplidasSinFrecuencia = Consulta2[0][0].HorasCumplidasSinFrecuencia
               }else{
                HorasCumplidasSinFrecuencia = 0
               }
       }else{
            HorasProgramadaSinFrecuencia = 0
            HorasCumplidasSinFrecuencia = 0
        }



       if (Consulta3[0].length > 0 ) {
    //! HorasCumplidasConFrecuencia
   if (Consulta3[0][0].HorasProgramadaConFrecuencia) {
    HorasProgramadaConFrecuencia = Consulta2[0][0].HorasProgramadaConFrecuencia
   }else{
    HorasProgramadaConFrecuencia = 0
   }
   //! HorasCumplidasConFrecuencia
   if (Consulta3[0][0].HorasCumplidasConFrecuencia) {

    HorasCumplidasConFrecuencia = Consulta2[0][0].HorasCumplidasConFrecuencia
   }else{
    HorasCumplidasConFrecuencia = 0
   }
}else{
    HorasProgramadaConFrecuencia = 0
    HorasCumplidasConFrecuencia = 0
}


CumplidasPeriodo = HorasCumplidasSinFrecuencia + HorasCumplidasConFrecuencia


horaPConFre = HorasProgramadaConFrecuencia
horaPSinFre = HorasProgramadaSinFrecuencia
atrazo = (HorasProgramadaSinFrecuencia + HorasProgramadaConFrecuencia - CumplidasPeriodo)
HorasCumplidas = CumplidasPeriodo + atrazo
console.log("HorasCumplidasSinFrecuencia +  HorasCumplidasConFrecuencia = CumplidasPeriodo",CumplidasPeriodo )
console.log("HorasProgramadaConFrecuencia", horaPConFre)
console.log("HorasProgramadaSinFrecuencia",horaPSinFre)
const Atiempo =  (  CumplidasPeriodo / HorasProgramadaSinFrecuencia)
const ConRetrazo = HorasProgramadaSinFrecuencia / atrazo
const PorFrecuencia = HorasProgramadaConFrecuencia
const numero = ((HorasCumplidas + horaPConFre) / horaPSinFre)* 100
// const numero = ((186 + 70) / 312)* 100
let nivActividad = parseFloat(numero.toFixed(1))
if (nivActividad) {
nivActividad = nivActividad
}else{
nivActividad = 0
}
    const datos = {
        hdisp,
        horaPSinFre,
        HorasCumplidas,
        CumplidasPeriodo,
        atrazo,
        horaPConFre,
        nivActividad,
        Atiempo,
        ConRetrazo,
        PorFrecuencia
      }
    return datos
} catch (error) {
    console.log("el error es este,",error.message)
}
}
module.exports = consultaIndicadores2Controller



// if (Consulta2[0].length > 0 ) {
//     //! HorasProgramadaSinFrecuencia
//    if (Consulta2[0][0].HorasProgramadaSinFrecuencia) {
//     HorasProgramadaSinFrecuencia = Consulta2[0][0].HorasProgramadaSinFrecuencia
//    }else{
//     HorasProgramadaSinFrecuencia = 0
//    }
//    //! HorasCumplidasSinFrecuencia
//    if (Consulta2[0][0].HorasCumplidasSinFrecuencia) {

//     HorasCumplidasSinFrecuencia = Consulta2[0][0].HorasCumplidasSinFrecuencia
//    }else{
//     HorasCumplidasSinFrecuencia = 0
//    }
// }else{
//     HorasProgramadaSinFrecuencia = 0
//     HorasCumplidasSinFrecuencia = 0
// }
// //todo ************************************************

// //todo ************************************************
// //? validaciones consulta 2

// if (Consulta3[0].length > 0 ) {
//     //! HorasCumplidasConFrecuencia
//    if (Consulta2[0][0].HorasProgramadaConFrecuencia) {
//     HorasProgramadaConFrecuencia = Consulta2[0][0].HorasProgramadaConFrecuencia
//    }else{
//     HorasProgramadaConFrecuencia = 0
//    }
//    //! HorasCumplidasConFrecuencia
//    if (Consulta2[0][0].HorasCumplidasConFrecuencia) {

//     HorasCumplidasConFrecuencia = Consulta2[0][0].HorasCumplidasConFrecuencia
//    }else{
//     HorasCumplidasConFrecuencia = 0
//    }
// }else{
//     HorasProgramadaConFrecuencia = 0
//     HorasCumplidasConFrecuencia = 0
// }
// //todo ************************************************
// CumplidasPeriodo = HorasCumplidasSinFrecuencia + HorasCumplidasConFrecuencia
// horaPConFre = HorasProgramadaConFrecuencia
// horaPSinFre = HorasProgramadaSinFrecuencia
// atrazo = (HorasProgramadaSinFrecuencia + HorasProgramadaConFrecuencia - CumplidasPeriodo)
// HorasCumplidas = CumplidasPeriodo + atrazo
// console.log("HorasCumplidasSinFrecuencia +  HorasCumplidasConFrecuencia = CumplidasPeriodo",CumplidasPeriodo )
// console.log("HorasProgramadaConFrecuencia", horaPConFre)
// console.log("HorasProgramadaSinFrecuencia",horaPSinFre)
// const Atiempo =  (HorasProgramadaSinFrecuencia / CumplidasPeriodo)
// const ConRetrazo = HorasProgramadaSinFrecuencia / atrazo
// const PorFrecuencia = HorasProgramadaConFrecuencia
// const numero = ((HorasCumplidas + horaPConFre) / horaPSinFre)* 100
// // const numero = ((186 + 70) / 312)* 100
// let nivActividad = parseFloat(numero.toFixed(1))
// if (nivActividad) {
// nivActividad = nivActividad
// }else{
// nivActividad = 0
// }