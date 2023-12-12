const { Sequelize } = require("sequelize");
const { LocalStorage } = require("node-localstorage");
const localStorage = new LocalStorage("./local-storage");
// const { spawn } = require("child_process");
const spawn = require("cross-spawn");
let sequelize;
let info;
const handb = async (req, res) => {
  if (localStorage.getItem(`INFODB`)) {
    res.send(true);
  } else {
    if (req.query) {
      console.log("entro db");

      const { name, password, dbname, user, pass, host } = req.query;
      localStorage.setItem(
        `INFODB`,
        JSON.stringify({ name, password, dbname, user, pass, host })
      );

      reincioNode();
      res.send("se crearon las variables de configuracion");
    }
  }
};

// if (localStorage.getItem(`INFODB`)) {
//   info = JSON.parse(localStorage.getItem(`INFODB`));
//   sequelize = new Sequelize(info.dbname, info.user, info.pass, {
//     host: info.host,
//     dialect:
//       "mssql" /* one of 'mysql' | 'postgres' | 'sqlite' | 'mariadb' | 'mssql' | 'db2' | 'snowflake' | 'oracle' */,
//     // port:"1433"
//   });
//   // Test the database connection
//   sequelize
//     .authenticate()
//     .then(() => {
//       console.log("Connection has been established successfully.");
//     })
//     .catch((err) => {
//       console.error("Unable to connect to the database:", err);
//     });
// } else {
//   console.log("no hay variables de configuracion para la db");
// }

sequelize = new Sequelize("Fritomania", "estiven2111_SQLLogin_1", "lxsl4f4uji", {
  host: "Fritomania.mssql.somee.com",
  dialect:
    "mssql" /* one of 'mysql' | 'postgres' | 'sqlite' | 'mariadb' | 'mssql' | 'db2' | 'snowflake' | 'oracle' */,
  // port:"1433"
});

//  sequelize = new Sequelize("BDCREAME", "sql_admin", "$$Incubadora2024", {
//   host: "creame-sim\\SQLEXPRESS",
//   dialect: "mssql",
//   port: 1433, // El puerto predeterminado de SQL Server es 1433
// });

// sequelize = new Sequelize({
//   dialect: 'mssql',
//   host: 'creame-sim-sql.database.windows.net',
//   port: 1433,
//   database: 'creame-sim-db',
//   username: 'sql_admin',
//   password: '$$Incubadora2024',
//   dialectOptions: {
//     options: {
//       encrypt: true,
//       trustServerCertificate: false,
//       authentication: 'ActiveDirectoryDefault',
//     },
//   },
// });


// sequelize = new Sequelize({
//   dialect: "mssql",
//   host: "creame-sim-sql.database.windows.net",
//   port: 1433,
//   database: "creame-sim-db",
//   username: "sql_admin", // Reemplaza con tu nombre de usuario
//   password: "$$Incubadora2024", // Reemplaza con tu contraseña
//   dialectOptions: {
//     options: {
//       encrypt: true,
//       trustServerCertificate: false,
//       authentication: "ActiveDirectoryDefault",
//     },
//   },
//   define: {
//     timestamps: false, // Si no estás usando campos de timestamp en tus modelos
//   },
//   logging: console.log, // Muestra logs en la consola (opcional, para debug)
// });

// Validar la conexión
sequelize
  .authenticate()
  .then(() => {
    console.log("Conexión exitosa a la base de datos");
  })
  .catch((error) => {
    console.error("Error al conectar con la base de datos:", error);
  });

const reincioNode = () => {
  const comando =
    process.platform === "win32" ? "taskkill /F /IM node" : "pkill -f nodemon";

  const proceso = spawn(comando, [], { shell: true });

  proceso.on("close", (codigo) => {
    console.log("nodemon reiniciado");
  });

  //todo este funciona revisar en el deploy
  //   const kill = process.platform === 'win32' ? 'taskkill /F /IM node' : 'pkill node';
  // spawn(kill, { shell: true });
  //   const comando = process.platform === 'win32' ? 'npm.cmd' : 'npm';
  //   const proceso = spawn(comando, ['run', 'start'], { shell: true, stdio: 'inherit' });

  //   proceso.on('close', (codigo) => {
  //     console.log('Servidor reiniciado');
  //   });
};

module.exports = {
  sequelize,
  handb,
};
