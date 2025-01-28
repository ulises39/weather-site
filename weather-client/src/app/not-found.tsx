"use client";
import Link from "next/link";

export default function NotFound() {
  return (
    <main className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-purple-500 mb-4">404</h1>
        <h2 className="text-2xl font-semibold text-white mb-4">
          ¡Oops! Página no encontrada
        </h2>
        <p className="text-gray-400 mb-8">
          La página que estás buscando no existe o ha sido movida.
        </p>
        <Link
          href="/"
          className="inline-block bg-purple-500 text-white px-6 py-3 rounded-full hover:bg-purple-600 transition-colors"
        >
          ← Volver al inicio
        </Link>
      </div>
    </main>
  );
}
