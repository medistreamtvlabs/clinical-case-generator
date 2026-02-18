# Clinical Case Generator Platform 🏥

> Plataforma web para generación automática de casos clínicos educativos usando IA (Claude) basada en documentación médica oficial.

## 🚀 Quick Start

### Requisitos Previos
- Node.js 18+
- npm o yarn
- PostgreSQL 15+
- API Key de Anthropic Claude

### Instalación (5 minutos)

```bash
# 1. Instalar dependencias
npm install

# 2. Configurar variables de entorno
cp .env.example .env
# Editar .env con tus credenciales

# 3. Setup Prisma
npx prisma generate
npx prisma db push

# 4. Iniciar desarrollo
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000)

## 📁 Estructura del Proyecto

```
src/
├── app/              # Next.js pages y API routes
├── components/       # React components
├── lib/              # Utilidades y lógica
├── types/            # TypeScript types
└── config/           # Configuración
```

## 🏗️ Arquitectura

- **Frontend**: Next.js 14 + React 18 + TypeScript + Tailwind CSS + shadcn/ui
- **Backend**: Next.js API Routes
- **Base de datos**: PostgreSQL + Prisma ORM
- **IA**: Anthropic Claude API (claude-sonnet-4-5-20250929)

## 🎯 FASES de Implementación

- **FASE 0** ✅: Setup inicial (Completada)
- **FASE 1**: Gestión de Proyectos (Proxima)
- **FASE 2**: Gestión de Documentación
- **FASE 3**: Generación de Casos
- **FASE 4**: Validación y Workflow

## 🔧 Comandos Útiles

```bash
# Desarrollo
npm run dev                    # Servidor de desarrollo
npm run build                  # Build de producción
npm run start                  # Servidor de producción

# Base de datos
npx prisma studio             # UI para BD
npx prisma db push            # Sincronizar schema
npx prisma migrate dev        # Crear migración

# Calidad
npm run lint                   # Ejecutar linter
npm run type-check            # Verificar tipos
```

## 🧪 Testing Manual

```bash
# Health check
curl http://localhost:3000/api/health
```

## 📝 Variables de Entorno

```env
DATABASE_URL="postgresql://user:password@localhost:5432/caso_clinico_db"
ANTHROPIC_API_KEY="sk-ant-..."
NEXT_PUBLIC_APP_URL="http://localhost:3000"
UPLOAD_DIR="./public/uploads"
MAX_FILE_SIZE=10485760
```

## 📚 Recursos

- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Anthropic Claude API](https://docs.anthropic.com/)
- [Tailwind CSS](https://tailwindcss.com/docs)

## 🐛 Troubleshooting

### Prisma Client no encontrado
```bash
npx prisma generate
```

### Error de conexión a PostgreSQL
Verifica que PostgreSQL esté corriendo:
```bash
# macOS
brew services start postgresql@15

# Linux
sudo systemctl start postgresql

# Docker
docker run --name postgres -e POSTGRES_PASSWORD=password -p 5432:5432 -d postgres:15
```

### Error con Claude API
Verifica tu API key en `.env`:
```env
ANTHROPIC_API_KEY=sk-ant-...
```

## 📊 Estado del Proyecto

**Status**: 🚧 En desarrollo activo

**Última actualización**: Febrero 2026

## 🙏 Agradecimientos

- Anthropic por Claude API
- Comunidad Next.js
- Comunidad médica por feedback

## 📮 Contacto

[Tu contacto aquí]
