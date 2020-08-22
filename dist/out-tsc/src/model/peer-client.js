import { __awaiter } from "tslib";
export class PeerClient {
    constructor() {
        this.config = { iceServers: [{ urls: 'stun:181.55.192.137:3478', username: 'cony',
                    password: 'juancamilo65' }] };
        this.peerConnection = new RTCPeerConnection(this.config);
    }
    addStreamVideo(stream, track) {
        this.peerConnection.addTrack(track, stream);
    }
    createAnswer(localDescription) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.peerConnection.setRemoteDescription(localDescription);
            yield this.peerConnection.setLocalDescription(yield this.peerConnection.createAnswer());
            this.localDescription = this.peerConnection.localDescription;
        });
    }
    createDataChannel(nameChannel) {
        this.dataChannel = this.peerConnection.createDataChannel(nameChannel);
        this.dataChannel.onopen = (event) => {
            if (this.dataChannel) {
                if (this.dataChannel.readyState === 'open') {
                    console.log('canal abierto client');
                }
                else {
                    console.log('canal cerrado client');
                }
            }
        };
        this.dataChannel.onclose = (event) => {
            if (this.dataChannel) {
                if (this.dataChannel.readyState === 'open') {
                    console.log('canal abierto cerrado client');
                }
                else {
                    console.log('canal cerrado cerrado client');
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
//# sourceMappingURL=peer-client.js.map