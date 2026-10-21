# Cuentas y sincronización de Kana

## Qué incluye

El acceso disponible por defecto utiliza Google y permite continuar como invitado, sin SMTP. `EXPO_PUBLIC_ENABLE_GOOGLE_AUTH=false` permite ocultar Google. Apple y correo están implementados, pero ocultos y bloqueados salvo que `EXPO_PUBLIC_ENABLE_APPLE_AUTH` o `EXPO_PUBLIC_ENABLE_EMAIL_AUTH`, respectivamente, sean `true`. Los servicios y la vinculación respetan los mismos flags. SQLite en iOS/Android e IndexedDB en web guardan un documento transaccional por cuenta: preferencias, selección, eventos, estado FSRS y pendientes. La app conserva los registros anteriores de AsyncStorage al migrarlos y pide autorización antes de importar progreso de invitado.

El cliente no puede escribir eventos ni progreso canónico directamente. La función `sync-learning` verifica el JWT con Auth, valida el catálogo y los datos, combina eventos por fecha/ID y ejecuta FSRS 5.4.2 (retención 90 %, fuzz desactivado). La RPC de servicio confirma todo bajo bloqueo por cuenta y revisión optimista. Las operaciones de preferencias tienen identificadores persistentes: reintentar una escritura antigua no pisa una posterior. Las selecciones incluyen valores `false` para propagar deselecciones.

El almacenamiento mantiene un historial completo por usuario. Esta primera versión descarga el historial completo en cada reconciliación y envía lotes de hasta 100 eventos/operaciones; no es una implementación de sincronización incremental para historiales ilimitados. Antes de escalar a historiales grandes, medir tamaño/latencia y añadir paginación por cursor y checkpoints del algoritmo sin borrar eventos pendientes.

## Desarrollo local

Requisitos: pnpm 11.8.0 y Docker. No usar credenciales remotas en pruebas.

```sh
pnpm install --frozen-lockfile
pnpm exec supabase start
pnpm exec supabase functions serve sync-learning
```

Copiar de `supabase status` la URL y la clave publicable a `.env.local`, conservando los nombres de `.env.example`. Para web usar `http://localhost:8081`; un dispositivo físico necesita la IP LAN del equipo para la API local, no `127.0.0.1`. Una build de desarrollo debe incluir los módulos y la capacidad de Apple de `app.json`; no editar `ios/` ni `android/` manualmente.

El correo local se captura en Mailpit. La plantilla incluida envía `{{ .Token }}`; la pantalla espera un código, no un enlace mágico. Los límites y la caducidad efectivos son los configurados en Supabase Auth. El botón limita reenvíos durante 60 segundos y muestra los errores de límite/código expirado sin borrar la entrada.

```sh
pnpm exec supabase test db
pnpm exec supabase db advisors --local --fail-on error
node scripts/test-supabase.mjs
pnpm test --runInBand
pnpm check
pnpm dlx expo-doctor
pnpm build:web
```

El script de integración verifica que la API sea local, crea usuarios de prueba, comprueba OTP, concurrencia, idempotencia, conflictos y RLS, y elimina esos usuarios al terminar. Requiere la Edge Function servida. Nunca apunta al proyecto de `.env.local`.

Para regenerar tipos tras cambiar el esquema:

```sh
pnpm exec supabase gen types typescript --local --schema public > /tmp/kana-database-types.ts
```

Comprobar que la salida solo contiene TypeScript antes de reemplazar `src/lib/database-types.ts`; algunas versiones de pnpm imprimen mensajes de instalación a stdout. Formatear el archivo con Prettier. El catálogo de la migración se genera desde `src/data/kana.ts`; nuevas tarjetas requieren una migración adicional de catálogo antes de publicar el cliente.

## Configuración remota antes de publicar

