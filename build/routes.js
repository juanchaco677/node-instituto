"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Routes = void 0;
const tslib_1 = require("tslib");
const ppt_1 = require("./src/model/ppt");
const child = require("child_process");
class Routes {
    constructor(io, rooms) {
        this.io = io;
        this.rooms = rooms;
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
                cb(null, file.originalname.replace(/ /g, "-").replace("(", "").replace(")", ""));
            },
        });
        this.upload = this.multer({ storage: this.storage });
        this.router.route("/api").get((req, res) => this.get(req, res));
        this.router
            .route("/api/upload-ppt")
            .post(this.upload.single("file-ppt"), (req, res, next) => this.postFiles(req, res, next));
    }
    postFiles(req, res, next) {
        if (req.file !== undefined &&
            req.file.originalname !== undefined &&
            req.body.id !== undefined) {
            const nombreExtension = req.file.originalname
                .replace(/ /g, "-")
                .replace("(", "")
                .replace(")", "");
            const nombre = nombreExtension.indexOf(".pptx") > 0
                ? nombreExtension.replace(".pptx", "")
                : nombreExtension.indexOf(".ppt") > 0
                    ? nombreExtension.replace(".ppt", "")
                    : nombreExtension;
            this.addConverter(req, res, nombreExtension, nombre);
        }
    }
    get(req, res) { }
    addConverter(req, res, nombreExtension, nombre) {
        this.ppt2png(this.path + "/" + nombreExtension, this.path + "/" + req.body.id + "/" + nombre + "/" + nombre, (err) => tslib_1.__awaiter(this, void 0, void 0, function* () {
            if (err) {
                console.log(err);
                res.json({ success: false, file: { nombre, paginas: 0 } });
            }
            else {
                child.exec("ls " + this.path + "/" + req.body.id + "/" + nombre + " | wc -l", (err, stdout, stderr) => {
                    if (err) {
                        res.json({ success: false });
                    }
                    else {
                        const ppt = new ppt_1.PPT(nombre, 0, 0, 0, 0, parseInt(stdout.replace(/\n|\r/g, "")) - 1, JSON.parse(req.body.integrantes), JSON.parse(req.body.permisos).todos);
                        res.json({
                            success: true,
                            file: ppt,
                        });
                        this.rooms[req.body.id].ppts[ppt.nombre] = ppt;
                        this.io.in(this.rooms[req.body.id].id).emit("archivoPpt", ppt);
                    }
                });
            }
        }));
    }
}
exports.Routes = Routes;
//# sourceMappingURL=routes.js.map