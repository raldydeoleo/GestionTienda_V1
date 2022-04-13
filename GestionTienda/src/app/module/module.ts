export interface IModule{
    id: number; 
    codigo: string;
    idProceso: number;
    process: object;
    descripcion: string;
    usuarioRegistro: string;  
    usuarioModificacion: string;  
    usuarioEliminacion: string;
    fechaHoraRegistro: Date;
    fechaHoraModificacion: Date;
    numeroModulo: string;
    textoModulo: string;
}
