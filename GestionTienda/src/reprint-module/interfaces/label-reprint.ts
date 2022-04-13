import { NgbDate } from "@ng-bootstrap/ng-bootstrap";

export interface ILabelReprint{
    id:number,
    produccionId: number,
    codigoSap: string,
    descripcionProducto:string,
    cantidadImpresa:number,
    fechaHoraCalendario: Date,
    fechaProduccion:NgbDate,
    usuarioGeneracion: string,
    configuracionEtiquetaId: number,
    almacenamiento: string,
    idModulo: number,
    idTurno:number,
    cantidadCigarros: number,
    totalReimpresiones: number,
    labelConfig: ILabelConfig
}

export interface ILabelConfig{
    id: number,
    idPais: string,
    llevaLogo: boolean,
    llevaTextoInferior: boolean,
    textoCantidad: string,
    textoPais: string,
    tipoEtiqueta: string
}

