
export interface IShift{
    id: number;
    codigo: string;
    descripcion: string;
    horaInicio: string;
    horaFin: string;
    fechaHoraRegistro: Date;
    fechaHoraModificacion: Date;
    fechaHoraBorrado: Date;
    usuarioRegistro: string; 
    usuarioModificacion: string;  
    usuarioBorrado: string; 
    estaBorrado: boolean;
    letraRepresentacion: string;
}
