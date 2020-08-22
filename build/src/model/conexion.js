"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Chat = void 0;
class Chat {
    constructor() {
        this.sqlite3 = require('sqlite3');
    }
    init() {
        this.db = new this.sqlite3.Database('/home/cony/angular/sql-lite/chat-instituto.db');
    }
    close() {
        this.db.close();
    }
}
exports.Chat = Chat;
//# sourceMappingURL=conexion.js.map