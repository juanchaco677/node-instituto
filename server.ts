import { Routes } from "./routes";
import { PeerServerEmisorReceptor } from "./src/model/peer-server-emisor-receptor";
import { Util } from "./src/util";
import { Usuario } from "./src/model/usuario";

import { Room } from "./src/model/room";
import { VideoBoton } from "./src/model/video-boton";
export class Server {
  path = require("path");
  cors = require("cors");

  app = require("express")();

  http = require("http").Server(this.app);
  io = require("socket.io")(this.http);
  publicDir = `${__dirname}/src`;
  port = process.env.PORT || 4444;
  rooms: Room[] = [];
  socket: any;
  routes: Routes;
  init() {
    this.http.listen(this.port, "192.168.0.17", () => {
      console.log("Iniciando Express y Socket.IO en localhost:%d", this.port);
    });
    this.listen();
    this.routes = new Routes(this.io,this.rooms);
    this.addCorsRoute();
  }

  addCorsRoute() {
    var originsWhitelist = [
      "http://localhost:4200",
      "http://181.55.192.137:4200",
    ];
    var corsOptions = {
      origin: function (origin: any, callback: any) {
        var isWhitelisted = originsWhitelist.indexOf(origin) !== -1;
        callback(null, isWhitelisted);
      },
      credentials: true,
    };
    this.app.use(this.cors(corsOptions), this.routes.router);
  }

  buscarUsuario(id: string, usuario: Usuario, socket?: any) {
    const roomS = this.buscarRoom(id);
    if (roomS !== null) {
      for (const user of roomS.usuarios) {
        if (user.id === usuario.id) {
          if (!Util.empty(socket)) {
            user.socket = socket.id;
          }
          return user;
        }
      }
    }
    return null;
  }

  buscarRoom(id: string) {
    for (const room of this.rooms) {
      if (room.id === id) {
        return room;
      }
    }
    return null;
  }

  createRoom(id: string) {
    const room = new Room(id, [], [], {}, {}, {});

    this.rooms.push(room);
    return room;
  }

  livingRoom(socket: any, previousId: any) {
    socket.on("livingRoom", (data: any) => {
      if (data.usuario.rol.tipo === "ES" || data.usuario.rol.tipo === "PR") {
        const id =
          data.programacion.id +
          "" +
          data.programacion.asig_profe_asig.salon.id;

        let room = this.buscarRoom(id);

        if (Util.empty(room)) {
          room = this.createRoom(id);
        }
        data.usuario.socket = socket.id;
        const bUsuario = this.buscarUsuario(id, data.usuario, socket);
        if (!Util.empty(bUsuario)) {
          this.safeJoin(socket, id, previousId);
          const emiRecep = {};
          const emiRecepDesktop = {};
          for (const key in room.peerServerEmisorReceptor) {
            if (
              room.peerServerEmisorReceptor[key].usuario1.id ===
                data.usuario.id ||
              room.peerServerEmisorReceptor[key].usuario2.id === data.usuario.id
            ) {
              let newObject = new PeerServerEmisorReceptor(
                room.peerServerEmisorReceptor[key].usuario1,
                room.peerServerEmisorReceptor[key].usuario2,
                null,
                null,
                new VideoBoton(false, false, false, false)
              );
              let newObjectDesktop = new PeerServerEmisorReceptor(
                room.peerServerEmisorReceptor[key].usuario1,
                room.peerServerEmisorReceptor[key].usuario2,
                null,
                null,
                new VideoBoton(false, false, false, false)
              );
              emiRecep[key] = newObject;
              emiRecepDesktop[key] = newObjectDesktop;
            }
          }
          socket.broadcast.emit("addUsuario", {
            id: room.id,
            usuario: data.usuario,
            chat: room.chat,
            peerServerEmisorReceptor: emiRecep,
            peerServerEmisorReceptorDesktop: emiRecepDesktop,
          });

          socket.emit("room", room);

          // for (const key in room.peerServerEmisorReceptor) {
          //   if (data.usuario.id === room.peerServerEmisorReceptor[key].usuario1.id) {
          //     this.io.to(room.peerServerEmisorReceptor[key].usuario2.socket).emit("refreshUsuario", true);
          //   } else {
          //     if (data.usuario.id === room.peerServerEmisorReceptor[key].usuario2.id) {
          //       this.io
          //         .to(room.peerServerEmisorReceptor[key].usuario1.socket)
          //         .emit("refreshUsuario", true);
          //     }
          //   }
          // }
        } else {
          if (room !== null) {
            data.usuario.socket = socket.id;
            room.usuarios.push(data.usuario);
            this.safeJoin(socket, id, previousId);
            const emiRecep = {};
            const emiRecepDesktop = {};
            for (const element of room.usuarios) {
              if (element.id !== data.usuario.id) {
                let newObject = new PeerServerEmisorReceptor(
                  element,
                  data.usuario,
                  null,
                  null,
                  new VideoBoton(false, false, false, false)
                );
                let newObjectDesktop = new PeerServerEmisorReceptor(
                  element,
                  data.usuario,
                  null,
                  null,
                  new VideoBoton(false, false, false, false)
                );
                emiRecep["P" + data.usuario.id + "" + element.id] = newObject;
                emiRecepDesktop[
                  "P" + data.usuario.id + "" + element.id
                ] = newObjectDesktop;
                room.peerServerEmisorReceptor[
                  "P" + data.usuario.id + "" + element.id
                ] = newObject;
                room.peerServerEmisorReceptorDesktop[
                  "P" + data.usuario.id + "" + element.id
                ] = newObjectDesktop;
              }
            }
            socket.broadcast.emit("addUsuario", {
              id: room.id,
              usuario: data.usuario,
              chat: room.chat,
              peerServerEmisorReceptor: emiRecep,
              peerServerEmisorReceptorDesktop: emiRecepDesktop,
            });

            socket.emit("room", room);
          }
        }
      }
    });
  }

