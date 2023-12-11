const { Router } = require("express");
const userRouter = require("./userRouter");
const ProyectRouter = require("./proyectRouter");
const indicadoresRouter = require("./indicadoresRouter");
const { handb } = require("../db");
const router = Router();

router.use("/user", userRouter);
router.use("/user/api/proyect", ProyectRouter);
router.use("/user/api/indicadores",indicadoresRouter)



//! PETICIONES PARA CONFIGURACION

// router.post("/DB", handb);
// router.get("/valitation/DB", (req,res)=>{
//     const {name,password} = req.body
//     if (localStorage.getItem(`INFODB${name}`)) {
//       const file =   localStorage.getItem(`INFODB${name}`)
//         if (file.name === name) {
//             if (file.password === password) {
//                 res.send(true)
//             }else{
//                 res.send("password incorrecto")
//             }
//         }else{
//             res.send("nombre empresa incorrecto")
//         }
       
       
//     }else{
//         res.send(false)
//     }
// });

module.exports = router;
