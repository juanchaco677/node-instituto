import { Util } from "./src/util";
import { Room } from "./src/model/room";
export class Server {
    constructor() {
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
    }
    buscarUsuario(id, usuario) {
        const roomS = this.buscarRoom(id);
        if (roomS !== null) {
            for (const user of roomS.usuarios) {
                if (user.id === usuario.id) {
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
        const room = new Room(id, [], [], []);
        this.rooms.push(room);
        return room;
    }
    livingRoom(socket, previousId) {
        socket.on("livingRoom", (data) => {
            if (data.usuario.rol.tipo === "ES" || data.usuario.rol.tipo === "PR") {
                const id = data.programacion.id +
                    "" +
                    data.programacion.asig_profe_asig.salon.id;
                console.log("ID ROOM");
                console.log(id);
                let room = this.buscarRoom(id);
                if (Util.empty(room)) {
                    room = this.createRoom(id);
                }
                console.log("usuarios conectandose " + data.usuario.nombre);
                if (!Util.empty(this.buscarUsuario(id, data.usuario))) {
                    console.log("usuario existente tratando de conectarse..");
                    console.log("id - previus id " + id + " - " + previousId.id);
                    console.log(room);
                    this.safeJoin(socket, id, previousId);
                    socket.broadcast.emit("addUsuario", data.usuario);
                    this.io.emit("room", room);
                }
                else {
                    console.log("nuevo usuario ..");
                    console.log(room);
                    if (room !== null) {
                        data.usuario.socket = socket.id;
                        room.usuarios.push(data.usuario);
                        this.safeJoin(socket, id, previousId);
                        // socket.broadcast.emit("addUsuario", data.usuario);
                        console.log("enviando ando..");
                        console.log(room);
                        socket.broadcast.emit("addUsuario", data.usuario);
                        this.io.emit("room", room);
                        console.log("emitiendo el room");
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
            // console.log('nuevo usuario');
            let previousId = { id: "" };
            this.livingRoom(socket, previousId);
            this.answer(socket, previousId);
            this.connectionPeer(socket, previousId);
        });
    }
    connectionPeer(socket, previousId) {
        // socket.on("createOffer", (data: any) => {
        //     socket.emit('generateOffer',data);
        // });
        socket.on("createAnswer", (data) => {
            console.log("createAnswer");
            console.log("programacion");
            console.log(data.id);
            const id = data.id;
            let room = this.buscarRoom(id);
            if (Util.empty(room)) {
                room = this.createRoom(id);
            }
            this.safeJoin(socket, id, previousId);
            let peerServerEmisorReceptor = data.peerServerEmisorReceptor;
            for (const [index, element] of room.peerServerEmisorReceptor.entries()) {
                for (const emiRecep of peerServerEmisorReceptor) {
                    if (element.emisor.id === emiRecep.emisor.id &&
                        element.receptor.id === emiRecep.receptor.id) {
                        room.peerServerEmisorReceptor.splice(index, 1);
                    }
                }
            }
            room.peerServerEmisorReceptor = room.peerServerEmisorReceptor.concat(peerServerEmisorReceptor);
            console.log('visualizar');
            console.log(room.peerServerEmisorReceptor);
            socket.broadcast.emit("createAnswer", room.peerServerEmisorReceptor);
        });
        socket.on("sendAnswer", (data) => {
            console.log("sendAnswer");
            console.log("programacion");
            console.log(data.id);
            const id = data.id;
            console.log("ID ROOM");
            console.log(id);
            let room = this.buscarRoom(id);
            if (Util.empty(room)) {
                room = this.createRoom(id);
            }
            this.safeJoin(socket, id, previousId);
            let peer = data.peerServerEmisorReceptor;
            for (const p of peer) {
                console.log(p.peerServer);
            }
            socket.broadcast.emit("sendAnswer", peer);
        });
        // socket.on("sendOffer",(data: any) => {
        //     this.io.emit('reciveOffer',data);
        // });
        // socket.on("sendAnswer",(data: any) => {
        //     this.io.emit('reciveAnswer',data);
        // });
    }
    answer(socket, previousId) {
        socket.on("answer", (data) => {
            console.log(data);
            console.log(data.peer.answer);
            console.log("entro a redireccionar el answer");
            const id = data.programacion.id + "" + data.programacion.asig_profe_asig.salon.id;
            this.safeJoin(socket, id, previousId);
            const usuarioAux = this.buscarUsuario(id, data.usuario);
            if (usuarioAux !== null && usuarioAux.socket !== null) {
                console.log("enviando answer.. al servidor profesor");
                console.log(usuarioAux.socket);
                this.io.to(usuarioAux.socket).emit("answer", data.peer);
            }
        });
    }
}
//# sourceMappingURL=server.js.map