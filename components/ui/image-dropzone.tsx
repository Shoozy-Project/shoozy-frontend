'use client';

import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { UploadCloud, X, ImageOff, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

const MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB
const ACCEPTED_MIME: Record<string, string[]> = {
  'image/jpeg': ['.jpg', '.jpeg'],
  'image/png': ['.png'],
  'image/webp': ['.webp'],
  'image/gif': ['.gif'],
  'image/avif': ['.avif'],
};

export interface ImageDropzoneProps {
  value?: string | null;
  onSelect: (file: File | null, previewUrl: string | null) => void;
  disabled?: boolean;
  className?: string;
}

export function ImageDropzone({ value, onSelect, disabled = false, className }: ImageDropzoneProps) {
  const [dropError, setDropError] = useState<string | null>(null);
  const [blobPreview, setBlobPreview] = useState<string | null>(null);

  const displaySrc = blobPreview ?? value ?? null;
  const hasImage = Boolean(displaySrc);

  const handleDrop = useCallback(
    (accepted: File[]) => {
      const file = accepted[0];
      if (!file) return;
      setDropError(null);
      if (blobPreview) URL.revokeObjectURL(blobPreview);
      const objectUrl = URL.createObjectURL(file);
      setBlobPreview(objectUrl);
      onSelect(file, objectUrl);
    },
    [blobPreview, onSelect],
  );

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (blobPreview) URL.revokeObjectURL(blobPreview);
    setBlobPreview(null);
    setDropError(null);
    onSelect(null, null);
  };

  const { getRootProps, getInputProps, isDragActive, fileRejections } = useDropzone({
    onDrop: handleDrop,
    accept: ACCEPTED_MIME,
    maxSize: MAX_SIZE_BYTES,
    maxFiles: 1,
    disabled,
    noClick: hasImage,
    noKeyboard: hasImage,
  });

  const sizeError = fileRejections.find((r) => r.errors.some((e) => e.code === 'file-too-large'));
  const typeError = fileRejections.find((r) => r.errors.some((e) => e.code === 'file-invalid-type'));

  return (
    <div className={cn('space-y-2', className)}>
      <div
        {...getRootProps()}
        className={cn(
          'relative w-full rounded-xl border-2 border-dashed transition-all duration-200 overflow-hidden',
          hasImage ? 'border-transparent h-44 cursor-default' : 'h-36 cursor-pointer',
          isDragActive && !hasImage && 'border-[#FF8C00] bg-orange-50/60 scale-[1.01]',
          !isDragActive && !hasImage && 'border-gray-200 bg-gray-50 hover:border-[#FF8C00]/50 hover:bg-orange-50/20',
          disabled && 'opacity-60 cursor-not-allowed',
        )}
      >
        <input {...getInputProps()} />

        {hasImage && (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={displaySrc!} alt="Cover preview" className="absolute inset-0 w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 hover:opacity-100 transition-opacity duration-200 flex items-end p-3">
              <label htmlFor="image-dropzone-replace" className={cn('inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/90 text-xs font-semibold text-gray-800 cursor-pointer hover:bg-white transition-colors shadow-sm', disabled && 'pointer-events-none opacity-50')}>
                <UploadCloud className="w-3.5 h-3.5" />
                Replace
              </label>
              <input id="image-dropzone-replace" type="file" accept={Object.keys(ACCEPTED_MIME).join(',')} className="sr-only" disabled={disabled} onChange={(e) => { const file = e.target.files?.[0]; if (file) handleDrop([file]); e.target.value = ''; }} />
            </div>
            {!disabled && (
              <button type="button" onClick={handleClear} className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/60 hover:bg-red-500 text-white flex items-center justify-center transition-colors shadow-md" aria-label="Remove image">
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </>
        )}

        {!hasImage && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-4 text-center select-none">
            <div className={cn('w-11 h-11 rounded-full flex items-center justify-center transition-colors', isDragActive ? 'bg-[#FF8C00]/20 text-[#FF8C00]' : 'bg-gray-100 text-gray-400')}>
              <UploadCloud className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-700">{isDragActive ? 'Drop image here' : 'Drag & drop or click to upload'}</p>
              <p className="text-xs text-gray-400 mt-0.5">JPG, PNG, WEBP, GIF, AVIF · Max 5 MB</p>
            </div>
          </div>
        )}
      </div>

      {(dropError || sizeError || typeError) && (
        <p className="flex items-center gap-1.5 text-xs text-red-500">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          {dropError ?? (sizeError ? 'File exceeds 5 MB limit.' : 'Only image files are accepted.')}
        </p>
      )}

      {!hasImage && !isDragActive && !dropError && (
        <p className="flex items-center gap-1 text-[11px] text-gray-400">
          <ImageOff className="w-3 h-3" />
          No cover image selected
        </p>
      )}
    </div>
  );
}
