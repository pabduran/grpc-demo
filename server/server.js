/*
* Antes de iniciar el server se debe hacer andar el servicio de mongoDb.
* Dentro de Mongo debe existir una base de datos llamada "grpc" y una collection llamada "items".
* Cada documento dentro de esta collection debe tener la siguiente estructura:

{
    "items_id" : 2,
    "name" : "Notebook",
    "status" : "ok",
    "__v" : 0
}

* Los documentos que serán informados a todos los consumidores activos serán los que tienen
* marcado el "status" como "nok", de caso contrario no ocurrirá nada.
* Dentro del server, existe una función "setInterval" que se encarga de buscar novedades dentro de la base de datos 
* cada 5 segundos.
*/
const MongoClient = require('mongodb').MongoClient;
const assert = require('assert');
let grpc = require("grpc");
let protoLoader = require("@grpc/proto-loader");

let consumers = [];

// Configuración DataBase
const url = 'mongodb://localhost:27017';
const dbName = 'grpc';
const collectionName = 'items';
const client = new MongoClient(url);
let db;

//Conexión Base Datos
client.connect(function(err) {
  assert.equal(null, err);
  console.log("Connected successfully to server");

  db = client.db(dbName);
});

//Configuración gRPC
const server = new grpc.Server();
const SERVER_ADDRESS = "0.0.0.0:5001";

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

//Se mapean los metodos que expone protobuffer
server.addService(proto.cencosud.Items.service, { join: join, consultaItem: consultaItem });

//Método sincrónico que consulta un Items en particular.
function consultaItem(call, callback) {  
  try {
    const collection = db.collection(collectionName);
    collection.find({'items_id':Number(call.request.id)}).toArray(function(err, items) {
        assert.equal(err, null);
        console.log(items);  
        if(items.length>0)    
        {
          callback(null, items[0]);
        }        
    });   
  } catch (error) {
    //En caso de error, progragamos!
    callback(error, null);
  }    
}

//Nuevo consumidor registrado
function join(consumer, callback) {
  consumers.push(consumer);
  console.log('Nuevo consumidor:'+consumer.request.name);
}

//Cuando se detecta un nuevo evento, se envía a todos los consumidores conectados.
//En este caso la variable event contiene el Item que se desea informar.
function notifyEvent(event) {
  console.log('Notificando un nuevo Evento => '+JSON.stringify(event));
  consumers.forEach(consumer => {
    consumer.write(event);
  });
}

//Polling hacia mongodb
setInterval(function(){
  console.log('Nueva Lectura!!!');
  const collection = db.collection(collectionName);
  collection.find({'status':'nok'}).toArray(function(err, items) {
      assert.equal(err, null);
      console.log(items);  
      if(items.length>0 && consumers.length >0)    
      {
        checkItems(items);
      }        
  });
}, 5000);

//Cambiar el estado, al momento de ser enviado el mensaje a los consumidores!
function checkItems(items) {
  items.forEach(item => {
    notifyEvent(item);
    const collection = db.collection(collectionName);
    try {
      collection.updateOne(
        {_id:item._id},
        { $set: {status: 'ok'}}
     );
    } catch (error) {
      console.log(error);
    }
  });
}

//Se define el Server y se da inicio.
server.bind(SERVER_ADDRESS, grpc.ServerCredentials.createInsecure());
server.start();
console.log("Server started");