
-- Script universal para SQLite, MySQL/MariaDB y PostgreSQL

-- psql -U tu_usuario -h localhost -d neptuno_db -f ruta/al/script.sql
-- sqlite3 dev.db < create_db.sql
-- mysql -u tu_usuario -p neptuno_db < ruta/al/script.sql

-- SQLite version of the database script

-- Tabla de usuarios
CREATE TABLE IF NOT EXISTS usuarios (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT NOT NULL UNIQUE,
    username TEXT NOT NULL UNIQUE,
    password_hash TEXT,
    auth_provider TEXT,
    provider_id TEXT,
    rol TEXT DEFAULT 'user',
    activo INTEGER DEFAULT 1,
    subscription TEXT CHECK(subscription IN ('freemium', 'premium', 'corporate')) DEFAULT 'freemium',
    ciudad TEXT,
    website TEXT,
    credits INTEGER DEFAULT 0,
    create_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    renewal DATETIME,
    last_ip TEXT,
    last_login DATETIME,
    token_valid_until DATETIME
);

-- Tabla de sesiones anónimas
CREATE TABLE IF NOT EXISTS sesiones_anonimas (
    id TEXT PRIMARY KEY,
    username TEXT NOT NULL UNIQUE,
    credits INTEGER DEFAULT 0,
    create_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    ultima_actividad DATETIME,
    last_ip TEXT
);

-- Tabla de configuraciones del sitio
CREATE TABLE IF NOT EXISTS site_settings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    key TEXT NOT NULL UNIQUE,
    value TEXT NOT NULL,
    description TEXT,
    tag TEXT,
    updated_by INTEGER,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de tokens revocados
CREATE TABLE IF NOT EXISTS revoked_tokens (
    token TEXT PRIMARY KEY,
    revoked_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    user_id INTEGER
);

-- Tabla de tokens de reseteo de contraseña
CREATE TABLE IF NOT EXISTS password_reset_tokens (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    token TEXT NOT NULL UNIQUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    expires_at DATETIME,
    FOREIGN KEY (user_id) REFERENCES usuarios(id)
);

-- Tabla de transacciones de créditos
CREATE TABLE IF NOT EXISTS credit_transactions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    session_id TEXT,
    user_type TEXT NOT NULL,
    amount INTEGER NOT NULL,
    transaction_type TEXT NOT NULL,
    description TEXT,
    payment_amount REAL,
    payment_method TEXT,
    payment_status TEXT DEFAULT 'pending',
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES usuarios(id),
    FOREIGN KEY (session_id) REFERENCES sesiones_anonimas(id),
    CHECK (
        (user_id IS NOT NULL AND session_id IS NULL AND user_type = 'registered') OR 
        (user_id IS NULL AND session_id IS NOT NULL AND user_type = 'anonymous')
    )
);

-- Tabla de logs de errores
CREATE TABLE IF NOT EXISTS error_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    session_id TEXT,
    user_type TEXT NOT NULL DEFAULT 'anonymous',
    error_code INTEGER NOT NULL,
    message TEXT NOT NULL,
    details TEXT,
    url TEXT,
    method TEXT,
    ip_address TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES usuarios(id),
    FOREIGN KEY (session_id) REFERENCES sesiones_anonimas(id)
);

-- Tabla de integraciones
CREATE TABLE IF NOT EXISTS integrations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    webhook_url TEXT NOT NULL,
    event_type TEXT NOT NULL,
    active INTEGER DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    last_triggered DATETIME,
    FOREIGN KEY (user_id) REFERENCES usuarios(id)
);

-- Tabla de logs de API
CREATE TABLE IF NOT EXISTS api_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    endpoint TEXT NOT NULL,
    method TEXT NOT NULL,
    status_code INTEGER NOT NULL,
    request_data TEXT,
    response_data TEXT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES usuarios(id)
);

-- Tabla de métodos de pago
CREATE TABLE IF NOT EXISTS payment_methods (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    payment_type TEXT NOT NULL,
    details TEXT NOT NULL,
    is_default INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES usuarios(id)
);

-- Tabla de orígenes permitidos
CREATE TABLE IF NOT EXISTS allowed_origins (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    origin TEXT NOT NULL UNIQUE
);

