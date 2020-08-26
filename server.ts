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
  rooms = {};
  socket: any;
  routes: Routes;
  previousId = { id: "" };

  /**
   * función que inicia el servidor
   */
  init() {
    /**
     * inicia la escucha de express en una ip y puerto
     */
    this.http.listen(this.port, "192.168.0.17", () => {
      console.log("Iniciando Express y Socket.IO en localhost:%d", this.port);
    });
    this.listen(); // inicia la escucha de hilos socket io
    this.routes = new Routes(this.io, this.rooms); //rutas
    this.addCorsRoute(); // adiciona a las rutas los cors
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
    const roomS = this.getRoom(id);
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

  getRoom(id: string) {
    return this.rooms[id];
  }

  /**
   * función que crea los room de acuerdo al id
   * @param id
   */
  createRoom(id: string) {
    const room = new Room(id, [], [], {}, {}, {});
    this.rooms[id] = room;
    return room;
  }

  /**
   * función que contiene la logica para el ingreso de usuarios a los room
   * @param socket
   */
  livingRoom(socket: any) {
    socket.on("livingRoom", (data: any) => {
      if (data.usuario.rol.tipo === "ES" || data.usuario.rol.tipo === "PR") {
        const id =
          data.programacion.id +
          "" +
          data.programacion.asig_profe_asig.salon.id;

        let room = this.getRoom(id);

        if (Util.empty(room)) {
          room = this.createRoom(id);
        }
        data.usuario.socket = socket.id;
        const bUsuario = this.buscarUsuario(id, data.usuario, socket);
        if (!Util.empty(bUsuario)) {
          this.safeJoin(socket, id);
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
            ppts: room.ppts,
            peerServerEmisorReceptor: emiRecep,
            peerServerEmisorReceptorDesktop: emiRecepDesktop,
          });

          socket.emit("room", room);
        } else {
          if (room !== null) {
            data.usuario.socket = socket.id;
            room.usuarios.push(data.usuario);
            this.safeJoin(socket, id);
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
              ppts: room.ppts,
              peerServerEmisorReceptor: emiRecep,
              peerServerEmisorReceptorDesktop: emiRecepDesktop,
            });

            socket.emit("room", room);
          }
        }
      }
    });
  }

  /**
   * función para salir y entrar a una sala room
   * @param socket
   * @param id
   */
  safeJoin(socket: any, id: string) {
    socket.leave(this.previousId.id);
    socket.join(id);
    this.previousId.id = id;
  }

  /**
   * función principal para iniciar la escucha socket io
   */
  listen() {
    this.io.on("connection", (socket: any) => {
      this.livingRoom(socket);
      this.connectionPeer(socket);
      this.paginacionPPT(socket);
    });
  }

  /**
   * hilos de escucha para las conexiones rtc peer
   * @param socket
   */
  connectionPeer(socket: any) {
    socket.on("addIceCandidate", (data: any) => {
      const id = data.id;
      let room = this.getRoom(id);
      if (Util.empty(room)) {
        room = this.createRoom(id);
      }
      this.safeJoin(socket, id);
      socket.to(data.usuarioOrigen.socket).emit("addIceCandidate", data);
    });

    socket.on("createAnswer", (data: any) => {
      const id = data.id;
      let room = this.getRoom(id);
      if (Util.empty(room)) {
        room = this.createRoom(id);
      }
      this.safeJoin(socket, id);
      socket.to(data.usuarioDestino.socket).emit("createAnswer", data);
    });

    socket.on("sendAnswer", (data: any) => {
      const id = data.id;
      let room = this.getRoom(id);
      if (Util.empty(room)) {
        room = this.createRoom(id);
      }
      this.safeJoin(socket, id);
      socket.to(data.usuarioDestino.socket).emit("sendAnswer", data);
    });

    socket.on("connectStateS", (data: any) => {
      const id = data.id;
      let room = this.getRoom(id);
      if (Util.empty(room)) {
        room = this.createRoom(id);
      }
      this.safeJoin(socket, id);
      socket.to(data.usuarioOrigen.socket).emit("connectState", {
        peerServerEmisorReceptor: data.peerServerEmisorReceptor,
        peerServerEmisorReceptorDesktop: data.peerServerEmisorReceptorDesktop,
      });
    });
  }

  /**
   * hilos de escucha para las conexiones rtc peer
   * @param socket
   */
  paginacionPPT(socket: any) {
    socket.on("recibePaginationS", (data: any) => {
      const id = data.id;
      let room = this.getRoom(id);
      if (Util.empty(room)) {
        room = this.createRoom(id);
      }
      this.safeJoin(socket, id);
      socket.broadcast.emit("recibePaginationC", data);
    });
  }
}
