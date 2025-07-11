export interface Usuario {
  _id: number;
  nombres: string;
  apellidos: string;
  telefono: string;
  foto?: string;
  credencial: {
    correo: string;
    password: string;
  };
  localidad: {
    direccion: string;
    ciudad: string;
    pais: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface LoginCredentials {
  correo: string;
  password: string;
}

export interface RegisterData {
  nombres: string;
  apellidos: string;
  telefono: string;
  foto?: string;
  credencial: {
    correo: string;
    password: string;
  };
  localidad: {
    direccion: string;
    ciudad: string;
    pais: string;
  };
}

export interface Tienda {
  _id: number;
  nombre: string;
  calificacion?: number;
  imagen?: string;
  localidad?: {
    direccion: string;
    ciudad: string;
    pais: string;
  };
  usuario_id?: number;
  createdAt: string;
  updatedAt: string;
}

export interface Producto {
  _id: number;
  nombre: string;
  precio: number;
  descripcion: string;
  categoria: string[];
  imagen?: string;
  tienda_id?: number;
  createdAt: string;
  updatedAt: string;
}

export interface Publicacion {
  _id: number;
  titulo: string;
  descripcion: string;
  fecha: string;
  imagenes: string[];
  tienda_id: number;
  producto_id: number;
}

export interface Comentario {
  _id: number;
  comentario: string;
  fecha: string;
  usuario_id: number;
  publicacion_id: number;
  megusta: number;
  createdAt: string;
  updatedAt: string;
}

export interface Reaccion {
  _id: number;
  reaccion: number; // 1 para like, 0 para dislike
  fecha: string;
  usuario_id: number;
  publicacion_id: number;
  createdAt: string;
  updatedAt: string;
}

export interface APIResponse<T> {
  data: T;
  message?: string;
  error?: string;
}

export interface AuthContextType {
  user: Usuario | null;
  token: string | null;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
  loading: boolean;
  error: string | null;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}