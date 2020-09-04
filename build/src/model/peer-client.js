"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PeerClient = void 0;
const tslib_1 = require("tslib");
class PeerClient {
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
        this.peerConnection = new RTCPeerConnection();
    }
    addStreamVideo(stream, track) {
        this.peerConnection.addTrack(track, stream);
    }
    createAnswer(localDescription) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            // try {
            yield this.peerConnection.setRemoteDescription(localDescription);
            yield this.peerConnection.setLocalDescription(yield this.peerConnection.createAnswer());
            this.localDescription = this.peerConnection.localDescription;
            // } catch (error) {}
        });
    }
    createDataChannel(nameChannel) {
        this.dataChannel = this.peerConnection.createDataChannel(nameChannel);
    }
    send(data) {
        this.dataChannel.send(data);
    }
    closeSendDataChannel() {
        this.dataChannel.close();
    }
    closeReciveDataChannel() {
        this.receiveChannel.close();
    }
    close() {
        this.peerConnection.close();
    }
}
exports.PeerClient = PeerClient;
//# sourceMappingURL=peer-client.js.map