PRAGMA foreign_keys=OFF;
BEGIN TRANSACTION;
CREATE TABLE usuarios (
	id INTEGER NOT NULL, 
	email VARCHAR(255) NOT NULL, 
	username VARCHAR(50) NOT NULL, 
	password_hash VARCHAR(255), 
	auth_provider VARCHAR(20), 
	provider_id VARCHAR(255), 
	rol VARCHAR(20), 
	activo BOOLEAN, 
	subscription VARCHAR(9), 
	ciudad VARCHAR(100), 
	website VARCHAR(255), 
	credits INTEGER, 
	create_at DATETIME, 
	renewal DATETIME, 
	last_ip VARCHAR(45), 
	last_login DATETIME, 
	token_valid_until DATETIME, 
	PRIMARY KEY (id)
);
INSERT INTO usuarios VALUES(1,'freemium@example.com','freemium_user','$2b$12$Qbxinxz3wbAhDx1jwsi3WewH/LwSBNaovSRnwAF6OMsTg.RlFqS3m',NULL,NULL,'user',1,'FREEMIUM',NULL,NULL,1,'2025-04-03 10:45:53.861734','2025-04-03 10:48:46.170888',NULL,NULL,NULL);
INSERT INTO usuarios VALUES(2,'premium@example.com','premium_user','$2b$12$Cc7xz7ja8PcCpjfI0F6TDecTWSQk6VPqbhBeSkltQvfjAcRDGd73G',NULL,NULL,'user',1,'PREMIUM',NULL,NULL,1000,'2025-04-03 10:45:54.147097','2025-04-03 10:48:46.171070',NULL,NULL,NULL);
INSERT INTO usuarios VALUES(3,'corporate@example.com','corporate_user','$2b$12$ryerT3S4gp4LIvNN8Eu19uoRt0ZRQOUDeaNt27x50v5e9oeDvMAHa',NULL,NULL,'user',1,'CORPORATE',NULL,NULL,1000,'2025-04-03 10:45:54.438423','2025-04-03 10:48:46.171159',NULL,NULL,NULL);
INSERT INTO usuarios VALUES(4,'admin@example.com','admin_user','$2b$12$mSQISiTT0/babKkzsQbNB.WAs6DnyQF6wUFuyRmZPCHMJQMyLESgu',NULL,NULL,'admin',1,'PREMIUM','admin city','web admin',124523,'2025-04-03 10:45:54.737924','2025-04-03 10:48:46.171208','127.0.0.1','2025-04-10 10:05:58.101267',NULL);

CREATE TABLE sesiones_anonimas (
	id VARCHAR(36) NOT NULL, 
	username VARCHAR(50) NOT NULL, 
	credits INTEGER, 
	create_at DATETIME, 
	ultima_actividad DATETIME, 
	last_ip VARCHAR(45), 
	PRIMARY KEY (id), 
	UNIQUE (username)
);

CREATE TABLE event_types (
	id INTEGER NOT NULL, 
	name VARCHAR(50) NOT NULL, 
	description VARCHAR(255), 
	points_per_event INTEGER, 
	PRIMARY KEY (id), 
	UNIQUE (name)
);

INSERT INTO event_types VALUES(1,'api_usage','Uso de la API',10);
INSERT INTO event_types VALUES(2,'login','Inicio de sesión exitoso',5);
INSERT INTO event_types VALUES(3,'purchase','Compra de créditos',50);
INSERT INTO event_types VALUES(4,'test_api','Eventos de prueba',10);
INSERT INTO event_types VALUES(5,'tesr','tyres',5);
INSERT INTO event_types VALUES(6,'survey_question','Responder una pregunta de la encuesta',1);
INSERT INTO event_types VALUES(7,'survey_completed','Completar la encuesta',0);
INSERT INTO event_types VALUES(8,'registration_field','Rellenar un campo de registro',1);
INSERT INTO event_types VALUES(9,'registration_completed','Completar el registro',0);
INSERT INTO event_types VALUES(10,'subscription_list','Suscribirse a una lista',1);
INSERT INTO event_types VALUES(11,'all_subscriptions','Suscribirse a todas las listas',0);


CREATE TABLE revoked_tokens (
	token VARCHAR(500) NOT NULL, 
	revoked_at DATETIME, 
	user_id INTEGER, 
	PRIMARY KEY (token)
);

INSERT INTO revoked_tokens VALUES('expired.token.xxxx','2025-03-04 10:45:55.317705',1);
INSERT INTO revoked_tokens VALUES('compromised.token.yyyy','2025-04-03 08:45:55.317714',2);

CREATE TABLE site_settings (
	id INTEGER NOT NULL, 
	"key" VARCHAR(50) NOT NULL, 
	value VARCHAR(255) NOT NULL, 
	description VARCHAR(255), 
	tag VARCHAR(50), 
	updated_by INTEGER, 
	updated_at DATETIME, 
	PRIMARY KEY (id), 
	UNIQUE ("key")
);

INSERT INTO site_settings VALUES(1,'token_expiration','60','Tiempo de vida del access token (segundos)','auth',NULL,'2025-04-03 10:45:55.303092');
INSERT INTO site_settings VALUES(2,'refresh_token_expiration','604800','Tiempo de vida del refresh token (7 días)','auth',NULL,'2025-04-03 10:45:55.303096');
INSERT INTO site_settings VALUES(3,'max_login_attempts','5','Máximo de intentos de login antes de bloqueo','auth',NULL,'2025-04-03 10:45:55.303098');
INSERT INTO site_settings VALUES(4,'rate_limit_auth','{"times": 20, "seconds": 60}','Límite de peticiones para auth','rate_limit',NULL,'2025-04-03 10:45:55.303099');
INSERT INTO site_settings VALUES(5,'rate_limit_api','{"times": 100, "seconds": 60}','Límite de peticiones para API','rate_limit',NULL,'2025-04-03 10:45:55.303101');
INSERT INTO site_settings VALUES(6,'rate_limit_admin','{"times": 50, "seconds": 60}','Límite de peticiones para admin','rate_limit',NULL,'2025-04-03 10:45:55.303103');
INSERT INTO site_settings VALUES(7,'cache_ttl','300','Tiempo de vida del caché en Redis (segundos)','cache',NULL,'2025-04-03 10:45:55.303104');
INSERT INTO site_settings VALUES(8,'cache_enabled','true','Habilitar/deshabilitar el caché','cache',NULL,'2025-04-03 10:45:55.303106');
INSERT INTO site_settings VALUES(9,'cache_max_size','10000','Tamaño máximo del caché en entradas','cache',NULL,'2025-04-03 10:45:55.303107');
INSERT INTO site_settings VALUES(10,'allowed_origins','["http://localhost:3000", "https://neptuno.app", "test"]','Orígenes permitidos para CORS','cors',NULL,'2025-04-08 14:53:42.185359');
INSERT INTO site_settings VALUES(11,'cors_enabled','true','Habilitar/deshabilitar CORS','cors',NULL,'2025-04-03 10:45:55.303111');
INSERT INTO site_settings VALUES(12,'celery_workers','4','Número de workers de Celery','celery',NULL,'2025-04-03 10:45:55.303112');
INSERT INTO site_settings VALUES(13,'celery_task_timeout','300','Tiempo máximo de ejecución de tareas Celery (segundos)','celery',NULL,'2025-04-03 10:45:55.303114');
INSERT INTO site_settings VALUES(14,'celery_max_retries','3','Máximo de reintentos para tareas Celery','celery',NULL,'2025-04-03 10:45:55.303115');
INSERT INTO site_settings VALUES(15,'db_pool_size','20','Tamaño del pool de conexiones a la DB','database',NULL,'2025-04-03 10:45:55.303117');
INSERT INTO site_settings VALUES(16,'db_max_overflow','10','Conexiones adicionales permitidas en el pool','database',NULL,'2025-04-03 10:45:55.303118');
INSERT INTO site_settings VALUES(17,'db_pool_timeout','30','Tiempo de espera para una conexión del pool (segundos)','database',NULL,'2025-04-03 10:45:55.303120');
INSERT INTO site_settings VALUES(18,'freemium_credits','100','Créditos iniciales para suscripción freemium','credits',NULL,'2025-04-03 10:45:55.303122');
INSERT INTO site_settings VALUES(19,'premium_credits','1000','Créditos iniciales para suscripción premium','credits',NULL,'2025-04-03 10:45:55.303123');
INSERT INTO site_settings VALUES(20,'corporate_credits','5000','Créditos iniciales para suscripción corporativa','credits',NULL,'2025-04-03 10:45:55.303125');
INSERT INTO site_settings VALUES(21,'credit_reset_interval','30','Intervalo de reinicio de créditos (días)','credits',NULL,'2025-04-03 10:45:55.303126');
INSERT INTO site_settings VALUES(22,'log_level','"INFO"','Nivel de logging','logging',NULL,'2025-04-03 10:45:55.303128');
INSERT INTO site_settings VALUES(23,'log_retention_days','90','Días de retención de logs','logging',NULL,'2025-04-03 10:45:55.303130');
INSERT INTO site_settings VALUES(24,'maintenance_mode','false','Activar/desactivar modo mantenimiento','system',NULL,'2025-04-03 10:45:55.303131');
INSERT INTO site_settings VALUES(25,'api_version','"1.0.0"','Versión actual de la API','system',NULL,'2025-04-03 10:45:55.303133');
INSERT INTO site_settings VALUES(26,'enable_registration','"false"',NULL,NULL,NULL,'2025-04-08 19:04:41.439601');
INSERT INTO site_settings VALUES(27,'enable_payment_methods','"true"',NULL,NULL,NULL,'2025-04-05 13:48:44.070527');
INSERT INTO site_settings VALUES(28,'enable_gamification','"true"',NULL,NULL,NULL,'2025-04-04 15:08:31.058845');
INSERT INTO site_settings VALUES(29,'enable_social_login','"false"',NULL,NULL,NULL,'2025-04-08 19:04:43.027686');
INSERT INTO site_settings VALUES(30,'enable_badges','"true"',NULL,NULL,NULL,'2025-04-06 18:54:30.409629');
INSERT INTO site_settings VALUES(31,'enable_points','"true"',NULL,NULL,NULL,'2025-04-06 18:54:31.329235');
INSERT INTO site_settings VALUES(32,'enable_coupons','"true"',NULL,NULL,NULL,'2025-04-10 08:21:06.127707');
INSERT INTO site_settings VALUES(33,'disable_anonymous_users','"false"',NULL,NULL,NULL,'2025-04-10 09:50:27.641205');

