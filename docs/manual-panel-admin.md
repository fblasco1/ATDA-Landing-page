# Manual del panel de administración — ATDA

Panel: **https://www.atda.org.ar/admin**

Este manual explica cómo ingresar por primera vez y cómo operar cada sección del panel. Los cambios que guardes se publican en el sitio de inmediato: no hay botón de "publicar" aparte.

---

## 1. Primer ingreso (obligatorio)

Recibiste un email de usuario y una **contraseña temporal**. La primera vez tenés que reemplazarla por una propia; hasta hacerlo no vas a poder usar el panel.

1. Entrá a **https://www.atda.org.ar/admin/login**.
2. Completá **Email** y **Contraseña** con los datos que te enviaron y tocá **Ingresar**.
3. El sistema te lleva a la pantalla **Cambiar contraseña**. Completá:
   - **Contraseña actual**: la temporal que recibiste.
   - **Contraseña nueva**: mínimo **10 caracteres** y distinta de la temporal.
   - **Repetir contraseña nueva**.
4. Tocá **Guardar contraseña**. Vas a entrar al **Resumen** del panel.

Recomendaciones:

- Usá una contraseña que no uses en otros sitios. Un gestor de contraseñas (el del navegador, Bitwarden, 1Password) ayuda.
- Una vez cambiada, borrá el mensaje donde te llegó la contraseña temporal.
- Si te equivocás de contraseña actual, el sistema lo avisa y no cambia nada.
- Si querés salir sin cambiarla, usá **Salir**; la próxima vez que entres se te va a pedir de nuevo.

### Cambiar la contraseña más adelante

En el menú lateral, abajo: **Cambiar contraseña**. Mismo formulario y mismas reglas.

### Olvidé mi contraseña

Pedile a quien administra el sistema que te genere una nueva contraseña temporal. Vas a tener que cambiarla otra vez en el siguiente ingreso.

### Ingreso con Google

Si tu email está habilitado para Google, podés usar **Continuar con Google** en la pantalla de login en lugar de la contraseña.

---

## 2. Cómo está organizado el panel

Menú lateral (en celular aparece arriba):

| Sección | Para qué sirve |
|---|---|
| **Resumen** | Números generales del sitio. |
| **Landing** | Textos fijos de la página principal (portada, quiénes somos, sumate, contacto, redes). |
| **Áreas** | Áreas de enfoque de la asociación. |
| **Actividad** | Noticias y columnas. |
| **Red** | Organizaciones aliadas (logos). |
| **Cursos** | Oferta de cursos. |
| **Inscripciones** | Inscripciones pagas a cursos. |
| **Socios** | Solicitudes de afiliación, socios y cuotas. |

Abajo del menú: **Ver sitio** (abre la web pública), **Cambiar contraseña** y **Salir**.

Regla general del sitio: **las secciones de Áreas, Actividad, Red y Cursos solo aparecen en la web si tienen al menos un elemento cargado**. Si borrás todos, la sección desaparece de la página y del menú.

---

## 3. Resumen

Muestra cuántas áreas, noticias y cursos activos hay publicados, y cuántas **aulas por asignar** quedan (inscripciones pagas a las que todavía no se les dio acceso al aula virtual).

---

## 4. Landing (contenido de la página principal)

Un único formulario dividido en bloques. Modificá lo que necesites y tocá **Guardar contenido** al final. Aparece "Guardado" cuando terminó.

- **Hero**: título, subtítulo y URL de la imagen de portada.
- **Quiénes somos**: título, texto y los 4 valores (cada uno con ícono, título y descripción).
- **Sumate**: título, subtítulo, beneficios (**uno por línea**), los tres perfiles de "quién puede sumarse", texto y botón de llamada a la acción.
- **Contacto y footer**: títulos de contacto, endpoint de Formspree (no tocar salvo indicación técnica), texto del pie, redes sociales (X, Instagram, LinkedIn), email de contacto y enlace al estatuto.

Si dejás un campo de red social vacío, ese ícono no se muestra.

---

## 5. Áreas, Actividad, Red y Cursos

Las cuatro secciones funcionan igual:

- **Crear**: completá el recuadro **Nuevo** arriba y tocá **Crear**.
- **Editar**: en el listado, tocá **Editar** en el elemento, modificá y tocá **Guardar cambios**.
- **Borrar**: tocá **Borrar** y confirmá. **No se puede deshacer.**

**Imágenes**: en los campos de imagen podés arrastrar un archivo o hacer clic para elegirlo (PNG, JPG o WebP). Esperá a que termine "Subiendo..." y aparezca la vista previa antes de guardar. **Quitar imagen** la saca.

