
export class PeerServer {
  config = {
    iceServers: [
      {
        urls: 'stun:181.55.192.137:3478',
        username: 'cony',
        password: 'juancamilo65',
      },
    ],
    sdpSemantics: 'plan-b',
  };
  peerConnection: webkitRTCPeerConnection;
  offer: any;
  dataChannel: any;
  localDescription: any;
  receiveChannel: any;
  constructor() {
    this.peerConnection = new RTCPeerConnection(this.config);
  }

  async createOffer() {
    // try {
      await this.peerConnection.setLocalDescription(
        await this.peerConnection.createOffer()
      );
      this.localDescription = this.peerConnection.localDescription;
    // } catch (error) {}
  }

  async addAnswer(localDescription: any) {
    // try {
      await this.peerConnection.setRemoteDescription(localDescription);
    // } catch (error) {}
  }

  createDataChannel(nameChannel: string) {
    this.dataChannel = this.peerConnection.createDataChannel(nameChannel);
  }

  send(data: any) {
    this.dataChannel.send(data);
  }

  closeDataChannel() {
    this.dataChannel.close();
  }


  close() {
    this.peerConnection.close();
  }
}
