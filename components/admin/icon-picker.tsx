"use client";

import { useEffect, useId, useRef, useState } from "react";
import { getLandingIcon, LANDING_ICON_OPTIONS, type LandingIconId } from "@/components/landing/icon-catalog";

export function IconPicker({
  name,
  label,
  defaultValue,
}: {
  name: string;
  label: string;
  defaultValue?: string;
}) {
  const listId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const initial = getLandingIcon(defaultValue).id;
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState<LandingIconId>(initial);
  const selected = getLandingIcon(value);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <div ref={rootRef} className="relative">
      <span className="mb-1 block text-sm text-gray-400">{label}</span>
      <input type="hidden" name={name} value={value} />
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        onClick={() => setOpen((current) => !current)}
        className="flex w-full items-center gap-3 rounded-md border border-gray-700 bg-gray-900 p-2 text-left text-white hover:border-gray-500"
      >
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-600/20 text-blue-300">
          <selected.Icon className="h-5 w-5" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate font-medium">{selected.label}</span>
          <span className="block truncate text-xs text-gray-500">{selected.id}</span>
        </span>
        <span className="text-gray-500" aria-hidden>
          ▾
        </span>
      </button>

      {open ? (
        <ul
          id={listId}
          role="listbox"
          className="absolute z-30 mt-2 max-h-72 w-full overflow-auto rounded-lg border border-gray-700 bg-gray-950 p-1 shadow-xl"
        >
          {LANDING_ICON_OPTIONS.map((option) => {
            const active = option.id === value;
            return (
              <li key={option.id}>
                <button
                  type="button"
                  role="option"
                  aria-selected={active}
                  onClick={() => {
                    setValue(option.id);
                    setOpen(false);
                  }}
                  className={`flex w-full items-center gap-3 rounded-md px-2 py-2 text-left transition-colors ${
                    active ? "bg-blue-600/20 text-white" : "text-gray-300 hover:bg-gray-800 hover:text-white"
                  }`}
                >
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-gray-800 text-teal-300">
                    <option.Icon className="h-5 w-5" />
                  </span>
                  <span>
                    <span className="block text-sm font-medium">{option.label}</span>
                    <span className="block text-xs text-gray-500">{option.id}</span>
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}
