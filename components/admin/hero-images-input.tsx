"use client";

import { useRef, useState } from "react";

export function HeroImagesInput({
  name,
  initial,
  onChange,
}: {
  name: string;
  initial: string[];
  onChange: () => void;
}) {
  const [images, setImages] = useState(initial);
  const [uploading, setUploading] = useState(0);
  const [error, setError] = useState("");
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const update = (next: string[]) => {
    setImages(next);
    onChange();
  };

  const uploadFiles = async (files: FileList | File[] | null) => {
    const list = Array.from(files ?? []).filter((file) => file.type.startsWith("image/"));
    if (list.length === 0) return;
    setError("");
    setUploading((count) => count + list.length);
    const uploaded = await Promise.all(
      list.map(async (file) => {
        const form = new FormData();
        form.append("file", file);
        try {
          const response = await fetch("/api/admin/upload", { method: "POST", body: form });
          const data = (await response.json()) as { url?: string };
          return data.url ?? null;
        } catch {
          return null;
        } finally {
          setUploading((count) => count - 1);
        }
      }),
    );
    const urls = uploaded.filter((url): url is string => Boolean(url));
    if (urls.length < list.length) setError("Alguna imagen no se pudo subir. Probá de nuevo.");
    if (urls.length) {
      setImages((current) => [...current, ...urls]);
      onChange();
    }
  };

  const move = (from: number, to: number) => {
    if (to < 0 || to >= images.length) return;
    const next = [...images];
    const [item] = next.splice(from, 1);
    next.splice(to, 0, item);
    update(next);
  };

  return (
    <div className="space-y-3">
      <input type="hidden" name={name} value={JSON.stringify(images)} />
      <span className="block text-sm text-gray-400">
        Imágenes del Hero (rotan cada 6 segundos; con una sola queda fija)
      </span>
      {images.length ? (
        <ol className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {images.map((url, index) => (
            <li key={`${url}-${index}`} className="overflow-hidden rounded-lg border border-gray-800 bg-gray-900">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={url} alt="" className="h-28 w-full object-cover" />
              <div className="flex items-center justify-between gap-2 p-2 text-sm">
                <span className="text-gray-400">{index === 0 ? "1 · Principal" : index + 1}</span>
                <div className="flex gap-1">
                  <IconButton label="Mover antes" disabled={index === 0} onClick={() => move(index, index - 1)}>
                    ←
                  </IconButton>
                  <IconButton
                    label="Mover después"
                    disabled={index === images.length - 1}
                    onClick={() => move(index, index + 1)}
                  >
                    →
                  </IconButton>
                  <IconButton label="Quitar" onClick={() => update(images.filter((_, i) => i !== index))}>
                    ✕
                  </IconButton>
                </div>
              </div>
            </li>
          ))}
        </ol>
      ) : (
        <p className="text-sm text-gray-500">Sin imágenes: se muestra un fondo degradado.</p>
      )}
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        onDragOver={(event) => {
          event.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(event) => {
          event.preventDefault();
          setDragging(false);
          void uploadFiles(event.dataTransfer.files);
        }}
        className={`flex w-full flex-col items-center justify-center rounded-lg border-2 border-dashed px-4 py-6 transition-colors ${
          dragging
            ? "border-teal-400 bg-teal-950/30 text-teal-200"
            : "border-gray-600 bg-gray-900/80 text-gray-400 hover:border-gray-400 hover:text-gray-200"
        }`}
      >
        <span className="text-sm font-medium">
          {uploading ? `Subiendo ${uploading} imagen${uploading === 1 ? "" : "es"}...` : "Arrastrá imágenes o hacé clic para agregar"}
        </span>
        <span className="text-xs text-gray-500">PNG, JPG o WebP. Podés elegir varias a la vez.</span>
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(event) => {
          void uploadFiles(event.target.files);
          event.target.value = "";
        }}
      />
      {error ? <p className="text-sm text-red-400">{error}</p> : null}
    </div>
  );
}

function IconButton({
  label,
  disabled,
  onClick,
  children,
}: {
  label: string;
  disabled?: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      disabled={disabled}
      onClick={onClick}
      className="rounded border border-gray-700 px-2 py-0.5 text-gray-300 hover:border-gray-500 hover:text-white disabled:opacity-30"
    >
      {children}
    </button>
  );
}
