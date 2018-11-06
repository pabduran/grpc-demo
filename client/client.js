/*
* Este cliente se debe arrancar después de haber iniciado el server/server.js
* Cada cliente que se inicie, hará referencia a un consumidor diferente.
* Se pueden instanciar tantos se estime conveniente a modo de ejemplo.
*/
let grpc = require("grpc");
let protoLoader = require("@grpc/proto-loader");
let readline = require("readline");

const REMOTE_SERVER = "0.0.0.0:5001";
let consumerName;

//Leer input del terminal
let rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

//Carga sync del protobuffer
let proto = grpc.loadPackageDefinition(
  protoLoader.loadSync("protos/items.proto", {
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true
  })
);

//Creación cliente gRPC
let client = new proto.cencosud.Items(
  REMOTE_SERVER,
  grpc.credentials.createInsecure()
);

//Iniciar stream entre server y client
function startGrpc() {
  //Cliente se conecta con server
  let channel = client.join({ name: consumerName });
  channel.on("data", onData);
  
  rl.on("line", function(text) {
    //Petición sincronica. 
    //Cliente invoca función de consultaItem.
    client.consultaItem({ id: Number(text) }, (err, res) => {
      if(err){
        console.log("Error!");
      }else{
        console.log("\n**************************");
        console.log("Respuesta SYNC!");
        console.log(res);
        console.log("**************************\n");
      }
    });
  });
}

//Listener hacia el server. Cada mensaje que es enviado del server cae a esta función.
function onData(message) {
  console.log("\n**************************************")
  console.log("Respuesta ASYNC!");
  console.log(message);
  console.log("**************************************\n")
}

//Registra el nombre del consumidor en el Server
rl.question("Nombre del Consumidor >> ", res => {
  consumerName = res;
  //Iniciar el stream
  startGrpc();
});
