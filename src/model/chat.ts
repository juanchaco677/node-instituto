import { Usuario } from "./usuario";

export class Chat {
    constructor(
        public usuario: Usuario,
        public mensaje: string,
        public hora?: Date
    ) {}
  }
  