1. Revisar el esquema existente del proyecto de destino y respaldarlo. Las migraciones entregadas crean tablas nuevas; no aplicar sobre tablas homónimas sin reconciliarlas. Mantener entornos de pruebas y producción separados.
2. Aplicar la migración y desplegar `sync-learning`. `verify_jwt = false` desactiva únicamente la validación antigua del gateway: la función exige un Bearer token y lo valida contra Auth antes de acceder a la base. No quitar esa comprobación. La clave de servicio solo se usa dentro de la función.
3. Configurar las variables públicas URL/clave en cada build. `EXPO_PUBLIC_AUTH_ORIGIN` es opcional: si se define en web debe coincidir con el origen que sirve la app. La clave publicable no reemplaza RLS.
4. Registrar en Auth la URL del sitio y los retornos exactos `kana-app://auth/callback` y `https://DOMINIO/auth/callback`. Añadir dominios de pruebas explícitos; no usar comodines generales de producción. La ruta web debe servir el export de Expo Router.
5. Para Google: habilitar Google en Supabase. Crear el cliente OAuth web en Google Cloud y registrar el callback HTTPS que muestra Supabase. Configurar pantalla de consentimiento, orígenes y usuarios de prueba. El secreto de cliente permanece en Supabase. El flujo móvil usa navegador del sistema y PKCE; no necesita un SDK nativo de Google.
6. Solo al activar Apple: habilitar Sign in with Apple para el identificador iOS de `app.json`. En Supabase permitir el Bundle ID nativo y el Services ID del flujo web; configurar Team ID, Key ID, clave privada, dominios y callback siguiendo el panel de Apple. Registrar la fecha de caducidad del secreto OAuth y renovarlo antes de vencer; Apple limita su vigencia a seis meses. La ruta nativa verifica nonce y state y conserva el nombre del primer consentimiento.
7. Solo al activar más de un proveedor: habilitar vinculación manual de identidades en Auth. Un proveedor ya asociado a otra cuenta devuelve un conflicto; la app no fusiona cuentas por correo ni mueve historiales. Apple puede utilizar un correo privado diferente.
8. Solo al activar correo: configurar SMTP y la plantilla de código con `{{ .Token }}` tanto en Magic link or OTP como en Confirm sign up en producción. Verificar remitente y entrega real, caducidad, límites y reenvío. El SMTP de desarrollo no constituye una configuración de producción.

