export class Chat {
    sqlite3 = require('sqlite3');
    db: any;
    constructor(
        
    ) {}


    init(){
        this.db = new this.sqlite3.Database('/home/cony/angular/sql-lite/chat-instituto.db');
    }

    close(){
        this.db.close();
    }
  }
  