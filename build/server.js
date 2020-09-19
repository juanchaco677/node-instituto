"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Server = void 0;
const routes_1 = require("./routes");
const peer_server_emisor_receptor_1 = require("./src/model/peer-server-emisor-receptor");
const util_1 = require("./src/util");
const usuario_1 = require("./src/model/usuario");
const room_1 = require("./src/model/room");
const video_boton_1 = require("./src/model/video-boton");
class Server {
    constructor() {
        this.cors = require("cors");
        this.app = require("express")();
        this.http = require("http").Server(this.app);
        this.io = require("socket.io")(this.http);
        this.publicDir = `${__dirname}/src`;
        this.port = process.env.PORT || 4444;
        this.rooms = {};
        this.usuario = new usuario_1.Usuario();
        this.colores = {
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
    }
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
        this.routes = new routes_1.Routes(this.io, this.rooms); //rutas
        this.addCorsRoute(); // adiciona a las rutas los cors
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
        const roomS = this.getRoom(id);
        if (roomS !== null) {
            for (const key in roomS.usuarios) {
                if (roomS.usuarios[key].id === usuario.id) {
                    if (!util_1.Util.empty(socket)) {
                        roomS.usuarios[key].socket = socket.id;
                    }
                    return roomS.usuarios[key];
                }
            }
        }
        return null;
    }
    getRoom(id) {
        return this.rooms[id];
    }
    /**
     * función que crea los room de acuerdo al id
     * @param id
     */
    createRoom(id) {
        const room = new room_1.Room(id, {}, [], {}, {}, {}, {}, {});
        this.rooms[id] = room;
        return room;
    }
    /**
     * función que contiene la logica para el ingreso de usuarios a los room
     * @param socket
     */
    livingRoom(socket, idAntes) {
        socket.on("livingRoom", (data) => {
            if (data.usuario.rol.tipo === "ES" || data.usuario.rol.tipo === "PR") {
                const id = data.programacion.id +
                    "" +
                    data.programacion.salon.id;
                let room = this.getRoom(id);
                if (util_1.Util.empty(room)) {
                    room = this.createRoom(id);
                }
                data.usuario.socket = socket.id;
                data.usuario.color = this.colores[Math.floor(Math.random() * 17 + 1)];
                const bUsuario = this.buscarUsuario(id, data.usuario, socket);
                if (!util_1.Util.empty(bUsuario)) {
                    this.safeJoin(socket, idAntes, id);
                    const emiRecep = {};
                    const emiRecepDesktop = {};
                    for (const key in room.peerServerEmisorReceptor) {
                        if (room.peerServerEmisorReceptor[key].usuario1.id ===
                            data.usuario.id ||
                            room.peerServerEmisorReceptor[key].usuario2.id === data.usuario.id) {
                            let newObject = new peer_server_emisor_receptor_1.PeerServerEmisorReceptor(room.peerServerEmisorReceptor[key].usuario1, room.peerServerEmisorReceptor[key].usuario2, null, null, new video_boton_1.VideoBoton(false, false, false, false, false));
                            let newObjectDesktop = new peer_server_emisor_receptor_1.PeerServerEmisorReceptor(room.peerServerEmisorReceptor[key].usuario1, room.peerServerEmisorReceptor[key].usuario2, null, null, new video_boton_1.VideoBoton(false, false, false, false, false));
                            emiRecep[key] = newObject;
                            emiRecepDesktop[key] = newObjectDesktop;
                        }
                    }
                    let boton = this.rooms[id].usuarios[data.usuario.id].boton;
                    this.rooms[id].usuarios[data.usuario.id].boton = new video_boton_1.VideoBoton(false, false, false, false, boton.mano);
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
                else {
                    if (room !== null) {
                        data.usuario.socket = socket.id;
                        data.usuario.color = this.colores[Math.floor(Math.random() * 17 + 1)];
                        room.usuarios[data.usuario.id] = data.usuario;
                        if (util_1.Util.empty(room.peerRecord[1])) {
                            room.peerRecord[1] = new peer_server_emisor_receptor_1.PeerServerEmisorReceptor(data.usuario, this.usuario);
                        }
                        this.safeJoin(socket, idAntes, id);
                        const emiRecep = {};
                        const emiRecepDesktop = {};
                        for (const key in room.usuarios) {
                            if (room.usuarios[key].id !== data.usuario.id) {
                                let newObject = new peer_server_emisor_receptor_1.PeerServerEmisorReceptor(room.usuarios[key], data.usuario, null, null, new video_boton_1.VideoBoton(false, false, false, false, false));
                                let newObjectDesktop = new peer_server_emisor_receptor_1.PeerServerEmisorReceptor(room.usuarios[key], data.usuario, null, null, new video_boton_1.VideoBoton(false, false, false, false, false));
                                emiRecep["P" + data.usuario.id + "" + room.usuarios[key].id] = newObject;
                                emiRecepDesktop["P" + data.usuario.id + "" + room.usuarios[key].id] = newObjectDesktop;
                                room.peerServerEmisorReceptor["P" + data.usuario.id + "" + room.usuarios[key].id] = newObject;
                                room.peerServerEmisorReceptorDesktop["P" + data.usuario.id + "" + room.usuarios[key].id] = newObjectDesktop;
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
            else {
                if (data.usuario.rol.tipo === "RE" && data.usuario.id === 0) {
                    this.usuario = data.usuario;
                    this.usuario.socket = socket.id;
                    for (const key in this.rooms) {
                        this.rooms[key].peerRecord[1] = new peer_server_emisor_receptor_1.PeerServerEmisorReceptor(this.rooms[key].peerRecord[1].usuario1, this.usuario);
                    }
                    socket.broadcast.emit('addRecordClient', this.usuario);
                }
            }
        });
    }
    /**
     * función para salir y entrar a una sala room
     * @param socket
     * @param id
     */
    safeJoin(socket, idAntes, id) {
        socket.leave(idAntes.id);
        socket.join(id);
        idAntes.id = id;
    }
    /**
     * función principal para iniciar la escucha socket io
     */
    listen() {
        this.io.on("connection", (socket) => {
            const idAntes = { id: "" };
            this.livingRoom(socket, idAntes);
            this.connectionPeer(socket, idAntes);
            this.paginacionPPT(socket, idAntes);
            this.chatMessage(socket, idAntes);
            this.recibirBotonesS(socket, idAntes);
            this.controlesUsuarios(socket, idAntes);
            this.closeUser(socket);
            this.closeRecord(socket);
        });
    }
    closeRecord(socket) {
        socket.on("stopRecordS", (data) => {
            this.io.to(data.usuarioDestino.socket).emit("stopRecord", data);
        });
    }
    /**
     * hilos de escucha para las conexiones rtc peer
     * @param socket
     */
    connectionPeer(socket, idAntes) {
        socket.on("createAnswer", (data) => {
            this.io.to(data.usuarioDestino.socket).emit("createAnswer", data);
        });
        socket.on("sendAnswer", (data) => {
            // this.safeJoin(socket, idAntes, data.id);
            this.io.to(data.usuarioDestino.socket).emit("sendAnswer", data);
        });
    }
    /**
     * hilos de escucha para las conexiones rtc peer
     * @param socket
     */
    paginacionPPT(socket, idAntes) {
        socket.on("recibePaginationS", (data) => {
            // this.safeJoin(socket, idAntes, data.id);
            socket.to(data.id).emit("recibePaginationC", data.ppt);
        });
        socket.on("eliminarPPTS", (data) => {
            delete this.rooms[data.id].ppts[data.key];
            // this.safeJoin(socket, idAntes, data.id);
            socket.to(data.id).emit("eliminarPPTC", data.ppt);
        });
    }
    chatMessage(socket, idAntes) {
        socket.on("chatMessageS", (data) => {
            // this.safeJoin(socket, idAntes, data.id);
            this.rooms[data.id].chat.push(data.chat);
            this.io.in(data.id).emit("chatMessageC", data);
        });
    }
    recibirBotonesS(socket, idAntes) {
        socket.on("recibirBotonesS", (data) => {
            // this.safeJoin(socket, idAntes, data.id);
            this.rooms[data.id].usuarios[data.usuario.id].boton = data.usuario.boton;
            this.io.in(this.rooms[data.id].id).emit("enviarBotonesC", data);
        });
    }
    controlesUsuarios(socket, idAntes) {
        socket.on("recibirControlesS", (data) => {
            // this.safeJoin(socket, idAntes, data.id);
            this.io
                .to(this.rooms[data.id].usuarios[data.usuario.id].socket)
                .emit("enviarControlesS", data);
        });
    }
    closeUser(socket) {
        socket.on("closeUserS", (data) => {
            for (const key in this.rooms[data.id].usuarios) {
                if (this.rooms[data.id].usuarios[key].id === data.usuario.id) {
                    delete this.rooms[data.id].usuarios[key];
                }
            }
            for (const key in this.rooms[data.id].peerServerEmisorReceptor) {
                if (this.rooms[data.id].peerServerEmisorReceptor[key].usuario1.id ===
                    data.usuario.id ||
                    this.rooms[data.id].peerServerEmisorReceptor[key].usuario2.id ===
                        data.usuario.id) {
                    delete this.rooms[data.id].peerServerEmisorReceptor[key];
                }
            }
            for (const key in this.rooms[data.id].peerServerEmisorReceptorDesktop) {
                if (this.rooms[data.id].peerServerEmisorReceptorDesktop[key].usuario1
                    .id === data.usuario.id ||
                    this.rooms[data.id].peerServerEmisorReceptorDesktop[key].usuario2
                        .id === data.usuario.id) {
                    delete this.rooms[data.id].peerServerEmisorReceptorDesktop[key];
                }
            }
            socket.to(data.id).emit("closeUserC", data);
            socket.disconnect();
        });
    }
    archivosBiblioteca(socket) {
        socket.on("archivosBibliotecaS", (data) => {
            this.rooms[data.id].videos[data.biblioteca.id] = data.biblioteca;
            socket.to(data.id).emit("archivosBibliotecaC", data);
        });
    }
}
exports.Server = Server;
//# sourceMappingURL=server.js.map