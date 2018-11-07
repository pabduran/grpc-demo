# gRPC - Ejemplo de Sincronia y notificaciones de server a cliente.

Este ejemplo muestra cómo hacer uso de gRPC para establecer comunicaciones sincrónicas entre el cliente y servidor, y a su vez, como este último puede enviar notificaciones hacia los clientes activos, mediante el uso de "stream".

**Preparación de ambiente:**

- Tener corriendo mongodb sobre la máquina, y haber creado una base de datos llamada "grpc" y además una collection "items". Los documentos deben tener la siguiente estructura:

{
    "items_id" : 1,
    "name" : "Mouse",
    "status" : "ok"
}

Donde status, puede tener los "ok" y "nok". El primer valor, significa que el producto ya fue enviado en alguna ocación a algún cliente conectado, y el segundo, es el valor que un item debe tener para poder ser notificado como un nuevo producto hacia los consumidores.

Luego de tener lo anterior OK, se procede con lo siguiente:

- Instalación de dependencias:
    ``$ npm install``

- Start Server:
    ``$ node server``

- Start client:
    ``$ node client``
