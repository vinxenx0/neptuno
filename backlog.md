OPTIMIZAR EL DEPLOY CON EL TEMA EXPORT // SSDR ETC en el orders

En el carrito version movil no se ve el badge de notificaciones

bug frontpage: las variables se machacan

idea PMM : dividir neptuno en productos

- neptuno base / ce / pruebas / starter()
- neptuno stack + boilerplate / mvp (uth y user y front)
- neptuno retail / delivery / food : (marketplace - credits )
- neptuno growth / agency (badges - points - subs?)
- neptuno cms / people ( user - subs - events - gdpr - wcag )
- enterprise / corp : sdk - cloud - all features

cada uno 25$/m

neptuno es nuestro propio marketplace / demostración!! 

imagenes del nuevo boilerplate no existen

aceptar las politicas al registrarse

crear los pytests de cada modulo

mas componentes:  <FooterLink href="/docs">Documentación</FooterLink>
              <FooterLink href="/api">API</FooterLink>
              <FooterLink href="/marketplace">Marketplace</FooterLink>
              <FooterLink href="/partners">Partners</FooterLink>
              <FooterLink href="/testimonials">Testimonios</FooterLink>
              <FooterLink href="/case-studies">Casos de Éxito</FooterLink>
              <FooterLink href="/careers">Carreras</FooterLink>
              <FooterLink href="/events">Eventos</FooterLink>
              <FooterLink href="/webinars">Webinars</FooterLink>
              <FooterLink href="/news">Noticias</FooterLink>
              <FooterLink href="/press">Prensa</FooterLink>
              <FooterLink href="/media">Medios</FooterLink>
              <FooterLink href="/resources">Recursos</FooterLink>
              <FooterLink href="/guides">Guías</FooterLink>
              <FooterLink href="/whitepapers">Documentos Técnicos</FooterLink>

GDPR


-- footer do not sell my personal info
-- implementar la lógica para enviar preferencias al backend
-- implantar privacy center
-- ubicación correcta archivos
-- implantar apis
-- terminar implantacion whistblower
-- meter el site settings para mostrar u ocultar
-- 
./src/components/gdpr/CookieConsentBanner.js
36:6  Warning: React Hook useEffect has a missing dependency: 'onShow'. Either include it or remove the dependency array. If 'onShow' changes too often, find the parent component that defines it and wrap that definition in useCallback.  react-hooks/exhaustive-deps


bug al confirmar cambio de contraseña: (no la cambia al final parece)

 "OPTIONS /v1/auth/password-reset/confirm HTTP/1.1" 200 OK
