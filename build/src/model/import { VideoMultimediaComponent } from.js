"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BotonesComponent = void 0;
const tslib_1 = require("tslib");
const peer_client_1 = require("src/app/aula-virtual/model/peer-client");
const peer_server_1 = require("src/app/aula-virtual/model/peer-server");
const video_1 = require("./../../../model/video");
const sesion_1 = require("src/app/utils/sesion");
const room_1 = require("./../../../model/room");
const util_1 = require("./../../../../utils/util");
const core_1 = require("@angular/core");
let BotonesComponent = class BotonesComponent {
    constructor(botones, socket, router, snackBar) {
        this.botones = botones;
        this.socket = socket;
        this.router = router;
        this.snackBar = snackBar;
        this.visible = true;
        this.cam = false;
        this.audio = false;
        this.desktop = false;
        this.hand = false;
        this.record = false;
        this.visibleCompartir = false;
        this.sidenaV = false;
        this.visibleComentario = [
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
        ];
        this.room = new room_1.Room(null, {}, [], {}, {}, {}, {});
        this.usuario = sesion_1.Sesion.userAulaChat();
    }
    ngOnInit() {
        this.socket.getRoom$().subscribe((data) => {
            if (!util_1.Util.empty(data) && !util_1.Util.empty(data.id)) {
                this.room = data;
                if (!util_1.Util.empty(this.room.usuarios[this.usuario.id].boton) &&
                    !util_1.Util.empty(this.room.usuarios[this.usuario.id].boton.mano)) {
                    const boton = this.room.usuarios[this.usuario.id].boton;
                    this.hand = boton.mano;
                    this.cam = boton.video;
                    this.audio = boton.audio;
                }
            }
        });
        this.socket.$enviarControlesS.subscribe((data) => this.listenControles(data));
        this.socket.getListenRecord().subscribe((data) => this.listenPeer(data));
    }
    startVideo() {
        this.cam = !this.cam;
        this.botones.add(util_1.Util.video);
    }
    startMic() {
        this.audio = !this.audio;
        this.botones.add(util_1.Util.audio);
    }
    startVideoDesktop() {
        this.desktop = true;
        this.botones.add(util_1.Util.desktop);
    }
    stopVideoDesktop() {
        this.desktop = false;
        this.botones.add(util_1.Util.stopDesktop);
    }
    sidenav() {
        this.sidenaV = !this.sidenaV;
        this.botones.addSidenav(true);
    }
    start(stream, streamAudio) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            for (const track of stream.getTracks()) {
                this.room.peerRecord[1].peerServer.peerConnection.addTrack(track, stream);
            }
            for (const track of streamAudio.getTracks()) {
                this.room.peerRecord[1].peerServerAudio.peerConnection.addTrack(track, streamAudio);
            }
            yield this.room.peerRecord[1].peerServer.createOffer();
            this.room.peerRecord[1].peerClient = new peer_client_1.PeerClient();
            this.socket.emit('createAnswer', {
                data: this.room.peerRecord[1].peerServer.localDescription,
                id: this.room.id,
                camDesktop: true,
                usuarioOrigen: this.room.peerRecord[1].usuario1,
                usuarioDestino: this.room.peerRecord[1].usuario2,
                record: true,
                audio: false,
            });
            yield this.room.peerRecord[1].peerServerAudio.createOffer();
            this.socket.emit('createAnswer', {
                data: this.room.peerRecord[1].peerServerAudio.localDescription,
                id: this.room.id,
                camDesktop: true,
                usuarioOrigen: this.room.peerRecord[1].usuario1,
                usuarioDestino: this.room.peerRecord[1].usuario2,
                record: true,
                audio: true,
            });
        });
    }
    starRecord() {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            this.record = !this.record;
            this.audio = !this.audio;
            if (this.record) {
                util_1.Util.openSnackBarDuration(this.snackBar, 'Grabando Clase...', 1, 'bottom', 2000);
                this.socket.addListenRecord(true);
                this.room.peerRecord[1].peerServer = new peer_server_1.PeerServer();
                this.room.peerRecord[1].peerServerAudio = new peer_server_1.PeerServer();
                this.room.peerRecord[1].peerServer.createDataChannel('recording');
                this.room.peerRecord[1].peerServerAudio.createDataChannel('recordingAudio');
                if (!util_1.Util.empty(this.htmlVideoDesktop) &&
                    !util_1.Util.empty(this.htmlVideoDesktop.videoBoton) &&
                    this.htmlVideoDesktop.videoBoton.desktop &&
                    !util_1.Util.empty(this.htmlVideoDesktop.video.stream) &&
                    !util_1.Util.empty(this.htmlVideoDesktop.video.stream.getVideoTracks()) &&
                    this.htmlVideoDesktop.video.stream.getVideoTracks().length > 0 &&
                    this.htmlVideoDesktop.video.stream.getVideoTracks()[0].getSettings()
                        .displaySurface) {
                    const displaySurface = this.htmlVideoDesktop.video.stream
                        .getVideoTracks()[0]
                        .getSettings().displaySurface;
                    if (displaySurface === 'monitor') {
                        if (!this.videoMultimedia.videoBoton.audio) {
                            this.room.peerRecord[1].streamAudio = yield this.videoMultimedia.video.getUserMedia({
                                video: false,
                                audio: true,
                            });
                        }
                        this.room.peerRecord[1].stream = this.htmlVideoDesktop.video.stream;
                        yield this.start(this.htmlVideoDesktop.video.stream, this.videoMultimedia.video.stream);
                        this.socket.addRoom$(this.room);
                    }
                    else {
                        const video = new video_1.Video(null, null);
                        const audio = new video_1.Video(null, null);
                        audio.audio = true;
                        this.room.peerRecord[1].stream = yield video.getDisplayMedia({
                            video: true,
                            audio: true,
                        });
                        this.room.peerRecord[1].streamAudio = yield audio.getUserMedia({
                            video: false,
                            audio: true,
                        });
                        yield this.start(this.room.peerRecord[1].stream, this.room.peerRecord[1].streamAudio);
                        this.socket.addRoom$(this.room);
                        this.socket.addListenRecord(true);
                    }
                }
                else {
                    const video = new video_1.Video(null, null);
                    const audio = new video_1.Video(null, null);
                    this.room.peerRecord[1].stream = yield video.getDisplayMedia({
                        video: true,
                        audio: true,
                    });
                    audio.audio = true;
                    this.room.peerRecord[1].streamAudio = yield audio.getUserMedia({
                        video: false,
                        audio: true,
                    });
                    console.log('ver para creer');
                    console.log(this.room.peerRecord[1]);
                    yield this.start(this.room.peerRecord[1].stream, this.room.peerRecord[1].streamAudio);
                    this.socket.addRoom$(this.room);
                    this.socket.addListenRecord(true);
                    util_1.Util.openSnackBarDuration(this.snackBar, 'La clase se encuentra grabada correctamente.', 1, 'bottom', 2000);
                }
            }
            else {
                this.room.peerRecord[1].peerServer.close();
                this.room.peerRecord[1].peerServerAudio.close();
                if (!util_1.Util.empty(this.room.peerRecord[1].stream.getAudioTracks()) &&
                    this.room.peerRecord[1].stream.getAudioTracks().length > 0) {
                    this.room.peerRecord[1].stream
                        .getAudioTracks()
                        .forEach((track) => track.stop());
                }
                if (!util_1.Util.empty(this.room.peerRecord[1].streamAudio.getAudioTracks()) &&
                    this.room.peerRecord[1].streamAudio.getAudioTracks().length > 0) {
                    this.room.peerRecord[1].streamAudio
                        .getAudioTracks()
                        .forEach((track) => track.stop());
                }
                this.room.peerRecord[1].stream
                    .getVideoTracks()
                    .forEach((track) => track.stop());
                this.socket.emit('stopRecordS', {
                    id: this.room.id,
                    usuarioDestino: this.room.peerRecord[1].usuario2,
                });
            }
        });
    }
    redistribuir(opcion) {
        this.botones.add(util_1.Util.redistribuir[opcion]);
    }
    cerrar() {
        this.botones.add(util_1.Util.cerrar);
        this.socket.emit('closeUserS', {
            id: this.room.id,
            usuario: this.room.usuarios[this.usuario.id],
        });
        this.router.navigate(['../../../aula-virtual/list-clases']);
    }
    starHand() {
        this.hand = !this.hand;
        this.botones.add(util_1.Util.mano);
    }
    listenControles(data) {
        if (!util_1.Util.empty(data)) {
            switch (data.opcion) {
                case 1:
                    this.cam = true;
                    this.startVideo();
                    break;
                case 2:
                    this.audio = true;
                    this.startMic();
                    break;
                case 3:
                    this.starHand();
                    break;
            }
        }
    }
    listenPeer(data) {
        if (!util_1.Util.empty(data) && data && !util_1.Util.empty(this.peerServer)) {
            this.room.peerRecord[1].peerServer.peerConnection.onicecandidate = (event) => this.getIceCandidate(event, false);
            this.room.peerRecord[1].peerServer.dataChannel.onerror = (error) => {
                console.log('Data Channel Error:', error);
            };
            this.room.peerRecord[1].peerServer.dataChannel.onopen = () => {
                this.peerServer.send('conectados record..');
            };
            this.room.peerRecord[1].peerServer.dataChannel.onclose = () => { };
            this.room.peerRecord[1].peerServer.peerConnection.ondatachannel = () => { };
            this.room.peerRecord[1].peerServerAudio.peerConnection.onicecandidate = (event) => this.getIceCandidate(event, true);
            this.room.peerRecord[1].peerServerAudio.dataChannel.onerror = (error) => {
                console.log('Data Channel Error:', error);
            };
            this.room.peerRecord[1].peerServerAudio.dataChannel.onopen = () => {
                this.peerServer.send('conectados record..');
            };
            this.room.peerRecord[1].peerServerAudio.dataChannel.onclose = () => { };
            this.room.peerRecord[1].peerServerAudio.peerConnection.ondatachannel = () => { };
        }
    }
    getIceCandidate(event, audio) {
        if (event.candidate) {
            this.socket.emit('createAnswer', {
                data: event.candidate,
                id: this.room.id,
                camDesktop: true,
                usuarioOrigen: this.room.peerRecord[1].usuario1,
                usuarioDestino: this.room.peerRecord[1].usuario2,
                record: true,
                audio,
            });
        }
    }
};
tslib_1.__decorate([
    core_1.Input()
], BotonesComponent.prototype, "visible", void 0);
tslib_1.__decorate([
    core_1.Input()
], BotonesComponent.prototype, "htmlListVideo", void 0);
tslib_1.__decorate([
    core_1.Input()
], BotonesComponent.prototype, "htmlVideoDesktop", void 0);
tslib_1.__decorate([
    core_1.Input()
], BotonesComponent.prototype, "videoMultimedia", void 0);
BotonesComponent = tslib_1.__decorate([
    core_1.Component({
        selector: 'app-botones',
        templateUrl: './botones.component.html',
        styleUrls: ['./botones.component.css'],
    })
], BotonesComponent);
exports.BotonesComponent = BotonesComponent;
//# sourceMappingURL=import { VideoMultimediaComponent } from.js.map