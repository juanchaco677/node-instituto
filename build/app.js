"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Main = void 0;
const server_1 = require("./server");
class Main {
    constructor() {
        this.server = new server_1.Server();
    }
    main() {
        this.server.init();
    }
}
exports.Main = Main;
new Main().main();
//# sourceMappingURL=app.js.map