  safeJoin(socket: any, id: string, previousId: any) {
    socket.leave(previousId.id);
    socket.join(id);
    previousId.id = id;
  }

  listen() {
    this.io.on("connection", (socket: any) => {
      let previousId = { id: "" };
      this.livingRoom(socket, previousId);
      // this.answer(socket, previousId);
      this.connectionPeer(socket, previousId);
    });
  }

  connectionPeer(socket: any, previousId: any) {
    socket.on("addIceCandidate", (data: any) => {
      const id = data.id;
      let room = this.buscarRoom(id);
      if (Util.empty(room)) {
        room = this.createRoom(id);
      }
      this.safeJoin(socket, id, previousId);
      this.io.to(data.usuarioOrigen.socket).emit("addIceCandidate", data);
    });

    socket.on("createAnswer", (data: any) => {
      const id = data.id;
      let room = this.buscarRoom(id);
      if (Util.empty(room)) {
        room = this.createRoom(id);
      }
      this.safeJoin(socket, id, previousId);
      this.io.to(data.usuarioDestino.socket).emit("createAnswer", data);
    });

    socket.on("sendAnswer", (data: any) => {
      const id = data.id;
      let room = this.buscarRoom(id);
      if (Util.empty(room)) {
        room = this.createRoom(id);
      }
      this.safeJoin(socket, id, previousId);
      this.io.to(data.usuarioDestino.socket).emit("sendAnswer", data);
    });

    socket.on("connectStateS", (data: any) => {
      const id = data.id;
      let room = this.buscarRoom(id);
      if (Util.empty(room)) {
        room = this.createRoom(id);
      }
      this.safeJoin(socket, id, previousId);
      this.io.to(data.usuarioOrigen.socket).emit("connectState", {
        peerServerEmisorReceptor: data.peerServerEmisorReceptor,
        peerServerEmisorReceptorDesktop: data.peerServerEmisorReceptorDesktop,
      });
    });
  }

  answer(socket: any, previousId: any) {
    socket.on("answer", (data: any) => {
      const id =
        data.programacion.id + "" + data.programacion.asig_profe_asig.salon.id;
      this.safeJoin(socket, id, previousId);
      const usuarioAux = this.buscarUsuario(id, data.usuario);

      if (usuarioAux !== null && usuarioAux.socket !== null) {
        this.io.to(usuarioAux.socket).emit("answer", data.peer);
      }
    });
  }
}
