#!/usr/bin/env python3
"""
Script para hacer push a GitHub usando la API de GitHub.
Requiere: GITHUB_TOKEN como variable de entorno
"""

import os
import json
import subprocess
import sys
from urllib.request import urlopen, Request
from urllib.error import HTTPError

def main():
    # Obtener token del entorno
    token = os.environ.get('GITHUB_TOKEN')

    if not token:
        print("❌ Error: No se encontró GITHUB_TOKEN en variables de entorno")
        print("")
        print("Para usar este script:")
        print("")
        print("1. Ve a: https://github.com/settings/tokens/new")
        print("2. Crea un token con scope 'repo'")
        print("3. Ejecuta:")
        print("")
        print("   export GITHUB_TOKEN='tu_token_aqui'")
        print("   python3 push_with_github_api.py")
        print("")
        return 1

    print("🚀 Clinical Case Generator - GitHub Push")
    print("=" * 50)
    print("")

    # Configurar git con token
    print("🔐 Configurando autenticación...")

    # Crear URL con token embebido (temporal)
    remote_url = f"https://{token}@github.com/medistreamtvlabs/clinical-case-generator.git"

    try:
        # Hacer push
        print("📤 Haciendo push a GitHub...")
        result = subprocess.run(
            ["git", "push", "-u", "origin", "main"],
            capture_output=True,
            text=True,
            timeout=60
        )

        if result.returncode == 0:
            print("✅ ¡Push completado exitosamente!")
            print("")
            print("🎉 El proyecto está ahora en GitHub:")
            print("   https://github.com/medistreamtvlabs/clinical-case-generator")
            print("")
            return 0
        else:
            print("❌ Error durante el push:")
            print(result.stderr)
            return 1

    except subprocess.TimeoutExpired:
        print("❌ Error: Push tardó demasiado tiempo")
        return 1
    except Exception as e:
        print(f"❌ Error: {e}")
        return 1

if __name__ == "__main__":
    sys.exit(main())