CREATE TABLE allowed_origins (
	id INTEGER NOT NULL, 
	origin VARCHAR(255) NOT NULL, 
	PRIMARY KEY (id), 
	UNIQUE (origin)
);
INSERT INTO allowed_origins VALUES(1,'http://localhost:3000');
INSERT INTO allowed_origins VALUES(2,'https://neptuno.app');
INSERT INTO allowed_origins VALUES(3,'https://api.example.com');

CREATE TABLE badges (
	id INTEGER NOT NULL, 
	name VARCHAR(50) NOT NULL, 
	description VARCHAR(255), 
	event_type_id INTEGER NOT NULL, 
	required_points INTEGER NOT NULL, 
	user_type VARCHAR(20), 
	PRIMARY KEY (id), 
	UNIQUE (name), 
	FOREIGN KEY(event_type_id) REFERENCES event_types (id)
);
INSERT INTO badges VALUES(1,'Novato','Primer uso de la API',1,10,'both');
INSERT INTO badges VALUES(2,'Experto','Más de 100 usos de la API',1,100,'both');
INSERT INTO badges VALUES(3,'Comprador','Primera compra de créditos',3,50,'registered');
INSERT INTO badges VALUES(4,'Becario','Uso intermedio de la API',1,100,'both');
INSERT INTO badges VALUES(5,'Junior','Uso avanzado de la API',1,500,'registered');
INSERT INTO badges VALUES(6,'Senior','Maestro de la API',1,1000,'registered');
INSERT INTO badges VALUES(7,'Tester','Participante en pruebas',2,10,'both');
INSERT INTO badges VALUES(8,'test','test',5,12,'both');
INSERT INTO badges VALUES(9,'Encuestador','Completar una encuesta',7,0,'both');
INSERT INTO badges VALUES(10,'Registrado','Completar el registro',9,0,'both');
INSERT INTO badges VALUES(11,'Suscriptor','Suscribirse a todas las listas',11,0,'both');

CREATE TABLE gamification_events (
	id INTEGER NOT NULL, 
	event_type_id INTEGER NOT NULL, 
	user_id INTEGER, 
	session_id VARCHAR(36), 
	timestamp DATETIME, 
	PRIMARY KEY (id), 
	FOREIGN KEY(event_type_id) REFERENCES event_types (id), 
	FOREIGN KEY(user_id) REFERENCES usuarios (id), 
	FOREIGN KEY(session_id) REFERENCES sesiones_anonimas (id)
);

