#!/bin/bash

# Nombre de la base de datos original
DB_ORIGEN="dev.db"

# Archivo de salida
SALIDA="backup.sql"

# Verifica que la base de datos existe
if [ ! -f "$DB_ORIGEN" ]; then
    echo "No se encontró la base de datos: $DB_ORIGEN"
    exit 1
fi

# Dump completo de estructura + datos
sqlite3 "$DB_ORIGEN" .dump > "$SALIDA"

echo "Volcado completado en $SALIDA"
