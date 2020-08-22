const app = require("express")();


const http = require("http").Server(app);
const io = require("socket.io")(http);
const publicDir = `${__dirname}/src`;
const port = process.env.PORT || 4444;
const chat = require("./src/chat");
http.listen(port, () => {
  console.log("Iniciando Express y Socket.IO en localhost:%d", port);
});

app.get("/", (req, res) => {
  res.sendFile(`${publicDir}/server.html`);
});

const rooms = {};

buscarUsuario = function (keyRoom, usuario) {
  if (rooms[keyRoom]) {
    for (const element of rooms[keyRoom].usuarios) {
      if (element.id === usuario.id) {
        return element;
      }
    }
  }
  return null;
};


empty = function(data){
  return data === undefined || data === null || data === '';
}

io.on("connection", (socket) => {
  let previousId;

  const safeJoin = (currentId) => {
    socket.leave(previousId);
    socket.join(currentId);
    previousId = currentId;
  };

  socket.on("livingRoom", (data) => {
   if (data.usuario.rol.tipo === "ES"
      || data.usuario.rol.tipo === "PR") {
        const id = data.id+''+data.asig_profe_asig.dalon.id;
      if (buscarUsuario(id, data.usuario) !== null) {
        safeJoin(id);
        rooms[id].usuario=data.usuario;
        socket.emit("room", rooms[data.id]);
      } else {
        rooms[id] = {
          id: id, 
          usuarios:
            rooms[id] !== undefined &&
            rooms[id].usuarios !== undefined
              ? rooms[id].usuarios
              : [],
          chat:
            rooms[id] !== undefined && rooms[id].chat !== undefined
              ? rooms[id].chat
              : [],
        };
        rooms[id].usuarios.push(data.usuario);
        safeJoin(id);
        socket.broadcast.emit("addUsuario",data.usuario);
        socket.emit("room", rooms[id]);
      }
    }
  });


  socket.on("chat",(data)=>{
    console.log("chat recibiendo ...");
    console.log(data);
    if(rooms[data.id]){
      console.log("existe el rooms ...");
      console.log(empty(data.chat));
      if(!empty(data.chat)){   
        console.log("entroo a enviar un chat para los compañeros");     
        rooms[data.id].chat.push(data.chat);
        io.emit("chatRoom", data.chat);
        console.log(rooms[data.id]);
        console.log(data.chat.usuario);
      }
    }
  });

  socket.on("streaming-cam",(data)=>{
    if(rooms[data.id]){
      safeJoin(data.id);
      io.emit("streaming-cam", data.streaming);
    }
  });

  socket.on("peer-conection",(data)=>{
    if(rooms[data.id]){
      safeJoin(data.id);
      console.log("remitiendo peer para conexion...");
      socket.broadcast.emit("peer-conection", data.offer);
    }
  });
});
