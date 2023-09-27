const {Router} = require("express");
const indicadoresRouter = Router()
const {ConsultaIndicadoresMiddleware,ConsultaIndicadores2Middleware} = require("../middlewares/index")

indicadoresRouter.get("/fechas",ConsultaIndicadoresMiddleware)
indicadoresRouter.get("/horas",ConsultaIndicadores2Middleware)




module.exports = indicadoresRouter