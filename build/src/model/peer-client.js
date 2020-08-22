"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PeerClient = void 0;
const tslib_1 = require("tslib");
var SimplePeer = require('simple-peer');
var wrtc = require('wrtc');
class PeerClient {
    constructor() {
        this.peerConnection = new SimplePeer({ wrtc: wrtc });
    }
    createAnswer() {
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
exports.PeerClient = PeerClient;
//# sourceMappingURL=peer-client.js.map