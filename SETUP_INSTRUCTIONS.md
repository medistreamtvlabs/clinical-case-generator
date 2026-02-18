# 🚀 INSTRUCCIONES DE SETUP - FASE 0 COMPLETADA

## ✅ Lo que se ha hecho en FASE 0

Se ha creado la **estructura completa** del proyecto con todos los archivos de configuración necesarios:

### Archivos de Configuración Base
- ✅ `package.json` - Dependencias del proyecto
- ✅ `tsconfig.json` - Configuración TypeScript
- ✅ `next.config.js` - Configuración Next.js
- ✅ `tailwind.config.ts` - Configuración Tailwind CSS
- ✅ `postcss.config.js` - Configuración PostCSS
- ✅ `.env.example` - Template de variables de entorno
- ✅ `.gitignore` - Archivos a ignorar en Git

### Base de Datos
- ✅ `prisma/schema.prisma` - Schema completo de BD (Projects, Documents, Cases, etc)

### Librerías y Utilidades
- ✅ `src/lib/db.ts` - Prisma client singleton
- ✅ `src/config/constants.ts` - Constantes de la aplicación

### TypeScript Types
- ✅ `src/types/index.ts` - Exports principales
- ✅ `src/types/common.ts` - Enums y tipos comunes
- ✅ `src/types/project.ts` - Tipos de proyectos
- ✅ `src/types/document.ts` - Tipos de documentos
- ✅ `src/types/case.ts` - Tipos de casos clínicos
- ✅ `src/types/api.ts` - Tipos de API

### Estilos y Layout
- ✅ `src/app/globals.css` - Estilos globales
- ✅ `src/app/layout.tsx` - Layout raíz
- ✅ `src/app/page.tsx` - Home page

### API Base
- ✅ `src/app/api/health/route.ts` - Health check endpoint

### Documentación
- ✅ `README.md` - Documentación del proyecto
- ✅ `SETUP_INSTRUCTIONS.md` - Este archivo

## 🔧 PRÓXIMOS PASOS (Después de instalar Node.js)

### 1. Clonar o descargar el proyecto
El proyecto ya está en: `/Users/rodrigohuerta/Desktop/IA Apps Prototipos/Casos Clínicos/caso-clinico-generator`

### 2. Instalar Node.js (si no lo tienes)
```bash
# En macOS con Homebrew
brew install node@18

# O descarga desde https://nodejs.org/
```

### 3. Navegar al proyecto
```bash
cd "/Users/rodrigohuerta/Desktop/IA Apps Prototipos/Casos Clínicos/caso-clinico-generator"
```

### 4. Instalar dependencias
```bash
npm install
# O si prefieres yarn:
yarn install
```

### 5. Configurar PostgreSQL

**Opción A: PostgreSQL Local**
```bash
# macOS
brew install postgresql@15
brew services start postgresql@15

# Linux
sudo apt-get install postgresql-15
sudo systemctl start postgresql

# Windows
# Descarga desde https://www.postgresql.org/download/windows/
```

**Opción B: Docker**
```bash
docker run --name postgres_caso_clinico \
  -e POSTGRES_PASSWORD=password \
  -e POSTGRES_DB=caso_clinico_db \
  -p 5432:5432 \
  -d postgres:15
```

### 6. Crear base de datos
```bash
# Si usas PostgreSQL local:
createdb caso_clinico_db

# O usa psql:
psql -U postgres -c "CREATE DATABASE caso_clinico_db;"
```

### 7. Configurar variables de entorno
```bash
# Copiar plantilla
cp .env.example .env

# Editar .env con tus valores:
# DATABASE_URL=postgresql://user:password@localhost:5432/caso_clinico_db
# ANTHROPIC_API_KEY=sk-ant-... (obtén de https://console.anthropic.com/)
```

### 8. Inicializar Prisma
```bash
# Generar cliente Prisma
npx prisma generate

# Crear tablas en la BD
npx prisma db push

# Verificar en UI (opcional)
npx prisma studio
```

### 9. Iniciar desarrollo
```bash
npm run dev
```

La aplicación estará disponible en: **http://localhost:3000**

### 10. Verificar salud
```bash
curl http://localhost:3000/api/health
```

Deberías ver algo como:
```json
{
  "status": "ok",
  "timestamp": "2026-02-18T...",
  "services": {
    "database": "connected",
    "claudeApi": "available",
    "fileStorage": "ok"
  }
}
```

## 📋 ESTRUCTURA DE CARPETAS CREADA

```
caso-clinico-generator/
├── src/
│   ├── app/
│   │   ├── api/health/route.ts
│   │   ├── page.tsx
│   │   ├── layout.tsx
│   │   └── globals.css
│   ├── components/
│   │   ├── ui/
│   │   ├── projects/
│   │   ├── documents/
│   │   ├── cases/
│   │   ├── layout/
│   │   └── common/
│   ├── lib/
│   │   ├── db.ts
│   │   ├── ai/prompts/
│   │   ├── parsers/
│   │   ├── validators/
│   │   ├── generators/
│   │   └── utils/
│   ├── types/
│   │   ├── index.ts
│   │   ├── common.ts
│   │   ├── project.ts
│   │   ├── document.ts
│   │   ├── case.ts
│   │   └── api.ts
│   └── config/
│       └── constants.ts
├── prisma/
│   └── schema.prisma
├── public/
│   └── uploads/
├── .env.example
├── package.json
├── tsconfig.json
├── next.config.js
├── tailwind.config.ts
├── postcss.config.js
├── .gitignore
└── README.md
```

## 🎯 PRÓXIMA FASE (FASE 1)

Una vez completado el setup, continuaremos con **FASE 1: Gestión de Proyectos**, que incluye:

1. ✅ CRUD API para proyectos
2. ✅ Componentes UI (Card, List, Form)
3. ✅ Páginas de proyectos (lista, crear, ver detalle)
4. ✅ Dashboard principal

## ⚠️ IMPORTANTE

### Archivos que NO se deben commitear
```
.env                    # Tus variables secretas
node_modules/           # Se instalan con npm install
.next/                  # Build output
dist/                   # Build output
.DS_Store               # macOS metadata
```

Estos ya están en `.gitignore` pero verifica antes de hacer commit.

### Si algo falla

1. **Error: "npm command not found"**
   - Instala Node.js desde https://nodejs.org/

2. **Error: "database connection failed"**
   - Verifica que PostgreSQL esté corriendo
   - Verifica que DATABASE_URL sea correcta

3. **Error: "ANTHROPIC_API_KEY is missing"**
   - Obtén tu API key de https://console.anthropic.com/
   - Añádelo a `.env`

4. **Error: "Prisma Client not found"**
   ```bash
   npx prisma generate
   ```

## 📊 Checklist Antes de Empezar FASE 1

- [ ] Node.js 18+ instalado
- [ ] PostgreSQL corriendo
- [ ] `npm install` completado
- [ ] `.env` configurado
- [ ] `npx prisma db push` completado
- [ ] `npm run dev` funciona
- [ ] Health check responde 200
- [ ] Home page carga correctamente

## 🎉 ¡Listo!

Una vez todo esté funcionando, estamos listos para:
- **FASE 1**: Proyectos CRUD (1-2 días)
- **FASE 2**: Documentación y Parsing (1.5-2 días)
- **FASE 3**: Generación de casos (2-3 días)
- **FASE 4**: Validación y Workflow (1.5-2 días)

¡Avísame cuando todo esté listo para continuar!
