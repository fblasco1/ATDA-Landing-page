import type { LandingSettings } from "@/lib/sanity/types";
import { resolveLegalText, type LegalFields } from "./privacy";

export const CONSUMER_PROTECTION_URL = "https://www.argentina.gob.ar/produccion/defensadelconsumidor/formulario";

export const DEFAULT_TERMS = `## Quiénes somos
Este sitio pertenece a {razonSocial} ("ATDA"){cuitTexto}{domicilioTexto}. Al usarlo aceptás estos términos y condiciones.

## Uso del sitio
- El contenido del sitio (textos, imágenes, logos y materiales) pertenece a ATDA o a sus autores y no puede reproducirse con fines comerciales sin autorización.
- Te pedimos que uses los formularios con datos verdaderos y propios.
- ATDA puede actualizar o corregir el contenido del sitio en cualquier momento.

## Espacio de socios
- El acceso es personal. Cuidá tu contraseña y avisanos si creés que alguien más la conoce.
- La condición de socio o socia, la cuota y la baja se rigen por el estatuto de la asociación.

## Inscripción a cursos y actividades
- Cada propuesta indica su precio, modalidad y fechas. Las actividades no aranceladas no tienen costo.
- En las propuestas pagas, el precio para socios se aplica cuando el email y el DNI coinciden con los de un socio o socia activa.
- La inscripción queda confirmada cuando se acredita el pago. El acceso al aula virtual o al material lo asigna ATDA después de la acreditación.
- Si ATDA cancela o reprograma una propuesta, podés elegir la nueva fecha o pedir la devolución total de lo pagado.

## Derecho de arrepentimiento
Podés revocar la contratación de un curso o actividad paga dentro de los 10 días corridos desde la inscripción o desde que se acreditó el pago, lo que ocurra último, sin costo ni necesidad de dar motivos (artículo 34 de la Ley 24.240 y artículo 1110 del Código Civil y Comercial). Para hacerlo usá el "Botón de arrepentimiento" que está al pie de cada página. Te vamos a dar un código de seguimiento y te devolvemos el importe por el mismo medio de pago.

## Defensa del consumidor
Si tenés un reclamo podés contactarnos{emailTexto}. También podés iniciar un reclamo ante la autoridad de aplicación en ${CONSUMER_PROTECTION_URL}.

## Cambios en estos términos
Si cambiamos estos términos, publicaremos la nueva versión en esta página. Las inscripciones ya realizadas se rigen por los términos vigentes al momento de inscribirte.`;

export function resolveTerms(settings: LegalFields & Pick<LandingSettings, "termsText">) {
  return resolveLegalText(settings.termsText.trim() || DEFAULT_TERMS, settings);
}
