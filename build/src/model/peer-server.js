"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PeerServer = void 0;
const tslib_1 = require("tslib");
class PeerServer {
    constructor() {
        this.config = {
            iceServers: [
                {
                    urls: 'stun:181.55.192.137:3478',
                    username: 'cony',
                    password: 'juancamilo65',
                },
            ],
            sdpSemantics: 'plan-b',
        };
        this.peerConnection = new RTCPeerConnection(this.config);
    }
    createOffer() {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            // try {
            yield this.peerConnection.setLocalDescription(yield this.peerConnection.createOffer());
            this.localDescription = this.peerConnection.localDescription;
            // } catch (error) {}
        });
    }
    addAnswer(localDescription) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            // try {
            yield this.peerConnection.setRemoteDescription(localDescription);
            // } catch (error) {}
        });
    }
    createDataChannel(nameChannel) {
        this.dataChannel = this.peerConnection.createDataChannel(nameChannel);
    }
    send(data) {
        this.dataChannel.send(data);
    }
    closeDataChannel() {
        this.dataChannel.close();
    }
    close() {
        this.peerConnection.close();
    }
}
exports.PeerServer = PeerServer;
//# sourceMappingURL=peer-server.js.map