'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { Layout } from '@/components/layout/Layout';
import { useAuth } from '@/hooks/useAuth';
import { useTienda } from '@/hooks/useTiendas';
import { tiendasAPI } from '@/services/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Spinner } from '@/components/ui/spinner';
import { LoadingPage } from '@/components/ui/loading-page';
import { ErrorDisplay } from '@/components/ui/error-display';
import { ArrowLeft, Store } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

const tiendaSchema = z.object({
  nombre: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  descripcion: z.string().min(10, 'La descripción debe tener al menos 10 caracteres'),
  logo: z.string().url('Logo debe ser una URL válida').optional().or(z.literal('')),
  direccion: z.string().min(5, 'La dirección debe tener al menos 5 caracteres'),
  telefono: z.string().min(10, 'El teléfono debe tener al menos 10 caracteres'),
  horario: z.string().min(5, 'El horario debe tener al menos 5 caracteres'),
  ciudad: z.string().min(2, 'La ciudad debe tener al menos 2 caracteres'),
  pais: z.string().min(2, 'El país debe tener al menos 2 caracteres'),
});

type TiendaFormData = z.infer<typeof tiendaSchema>;

export default function EditTiendaPage() {
  const params = useParams();
  const tiendaId = params.id as string;

  return (
    <ProtectedRoute>
      <Layout>
        <EditTiendaContent tiendaId={tiendaId} />
      </Layout>
    </ProtectedRoute>
  );
}

const EditTiendaContent = ({ tiendaId }: { tiendaId: string }) => {
  const { user } = useAuth();
  const router = useRouter();
  const { tienda, loading: tiendaLoading, error: tiendaError, mutate } = useTienda(tiendaId);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<TiendaFormData>({
    resolver: zodResolver(tiendaSchema),
  });

  // Cargar datos de la tienda en el formulario
  useEffect(() => {
    if (tienda) {
      reset({
        nombre: tienda.nombre,
        descripcion: tienda.descripcion,
        logo: tienda.logo || '',
        direccion: tienda.direccion,
        telefono: tienda.telefono,
        horario: tienda.horario,
        ciudad: tienda.ciudad,
        pais: tienda.pais,
      });
    }
  }, [tienda, reset]);

  // Verificar permisos
      if (!tiendaLoading && tienda && user?._id !== tienda.usuario_id) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          No autorizado
        </h2>
        <p className="text-gray-600 mb-4">
          No tienes permisos para editar esta tienda.
        </p>
        <Link href="/tiendas">
          <Button>Volver a Tiendas</Button>
        </Link>
      </div>
    );
  }

  const onSubmit = async (data: TiendaFormData) => {
    if (!user || !tienda) return;

    try {
      setLoading(true);
      setError(null);

      const updatedData = {
        ...data,
        logo: data.logo || undefined,
      };

      await tiendasAPI.update(tienda._id.toString(), updatedData);
      
      toast.success('Tienda actualizada exitosamente');
      mutate(); // Revalidar datos
      router.push(`/tiendas/${tienda._id}`);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al actualizar la tienda';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (tiendaLoading) {
    return <LoadingPage message="Cargando tienda..." />;
  }

  if (tiendaError) {
    return <ErrorDisplay error={tiendaError} onRetry={() => mutate()} />;
  }

  if (!tienda) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Tienda no encontrada
        </h2>
        <p className="text-gray-600 mb-4">
          La tienda que intentas editar no existe.
        </p>
        <Link href="/tiendas">
          <Button>Volver a Tiendas</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center mb-4">
          <Link href={`/tiendas/${tienda._id}`}>
            <Button variant="outline" size="sm" className="mr-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Editar Tienda</h1>
            <p className="mt-2 text-gray-600">
              Actualiza la información de {tienda.nombre}
            </p>
          </div>
        </div>
      </div>

      {/* Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Store className="mr-2 h-5 w-5" />
            Información de la Tienda
          </CardTitle>
          <CardDescription>
            Modifica los detalles de tu tienda
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="nombre">Nombre de la tienda *</Label>
                <Input
                  id="nombre"
                  placeholder="Mi Tienda Artesanal"
                  {...register('nombre')}
                />
                {errors.nombre && (
                  <p className="text-sm text-red-600">{errors.nombre.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="logo">Logo (URL)</Label>
                <Input
                  id="logo"
                  placeholder="https://ejemplo.com/logo.jpg"
                  {...register('logo')}
                />
                {errors.logo && (
                  <p className="text-sm text-red-600">{errors.logo.message}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="descripcion">Descripción *</Label>
              <Textarea
                id="descripcion"
                placeholder="Describe tu tienda, los productos que ofreces y lo que la hace especial..."
                rows={4}
                {...register('descripcion')}
              />
              {errors.descripcion && (
                <p className="text-sm text-red-600">{errors.descripcion.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="direccion">Dirección *</Label>
              <Input
                id="direccion"
                placeholder="Calle 123, Colonia Centro"
                {...register('direccion')}
              />
              {errors.direccion && (
                <p className="text-sm text-red-600">{errors.direccion.message}</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="ciudad">Ciudad *</Label>
                <Input
                  id="ciudad"
                  placeholder="Ciudad de México"
                  {...register('ciudad')}
                />
                {errors.ciudad && (
                  <p className="text-sm text-red-600">{errors.ciudad.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="pais">País *</Label>
                <Input
                  id="pais"
                  placeholder="México"
                  {...register('pais')}
                />
                {errors.pais && (
                  <p className="text-sm text-red-600">{errors.pais.message}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="telefono">Teléfono *</Label>
                <Input
                  id="telefono"
                  placeholder="5512345678"
                  {...register('telefono')}
                />
                {errors.telefono && (
                  <p className="text-sm text-red-600">{errors.telefono.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="horario">Horario *</Label>
                <Input
                  id="horario"
                  placeholder="Lun-Vie 9:00-18:00, Sáb 9:00-14:00"
                  {...register('horario')}
                />
                {errors.horario && (
                  <p className="text-sm text-red-600">{errors.horario.message}</p>
                )}
              </div>
            </div>

            <div className="flex justify-end space-x-4 pt-6">
              <Link href={`/tiendas/${tienda._id}`}>
                <Button type="button" variant="outline">
                  Cancelar
                </Button>
              </Link>
              <Button type="submit" disabled={loading}>
                {loading ? (
                  <>
                    <Spinner size="sm" className="mr-2" />
                    Actualizando...
                  </>
                ) : (
                  'Actualizar Tienda'
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};