// import { PeerServerEmisorReceptor } from "./src/model/peer-server-emisor-receptor";
// import { Util } from "./src/util";
// import { Usuario } from "./src/model/usuario";

// import { Room } from "./src/model/room";
// import { VideoBoton } from "./src/model/video-boton";
// export class Server {
//   app = require("express")();
//   http = require("http").Server(this.app);
//   io = require("socket.io")(this.http);
//   publicDir = `${__dirname}/src`;
//   port = process.env.PORT || 4444;
//   rooms: Room[] = [];
//   socket: any;

//   init() {
//     this.http.listen(this.port, "192.168.0.17", () => {
//       console.log("Iniciando Express y Socket.IO en localhost:%d", this.port);
//     });
//   }

//   buscarUsuario(id: string, usuario: Usuario, socket?: any) {
//     const roomS = this.buscarRoom(id);
//     if (roomS !== null) {
//       for (const user of roomS.usuarios) {
//         if (user.id === usuario.id) {
//           if (!Util.empty(socket)) {
//             user.socket = socket.id;
//           }
//           return user;
//         }
//       }
//     }
//     return null;
//   }

//   buscarRoom(id: string) {
//     for (const room of this.rooms) {
//       if (room.id === id) {
//         return room;
//       }
//     }
//     return null;
//   }

//   createRoom(id: string) {
//     const room = new Room(id, [], [], [], []);

//     this.rooms.push(room);
//     return room;
//   }

//   livingRoom(socket: any, previousId: any) {
//     socket.on("livingRoom", (data: any) => {
//       if (data.usuario.rol.tipo === "ES" || data.usuario.rol.tipo === "PR") {
//         const id =
//           data.programacion.id +
//           "" +
//           data.programacion.asig_profe_asig.salon.id;

//         let room = this.buscarRoom(id);

//         if (Util.empty(room)) {
//           room = this.createRoom(id);
//         }
//         if (!Util.empty(this.buscarUsuario(id, data.usuario, socket))) {
//           this.safeJoin(socket, id, previousId);
//           socket.emit("room", room);
//           for (const element of room.peerServerEmisorReceptor) {
//             if (data.usuario.id === element.usuario1.id) {             
//               this.io.to(element.usuario2.socket).emit("refreshUsuario", true);
//             } else {
//               if (data.usuario.id === element.usuario2.id) {
//                 this.io
//                   .to(element.usuario1.socket)
//                   .emit("refreshUsuario", true);
//               }
//             }
//           }
//         } else {
//           if (room !== null) {
//             data.usuario.socket = socket.id;
//             room.usuarios.push(data.usuario);
//             this.safeJoin(socket, id, previousId);
//             const emiRecep: PeerServerEmisorReceptor[] = [];
//             const emiRecepDesktop: PeerServerEmisorReceptor[] = [];
//             for (const element of room.usuarios) {
//               if (element.id !== data.usuario.id) {
//                 let newObject = new PeerServerEmisorReceptor(
//                   element,
//                   data.usuario,
//                   null,
//                   null,
//                   new VideoBoton(false, false, false , false)
//                 );               
//                 let newObjectDesktop = new PeerServerEmisorReceptor(
//                   element,
//                   data.usuario,
//                   null,
//                   null,
//                   new VideoBoton(false, false, false, false)
//                 );
//                 emiRecep.push(newObject);
//                 emiRecepDesktop.push(newObjectDesktop);
//                 room.peerServerEmisorReceptor.push(newObject);
//                 room.peerServerEmisorReceptorDesktop.push(newObjectDesktop);
//               }
//             }
//             // socket.broadcast.emit("addUsuario", {
//             //   id: room.id,
//             //   usuario: data.usuario,
//             //   chat: room.chat,
//             //   peerServerEmisorReceptor: emiRecep,
//             //   peerServerEmisorReceptorDesktop: emiRecepDesktop
//             // });

//             // socket.emit("room", room);
//           }
//         }
//       }
//     });
//   }

//   safeJoin(socket: any, id: string, previousId: any) {
//     socket.leave(previousId.id);
//     socket.join(id);
//     previousId.id = id;
//   }

//   listen() {
//     this.io.on("connection", (socket: any) => {
//       let previousId = { id: "" };
//       this.livingRoom(socket, previousId);
//       // this.answer(socket, previousId);
//       this.connectionPeer(socket, previousId);
//     });
//   }

//   connectionPeer(socket: any, previousId: any) {

//     socket.on("onicecandidate", (data: any) => {
//       const id = data.id;
//       let room = this.buscarRoom(id);
//       if (Util.empty(room)) {
//         room = this.createRoom(id);
//       }
//       this.safeJoin(socket, id, previousId);    
//       this.io
//       .to(data.usuarioOrigen.socket)
//       .emit("addIceCandidate", data);
//     });

//     socket.on("createAnswer", (data: any) => {
//       const id = data.id;
//       let room = this.buscarRoom(id);
//       if (Util.empty(room)) {
//         room = this.createRoom(id);
//       }
//       this.safeJoin(socket, id, previousId);
//       socket.broadcast.emit("createAnswer", {peerServerEmisorReceptor: data.peerServerEmisorReceptor , peerServerEmisorReceptorDesktop: data.peerServerEmisorReceptorDesktop});
//     });

//     socket.on("sendAnswer", (data: any) => {
//       const id = data.id;
//       let room = this.buscarRoom(id);
//       if (Util.empty(room)) {
//         room = this.createRoom(id);
//       }
//       this.safeJoin(socket, id, previousId);
//       this.io
//         .to(data.usuarioOrigen.socket)
//         .emit("sendAnswer", {peerServerEmisorReceptor: data.peerServerEmisorReceptor, peerServerEmisorReceptorDesktop: data.peerServerEmisorReceptorDesktop});
//     });

//     socket.on("connectStateS", (data: any) => {
//       const id = data.id;
//       let room = this.buscarRoom(id);
//       if (Util.empty(room)) {
//         room = this.createRoom(id);
//       }
//       this.safeJoin(socket, id, previousId);
//       this.io
//         .to(data.usuarioOrigen.socket)
//         .emit("connectState", {peerServerEmisorReceptor: data.peerServerEmisorReceptor, peerServerEmisorReceptorDesktop: data.peerServerEmisorReceptorDesktop});
//     });
//   }

//   answer(socket: any, previousId: any) {
//     socket.on("answer", (data: any) => {
//       const id =
//         data.programacion.id + "" + data.programacion.asig_profe_asig.salon.id;
//       this.safeJoin(socket, id, previousId);
//       const usuarioAux = this.buscarUsuario(id, data.usuario);

//       if (usuarioAux !== null && usuarioAux.socket !== null) {
//         this.io.to(usuarioAux.socket).emit("answer", data.peer);
//       }
//     });
//   }
// }