INSERT INTO gamification_events VALUES(1,1,1,NULL,'2025-04-03 10:45:55.355293');
INSERT INTO gamification_events VALUES(2,2,2,NULL,'2025-04-03 10:45:55.356397');
INSERT INTO gamification_events VALUES(3,3,2,NULL,'2025-04-03 10:45:55.356905');
INSERT INTO gamification_events VALUES(4,2,5,NULL,'2025-04-03 12:58:37');
INSERT INTO gamification_events VALUES(5,2,NULL,'69fa5be7-1433-4df4-917b-b8a2607877dc','2025-04-03 12:58:37');
INSERT INTO gamification_events VALUES(6,2,5,NULL,'2025-04-03 12:59:44');
INSERT INTO gamification_events VALUES(7,2,NULL,'69fa5be7-1433-4df4-917b-b8a2607877dc','2025-04-03 12:59:44');
INSERT INTO gamification_events VALUES(8,2,5,NULL,'2025-04-03 13:00:02');
INSERT INTO gamification_events VALUES(9,2,NULL,'69fa5be7-1433-4df4-917b-b8a2607877dc','2025-04-03 13:00:02');
INSERT INTO gamification_events VALUES(10,2,5,NULL,'2025-04-03 13:01:55');
INSERT INTO gamification_events VALUES(11,2,NULL,'69fa5be7-1433-4df4-917b-b8a2607877dc','2025-04-03 13:01:55');
INSERT INTO gamification_events VALUES(12,2,5,NULL,'2025-04-03 13:04:27');
INSERT INTO gamification_events VALUES(13,2,NULL,'69fa5be7-1433-4df4-917b-b8a2607877dc','2025-04-03 13:04:27');
INSERT INTO gamification_events VALUES(14,2,5,NULL,'2025-04-03 13:04:27');
INSERT INTO gamification_events VALUES(15,2,NULL,'69fa5be7-1433-4df4-917b-b8a2607877dc','2025-04-03 13:04:27');
INSERT INTO gamification_events VALUES(16,2,5,NULL,'2025-04-03 13:07:25');
INSERT INTO gamification_events VALUES(17,2,NULL,'69fa5be7-1433-4df4-917b-b8a2607877dc','2025-04-03 13:07:25');
INSERT INTO gamification_events VALUES(18,1,NULL,'a50a0b78-e23b-4ab8-a14f-3d01096a492c','2025-04-03 18:58:33.498215');
INSERT INTO gamification_events VALUES(19,2,NULL,'a50a0b78-e23b-4ab8-a14f-3d01096a492c','2025-04-03 18:58:36.399805');
INSERT INTO gamification_events VALUES(20,3,NULL,'a50a0b78-e23b-4ab8-a14f-3d01096a492c','2025-04-03 18:58:38.199056');
INSERT INTO gamification_events VALUES(21,20,NULL,'a50a0b78-e23b-4ab8-a14f-3d01096a492c','2025-04-03 19:08:01.621054');
INSERT INTO gamification_events VALUES(22,21,NULL,'a50a0b78-e23b-4ab8-a14f-3d01096a492c','2025-04-03 19:08:03.381075');
INSERT INTO gamification_events VALUES(23,22,NULL,'a50a0b78-e23b-4ab8-a14f-3d01096a492c','2025-04-03 19:08:05.145844');
INSERT INTO gamification_events VALUES(24,23,NULL,'a50a0b78-e23b-4ab8-a14f-3d01096a492c','2025-04-03 19:08:05.180272');
INSERT INTO gamification_events VALUES(25,23,NULL,'a50a0b78-e23b-4ab8-a14f-3d01096a492c','2025-04-03 19:08:05.223238');
INSERT INTO gamification_events VALUES(26,1,NULL,'a50a0b78-e23b-4ab8-a14f-3d01096a492c','2025-04-03 19:08:13.066856');
INSERT INTO gamification_events VALUES(27,2,NULL,'a50a0b78-e23b-4ab8-a14f-3d01096a492c','2025-04-03 19:08:14.484946');
INSERT INTO gamification_events VALUES(28,3,NULL,'a50a0b78-e23b-4ab8-a14f-3d01096a492c','2025-04-03 19:08:15.459085');
INSERT INTO gamification_events VALUES(29,10,NULL,'a50a0b78-e23b-4ab8-a14f-3d01096a492c','2025-04-03 19:08:28.244564');
INSERT INTO gamification_events VALUES(30,11,NULL,'a50a0b78-e23b-4ab8-a14f-3d01096a492c','2025-04-03 19:08:29.223398');
INSERT INTO gamification_events VALUES(31,21,NULL,'a50a0b78-e23b-4ab8-a14f-3d01096a492c','2025-04-03 19:08:39.279977');
INSERT INTO gamification_events VALUES(32,22,NULL,'a50a0b78-e23b-4ab8-a14f-3d01096a492c','2025-04-03 19:08:41.160152');
INSERT INTO gamification_events VALUES(33,20,NULL,'a50a0b78-e23b-4ab8-a14f-3d01096a492c','2025-04-03 19:08:42.212157');
INSERT INTO gamification_events VALUES(34,23,NULL,'a50a0b78-e23b-4ab8-a14f-3d01096a492c','2025-04-03 19:08:42.247491');
INSERT INTO gamification_events VALUES(35,23,NULL,'a50a0b78-e23b-4ab8-a14f-3d01096a492c','2025-04-03 19:08:42.285835');
INSERT INTO gamification_events VALUES(36,1,NULL,'a50a0b78-e23b-4ab8-a14f-3d01096a492c','2025-04-03 19:13:35.927710');
INSERT INTO gamification_events VALUES(37,2,NULL,'a50a0b78-e23b-4ab8-a14f-3d01096a492c','2025-04-03 19:13:36.491560');
INSERT INTO gamification_events VALUES(38,3,NULL,'a50a0b78-e23b-4ab8-a14f-3d01096a492c','2025-04-03 19:13:37.031027');
INSERT INTO gamification_events VALUES(39,100,4,NULL,'2025-04-03 19:21:33.228252');
INSERT INTO gamification_events VALUES(40,100,4,NULL,'2025-04-03 19:21:55.649119');
INSERT INTO gamification_events VALUES(41,1,4,NULL,'2025-04-03 21:06:30.322722');
INSERT INTO gamification_events VALUES(42,1,4,NULL,'2025-04-03 21:06:31.529372');
INSERT INTO gamification_events VALUES(43,1,4,NULL,'2025-04-03 21:06:32.171485');
INSERT INTO gamification_events VALUES(44,2,4,NULL,'2025-04-03 21:06:33.943422');
INSERT INTO gamification_events VALUES(45,3,4,NULL,'2025-04-03 21:06:40.814985');
INSERT INTO gamification_events VALUES(46,3,4,NULL,'2025-04-03 21:06:40.869149');
INSERT INTO gamification_events VALUES(47,3,4,NULL,'2025-04-03 21:06:40.971001');
INSERT INTO gamification_events VALUES(48,3,4,NULL,'2025-04-03 21:06:41.025658');
INSERT INTO gamification_events VALUES(49,3,4,NULL,'2025-04-03 21:06:41.521918');
INSERT INTO gamification_events VALUES(50,3,4,NULL,'2025-04-03 21:06:41.592543');
INSERT INTO gamification_events VALUES(51,3,4,NULL,'2025-04-03 21:06:42.152618');
INSERT INTO gamification_events VALUES(52,3,4,NULL,'2025-04-03 21:06:42.233135');
INSERT INTO gamification_events VALUES(53,3,4,NULL,'2025-04-03 21:06:42.937040');
INSERT INTO gamification_events VALUES(54,3,4,NULL,'2025-04-03 21:06:43.053030');
INSERT INTO gamification_events VALUES(55,3,4,NULL,'2025-04-03 21:06:43.157145');
INSERT INTO gamification_events VALUES(56,3,4,NULL,'2025-04-03 21:06:43.241845');
INSERT INTO gamification_events VALUES(57,3,4,NULL,'2025-04-03 21:06:43.318565');
INSERT INTO gamification_events VALUES(58,3,4,NULL,'2025-04-03 21:06:43.417507');
INSERT INTO gamification_events VALUES(59,3,4,NULL,'2025-04-03 21:06:43.524010');
INSERT INTO gamification_events VALUES(60,3,4,NULL,'2025-04-03 21:06:43.617375');
INSERT INTO gamification_events VALUES(61,3,4,NULL,'2025-04-03 21:06:43.719813');
INSERT INTO gamification_events VALUES(62,3,4,NULL,'2025-04-03 21:06:44.166593');
INSERT INTO gamification_events VALUES(63,3,4,NULL,'2025-04-03 21:06:44.244243');
INSERT INTO gamification_events VALUES(64,3,4,NULL,'2025-04-03 21:06:44.317236');
INSERT INTO gamification_events VALUES(65,4,4,NULL,'2025-04-03 21:06:44.388062');
INSERT INTO gamification_events VALUES(66,4,4,NULL,'2025-04-03 21:06:44.480189');
INSERT INTO gamification_events VALUES(67,3,4,NULL,'2025-04-03 21:06:44.521108');
INSERT INTO gamification_events VALUES(68,3,4,NULL,'2025-04-03 21:06:44.585274');
INSERT INTO gamification_events VALUES(69,3,4,NULL,'2025-04-03 21:06:44.638360');
INSERT INTO gamification_events VALUES(70,4,4,NULL,'2025-04-03 21:06:44.806848');
INSERT INTO gamification_events VALUES(71,3,4,NULL,'2025-04-03 21:06:44.907113');
INSERT INTO gamification_events VALUES(72,3,4,NULL,'2025-04-03 21:06:44.906353');
INSERT INTO gamification_events VALUES(73,3,4,NULL,'2025-04-03 21:06:45.096808');
INSERT INTO gamification_events VALUES(74,4,4,NULL,'2025-04-03 21:06:45.095190');
INSERT INTO gamification_events VALUES(75,4,4,NULL,'2025-04-03 21:06:45.098458');
INSERT INTO gamification_events VALUES(76,4,4,NULL,'2025-04-03 21:06:45.348900');
INSERT INTO gamification_events VALUES(77,4,4,NULL,'2025-04-03 21:06:45.356011');
INSERT INTO gamification_events VALUES(78,4,4,NULL,'2025-04-03 21:06:45.507169');
INSERT INTO gamification_events VALUES(79,5,4,NULL,'2025-04-03 21:06:50.811089');
INSERT INTO gamification_events VALUES(80,5,4,NULL,'2025-04-03 21:06:51.370369');
INSERT INTO gamification_events VALUES(81,1,NULL,'148da799-83d2-4972-a23d-39892c183d07','2025-04-03 21:29:33.663302');
INSERT INTO gamification_events VALUES(82,1,NULL,'148da799-83d2-4972-a23d-39892c183d07','2025-04-03 21:29:34.729014');
INSERT INTO gamification_events VALUES(83,1,NULL,'148da799-83d2-4972-a23d-39892c183d07','2025-04-03 21:29:35.882002');
INSERT INTO gamification_events VALUES(84,5,NULL,'148da799-83d2-4972-a23d-39892c183d07','2025-04-03 21:29:37.566455');
INSERT INTO gamification_events VALUES(85,5,NULL,'148da799-83d2-4972-a23d-39892c183d07','2025-04-03 21:29:39.231148');
INSERT INTO gamification_events VALUES(86,5,NULL,'148da799-83d2-4972-a23d-39892c183d07','2025-04-03 21:29:40.298006');
INSERT INTO gamification_events VALUES(87,3,NULL,'148da799-83d2-4972-a23d-39892c183d07','2025-04-03 21:29:42.285817');
INSERT INTO gamification_events VALUES(88,3,NULL,'148da799-83d2-4972-a23d-39892c183d07','2025-04-03 21:29:42.408422');
INSERT INTO gamification_events VALUES(89,3,NULL,'148da799-83d2-4972-a23d-39892c183d07','2025-04-03 21:29:42.441416');
INSERT INTO gamification_events VALUES(90,3,NULL,'148da799-83d2-4972-a23d-39892c183d07','2025-04-03 21:29:42.476155');
INSERT INTO gamification_events VALUES(91,3,NULL,'148da799-83d2-4972-a23d-39892c183d07','2025-04-03 21:29:42.547895');
INSERT INTO gamification_events VALUES(92,3,NULL,'148da799-83d2-4972-a23d-39892c183d07','2025-04-03 21:29:42.578239');
INSERT INTO gamification_events VALUES(93,3,NULL,'148da799-83d2-4972-a23d-39892c183d07','2025-04-03 21:29:42.738920');
INSERT INTO gamification_events VALUES(94,3,NULL,'148da799-83d2-4972-a23d-39892c183d07','2025-04-03 21:29:42.773664');
INSERT INTO gamification_events VALUES(95,3,NULL,'148da799-83d2-4972-a23d-39892c183d07','2025-04-03 21:29:42.807828');
INSERT INTO gamification_events VALUES(96,3,NULL,'148da799-83d2-4972-a23d-39892c183d07','2025-04-03 21:29:42.897381');
INSERT INTO gamification_events VALUES(97,3,NULL,'148da799-83d2-4972-a23d-39892c183d07','2025-04-03 21:29:42.977715');
INSERT INTO gamification_events VALUES(98,3,NULL,'148da799-83d2-4972-a23d-39892c183d07','2025-04-03 21:29:43.035740');
INSERT INTO gamification_events VALUES(99,3,NULL,'148da799-83d2-4972-a23d-39892c183d07','2025-04-03 21:29:43.071158');
INSERT INTO gamification_events VALUES(100,3,NULL,'148da799-83d2-4972-a23d-39892c183d07','2025-04-03 21:29:43.104375');
INSERT INTO gamification_events VALUES(101,3,NULL,'148da799-83d2-4972-a23d-39892c183d07','2025-04-03 21:29:43.292130');
INSERT INTO gamification_events VALUES(102,3,NULL,'148da799-83d2-4972-a23d-39892c183d07','2025-04-03 21:29:43.341358');
INSERT INTO gamification_events VALUES(103,3,NULL,'148da799-83d2-4972-a23d-39892c183d07','2025-04-03 21:29:43.378456');
INSERT INTO gamification_events VALUES(104,3,NULL,'148da799-83d2-4972-a23d-39892c183d07','2025-04-03 21:29:43.416085');
INSERT INTO gamification_events VALUES(105,3,NULL,'148da799-83d2-4972-a23d-39892c183d07','2025-04-03 21:29:44.196898');
INSERT INTO gamification_events VALUES(106,3,NULL,'148da799-83d2-4972-a23d-39892c183d07','2025-04-03 21:29:44.234603');
INSERT INTO gamification_events VALUES(107,3,NULL,'148da799-83d2-4972-a23d-39892c183d07','2025-04-03 21:29:44.271694');
INSERT INTO gamification_events VALUES(108,3,NULL,'148da799-83d2-4972-a23d-39892c183d07','2025-04-03 21:29:44.305680');
INSERT INTO gamification_events VALUES(109,4,NULL,'148da799-83d2-4972-a23d-39892c183d07','2025-04-03 21:29:44.360614');
INSERT INTO gamification_events VALUES(110,4,NULL,'148da799-83d2-4972-a23d-39892c183d07','2025-04-03 21:29:44.423160');
INSERT INTO gamification_events VALUES(111,3,NULL,'148da799-83d2-4972-a23d-39892c183d07','2025-04-03 21:29:44.456237');
INSERT INTO gamification_events VALUES(112,4,NULL,'148da799-83d2-4972-a23d-39892c183d07','2025-04-03 21:29:44.503442');
INSERT INTO gamification_events VALUES(113,4,NULL,'148da799-83d2-4972-a23d-39892c183d07','2025-04-03 21:29:44.602406');
INSERT INTO gamification_events VALUES(114,3,NULL,'148da799-83d2-4972-a23d-39892c183d07','2025-04-03 21:29:44.667396');
INSERT INTO gamification_events VALUES(115,3,NULL,'148da799-83d2-4972-a23d-39892c183d07','2025-04-03 21:29:44.704145');
INSERT INTO gamification_events VALUES(116,3,NULL,'148da799-83d2-4972-a23d-39892c183d07','2025-04-03 21:29:44.765732');
INSERT INTO gamification_events VALUES(117,4,NULL,'148da799-83d2-4972-a23d-39892c183d07','2025-04-03 21:29:44.867438');
INSERT INTO gamification_events VALUES(118,4,NULL,'148da799-83d2-4972-a23d-39892c183d07','2025-04-03 21:29:44.902417');
INSERT INTO gamification_events VALUES(119,3,NULL,'148da799-83d2-4972-a23d-39892c183d07','2025-04-03 21:29:44.945684');
INSERT INTO gamification_events VALUES(120,3,NULL,'148da799-83d2-4972-a23d-39892c183d07','2025-04-03 21:29:44.988013');
INSERT INTO gamification_events VALUES(121,4,NULL,'148da799-83d2-4972-a23d-39892c183d07','2025-04-03 21:29:45.025095');
INSERT INTO gamification_events VALUES(122,3,NULL,'148da799-83d2-4972-a23d-39892c183d07','2025-04-03 21:29:45.096202');
INSERT INTO gamification_events VALUES(123,4,NULL,'148da799-83d2-4972-a23d-39892c183d07','2025-04-03 21:29:45.191581');
INSERT INTO gamification_events VALUES(124,4,NULL,'148da799-83d2-4972-a23d-39892c183d07','2025-04-03 21:29:45.231725');
INSERT INTO gamification_events VALUES(125,4,NULL,'148da799-83d2-4972-a23d-39892c183d07','2025-04-03 21:29:45.320308');
INSERT INTO gamification_events VALUES(126,100,4,NULL,'2025-04-03 21:38:19.476679');
INSERT INTO gamification_events VALUES(127,1,4,NULL,'2025-04-03 21:39:27.876391');
INSERT INTO gamification_events VALUES(128,1,4,NULL,'2025-04-03 21:39:29.207911');
INSERT INTO gamification_events VALUES(129,1,4,NULL,'2025-04-03 21:39:30.020395');
INSERT INTO gamification_events VALUES(130,2,4,NULL,'2025-04-03 21:39:31.036509');
INSERT INTO gamification_events VALUES(131,3,4,NULL,'2025-04-03 21:39:35.959878');
INSERT INTO gamification_events VALUES(132,3,4,NULL,'2025-04-03 21:39:35.987832');
INSERT INTO gamification_events VALUES(133,3,4,NULL,'2025-04-03 21:39:36.012930');
INSERT INTO gamification_events VALUES(134,3,4,NULL,'2025-04-03 21:39:36.089285');
INSERT INTO gamification_events VALUES(135,3,4,NULL,'2025-04-03 21:39:36.226996');
INSERT INTO gamification_events VALUES(136,3,4,NULL,'2025-04-03 21:39:36.305783');
INSERT INTO gamification_events VALUES(137,3,4,NULL,'2025-04-03 21:39:36.365774');
INSERT INTO gamification_events VALUES(138,3,4,NULL,'2025-04-03 21:39:36.403604');
INSERT INTO gamification_events VALUES(139,3,4,NULL,'2025-04-03 21:39:37.456661');
INSERT INTO gamification_events VALUES(140,3,4,NULL,'2025-04-03 21:39:37.494294');
INSERT INTO gamification_events VALUES(141,3,4,NULL,'2025-04-03 21:39:37.689988');
INSERT INTO gamification_events VALUES(142,3,4,NULL,'2025-04-03 21:39:37.764666');
INSERT INTO gamification_events VALUES(143,3,4,NULL,'2025-04-03 21:39:37.917089');
INSERT INTO gamification_events VALUES(144,3,4,NULL,'2025-04-03 21:39:37.957492');
INSERT INTO gamification_events VALUES(145,3,4,NULL,'2025-04-03 21:39:38.056111');
INSERT INTO gamification_events VALUES(146,3,4,NULL,'2025-04-03 21:39:38.102782');
INSERT INTO gamification_events VALUES(147,3,4,NULL,'2025-04-03 21:39:39.249672');
INSERT INTO gamification_events VALUES(148,3,4,NULL,'2025-04-03 21:39:39.380507');
INSERT INTO gamification_events VALUES(149,4,4,NULL,'2025-04-03 21:39:39.493159');
INSERT INTO gamification_events VALUES(150,3,4,NULL,'2025-04-03 21:39:39.550928');
INSERT INTO gamification_events VALUES(151,4,4,NULL,'2025-04-03 21:39:39.695688');
INSERT INTO gamification_events VALUES(152,3,4,NULL,'2025-04-03 21:39:39.757962');
INSERT INTO gamification_events VALUES(153,3,4,NULL,'2025-04-03 21:39:39.873758');
INSERT INTO gamification_events VALUES(154,3,4,NULL,'2025-04-03 21:39:39.923024');
INSERT INTO gamification_events VALUES(155,4,4,NULL,'2025-04-03 21:39:39.971010');
INSERT INTO gamification_events VALUES(156,4,4,NULL,'2025-04-03 21:39:40.081952');
INSERT INTO gamification_events VALUES(157,4,4,NULL,'2025-04-03 21:39:40.156299');
INSERT INTO gamification_events VALUES(158,5,4,NULL,'2025-04-03 21:39:46.030089');
INSERT INTO gamification_events VALUES(159,5,4,NULL,'2025-04-03 21:39:47.401548');
INSERT INTO gamification_events VALUES(160,5,4,NULL,'2025-04-03 21:39:48.446137');
INSERT INTO gamification_events VALUES(161,5,4,NULL,'2025-04-03 21:39:53.721480');
INSERT INTO gamification_events VALUES(162,5,4,NULL,'2025-04-03 21:39:54.059632');
INSERT INTO gamification_events VALUES(163,5,4,NULL,'2025-04-03 21:39:54.750839');
INSERT INTO gamification_events VALUES(164,5,4,NULL,'2025-04-03 21:39:55.133993');
INSERT INTO gamification_events VALUES(165,100,4,NULL,'2025-04-04 13:19:25.963688');
INSERT INTO gamification_events VALUES(166,3,4,NULL,'2025-04-04 13:24:23.728879');
INSERT INTO gamification_events VALUES(167,3,4,NULL,'2025-04-04 13:24:26.563877');
INSERT INTO gamification_events VALUES(168,7,4,NULL,'2025-04-04 13:24:28.794056');
INSERT INTO gamification_events VALUES(169,10,4,NULL,'2025-04-04 13:24:32.639359');
INSERT INTO gamification_events VALUES(170,10,4,NULL,'2025-04-04 13:24:34.784990');
INSERT INTO gamification_events VALUES(171,10,4,NULL,'2025-04-04 13:24:36.809305');
INSERT INTO gamification_events VALUES(172,3,4,NULL,'2025-04-04 13:24:43.520535');
INSERT INTO gamification_events VALUES(173,3,4,NULL,'2025-04-04 13:24:44.178790');
INSERT INTO gamification_events VALUES(174,3,4,NULL,'2025-04-04 13:24:44.774676');
INSERT INTO gamification_events VALUES(175,5,4,NULL,'2025-04-04 13:24:53.259041');
INSERT INTO gamification_events VALUES(176,5,4,NULL,'2025-04-04 13:24:53.870485');
INSERT INTO gamification_events VALUES(177,5,4,NULL,'2025-04-04 13:24:54.469913');
INSERT INTO gamification_events VALUES(178,7,4,NULL,'2025-04-04 19:43:25.499539');
INSERT INTO gamification_events VALUES(179,5,4,NULL,'2025-04-04 19:43:31.251656');
INSERT INTO gamification_events VALUES(180,5,4,NULL,'2025-04-04 19:43:32.749036');
INSERT INTO gamification_events VALUES(181,5,4,NULL,'2025-04-04 19:43:33.954273');
INSERT INTO gamification_events VALUES(182,6,4,NULL,'2025-04-04 19:43:34.921451');
INSERT INTO gamification_events VALUES(183,1,4,NULL,'2025-04-04 19:43:48.948725');
INSERT INTO gamification_events VALUES(184,1,4,NULL,'2025-04-04 19:43:49.051842');
INSERT INTO gamification_events VALUES(185,1,4,NULL,'2025-04-04 19:43:49.141666');
INSERT INTO gamification_events VALUES(186,1,4,NULL,'2025-04-04 19:43:49.306064');
INSERT INTO gamification_events VALUES(187,1,4,NULL,'2025-04-04 19:43:49.432833');
INSERT INTO gamification_events VALUES(188,1,4,NULL,'2025-04-04 19:43:49.555140');
INSERT INTO gamification_events VALUES(189,1,4,NULL,'2025-04-04 19:43:49.723016');
INSERT INTO gamification_events VALUES(190,1,4,NULL,'2025-04-04 19:43:49.880137');
INSERT INTO gamification_events VALUES(191,1,4,NULL,'2025-04-04 19:43:50.326554');
INSERT INTO gamification_events VALUES(192,1,4,NULL,'2025-04-04 19:43:50.459679');
INSERT INTO gamification_events VALUES(193,1,4,NULL,'2025-04-04 19:43:50.723485');
INSERT INTO gamification_events VALUES(194,1,4,NULL,'2025-04-04 19:43:50.867514');
INSERT INTO gamification_events VALUES(195,1,4,NULL,'2025-04-04 19:43:51.009047');
INSERT INTO gamification_events VALUES(196,1,4,NULL,'2025-04-04 19:43:51.301341');
INSERT INTO gamification_events VALUES(197,1,4,NULL,'2025-04-04 19:43:51.487780');
INSERT INTO gamification_events VALUES(198,1,4,NULL,'2025-04-04 19:43:51.670068');
INSERT INTO gamification_events VALUES(199,1,4,NULL,'2025-04-04 19:43:51.968959');
INSERT INTO gamification_events VALUES(200,1,4,NULL,'2025-04-04 19:43:52.147352');
INSERT INTO gamification_events VALUES(201,1,4,NULL,'2025-04-04 19:43:52.234250');
INSERT INTO gamification_events VALUES(202,1,4,NULL,'2025-04-04 19:43:52.319270');
INSERT INTO gamification_events VALUES(203,1,4,NULL,'2025-04-04 19:43:52.414936');
INSERT INTO gamification_events VALUES(204,1,4,NULL,'2025-04-04 19:43:52.601861');
INSERT INTO gamification_events VALUES(205,1,4,NULL,'2025-04-04 19:43:52.700331');
INSERT INTO gamification_events VALUES(206,1,4,NULL,'2025-04-04 19:43:52.799384');
INSERT INTO gamification_events VALUES(207,1,4,NULL,'2025-04-04 19:43:53.300854');
INSERT INTO gamification_events VALUES(208,1,4,NULL,'2025-04-04 19:43:53.434624');
INSERT INTO gamification_events VALUES(209,1,4,NULL,'2025-04-04 19:43:53.570219');
INSERT INTO gamification_events VALUES(210,1,4,NULL,'2025-04-04 19:43:53.706984');
INSERT INTO gamification_events VALUES(211,2,4,NULL,'2025-04-04 19:43:53.874027');
INSERT INTO gamification_events VALUES(212,2,4,NULL,'2025-04-04 19:43:53.947839');
INSERT INTO gamification_events VALUES(213,2,4,NULL,'2025-04-04 19:43:54.090423');
INSERT INTO gamification_events VALUES(214,1,4,NULL,'2025-04-04 19:43:55.072334');
INSERT INTO gamification_events VALUES(215,1,4,NULL,'2025-04-04 19:43:55.144145');
INSERT INTO gamification_events VALUES(216,1,4,NULL,'2025-04-04 19:43:55.239924');
INSERT INTO gamification_events VALUES(217,2,4,NULL,'2025-04-04 19:43:55.283801');
INSERT INTO gamification_events VALUES(218,1,4,NULL,'2025-04-04 19:43:55.386606');
INSERT INTO gamification_events VALUES(219,1,4,NULL,'2025-04-04 19:43:55.504183');
INSERT INTO gamification_events VALUES(220,1,4,NULL,'2025-04-04 19:43:55.598656');
INSERT INTO gamification_events VALUES(221,2,4,NULL,'2025-04-04 19:43:55.674568');
INSERT INTO gamification_events VALUES(222,2,4,NULL,'2025-04-04 19:43:55.723486');
INSERT INTO gamification_events VALUES(223,2,4,NULL,'2025-04-04 19:43:55.830773');
INSERT INTO gamification_events VALUES(224,2,4,NULL,'2025-04-04 19:43:55.946519');
INSERT INTO gamification_events VALUES(225,2,4,NULL,'2025-04-04 19:43:55.998540');
INSERT INTO gamification_events VALUES(226,10,4,NULL,'2025-04-04 19:44:05.923815');
INSERT INTO gamification_events VALUES(227,10,4,NULL,'2025-04-04 19:44:07.581156');
INSERT INTO gamification_events VALUES(228,10,4,NULL,'2025-04-04 19:44:10.008129');
INSERT INTO gamification_events VALUES(229,5,4,NULL,'2025-04-05 09:50:04.156027');
INSERT INTO gamification_events VALUES(230,5,4,NULL,'2025-04-05 09:50:04.724569');
INSERT INTO gamification_events VALUES(231,5,4,NULL,'2025-04-05 09:50:06.079929');
INSERT INTO gamification_events VALUES(232,6,4,NULL,'2025-04-05 09:50:06.992549');
INSERT INTO gamification_events VALUES(233,3,4,NULL,'2025-04-05 09:50:30.923807');
INSERT INTO gamification_events VALUES(234,3,4,NULL,'2025-04-05 09:50:32.561518');
INSERT INTO gamification_events VALUES(235,3,4,NULL,'2025-04-05 09:50:33.792915');
INSERT INTO gamification_events VALUES(236,1,4,NULL,'2025-04-05 10:37:54.211037');
INSERT INTO gamification_events VALUES(237,1,4,NULL,'2025-04-05 10:37:54.287616');
INSERT INTO gamification_events VALUES(238,1,4,NULL,'2025-04-05 10:37:54.348449');
INSERT INTO gamification_events VALUES(239,1,4,NULL,'2025-04-05 10:37:54.507002');
INSERT INTO gamification_events VALUES(240,1,4,NULL,'2025-04-05 10:37:54.588908');
INSERT INTO gamification_events VALUES(241,1,4,NULL,'2025-04-05 10:37:54.764190');
INSERT INTO gamification_events VALUES(242,1,4,NULL,'2025-04-05 10:37:54.932550');
INSERT INTO gamification_events VALUES(243,1,4,NULL,'2025-04-05 10:37:55.100810');
INSERT INTO gamification_events VALUES(244,1,4,NULL,'2025-04-05 10:37:55.876893');
INSERT INTO gamification_events VALUES(245,1,4,NULL,'2025-04-05 10:37:56.023376');
INSERT INTO gamification_events VALUES(246,1,4,NULL,'2025-04-05 10:37:56.119658');
INSERT INTO gamification_events VALUES(247,1,4,NULL,'2025-04-05 10:37:56.210340');
INSERT INTO gamification_events VALUES(248,1,4,NULL,'2025-04-05 10:37:56.296208');
INSERT INTO gamification_events VALUES(249,1,4,NULL,'2025-04-05 10:37:56.433240');
INSERT INTO gamification_events VALUES(250,1,4,NULL,'2025-04-05 10:37:56.608850');
INSERT INTO gamification_events VALUES(251,1,4,NULL,'2025-04-05 10:37:56.641640');
INSERT INTO gamification_events VALUES(252,3,4,NULL,'2025-04-05 10:37:58.606132');
INSERT INTO gamification_events VALUES(253,3,4,NULL,'2025-04-05 10:37:59.151626');
INSERT INTO gamification_events VALUES(254,3,4,NULL,'2025-04-05 10:37:59.738000');
INSERT INTO gamification_events VALUES(255,7,4,NULL,'2025-04-05 10:38:02.309667');
INSERT INTO gamification_events VALUES(256,1,4,NULL,'2025-04-05 10:38:06.757264');
INSERT INTO gamification_events VALUES(257,1,4,NULL,'2025-04-05 10:38:06.835684');
INSERT INTO gamification_events VALUES(258,1,4,NULL,'2025-04-05 10:38:06.978827');
INSERT INTO gamification_events VALUES(259,2,4,NULL,'2025-04-05 10:38:07.048642');
INSERT INTO gamification_events VALUES(260,1,4,NULL,'2025-04-05 10:38:07.150954');
INSERT INTO gamification_events VALUES(261,1,4,NULL,'2025-04-05 10:38:07.227471');
INSERT INTO gamification_events VALUES(262,2,4,NULL,'2025-04-05 10:38:07.259818');
INSERT INTO gamification_events VALUES(263,1,4,NULL,'2025-04-05 10:38:07.367643');
INSERT INTO gamification_events VALUES(264,2,4,NULL,'2025-04-05 10:38:07.408994');
INSERT INTO gamification_events VALUES(265,2,4,NULL,'2025-04-05 10:38:07.490992');
INSERT INTO gamification_events VALUES(266,2,4,NULL,'2025-04-05 10:38:07.579261');
INSERT INTO gamification_events VALUES(267,5,4,NULL,'2025-04-05 10:38:08.366762');
INSERT INTO gamification_events VALUES(268,5,4,NULL,'2025-04-05 10:38:10.661342');
INSERT INTO gamification_events VALUES(269,5,4,NULL,'2025-04-05 10:38:11.548305');
INSERT INTO gamification_events VALUES(270,6,4,NULL,'2025-04-05 10:38:12.345985');
INSERT INTO gamification_events VALUES(271,6,4,NULL,'2025-04-05 10:38:18.306390');
INSERT INTO gamification_events VALUES(272,10,4,NULL,'2025-04-05 10:38:21.560345');
INSERT INTO gamification_events VALUES(273,10,4,NULL,'2025-04-05 10:38:22.104895');
INSERT INTO gamification_events VALUES(274,10,4,NULL,'2025-04-05 10:38:23.012114');
INSERT INTO gamification_events VALUES(275,8,4,NULL,'2025-04-05 10:38:27.117972');
INSERT INTO gamification_events VALUES(276,8,4,NULL,'2025-04-05 10:38:27.169374');
INSERT INTO gamification_events VALUES(277,8,4,NULL,'2025-04-05 10:38:27.243188');
INSERT INTO gamification_events VALUES(278,8,4,NULL,'2025-04-05 10:38:27.307387');
INSERT INTO gamification_events VALUES(279,8,4,NULL,'2025-04-05 10:38:27.367278');
INSERT INTO gamification_events VALUES(280,8,4,NULL,'2025-04-05 10:38:27.426527');
INSERT INTO gamification_events VALUES(281,8,4,NULL,'2025-04-05 10:38:27.482728');
INSERT INTO gamification_events VALUES(282,8,4,NULL,'2025-04-05 10:38:27.543161');
INSERT INTO gamification_events VALUES(283,8,4,NULL,'2025-04-05 10:38:28.601964');
INSERT INTO gamification_events VALUES(284,8,4,NULL,'2025-04-05 10:38:28.695779');
INSERT INTO gamification_events VALUES(285,8,4,NULL,'2025-04-05 10:38:28.860165');
INSERT INTO gamification_events VALUES(286,8,4,NULL,'2025-04-05 10:38:29.019248');
INSERT INTO gamification_events VALUES(287,8,4,NULL,'2025-04-05 10:38:29.232991');
INSERT INTO gamification_events VALUES(288,8,4,NULL,'2025-04-05 10:38:29.385815');
INSERT INTO gamification_events VALUES(289,8,4,NULL,'2025-04-05 10:38:29.458956');
INSERT INTO gamification_events VALUES(290,8,4,NULL,'2025-04-05 10:38:29.613199');
INSERT INTO gamification_events VALUES(291,8,4,NULL,'2025-04-05 10:38:30.466103');
INSERT INTO gamification_events VALUES(292,8,4,NULL,'2025-04-05 10:38:30.528400');
INSERT INTO gamification_events VALUES(293,8,4,NULL,'2025-04-05 10:38:30.652010');
INSERT INTO gamification_events VALUES(294,8,4,NULL,'2025-04-05 10:38:30.717094');
INSERT INTO gamification_events VALUES(295,8,4,NULL,'2025-04-05 10:38:30.789940');
INSERT INTO gamification_events VALUES(296,9,4,NULL,'2025-04-05 10:38:30.844237');
INSERT INTO gamification_events VALUES(297,8,4,NULL,'2025-04-05 10:38:30.922403');
INSERT INTO gamification_events VALUES(298,9,4,NULL,'2025-04-05 10:38:31.036564');
INSERT INTO gamification_events VALUES(299,9,4,NULL,'2025-04-05 10:38:31.100944');
INSERT INTO gamification_events VALUES(300,9,4,NULL,'2025-04-05 10:38:31.131770');
INSERT INTO gamification_events VALUES(301,8,4,NULL,'2025-04-05 10:38:31.155125');
INSERT INTO gamification_events VALUES(302,8,4,NULL,'2025-04-05 10:38:31.206375');
INSERT INTO gamification_events VALUES(303,9,4,NULL,'2025-04-05 10:38:31.335032');
INSERT INTO gamification_events VALUES(304,9,4,NULL,'2025-04-05 10:38:31.357321');
INSERT INTO gamification_events VALUES(305,9,4,NULL,'2025-04-05 10:38:31.472612');
INSERT INTO gamification_events VALUES(306,101,8,NULL,'2025-04-06 20:20:30.589519');
INSERT INTO gamification_events VALUES(307,102,8,NULL,'2025-04-06 20:20:30.635927');
INSERT INTO gamification_events VALUES(308,103,8,NULL,'2025-04-06 20:20:30.670162');
INSERT INTO gamification_events VALUES(309,104,8,NULL,'2025-04-06 20:20:31.053996');
INSERT INTO gamification_events VALUES(310,100,4,NULL,'2025-04-06 20:23:06.409847');
INSERT INTO gamification_events VALUES(311,100,4,NULL,'2025-04-06 21:31:32.344543');
INSERT INTO gamification_events VALUES(312,100,4,NULL,'2025-04-08 10:06:53.135345');
INSERT INTO gamification_events VALUES(313,100,4,NULL,'2025-04-08 10:14:39.206429');
INSERT INTO gamification_events VALUES(314,3,NULL,'e8c594f9-2fc7-4528-92d1-34f5dd9f2d61','2025-04-08 10:15:20.785014');
INSERT INTO gamification_events VALUES(315,3,NULL,'e8c594f9-2fc7-4528-92d1-34f5dd9f2d61','2025-04-08 10:15:21.382420');
INSERT INTO gamification_events VALUES(316,3,NULL,'e8c594f9-2fc7-4528-92d1-34f5dd9f2d61','2025-04-08 10:15:22.060175');
INSERT INTO gamification_events VALUES(317,100,8,NULL,'2025-04-08 10:16:34.903230');
INSERT INTO gamification_events VALUES(318,5,NULL,'32fd6476-19d8-435a-a9e2-a23864280144','2025-04-08 10:17:39.146068');
INSERT INTO gamification_events VALUES(319,5,NULL,'32fd6476-19d8-435a-a9e2-a23864280144','2025-04-08 10:17:39.683442');
INSERT INTO gamification_events VALUES(320,5,NULL,'32fd6476-19d8-435a-a9e2-a23864280144','2025-04-08 10:17:40.134781');
INSERT INTO gamification_events VALUES(321,6,NULL,'32fd6476-19d8-435a-a9e2-a23864280144','2025-04-08 10:17:40.747202');
INSERT INTO gamification_events VALUES(322,100,4,NULL,'2025-04-08 11:13:14.390028');
INSERT INTO gamification_events VALUES(323,100,4,NULL,'2025-04-08 11:44:29.681996');
INSERT INTO gamification_events VALUES(324,3,NULL,'bd4d41d4-0df3-4953-a8e0-9953376dec04','2025-04-08 12:04:02.227442');
INSERT INTO gamification_events VALUES(325,3,NULL,'bd4d41d4-0df3-4953-a8e0-9953376dec04','2025-04-08 12:04:04.823451');
INSERT INTO gamification_events VALUES(326,3,NULL,'bd4d41d4-0df3-4953-a8e0-9953376dec04','2025-04-08 12:04:06.012065');
INSERT INTO gamification_events VALUES(327,7,NULL,'bd4d41d4-0df3-4953-a8e0-9953376dec04','2025-04-08 12:04:38.233857');
INSERT INTO gamification_events VALUES(328,5,NULL,'bd4d41d4-0df3-4953-a8e0-9953376dec04','2025-04-08 12:04:45.233835');
INSERT INTO gamification_events VALUES(329,5,NULL,'bd4d41d4-0df3-4953-a8e0-9953376dec04','2025-04-08 12:04:46.333654');
INSERT INTO gamification_events VALUES(330,5,NULL,'bd4d41d4-0df3-4953-a8e0-9953376dec04','2025-04-08 12:04:47.378376');
INSERT INTO gamification_events VALUES(331,6,NULL,'bd4d41d4-0df3-4953-a8e0-9953376dec04','2025-04-08 12:04:48.511454');
INSERT INTO gamification_events VALUES(332,100,4,NULL,'2025-04-08 13:15:48.539485');
INSERT INTO gamification_events VALUES(333,100,4,NULL,'2025-04-08 13:15:49.125641');
INSERT INTO gamification_events VALUES(334,101,9,NULL,'2025-04-08 13:23:23.382603');
INSERT INTO gamification_events VALUES(335,102,9,NULL,'2025-04-08 13:23:23.836662');
INSERT INTO gamification_events VALUES(336,103,9,NULL,'2025-04-08 13:23:24.269554');
INSERT INTO gamification_events VALUES(337,104,9,NULL,'2025-04-08 13:23:25.191726');
INSERT INTO gamification_events VALUES(338,100,9,NULL,'2025-04-08 13:24:05.396417');
INSERT INTO gamification_events VALUES(339,100,4,NULL,'2025-04-08 14:48:18.594505');
INSERT INTO gamification_events VALUES(340,3,NULL,'53be0a91-7d1e-44bc-a957-7c7ef1783762','2025-04-09 18:18:10.588496');
INSERT INTO gamification_events VALUES(341,3,NULL,'53be0a91-7d1e-44bc-a957-7c7ef1783762','2025-04-09 18:18:11.087679');
INSERT INTO gamification_events VALUES(342,3,NULL,'53be0a91-7d1e-44bc-a957-7c7ef1783762','2025-04-09 18:18:11.386541');
INSERT INTO gamification_events VALUES(343,5,NULL,'53be0a91-7d1e-44bc-a957-7c7ef1783762','2025-04-09 18:18:13.253214');
INSERT INTO gamification_events VALUES(344,5,NULL,'53be0a91-7d1e-44bc-a957-7c7ef1783762','2025-04-09 18:18:13.697658');
INSERT INTO gamification_events VALUES(345,5,NULL,'53be0a91-7d1e-44bc-a957-7c7ef1783762','2025-04-09 18:18:14.368387');
INSERT INTO gamification_events VALUES(346,6,NULL,'53be0a91-7d1e-44bc-a957-7c7ef1783762','2025-04-09 18:18:15.353377');
INSERT INTO gamification_events VALUES(347,7,NULL,'53be0a91-7d1e-44bc-a957-7c7ef1783762','2025-04-09 18:18:16.353573');
INSERT INTO gamification_events VALUES(348,100,9,NULL,'2025-04-09 18:20:36.051766');
INSERT INTO gamification_events VALUES(349,3,NULL,'1960aa2f-d064-4340-a38c-7e091b9a9e36','2025-04-09 18:26:51.524930');
INSERT INTO gamification_events VALUES(350,3,NULL,'1960aa2f-d064-4340-a38c-7e091b9a9e36','2025-04-09 18:26:51.913293');
INSERT INTO gamification_events VALUES(351,3,NULL,'1960aa2f-d064-4340-a38c-7e091b9a9e36','2025-04-09 18:26:52.247114');
INSERT INTO gamification_events VALUES(352,5,NULL,'1960aa2f-d064-4340-a38c-7e091b9a9e36','2025-04-09 18:26:53.235486');
INSERT INTO gamification_events VALUES(353,5,NULL,'1960aa2f-d064-4340-a38c-7e091b9a9e36','2025-04-09 18:26:53.713291');
INSERT INTO gamification_events VALUES(354,5,NULL,'1960aa2f-d064-4340-a38c-7e091b9a9e36','2025-04-09 18:26:54.591366');
INSERT INTO gamification_events VALUES(355,5,NULL,'1960aa2f-d064-4340-a38c-7e091b9a9e36','2025-04-09 18:26:55.157449');
INSERT INTO gamification_events VALUES(356,5,NULL,'1960aa2f-d064-4340-a38c-7e091b9a9e36','2025-04-09 18:26:55.535502');
INSERT INTO gamification_events VALUES(357,5,NULL,'1960aa2f-d064-4340-a38c-7e091b9a9e36','2025-04-09 18:26:56.068742');
INSERT INTO gamification_events VALUES(358,5,NULL,'1960aa2f-d064-4340-a38c-7e091b9a9e36','2025-04-09 18:26:56.514082');
INSERT INTO gamification_events VALUES(359,7,NULL,'1960aa2f-d064-4340-a38c-7e091b9a9e36','2025-04-09 18:26:58.646911');
INSERT INTO gamification_events VALUES(360,8,NULL,'1960aa2f-d064-4340-a38c-7e091b9a9e36','2025-04-09 18:27:00.624108');
INSERT INTO gamification_events VALUES(361,8,NULL,'1960aa2f-d064-4340-a38c-7e091b9a9e36','2025-04-09 18:27:00.857896');
INSERT INTO gamification_events VALUES(362,8,NULL,'1960aa2f-d064-4340-a38c-7e091b9a9e36','2025-04-09 18:27:01.035522');
INSERT INTO gamification_events VALUES(363,8,NULL,'1960aa2f-d064-4340-a38c-7e091b9a9e36','2025-04-09 18:27:01.212879');
INSERT INTO gamification_events VALUES(364,8,NULL,'1960aa2f-d064-4340-a38c-7e091b9a9e36','2025-04-09 18:27:01.613112');
INSERT INTO gamification_events VALUES(365,8,NULL,'1960aa2f-d064-4340-a38c-7e091b9a9e36','2025-04-09 18:27:01.836065');
INSERT INTO gamification_events VALUES(366,8,NULL,'1960aa2f-d064-4340-a38c-7e091b9a9e36','2025-04-09 18:27:02.313269');
INSERT INTO gamification_events VALUES(367,8,NULL,'1960aa2f-d064-4340-a38c-7e091b9a9e36','2025-04-09 18:27:02.446682');
INSERT INTO gamification_events VALUES(368,8,NULL,'1960aa2f-d064-4340-a38c-7e091b9a9e36','2025-04-09 18:27:02.602239');
INSERT INTO gamification_events VALUES(369,8,NULL,'1960aa2f-d064-4340-a38c-7e091b9a9e36','2025-04-09 18:27:02.746459');
INSERT INTO gamification_events VALUES(370,8,NULL,'1960aa2f-d064-4340-a38c-7e091b9a9e36','2025-04-09 18:27:03.224041');
INSERT INTO gamification_events VALUES(371,8,NULL,'1960aa2f-d064-4340-a38c-7e091b9a9e36','2025-04-09 18:27:03.383746');
INSERT INTO gamification_events VALUES(372,8,NULL,'1960aa2f-d064-4340-a38c-7e091b9a9e36','2025-04-09 18:27:03.568455');
INSERT INTO gamification_events VALUES(373,8,NULL,'1960aa2f-d064-4340-a38c-7e091b9a9e36','2025-04-09 18:27:03.724035');
INSERT INTO gamification_events VALUES(374,8,NULL,'1960aa2f-d064-4340-a38c-7e091b9a9e36','2025-04-09 18:27:05.405061');
INSERT INTO gamification_events VALUES(375,8,NULL,'1960aa2f-d064-4340-a38c-7e091b9a9e36','2025-04-09 18:27:05.579516');
INSERT INTO gamification_events VALUES(376,8,NULL,'1960aa2f-d064-4340-a38c-7e091b9a9e36','2025-04-09 18:27:06.013083');
INSERT INTO gamification_events VALUES(377,8,NULL,'1960aa2f-d064-4340-a38c-7e091b9a9e36','2025-04-09 18:27:06.157601');
INSERT INTO gamification_events VALUES(378,8,NULL,'1960aa2f-d064-4340-a38c-7e091b9a9e36','2025-04-09 18:27:06.292506');
INSERT INTO gamification_events VALUES(379,8,NULL,'1960aa2f-d064-4340-a38c-7e091b9a9e36','2025-04-09 18:27:06.613106');
INSERT INTO gamification_events VALUES(380,8,NULL,'1960aa2f-d064-4340-a38c-7e091b9a9e36','2025-04-09 18:27:06.813652');
INSERT INTO gamification_events VALUES(381,8,NULL,'1960aa2f-d064-4340-a38c-7e091b9a9e36','2025-04-09 18:27:07.235060');
INSERT INTO gamification_events VALUES(382,8,NULL,'1960aa2f-d064-4340-a38c-7e091b9a9e36','2025-04-09 18:27:08.157316');
INSERT INTO gamification_events VALUES(383,8,NULL,'1960aa2f-d064-4340-a38c-7e091b9a9e36','2025-04-09 18:27:08.446371');
INSERT INTO gamification_events VALUES(384,8,NULL,'1960aa2f-d064-4340-a38c-7e091b9a9e36','2025-04-09 18:27:09.079735');
INSERT INTO gamification_events VALUES(385,8,NULL,'1960aa2f-d064-4340-a38c-7e091b9a9e36','2025-04-09 18:27:09.446259');
INSERT INTO gamification_events VALUES(386,8,NULL,'1960aa2f-d064-4340-a38c-7e091b9a9e36','2025-04-09 18:27:09.946349');
INSERT INTO gamification_events VALUES(387,2,5,NULL,'2025-04-09 23:57:15');
INSERT INTO gamification_events VALUES(388,2,NULL,'69fa5be7-1433-4df4-917b-b8a2607877dc','2025-04-09 23:57:15');
INSERT INTO gamification_events VALUES(389,100,4,NULL,'2025-04-10 00:42:43.959895');
INSERT INTO gamification_events VALUES(390,100,4,NULL,'2025-04-10 00:48:58.054107');
INSERT INTO gamification_events VALUES(391,100,4,NULL,'2025-04-10 08:07:31.462201');
INSERT INTO gamification_events VALUES(392,5,4,NULL,'2025-04-10 09:24:08.001149');
INSERT INTO gamification_events VALUES(393,5,4,NULL,'2025-04-10 09:24:08.887458');
INSERT INTO gamification_events VALUES(394,5,4,NULL,'2025-04-10 09:24:10.998526');
INSERT INTO gamification_events VALUES(395,6,4,NULL,'2025-04-10 09:24:12.131838');
INSERT INTO gamification_events VALUES(396,100,4,NULL,'2025-04-10 09:25:36.864451');
INSERT INTO gamification_events VALUES(397,100,4,NULL,'2025-04-10 09:49:55.739620');
INSERT INTO gamification_events VALUES(398,5,4,NULL,'2025-04-10 09:58:37.909989');
INSERT INTO gamification_events VALUES(399,5,4,NULL,'2025-04-10 09:58:39.054415');
INSERT INTO gamification_events VALUES(400,5,4,NULL,'2025-04-10 09:58:40.043274');
INSERT INTO gamification_events VALUES(401,6,4,NULL,'2025-04-10 09:58:41.776515');
INSERT INTO gamification_events VALUES(402,5,NULL,'bfaf0269-a2ec-4100-a671-6a2ac7a52ce1','2025-04-10 10:03:10.111803');
INSERT INTO gamification_events VALUES(403,5,NULL,'bfaf0269-a2ec-4100-a671-6a2ac7a52ce1','2025-04-10 10:03:11.399277');
INSERT INTO gamification_events VALUES(404,5,NULL,'bfaf0269-a2ec-4100-a671-6a2ac7a52ce1','2025-04-10 10:03:12.484100');
INSERT INTO gamification_events VALUES(405,6,NULL,'bfaf0269-a2ec-4100-a671-6a2ac7a52ce1','2025-04-10 10:03:14.500761');
INSERT INTO gamification_events VALUES(406,3,NULL,'bfaf0269-a2ec-4100-a671-6a2ac7a52ce1','2025-04-10 10:03:28.692352');
INSERT INTO gamification_events VALUES(407,3,NULL,'bfaf0269-a2ec-4100-a671-6a2ac7a52ce1','2025-04-10 10:03:29.284155');
INSERT INTO gamification_events VALUES(408,3,NULL,'bfaf0269-a2ec-4100-a671-6a2ac7a52ce1','2025-04-10 10:03:31.000327');
INSERT INTO gamification_events VALUES(409,100,4,NULL,'2025-04-10 10:03:57.706251');
CREATE TABLE password_reset_tokens (
	id INTEGER NOT NULL, 
	user_id INTEGER NOT NULL, 
	token VARCHAR(100) NOT NULL, 
	created_at DATETIME, 
	expires_at DATETIME, 
	PRIMARY KEY (id), 
	FOREIGN KEY(user_id) REFERENCES usuarios (id), 
	UNIQUE (token)
);
INSERT INTO password_reset_tokens VALUES(1,1,'reset_token_123','2025-04-03 10:45:55.334424','2025-04-03 11:45:55.317795');
INSERT INTO password_reset_tokens VALUES(2,4,'reset_token_456','2025-04-03 10:45:55.334428','2025-04-03 11:45:55.317801');

