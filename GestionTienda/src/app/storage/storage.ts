export interface IStorage {
  id: number;
  codigo: string;
  descripcion: string;
  fechaHoraRegistro: Date;
  fechaHoraModificacion: Date;
  fechaHoraBorrado: Date;
  usuarioRegistro: string;
  usuarioModificacion: string;
  usuarioBorrado: string;
  estaBorrado: boolean;
}
