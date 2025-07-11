'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { Layout } from '@/components/layout/Layout';
import { useAuth } from '@/hooks/useAuth';
import { useTiendas } from '@/hooks/useTiendas';
import { productosAPI } from '@/services/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Spinner } from '@/components/ui/spinner';
import { ArrowLeft, Package } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

const categorias = [
  'Artesanías',
  'Textiles',
  'Cerámica',
  'Madera',
  'Joyería',
  'Decoración',
  'Ropa',
  'Accesorios',
  'Otros'
];

const productoSchema = z.object({
  nombre: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  descripcion: z.string().min(10, 'La descripción debe tener al menos 10 caracteres'),
  precio: z.number().min(0.01, 'El precio debe ser mayor a 0'),
  categoria: z.string().min(1, 'Selecciona una categoría'),
  imagen: z.string().url('La imagen debe ser una URL válida').optional().or(z.literal('')),
  tienda_id: z.string().min(1, 'Selecciona una tienda'),
});

type ProductoFormData = z.infer<typeof productoSchema>;

export default function CreateProductoPage() {
  return (
    <ProtectedRoute>
      <Layout>
        <CreateProductoContent />
      </Layout>
    </ProtectedRoute>
  );
}

const CreateProductoContent = () => {
  const { user } = useAuth();
  const router = useRouter();
  const { tiendas } = useTiendas({ limit: 100 }); // Cargar todas las tiendas del usuario
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<ProductoFormData>({
    resolver: zodResolver(productoSchema),
  });

  const selectedTienda = watch('tienda_id');
  const selectedCategoria = watch('categoria');

  const onSubmit = async (data: ProductoFormData) => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);

      const productoData = {
        ...data,
        imagen: data.imagen || undefined,
        tienda_id: Number(data.tienda_id),
      };

      const response = await productosAPI.create(productoData);
      
      toast.success('Producto creado exitosamente');
      router.push(`/productos/${response.data._id}`);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al crear el producto';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Filtrar tiendas del usuario actual y eliminar duplicados por _id
  const userTiendas = tiendas
    .filter(tienda => tienda.usuario_id === user?._id)
    .filter((tienda, index, self) =>
      index === self.findIndex(t => t._id === tienda._id)
    );

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center mb-4">
          <Link href="/productos">
            <Button variant="outline" size="sm" className="mr-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Agregar Producto</h1>
            <p className="mt-2 text-gray-600">
              Agrega un nuevo producto a tu catálogo
            </p>
          </div>
        </div>
      </div>

      {/* Check if user has stores */}
      {userTiendas.length === 0 && (
        <Alert className="mb-6">
          <AlertDescription>
            Necesitas crear una tienda antes de agregar productos.{' '}
            <Link href="/tiendas/create" className="text-primary hover:underline">
              Crear tienda
            </Link>
          </AlertDescription>
        </Alert>
      )}

      {/* Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Package className="mr-2 h-5 w-5" />
            Información del Producto
          </CardTitle>
          <CardDescription>
            Completa los detalles de tu producto
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="tienda_id">Tienda *</Label>
              <Select value={selectedTienda} onValueChange={(value) => setValue('tienda_id', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona una tienda" />
                </SelectTrigger>
                <SelectContent>
                  {userTiendas.map((tienda) => (
                    <SelectItem key={tienda._id} value={tienda._id.toString()}>
                      {tienda.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.tienda_id && (
                <p className="text-sm text-red-600">{errors.tienda_id.message}</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="nombre">Nombre del producto *</Label>
                <Input
                  id="nombre"
                  placeholder="Collar de plata artesanal"
                  {...register('nombre')}
                />
                {errors.nombre && (
                  <p className="text-sm text-red-600">{errors.nombre.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="precio">Precio *</Label>
                <Input
                  id="precio"
                  type="number"
                  step="0.01"
                  placeholder="299.99"
                  {...register('precio', { valueAsNumber: true })}
                />
                {errors.precio && (
                  <p className="text-sm text-red-600">{errors.precio.message}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="categoria">Categoría *</Label>
              <Select value={selectedCategoria} onValueChange={(value) => setValue('categoria', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona una categoría" />
                </SelectTrigger>
                <SelectContent>
                  {categorias.map((categoria) => (
                    <SelectItem key={categoria} value={categoria}>
                      {categoria}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.categoria && (
                <p className="text-sm text-red-600">{errors.categoria.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="descripcion">Descripción *</Label>
              <Textarea
                id="descripcion"
                placeholder="Describe tu producto, sus características, materiales y cualquier información relevante..."
                rows={5}
                {...register('descripcion')}
              />
              {errors.descripcion && (
                <p className="text-sm text-red-600">{errors.descripcion.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="imagen">Imagen del producto (URL)</Label>
              <Input
                id="imagen"
                placeholder="https://ejemplo.com/imagen.jpg"
                {...register('imagen')}
              />
              {errors.imagen && (
                <p className="text-sm text-red-600">{errors.imagen.message}</p>
              )}
            </div>

            <div className="flex justify-end space-x-4 pt-6">
              <Link href="/productos">
                <Button type="button" variant="outline">
                  Cancelar
                </Button>
              </Link>
              <Button type="submit" disabled={loading || userTiendas.length === 0}>
                {loading ? (
                  <>
                    <Spinner size="sm" className="mr-2" />
                    Creando...
                  </>
                ) : (
                  'Crear Producto'
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};