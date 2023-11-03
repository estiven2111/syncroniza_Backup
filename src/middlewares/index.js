const login = require("./login");
// const registerUser = require("./registerUser");
const ConsultaIndicadoresMiddleware = require("./consultasIndicadores/ConsultaIndicadoresMiddleware")
const ConsultaIndicadores2Middleware = require("./consultasIndicadores/ConsultaIndicadores2Middleware")
const {
  getProyectName,
  getProyect,
  registerActivities,
  hourActivities,
  UpdatProyect,
  AnticipoGastos,
  logout,
  Entregables,
  NameProyects
} = require("./proyect");
const Ocr = require("./Ocr")

module.exports = {
  login,
  getProyectName,
  getProyect,
  registerActivities,
  hourActivities,
  UpdatProyect,
  AnticipoGastos,
  logout,
  Ocr,
  Entregables,
  NameProyects,
  //?Middlewares
  ConsultaIndicadoresMiddleware,
  ConsultaIndicadores2Middleware
};
