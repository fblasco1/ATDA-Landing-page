function CalendarIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="3" y="5" width="18" height="16" rx="2" stroke="currentColor" strokeWidth="1.8" />
      <path d="M3 10h18" stroke="currentColor" strokeWidth="1.8" />
      <path d="M8 3v4M16 3v4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function PinIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M12 21s7-6.2 7-11a7 7 0 1 0-14 0c0 4.8 7 11 7 11Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="10" r="2.2" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  );
}

export function CourseLogistics({
  when,
  where,
  className,
}: {
  when?: string;
  where?: string;
  className?: string;
}) {
  if (!when && !where) return null;

  return (
    <div className={className ?? "flex flex-col gap-2"}>
      {when ? (
        <p className="flex items-start gap-2.5 rounded-lg border border-teal-400/35 bg-teal-400/15 px-3 py-2 text-sm font-semibold leading-snug text-teal-50">
          <CalendarIcon className="mt-0.5 h-4 w-4 shrink-0 text-teal-200" />
          <span>{when}</span>
        </p>
      ) : null}
      {where ? (
        <p className="flex items-start gap-2.5 rounded-lg border border-white/15 bg-white/10 px-3 py-2 text-sm font-semibold leading-snug text-white">
          <PinIcon className="mt-0.5 h-4 w-4 shrink-0 text-teal-200" />
          <span>{where}</span>
        </p>
      ) : null}
    </div>
  );
}
