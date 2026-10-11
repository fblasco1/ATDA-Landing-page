# ATDA — Landing

Sitio de la Asociación Civil Tecnológica por el Desarrollo Argentino. Next.js App Router con contenido en Sanity, panel `/admin`, socios en **Neon Postgres** (Drizzle) y checkout de cursos con **MODO** (botón / QR, procesado por Decidir Plus / Payway).

## Desarrollo local

1. Copiá `.env.example` a `.env.local` y completá las claves.
2. `npm install`
3. (Opcional socios) Creá un proyecto en [Neon](https://neon.tech), pegá `DATABASE_URL` en `.env.local` y corré `npm run db:migrate` (o `npm run db:push` en local).
4. `npm run dev` (http://localhost:3000)

Sin `DATABASE_URL` la landing y el CMS siguen funcionando; `/afiliacion` y `/admin/socios` muestran aviso de DB pendiente.

El Studio de Sanity es una app aparte, en la carpeta hermana `../studio-pagina-web` (proyecto `t61vrots`, dataset `production`). No está embebido en Next.js.

```powershell
cd ..\studio-pagina-web
npm run dev
```

Abre [http://localhost:3333](http://localhost:3333). Desde ahí cargás landing, áreas, actividad, red, cursos e inscripciones.

Sin contenido en Sanity la landing usa textos de respaldo. Áreas, actividad, red y cursos solo se muestran cuando hay documentos publicados.

## Socios y afiliación

- Público: `/afiliacion` — solicitud de afiliación.
- Portal socio: `/socio/login` → activar con email+DNI → ver perfil y cuotas.
- Admin: `/admin/socios` — solicitudes, listado de socios, detalle, marcar cuotas.
- Tablas: `membership_requests`, `members`, `membership_fees`, `course_enrollments` (espejo de Sanity).
- Scripts: `npm run db:generate` · `db:migrate` · `db:push` · `db:studio`

## Flujo de Git

Ver [CONTRIBUTING.md](CONTRIBUTING.md). Resumen: ramas `feat/*` y `fix/*` desde `develop`, PR a `develop`, release con PR `develop` → `main`.

## Panel de administración

`/admin` — ingreso con Google (mails listados en `ADMIN_EMAILS`) o con email y contraseña (tabla `admin_users`, requiere `DATABASE_URL`).

Alta de un admin con contraseña: `node scripts/create-admin.mjs <email> ["Nombre"]`. Imprime una contraseña temporal; el admin debe cambiarla en el primer ingreso (`/admin/cambiar-clave`). Volver a correr el script resetea la contraseña.

El aula virtual de cada inscripción se asigna a mano; el panel solo marca el acceso como concedido.

## Pagos MODO

1. Alta Payway → Payway Ventas Online (Decidir Plus).
2. Formulario MODO empresa con Site ID + API keys → recibís `MODO_USERNAME`, `MODO_PASSWORD`, `MODO_STORE_ID` y códigos (`MODO_PROCESSOR_CODE`, `MODO_CC_CODE`).
3. Checkout: `POST /api/checkout/modo` crea la inscripción y el payment request; el usuario ve QR / deeplink en `/checkout/modo/[id]`.
4. Webhook: `POST /api/webhooks/modo` (exponé la URL pública con ngrok en local).

Bloqueado hasta tener credenciales (issue #1). El checkout está detrás de `MODO_CHECKOUT_ENABLED=true`; sin esa variable las rutas de checkout responden 404/503 y los cursos muestran "Inscripciones online próximamente".

## Webhooks

- Sanity: `POST /api/webhooks/sanity` (revalida la landing).
- MODO: `POST /api/webhooks/modo`
