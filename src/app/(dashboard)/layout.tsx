'use client'

import { ReactNode } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { APP_NAME } from '@/config/constants'
import { Flask, Menu, X } from 'lucide-react'
import { useState } from 'react'

export default function DashboardLayout({
  children,
}: {
  children: ReactNode
}) {
  const pathname = usePathname()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const isActive = (path: string) => pathname === path || pathname.startsWith(path + '/')

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 w-64 bg-white border-r border-gray-200 transform transition-transform duration-300 ease-in-out z-40 lg:static lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <nav className="h-full flex flex-col">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 px-6 py-4 border-b border-gray-200">
            <Flask className="h-6 w-6 text-primary-600" />
            <span className="font-bold text-gray-900">{APP_NAME}</span>
          </Link>

          {/* Navigation */}
          <div className="flex-1 px-4 py-6 space-y-2">
            <Link
              href="/projects"
              onClick={() => setSidebarOpen(false)}
              className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${
                isActive('/projects')
                  ? 'bg-primary-50 text-primary-600 font-medium'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <span>Proyectos</span>
            </Link>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-gray-200 text-xs text-gray-500">
            <p>v0.1.0</p>
            <p className="mt-1">Clinical Case Generator</p>
          </div>
        </nav>
      </aside>

      {/* Mobile Sidebar Backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between lg:px-8">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="lg:hidden p-2 hover:bg-gray-100 rounded-md"
          >
            {sidebarOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </button>
          <h1 className="hidden lg:block text-lg font-semibold text-gray-900">
            {APP_NAME}
          </h1>
          <div className="flex items-center gap-4">
            <div className="hidden sm:block text-sm text-gray-600">
              Febrero 2026
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto">
          <div className="p-6 lg:p-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
