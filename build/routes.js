"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Routes = void 0;
const tslib_1 = require("tslib");
const ppt_1 = require("./src/model/ppt");
const child = require("child_process");
class Routes {
    constructor(io, room) {
        this.io = io;
        this.room = room;
        this.express = require("express");
        this.ppt2png = require("ppt2png");
        this.multer = require("multer");
        this.path = "/home/cony/angular/instituto-bd/public/archivos/pptx";
        this.router = this.express.Router();
        this.storage = this.multer.diskStorage({
            destination: (req, file, cb) => {
                cb(null, this.path);
            },
            filename: (req, file, cb) => {
                cb(null, file.originalname.replace(" ", "").replace("(", "").replace(")", ""));
            },
        });
        this.upload = this.multer({ storage: this.storage });
        this.router.route("/api").get((req, res) => this.get(req, res));
        this.router
            .route("/api/upload-ppt")
            .post(this.upload.single("file-ppt"), (req, res, next) => this.postFiles(req, res, next));
    }
    postFiles(req, res, next) {
        console.log('ROOM');
        console.log(this.room);
        console.log(this.room[req.body.id]);
        // if (
        //   req.file !== undefined &&
        //   req.file.originalname !== undefined &&
        //   req.body.id !== undefined
        // ) {
        //   const nombreExtension = req.file.originalname
        //     .replace(" ", "")
        //     .replace("(", "")
        //     .replace(")", "");
        //   const nombre =
        //     nombreExtension.indexOf(".pptx") > 0
        //       ? nombreExtension.replace(".pptx", "")
        //       : nombreExtension.indexOf(".ppt") > 0
        //       ? nombreExtension.replace(".ppt", "")
        //       : nombreExtension;
        //   this.addConverter(req, res, nombreExtension, nombre);
        // }
    }
    get(req, res) { }
    addConverter(req, res, nombreExtension, nombre) {
        this.ppt2png(this.path + "/" + nombreExtension, this.path + "/" + req.body.id + "/" + nombre + "/" + nombre, (err) => tslib_1.__awaiter(this, void 0, void 0, function* () {
            if (err) {
                res.json({ success: false, file: { nombre, paginas: 0 } });
            }
            else {
                child.exec("ls " + this.path + "/" + nombre + " | wc -l", (err, stdout, stderr) => {
                    if (err) {
                        res.json({ success: false });
                    }
                    else {
                        const ppt = new ppt_1.PPT(nombre, 0, 0, 1, 0, stdout.replace(/\n|\r/g, ""));
                        res.json({
                            success: true,
                            file: ppt,
                        });
                        if (this.room[req.body.id].ppts === undefined) {
                            this.room[req.body.id].ppts = {};
                        }
                        this.room[req.body.id].ppts[ppt.nombre] = ppt;
                        this.io.in(this.room[req.body.id].id).emit("archivoPpt", ppt);
                    }
                });
            }
        }));
    }
}
exports.Routes = Routes;
//# sourceMappingURL=routes.js.map