var SimplePeer = require('simple-peer')
var wrtc = require('wrtc')
export class PeerClient {
  peerConnection: any;
  answer: any;
  offer: any;
  constructor() {
    this.peerConnection = new SimplePeer({ wrtc: wrtc });
  }

  createAnswer() {
    this.peerConnection.on('signal', (data: any) => {
      this.offer = data;
    });
  }

  sendData(data: any){
    this.peerConnection.on('connect', () => {
      // wait for 'connect' event before using the data channel
      this.peerConnection.send(data);
    });
  }

  async reciveData(){
    this.peerConnection.on('data', async (data: any ) => {
      console.log('recive peer 2 data : ' + data);
      return data;
    });
  }
}
