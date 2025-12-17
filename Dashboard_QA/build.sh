#!/usr/bin/env bash
# exit on error
set -o errexit

pip install -r requirements.txt

python manage.py collectstatic --no-input
python manage.py migrate

# --- EJECUTAR SCRIPT DE USUARIO ---
echo "Ejecutando script de creación de admin..."
python create_admin.py