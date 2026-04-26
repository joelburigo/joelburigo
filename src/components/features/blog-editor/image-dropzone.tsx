'use client';

import { useRef, useState } from 'react';
import { Upload, X } from 'lucide-react';

interface UploadedImage {
  path: string;
  url: string;
  alt: string;
  width: number;
  height: number;
  size_bytes: number;
}

interface Props {
  currentPath: string | null;
  r2PublicUrl: string;
  postId: string;
  onUploaded: (img: UploadedImage) => void;
  onClear: () => void;
}

export function ImageDropzone({ currentPath, r2PublicUrl, postId, onUploaded, onClear }: Props) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const previewUrl = currentPath
    ? r2PublicUrl
      ? `${r2PublicUrl.replace(/\/$/, '')}/${currentPath}`
      : null
    : null;

  async function upload(file: File) {
    setBusy(true);
    setError(null);
    const fd = new FormData();
    fd.append('file', file);
    try {
      const res = await fetch(`/api/admin/blog/${postId}/image`, { method: 'POST', body: fd });
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        setError(data.error ?? `HTTP ${res.status}`);
        return;
      }
      const { image } = (await res.json()) as { image: UploadedImage };
      onUploaded(image);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'erro de upload');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-col gap-2">
      {previewUrl && (
        <div className="relative">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={previewUrl}
            alt=""
            className="border border-[var(--jb-hair)] w-full object-cover"
          />
          <button
            type="button"
            onClick={onClear}
            aria-label="Remover imagem"
            className="bg-ink/80 hover:bg-fire hover:text-ink absolute right-2 top-2 p-1 text-cream"
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
        {busy ? 'enviando...' : currentPath ? 'trocar imagem' : 'upload imagem'}
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
