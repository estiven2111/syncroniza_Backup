const {consultaIndicadoresController} =  require("../../Controllers/index")
const ConsultaIndicadoresMiddleware = async (req,res) =>{
try {
    const respuesta = await consultaIndicadoresController(req)
    res.status(200).json(respuesta)
} catch (error) {
    res.status(500).json(error)
}
}
module.exports = ConsultaIndicadoresMiddleware