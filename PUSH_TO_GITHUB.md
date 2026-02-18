# 📤 Instrucciones para Push a GitHub

El proyecto está completamente listo para GitHub, pero necesitamos tu autenticación para hacer push.

## ¿Qué está listo?

✅ Git inicializado localmente
✅ 2 commits preparados
✅ Rama renombrada a `main`
✅ Remote origin configurado: `https://github.com/medistreamtvlabs/clinical-case-generator.git`

## Cómo hacer push

Ejecuta estos comandos en tu terminal:

```bash
cd "/Users/rodrigohuerta/Desktop/IA Apps Prototipos/Casos Clínicos/caso-clinico-generator"

# Hacer push a GitHub
git push -u origin main
```

Cuando ejecutes `git push`, GitHub te pedirá autenticación. Tienes 2 opciones:

### Opción 1: Personal Access Token (Recomendado)

1. Ve a https://github.com/settings/tokens
2. Haz clic en "Generate new token"
3. Selecciona "repo" scope
4. Copia el token
5. Cuando Git te pida contraseña, pega el token

### Opción 2: GitHub CLI

```bash
# Instalar GitHub CLI (si no lo tienes)
brew install gh

# Autenticarse
gh auth login

# Hacer push
git push -u origin main
```

### Opción 3: SSH Keys

```bash
# Generar SSH key (si no la tienes)
ssh-keygen -t ed25519 -C "tu-email@ejemplo.com"

# Añadir a ssh-agent
ssh-add ~/.ssh/id_ed25519

# Copiar la clave pública
cat ~/.ssh/id_ed25519.pub

# Ve a https://github.com/settings/keys y añade la clave
# Luego ejecuta:
git remote set-url origin git@github.com:medistreamtvlabs/clinical-case-generator.git
git push -u origin main
```

## Verificar Push

Una vez completado, verifica en:
https://github.com/medistreamtvlabs/clinical-case-generator

Deberías ver:
- ✅ 46 archivos
- ✅ 2 commits en el historial
- ✅ README.md mostrándose automáticamente
- ✅ Rama `main` como default

## Troubleshooting

### "fatal: could not read Username for 'https://github.com'"

Usa Personal Access Token en lugar de contraseña.

### "Permission denied (publickey)"

Necesitas configurar SSH keys en GitHub.

### "Repository not found"

Verifica que:
1. El URL es correcto
2. El repositorio existe en GitHub
3. Tienes permisos para escribir en el repositorio

## Git Config (Opcional)

Si quieres guardar credenciales:

```bash
# macOS
git config --global credential.helper osxkeychain

# Linux
git config --global credential.helper store

# Windows
git config --global credential.helper wincred
```

## Una vez Push esté completo

1. Comparte el link del repositorio
2. Continuamos con FASE 2 🚀

---

**¿Necesitas ayuda con alguno de estos pasos?**
