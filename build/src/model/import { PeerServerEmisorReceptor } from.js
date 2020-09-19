"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppComponent = void 0;
const tslib_1 = require("tslib");
const peer_server_emisor_receptor_1 = require("./peer-server-emisor-receptor");
const peer_client_1 = require("./peer-client");
const peer_server_1 = require("./peer-server");
const usuario_1 = require("./usuario");
const util_1 = require("./util");
const core_1 = require("@angular/core");
const RecordRTC = require("recordrtc");
let AppComponent = class AppComponent {
    constructor(socket) {
        this.socket = socket;
        this.title = 'clientRecord';
        this.rooms = {};
        this.usuario = new usuario_1.Usuario();
        this.usuario.id = 0;
        this.usuario.rol = { tipo: 'RE' };
        this.socket.emit('livingRoom', { usuario: this.usuario });
    }
    ngOnInit() {
        this.socket.$recibeRecord.subscribe((data) => this.listenRecord(data));
        this.socket.$createAnswer.subscribe((data) => tslib_1.__awaiter(this, void 0, void 0, function* () { return this.createAnswer(data); }));
        this.socket.$stopRecord.subscribe((data) => tslib_1.__awaiter(this, void 0, void 0, function* () { return this.parar(data); }));
    }
    listenRecord(data) {
        if (!util_1.Util.empty(data)) {
        }
    }
    createAnswer(data) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            if (!util_1.Util.empty(data.data)) {
                if (util_1.Util.empty(this.rooms[data.id])) {
                    this.rooms[data.id] = new peer_server_emisor_receptor_1.PeerServerEmisorReceptor(data.usuario1, data.usuario2, new peer_server_1.PeerServer(), new peer_client_1.PeerClient());
                    this.rooms[data.id].peerClientAudio = new peer_client_1.PeerClient();
                }
                if (!data.audio) {
                    this.rooms[data.id].peerClient.createDataChannel('clientRecord');
                }
                else {
                    this.rooms[data.id].peerClientAudio.createDataChannel('clientRecordAudio');
                }
                this.socket.getListenRecord().subscribe((objeto) => {
                    if (!util_1.Util.empty(objeto) && objeto) {
                        this.listenPeer(data);
                    }
                });
                if (data.data.type === 'offer') {
                    console.log('1');
                    this.socket.addListenRecord(true);
                    if (!data.audio) {
                        yield this.rooms[data.id].peerClient.createAnswer(data.data);
                    }
                    else {
                        yield this.rooms[data.id].peerClientAudio.createAnswer(data.data);
                    }
                    this.socket.addListenRecord(true);
                    console.log('el answer es');
                    console.log(this.rooms[data.id].peerClient.localDescription);
                    this.socket.emit('sendAnswer', {
                        data: !data.audio
                            ? this.rooms[data.id].peerClient.localDescription
                            : this.rooms[data.id].peerClient.localDescription,
                        id: data.id,
                        camDesktop: data.camDesktop,
                        usuarioOrigen: data.usuarioDestino,
                        usuarioDestino: data.usuarioOrigen,
                        record: data.record,
                        audio: data.audio,
                    });
                }
                else {
                    if (data.data.candidate) {
                        if (!data.audio) {
                            yield this.rooms[data.id].peerClient.peerConnection.addIceCandidate(data.data);
                        }
                        else {
                            yield this.rooms[data.id].peerClientAudio.peerConnection.addIceCandidate(data.data);
                        }
                    }
                }
            }
        });
    }
    listenPeer(data) {
        if (!util_1.Util.empty(data) && data && !util_1.Util.empty(this.rooms[data.id])) {
            if (!data.audio) {
                this.rooms[data.id].peerClient.peerConnection.ontrack = (event) => this.getRemoteStream(event, data, data.audio);
                this.rooms[data.id].peerClient.peerConnection.onicecandidate = (event) => this.getIceCandidate(event, data);
            }
            else {
                this.rooms[data.id].peerClientAudio.peerConnection.ontrack = (event) => this.getRemoteStream(event, data, data.audio);
                this.rooms[data.id].peerClientAudio.peerConnection.onicecandidate = (event) => this.getIceCandidate(event, data);
            }
        }
    }
    getRemoteStream(ev, data, audio) {
        let stream;
        try {
            if (ev.streams && ev.streams.length > 0) {
                for (const element of ev.streams) {
                    stream = element;
                }
            }
            else {
                const inboundStream = new MediaStream(ev.track);
                stream = inboundStream;
            }
            if (!audio) {
                this.rooms[data.id].stream = stream;
            }
            else {
                this.rooms[data.id].streamAudio = stream;
                if (!util_1.Util.empty(this.rooms[data.id].streamAudio) &&
                    !util_1.Util.empty(this.rooms[data.id].stream)) {
                    this.grabar(data);
                }
            }
            console.log('recibiendo strea ' + data.audio);
        }
        catch (error) { }
    }
    getOnDataChannel(event, data) {
        this.rooms[data.id].receiveChannel = event.channel;
        this.rooms[data.id].receiveChannel.onmessage = (e) => {
            console.log('escuchando data channel');
        };
    }
    getIceCandidate(event, data) {
        if (event.candidate) {
            this.socket.emit('sendAnswer', {
                data: event.candidate,
                id: data.id,
                camDesktop: true,
                usuarioOrigen: data.usuarioDestino,
                usuarioDestino: data.usuarioOrigen,
                audio: data.audio,
                record: data.record
            });
        }
    }
    grabar(data) {
        const options = {
            mimeType: 'video/mp4',
        };
        this.rooms[data.id].recordRTC = RecordRTC([this.rooms[data.id].stream, this.rooms[data.id].streamAudio], options);
        this.rooms[data.id].recordRTC.startRecording();
    }
    parar(data) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            yield this.rooms[data.id].recordRTC.stopRecording(() => {
                const blob = this.rooms[data.id].recordRTC.getBlob();
                this.guardar(data);
            });
        });
    }
    guardar(data) {
        this.rooms[data.id].recordRTC.save('video.mp4');
        this.rooms[data.id].peerClient.close();
        this.rooms[data.id].recordRTC.destroy();
        this.rooms[data.id].recordRTC = null;
        this.rooms[data.id].stream
            .getAudioTracks()
            .forEach((track) => track.stop());
        this.rooms[data.id].stream
            .getVideoTracks()
            .forEach((track) => track.stop());
        delete this.rooms[data.id];
    }
};
AppComponent = tslib_1.__decorate([
    core_1.Component({
        selector: 'app-root',
        templateUrl: './app.component.html',
        styleUrls: ['./app.component.css'],
    })
], AppComponent);
exports.AppComponent = AppComponent;
//# sourceMappingURL=import { PeerServerEmisorReceptor } from.js.map