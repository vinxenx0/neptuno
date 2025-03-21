#!/bin/bash

# Función para añadir la cabecera a un archivo .py
add_header() {
    local file_path=$1
    local description=$2

    if [[ -f "$file_path" ]]; then
        # Si el archivo ya existe, añade la cabecera en la primera línea
        temp_file=$(mktemp)
        echo "# $file_path" > "$temp_file"
        echo "# $description" >> "$temp_file"
        cat "$file_path" >> "$temp_file"
        mv "$temp_file" "$file_path"
    else
        # Si el archivo no existe, crea uno nuevo con la cabecera
        echo "# $file_path" > "$file_path"
        echo "# $description" >> "$file_path"
    fi
}

# Crear la estructura de directorios (si no existen)
mkdir -p backend/api/v1
mkdir -p backend/core
mkdir -p backend/dependencies
mkdir -p backend/middleware
mkdir -p backend/models
mkdir -p backend/services
mkdir -p backend/utils

# Crear archivos en el directorio backend
add_header "backend/__init__.py" "Paquete principal del backend."
add_header "backend/main.py" "Punto de entrada principal de la aplicación."

# Crear archivos en el directorio api
add_header "backend/api/__init__.py" "Paquete de la API."
add_header "backend/api/v1/__init__.py" "Paquete de la versión 1 de la API."
add_header "backend/api/v1/auth.py" "Módulo de autenticación de la API v1."
add_header "backend/api/v1/endpoints.py" "Módulo de endpoints de la API v1."

# Crear archivos en el directorio core
add_header "backend/core/__init__.py" "Paquete principal de configuración y base de datos."
add_header "backend/core/config.py" "Módulo de configuración de la aplicación."
add_header "backend/core/database.py" "Módulo de conexión a la base de datos."

# Crear archivos en el directorio dependencies
add_header "backend/dependencies/__init__.py" "Paquete de dependencias."
add_header "backend/dependencies/auth.py" "Módulo de dependencias de autenticación."

# Crear archivos en el directorio middleware
add_header "backend/middleware/__init__.py" "Paquete de middleware."
add_header "backend/middleware/credits.py" "Módulo de middleware para créditos."

# Crear archivos en el directorio models
add_header "backend/models/__init__.py" "Paquete de modelos de datos."
add_header "backend/models/user.py" "Módulo del modelo de usuario."
add_header "backend/models/session.py" "Módulo del modelo de sesión."

# Crear archivos en el directorio services
add_header "backend/services/__init__.py" "Paquete de servicios."
add_header "backend/services/auth_service.py" "Módulo de servicio de autenticación."

# Crear archivos en el directorio utils
add_header "backend/utils/__init__.py" "Paquete de utilidades."
add_header "backend/utils/jwt_utils.py" "Módulo de utilidades para JWT."

# Crear archivos en la raíz del proyecto
if [[ ! -f ".env" ]]; then
    touch .env
fi

if [[ ! -f "requirements.txt" ]]; then
    touch requirements.txt
fi

echo "Estructura de directorios y archivos creada o actualizada con éxito."