Documentación: [Apple](https://supabase.com/docs/guides/auth/social-login/auth-apple), [Google](https://supabase.com/docs/guides/auth/social-login/auth-google), [OTP](https://supabase.com/docs/guides/auth/auth-email-passwordless), [vinculación](https://supabase.com/docs/guides/auth/auth-identity-linking).

## Validación de lanzamiento

Para cada plataforma y proveedor habilitados, probar antes de su lanzamiento:

- Google en web y, antes de publicar builds nativas, iOS/Android; cancelación, regreso con la app cerrada, callback duplicado y fallo de red.
- Antes de habilitar Apple: correo privado, nombre disponible solo en el primer acceso y vinculación de proveedores.
- Antes de habilitar correo: OTP con entrega real, código incorrecto/expirado y límites de envío.
- Importación aceptada/rechazada; dos dispositivos sin conexión; cierre y reapertura antes de sincronizar; cambio de cuenta con pendientes.
- SQLite en dispositivo: cierre de la app tras guardar un repaso y restauración de su evento pendiente.

Las dos migraciones y `sync-learning` ya están desplegadas en el proyecto remoto `quick-kana` (`uwxzwlskjihibbuuicnw`). El lanzamiento web utiliza Google; Apple y correo quedan fuera de este lanzamiento. Las pruebas de OAuth nativo siguen pendientes y no se publican builds móviles en esta entrega.

## Operación y recuperación

El perfil muestra guardado local, sincronizando, sincronizado o requiere atención. Una sesión expirada conserva la identidad local y los pendientes: esa identidad no concede permisos en el servidor. Cerrar sesión explícitamente oculta la cuenta y mantiene su cola separada. Los datos corruptos no se sustituyen por valores vacíos; recuperar desde el respaldo local o la cuenta antes de descartar datos.

Los fallos de sincronización se registran sin tokens, códigos, payloads ni datos personales. Observar tasas HTTP 401/409/500 y latencia de `sync-learning`; revisar los logs de Auth para errores de proveedor/SMTP. Ante fallos, conservar las colas locales y corregir la configuración antes de reintentar. No revertir una migración borrando tablas con progreso de usuarios.

## Verificación realizada en esta entrega

- 101 pruebas automatizadas en 17 suites: almacenamiento transaccional web, migración, importación, aislamiento local, callbacks, nonce/state de Apple, formularios, sesión sin conexión y reintentos.
- Supabase local con ambas migraciones aplicadas; 16 comprobaciones pgTAP y asesor de base de datos sin incidencias. Integración HTTP con dos usuarios: OTP, RLS, concurrencia, conflictos, reintentos sin duplicados y reinicios de cuenta sin resurrección de eventos antiguos.
- `pnpm check` aprobado; React Doctor conserva advertencias de complejidad, contextos y búsquedas en arrays. Expo Doctor: 20/20 comprobaciones.
- Exportación web y bundles JavaScript de iOS/Android generados; Edge Function comprobada con Deno. Generar bundles no equivale a probar SQLite ni OAuth en un dispositivo.
- Prueba visual del export web con Supabase local: envío de código a Mailpit, verificación, perfil sincronizado, restauración al recargar y cierre de sesión.

Los tres cambios OpenSpec permanecen activos con sus tareas de implementación marcadas y sus pruebas de lanzamiento pendientes. Archivarlos cuando se complete la verificación externa correspondiente. La sincronización utiliza el historial completo; el límite de escalabilidad descrito arriba sigue vigente.

En desarrollo con SDK 58, los módulos de entorno del cliente pueden dar prioridad a `.env.local` aunque existan variables en el proceso. Confirmar el backend efectivo antes de probar autenticación. La comprobación visual de esta entrega utilizó un export de producción con valores explícitos del Supabase local, preservando el archivo de entorno existente del proyecto.

## Cambios integrados desde origin

Se integraron `1ae0559` (práctica continua adaptativa) y `33a8049` (borrado confirmado de progreso). La práctica conserva todas sus reglas: terminar explícitamente, elegir kana según el estado FSRS y fallos recientes, no inflar intervalos con aciertos anticipados y guardar los fallos aunque el kana no esté vencido.

El borrado utiliza el repositorio activo. En modo invitado es una transacción local y conserva los ajustes. En una cuenta, la confirmación explica que se borran los repasos de Supabase y de todos los dispositivos al sincronizar. La solicitud tiene identidad persistente: puede reanudarse después de un fallo sin borrar progreso creado tras el primer intento exitoso. Se conserva la selección, las preferencias y los documentos de otras cuentas.

La migración `learning_reset` añade una generación por cuenta. Cada lote de sincronización debe llevarla; el servidor rechaza generaciones antiguas, y los clientes descartan los repasos pendientes anteriores al reinicio. Los dispositivos desconectados no se actualizan inmediatamente: lo hacen al volver a sincronizar. Durante un reinicio pendiente se bloquea el estudio de esa cuenta para evitar resultados ambiguos. Una aplicación antigua que no envíe generación debe actualizarse antes de sincronizar.

Para habilitar Apple o correo más adelante, completar primero su configuración y validación; después activar su flag individual en una nueva build. Los flags no configuran los proveedores en el panel de Supabase.

## Rutas web en Vercel

El export estático genera un HTML por ruta. `vercel.json` activa `cleanUrls` para servir, por ejemplo, `profile.html` como `/profile`, incluso al refrescar, y `auth/callback.html` como `/auth/callback`. El cambio requiere un nuevo despliegue. Tras publicarlo, comprobar apertura directa y recarga de `/practice`, `/profile`, `/settings` y `/auth/callback`; comprobar también que una URL desconocida sigue devolviendo 404. Desplegado y verificado en producción: las rutas conocidas devuelven 200 y una ruta desconocida devuelve 404.

## Despliegue remoto del 21 de octubre de 2026

Se verificó que el proyecto coincide con la URL pública configurada en la app y que `public` no contenía tablas antes de aplicar los cambios. Se aplicaron `20261021214340_learning_accounts` y `20261021222534_learning_reset`; el historial remoto coincide con el local. Se desplegó `sync-learning` mediante la CLI. Su configuración Deno se mantiene en `supabase/functions/sync-learning/deno.json`, donde el empaquetador remoto detecta las dependencias fijadas.

Comprobaciones remotas: RLS habilitada en las nueve tablas; escrituras directas de tablas denegadas a `anon` y `authenticated` (el perfil conserva la actualización autorizada de columnas); las cinco RPC de aprendizaje solo son ejecutables por `service_role`. El endpoint responde 200 al preflight y 401 a peticiones sin sesión o con token inválido. El acceso real con Google, el retorno PKCE y el perfil sincronizado se verificaron en producción; no se añadieron repasos ficticios a la cuenta del propietario.

El asesor remoto no encontró errores, pero señaló dos advertencias de permisos en la función preexistente `public.rls_auto_enable()`, que devuelve `event_trigger`. Esa función ya existía antes de las migraciones y no fue modificada.

Se guardó Site URL `https://kana-app-eight.vercel.app` y los retornos exactos `https://kana-app-eight.vercel.app/auth/callback`, `kana-app://auth/callback` y `http://localhost:8081/auth/callback`. Google está habilitado. Email, Apple, vinculación manual y usuarios anónimos están desactivados; se conserva la confirmación de correo para una futura activación. La longitud OTP remota es de ocho dígitos y su caducidad de 3600 segundos; la pantalla admite hasta diez dígitos.

El usuario descartó continuar con Brevo y solicitó una opción sin SMTP. El alta de Brevo se detuvo antes de completar la dirección y elegir un plan. SMTP sigue sin configurar; se eligió Google para acceso sin correo transaccional. Este proyecto gratuito de Supabase bloquea la edición de plantillas mientras use su remitente predeterminado. No se configurará una plantilla de código hasta disponer de SMTP; no dar por operativo el acceso por código en producción antes de probarlo.

## Google y organización de proyectos

Se creó Google Cloud `quick-kana` (756408788884), conservando `interview-agent-510421`. Los proyectos `steven-testing-ae4a2`, `gen-lang-client-0471921037` y `gen-lang-client-0640859409` quedaron cerrados y programados para eliminación después del 20 de noviembre de 2026. El Supabase antiguo `hxkqgnyopnhxwwbbhpql` fue eliminado con confirmación explícita. El Supabase activo `uwxzwlskjihibbuuicnw` ahora se llama `quick-kana`; su URL y datos no cambiaron.

El cliente web `quick-kana Supabase` usa los orígenes `https://kana-app-eight.vercel.app` y `http://localhost:8081`. Su único retorno de Google es `https://uwxzwlskjihibbuuicnw.supabase.co/auth/v1/callback`. El secreto está guardado únicamente en Supabase. Los únicos scopes declarados son `openid`, `userinfo.email` y `userinfo.profile`. No se configuraron permisos de Gmail, Drive ni Cloud.

Las páginas públicas `/privacy` y `/terms` explican el servicio en español e inglés y se enlazan desde inicio y acceso. Se exportan con contenido HTML sin depender de la sesión ni del almacenamiento local. Google tiene registradas ambas URLs y la página principal, con el estado de publicación «En producción». El correo de soporte y solicitudes de cuenta es el contacto configurado por el propietario en Google Cloud.

Para rotar la credencial de Google: generar el nuevo secreto en el cliente de Google Cloud, actualizar Google en Supabase, verificar un acceso completo y después revocar la credencial anterior. Nunca colocar el secreto en variables `EXPO_PUBLIC_*`, Vercel ni Git.

## Verificación web de producción

Commit de aplicación `0ff5e03`, desplegado por Vercel en `https://kana-app-eight.vercel.app`. Acceso Google completado con la cuenta del propietario; callback PKCE vuelve a `/profile` y muestra «Sincronizado». La recarga de Perfil conserva la sesión. HTTP 200 para inicio, práctica, perfil, ajustes, callback, privacidad y condiciones; HTTP 404 para una ruta desconocida. El HTML de privacidad y condiciones contiene los textos completos antes de ejecutar JavaScript.

Comprobaciones finales: 101 pruebas en 17 suites; `pnpm check`; Expo Doctor 20/20; export web de 17 rutas; OpenSpec estricto. Las verificaciones de dispositivos nativos y la matriz manual de dos dispositivos permanecen pendientes, explícitas en los tres cambios de implementación. Se publica la web; no se han enviado builds a App Store ni Google Play.