CREATE TABLE credit_transactions (
	id INTEGER NOT NULL, 
	user_id INTEGER, 
	session_id VARCHAR(36), 
	user_type VARCHAR(20) NOT NULL, 
	amount INTEGER NOT NULL, 
	transaction_type VARCHAR(50) NOT NULL, 
	description VARCHAR(255), 
	payment_amount FLOAT, 
	payment_method VARCHAR(50), 
	payment_status VARCHAR(20), 
	timestamp DATETIME, 
	PRIMARY KEY (id), 
	CONSTRAINT check_user_or_session CHECK ((user_id IS NOT NULL AND session_id IS NULL AND user_type = 'registered') OR (user_id IS NULL AND session_id IS NOT NULL AND user_type = 'anonymous')), 
	FOREIGN KEY(user_id) REFERENCES usuarios (id), 
	FOREIGN KEY(session_id) REFERENCES sesiones_anonimas (id)
);

CREATE TABLE integrations (
	id INTEGER NOT NULL, 
	user_id INTEGER NOT NULL, 
	name VARCHAR(50) NOT NULL, 
	webhook_url VARCHAR(255) NOT NULL, 
	event_type VARCHAR(50) NOT NULL, 
	active BOOLEAN, 
	created_at DATETIME, 
	last_triggered DATETIME, 
	PRIMARY KEY (id), 
	FOREIGN KEY(user_id) REFERENCES usuarios (id)
);

