import os
import django

# 1. Configurar el entorno de Django
# CAMBIA "backend.settings" POR EL NOMBRE DE TU CARPETA DONDE ESTÁ SETTINGS.PY
# Ejemplo: si tu settings está en "qa_dashboard/settings.py", pon "qa_dashboard.settings"
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "backend.settings")
django.setup()

from django.contrib.auth import get_user_model

def create_or_update_superuser():
    User = get_user_model()
    
    # Obtenemos las credenciales de las variables de entorno de Render
    username = os.environ.get('DJANGO_SUPERUSER_USERNAME')
    email = os.environ.get('DJANGO_SUPERUSER_EMAIL')
    password = os.environ.get('DJANGO_SUPERUSER_PASSWORD')

    if not username or not password:
        print("⚠️ No se encontraron variables de entorno para el superusuario. Saltando...")
        return

    try:
        # Intentamos obtener el usuario
        user = User.objects.get(username=username)
        print(f"🔄 El usuario '{username}' ya existe. Actualizando contraseña...")
        user.set_password(password)
        user.email = email
        user.is_superuser = True
        user.is_staff = True
        user.save()
        print(f"✅ Contraseña actualizada correctamente para '{username}'.")
    
    except User.DoesNotExist:
        # Si no existe, lo creamos
        print(f"🆕 Creando nuevo superusuario '{username}'...")
        User.objects.create_superuser(username=username, email=email, password=password)
        print(f"✅ Superusuario '{username}' creado exitosamente.")
    
    except Exception as e:
        print(f"❌ Error inesperado gestionando el superusuario: {e}")

if __name__ == "__main__":
    create_or_update_superuser()