-- Tabla de tipos de eventos
CREATE TABLE IF NOT EXISTS event_types (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    points_per_event INTEGER DEFAULT 0
);

-- Tabla de badges
CREATE TABLE IF NOT EXISTS badges (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    event_type_id INTEGER NOT NULL,
    required_points INTEGER NOT NULL,
    user_type TEXT DEFAULT 'both',
    FOREIGN KEY (event_type_id) REFERENCES event_types(id)
);

-- Tabla de eventos de gamificación
CREATE TABLE IF NOT EXISTS gamification_events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    event_type_id INTEGER NOT NULL,
    user_id INTEGER,
    session_id TEXT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (event_type_id) REFERENCES event_types(id),
    FOREIGN KEY (user_id) REFERENCES usuarios(id),
    FOREIGN KEY (session_id) REFERENCES sesiones_anonimas(id)
);

-- Tabla de gamificación del usuario
CREATE TABLE IF NOT EXISTS user_gamification (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    session_id TEXT,
    event_type_id INTEGER NOT NULL,
    points INTEGER DEFAULT 0,
    badge_id INTEGER,
    FOREIGN KEY (user_id) REFERENCES usuarios(id),
    FOREIGN KEY (session_id) REFERENCES sesiones_anonimas(id),
    FOREIGN KEY (event_type_id) REFERENCES event_types(id),
    FOREIGN KEY (badge_id) REFERENCES badges(id)
);

-- Insertar datos iniciales

-- Configuraciones iniciales con tags
INSERT OR IGNORE INTO site_settings (key, value, description, tag) VALUES
('token_expiration', '60', 'Tiempo de vida del access token (segundos)', 'auth'),
('refresh_token_expiration', '604800', 'Tiempo de vida del refresh token (7 días)', 'auth'),
('max_login_attempts', '5', 'Máximo de intentos de login antes de bloqueo', 'auth'),
('rate_limit_auth', '{"times": 20, "seconds": 60}', 'Límite de peticiones para auth', 'rate_limit'),
('rate_limit_api', '{"times": 100, "seconds": 60}', 'Límite de peticiones para API', 'rate_limit'),
('rate_limit_admin', '{"times": 50, "seconds": 60}', 'Límite de peticiones para admin', 'rate_limit'),
('cache_ttl', '300', 'Tiempo de vida del caché en Redis (segundos)', 'cache'),
('cache_enabled', 'true', 'Habilitar/deshabilitar el caché', 'cache'),
('cache_max_size', '10000', 'Tamaño máximo del caché en entradas', 'cache'),
('allowed_origins', '["http://localhost:3000", "https://neptuno.app"]', 'Orígenes permitidos para CORS', 'cors'),
('cors_enabled', 'true', 'Habilitar/deshabilitar CORS', 'cors'),
('celery_workers', '4', 'Número de workers de Celery', 'celery'),
('celery_task_timeout', '300', 'Tiempo máximo de ejecución de tareas Celery (segundos)', 'celery'),
('celery_max_retries', '3', 'Máximo de reintentos para tareas Celery', 'celery'),
('db_pool_size', '20', 'Tamaño del pool de conexiones a la DB', 'database'),
('db_max_overflow', '10', 'Conexiones adicionales permitidas en el pool', 'database'),
('db_pool_timeout', '30', 'Tiempo de espera para una conexión del pool (segundos)', 'database'),
('freemium_credits', '100', 'Créditos iniciales para suscripción freemium', 'credits'),
('premium_credits', '1000', 'Créditos iniciales para suscripción premium', 'credits'),
('corporate_credits', '5000', 'Créditos iniciales para suscripción corporativa', 'credits'),
('credit_reset_interval', '30', 'Intervalo de reinicio de créditos (días)', 'credits'),
('log_level', '"INFO"', 'Nivel de logging', 'logging'),
('log_retention_days', '90', 'Días de retención de logs', 'logging'),
('maintenance_mode', 'false', 'Activar/desactivar modo mantenimiento', 'system'),
('api_version', '"1.0.0"', 'Versión actual de la API', 'system');