**Categorías** (Actividad y Cursos): elegí una existente del desplegable o usá **+ Crear nueva categoría…** y escribí el nombre. Escribí siempre igual la misma categoría (mayúsculas y acentos incluidos) para no duplicarla. Las categorías sirven para filtrar en la web.

### Áreas

Título, ícono (elegilo de la lista) y descripción.

### Actividad (noticias y columnas)

- **Título**, **Categoría**, **Portada** (imagen).
- **Copete**: resumen corto que se ve en las tarjetas.
- **Cuerpo de la nota**: texto completo.
- **Publicado**: si lo destildás, la nota queda guardada pero no se ve en la web (útil para borradores).

En la página principal se ven las **3 más recientes**; el resto aparece en "Ver todas".

La dirección web de la nota se genera a partir del título. Si cambiás el título de una nota ya publicada, cambia su enlace y los enlaces viejos compartidos dejan de funcionar.

### Red

Nombre de la organización, sitio web (se puede escribir sin `https://`) y logo.

### Cursos

- **Título**, **Categoría**, **Precio ARS**, **Cupo** (opcional), **Imagen**, **Descripción**.
- **Activo**: destildalo para ocultar el curso sin borrarlo.

Un curso aparece en la web **solo si está activo y tiene precio**. Igual que en las notas, la dirección del curso sale del título.

> Por ahora la **inscripción y pago online están deshabilitados**. En la página de cada curso se muestra "Inscripciones online próximamente" con un enlace al formulario de contacto. Los interesados van a escribir por ese medio.

---

## 6. Inscripciones

Lista las inscripciones a cursos con su estado de pago. Se puede filtrar por **curso**, por **estado de pago** y buscar por **nombre, apellido o DNI**.

Cuando una inscripción está **Pagada**, el acceso al aula virtual **se crea a mano** fuera del panel. Una vez creado:

1. Tocá **Marcar aula asignada**.
2. Escribí en la nota el usuario o enlace que le diste (queda como registro).

La columna **Aula** pasa a "Asignada".

> Mientras el pago online esté deshabilitado esta sección va a estar vacía.

---

## 7. Socios

Tiene dos pestañas: **Solicitudes** y **Socios**.

### Solicitudes de afiliación

Llegan desde el formulario público **/afiliacion**. Se pueden filtrar por estado: Recibida, En revisión, Aprobada, Rechazada.

Para cada solicitud:

- **Pasar a revisión**: marca que alguien la está evaluando.
- **Aprobar**: pide notas opcionales. Crea el socio automáticamente (estado *Activo*) y le genera la primera cuota con monto "a definir".
- **Rechazar**: pide un motivo opcional, que queda guardado en la solicitud.

Las solicitudes aprobadas o rechazadas ya no muestran botones.

### Listado de socios

Buscá por nombre, email o DNI y filtrá por estado (Activo, Suspendido, Inactivo). Cada fila muestra la última cuota y estas acciones:

- **Marcar cuota paga**: marca como pagada la última cuota.
- **Suspender** / **Reactivar**.
- **Ver detalle**: abre la ficha completa.

### Ficha del socio

- **Membresía**: cambiá el estado entre Activo, Suspendido e Inactivo. Abajo se ve si el socio ya activó su acceso al portal.
- **Nueva cuota**: indicá el período (formato `AAAA-MM`, por ejemplo `2026-11`) y el monto en pesos y tocá **Crear cuota**.
- **Historial de cuotas**: en cada cuota podés marcar **Pagar**, **Eximir** (no la debe) o **Vencida**.

### Portal del socio

Los socios tienen su propio acceso en **https://www.atda.org.ar/socio**, separado del panel. Para usarlo:

1. Su solicitud tiene que estar **aprobada** y el socio **activo**.
2. El socio entra a **/socio/activar**, ingresa su email y DNI (los mismos de la solicitud) y elige una contraseña.
3. Si la olvida, usa **/socio/recuperar** con los mismos datos.

Si un socio está suspendido o inactivo no puede activar ni recuperar el acceso. Si te dice que "no encontramos un socio activo con esos datos", revisá en su ficha que el email y el DNI coincidan y que esté activo.

---

## 8. Buenas prácticas

- **Salí** del panel al terminar, sobre todo en computadoras compartidas.
- Antes de **Borrar**, considerá destildar **Publicado** / **Activo**: oculta el contenido sin perderlo.
- Revisá el resultado con **Ver sitio** después de cada cambio importante.
- No compartas tu usuario: cada administrador tiene el suyo.
- Ante un error que no se resuelve recargando la página, avisá al equipo técnico con una captura y la hora aproximada.
