const { sequelize } = require("../../db");
const consultaIndicadoresController = async(req) =>{
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



module.exports = consultaIndicadoresController