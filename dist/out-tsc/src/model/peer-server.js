import { __awaiter } from "tslib";
export class PeerServer {
    constructor() {
        this.config = { iceServers: [{ urls: 'stun:181.55.192.137:3478', username: 'cony',
                    password: 'juancamilo65' }] };
        this.peerConnection = new RTCPeerConnection(this.config);
    }
    createOffer() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.peerConnection.setLocalDescription(yield this.peerConnection.createOffer());
            this.localDescription = this.peerConnection.localDescription;
        });
    }
    addAnswer(localDescription) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.peerConnection.setRemoteDescription(localDescription);
        });
    }
    createDataChannel(nameChannel) {
        this.dataChannel = this.peerConnection.createDataChannel(nameChannel);
        this.dataChannel.onopen = (event) => {
            if (this.dataChannel) {
                if (this.dataChannel.readyState === 'open') {
                    console.log('canal abierto server');
                }
                else {
                    console.log('canal cerrado server');
                }
            }
        };
        this.dataChannel.onclose = (event) => {
            if (this.dataChannel) {
                if (this.dataChannel.readyState === 'open') {
                    console.log('canal abierto cerrado server');
                }
                else {
                    console.log('canal cerrado cerrado server');
                }
            }
        };
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
//# sourceMappingURL=peer-server.js.map