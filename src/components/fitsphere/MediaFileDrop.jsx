import Icon from './Icon';

const labelClass = 'mb-1.5 block text-xs font-semibold uppercase tracking-wide text-secondary';

/**
 * Drag-and-drop / browse file input with preview.
 * Parent handles upload via onFileSelect (async).
 */
const MediaFileDrop = ({
  label,
  hint,
  accept,
  preview,
  previewType = 'image',
  icon = 'cloud_upload',
  uploading = false,
  onFile,
  onClear,
  inputRef,
}) => (
  <div>
    {label && <p className={labelClass}>{label}</p>}
    {preview ? (
      <div className="relative overflow-hidden rounded-xl border border-white/10">
        {previewType === 'video' ? (
          <video src={preview} controls className="max-h-48 w-full bg-black" />
        ) : (
          <img src={preview} alt="" className="max-h-40 w-full object-contain bg-black/40" />
        )}
        {!uploading && (
          <button
            type="button"
            onClick={onClear}
            className="absolute right-2 top-2 rounded-lg bg-black/60 p-1.5 text-on-surface hover:bg-error/80"
          >
            <Icon name="close" size={18} />
          </button>
        )}
        {uploading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50">
            <span className="h-8 w-8 animate-spin rounded-full border-2 border-primary-container/30 border-t-primary-container" />
          </div>
        )}
      </div>
    ) : (
      <label
        className={`flex cursor-pointer flex-col items-center gap-2 rounded-xl border-2 border-dashed border-white/10 p-6 text-center transition hover:border-primary-container/40 ${uploading ? 'pointer-events-none opacity-60' : ''}`}
      >
        <Icon name={icon} size={36} className="text-secondary" />
        <span className="text-sm font-medium">{uploading ? 'Uploading to Cloudinary…' : hint}</span>
        {!uploading && (
          <span className="rounded-full border border-white/20 px-4 py-1 text-xs">Browse</span>
        )}
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          className="hidden"
          disabled={uploading}
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) onFile(file);
            e.target.value = '';
          }}
        />
      </label>
    )}
  </div>
);

export default MediaFileDrop;
