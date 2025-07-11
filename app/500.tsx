'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Home, RefreshCw } from 'lucide-react';

export default function ServerError() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center">
          <div className="mx-auto w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mb-8">
            <span className="text-4xl font-bold text-red-600">500</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Error del servidor
          </h1>
          <p className="text-gray-600 mb-8">
            Lo sentimos, ocurrió un error en el servidor. Por favor, inténtalo de nuevo más tarde.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/">
              <Button className="w-full sm:w-auto">
                <Home className="mr-2 h-4 w-4" />
                Ir al inicio
              </Button>
            </Link>
            <Button variant="outline" onClick={() => window.location.reload()} className="w-full sm:w-auto">
              <RefreshCw className="mr-2 h-4 w-4" />
              Reintentar
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}