// const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { sequelize } = require("../db");
const { LocalStorage } = require("node-localstorage");
const { LoadProyect } = require("./proyect");
const localStorage = new LocalStorage("./local-storage");

const login = async (req, res) => {
  const { user, password } = req.body;
  console.log("entro login")
  if (user === "" || password === "") {
    res.status(401).json({ message: "Completar los campos" });
    return;
  }
  // if (localStorage.getItem(`INFODB`)) {
   
    try {
      
      const existUser = await sequelize.query(
        `select * from Tbl_USUARIOS where Email = '${user}'`
      );
      let usuario;
      if (existUser[0].length > 0) {
        usuario = existUser[0][0];

        if (password !== usuario.clave) {
          console.log("aca")
          res.status(401).json({ message: "Clave incorrecta" });
          return;
        }
      } else {
        return res
          .status(401)
          .json({ message: "Usuario no existe en la base de datos" });
      }

      //? Verificar si el usuario existe

      // Autenticación exitosa
      // Generar y devolver un token JWT aquí
      const secretKey = "my_secret";
      const token = jwt.sign({ userEmail: usuario.Email }, secretKey, {
        expiresIn: "8h",
      });
      console.log(usuario.Doc_id)
      await LoadProyect(usuario.Doc_id,usuario.Email);
      res.json({ token, userEmail: usuario.Email, userName: usuario.Nombre, doc_empleado:usuario.Doc_id });
    } catch (error) {
      console.error("Error al autenticar al usuario:", error);
      res.status(500).json({ message: "Error de servidor" });
    }
  // } else {
  //   res.send("no se conecto ala db");
  // }
};

module.exports = login;
