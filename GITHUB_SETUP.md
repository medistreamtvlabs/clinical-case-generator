# 🚀 Subir a GitHub - Instrucciones

El proyecto ya está inicializado con Git localmente. Para subirlo a GitHub, sigue estos pasos:

## 1. Crear Repositorio en GitHub

1. Ve a [github.com](https://github.com)
2. Inicia sesión con tu cuenta
3. Haz clic en **"New repository"** o ve a [github.com/new](https://github.com/new)
4. Completa los datos:
   - **Repository name**: `clinical-case-generator`
   - **Description**: "Plataforma para generación automática de casos clínicos educativos usando IA (Claude)"
   - **Visibility**: `Public` (o Private según preferencia)
   - **Initialize repository**: NO (ya tenemos archivos locales)
5. Haz clic en **"Create repository"**

## 2. Conectar Repositorio Local a GitHub

Después de crear el repositorio, GitHub te mostrará comandos. Copia y ejecuta en tu terminal:

```bash
cd "/Users/rodrigohuerta/Desktop/IA Apps Prototipos/Casos Clínicos/caso-clinico-generator"

# Renombrar rama a 'main' (opcional pero recomendado)
git branch -M main

# Agregar remote origin
git remote add origin https://github.com/TU_USERNAME/clinical-case-generator.git

# Hacer push del código
git push -u origin main
```

**NOTA**: Reemplaza `TU_USERNAME` con tu nombre de usuario de GitHub.

## 3. Verificar en GitHub

1. Ve a `https://github.com/TU_USERNAME/clinical-case-generator`
2. Deberías ver todos los archivos subidos
3. El README.md debería mostrarse automáticamente

## 4. Agregar Topics (Opcional)

En la página del repositorio:
1. Ve a Settings → General
2. En "About" → Topics, agrega:
   - `clinical-cases`
   - `medical-education`
   - `ai-generation`
   - `claude-api`
   - `next-js`
   - `typescript`

## 5. Configurar GitHub Pages (Opcional)

Para documentación:
1. Ve a Settings → Pages
2. Selecciona `main` branch
3. Selecciona `/root` folder

## Comandos Git Útiles para el Futuro

```bash
# Ver estado
git status

# Hacer commit
git commit -m "Mensaje descriptivo"

# Hacer push
git push

# Actualizar del remoto
git pull
```

## Estructura de Commits Recomendada

Usa este formato para commits claros:

```
feat: Add new feature (nueva característica)
fix: Fix bug (corrección de bug)
docs: Update documentation (documentación)
refactor: Code refactoring (refactorización)
test: Add tests (tests)
chore: Maintenance (mantenimiento)
```

Ejemplo:
```bash
git commit -m "feat: Add document upload functionality"
```

## Ramas Recomendadas

```bash
# Crear rama de desarrollo
git checkout -b develop

# Crear ramas de features
git checkout -b feature/phase-2-documents

# Al terminar feature, hacer merge a develop
git checkout develop
git merge feature/phase-2-documents

# Cuando esté listo, hacer release
git checkout main
git merge develop
```

## 📊 Estado del Repositorio

Después de subir, tu repositorio tendrá:

- **44 commits** (el inicial con todo)
- **43 archivos** (código, config, docs)
- **~3750 líneas de código**
- **6 carpetas principales** (app, components, lib, types, config, prisma)

## 🔐 Configuración de Seguridad

⚠️ **IMPORTANTE**: Nunca subas información sensible:

- ✅ `.env.example` - Sí (template)
- ❌ `.env` - No (credenciales)
- ❌ `.env.local` - No (credenciales locales)
- ❌ node_modules/ - No (se instala con npm install)
- ❌ .next/ - No (build artifacts)

Todo esto ya está en `.gitignore`, así que no te preocupes.

## 📝 Próximos Pasos

1. Comparte el link del repositorio
2. Invita colaboradores si es necesario
3. Continúa con FASE 2 (Documentación)
4. Haz commits con cada feature completada

## 🆘 Si Algo Sale Mal

```bash
# Ver historial de cambios
git log

# Ver cambios no committed
git diff

# Descartar cambios locales
git checkout -- .

# Ver remotes configurados
git remote -v
```

## Recursos

- [GitHub Docs](https://docs.github.com)
- [Git Documentation](https://git-scm.com/doc)
- [GitHub CLI](https://cli.github.com/)

---

¡Una vez subes el repositorio, comparte el link para que podamos continuar con FASE 2! 🚀