2025-05-04 13:57:13,811 - NeptunO - CRITICAL - Error inesperado en POST http://localhost:8000/v1/auth/password-reset/confirm: confirm_password_reset() takes from 1 to 2 positional arguments but 3 were given
CRITICAL:NeptunO:Error inesperado en POST http://localhost:8000/v1/auth/password-reset/confirm: confirm_password_reset() takes from 1 to 2 positional arguments but 3 were given
INFO:     127.0.0.1:52295 - "POST /v1/auth/password-reset/confirm HTTP/1.1" 500 Internal Server Error
ERROR:    Exception in ASGI application
Traceback (most recent call last):
  File "/home/vinxenxo/neptuno/neptuno-1/backend/.venv/lib/python3.10/site-packages/uvicorn/protocols/http/h11_impl.py", line 403, in run_asgi
    result = await app(  # type: ignore[func-returns-value]
  File "/home/vinxenxo/neptuno/neptuno-1/backend/.venv/lib/python3.10/site-packages/uvicorn/middleware/proxy_headers.py", line 60, in __call__
    return await self.app(scope, receive, send)
  File "/home/vinxenxo/neptuno/neptuno-1/backend/.venv/lib/python3.10/site-packages/fastapi/applications.py", line 1054, in __call__
    await super().__call__(scope, receive, send)
  File "/home/vinxenxo/neptuno/neptuno-1/backend/.venv/lib/python3.10/site-packages/starlette/applications.py", line 112, in __call__
    await self.middleware_stack(scope, receive, send)
  File "/home/vinxenxo/neptuno/neptuno-1/backend/.venv/lib/python3.10/site-packages/starlette/middleware/errors.py", line 187, in __call__
    raise exc
  File "/home/vinxenxo/neptuno/neptuno-1/backend/.venv/lib/python3.10/site-packages/starlette/middleware/errors.py", line 165, in __call__
    await self.app(scope, receive, _send)
  File "/home/vinxenxo/neptuno/neptuno-1/backend/.venv/lib/python3.10/site-packages/starlette/middleware/cors.py", line 93, in __call__
    await self.simple_response(scope, receive, send, request_headers=headers)
  File "/home/vinxenxo/neptuno/neptuno-1/backend/.venv/lib/python3.10/site-packages/starlette/middleware/cors.py", line 144, in simple_response
    await self.app(scope, receive, send)
  File "/home/vinxenxo/neptuno/neptuno-1/backend/.venv/lib/python3.10/site-packages/starlette/middleware/cors.py", line 93, in __call__
    await self.simple_response(scope, receive, send, request_headers=headers)
  File "/home/vinxenxo/neptuno/neptuno-1/backend/.venv/lib/python3.10/site-packages/starlette/middleware/cors.py", line 144, in simple_response
    await self.app(scope, receive, send)
  File "/home/vinxenxo/neptuno/neptuno-1/backend/.venv/lib/python3.10/site-packages/starlette/middleware/exceptions.py", line 62, in __call__
    await wrap_app_handling_exceptions(self.app, conn)(scope, receive, send)
  File "/home/vinxenxo/neptuno/neptuno-1/backend/.venv/lib/python3.10/site-packages/starlette/_exception_handler.py", line 53, in wrapped_app
    raise exc
  File "/home/vinxenxo/neptuno/neptuno-1/backend/.venv/lib/python3.10/site-packages/starlette/_exception_handler.py", line 42, in wrapped_app
    await app(scope, receive, sender)
  File "/home/vinxenxo/neptuno/neptuno-1/backend/.venv/lib/python3.10/site-packages/starlette/routing.py", line 714, in __call__
    await self.middleware_stack(scope, receive, send)
  File "/home/vinxenxo/neptuno/neptuno-1/backend/.venv/lib/python3.10/site-packages/starlette/routing.py", line 734, in app
    await route.handle(scope, receive, send)
  File "/home/vinxenxo/neptuno/neptuno-1/backend/.venv/lib/python3.10/site-packages/starlette/routing.py", line 288, in handle
    await self.app(scope, receive, send)
  File "/home/vinxenxo/neptuno/neptuno-1/backend/.venv/lib/python3.10/site-packages/starlette/routing.py", line 76, in app
    await wrap_app_handling_exceptions(app, request)(scope, receive, send)
  File "/home/vinxenxo/neptuno/neptuno-1/backend/.venv/lib/python3.10/site-packages/starlette/_exception_handler.py", line 53, in wrapped_app
    raise exc
  File "/home/vinxenxo/neptuno/neptuno-1/backend/.venv/lib/python3.10/site-packages/starlette/_exception_handler.py", line 42, in wrapped_app
    await app(scope, receive, sender)
  File "/home/vinxenxo/neptuno/neptuno-1/backend/.venv/lib/python3.10/site-packages/starlette/routing.py", line 73, in app
    response = await f(request)
  File "/home/vinxenxo/neptuno/neptuno-1/backend/.venv/lib/python3.10/site-packages/fastapi/routing.py", line 301, in app
    raw_response = await run_endpoint_function(
  File "/home/vinxenxo/neptuno/neptuno-1/backend/.venv/lib/python3.10/site-packages/fastapi/routing.py", line 214, in run_endpoint_function
    return await run_in_threadpool(dependant.call, **values)
  File "/home/vinxenxo/neptuno/neptuno-1/backend/.venv/lib/python3.10/site-packages/starlette/concurrency.py", line 37, in run_in_threadpool
    return await anyio.to_thread.run_sync(func)
  File "/home/vinxenxo/neptuno/neptuno-1/backend/.venv/lib/python3.10/site-packages/anyio/to_thread.py", line 56, in run_sync
    return await get_async_backend().run_sync_in_worker_thread(
  File "/home/vinxenxo/neptuno/neptuno-1/backend/.venv/lib/python3.10/site-packages/anyio/_backends/_asyncio.py", line 2470, in run_sync_in_worker_thread
    return await future
  File "/home/vinxenxo/neptuno/neptuno-1/backend/.venv/lib/python3.10/site-packages/anyio/_backends/_asyncio.py", line 967, in run
    result = context.run(func, *args)
  File "/home/vinxenxo/neptuno/neptuno-1/backend/api/v1/auth/auth.py", line 61, in confirm_password_reset
    return confirm_password_reset(db, data.token, data.new_password)
TypeError: confirm_password_reset() takes from 1 to 2 positional arguments but 3 were given


el componente img


./src/components/default-site/AboutUs.tsx
46:15  Warning: Using `<img>` could result in slower LCP and higher bandwidth. Consider using `<Image />` from `next/image` or a custom image loader to automatically optimize images. This may incur additional usage or cost from your provider. See: https://nextjs.org/docs/messages/no-img-element  @next/next/no-img-element

./src/components/default-site/CTA.tsx
53:13  Warning: Using `<img>` could result in slower LCP and higher bandwidth. Consider using `<Image />` from `next/image` or a custom image loader to automatically optimize images. This may incur additional usage or cost from your provider. See: https://nextjs.org/docs/messages/no-img-element  @next/next/no-img-element

./src/components/default-site/Careers.tsx
45:15  Warning: Using `<img>` could result in slower LCP and higher bandwidth. Consider using `<Image />` from `next/image` or a custom image loader to automatically optimize images. This may incur additional usage or cost from your provider. See: https://nextjs.org/docs/messages/no-img-element  @next/next/no-img-element

./src/components/default-site/EnhancedFeatures.tsx
79:13  Warning: Using `<img>` could result in slower LCP and higher bandwidth. Consider using `<Image />` from `next/image` or a custom image loader to automatically optimize images. This may incur additional usage or cost from your provider. See: https://nextjs.org/docs/messages/no-img-element  @next/next/no-img-element

./src/components/default-site/Hero.tsx
64:13  Warning: Using `<img>` could result in slower LCP and higher bandwidth. Consider using `<Image />` from `next/image` or a custom image loader to automatically optimize images. This may incur additional usage or cost from your provider. See: https://nextjs.org/docs/messages/no-img-element  @next/next/no-img-element

./src/components/default-site/Marketplace.tsx
60:19  Warning: Using `<img>` could result in slower LCP and higher bandwidth. Consider using `<Image />` from `next/image` or a custom image loader to automatically optimize images. This may incur additional usage or cost from your provider. See: https://nextjs.org/docs/messages/no-img-element  @next/next/no-img-element

./src/components/default-site/Trust.tsx
37:15  Warning: Using `<img>` could result in slower LCP and higher bandwidth. Consider using `<Image />` from `next/image` or a custom image loader to automatically optimize images. This may incur additional usage or cost from your provider. See: https://nextjs.org/docs/messages/no-img-element  @next/next/no-img-element

info  - Need to disable some ESLint rules? Learn more here: https://nextjs.org/docs/app/api-reference/config/eslint#disabling-rules

- AL PROMPT: Info el MVP ya esta desplegado en producción
- Continuamos

- Mejoras en los settings, vamos ampliar:
  - nuevos modulos que activar o desactivar: pagos, suscripciones, etc
  - nuevas features que puedes editar, añadir, etc : nombres roles, nombres susbcriptores, etc
  - middleware: logging, hooks

  - mejora control usuarios anonimos (tabla) -> nombre usuario y los endpoints
  

  -- en el prompnt:
    -- ha quedado dpm las features vamos a profundizar: categorias, planes, creditos, ssl, crones
    -- vamos añadir un modulo nuevo: type, schema, model, middleware, security 
            -- modulo notificaciones, modulo gaming, modulo badges, 
    -- añadir crud a las ventanas del registry

    -- loading como cargando neptuno en todas las paginas
    -- a futuro: panel de tracking de usuarios
    -- avanzar en la configuracion modular del sitio para activar o desactivar features
    -todo: mejorar la configuración (  archivos o db para los limites?, ) hacerla mas escalable y desactivar features
  - Ordenar la API abierta (whoamin,etc)

- Nuevas caracteristicas:
  - Modulo gamming: score y badges y completados o challgenges
  - Modulo tracking: tiempo, clicks, usuario (middleware)
  - Modulo noticias: tipo barra que se desplegaba en moonitor
  - Modulo wallet/compras: items digitales comprados (ecommerce)
  - Modulo SEO


- Nuevas pantallas para esas nuevas caracteristicas
  - Reorganizar profile de user
  - Dejarlo todo en una opcion (auth/user/pagos/etc)


- Agrupar los ficheros de la api, dejar espacio para lo nuevo, dejar listo para moonitor
  (en que momento se le dice a la IA que es un nuevo proyecto)

- Revisar nombres campos modelos principales (añadir?)


- Detalles menores de interfaz
  - Toggle theme en navbar pasa a footer
  - El dashboard de admin pasa a tener tarjetas

- Bugs de TODO

- el bug de los creditos y el storage en front page

- en admin/registry:
- Vaciar logs : Function not implemented pero si funciona
- Guest logs: tb vaciar logs
- cupones logs: vaciar tb

- limpiar cupones q no pertenecen a nadie

- reflejo de los creditos consistencia en los journey

/// CREDITOS POR REGISTRARSE: 100 
// CREDITOS POR REGISTRARSE con otro proveedor: 200

Comprobar tema SEO no se ven las meta tags

Comprobar los badges y puntos de los anonimos -> revisar las aventuras de la db



- LOGS

    - arreglar esto en main: logger = configure_logging()
    - app.add_middleware(LoggingMiddleware)
    -  Añadir logging a otras funciones de auth_service.py 
    - el lio de los loggers


- CONFIGURACION

-- avisar del registro de usuarios (añadir info bar arriba)

-- preparar del docker-compose yaml para que tenga un nginx dockerizado para el resto de users (probarlo tb)

--- ya esta comentado solo falta copiarle los archivos del finetuning y los del hosting (irian a default)


- API

-- unir los interfaces en los types.ts
-- borrar rutas que ya no se usan
-  Añadir manejo de errores y excepciones a otras funciones de auth_service.py 

-  Añadir manejo de errores y excepciones a otras funciones de endpoints.py 

- poner ya los endpoints para usuarios registrados (estan todos abiertos)

- en el backend no todos los modelos tienen endpoints

-- Nomenclatuura estructura archivos para compartir github gnu -> añadir nuevas carpetas en api, ordenar mejor
-- Enfoque ya de que otros lo vean


-- limpiar api que no vale

-- el temoraly redirect de logs por el pageination



- DISEÑO

-- unificar el cargando con un spinner
-- añadir el hacer predeterminada en el form



- BUGS
    -- que no deje registrarse si esta desahbilitado! (muestre el form apagado)
    -- redirect despues de login a dashboard no a profile
    -- error desconocido cuando el email es el mismo hay q revisarlo
    -- cuando añado una transaccion me dice Datos de transacción incompletos pero funciona (aunque no recarga)
    --- reset credits enchufa 2000 creditos y reset credits no me reconoce el tooken de admin
    --- allowed origin no va (no graba no muestra etc)
    -- cuando pierde el token debe forzar la url a volver a / u otro sitio ?boton estas ahi?
    -- Cuando recargas dashboard se va a index con la misma url
    -- el toast q se vea siempre
    - Si el backend ya comprime respuestas (ej: gzip o brotli), Nginx las re-comprimirá, lo que es ineficiente.
    -- incongruencia con el id de anonimo: cuando hago logout me da un nuevo sesion? pero me mantiene los creditos
    ---- datos de transaccion incompletos pero no es asi si refrescas
    ---- el de las integraciones  es por el invalid date?
    -- en el proxy tengo que proxear tb /v1
    -- en portada muestra unos creditos resto de paginas otros




UserWarning: Duplicate Operation ID create_event_type_endpoint_v1_gamification_event_types_post for function create_event_type_endpoint at /app/api/v1/gamification.py
neptuno-stack      |   warnings.warn(message, stacklevel=1)
neptuno-stack      | /usr/local/lib/python3.10/site-packages/fastapi/openapi/utils.py:225: UserWarning: Duplicate Operation ID get_event_types_endpoint_v1_gamification_event_types_get for function get_event_types_endpoint at /app/api/v1/gamification.py
neptuno-stack      |   warnings.warn(message, stacklevel=1)
neptuno-stack      | /usr/local/lib/python3.10/site-packages/fastapi/openapi/utils.py:225: UserWarning: Duplicate Operation ID update_event_type_endpoint_v1_gamification_event_types__event_type_id__put for function update_event_type_endpoint at /app/api/v1/gamification.py
neptuno-stack      |   warnings.warn(message, stacklevel=1)
neptuno-stack      | /usr/local/lib/python3.10/site-packages/fastapi/openapi/utils.py:225: UserWarning: Duplicate Operation ID delete_event_type_endpoint_v1_gamification_event_types__event_type_id__delete for function delete_event_type_endpoint at /app/api/v1/gamification.py
neptuno-stack      |   warnings.warn(message, stacklevel=1)
neptuno-stack      | /usr/local/lib/python3.10/site-packages/fastapi/openapi/utils.py:225: UserWarning: Duplicate Operation ID create_badge_endpoint_v1_gamification_badges_post for function create_badge_endpoint at /app/api/v1/gamification.py
neptuno-stack      |   warnings.warn(message, stacklevel=1)
neptuno-stack      | /usr/local/lib/python3.10/site-packages/fastapi/openapi/utils.py:225: UserWarning: Duplicate Operation ID get_badges_endpoint_v1_gamification_badges_get for function get_badges_endpoint at /app/api/v1/gamification.py
neptuno-stack      |   warnings.warn(message, stacklevel=1)
neptuno-stack      | /usr/local/lib/python3.10/site-packages/fastapi/openapi/utils.py:225: UserWarning: Duplicate Operation ID update_badge_endpoint_v1_gamification_badges__badge_id__put for function update_badge_endpoint at /app/api/v1/gamification.py
neptuno-stack      |   warnings.warn(message, stacklevel=1)
neptuno-stack      | /usr/local/lib/python3.10/site-packages/fastapi/openapi/utils.py:225: UserWarning: Duplicate Operation ID delete_badge_endpoint_v1_gamification_badges__badge_id__delete for function delete_badge_endpoint at /app/api/v1/gamification.py
neptuno-stack      |   warnings.warn(message, stacklevel=1)
neptuno-db         | 2025-04-06 22:49:20+00:00 [ERROR] [Entrypoint]: Database is uninitialized and password option is not specified

-


el sistema de puntos navbar funciona aunque el site settings este deshabilitado ¿cache? si cache es eso 
el bug con el toggle de origins al cargar - > revisar el true y el site seettings
- no tienes ranking cuando apareces el primero siendo anonimous

neptuno-stack      | CRITICAL:NeptunO:Error inesperado en POST https://neptuno.ciberpunk.es/v1/gamification/events: Event type not found
neptuno-stack      | [2025-04-22 01:11:18 +0000] [7] [ERROR] Exception in ASGI application
neptuno-stack      | Traceback (most recent call last):
neptuno-stack      |   File "/usr/local/lib/python3.10/site-packages/uvicorn/protocols/http/h11_impl.py", line 403, in run_asgi
neptuno-stack      |     result = await app(  # type: ignore[func-returns-value]
neptuno-stack      |   File "/usr/local/lib/python3.10/site-packages/uvicorn/middleware/proxy_headers.py", line 60, in __call__
neptuno-stack      |     return await self.app(scope, receive, send)
neptuno-stack      |   File "/usr/local/lib/python3.10/site-packages/fastapi/applications.py", line 1054, in __call__
neptuno-stack      |     await super().__call__(scope, receive, send)
neptuno-stack      |   File "/usr/local/lib/python3.10/site-packages/starlette/applications.py", line 112, in __call__
neptuno-stack      |     await self.middleware_stack(scope, receive, send)
neptuno-stack      |   File "/usr/local/lib/python3.10/site-packages/starlette/middleware/errors.py", line 187, in __call__
neptuno-stack      |     raise exc
neptuno-stack      |   File "/usr/local/lib/python3.10/site-packages/starlette/middleware/errors.py", line 165, in __call__
neptuno-stack      |     await self.app(scope, receive, _send)
neptuno-stack      |   File "/usr/local/lib/python3.10/site-packages/starlette/middleware/cors.py", line 93, in __call__
neptuno-stack      |     await self.simple_response(scope, receive, send, request_headers=headers)
neptuno-stack      |   File "/usr/local/lib/python3.10/site-packages/starlette/middleware/cors.py", line 144, in simple_response
neptuno-stack      |     await self.app(scope, receive, send)
neptuno-stack      |   File "/usr/local/lib/python3.10/site-packages/starlette/middleware/cors.py", line 93, in __call__
neptuno-stack      |     await self.simple_response(scope, receive, send, request_headers=headers)
neptuno-stack      |   File "/usr/local/lib/python3.10/site-packages/starlette/middleware/cors.py", line 144, in simple_response
neptuno-stack      |     await self.app(scope, receive, send)
neptuno-stack      |   File "/usr/local/lib/python3.10/site-packages/starlette/middleware/exceptions.py", line 62, in __call__
neptuno-stack      |     await wrap_app_handling_exceptions(self.app, conn)(scope, receive, send)
neptuno-stack      |   File "/usr/local/lib/python3.10/site-packages/starlette/_exception_handler.py", line 53, in wrapped_app
neptuno-stack      |     raise exc
neptuno-stack      |   File "/usr/local/lib/python3.10/site-packages/starlette/_exception_handler.py", line 42, in wrapped_app
neptuno-stack      |     await app(scope, receive, sender)
neptuno-stack      |   File "/usr/local/lib/python3.10/site-packages/starlette/routing.py", line 714, in __call__
neptuno-stack      |     await self.middleware_stack(scope, receive, send)
neptuno-stack      |   File "/usr/local/lib/python3.10/site-packages/starlette/routing.py", line 734, in app
neptuno-stack      |     await route.handle(scope, receive, send)
neptuno-stack      |   File "/usr/local/lib/python3.10/site-packages/starlette/routing.py", line 288, in handle
neptuno-stack      |     await self.app(scope, receive, send)
neptuno-stack      |   File "/usr/local/lib/python3.10/site-packages/starlette/routing.py", line 76, in app
neptuno-stack      |     await wrap_app_handling_exceptions(app, request)(scope, receive, send)
neptuno-stack      |   File "/usr/local/lib/python3.10/site-packages/starlette/_exception_handler.py", line 53, in wrapped_app
neptuno-stack      |     raise exc
neptuno-stack      |   File "/usr/local/lib/python3.10/site-packages/starlette/_exception_handler.py", line 42, in wrapped_app
neptuno-stack      |     await app(scope, receive, sender)
neptuno-stack      |   File "/usr/local/lib/python3.10/site-packages/starlette/routing.py", line 73, in app
neptuno-stack      |     response = await f(request)
neptuno-stack      |   File "/usr/local/lib/python3.10/site-packages/fastapi/routing.py", line 301, in app
neptuno-stack      |     raw_response = await run_endpoint_function(
neptuno-stack      |   File "/usr/local/lib/python3.10/site-packages/fastapi/routing.py", line 212, in run_endpoint_function
neptuno-stack      |     return await dependant.call(**values)
neptuno-stack      |   File "/app/api/v1/gamification.py", line 35, in create_event
neptuno-stack      |     return register_event(db, event, user)
neptuno-stack      |   File "/app/services/gamification_service.py", line 38, in register_event
neptuno-stack      |     update_user_gamification(db, user, event.event_type_id)
neptuno-stack      |   File "/app/services/gamification_service.py", line 99, in update_user_gamification
neptuno-stack      |     raise ValueError("Event type not found")
neptuno-stack      | ValueError: Event type not found
neptuno-stack      | 2025-04-22 01:11:18,312 - NeptunO - INFO - Procesando solicitud: token=False, session_id=5b441b17-15ff-468d-8012-0dde125647f6, ip=92.246.83.1
neptuno-stack      | INFO:NeptunO:Procesando solicitud: token=False, session_id=5b441b17-15ff-468d-8012-0dde125647f6, ip=92.246.83.1
neptuno-stack      | 2025-04-22 01:11:18,313 - NeptunO - INFO - Buscando sesión anónima con ID 5b441b17-15ff-468d-8012-0dde125647f6 desde header
neptuno-stack      | INFO:NeptunO:Buscando sesión anónima con ID 5b441b17-15ff-468d-8012-0dde125647f6 desde header
neptuno-stack      | 2025-04-22 01:11:18,317 - NeptunO - INFO - Sesión anónima ID 5b441b17-15ff-468d-8012-0dde125647f6 actualizada desde IP 92.246.83.1
neptuno-stack      | INFO:NeptunO:Sesión anónima ID 5b441b17-15ff-468d-8012-0dde125647f6 actualizada desde IP 92.246.83.1
neptuno-stack      | 2025-04-22 01:11:18,635 - NeptunO - INFO - Procesando solicitud: token=False, session_id=5b441b17-15ff-468d-8012-0dde125647f6, ip=92.246.83.1
neptuno-stack      | INFO:NeptunO:Procesando solicitud: token=False, session_id=5b441b17-15ff-468d-8012-0dde125647f6, ip=92.246.83.1
neptuno-stack      | 2025-04-22 01:11:18,635 - NeptunO - INFO - Buscando sesión anónima con ID 5b441b17-15ff-468d-8012-0dde125647f6 desde header
neptuno-stack      | INFO:NeptunO:Buscando sesión anónima con ID 5b441b17-15ff-468d-8012-0dde125647f6 desde header
neptuno-stack      | 2025-04-22 01:11:18,640 - NeptunO - INFO - Sesión anónima ID 5b441b17-15ff-468d-8012-0dde125647f6 actualizada desde IP 92.246.83.1
neptuno-stack      | INFO:NeptunO:Sesión anónima ID 5b441b17-15ff-468d-8012-0dde125647f6 actualizada desde IP 92.246.83.1
neptuno-stack      | 2025-04-22 01:11:18,645 - NeptunO - CRITICAL - Error inesperado en POST https://neptuno.ciberpunk.es/v1/gamification/events: Event type not found
neptuno-stack      | CRITICAL:NeptunO:Error inesperado en POST https://neptuno.ciberpunk.es/v1/gamification/events: Event type not found
neptuno-stack      | [2025-04-22 01:11:18 +0000] [7] [ERROR] Exception in ASGI application
neptuno-stack      | Traceback (most recent call last):
neptuno-stack      |   File "/usr/local/lib/python3.10/site-packages/uvicorn/protocols/http/h11_impl.py", line 403, in run_asgi
neptuno-stack      |     result = await app(  # type: ignore[func-returns-value]
neptuno-stack      |   File "/usr/local/lib/python3.10/site-packages/uvicorn/middleware/proxy_headers.py", line 60, in __call__
neptuno-stack      |     return await self.app(scope, receive, send)
neptuno-stack      |   File "/usr/local/lib/python3.10/site-packages/fastapi/applications.py", line 1054, in __call__
neptuno-stack      |     await super().__call__(scope, receive, send)
neptuno-stack      |   File "/usr/local/lib/python3.10/site-packages/starlette/applications.py", line 112, in __call__
neptuno-stack      |     await self.middleware_stack(scope, receive, send)
neptuno-stack      |   File "/usr/local/lib/python3.10/site-packages/starlette/middleware/errors.py", line 187, in __call__
neptuno-stack      |     raise exc
neptuno-stack      |   File "/usr/local/lib/python3.10/site-packages/starlette/middleware/errors.py", line 165, in __call__
neptuno-stack      |     await self.app(scope, receive, _send)
neptuno-stack      |   File "/usr/local/lib/python3.10/site-packages/starlette/middleware/cors.py", line 93, in __call__
neptuno-stack      |     await self.simple_response(scope, receive, send, request_headers=headers)
neptuno-stack      |   File "/usr/local/lib/python3.10/site-packages/starlette/middleware/cors.py", line 144, in simple_response
neptuno-stack      |     await self.app(scope, receive, send)
neptuno-stack      |   File "/usr/local/lib/python3.10/site-packages/starlette/middleware/cors.py", line 93, in __call__
neptuno-stack      |     await self.simple_response(scope, receive, send, request_headers=headers)
neptuno-stack      |   File "/usr/local/lib/python3.10/site-packages/starlette/middleware/cors.py", line 144, in simple_response
neptuno-stack      |     await self.app(scope, receive, send)
neptuno-stack      |   File "/usr/local/lib/python3.10/site-packages/starlette/middleware/exceptions.py", line 62, in __call__
neptuno-stack      |     await wrap_app_handling_exceptions(self.app, conn)(scope, receive, send)
neptuno-stack      |   File "/usr/local/lib/python3.10/site-packages/starlette/_exception_handler.py", line 53, in wrapped_app
neptuno-stack      |     raise exc
neptuno-stack      |   File "/usr/local/lib/python3.10/site-packages/starlette/_exception_handler.py", line 42, in wrapped_app
neptuno-stack      |     await app(scope, receive, sender)
neptuno-stack      |   File "/usr/local/lib/python3.10/site-packages/starlette/routing.py", line 714, in __call__
neptuno-stack      |     await self.middleware_stack(scope, receive, send)
neptuno-stack      |   File "/usr/local/lib/python3.10/site-packages/starlette/routing.py", line 734, in app
neptuno-stack      |     await route.handle(scope, receive, send)
neptuno-stack      |   File "/usr/local/lib/python3.10/site-packages/starlette/routing.py", line 288, in handle
neptuno-stack      |     await self.app(scope, receive, send)
neptuno-stack      |   File "/usr/local/lib/python3.10/site-packages/starlette/routing.py", line 76, in app
neptuno-stack      |     await wrap_app_handling_exceptions(app, request)(scope, receive, send)
neptuno-stack      |   File "/usr/local/lib/python3.10/site-packages/starlette/_exception_handler.py", line 53, in wrapped_app
neptuno-stack      |     raise exc
neptuno-stack      |   File "/usr/local/lib/python3.10/site-packages/starlette/_exception_handler.py", line 42, in wrapped_app
neptuno-stack      |     await app(scope, receive, sender)
neptuno-stack      |   File "/usr/local/lib/python3.10/site-packages/starlette/routing.py", line 73, in app
neptuno-stack      |     response = await f(request)
neptuno-stack      |   File "/usr/local/lib/python3.10/site-packages/fastapi/routing.py", line 301, in app
neptuno-stack      |     raw_response = await run_endpoint_function(
neptuno-stack      |   File "/usr/local/lib/python3.10/site-packages/fastapi/routing.py", line 212, in run_endpoint_function
neptuno-stack      |     return await dependant.call(**values)
neptuno-stack      |   File "/app/api/v1/gamification.py", line 35, in create_event
neptuno-stack      |     return register_event(db, event, user)
neptuno-stack      |   File "/app/services/gamification_service.py", line 38, in register_event
neptuno-stack      |     update_user_gamification(db, user, event.event_type_id)
neptuno-stack      |   File "/app/services/gamification_service.py", line 99, in update_user_gamification
neptuno-stack      |     raise ValueError("Event type not found")
neptuno-stack      | ValueError: Event type not found
neptuno-stack      | 2025-04-22 01:11:18,686 - NeptunO - INFO - Procesando solicitud: token=False, session_id=5b441b17-15ff-468d-8012-0dde125647f6, ip=92.246.83.1
neptuno-stack      | INFO:NeptunO:Procesando solicitud: token=False, session_id=5b441b17-15ff-468d-8012-0dde125647f6, ip=92.246.83.1
neptuno-stack      | 2025-04-22 01:11:18,686 - NeptunO - INFO - Buscando sesión anónima con ID 5b441b17-15ff-468d-8012-0dde125647f6 desde header
neptuno-stack      | INFO:NeptunO:Buscando sesión anónima con ID 5b441b17-15ff-468d-8012-0dde125647f6 desde header
neptuno-stack      | 2025-04-22 01:11:18,690 - NeptunO - INFO - Sesión anónima ID 5b441b17-15ff-468d-8012-0dde125647f6 actualizada desde IP 92.246.83.1
neptuno-stack      | INFO:NeptunO:Sesión anónima ID 5b441b17-15ff-468d-8012-0dde125647f6 actualizada desde IP 92.246.83.1
neptuno-stack      | 2025-04-22 01:11:19,100 - NeptunO - INFO - Procesando solicitud: token=False, session_id=5b441b17-15ff-468d-8012-0dde125647f6, ip=92.246.83.1
neptuno-stack      | INFO:NeptunO:Procesando solicitud: token=False, session_id=5b441b17-15ff-468d-8012-0dde125647f6, ip=92.246.83.1
neptuno-stack      | 2025-04-22 01:11:19,100 - NeptunO - INFO - Buscando sesión anónima con ID 5b441b17-15ff-468d-8012-0dde125647f6 desde header
neptuno-stack      | INFO:NeptunO:Buscando sesión anónima con ID 5b441b17-15ff-468d-8012-0dde125647f6 desde header
neptuno-stack      | 2025-04-22 01:11:19,105 - NeptunO - INFO - Sesión anónima ID 5b441b17-15ff-468d-8012-0dde125647f6 actualizada desde IP 92.246.83.1
neptuno-stack      | INFO:NeptunO:Sesión anónima ID 5b441b17-15ff-468d-8012-0dde125647f6 actualizada desde IP 92.246.83.1
neptuno-stack      | 2025-04-22 01:11:19,110 - NeptunO - CRITICAL - Error inesperado en POST https://neptuno.ciberpunk.es/v1/gamification/events: Event type not found
neptuno-stack      | CRITICAL:NeptunO:Error inesperado en POST https://neptuno.ciberpunk.es/v1/gamification/events: Event type not found
neptuno-stack      | [2025-04-22 01:11:19 +0000] [7] [ERROR] Exception in ASGI application
neptuno-stack      | Traceback (most recent call last):
neptuno-stack      |   File "/usr/local/lib/python3.10/site-packages/uvicorn/protocols/http/h11_impl.py", line 403, in run_asgi
neptuno-stack      |     result = await app(  # type: ignore[func-returns-value]
neptuno-stack      |   File "/usr/local/lib/python3.10/site-packages/uvicorn/middleware/proxy_headers.py", line 60, in __call__
neptuno-stack      |     return await self.app(scope, receive, send)
neptuno-stack      |   File "/usr/local/lib/python3.10/site-packages/fastapi/applications.py", line 1054, in __call__
neptuno-stack      |     await super().__call__(scope, receive, send)
neptuno-stack      |   File "/usr/local/lib/python3.10/site-packages/starlette/applications.py", line 112, in __call__
neptuno-stack      |     await self.middleware_stack(scope, receive, send)
neptuno-stack      |   File "/usr/local/lib/python3.10/site-packages/starlette/middleware/errors.py", line 187, in __call__
neptuno-stack      |     raise exc
neptuno-stack      |   File "/usr/local/lib/python3.10/site-packages/starlette/middleware/errors.py", line 165, in __call__
neptuno-stack      |     await self.app(scope, receive, _send)
neptuno-stack      |   File "/usr/local/lib/python3.10/site-packages/starlette/middleware/cors.py", line 93, in __call__
neptuno-stack      |     await self.simple_response(scope, receive, send, request_headers=headers)
neptuno-stack      |   File "/usr/local/lib/python3.10/site-packages/starlette/middleware/cors.py", line 144, in simple_response
neptuno-stack      |     await self.app(scope, receive, send)
neptuno-stack      |   File "/usr/local/lib/python3.10/site-packages/starlette/middleware/cors.py", line 93, in __call__
neptuno-stack      |     await self.simple_response(scope, receive, send, request_headers=headers)
neptuno-stack      |   File "/usr/local/lib/python3.10/site-packages/starlette/middleware/cors.py", line 144, in simple_response
neptuno-stack      |     await self.app(scope, receive, send)
neptuno-stack      |   File "/usr/local/lib/python3.10/site-packages/starlette/middleware/exceptions.py", line 62, in __call__
neptuno-stack      |     await wrap_app_handling_exceptions(self.app, conn)(scope, receive, send)
neptuno-stack      |   File "/usr/local/lib/python3.10/site-packages/starlette/_exception_handler.py", line 53, in wrapped_app
neptuno-stack      |     raise exc
neptuno-stack      |   File "/usr/local/lib/python3.10/site-packages/starlette/_exception_handler.py", line 42, in wrapped_app
neptuno-stack      |     await app(scope, receive, sender)
neptuno-stack      |   File "/usr/local/lib/python3.10/site-packages/starlette/routing.py", line 714, in __call__
neptuno-stack      |     await self.middleware_stack(scope, receive, send)
neptuno-stack      |   File "/usr/local/lib/python3.10/site-packages/starlette/routing.py", line 734, in app
neptuno-stack      |     await route.handle(scope, receive, send)
neptuno-stack      |   File "/usr/local/lib/python3.10/site-packages/starlette/routing.py", line 288, in handle
neptuno-stack      |     await self.app(scope, receive, send)
neptuno-stack      |   File "/usr/local/lib/python3.10/site-packages/starlette/routing.py", line 76, in app
neptuno-stack      |     await wrap_app_handling_exceptions(app, request)(scope, receive, send)
neptuno-stack      |   File "/usr/local/lib/python3.10/site-packages/starlette/_exception_handler.py", line 53, in wrapped_app
neptuno-stack      |     raise exc
neptuno-stack      |   File "/usr/local/lib/python3.10/site-packages/starlette/_exception_handler.py", line 42, in wrapped_app
neptuno-stack      |     await app(scope, receive, sender)
neptuno-stack      |   File "/usr/local/lib/python3.10/site-packages/starlette/routing.py", line 73, in app
neptuno-stack      |     response = await f(request)
neptuno-stack      |   File "/usr/local/lib/python3.10/site-packages/fastapi/routing.py", line 301, in app
neptuno-stack      |     raw_response = await run_endpoint_function(
neptuno-stack      |   File "/usr/local/lib/python3.10/site-packages/fastapi/routing.py", line 212, in run_endpoint_function
neptuno-stack      |     return await dependant.call(**values)
neptuno-stack      |   File "/app/api/v1/gamification.py", line 35, in create_event
neptuno-stack      |     return register_event(db, event, user)
neptuno-stack      |   File "/app/services/gamification_service.py", line 38, in register_event
neptuno-stack      |     update_user_gamification(db, user, event.event_type_id)
neptuno-stack      |   File "/app/services/gamification_service.py", line 99, in update_user_gamification
neptuno-stack      |     raise ValueError("Event type not found")
