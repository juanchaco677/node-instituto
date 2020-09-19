import { PPT } from './ppt';
import { PeerServerEmisorReceptor } from './peer-server-emisor-receptor';
import { Chat } from './chat';
import { Usuario } from './usuario';
export class Room{
    constructor(
        public id: string,
        public usuarios: {},
        public chat: Chat[],
        public ppts?: {}, 
        public peerServerEmisorReceptor?: {},
        public peerServerEmisorReceptorDesktop?: {},
        public peerRecord?: {},
        public videos?: {}
    ){

    }

}