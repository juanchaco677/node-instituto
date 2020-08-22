"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PeerServer = void 0;
const tslib_1 = require("tslib");
var SimplePeer = require('simple-peer');
var wrtc = require('wrtc');
class PeerServer {
    constructor() {
        this.peerConnection = new SimplePeer({ initiator: true, wrtc: wrtc });
    }
    createOffer() {
        this.peerConnection.on('signal', (data) => {
            this.offer = data;
        });
    }
    sendData(data) {
        this.peerConnection.on('connect', () => {
            // wait for 'connect' event before using the data channel
            this.peerConnection.send(data);
        });
    }
    reciveData() {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            this.peerConnection.on('data', (data) => tslib_1.__awaiter(this, void 0, void 0, function* () {
                console.log('recive peer 2 data : ' + data);
                return data;
            }));
        });
    }
}
exports.PeerServer = PeerServer;
//# sourceMappingURL=peer-server.js.map