import { Server } from "./server";
export class Main {
    constructor() {
        this.server = new Server();
    }
    main() {
        this.server.init();
        this.server.listen();
    }
}
new Main().main();
//# sourceMappingURL=app.js.map