INSERT INTO integrations VALUES(1,2,'slack','https://hooks.slack.com/services/TXXXXX/BXXXXX/XXXXX','credit_usage',1,'2025-04-03 10:45:55.329495','2025-04-03 08:45:55.316848');
INSERT INTO integrations VALUES(2,4,'zapier','https://hooks.zapier.com/hooks/catch/XXXXX/XXXXX','user_login',1,'2025-04-03 10:45:55.329498',NULL);
INSERT INTO integrations VALUES(3,3,'crm_custom','https://api.crm.com/webhook/XXXXX','payment_added',0,'2025-04-03 10:45:55.329500',NULL);

CREATE TABLE payment_methods (
	id INTEGER NOT NULL, 
	user_id INTEGER NOT NULL, 
	payment_type VARCHAR(20) NOT NULL, 
	details VARCHAR(255) NOT NULL, 
	is_default BOOLEAN, 
	created_at DATETIME, 
	updated_at DATETIME, 
	PRIMARY KEY (id), 
	FOREIGN KEY(user_id) REFERENCES usuarios (id)
);

INSERT INTO payment_methods VALUES(1,2,'credit_card','VISA ending in 4242',1,'2025-04-03 10:45:55.332126','2025-04-03 10:45:55.332129');
INSERT INTO payment_methods VALUES(2,2,'paypal','user@example.com',0,'2025-04-03 10:45:55.332131','2025-04-03 10:45:55.332132');
INSERT INTO payment_methods VALUES(3,3,'bank_transfer','IBAN: ESXX XXXX XXXX XXXX XXXX',1,'2025-04-03 10:45:55.332134','2025-04-03 10:45:55.332136');
INSERT INTO payment_methods VALUES(4,2,'credit_card','VISA ending in 4242',1,'2025-04-03 12:58:37','2025-04-03 12:58:37');
INSERT INTO payment_methods VALUES(5,2,'paypal','user@example.com',0,'2025-04-03 12:58:37','2025-04-03 12:58:37');
INSERT INTO payment_methods VALUES(6,3,'bank_transfer','IBAN: ESXX XXXX XXXX XXXX XXXX',1,'2025-04-03 12:58:37','2025-04-03 12:58:37');
INSERT INTO payment_methods VALUES(7,2,'credit_card','VISA ending in 4242',1,'2025-04-03 12:59:44','2025-04-03 12:59:44');
INSERT INTO payment_methods VALUES(8,2,'paypal','user@example.com',0,'2025-04-03 12:59:44','2025-04-03 12:59:44');
INSERT INTO payment_methods VALUES(9,3,'bank_transfer','IBAN: ESXX XXXX XXXX XXXX XXXX',1,'2025-04-03 12:59:44','2025-04-03 12:59:44');
INSERT INTO payment_methods VALUES(10,2,'credit_card','VISA ending in 4242',1,'2025-04-03 13:00:02','2025-04-03 13:00:02');
INSERT INTO payment_methods VALUES(11,2,'paypal','user@example.com',0,'2025-04-03 13:00:02','2025-04-03 13:00:02');
INSERT INTO payment_methods VALUES(12,3,'bank_transfer','IBAN: ESXX XXXX XXXX XXXX XXXX',1,'2025-04-03 13:00:02','2025-04-03 13:00:02');
INSERT INTO payment_methods VALUES(13,2,'credit_card','VISA ending in 4242',1,'2025-04-03 13:01:55','2025-04-03 13:01:55');
INSERT INTO payment_methods VALUES(14,2,'paypal','user@example.com',0,'2025-04-03 13:01:55','2025-04-03 13:01:55');
INSERT INTO payment_methods VALUES(15,3,'bank_transfer','IBAN: ESXX XXXX XXXX XXXX XXXX',1,'2025-04-03 13:01:55','2025-04-03 13:01:55');
INSERT INTO payment_methods VALUES(16,2,'credit_card','VISA ending in 4242',1,'2025-04-03 13:04:27','2025-04-03 13:04:27');
INSERT INTO payment_methods VALUES(17,2,'paypal','user@example.com',0,'2025-04-03 13:04:27','2025-04-03 13:04:27');
INSERT INTO payment_methods VALUES(18,3,'bank_transfer','IBAN: ESXX XXXX XXXX XXXX XXXX',1,'2025-04-03 13:04:27','2025-04-03 13:04:27');
INSERT INTO payment_methods VALUES(19,2,'credit_card','VISA ending in 4242',1,'2025-04-03 13:07:25','2025-04-03 13:07:25');
INSERT INTO payment_methods VALUES(20,2,'paypal','user@example.com',0,'2025-04-03 13:07:25','2025-04-03 13:07:25');
INSERT INTO payment_methods VALUES(21,3,'bank_transfer','IBAN: ESXX XXXX XXXX XXXX XXXX',1,'2025-04-03 13:07:25','2025-04-03 13:07:25');
INSERT INTO payment_methods VALUES(22,4,'stripoer','pago estripoer',0,'2025-04-04 19:54:13.654140','2025-04-06 22:45:45.202146');
INSERT INTO payment_methods VALUES(23,4,'credit bank','my bank',0,'2025-04-05 11:18:02.949542','2025-04-06 18:57:08.588683');
INSERT INTO payment_methods VALUES(24,4,'tarjeteee','my credit card',0,'2025-04-05 11:18:09.398887','2025-04-05 11:18:09.398903');
INSERT INTO payment_methods VALUES(25,4,'teasef asdfasd f','asdfasdfsad',0,'2025-04-06 22:45:42.674178','2025-04-06 22:46:16.919428');
INSERT INTO payment_methods VALUES(26,4,'checke gourmet','gurmet',1,'2025-04-06 22:46:15.313151','2025-04-06 22:46:16.924262');
INSERT INTO payment_methods VALUES(27,9,'checke gourmet','cheke vicente gurme',1,'2025-04-08 13:24:24.850500','2025-04-08 13:24:26.662651');
INSERT INTO payment_methods VALUES(28,2,'credit_card','VISA ending in 4242',1,'2025-04-09 23:57:15','2025-04-09 23:57:15');
INSERT INTO payment_methods VALUES(29,2,'paypal','user@example.com',0,'2025-04-09 23:57:15','2025-04-09 23:57:15');
INSERT INTO payment_methods VALUES(30,3,'bank_transfer','IBAN: ESXX XXXX XXXX XXXX XXXX',1,'2025-04-09 23:57:15','2025-04-09 23:57:15');

