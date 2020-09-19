"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Room = void 0;
class Room {
    constructor(id, usuarios, chat, ppts, peerServerEmisorReceptor, peerServerEmisorReceptorDesktop, peerRecord, videos) {
        this.id = id;
        this.usuarios = usuarios;
        this.chat = chat;
        this.ppts = ppts;
        this.peerServerEmisorReceptor = peerServerEmisorReceptor;
        this.peerServerEmisorReceptorDesktop = peerServerEmisorReceptorDesktop;
        this.peerRecord = peerRecord;
        this.videos = videos;
    }
}
exports.Room = Room;
//# sourceMappingURL=room.js.map