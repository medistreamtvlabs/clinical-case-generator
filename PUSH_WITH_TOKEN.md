# 🔑 Push a GitHub con Personal Access Token

Para hacer push desde línea de comandos sin interfaz gráfica, necesitamos un Personal Access Token.

## Paso 1: Crear Personal Access Token en GitHub

1. Ve a: https://github.com/settings/tokens/new
2. Dale un nombre: `clinical-case-generator-push`
3. Selecciona `repo` (acceso completo a repositorios privados y públicos)
4. Selecciona fecha de expiración (1 año o más)
5. Copia el token (será algo como: `ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxx`)

## Paso 2: Guardar el Token (Seguro)

### Opción A: Guardar en Git (Recomendado)

```bash
# Guarda el token en el credential helper
cd "/Users/rodrigohuerta/Desktop/IA Apps Prototipos/Casos Clínicos/caso-clinico-generator"

# Edita el archivo de credenciales
nano ~/.git-credentials

# O usando cat:
cat > ~/.git-credentials <<EOF
https://TU_USERNAME:TOKEN_AQUI@github.com
EOF

# Configura permisos seguros
chmod 600 ~/.git-credentials

# Verifica que git pueda acceder
git config --global credential.helper store
```

### Opción B: Variable de Entorno

```bash
export GH_TOKEN="tu_token_aqui"
```

## Paso 3: Hacer Push

```bash
cd "/Users/rodrigohuerta/Desktop/IA Apps Prototipos/Casos Clínicos/caso-clinico-generator"
git push -u origin main
```

## ⚠️ SEGURIDAD

**IMPORTANTE**:
- ✅ NO comitas el token en el repositorio
- ✅ NO compartas el token públicamente
- ✅ Usa `chmod 600` para proteger el archivo de credenciales
- ✅ Si el token se filtra, revócalo inmediatamente en GitHub

## Revocar Token (Si es necesario)

1. Ve a: https://github.com/settings/tokens
2. Haz clic en el token
3. Haz clic en "Delete"

---

**¿Tienes un Personal Access Token? Proporciona los detalles y completamos el push.**