CREATE TABLE error_logs (
	id INTEGER NOT NULL, 
	user_id INTEGER, 
	session_id VARCHAR(36), 
	user_type VARCHAR(20) NOT NULL, 
	error_code INTEGER NOT NULL, 
	message VARCHAR(255) NOT NULL, 
	details TEXT, 
	url VARCHAR(255), 
	method VARCHAR(10), 
	ip_address VARCHAR(45), 
	created_at DATETIME, 
	PRIMARY KEY (id), 
	FOREIGN KEY(user_id) REFERENCES usuarios (id), 
	FOREIGN KEY(session_id) REFERENCES sesiones_anonimas (id)
);

CREATE TABLE user_gamification (
	id INTEGER NOT NULL, 
	user_id INTEGER, 
	session_id VARCHAR(36), 
	event_type_id INTEGER NOT NULL, 
	points INTEGER, 
	badge_id INTEGER, 
	PRIMARY KEY (id), 
	FOREIGN KEY(user_id) REFERENCES usuarios (id), 
	FOREIGN KEY(session_id) REFERENCES sesiones_anonimas (id), 
	FOREIGN KEY(event_type_id) REFERENCES event_types (id), 
	FOREIGN KEY(badge_id) REFERENCES badges (id)
);



CREATE TABLE payment_providers (
	id INTEGER NOT NULL, 
	name VARCHAR(50) NOT NULL, 
	active BOOLEAN, 
	PRIMARY KEY (id), 
	UNIQUE (name)
);

