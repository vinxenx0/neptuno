-- Script universal para SQLite, MySQL/MariaDB y PostgreSQL

-- psql -U tu_usuario -h localhost -d neptuno_db -f ruta/al/script.sql
-- sqlite3 dev.db < create_db.sql
-- mysql -u tu_usuario -p neptuno_db < ruta/al/script.sql

-- Tabla de usuarios
CREATE TABLE IF NOT EXISTS usuarios (
    id INTEGER PRIMARY KEY AUTO_INCREMENT,
    email VARCHAR(255) NOT NULL UNIQUE,
    username VARCHAR(50) NOT NULL UNIQUE,
    password_hash VARCHAR(255),
    auth_provider VARCHAR(20),
    provider_id VARCHAR(255),
    rol VARCHAR(20) DEFAULT 'user',
    activo BOOLEAN DEFAULT TRUE,
    subscription ENUM('freemium', 'premium', 'corporate') DEFAULT 'freemium',
    ciudad VARCHAR(100),
    website VARCHAR(255),
    credits INTEGER DEFAULT 100,
    create_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    renewal DATETIME,
    last_ip VARCHAR(45),
    last_login DATETIME,
    token_valid_until DATETIME
);

-- Tabla de sesiones anónimas
CREATE TABLE IF NOT EXISTS sesiones_anonimas (
    id VARCHAR(36) PRIMARY KEY,
    credits INTEGER DEFAULT 100,
    create_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    ultima_actividad DATETIME,
    last_ip VARCHAR(45)
);

-- Tabla de configuraciones del sitio
CREATE TABLE IF NOT EXISTS site_settings (
    id INTEGER PRIMARY KEY AUTO_INCREMENT,
    key VARCHAR(50) NOT NULL UNIQUE,
    value VARCHAR(255) NOT NULL,
    description VARCHAR(255),
    tag VARCHAR(50),
    updated_by INTEGER,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Tabla de tokens revocados
CREATE TABLE IF NOT EXISTS revoked_tokens (
    token VARCHAR(500) PRIMARY KEY,
    revoked_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    user_id INTEGER
);

-- Tabla de tokens de reseteo de contraseña
CREATE TABLE IF NOT EXISTS password_reset_tokens (
    id INTEGER PRIMARY KEY AUTO_INCREMENT,
    user_id INTEGER NOT NULL,
    token VARCHAR(100) NOT NULL UNIQUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    expires_at DATETIME,
    FOREIGN KEY (user_id) REFERENCES usuarios(id)
);

-- Tabla de transacciones de créditos
CREATE TABLE IF NOT EXISTS credit_transactions (
    id INTEGER PRIMARY KEY AUTO_INCREMENT,
    user_id INTEGER,
    session_id VARCHAR(36),
    user_type VARCHAR(20) NOT NULL,
    amount INTEGER NOT NULL,
    transaction_type VARCHAR(50) NOT NULL,
    description VARCHAR(255),
    payment_amount FLOAT,
    payment_method VARCHAR(50),
    payment_status VARCHAR(20) DEFAULT 'pending',
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES usuarios(id),
    FOREIGN KEY (session_id) REFERENCES sesiones_anonimas(id),
    CONSTRAINT check_user_or_session CHECK (
        (user_id IS NOT NULL AND session_id IS NULL AND user_type = 'registered') OR 
        (user_id IS NULL AND session_id IS NOT NULL AND user_type = 'anonymous')
    )
);

-- Tabla de logs de errores
CREATE TABLE IF NOT EXISTS error_logs (
    id INTEGER PRIMARY KEY AUTO_INCREMENT,
    user_id INTEGER,
    session_id VARCHAR(36),
    user_type VARCHAR(20) NOT NULL DEFAULT 'anonymous',
    error_code INTEGER NOT NULL,
    message VARCHAR(255) NOT NULL,
    details TEXT,
    url VARCHAR(255),
    method VARCHAR(10),
    ip_address VARCHAR(45),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES usuarios(id),
    FOREIGN KEY (session_id) REFERENCES sesiones_anonimas(id)
);

-- Tabla de integraciones
CREATE TABLE IF NOT EXISTS integrations (
    id INTEGER PRIMARY KEY AUTO_INCREMENT,
    user_id INTEGER NOT NULL,
    name VARCHAR(50) NOT NULL,
    webhook_url VARCHAR(255) NOT NULL,
    event_type VARCHAR(50) NOT NULL,
    active BOOLEAN DEFAULT TRUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    last_triggered DATETIME,
    FOREIGN KEY (user_id) REFERENCES usuarios(id)
);

-- Tabla de logs de API
CREATE TABLE IF NOT EXISTS api_logs (
    id INTEGER PRIMARY KEY AUTO_INCREMENT,
    user_id INTEGER,
    endpoint VARCHAR(255) NOT NULL,
    method VARCHAR(10) NOT NULL,
    status_code INTEGER NOT NULL,
    request_data TEXT,
    response_data TEXT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES usuarios(id)
);

-- Tabla de métodos de pago
CREATE TABLE IF NOT EXISTS payment_methods (
    id INTEGER PRIMARY KEY AUTO_INCREMENT,
    user_id INTEGER NOT NULL,
    payment_type VARCHAR(20) NOT NULL,
    details VARCHAR(255) NOT NULL,
    is_default BOOLEAN DEFAULT FALSE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES usuarios(id)
);

-- Tabla de orígenes permitidos
CREATE TABLE IF NOT EXISTS allowed_origins (
    id INTEGER PRIMARY KEY AUTO_INCREMENT,
    origin VARCHAR(255) NOT NULL UNIQUE
);