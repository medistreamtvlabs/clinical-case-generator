import Link from 'next/link'
import { APP_NAME, APP_DESCRIPTION } from '@/config/constants'

export default function Home() {
  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50">
      <div className="text-center space-y-6 px-4 max-w-2xl">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-4xl md:text-5xl font-bold text-primary-900">
            {APP_NAME}
          </h1>
          <p className="text-lg text-gray-600">
            {APP_DESCRIPTION}
          </p>
        </div>

        {/* Description */}
        <div className="space-y-4 text-left bg-white rounded-lg p-6 shadow-md">
          <h2 className="text-2xl font-semibold text-primary-900">
            ¿Qué es?
          </h2>
          <ul className="space-y-2 text-gray-700">
            <li className="flex items-start">
              <span className="mr-3 text-primary-600 font-bold">✓</span>
              <span>Plataforma para generación automática de casos clínicos educativos</span>
            </li>
            <li className="flex items-start">
              <span className="mr-3 text-primary-600 font-bold">✓</span>
              <span>Basado en documentación médica oficial (fichas técnicas, estudios)</span>
            </li>
            <li className="flex items-start">
              <span className="mr-3 text-primary-600 font-bold">✓</span>
              <span>Utiliza Claude API de Anthropic para generar contenido clínicamente preciso</span>
            </li>
            <li className="flex items-start">
              <span className="mr-3 text-primary-600 font-bold">✓</span>
              <span>Validación automática contra documentación de referencia</span>
            </li>
          </ul>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
          <Link
            href="/projects"
            className="px-8 py-3 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 transition-colors"
          >
            Ir a Proyectos
          </Link>
          <a
            href="https://docs.anthropic.com"
            target="_blank"
            rel="noopener noreferrer"
            className="px-8 py-3 bg-white text-primary-600 font-semibold rounded-lg border-2 border-primary-600 hover:bg-primary-50 transition-colors"
          >
            Documentación
          </a>
        </div>

        {/* Footer Info */}
        <div className="pt-8 border-t text-gray-600 text-sm">
          <p>
            MVP v0.1.0 • {new Date().getFullYear()}
          </p>
        </div>
      </div>
    </main>
  )
}
