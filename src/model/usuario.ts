import { VideoBoton } from './video-boton';
import { Rol } from "./rol";
export class Usuario { 
    constructor(
      public email?: string,
      public id?: number,
      public nombre?: string,
      public nombre_uno?: string,
      public nombre_dos?: string,
      public apellido_uno?: string,
      public apellido_dos?: string,
      public tipo?: string,
      public cedula?: string,
      public foto?: string,
      public sex?: string,
      public rol?: Rol,
      public socket?: any,
      public color?: string,
      public boton?: VideoBoton
    ) {
    }
  }