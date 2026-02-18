import { CreateProjectForm } from '@/components/projects/CreateProjectForm'

export const metadata = {
  title: 'Crear Proyecto - Clinical Case Generator',
  description: 'Crea un nuevo proyecto farmacéutico',
}

export default function NewProjectPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Crear Proyecto</h1>
        <p className="mt-1 text-gray-600">
          Configura un nuevo proyecto para generar casos clínicos
        </p>
      </div>

      <CreateProjectForm />
    </div>
  )
}
