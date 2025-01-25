const app = require("./src/app");
// const { sequelize } = require("./src/db");
// Iniciar el servidor

// sequelize.sync({ force: false }).then(() => {
const port =  process.env.PORT || 5000 ; 
app.listen(port, () => {
  console.log(`Servidor backend escuchando en el puerto ${port}`);
});
//});