import os
import sys
import django

# --- FIX CRÍTICO: Agregar el directorio actual al path de Python ---
# Esto obliga al script a ver las carpetas que tiene al lado (como 'Dashboard_QA' o 'backend')
current_path = os.getcwd()
sys.path.append(current_path)
# -------------------------------------------------------------------

# Cambia esto si descubrimos que tu carpeta se llama diferente (ver logs si falla)
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "qa_dashboard.settings")

try:
    django.setup()
except ModuleNotFoundError as e:
    print("\n❌ ERROR CRÍTICO DE IMPORTACIÓN")
    print(f"Python no encuentra el módulo. Error: {e}")
    print(f"Estamos buscando en: {current_path}")
    print("Las carpetas disponibles aquí son:")
    # Listamos solo directorios para ver cuál es el correcto
    for item in os.listdir(current_path):
        if os.path.isdir(os.path.join(current_path, item)):
            print(f" - 📁 {item}")
    print("\n⚠️ REVISA LA LISTA ARRIBA: ¿Ves 'Dashboard_QA'? Si ves 'backend' o 'qa_dashboard', cambia el nombre en la línea 12.\n")
    sys.exit(1)

from django.contrib.auth import get_user_model

def create_or_update_superuser():
    User = get_user_model()
    
    username = os.environ.get('DJANGO_SUPERUSER_USERNAME')
    email = os.environ.get('DJANGO_SUPERUSER_EMAIL')
    password = os.environ.get('DJANGO_SUPERUSER_PASSWORD')

    if not username or not password:
        print("⚠️ Faltan variables de entorno. Saltando creación de superusuario.")
        return

    try:
        if User.objects.filter(username=username).exists():
            print(f"🔄 El usuario '{username}' ya existe. Actualizando contraseña...")
            user = User.objects.get(username=username)
            user.set_password(password)
            user.email = email
            user.is_superuser = True
            user.is_staff = True
            user.save()
            print(f"✅ Contraseña actualizada para '{username}'.")
        else:
            print(f"🆕 Creando superusuario '{username}'...")
            User.objects.create_superuser(username=username, email=email, password=password)
            print(f"✅ Usuario creado exitosamente.")
    
    except Exception as e:
        print(f"❌ Error inesperado: {e}")

if __name__ == "__main__":
    create_or_update_superuser()