-- Usuarios iniciales
INSERT OR IGNORE INTO usuarios (email, username, password_hash, subscription, credits, rol, create_at, activo) VALUES
('freemium@example.com', 'freemium_user', '$2b$12$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW', 'FREEMIUM', 100, 'user', datetime('now'), 1),
('premium@example.com', 'premium_user', '$2b$12$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW', 'PREMIUM', 1000, 'user', datetime('now'), 1),
('corporate@example.com', 'corporate_user', '$2b$12$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW', 'CORPORATE', 5000, 'user', datetime('now'), 1),
('admin@example.com', 'admin_user', '$2b$12$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW', 'PREMIUM', 1000, 'admin', datetime('now'), 1),
('testuser1@example.com', 'test_user1', '$2b$12$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW', 'FREEMIUM', 100, 'user', datetime('now'), 1),
('testadmin@example.com', 'test_admin', '$2b$12$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW', 'CORPORATE', 5000, 'admin', datetime('now'), 1);

-- Orígenes permitidos
INSERT OR IGNORE INTO allowed_origins (origin) VALUES
('http://localhost:3000'),
('https://neptuno.app'),
('https://api.example.com'),
('https://app.example.com');

-- Sesiones anónimas
INSERT OR IGNORE INTO sesiones_anonimas (id, username, credits, create_at, ultima_actividad, last_ip) VALUES
(hex(randomblob(16)), 'anon_user_1', 100, datetime('now'), datetime('now'), '192.168.1.1'),
(hex(randomblob(16)), 'anon_user_2', 90, datetime('now', '-1 day'), datetime('now', '-1 hour'), '192.168.1.2'),
(hex(randomblob(16)), 'anon_user_3', 80, datetime('now', '-2 days'), datetime('now', '-2 hours'), '192.168.1.3');

-- Transacciones de créditos (para usuarios registrados)
INSERT OR IGNORE INTO credit_transactions (user_id, user_type, amount, transaction_type, description, timestamp) VALUES
((SELECT id FROM usuarios WHERE email = 'freemium@example.com'), 'registered', -10, 'api_call', 'Llamada a API de procesamiento', datetime('now')),
((SELECT id FROM usuarios WHERE email = 'premium@example.com'), 'registered', 500, 'purchase', 'Compra de créditos', datetime('now'));

-- Transacciones de créditos (para sesiones anónimas)
INSERT OR IGNORE INTO credit_transactions (session_id, user_type, amount, transaction_type, description, timestamp) VALUES
((SELECT id FROM sesiones_anonimas WHERE username = 'anon_user_1'), 'anonymous', -5, 'api_call', 'Llamada a API demo', datetime('now')),
((SELECT id FROM sesiones_anonimas WHERE username = 'anon_user_2'), 'anonymous', -15, 'api_call', 'Procesamiento de datos', datetime('now'));

-- Logs de errores
INSERT OR IGNORE INTO error_logs (user_id, user_type, error_code, message, details, url, method, ip_address, created_at) VALUES
((SELECT id FROM usuarios WHERE email = 'freemium@example.com'), 'registered', 400, 'Invalid request parameters', 'Missing required field ''email''', '/api/v1/users', 'POST', '192.168.1.100', datetime('now')),
((SELECT id FROM sesiones_anonimas WHERE username = 'anon_user_1'), 'anonymous', 429, 'Rate limit exceeded', 'Too many requests from this IP', '/api/v1/process', 'POST', '192.168.1.101', datetime('now')),
((SELECT id FROM usuarios WHERE email = 'corporate@example.com'), 'registered', 500, 'Internal server error', 'Database connection timeout', '/api/v1/credits', 'GET', '192.168.1.102', datetime('now'));

-- Integraciones
INSERT OR IGNORE INTO integrations (user_id, name, webhook_url, event_type, active, created_at, last_triggered) VALUES
((SELECT id FROM usuarios WHERE email = 'premium@example.com'), 'slack', 'https://hooks.slack.com/services/TXXXXX/BXXXXX/XXXXX', 'credit_usage', 1, datetime('now'), datetime('now', '-2 hours')),
((SELECT id FROM usuarios WHERE email = 'admin@example.com'), 'zapier', 'https://hooks.zapier.com/hooks/catch/XXXXX/XXXXX', 'user_login', 1, datetime('now'), NULL),
((SELECT id FROM usuarios WHERE email = 'corporate@example.com'), 'crm_custom', 'https://api.crm.com/webhook/XXXXX', 'payment_added', 0, datetime('now'), NULL);

