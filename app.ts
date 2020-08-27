import { Server } from "./server";
export class Main{
    server: Server = new Server();
    constructor(){}

    main(){
        this.server.init();
    }
}


new Main().main();