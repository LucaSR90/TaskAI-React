export enum TaskPriority {
  Alta = 'Alta',
  Media = 'Media',
  Baja = 'Baja',
}

export interface Task {
  id: string;
  titulo: string;
  descripcion: string;
  categoria: string;
  prioridad: TaskPriority;
  fechaCreacion: string;
  completada: boolean;
}
