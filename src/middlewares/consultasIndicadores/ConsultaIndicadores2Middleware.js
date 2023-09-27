const {consultaIndicadores2Controller} = require("../../Controllers/index")
const ConsultaIndicadores2Middleware = async (req,res) => {
try {
    const respuesta = await consultaIndicadores2Controller(req)
    console.log("respuesta: ", respuesta)
    res.status(200).json(respuesta)
} catch (error) {
    res.status(500).json(error)
}
}
module.exports = ConsultaIndicadores2Middleware