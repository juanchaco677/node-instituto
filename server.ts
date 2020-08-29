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
  colores = {
    1: "#99b433",
    2: "#00a300",
    3: "#1e7145",
    4: "#ff0097",
    5: "#9f00a7",
    6: "#7e3878",
    7: "#603cba",
    8: "#1d1d1d",
    9: "#00aba9",
    10: "#eff4ff",
    11: "#2d89ef",
    12: "#2b5797",
    13: "#ffc40d",
    14: "#e3a21a",
    15: "#da532c",
    16: "#ee1111",
    17: "#b91d47",
  };

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
      for (const key in roomS.usuarios) {
        if (roomS.usuarios[key].id === usuario.id) {
          if (!Util.empty(socket)) {
            roomS.usuarios[key].socket = socket.id;
          }
          return roomS.usuarios[key];
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
    const room = new Room(id, {}, [], {}, {}, {});
    this.rooms[id] = room;
    return room;
  }

  /**
   * función que contiene la logica para el ingreso de usuarios a los room
   * @param socket
   */
  livingRoom(socket: any, idAntes: any) {
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
        data.usuario.color = this.colores[Math.floor(Math.random() * 17 + 1)];
        const bUsuario = this.buscarUsuario(id, data.usuario, socket);
        if (!Util.empty(bUsuario)) {
          this.safeJoin(socket, idAntes, id);
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
                new VideoBoton(false, false, false, false, false)
              );
              let newObjectDesktop = new PeerServerEmisorReceptor(
                room.peerServerEmisorReceptor[key].usuario1,
                room.peerServerEmisorReceptor[key].usuario2,
                null,
                null,
                new VideoBoton(false, false, false, false, false)
              );
              emiRecep[key] = newObject;
              emiRecepDesktop[key] = newObjectDesktop;
            }
          }
          let boton = this.rooms[id].usuarios[data.usuario.id].boton;
          this.rooms[id].usuarios[data.usuario.id].boton = new VideoBoton(
            false,
            false,
            false,
            false,
            boton.mano
          );
          socket.to(id).emit("addUsuario", {
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
            data.usuario.color = this.colores[
              Math.floor(Math.random() * 17 + 1)
            ];
            room.usuarios[data.usuario.id] = data.usuario;
            this.safeJoin(socket, idAntes, id);        
            const emiRecep = {};
            const emiRecepDesktop = {};
            for (const key in room.usuarios) {
              if (room.usuarios[key].id !== data.usuario.id) {
                let newObject = new PeerServerEmisorReceptor(
                  room.usuarios[key],
                  data.usuario,
                  null,
                  null,
                  new VideoBoton(false, false, false, false, false)
                );
                let newObjectDesktop = new PeerServerEmisorReceptor(
                  room.usuarios[key],
                  data.usuario,
                  null,
                  null,
                  new VideoBoton(false, false, false, false, false)
                );
                emiRecep[
                  "P" + data.usuario.id + "" + room.usuarios[key].id
                ] = newObject;
                emiRecepDesktop[
                  "P" + data.usuario.id + "" + room.usuarios[key].id
                ] = newObjectDesktop;
                room.peerServerEmisorReceptor[
                  "P" + data.usuario.id + "" + room.usuarios[key].id
                ] = newObject;
                room.peerServerEmisorReceptorDesktop[
                  "P" + data.usuario.id + "" + room.usuarios[key].id
                ] = newObjectDesktop;
              }
            }
            socket.to(id).emit("addUsuario", {
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
  safeJoin(socket: any, idAntes: any, id: string) {
    socket.leave(idAntes.id);
    socket.join(id);
    idAntes.id = id;
  }

  /**
   * función principal para iniciar la escucha socket io
   */
  listen() {
    this.io.on("connection", (socket: any) => {
      const idAntes = {id:''};
      this.livingRoom(socket, idAntes);
      this.connectionPeer(socket, idAntes);
      this.paginacionPPT(socket, idAntes);
      this.chatMessage(socket, idAntes);
      this.recibirBotonesS(socket, idAntes);
      this.controlesUsuarios(socket, idAntes);
    });
  }

  /**
   * hilos de escucha para las conexiones rtc peer
   * @param socket
   */
  connectionPeer(socket: any, idAntes: any) {
    socket.on("addIceCandidate", (data: any) => {
      // this.safeJoin(socket, idAntes, data.id);
      this.io.to(data.usuarioOrigen.socket).emit("addIceCandidate", data);
    });

    socket.on("createAnswer", (data: any) => {
      // this.safeJoin(socket, idAntes, data.id);
      this.io.to(data.usuarioDestino.socket).emit("createAnswer", data);
    });

    socket.on("sendAnswer", (data: any) => {
      // this.safeJoin(socket, idAntes, data.id);
      this.io.to(data.usuarioDestino.socket).emit("sendAnswer", data);
    });

    socket.on("connectStateS", (data: any) => {
      // this.safeJoin(socket, idAntes, data.id);
      this.io.to(data.usuarioOrigen.socket).emit("connectState", {
        peerServerEmisorReceptor: data.peerServerEmisorReceptor,
        peerServerEmisorReceptorDesktop: data.peerServerEmisorReceptorDesktop,
      });
    });
  }

  /**
   * hilos de escucha para las conexiones rtc peer
   * @param socket
   */
  paginacionPPT(socket: any, idAntes: any) {
    socket.on("recibePaginationS", (data: any) => {
      // this.safeJoin(socket, idAntes, data.id);
      socket.to(data.id).emit("recibePaginationC", data.ppt);
    });

    socket.on("eliminarPPTS", (data: any) => {
      delete this.rooms[data.id].ppts[data.key];
      // this.safeJoin(socket, idAntes, data.id);
      socket.to(data.id).emit("eliminarPPTC", data.ppt);
    });
  }

  chatMessage(socket: any, idAntes: any) {
    socket.on("chatMessageS", (data: any) => {
      // this.safeJoin(socket, idAntes, data.id);
      this.rooms[data.id].chat.push(data.chat);
      this.io.in(data.id).emit("chatMessageC", data);
    });
  }

  recibirBotonesS(socket: any, idAntes: any) {
    socket.on("recibirBotonesS", (data: any) => {
      // this.safeJoin(socket, idAntes, data.id);
      this.rooms[data.id].usuarios[data.usuario.id].boton = data.usuario.boton; 
      this.io.in(this.rooms[data.id].id).emit("enviarBotonesC", data);
    });
  }

  controlesUsuarios(socket: any, idAntes: any) {
    socket.on("recibirControlesS", (data: any) => {
      // this.safeJoin(socket, idAntes, data.id);
      this.io.to(this.rooms[data.id].usuarios[data.usuario.id].socket).emit("enviarControlesS", data);
    });
  }
}
