#!/bin/bash

# Script para gestionar backups de volúmenes Docker
# Este script permite realizar backups completos e incrementales de volúmenes Docker,

# 0 0 * * 0 /path/to/backups/docker_backup_manager.sh 1 >> /path/to/backups/backup.log 2>&1


# Directorios de almacenamiento de backups
BACKUP_DIR="backups/docker_volumes"
VOLUME_DIR="/var/lib/docker/volumes"
LOG_FILE="backups/backup_manager.log"
DATE=$(date +\%Y-\%m-\%d_\%H-\%M-\%S)

# Volúmenes que quieres respaldar
VOLUMES=("mariadb_data" "nginx_logs" "frontend_logs")

# Función para realizar un backup completo
backup_full() {
    echo "Iniciando backup completo a las $DATE" >>$LOG_FILE
    for VOLUME in "${VOLUMES[@]}"; do
        VOLUME_PATH="$VOLUME_DIR/$VOLUME/_data"
        BACKUP_FILE="$BACKUP_DIR/full_backup_$VOLUME_$DATE.tar.gz"

        # Crear backup
        tar -czf $BACKUP_FILE -C $VOLUME_PATH .

        # Verificar si el backup fue exitoso
        if [ $? -eq 0 ]; then
            echo "Backup completo para $VOLUME realizado exitosamente: $BACKUP_FILE" >>$LOG_FILE
        else
            echo "Error en el backup de $VOLUME" >>$LOG_FILE
        fi
    done
}

# Función para realizar un backup incremental usando rsync
backup_incremental() {
    echo "Iniciando backup incremental a las $DATE" >>$LOG_FILE
    for VOLUME in "${VOLUMES[@]}"; do
        VOLUME_PATH="$VOLUME_DIR/$VOLUME/_data"
        INCREMENTAL_DIR="$BACKUP_DIR/incremental/$VOLUME"
        BACKUP_FILE="$BACKUP_DIR/incremental/backup_$VOLUME_$DATE.tar.gz"

        # Crear directorio incremental si no existe
        mkdir -p $INCREMENTAL_DIR

        # Hacer backup incremental con rsync
        rsync -av --link-dest=$INCREMENTAL_DIR $VOLUME_PATH $INCREMENTAL_DIR

        # Comprimir backup incremental
        tar -czf $BACKUP_FILE -C $BACKUP_DIR incremental/$VOLUME

        # Verificar si el backup fue exitoso
        if [ $? -eq 0 ]; then
            echo "Backup incremental para $VOLUME realizado exitosamente: $BACKUP_FILE" >>$LOG_FILE
        else
            echo "Error en el backup incremental de $VOLUME" >>$LOG_FILE
        fi
    done
}

# Función para restaurar un backup
restore_backup() {
    BACKUP_FILE=$1
    VOLUME_NAME=$2
    echo "Iniciando restauración de $BACKUP_FILE para $VOLUME_NAME" >>$LOG_FILE

    if [ -f "$BACKUP_FILE" ]; then
        echo "Restaurando desde $BACKUP_FILE..." >>$LOG_FILE
        tar -xzf $BACKUP_FILE -C $VOLUME_DIR/$VOLUME_NAME/_data/

        # Verificar si la restauración fue exitosa
        if [ $? -eq 0 ]; then
            echo "Restauración de $VOLUME_NAME desde $BACKUP_FILE completada." >>$LOG_FILE
        else
            echo "Error en la restauración de $VOLUME_NAME desde $BACKUP_FILE" >>$LOG_FILE
        fi
    else
        echo "Archivo de backup $BACKUP_FILE no encontrado." >>$LOG_FILE
    fi
}

# Función para eliminar backups antiguos
delete_old_backups() {
    DAYS_TO_KEEP=$1
    echo "Eliminando backups antiguos de más de $DAYS_TO_KEEP días..." >>$LOG_FILE

    find $BACKUP_DIR -type f -name "*.tar.gz" -mtime +$DAYS_TO_KEEP -exec rm {} \;

    echo "Backups antiguos eliminados." >>$LOG_FILE
}

# Función para ver el estado de los backups
show_backup_status() {
    echo "Mostrando el estado de los backups..." >>$LOG_FILE
    ls -lh $BACKUP_DIR
}

# Mostrar menú
echo "----------------------------"
echo "Gestión de Backups Docker"
echo "1. Backup Completo"
echo "2. Backup Incremental"
echo "3. Restaurar Backup"
echo "4. Eliminar Backups Antiguos"
echo "5. Ver estado de los Backups"
echo "6. Salir"
echo "----------------------------"
read -p "Seleccione una opción: " option

# Ejecutar según la opción
case $option in
1)
    backup_full
    ;;
2)
    backup_incremental
    ;;
3)
    read -p "Ingrese la ruta del backup a restaurar: " backup_file
    read -p "Ingrese el nombre del volumen a restaurar: " volume_name
    restore_backup $backup_file $volume_name
    ;;
4)
    read -p "¿Cuántos días mantener los backups? (Ej: 30): " days
    delete_old_backups $days
    ;;
5)
    show_backup_status
    ;;
6)
    echo "Saliendo..." >>$LOG_FILE
    exit 0
    ;;
*)
    echo "Opción inválida" >>$LOG_FILE
    ;;
esac
