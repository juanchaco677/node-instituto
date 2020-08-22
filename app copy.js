const app = require("express")();
const chat =require("./src/chat");

const http = require("http").Server(app);
const io = require("socket.io")(http);
const publicDir = `${__dirname}/src`;
const port = process.env.PORT || 4444;

http.listen(port, () => {
  console.log("Iniciando Express y Socket.IO en localhost:%d", port);
});

app.get("/", (req, res) => {
  res.sendFile(`${publicDir}/server.html`);
});
const documents = {};
const rooms = {};

buscarUsuario = function (usuario) {
  for (const key in rooms) {
    const room = rooms[key];
    if (room.usuario.id === usuario.id) {
      return room.usuario;
    }
  }
  return null;
};

const usuarios = {};
io.on("connection", (socket) => {
  let previousId;

  const safeJoin = (currentId) => {
    socket.leave(previousId);
    socket.join(currentId);
    previousId = currentId;
  };

  socket.on("entrarCrearRoom", (data) => {
    if (data.usuario.rol.tipo === "PR") {
      if (rooms[data.id]) {
        safeJoin(data.id);
        socket.emit("room", rooms[data.id]);
        console.log("entrar nuevamente a sala");
        console.log(rooms);
      } else {
        rooms[data.id] = data;
        safeJoin(data.id);
        socket.emit("room", data);
        console.log("CREAR NUEVA SALA");
        console.log(rooms);
      }
    } else if (data.usuario.rol.tipo === "ES") {
      if (buscarUsuario(data.usuario) !== null) {
        console.log("EL USUARIO YA EXISTE EN LA SALA");
        safeJoin(data.id);
        socket.emit("room", rooms["1"]);
        console.log(rooms);
      } else {
        console.log("agregar estudiante nuevo a la sala");
        rooms[data.id].usuarios.push(data.usuario);
        safeJoin(data.id);
        io.emit("room", rooms[data.id]);
        socket.emit("room", rooms[data.id]);
        console.log(rooms[data.id]);
      }
    }
  });

  socket.on("joinRoom", (data) => {
    if (data.usuario.role.tipo === "PR" || data.usuario.role.tipo === "ES") {
      if (rooms[data.id]) {
        safeJoin(data.id);
        io.emit("rooms", rooms);
        socket.emit("room", data);
      } else {
        socket.emit("room-error", {
          error:
            "todavía no existe el salón de clase. Espere que el profesor ingrese al salón.",
        });
      }
    }
  });
});
// io.on("connection", socket => {
//     let previousId;
//     const safeJoin = currentId => {
//       socket.leave(previousId);
//       socket.join(currentId);
//       previousId = currentId;
//     };

//     socket.on("getDoc", docId => {
//       safeJoin(docId);
//       socket.emit("document", documents[docId]);
//     });

//     socket.on("addDoc", doc => {
//       documents[doc.id] = doc;
//       safeJoin(doc.id);
//       io.emit("documents", Object.keys(documents));
//       socket.emit("document", doc);
//     });

//     socket.on("editDoc", doc => {
//       documents[doc.id] = doc;
//       socket.to(doc.id).emit("document", doc);
//     });

//     io.emit("documents", Object.keys(documents));
//   });