INSERT INTO payment_providers VALUES(1,'stripoer',1);
INSERT INTO payment_providers VALUES(2,'credit bank',1);
INSERT INTO payment_providers VALUES(3,'tarjeteee',1);
INSERT INTO payment_providers VALUES(4,'asfasdfasdfasdf',1);
INSERT INTO payment_providers VALUES(5,'teasef asdfasd f',1);
INSERT INTO payment_providers VALUES(6,'checke gourmet',1);

CREATE TABLE coupons (
	id INTEGER NOT NULL, 
	name VARCHAR(100) NOT NULL, 
	description VARCHAR(255), 
	unique_identifier VARCHAR(50) NOT NULL, 
	issued_at DATETIME, 
	expires_at DATETIME, 
	redeemed_at DATETIME, 
	active BOOLEAN, 
	status VARCHAR(20), 
	credits INTEGER NOT NULL, 
	user_id INTEGER, 
	session_id VARCHAR, 
	redeemed_by_user_id INTEGER, 
	redeemed_by_session_id VARCHAR, 
	PRIMARY KEY (id), 
	UNIQUE (unique_identifier)
);

INSERT INTO coupons VALUES(4,'Recompensa Encuesta','Cupón por completar la encuesta','c0f4f4eb-30e8-4127-be23-4dc3011fbb17','2025-04-10 09:24:12.634122',NULL,NULL,1,'active',10,NULL,NULL,NULL,NULL);
INSERT INTO coupons VALUES(5,'Bienvenida','Cupón de bienvenida para usuarios anónimos','dd7ba7c4-651f-4c7a-81ee-b3149e343cf4','2025-04-10 09:24:34.576009',NULL,NULL,1,'active',5,NULL,'5277baa1-6b36-4401-b252-c12cabf33629',NULL,NULL);
INSERT INTO coupons VALUES(6,'Registrado','Cupon por registrarse','6fe9652f-cc54-4153-b05b-9226285d6dfd','2025-04-10 09:27:07.967261',NULL,NULL,1,'active',5,NULL,NULL,NULL,NULL);
INSERT INTO coupons VALUES(7,'Bienvenida','Cupón de bienvenida para usuarios anónimos','a552999a-d89e-4ff7-982d-fc20e1fc0a7a','2025-04-10 09:30:16.071504',NULL,'2025-04-10 09:31:27.034389',1,'redeemed',5,NULL,'403b50a2-e91c-4f80-88aa-86d1122c9494',NULL,'403b50a2-e91c-4f80-88aa-86d1122c9494');
INSERT INTO coupons VALUES(8,'Bienvenida','Cupón de bienvenida para usuarios anónimos','6e2b3eb4-31cf-4522-ac49-ca0ae046fa58','2025-04-10 09:44:26.320947',NULL,NULL,1,'active',5,NULL,'57d71af6-6f56-405c-8bb6-639e502397b5',NULL,NULL);
INSERT INTO coupons VALUES(9,'Recompensa Encuesta','Cupón por completar la encuesta','bf2d709c-1e69-4984-bb7f-5e1efb573c84','2025-04-10 09:58:42.233347',NULL,NULL,1,'active',10,NULL,NULL,NULL,NULL);
INSERT INTO coupons VALUES(10,'Demo Coupon','Cupón de demostración','8d2d9360-6960-4f34-adda-277cf38ab5ce','2025-04-10 10:00:03.405445',NULL,NULL,1,'active',5,NULL,NULL,NULL,NULL);
INSERT INTO coupons VALUES(11,'Bienvenida','Cupón de bienvenida para usuarios anónimos','cb6a5293-e712-49fb-8ed8-bb71a6208dc0','2025-04-10 10:02:46.013487',NULL,NULL,1,'active',5,NULL,'bfaf0269-a2ec-4100-a671-6a2ac7a52ce1',NULL,NULL);
INSERT INTO coupons VALUES(12,'Demo Coupon','Cupón de demostración','01f6fba6-b195-4533-9a60-0e163f3582c5','2025-04-10 10:03:35.236935',NULL,NULL,1,'active',5,NULL,NULL,NULL,NULL);

