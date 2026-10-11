import Link from "next/link";

export function PrivacyConsent({
  checked,
  onChange,
  disabled,
  error,
}: {
  checked?: boolean;
  onChange?: (checked: boolean) => void;
  disabled?: boolean;
  error?: string;
}) {
  return (
    <div>
      <label htmlFor="privacyAccepted" className="flex items-start gap-3 text-sm text-gray-300">
        <input
          id="privacyAccepted"
          name="privacyAccepted"
          type="checkbox"
          required
          disabled={disabled}
          checked={checked}
          onChange={onChange ? (event) => onChange(event.target.checked) : undefined}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? "privacyAccepted-error" : undefined}
          className="mt-0.5 h-5 w-5 shrink-0 rounded border-gray-500 bg-gray-900 accent-blue-600"
        />
        <span>
          Leí y acepto la{" "}
          <Link
            href="/privacidad"
            target="_blank"
            className="font-medium text-teal-300 underline underline-offset-2 hover:text-teal-200"
          >
            política de privacidad
            <span className="sr-only"> (se abre en una pestaña nueva)</span>
          </Link>
          . Autorizo a ATDA a usar estos datos para responder y gestionar mi pedido.
        </span>
      </label>
      {error ? (
        <p id="privacyAccepted-error" className="mt-1 text-sm text-red-400">
          {error}
        </p>
      ) : null}
    </div>
  );
}
