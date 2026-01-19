#!/usr/bin/env bash
# exit on error
set -o errexit

pip install -r requirements.txt

python manage.py collectstatic --no-input
python manage.py migrate

# --- CREAR SUPERUSUARIO ---
# Render ejecutará esto en cada deploy, pero el script de python
# valida si ya existe para no fallar.
python create_superuser.py