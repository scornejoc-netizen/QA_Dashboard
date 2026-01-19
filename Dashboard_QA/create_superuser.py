import os
import django
from django.contrib.auth import get_user_model

# Configurar el entorno de Django
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "qa_dashboard.settings")
django.setup()

User = get_user_model()

def create_superuser():
    username = os.environ.get("DJANGO_SUPERUSER_USERNAME")
    email = os.environ.get("DJANGO_SUPERUSER_EMAIL")
    password = os.environ.get("DJANGO_SUPERUSER_PASSWORD")

    if username and password:
        if not User.objects.filter(username=username).exists():
            print(f"Creando superusuario: {username}...")
            User.objects.create_superuser(username=username, email=email, password=password)
            print("¡Superusuario creado exitosamente!")
        else:
            print("El superusuario ya existe. Omitiendo creación.")
    else:
        print("No se encontraron variables de entorno para crear el superusuario.")

if __name__ == "__main__":
    create_superuser()