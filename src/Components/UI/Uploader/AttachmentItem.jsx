import {useState} from "react";

// ── Helpers ───────────────────────────────────────────────────────────────────

export const IMAGE_EXTS = new Set(['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg']);
export const VIDEO_EXTS = new Set(['mp4', 'webm', 'ogg', 'mov', 'avi', 'mkv']);

const forceDownload = async (url, filename) => {
    try {
        const res = await fetch(url);
        const blob = await res.blob();
        const blobUrl = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = blobUrl;
        a.download = filename || 'download';
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(blobUrl);
    } catch {
        window.open(url, '_blank');
    }
};

export const formatBytes = (bytes) => {
    if (!bytes) return '';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

// ── AttachmentItem ────────────────────────────────────────────────────────────

/**
 * Props:
 *   file          — { iri, url, filename, extension, size, key, bucketUrl }
 *   onDelete      — (iri) => void | Promise
 *   onImageClick  — () => void   Called when an image thumbnail is clicked.
 *   onVideoClick  — () => void   Called when a video thumbnail is clicked.
 *                                The parent owns the lightbox.
 */
const AttachmentItem = ({file, onDelete, onImageClick, onVideoClick}) => {
    const [deleting, setDeleting] = useState(false);

    const ext = (file.extension ?? '').toLowerCase();
    const isImg = IMAGE_EXTS.has(ext);
    const isVideo = VIDEO_EXTS.has(ext);
    const url = file.url ?? (file.bucketUrl ? `${file.bucketUrl}/${file.key}.${file.extension}` : null);
    const name = file.filename ?? file.key ?? file['@id'] ?? '—';

    const handleDelete = async (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDeleting(true);
        await onDelete?.(file['@id'] ?? file.iri);
        setDeleting(false);
    };

    const thumb = (() => {
        if (isImg && url) {
            return (
                <button
                    className="tpd-attach-thumb tpd-attach-thumb--clickable"
                    onClick={() => onImageClick?.()}
                    title="View full size"
                >
                    <img src={url} alt={name}/>
                </button>
            );
        }
        if (isVideo && url) {
            return (
                <button
                    className="tpd-attach-thumb tpd-attach-thumb--clickable tpd-attach-thumb--video"
                    onClick={() => onVideoClick?.()}
                    title="Play video"
                >
                    <i className="font-icon lni lni-play tpd-attach-thumb-play"/>
                </button>
            );
        }
        return (
            <button
                className="tpd-attach-thumb tpd-attach-thumb--file tpd-attach-thumb--clickable"
                onClick={() => forceDownload(url, name)}
                title={`Download ${name}`}
                disabled={!url}
            >
                <i className="font-icon lni lni-file-multiple"/>
            </button>
        );
    })();

    return (
        <div className={`tpd-attach-item${deleting ? ' is-deleting' : ''}`}>
            {thumb}
            <div className="tpd-attach-meta">
                <span className="tpd-attach-name" title={name}>{name}</span>
                <span className="tpd-attach-info">
                    {ext.toUpperCase()}{file.size ? ` · ${formatBytes(file.size)}` : ''}
                </span>
            </div>
            <button className="tpd-attach-delete" onClick={handleDelete} disabled={deleting}>
                {deleting
                    ? <i className="font-icon lni lni-spinner-arrow"/>
                    : <i className="font-icon lni lni-trash-3"/>}
            </button>
        </div>
    );
};

export default AttachmentItem;
