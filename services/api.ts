import { 
  Usuario, 
  LoginCredentials, 
  RegisterData, 
  Tienda, 
  Producto, 
  Publicacion, 
  Comentario, 
  Reaccion,
  APIResponse,
  PaginatedResponse
} from '@/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || '/api/backend';

// Configuración base para fetch
const createFetchOptions = (options: RequestInit = {}): RequestInit => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('craftica_token') : null;
  
  return {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
  };
};

// Función helper para manejar respuestas
const handleResponse = async <T>(response: Response): Promise<T> => {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
  }
  return response.json();
};

// Función helper para manejar errores de red
const handleNetworkError = (error: any): never => {
  console.error('Network error:', error);
  if (error.name === 'TypeError' && error.message.includes('fetch')) {
    throw new Error('Error de conexión con el servidor. Verifica tu conexión a internet.');
  }
  if (error.message && error.message.includes('SSL')) {
    throw new Error('Error de conexión SSL. El servidor no está disponible con HTTPS.');
  }
  throw error;
};

// Auth API
export const authAPI = {
  login: async (credentials: LoginCredentials): Promise<APIResponse<{ token: string; user: Usuario }>> => {
    try {
    const response = await fetch(`${API_BASE_URL}/usuarios/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
    });
    
    const data = await response.json();
    
    // Transformar la respuesta del backend al formato esperado por el frontend
    if (data.status === "Usuario logueado") {
      return {
        data: {
          token: "temp_token", // El backend no devuelve token, usar uno temporal
          user: data.user
        }
      };
    } else {
      throw new Error(data.status || 'Error en el login');
      }
    } catch (error) {
      return handleNetworkError(error);
    }
  },

  register: async (data: RegisterData): Promise<APIResponse<Usuario>> => {
    const response = await fetch(`${API_BASE_URL}/usuarios`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },

  getProfile: async (id: string): Promise<APIResponse<Usuario>> => {
    const response = await fetch(`${API_BASE_URL}/usuarios/${id}`, createFetchOptions());
    return handleResponse(response);
  },

  updateProfile: async (id: string, data: Partial<Usuario>): Promise<APIResponse<Usuario>> => {
    const response = await fetch(`${API_BASE_URL}/usuarios/${id}`, 
      createFetchOptions({
        method: 'PUT',
        body: JSON.stringify(data),
      })
    );
    return handleResponse(response);
  },
};

// Tiendas API
export const tiendasAPI = {
  getAll: async (params?: { page?: number; limit?: number; ciudad?: string; pais?: string; usuario_id?: number }): Promise<PaginatedResponse<Tienda>> => {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.limit) searchParams.append('limit', params.limit.toString());
    if (params?.ciudad) searchParams.append('ciudad', params.ciudad);
    if (params?.pais) searchParams.append('pais', params.pais);
    if (params?.usuario_id) searchParams.append('usuario_id', params.usuario_id.toString());
    
    const response = await fetch(`${API_BASE_URL}/tiendas?${searchParams}`, createFetchOptions());
    const data = await response.json();
    
    // El backend puede devolver un array o un objeto con error
    if (Array.isArray(data)) {
      return {
        data: data,
        total: data.length,
        page: params?.page || 1,
        limit: params?.limit || 10,
        totalPages: Math.ceil(data.length / (params?.limit || 10))
      };
    } else if (data.error) {
      // Si hay un error, devolver array vacío
      return {
        data: [],
        total: 0,
        page: params?.page || 1,
        limit: params?.limit || 10,
        totalPages: 0
      };
    }
    
    return data;
  },

  getById: async (id: string): Promise<APIResponse<Tienda>> => {
    const response = await fetch(`${API_BASE_URL}/tiendas/${id}`, createFetchOptions());
    const data = await response.json();
    
    // El backend devuelve directamente el objeto de la tienda
    if (data._id) {
      return { data };
    } else {
      throw new Error('Tienda no encontrada');
    }
  },

  create: async (data: Omit<Tienda, '_id' | 'createdAt' | 'updatedAt'>): Promise<APIResponse<Tienda>> => {
    const response = await fetch(`${API_BASE_URL}/tiendas`, 
      createFetchOptions({
        method: 'POST',
        body: JSON.stringify(data),
      })
    );
    const responseData = await response.json();
    
    // Transformar la respuesta del backend
    if (responseData.status === "Tienda agregada") {
      return {
        data: responseData.store
      };
    } else {
      throw new Error(responseData.status || 'Error al crear la tienda');
    }
  },

  update: async (id: string, data: Partial<Tienda>): Promise<APIResponse<Tienda>> => {
    const response = await fetch(`${API_BASE_URL}/tiendas/${id}`, 
      createFetchOptions({
        method: 'PUT',
        body: JSON.stringify(data),
      })
    );
    const responseData = await response.json();
    
    if (responseData.status === "Tienda Actualizada") {
      return { data: data as Tienda };
    } else {
      throw new Error(responseData.status || 'Error al actualizar la tienda');
    }
  },

  delete: async (id: string): Promise<APIResponse<null>> => {
    const response = await fetch(`${API_BASE_URL}/tiendas/${id}`, 
      createFetchOptions({ method: 'DELETE' })
    );
    const responseData = await response.json();
    
    if (responseData.status === "Tienda Eliminada") {
      return { data: null };
    } else {
      throw new Error(responseData.status || 'Error al eliminar la tienda');
    }
  },
};

// Productos API
export const productosAPI = {
  getAll: async (params?: { page?: number; limit?: number; categoria?: string; tienda_id?: string }): Promise<PaginatedResponse<Producto>> => {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.limit) searchParams.append('limit', params.limit.toString());
    if (params?.categoria) searchParams.append('categoria', params.categoria);
    if (params?.tienda_id) searchParams.append('tienda_id', params.tienda_id);
    
    const response = await fetch(`${API_BASE_URL}/productos?${searchParams}`, createFetchOptions());
    const data = await response.json();
    
    // El backend puede devolver un array o un objeto con error
    if (Array.isArray(data)) {
      return {
        data: data,
        total: data.length,
        page: params?.page || 1,
        limit: params?.limit || 10,
        totalPages: Math.ceil(data.length / (params?.limit || 10))
      };
    } else if (data.error) {
      // Si hay un error, devolver array vacío
      return {
        data: [],
        total: 0,
        page: params?.page || 1,
        limit: params?.limit || 10,
        totalPages: 0
      };
    }
    
    return data;
  },

  getById: async (id: string): Promise<APIResponse<Producto>> => {
    const response = await fetch(`${API_BASE_URL}/productos/${id}`, createFetchOptions());
    const data = await response.json();
    
    // El backend devuelve directamente el objeto del producto
    if (data._id) {
      return { data };
    } else {
      throw new Error('Producto no encontrado');
    }
  },

  create: async (data: Omit<Producto, '_id' | 'createdAt' | 'updatedAt'>): Promise<APIResponse<Producto>> => {
    const response = await fetch(`${API_BASE_URL}/productos`, 
      createFetchOptions({
        method: 'POST',
        body: JSON.stringify(data),
      })
    );
    const responseData = await response.json();
    
    // Transformar la respuesta del backend
    if (responseData.status === "Producto agregado") {
      return {
        data: responseData.product
      };
    } else {
      throw new Error(responseData.status || 'Error al crear el producto');
    }
  },

  update: async (id: string, data: Partial<Producto>): Promise<APIResponse<Producto>> => {
    const response = await fetch(`${API_BASE_URL}/productos/${id}`, 
      createFetchOptions({
        method: 'PUT',
        body: JSON.stringify(data),
      })
    );
    return handleResponse(response);
  },

  delete: async (id: string): Promise<APIResponse<null>> => {
    const response = await fetch(`${API_BASE_URL}/productos/${id}`, 
      createFetchOptions({ method: 'DELETE' })
    );
    return handleResponse(response);
  },
};

// Publicaciones API
export const publicacionesAPI = {
  getAll: async (params?: { page?: number; limit?: number; tienda_id?: string }): Promise<PaginatedResponse<Publicacion>> => {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.limit) searchParams.append('limit', params.limit.toString());
    if (params?.tienda_id) searchParams.append('tienda_id', params.tienda_id);
    
    const response = await fetch(`${API_BASE_URL}/publicaciones?${searchParams}`, createFetchOptions());
    const data = await response.json();
    
    // El backend puede devolver un array o un objeto con error
    if (Array.isArray(data)) {
      return {
        data: data,
        total: data.length,
        page: params?.page || 1,
        limit: params?.limit || 10,
        totalPages: Math.ceil(data.length / (params?.limit || 10))
      };
    } else if (data.error) {
      // Si hay un error (como "No se encontraron publicaciones"), devolver array vacío
      return {
        data: [],
        total: 0,
        page: params?.page || 1,
        limit: params?.limit || 10,
        totalPages: 0
      };
    }
    
    return data;
  },

  getById: async (id: string): Promise<APIResponse<Publicacion>> => {
    const response = await fetch(`${API_BASE_URL}/publicaciones/${id}`, createFetchOptions());
    const data = await response.json();
    
    // El backend devuelve directamente el objeto de la publicación
    if (data._id) {
      return { data };
    } else {
      throw new Error('Publicación no encontrada');
    }
  },

  create: async (data: Omit<Publicacion, '_id' | 'createdAt' | 'updatedAt'>): Promise<APIResponse<Publicacion>> => {
    const response = await fetch(`${API_BASE_URL}/publicaciones`, 
      createFetchOptions({
        method: 'POST',
        body: JSON.stringify(data),
      })
    );
    const responseData = await response.json();
    
    // Transformar la respuesta del backend
    if (responseData.status === "Publicación agregada") {
      return {
        data: responseData.publication
      };
    } else {
      throw new Error(responseData.status || 'Error al crear la publicación');
    }
  },

  update: async (id: string, data: Partial<Publicacion>): Promise<APIResponse<Publicacion>> => {
    const response = await fetch(`${API_BASE_URL}/publicaciones/${id}`, 
      createFetchOptions({
        method: 'PUT',
        body: JSON.stringify(data),
      })
    );
    return handleResponse(response);
  },

  delete: async (id: string): Promise<APIResponse<null>> => {
    const response = await fetch(`${API_BASE_URL}/publicaciones/${id}`, 
      createFetchOptions({ method: 'DELETE' })
    );
    return handleResponse(response);
  },
};

// Comentarios API
export const comentariosAPI = {
  getByPublicacion: async (publicacionId: string): Promise<APIResponse<Comentario[]>> => {
    const response = await fetch(`${API_BASE_URL}/comentarios/publicacion/${publicacionId}`, createFetchOptions());
    return handleResponse(response);
  },

  create: async (data: Omit<Comentario, '_id' | 'createdAt' | 'updatedAt'>): Promise<APIResponse<Comentario>> => {
    const response = await fetch(`${API_BASE_URL}/comentarios`, 
      createFetchOptions({
        method: 'POST',
        body: JSON.stringify(data),
      })
    );
    return handleResponse(response);
  },

  update: async (id: string, data: Partial<Comentario>): Promise<APIResponse<Comentario>> => {
    const response = await fetch(`${API_BASE_URL}/comentarios/${id}`, 
      createFetchOptions({
        method: 'PUT',
        body: JSON.stringify(data),
      })
    );
    return handleResponse(response);
  },

  delete: async (id: string): Promise<APIResponse<null>> => {
    const response = await fetch(`${API_BASE_URL}/comentarios/${id}`, 
      createFetchOptions({ method: 'DELETE' })
    );
    return handleResponse(response);
  },
};

// Reacciones API
export const reaccionesAPI = {
  getByPublicacion: async (publicacionId: string): Promise<APIResponse<Reaccion[]>> => {
    const response = await fetch(`${API_BASE_URL}/reacciones/publicacion/${publicacionId}`, createFetchOptions());
    return handleResponse(response);
  },

  create: async (data: Omit<Reaccion, '_id' | 'createdAt' | 'updatedAt'>): Promise<APIResponse<Reaccion>> => {
    const response = await fetch(`${API_BASE_URL}/reacciones`, 
      createFetchOptions({
        method: 'POST',
        body: JSON.stringify(data),
      })
    );
    return handleResponse(response);
  },

  update: async (id: string, data: Partial<Reaccion>): Promise<APIResponse<Reaccion>> => {
    const response = await fetch(`${API_BASE_URL}/reacciones/${id}`, 
      createFetchOptions({
        method: 'PUT',
        body: JSON.stringify(data),
      })
    );
    return handleResponse(response);
  },

  delete: async (id: string): Promise<APIResponse<null>> => {
    const response = await fetch(`${API_BASE_URL}/reacciones/${id}`, 
      createFetchOptions({ method: 'DELETE' })
    );
    return handleResponse(response);
  },
};