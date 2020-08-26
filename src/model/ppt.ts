export class PPT {
  constructor(
    public nombre: string,
    public pagIni: number,
    public pagAnt: number,
    public pagSig: number,
    public pagAct: number,
    public pagTot: number,
    public integrantes?: {},
    public todos?: boolean
  ) {}
}
