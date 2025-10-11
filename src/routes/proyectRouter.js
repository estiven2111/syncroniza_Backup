const { Router } = require("express");
const ProyectRouter = Router();
const {
  updateLoadProyect,
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
  tipoTransaccion,
  ProyectosGastos,
  ValidarTotalProyectos
} = require("../middlewares/index");


const { ComputerVisionClient, AzureKeyCredential } = require("@azure/cognitiveservices-computervision");
const { updateProyecto } = require("../middlewares/proyect");
ProyectRouter.get("/search", getProyectName);
ProyectRouter.get("/", getProyect);
ProyectRouter.get("/logout", logout);
ProyectRouter.post("/hours", registerActivities);//? registra las horas del proyecto
ProyectRouter.get("/hours", hourActivities);//? actualiza las horas en el useEfect
ProyectRouter.put("/update",updateProyecto)
ProyectRouter.post("/ocr",Ocr)
ProyectRouter.put("/updateProyect",UpdatProyect)
ProyectRouter.post("/anticipo",AnticipoGastos)
ProyectRouter.get("/tipoTransaccion",tipoTransaccion)
ProyectRouter.get("/entregables",Entregables)
ProyectRouter.get("/nomProyect",NameProyects)
ProyectRouter.get("/ProyectGastos",ProyectosGastos)
ProyectRouter.get("/valtotalproyect",ValidarTotalProyectos)

//,fileupload({ useTempFiles: true, tempFileDir: "./uploads" })
module.exports = ProyectRouter;
