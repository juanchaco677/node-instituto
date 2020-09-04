import { VideoBoton } from './video-boton';
import { PeerServer } from './peer-server';
import { Usuario } from './usuario';
import { PeerClient } from './peer-client';

export class PeerServerEmisorReceptor {

  constructor(
    public usuario1 ?: Usuario,
    public usuario2 ?: Usuario,
    public peerServer?: PeerServer,
    public peerClient?: PeerClient,
    public videoBoton?: VideoBoton,
    public prioridad?: number,
    public stream?: any,
  ) {
  }
}
