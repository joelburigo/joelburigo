'use client';

import { useRef, useState } from 'react';
import { Upload, X } from 'lucide-react';

interface Props {
  id: string;
  kind: 'cover' | 'photo';
  currentPath: string | null;
  r2PublicUrl: string;
  onUploaded: (path: string) => void;
}

export function TestimonialImageUpload({ id, kind, currentPath, r2PublicUrl, onUploaded }: Props) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [localPath, setLocalPath] = useState<string | null>(currentPath);

  const previewUrl =
    localPath &&
    (localPath.startsWith('http') || localPath.startsWith('/')
      ? localPath
      : r2PublicUrl
        ? `${r2PublicUrl.replace(/\/$/, '')}/${localPath}`
        : null);

  async function upload(file: File) {
    setBusy(true);
    setError(null);
    const fd = new FormData();
    fd.append('file', file);
    fd.append('kind', kind);
    try {
      const res = await fetch(`/api/admin/testimonials/${id}/image`, {
        method: 'POST',
        body: fd,
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        setError(data.error ?? `HTTP ${res.status}`);
        return;
      }
      const { image } = (await res.json()) as { image: { path: string } };
      setLocalPath(image.path);
      onUploaded(image.path);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'erro de upload');
    } finally {
      setBusy(false);
    }
  }

  function clear() {
    setLocalPath(null);
    onUploaded('');
  }

  return (
    <div className="flex flex-col gap-2">
      {previewUrl && (
        <div className="relative">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={previewUrl}
            alt=""
            className={
              kind === 'photo'
                ? 'size-24 border border-[var(--jb-hair)] object-cover'
                : 'h-32 w-full border border-[var(--jb-hair)] object-cover'
            }
          />
          <button
            type="button"
            onClick={clear}
            aria-label="Limpar referência"
            className="bg-ink/80 hover:bg-fire hover:text-ink text-cream absolute right-2 top-2 p-1"
          >
            <X className="size-3" />
          </button>
        </div>
      )}
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={busy}
        className="bg-ink text-fg-2 hover:text-acid hover:border-acid flex items-center justify-center gap-2 border border-dashed border-[var(--jb-hair)] py-3 font-mono text-[11px] tracking-[0.22em] uppercase transition-colors disabled:opacity-50"
      >
        <Upload className="size-3.5" />
        {busy ? 'enviando...' : localPath ? 'trocar' : `upload ${kind}`}
      </button>
      {error && <p className="text-fire font-mono text-[11px]">{error}</p>}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={async (e) => {
          const f = e.target.files?.[0];
          if (!f) return;
          await upload(f);
          e.target.value = '';
        }}
      />
    </div>
  );
}