-- Logs de API
INSERT OR IGNORE INTO api_logs (user_id, endpoint, method, status_code, request_data, response_data, timestamp) VALUES
((SELECT id FROM usuarios WHERE email = 'freemium@example.com'), '/api/v1/auth/login', 'POST', 200, '{"email": "user@example.com", "password": "****"}', '{"token": "xxxx.yyyy.zzzz"}', datetime('now')),
(NULL, '/api/v1/process', 'POST', 201, '{"data": "sample data"}', '{"result": "processed", "credits_used": 5}', datetime('now')),
((SELECT id FROM usuarios WHERE email = 'admin@example.com'), '/api/v1/admin/users', 'GET', 200, NULL, '{"count": 42, "users": []}', datetime('now'));

-- Métodos de pago
INSERT OR IGNORE INTO payment_methods (user_id, payment_type, details, is_default, created_at, updated_at) VALUES
((SELECT id FROM usuarios WHERE email = 'premium@example.com'), 'credit_card', 'VISA ending in 4242', 1, datetime('now'), datetime('now')),
((SELECT id FROM usuarios WHERE email = 'premium@example.com'), 'paypal', 'user@example.com', 0, datetime('now'), datetime('now')),
((SELECT id FROM usuarios WHERE email = 'corporate@example.com'), 'bank_transfer', 'IBAN: ESXX XXXX XXXX XXXX XXXX', 1, datetime('now'), datetime('now'));

-- Tokens revocados
INSERT OR IGNORE INTO revoked_tokens (token, revoked_at, user_id) VALUES
('expired.token.xxxx', datetime('now', '-30 days'), (SELECT id FROM usuarios WHERE email = 'freemium@example.com')),
('compromised.token.yyyy', datetime('now', '-2 hours'), (SELECT id FROM usuarios WHERE email = 'premium@example.com'));

-- Tokens de reseteo de contraseña
INSERT OR IGNORE INTO password_reset_tokens (user_id, token, created_at, expires_at) VALUES
((SELECT id FROM usuarios WHERE email = 'freemium@example.com'), 'reset_token_123', datetime('now'), datetime('now', '+1 hour')),
((SELECT id FROM usuarios WHERE email = 'admin@example.com'), 'reset_token_456', datetime('now'), datetime('now', '+1 hour'));

-- Insertar datos iniciales para gamificación
INSERT OR IGNORE INTO event_types (name, description, points_per_event) VALUES
('api_usage', 'Eventos por uso de la API', 5),
('test_api', 'Eventos de prueba', 10);

INSERT OR IGNORE INTO badges (name, description, event_type_id, required_points, user_type) VALUES
('Novato', 'Primeros pasos en la API', 1, 5, 'both'),
('Becario', 'Uso intermedio de la API', 1, 100, 'both'),
('Junior', 'Uso avanzado de la API', 1, 500, 'registered'),
('Senior', 'Maestro de la API', 1, 1000, 'registered'),
('Tester', 'Participante en pruebas', 2, 10, 'both');

-- Insertar eventos de prueba
INSERT OR IGNORE INTO gamification_events (event_type_id, user_id, timestamp) VALUES
(2, (SELECT id FROM usuarios WHERE email = 'testuser1@example.com'), datetime('now'));

INSERT OR IGNORE INTO gamification_events (event_type_id, session_id, timestamp) VALUES
(2, (SELECT id FROM sesiones_anonimas WHERE username = 'anon_user_1'), datetime('now'));

-- Actualizar gamificación de usuarios de prueba
INSERT OR IGNORE INTO user_gamification (user_id, event_type_id, points, badge_id) VALUES
((SELECT id FROM usuarios WHERE email = 'testuser1@example.com'), 2, 10, (SELECT id FROM badges WHERE name = 'Tester'));

INSERT OR IGNORE INTO user_gamification (session_id, event_type_id, points, badge_id) VALUES
((SELECT id FROM sesiones_anonimas WHERE username = 'anon_user_1'), 2, 10, (SELECT id FROM badges WHERE name = 'Tester'));


