# 📤 HACER PUSH A GITHUB - GUÍA RÁPIDA

## 🔑 Paso 1: Crear Token de GitHub

1. **Ve a**: https://github.com/settings/tokens/new
2. **Nombre**: `clinical-case-generator-push`
3. **Permisos**: Marca solo `repo` ✓
4. **Expiración**: 1 año (o más)
5. **Copia el token** (ejemplo: `ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`)

⚠️ **IMPORTANTE**: El token solo aparece UNA VEZ. Cópialo ahora.

---

## 🚀 Paso 2: Hacer Push

### Opción A: Comando Directo (Más Fácil)

```bash
cd "/Users/rodrigohuerta/Desktop/IA Apps Prototipos/Casos Clínicos/caso-clinico-generator"

GITHUB_TOKEN="tu_token_aqui" git push https://tu_token_aqui@github.com/medistreamtvlabs/clinical-case-generator.git main:main
```

**Reemplaza `tu_token_aqui` con tu token real**

### Opción B: Usando el Script Helper

```bash
cd "/Users/rodrigohuerta/Desktop/IA Apps Prototipos/Casos Clínicos/caso-clinico-generator"

GITHUB_TOKEN="tu_token_aqui" bash FAST_PUSH.sh
```

### Opción C: Variable de Entorno Permanente

```bash
# En tu terminal, ejecuta una vez:
export GITHUB_TOKEN="tu_token_aqui"

# Luego:
cd "/Users/rodrigohuerta/Desktop/IA Apps Prototipos/Casos Clínicos/caso-clinico-generator"
git push -u origin main
```

---

## ✅ Verificar que Funcionó

Una vez ejecutado, verifica en:
**https://github.com/medistreamtvlabs/clinical-case-generator**

Deberías ver:
- ✅ 48 archivos subidos
- ✅ 3 commits en el historial
- ✅ README.md mostrándose

---

## 🐛 Si Algo Sale Mal

### "fatal: could not read Username"
→ Usa una de las opciones de push arriba (con token embebido)

### "permission denied"
→ El token no tiene permisos. Ve a https://github.com/settings/tokens y verifica que tiene `repo` seleccionado

### "repository not found"
→ Verifica que el URL es correcto

---

## 💡 Mi Recomendación

La forma más sencilla es:

```bash
# 1. Copia tu token de GitHub

# 2. Ejecuta esto en tu terminal:
cd "/Users/rodrigohuerta/Desktop/IA Apps Prototipos/Casos Clínicos/caso-clinico-generator"

# 3. Reemplaza "tu_token_aqui" con tu token real y ejecuta:
GITHUB_TOKEN="tu_token_aqui" git push https://tu_token_aqui@github.com/medistreamtvlabs/clinical-case-generator.git main:main

# 4. ¡Listo! Verifica en GitHub
```

---

## ⚠️ SEGURIDAD

🔒 **Consejos de seguridad**:
- NO guardes el token en archivos de texto
- NO lo compartas con otros
- Si lo filtras, ve a https://github.com/settings/tokens y elimínalo
- Usa `export GITHUB_TOKEN="..."` solo en la sesión actual (se borra al cerrar terminal)

---

## 📞 Soporte

Si necesitas ayuda:
1. Lee este archivo completo
2. Verifica el token es correcto
3. Intenta una opción diferente de push

**Una vez hecho el push, continuamos con FASE 2 🚀**
