import { Server } from "./server";
export class Main{
    server: Server = new Server();
    constructor(){}

    main(){
        this.server.init();
        this.server.listen();
    }
}


new Main().main();