CREATE UNIQUE INDEX ix_usuarios_username ON usuarios (username);
CREATE INDEX ix_usuarios_id ON usuarios (id);
CREATE UNIQUE INDEX ix_usuarios_email ON usuarios (email);
CREATE INDEX ix_sesiones_anonimas_id ON sesiones_anonimas (id);
CREATE INDEX ix_event_types_id ON event_types (id);
CREATE INDEX ix_site_settings_id ON site_settings (id);
CREATE INDEX ix_allowed_origins_id ON allowed_origins (id);
CREATE INDEX ix_badges_id ON badges (id);
CREATE INDEX ix_gamification_events_id ON gamification_events (id);
CREATE INDEX ix_password_reset_tokens_id ON password_reset_tokens (id);
CREATE INDEX ix_credit_transactions_id ON credit_transactions (id);
CREATE INDEX ix_integrations_id ON integrations (id);
CREATE INDEX ix_payment_methods_id ON payment_methods (id);
CREATE INDEX ix_error_logs_id ON error_logs (id);
/*
CREATE INDEX ix_api_logs_id ON api_logs (id);
*/
CREATE INDEX ix_user_gamification_id ON user_gamification (id);
CREATE INDEX ix_payment_providers_id ON payment_providers (id);
CREATE INDEX ix_coupons_id ON coupons (id);
COMMIT;
