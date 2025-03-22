#!/bin/bash

DB_NAME="dev.db"

# Verificar si el archivo de la base de datos existe
if [[ ! -f "$DB_NAME" ]]; then
    echo "⚠️  La base de datos '$DB_NAME' no existe."
    exit 1
fi

echo "📂 Mostrando las tablas en la base de datos '$DB_NAME':"
sqlite3 "$DB_NAME" ".tables"

echo -e "\n📊 Mostrando los registros de cada tabla:"
for table in $(sqlite3 "$DB_NAME" ".tables"); do
    echo -e "\n🗃️  Tabla: $table"
    sqlite3 "$DB_NAME" "SELECT * FROM $table;"
done
