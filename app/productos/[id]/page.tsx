'use client';

import { useParams } from 'next/navigation';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { Layout } from '@/components/layout/Layout';
import { useAuth } from '@/hooks/useAuth';
import { useProducto } from '@/hooks/useProductos';
import { useProductos } from '@/hooks/useProductos';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Spinner } from '@/components/ui/spinner';
import { ErrorDisplay } from '@/components/ui/error-display';
import { ArrowLeft, Edit, Package, Eye } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

export default function ProductoDetailPage() {
  return (
    <ProtectedRoute>
      <Layout>
        <ProductoDetailContent />
      </Layout>
    </ProtectedRoute>
  );
}

const ProductoDetailContent = () => {
  const params = useParams();
  const productoId = params.id as string;
  const { user } = useAuth();
  const { producto, loading, error, mutate } = useProducto(productoId);
  const { productos: productosRelacionados } = useProductos({
    categoria: producto?.categoria?.[0],
    limit: 4,
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-center">
          <Spinner size="lg" className="mx-auto mb-4" />
          <p className="text-muted-foreground">Cargando producto...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return <ErrorDisplay error={error} onRetry={() => mutate()} />;
  }

  if (!producto) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Producto no encontrado
        </h2>
        <p className="text-gray-600 mb-4">
          El producto que buscas no existe o ha sido eliminado.
        </p>
        <Link href="/productos">
          <Button>Volver a Productos</Button>
        </Link>
      </div>
    );
  }

  // Filtrar productos relacionados (misma categoría, excluyendo el actual)
  const related = productosRelacionados.filter(p => p._id !== producto._id);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex items-center mb-8">
        <Link href="/productos">
          <Button variant="outline" size="sm" className="mr-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{producto.nombre}</h1>
          <p className="mt-2 text-gray-600">Detalles del producto</p>
        </div>
      </div>

      {/* Product Detail */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
        {/* Image */}
        <div className="aspect-square relative rounded-lg overflow-hidden bg-gray-100">
          {producto.imagen ? (
            <Image
              src={producto.imagen}
              alt={producto.nombre}
              fill
              className="object-cover"
            />
          ) : (
            <div className="flex items-center justify-center h-full">
              <Package className="h-24 w-24 text-gray-400" />
            </div>
          )}
        </div>

        {/* Details */}
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">{producto.nombre}</h2>
            <Badge variant="secondary" className="mb-4">{producto.categoria?.[0] || 'Sin categoría'}</Badge>
            <p className="text-3xl font-bold text-primary mb-4">
              ${producto.precio.toLocaleString()}
            </p>
            <p className="text-gray-600 leading-relaxed">
              {producto.descripcion}
            </p>
          </div>

          <div className="pt-6 space-y-4">
            <div className="text-sm text-gray-500">
              <p><strong>Categoría:</strong> {producto.categoria?.[0] || 'Sin categoría'}</p>
              <p><strong>Precio:</strong> ${producto.precio.toLocaleString()}</p>
              <p><strong>Fecha de creación:</strong> {new Date(producto.createdAt).toLocaleDateString()}</p>
            </div>

            <div className="flex gap-4">
              <Link href={`/productos/${producto._id}/edit`}>
                <Button>
                  <Edit className="mr-2 h-4 w-4" />
                  Editar Producto
                </Button>
              </Link>
              <Button variant="outline">
                Contactar Vendedor
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Related Products */}
      {related.length > 0 && (
        <div>
          <h3 className="text-2xl font-bold text-gray-900 mb-6">
            Productos relacionados
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {related.map((relatedProduct) => (
              <Card key={relatedProduct._id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-4">
                  {relatedProduct.imagen && (
                    <div className="aspect-square relative rounded-lg overflow-hidden mb-4">
                      <Image
                        src={relatedProduct.imagen}
                        alt={relatedProduct.nombre}
                        fill
                        className="object-cover"
                      />
                    </div>
                  )}
                  <CardTitle className="text-lg">{relatedProduct.nombre}</CardTitle>
                  <CardDescription className="line-clamp-2">
                    {relatedProduct.descripcion}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Badge variant="secondary">{relatedProduct.categoria?.[0] || 'Sin categoría'}</Badge>
                    <span className="text-xl font-bold text-primary">
                      ${relatedProduct.precio.toLocaleString()}
                    </span>
                  </div>
                  
                  <Link href={`/productos/${relatedProduct._id}`}>
                    <Button variant="outline" className="w-full">
                      <Eye className="mr-2 h-4 w-4" />
                      Ver Detalles
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};