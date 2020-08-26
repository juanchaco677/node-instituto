import { PPT } from "./src/model/ppt";
import { Room } from "./src/model/room";
import * as child from "child_process";

export class Routes {
  express = require("express");
  ppt2png = require("ppt2png");
  multer = require("multer");
  router: any;
  storage: any;
  upload: any;
  path = "/home/cony/angular/instituto-bd/public/archivos/pptx";

  constructor(private io: any, private rooms: {}) {
    this.router = this.express.Router();
    this.storage = this.multer.diskStorage({
      destination: (req: any, file: any, cb: any) => {
        cb(null, this.path);
      },
      filename: (req: any, file: any, cb: any) => {
        cb(
          null,
          file.originalname.replace(/ /g, "-").replace("(", "").replace(")", "")
        );
      },
    });

    this.upload = this.multer({ storage: this.storage });

    this.router.route("/api").get((req: any, res: any) => this.get(req, res));

    this.router
      .route("/api/upload-ppt")
      .post(this.upload.single("file-ppt"), (req: any, res: any, next: any) =>
        this.postFiles(req, res, next)
      );
  }

  postFiles(req: any, res: any, next: any) {
    if (
      req.file !== undefined &&
      req.file.originalname !== undefined &&
      req.body.id !== undefined
    ) {
      const nombreExtension = req.file.originalname
        .replace(/ /g, "-")
        .replace("(", "")
        .replace(")", "");
      const nombre =
        nombreExtension.indexOf(".pptx") > 0
          ? nombreExtension.replace(".pptx", "")
          : nombreExtension.indexOf(".ppt") > 0
          ? nombreExtension.replace(".ppt", "")
          : nombreExtension;
      this.addConverter(req, res, nombreExtension, nombre);
    }
  }
  get(req: any, res: any) {}

  addConverter(req: any, res: any, nombreExtension: string, nombre: string) {
    this.ppt2png(
      this.path + "/" + nombreExtension,
      this.path + "/" + req.body.id + "/" + nombre + "/" + nombre,
      async (err: any) => {
        if (err) {
          console.log(err);
          res.json({ success: false, file: { nombre, paginas: 0 } });
        } else {
          child.exec(
            "ls " + this.path + "/" + req.body.id + "/" + nombre + " | wc -l",
            (err: any, stdout: any, stderr: any) => {
              if (err) {
                res.json({ success: false });
              } else {
                const ppt = new PPT(
                  nombre,
                  0,
                  0,
                  0,
                  0,
                  parseInt(stdout.replace(/\n|\r/g, "")) - 1,
                  JSON.parse(req.body.integrantes),
                  JSON.parse(req.body.permisos).todos
                );
                res.json({
                  success: true,
                  file: ppt,
                });
                this.rooms[req.body.id].ppts[ppt.nombre] = ppt;
                this.io.in(this.rooms[req.body.id].id).emit("archivoPpt", ppt);
              }
            }
          );
        }
      }
    );
  }
}
