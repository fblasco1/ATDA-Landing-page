"use client";

import { normalizeExternalUrl, slugify } from "@/lib/utils";
import { useMemo, useRef, useState, type FormEvent } from "react";
import { IconPicker } from "./icon-picker";

export type Field = {
  name: string;
  label: string;
  type?: "text" | "textarea" | "number" | "checkbox" | "select" | "creatable-select" | "icon";
  options?: Array<{ value: string; label: string }>;
  rows?: number;
  /** Solo se muestra si el select `field` tiene alguno de estos valores. */
  showWhen?: { field: string; in: string[] };
};

type Item = Record<string, unknown> & { _id: string };

function slugCurrent(value: unknown) {
  if (typeof value === "string") return value;
  if (value && typeof value === "object" && "current" in value) {
    return String((value as { current?: unknown }).current ?? "");
  }
  return "";
}

function normalizeItems(items: Item[]) {
  return items.map((item) =>
    item.slug !== undefined ? { ...item, slug: slugCurrent(item.slug) } : item,
  );
}

export function CollectionManager({
  type,
  fields,
  items,
  titleField = "title",
  createdMessage = "Creado. Ya se ve en la landing.",
}: {
  type: string;
  fields: Field[];
  items: Item[];
  titleField?: string;
  createdMessage?: string;
}) {
  const [rows, setRows] = useState(() => normalizeItems(items));
  const [status, setStatus] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formKey, setFormKey] = useState(0);
  const [busy, setBusy] = useState<string | null>(null);

  const editing = useMemo(() => rows.find((row) => row._id === editingId), [rows, editingId]);

  const categorySuggestions = useMemo(() => {
    const values = new Set<string>();
    for (const row of rows) {
      if (typeof row.category === "string" && row.category.trim()) {
        values.add(row.category.trim());
      }
    }
    return [...values].sort((a, b) => a.localeCompare(b, "es"));
  }, [rows]);

  const readForm = (form: FormData) => {
    const data: Record<string, unknown> = {};
    for (const field of fields) {
      if (field.type === "checkbox") {
        data[field.name] = form.get(field.name) === "on";
      } else if (field.type === "number") {
        const value = form.get(field.name);
        data[field.name] = value ? Number(value) : undefined;
      } else if (field.type === "creatable-select") {
        data[field.name] = String(form.get(field.name) ?? "").trim();
      } else {
        data[field.name] = String(form.get(field.name) ?? "");
      }
    }

    if (type === "course" || type === "project") {
      const title = String(data.title ?? "");
      data.slug = { _type: "slug", current: slugify(title) };
    }

    if (type === "course" && data.quota === undefined) {
      delete data.quota;
    }

    if (type === "networkPartner" && typeof data.url === "string") {
      data.url = normalizeExternalUrl(data.url) ?? "";
    }

    return data;
  };

  const refresh = async () => {
    const response = await fetch(`/api/admin/content?type=${type}`);
    const data = (await response.json()) as { items?: Item[]; error?: string };
    if (!response.ok) {
      setStatus(data.error ?? "No se pudo recargar el listado");
      return;
    }
    setRows(normalizeItems(data.items ?? []));
  };

  const handleCreate = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const payload = readForm(new FormData(form));
    setBusy("create");
    setStatus("");
    const response = await fetch("/api/admin/content", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type, data: payload }),
    }).catch(() => null);
    const result = (await response?.json().catch(() => ({}))) as { error?: string } | undefined;
    setBusy(null);
    if (response?.ok) {
      setFormKey((key) => key + 1);
      setStatus(createdMessage);
      void refresh();
    } else {
      setStatus(result?.error ?? "No se pudo crear");
    }
  };

  const handleUpdate = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!editingId) return;
    const id = editingId;
    const payload = readForm(new FormData(event.currentTarget));
    setBusy("update");
    setStatus("");
    const response = await fetch(`/api/admin/content/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }).catch(() => null);
    const result = (await response?.json().catch(() => ({}))) as { error?: string } | undefined;
    setBusy(null);
    if (response?.ok) {
      const { slug: _slug, ...fieldValues } = payload;
      setRows((current) => current.map((row) => (row._id === id ? { ...row, ...fieldValues } : row)));
      setEditingId(null);
      setStatus("Actualizado");
      void refresh();
    } else {
      setStatus(result?.error ?? "No se pudo actualizar");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Eliminar este contenido?")) return;
    setBusy(`delete:${id}`);
    const response = await fetch(`/api/admin/content/${id}`, { method: "DELETE" }).catch(() => null);
    setBusy(null);
    setStatus(response?.ok ? "Eliminado" : "No se pudo eliminar");
    if (response?.ok) setRows((current) => current.filter((row) => row._id !== id));
  };

  return (
    <div className="space-y-8">
      <form
        key={formKey}
        onSubmit={handleCreate}
        onChange={() => setStatus("")}
        className="space-y-3 rounded-lg border border-gray-800 p-4"
      >
        <h3 className="font-semibold text-white">Nuevo</h3>
        <FieldGrid fields={fields} categorySuggestions={categorySuggestions} />
        <button
          type="submit"
          disabled={busy !== null}
          className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-60"
        >
          {busy === "create" ? "Creando..." : "Crear"}
        </button>
      </form>
      {status ? <p className="text-teal-300">{status}</p> : null}
      <ul className="space-y-3">
        {rows.map((row) => (
          <li key={row._id} className="rounded-lg border border-gray-800 p-4">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="font-medium text-white">{String(row[titleField] ?? row._id)}</p>
                {typeof row.category === "string" && row.category ? (
                  <p className="mt-1 text-sm text-gray-500">{row.category}</p>
                ) : null}
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  className="text-sm text-blue-300"
                  onClick={() => setEditingId(row._id === editingId ? null : row._id)}
                >
                  Editar
                </button>
                <button
                  type="button"
                  disabled={busy !== null}
                  className="text-sm text-red-400 disabled:opacity-60"
                  onClick={() => handleDelete(row._id)}
                >
                  {busy === `delete:${row._id}` ? "Borrando..." : "Borrar"}
                </button>
              </div>
            </div>
            {editingId === row._id && editing ? (
              <form onSubmit={handleUpdate} onChange={() => setStatus("")} className="mt-4 space-y-3">
                <FieldGrid fields={fields} values={editing} categorySuggestions={categorySuggestions} />
                <button
                  type="submit"
                  disabled={busy !== null}
                  className="rounded-md bg-teal-600 px-4 py-2 text-white disabled:opacity-60"
                >
                  {busy === "update" ? "Guardando..." : "Guardar cambios"}
                </button>
              </form>
            ) : null}
          </li>
        ))}
      </ul>
    </div>
  );
}

function FieldGrid({
  fields,
  values,
  categorySuggestions = [],
}: {
  fields: Field[];
  values?: Item;
  categorySuggestions?: string[];
}) {
  const [selected, setSelected] = useState<Record<string, string>>(() =>
    Object.fromEntries(
      fields
        .filter((field) => field.type === "select")
        .map((field) => {
          const value = values?.[field.name];
          return [field.name, typeof value === "string" ? value : (field.options?.[0]?.value ?? "")];
        }),
    ),
  );

  return (
    <div className="grid gap-3 md:grid-cols-2">
      {fields.map((field) => {
        if (field.showWhen && !field.showWhen.in.includes(selected[field.showWhen.field] ?? "")) {
          return null;
        }
        const value = values?.[field.name];
        if (field.type === "textarea") {
          return (
            <label key={field.name} className="md:col-span-2">
              <span className="mb-1 block text-sm text-gray-400">{field.label}</span>
              <textarea
                name={field.name}
                defaultValue={typeof value === "string" ? value : ""}
                rows={field.rows ?? 4}
                className="w-full rounded-md border border-gray-700 bg-gray-900 p-2 text-white"
              />
            </label>
          );
        }
        if (field.type === "checkbox") {
          const defaultChecked = values
            ? Boolean(value)
            : field.name === "published" || field.name === "active";
          return (
            <label key={field.name} className="flex items-center gap-2 text-gray-300">
              <input name={field.name} type="checkbox" defaultChecked={defaultChecked} />
              {field.label}
            </label>
          );
        }
        if (field.type === "creatable-select") {
          return (
            <CreatableSelectField
              key={field.name}
              name={field.name}
              label={field.label}
              defaultValue={typeof value === "string" ? value : ""}
              suggestions={categorySuggestions}
            />
          );
        }
        if (field.type === "icon" || field.name === "icon") {
          return (
            <IconPicker
              key={field.name}
              name={field.name}
              label={field.label}
              defaultValue={typeof value === "string" ? value : ""}
            />
          );
        }
        if (field.type === "select") {
          return (
            <label key={field.name}>
              <span className="mb-1 block text-sm text-gray-400">{field.label}</span>
              <select
                name={field.name}
                value={selected[field.name]}
                onChange={(event) =>
                  setSelected((current) => ({ ...current, [field.name]: event.target.value }))
                }
                className="w-full rounded-md border border-gray-700 bg-gray-900 p-2 text-white"
              >
                {field.options?.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
          );
        }
        if (field.name === "imageUrl" || field.name === "logoUrl") {
          return (
            <ImageDropField
              key={field.name}
              name={field.name}
              label={field.label}
              defaultValue={typeof value === "string" ? value : ""}
            />
          );
        }
        return (
          <label key={field.name}>
            <span className="mb-1 block text-sm text-gray-400">{field.label}</span>
            <input
              name={field.name}
              type={field.type === "number" ? "number" : "text"}
              defaultValue={value == null ? "" : String(value)}
              className="w-full rounded-md border border-gray-700 bg-gray-900 p-2 text-white"
            />
          </label>
        );
      })}
    </div>
  );
}

const NEW_CATEGORY = "__new__";

function CreatableSelectField({
  name,
  label,
  defaultValue,
  suggestions,
}: {
  name: string;
  label: string;
  defaultValue: string;
  suggestions: string[];
}) {
  const known = Boolean(defaultValue && suggestions.includes(defaultValue));
  const [mode, setMode] = useState<"list" | "new">(known ? "list" : "new");
  const [selected, setSelected] = useState(known ? defaultValue : "");
  const [custom, setCustom] = useState(!known && defaultValue ? defaultValue : "");

  return (
    <div className="space-y-2">
      <span className="block text-sm text-gray-400">{label}</span>
      <select
        value={mode === "new" ? NEW_CATEGORY : selected}
        onChange={(event) => {
          if (event.target.value === NEW_CATEGORY) {
            setMode("new");
            setSelected("");
            return;
          }
          setMode("list");
          setSelected(event.target.value);
          setCustom("");
        }}
        className="w-full rounded-md border border-gray-700 bg-gray-900 p-2 text-white"
        {...(mode === "list" ? { name, required: true } : {})}
      >
        <option value="" disabled>
          Elegí una categoría
        </option>
        {suggestions.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
        <option value={NEW_CATEGORY}>+ Crear nueva categoría…</option>
      </select>
      {mode === "new" ? (
        <input
          name={name}
          value={custom}
          onChange={(event) => setCustom(event.target.value)}
          placeholder="Nombre de la nueva categoría"
          className="w-full rounded-md border border-gray-700 bg-gray-900 p-2 text-white"
          required
        />
      ) : null}
    </div>
  );
}

function ImageDropField({
  name,
  label,
  defaultValue,
}: {
  name: string;
  label: string;
  defaultValue: string;
}) {
  const [url, setUrl] = useState(defaultValue);
  const [uploading, setUploading] = useState(false);
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File | undefined) => {
    if (!file || !file.type.startsWith("image/")) return;
    setUploading(true);
    const form = new FormData();
    form.append("file", file);
    const response = await fetch("/api/admin/upload", { method: "POST", body: form });
    const data = (await response.json()) as { url?: string; error?: string };
    if (data.url) setUrl(data.url);
    setUploading(false);
  };

  return (
    <div className="md:col-span-2 space-y-2">
      <span className="block text-sm text-gray-400">{label}</span>
      <input type="hidden" name={name} value={url} />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        onDragEnter={(event) => {
          event.preventDefault();
          setDragging(true);
        }}
        onDragOver={(event) => {
          event.preventDefault();
          setDragging(true);
        }}
        onDragLeave={(event) => {
          event.preventDefault();
          setDragging(false);
        }}
        onDrop={(event) => {
          event.preventDefault();
          setDragging(false);
          void handleFile(event.dataTransfer.files?.[0]);
        }}
        className={`flex min-h-36 w-full flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed px-4 py-6 text-center transition-colors ${
          dragging
            ? "border-teal-400 bg-teal-500/10 text-teal-200"
            : "border-gray-600 bg-gray-900/80 text-gray-400 hover:border-gray-400 hover:text-gray-200"
        }`}
      >
        {url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={url} alt="" className="mb-2 max-h-28 rounded object-contain" />
        ) : null}
        <span className="text-sm font-medium">
          {uploading ? "Subiendo..." : "Arrastrá una imagen o hacé clic para elegir"}
        </span>
        <span className="text-xs text-gray-500">PNG, JPG o WebP</span>
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(event) => {
          void handleFile(event.target.files?.[0]);
          event.target.value = "";
        }}
      />
      {url ? (
        <button type="button" className="text-xs text-red-400 hover:text-red-300" onClick={() => setUrl("")}>
          Quitar imagen
        </button>
      ) : null}
    </div>
  );
}