-- Script universal para SQLite, MySQL/MariaDB y PostgreSQL

-- ... (Tablas existentes como usuarios, sesiones_anonimas, etc., se mantienen igual hasta api_logs)

-- Tabla de tipos de eventos
CREATE TABLE IF NOT EXISTS event_types (
    id INTEGER PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(50) NOT NULL UNIQUE,
    description VARCHAR(255),
    points_per_event INTEGER DEFAULT 0
);

-- Tabla de badges
CREATE TABLE IF NOT EXISTS badges (
    id INTEGER PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(50) NOT NULL UNIQUE,
    description VARCHAR(255),
    event_type_id INTEGER NOT NULL,
    required_points INTEGER NOT NULL,
    user_type VARCHAR(20) DEFAULT 'both',
    FOREIGN KEY (event_type_id) REFERENCES event_types(id)
);

-- Tabla de eventos de gamificación
CREATE TABLE IF NOT EXISTS gamification_events (
    id INTEGER PRIMARY KEY AUTO_INCREMENT,
    event_type_id INTEGER NOT NULL,
    user_id INTEGER,
    session_id VARCHAR(36),
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (event_type_id) REFERENCES event_types(id),
    FOREIGN KEY (user_id) REFERENCES usuarios(id),
    FOREIGN KEY (session_id) REFERENCES sesiones_anonimas(id)
);

-- Tabla de gamificación del usuario
CREATE TABLE IF NOT EXISTS user_gamification (
    id INTEGER PRIMARY KEY AUTO_INCREMENT,
    user_id INTEGER,
    session_id VARCHAR(36),
    event_type_id INTEGER NOT NULL,
    points INTEGER DEFAULT 0,
    badge_id INTEGER,
    FOREIGN KEY (user_id) REFERENCES usuarios(id),
    FOREIGN KEY (session_id) REFERENCES sesiones_anonimas(id),
    FOREIGN KEY (event_type_id) REFERENCES event_types(id),
    FOREIGN KEY (badge_id) REFERENCES badges(id)
);

-- ... (Resto de las tablas existentes como payment_methods, allowed_origins, etc.)

-- Insertar datos iniciales para gamificación
INSERT OR IGNORE INTO event_types (name, description, points_per_event) VALUES
('api_usage', 'Eventos por uso de la API', 5),
('test_api', 'Eventos de prueba', 10);

INSERT OR IGNORE INTO badges (name, description, event_type_id, required_points, user_type) VALUES
('Novato', 'Primeros pasos en la API', 1, 5, 'both'),
('Becario', 'Uso intermedio de la API', 1, 100, 'both'),
('Junior', 'Uso avanzado de la API', 1, 500, 'registered'),
('Senior', 'Maestro de la API', 1, 1000, 'registered'),
('Tester', 'Participante en pruebas', 2, 10, 'both');

-- Insertar eventos de prueba sin usar variables ni NOW()

INSERT OR IGNORE INTO gamification_events (event_type_id, user_id, timestamp)
VALUES (2, (SELECT id FROM usuarios WHERE email = 'testuser1@example.com'), datetime('now'));

INSERT OR IGNORE INTO gamification_events (event_type_id, session_id, timestamp)
VALUES (2, (SELECT id FROM sesiones_anonimas WHERE username = 'anon_user_1'), datetime('now'));

-- Actualizar gamificación de usuarios de prueba sin variables
INSERT OR IGNORE INTO user_gamification (user_id, event_type_id, points, badge_id)
VALUES ((SELECT id FROM usuarios WHERE email = 'testuser1@example.com'), 2, 10, (SELECT id FROM badges WHERE name = 'Tester'));

INSERT OR IGNORE INTO user_gamification (session_id, event_type_id, points, badge_id)
VALUES ((SELECT id FROM sesiones_anonimas WHERE username = 'anon_user_1'), 2, 10, (SELECT id FROM badges WHERE name = 'Tester'));

-- Mensaje final
SELECT '✅ Base de datos inicializada con datos de ejemplo, incluyendo gamificación.' AS message;


-- Mensaje final
SELECT '✅ Base de datos inicializada con datos de ejemplo, incluyendo gamificación.' AS message;