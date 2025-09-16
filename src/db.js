// const { Sequelize } = require("sequelize");
// const { LocalStorage } = require("node-localstorage");
// const localStorage = new LocalStorage("./local-storage");
// require("dotenv").config();
// const {
//   DB_NAME,
//   DB_PASSWORD,
//   BD_USERNAME,
//   DB_HOST,
// } = process.env;
// const spawn = require("cross-spawn");
// let sequelize;

// const handb = async (req, res) => {
//   if (localStorage.getItem(`INFODB`)) {
//     res.send(true);
//   } else {
//     if (req.query) {
//       console.log("entro db");

//       const { name, password, dbname, user, pass, host } = req.query;
//       localStorage.setItem(
//         `INFODB`,
//         JSON.stringify({ name, password, dbname, user, pass, host })
//       );

//       reincioNode();
//       res.send("se crearon las variables de configuracion");
//     }
//   }
// };

// //todo ******************
// sequelize = new Sequelize({
//   dialect: "mssql",
//   host: DB_HOST, //creame-sim\\SQLEXPRESS   creame-sim-sql.database.windows.net
//   port: 1433,
//   database: DB_NAME, //BDCREAME    creame-sim-db
//   username: BD_USERNAME, // Reemplaza con tu nombre de usuario
//   password: DB_PASSWORD, // Reemplaza con tu contraseña
//   dialectOptions: {
//     options: {
//       encrypt: false,
//       trustServerCertificate: false,
//       authentication: "ActiveDirectoryDefault",
//     },
//   },
//   define: {
//     timestamps: false, // Si no estás usando campos de timestamp en tus modelos
//   },
//   logging: console.log, // Muestra logs en la consola (opcional, para debug)
// });

// // Validar la conexión
// sequelize
//   .authenticate()
//   .then(() => {
//     console.log("Conexión exitosa a la base de datos");
//   })
//   .catch((error) => {
//     console.error("Error al conectar con la base de datos:", error);
//   });

// const reincioNode = () => {
//   const comando = //prueba
//     process.platform === "win32" ? "taskkill /F /IM node" : "pkill -f nodemon";

//   const proceso = spawn(comando, [], { shell: true });

//   proceso.on("close", (codigo) => {
//     console.log("nodemon reiniciado");
//   });
// };

// module.exports = {
//   sequelize,
//   handb,
// };


const { Sequelize } = require("sequelize");
const { LocalStorage } = require("node-localstorage");
const localStorage = new LocalStorage("./local-storage");
require("dotenv").config();
const { 
  DB_NAME,
  DB_PASSWORD,
  BD_USERNAME,
  DB_HOST,
  DB_NAME1,
  DB_PASSWORD1,
  BD_USERNAME1,
  DB_HOST1,
  DB_NAME2,
  DB_PASSWORD2,
  BD_USERNAME2,
  DB_HOST2
} = process.env;

const spawn = require("cross-spawn");
let sequelize;
let info;

// =============================
// Handler para inicializar DB
// =============================
const handb = async (req, res) => {
  if (localStorage.getItem("INFODB")) {
    res.send(true);
  } else {
    if (req.query) {
      console.log("entro db");

      const { name, password, dbname, user, pass, host } = req.query;
      localStorage.setItem(
        "INFODB",
        JSON.stringify({ name, password, dbname, user, pass, host })
      );

      reincioNode();
      res.send("se crearon las variables de configuracion");
    }
  }
};

// =============================
// Conexión Sequelize con Pool
// =============================
sequelize = new Sequelize({
  dialect: "mssql",
  host: DB_HOST,       // creame-sim-sql.database.windows.net
  port: 1433,
  database: DB_NAME,   // BDCREAME
  username: BD_USERNAME,
  password: DB_PASSWORD,
  dialectOptions: {
    options: {
      encrypt: false,
      trustServerCertificate: false,
      authentication: "ActiveDirectoryDefault",
    },
  },
  define: {
    timestamps: false, // Si no estás usando campos de timestamp en tus modelos
  },
  pool: {
    max: 10,        // máximo de conexiones abiertas
    min: 0,         // mínimo de conexiones
    acquire: 30000, // tiempo máximo (ms) intentando conectar
    idle: 10000,    // tiempo antes de cerrar una conexión inactiva
  },
  logging: console.log, // Logs en consola
});

// Validar la conexión
sequelize
  .authenticate()
  .then(() => {
    console.log("✅ Conexión exitosa a la base de datos");
  })
  .catch((error) => {
    console.error("❌ Error al conectar con la base de datos:", error);
  });

// =============================
// todo Reinicio de Node/Nodemon
// =============================
const reincioNode = () => {
  const comando =
    process.platform === "win32" ? "taskkill /F /IM node" : "pkill -f nodemon";

  const proceso = spawn(comando, [], { shell: true });

  proceso.on("close", (codigo) => {
    console.log("🔄 nodemon reiniciado");
  });
};

module.exports = {
  sequelize,
  handb,
};
