const { Router } = require("express");
const userRouter = require("./userRouter");
const ProyectRouter = require("./proyectRouter");
const { handb } = require("../db");
const router = Router();

router.use("/user", userRouter);
router.use("/user/api/proyect", ProyectRouter);
router.post("/DB", handb);

module.exports = router;
