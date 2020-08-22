"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Server = void 0;
const routes_1 = require("./routes");
const peer_server_emisor_receptor_1 = require("./src/model/peer-server-emisor-receptor");
const util_1 = require("./src/util");
const room_1 = require("./src/model/room");
const video_boton_1 = require("./src/model/video-boton");
class Server {
    constructor() {
        this.path = require("path");
        this.cors = require("cors");
        this.app = require("express")();
        this.http = require("http").Server(this.app);
        this.io = require("socket.io")(this.http);
        this.publicDir = `${__dirname}/src`;
        this.port = process.env.PORT || 4444;
        this.rooms = [];
    }
    init() {
        this.http.listen(this.port, "192.168.0.17", () => {
            console.log("Iniciando Express y Socket.IO en localhost:%d", this.port);
        });
        this.listen();
        this.routes = new routes_1.Routes(this.io, this.rooms);
        this.addCorsRoute();
    }
    addCorsRoute() {
        var originsWhitelist = [
            "http://localhost:4200",
            "http://181.55.192.137:4200",
        ];
        var corsOptions = {
            origin: function (origin, callback) {
                var isWhitelisted = originsWhitelist.indexOf(origin) !== -1;
                callback(null, isWhitelisted);
            },
            credentials: true,
        };
        this.app.use(this.cors(corsOptions), this.routes.router);
    }
    buscarUsuario(id, usuario, socket) {
        const roomS = this.buscarRoom(id);
        if (roomS !== null) {
            for (const user of roomS.usuarios) {
                if (user.id === usuario.id) {
                    if (!util_1.Util.empty(socket)) {
                        user.socket = socket.id;
                    }
                    return user;
                }
            }
        }
        return null;
    }
    buscarRoom(id) {
        for (const room of this.rooms) {
            if (room.id === id) {
                return room;
            }
        }
        return null;
    }
    createRoom(id) {
        const room = new room_1.Room(id, [], [], {}, {}, {});
        this.rooms.push(room);
        return room;
    }
    livingRoom(socket, previousId) {
        socket.on("livingRoom", (data) => {
            if (data.usuario.rol.tipo === "ES" || data.usuario.rol.tipo === "PR") {
                const id = data.programacion.id +
                    "" +
                    data.programacion.asig_profe_asig.salon.id;
                let room = this.buscarRoom(id);
                if (util_1.Util.empty(room)) {
                    room = this.createRoom(id);
                }
                data.usuario.socket = socket.id;
                const bUsuario = this.buscarUsuario(id, data.usuario, socket);
                if (!util_1.Util.empty(bUsuario)) {
                    this.safeJoin(socket, id, previousId);
                    const emiRecep = {};
                    const emiRecepDesktop = {};
                    for (const key in room.peerServerEmisorReceptor) {
                        if (room.peerServerEmisorReceptor[key].usuario1.id ===
                            data.usuario.id ||
                            room.peerServerEmisorReceptor[key].usuario2.id === data.usuario.id) {
                            let newObject = new peer_server_emisor_receptor_1.PeerServerEmisorReceptor(room.peerServerEmisorReceptor[key].usuario1, room.peerServerEmisorReceptor[key].usuario2, null, null, new video_boton_1.VideoBoton(false, false, false, false));
                            let newObjectDesktop = new peer_server_emisor_receptor_1.PeerServerEmisorReceptor(room.peerServerEmisorReceptor[key].usuario1, room.peerServerEmisorReceptor[key].usuario2, null, null, new video_boton_1.VideoBoton(false, false, false, false));
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
                }
                else {
                    if (room !== null) {
                        data.usuario.socket = socket.id;
                        room.usuarios.push(data.usuario);
                        this.safeJoin(socket, id, previousId);
                        const emiRecep = {};
                        const emiRecepDesktop = {};
                        for (const element of room.usuarios) {
                            if (element.id !== data.usuario.id) {
                                let newObject = new peer_server_emisor_receptor_1.PeerServerEmisorReceptor(element, data.usuario, null, null, new video_boton_1.VideoBoton(false, false, false, false));
                                let newObjectDesktop = new peer_server_emisor_receptor_1.PeerServerEmisorReceptor(element, data.usuario, null, null, new video_boton_1.VideoBoton(false, false, false, false));
                                emiRecep["P" + data.usuario.id + "" + element.id] = newObject;
                                emiRecepDesktop["P" + data.usuario.id + "" + element.id] = newObjectDesktop;
                                room.peerServerEmisorReceptor["P" + data.usuario.id + "" + element.id] = newObject;
                                room.peerServerEmisorReceptorDesktop["P" + data.usuario.id + "" + element.id] = newObjectDesktop;
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
    safeJoin(socket, id, previousId) {
        socket.leave(previousId.id);
        socket.join(id);
        previousId.id = id;
    }
    listen() {
        this.io.on("connection", (socket) => {
            let previousId = { id: "" };
            this.livingRoom(socket, previousId);
            // this.answer(socket, previousId);
            this.connectionPeer(socket, previousId);
        });
    }
    connectionPeer(socket, previousId) {
        socket.on("addIceCandidate", (data) => {
            const id = data.id;
            let room = this.buscarRoom(id);
            if (util_1.Util.empty(room)) {
                room = this.createRoom(id);
            }
            this.safeJoin(socket, id, previousId);
            this.io.to(data.usuarioOrigen.socket).emit("addIceCandidate", data);
        });
        socket.on("createAnswer", (data) => {
            const id = data.id;
            let room = this.buscarRoom(id);
            if (util_1.Util.empty(room)) {
                room = this.createRoom(id);
            }
            this.safeJoin(socket, id, previousId);
            this.io.to(data.usuarioDestino.socket).emit("createAnswer", data);
        });
        socket.on("sendAnswer", (data) => {
            const id = data.id;
            let room = this.buscarRoom(id);
            if (util_1.Util.empty(room)) {
                room = this.createRoom(id);
            }
            this.safeJoin(socket, id, previousId);
            this.io.to(data.usuarioDestino.socket).emit("sendAnswer", data);
        });
        socket.on("connectStateS", (data) => {
            const id = data.id;
            let room = this.buscarRoom(id);
            if (util_1.Util.empty(room)) {
                room = this.createRoom(id);
            }
            this.safeJoin(socket, id, previousId);
            this.io.to(data.usuarioOrigen.socket).emit("connectState", {
                peerServerEmisorReceptor: data.peerServerEmisorReceptor,
                peerServerEmisorReceptorDesktop: data.peerServerEmisorReceptorDesktop,
            });
        });
    }
    answer(socket, previousId) {
        socket.on("answer", (data) => {
            const id = data.programacion.id + "" + data.programacion.asig_profe_asig.salon.id;
            this.safeJoin(socket, id, previousId);
            const usuarioAux = this.buscarUsuario(id, data.usuario);
            if (usuarioAux !== null && usuarioAux.socket !== null) {
                this.io.to(usuarioAux.socket).emit("answer", data.peer);
            }
        });
    }
}
exports.Server = Server;
//# sourceMappingURL=server.js.map