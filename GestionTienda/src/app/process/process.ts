export interface IProcess{
         id: number;
         codigo: string;
         descripcion: string;
         codigoPermiso: number;
         usuarioRegistro: string;  
         usuarioModificacion: string;  
         usuarioEliminacion: string; 
         fechaHoraRegistro: Date;
         fechaHoraModificacion: Date;
}
