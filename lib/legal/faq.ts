import type { LandingSettings } from "@/lib/sanity/types";
import { resolveLegalText, type LegalFields } from "./privacy";

export const DEFAULT_FAQ = `## ¿Quién puede asociarse a ATDA?
Cualquier persona interesada en el desarrollo tecnológico argentino: profesionales, estudiantes, docentes, emprendedores y organizaciones. La condición de socio o socia se rige por el estatuto de la asociación.

## ¿Cómo me asocio?
Completá la solicitud en la página "Asociate". El equipo de ATDA la revisa y, si se aprueba, te llega un email de bienvenida.

## ¿Cuánto tarda la aprobación?
Depende del volumen de solicitudes. Si pasó más de una semana y no recibiste novedades, escribinos desde el formulario de contacto.

## Ya me aprobaron, ¿cómo entro al espacio de socios?
En el email de bienvenida tenés el botón "Activar mi acceso". Ahí confirmás tu DNI (el mismo que cargaste en la solicitud) y elegís una contraseña. Después entrás desde "Acceso socios", arriba a la derecha.

## No me llegó el email de activación
Revisá la carpeta de spam o promociones. Si no está, podés activarlo igual: entrá a "Acceso socios", elegí "Activar acceso" y usá el email y el DNI de tu solicitud. También podés pedirnos que te lo reenviemos.

## Me olvidé la contraseña
En "Acceso socios" elegí "Recuperar". Verificamos tu identidad con el email y el DNI y definís una contraseña nueva.

## ¿Qué beneficios tengo como socio o socia?
Precio diferencial en los cursos y actividades pagas, acceso al espacio de socios y la posibilidad de sumarte a las propuestas y proyectos de la asociación.

## ¿Cómo se aplica el precio para socios?
Al inscribirte a una propuesta paga, usá el mismo email y DNI con los que te asociaste. Si coinciden con un socio o socia activa, el sistema aplica el precio diferencial.

## ¿Puedo actualizar mis datos?
Sí. Desde el espacio de socios podés actualizar tus datos de contacto, como el teléfono.

## ¿Cómo me doy de baja?
Escribinos{emailTexto} y te damos de baja. Tus datos personales se tratan según la política de privacidad.`;

export function resolveFaq(settings: LegalFields & Pick<LandingSettings, "faqText">) {
  return resolveLegalText(settings.faqText.trim() || DEFAULT_FAQ, settings);
}
