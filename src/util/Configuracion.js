const app = require("./src/app");

let server = app
const stopServer = () => {
    // Para detener el servidor programáticamente
  server.close(() => {
    console.log('Server has been stopped.');
   
  });
  }

  module.exports = stopServer