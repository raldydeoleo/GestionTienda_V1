export interface ISchedule{
    id: number,
    fechaProduccion: Date,
    idProceso: number,
    idModulo: number,
    idTurno: number,
    idProducto: string,
    usuarioProgramacion: string,
    module: object,
    process: object,
    product: object
    shift: object,
    finalizado: boolean,
    usuarioFinalizado: string,
    fechaHoraFinalizado: Date
}
