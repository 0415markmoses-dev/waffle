import {useCallback, useEffect, useRef, useState} from "react";
import {createPortal} from "react-dom";

const formatBytes = (bytes) => {
    if (!bytes) return '';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

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

/**
 * ImageLightbox
 *
 * Props:
 *   images        — Array<{url: string, name: string, size?: number}>
 *   initialIndex  — number
 *   onClose       — () => void
 */
const ImageLightbox = ({images, initialIndex = 0, onClose}) => {
    const [idx, setIdx] = useState(initialIndex);
    const [dimensions, setDimensions] = useState(null);
    const count = images.length;
    const overlayRef = useRef(null);

    const goTo = useCallback((nextIdx) => {
        setIdx(nextIdx);
        setDimensions(null);
    }, []);
    const prev = useCallback(() => goTo((idx - 1 + count) % count), [goTo, idx, count]);
    const next = useCallback(() => goTo((idx + 1) % count), [goTo, idx, count]);

    useEffect(() => {
        const handleKey = (e) => {
            if (e.key === 'ArrowLeft') {
                e.preventDefault();
                prev();
            } else if (e.key === 'ArrowRight') {
                e.preventDefault();
                next();
            } else if (e.key === 'Escape') {
                onClose();
            }
        };
        window.addEventListener('keydown', handleKey);
        return () => window.removeEventListener('keydown', handleKey);
    }, [prev, next, onClose]);

    useEffect(() => {
        const prev = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = prev;
        };
    }, []);

    const {url, name, size} = images[idx] ?? {};

    const content = (
        <div className="img-lb-overlay" ref={overlayRef} onClick={(e) => {
            if (e.target === overlayRef.current) onClose();
        }}>
            <div className="img-lb">

                {/* ── Header ── */}
                <div className="img-lb-header">
                    <div className="img-lb-file-info">
                        <span className="img-lb-filename">{name}</span>
                        <span className="img-lb-meta">
                            {[
                                size ? formatBytes(size) : null,
                                dimensions ? `${dimensions.w} × ${dimensions.h}` : null,
                            ].filter(Boolean).join(' · ')}
                        </span>
                    </div>

                    {count > 1 && (
                        <div className="img-lb-nav">
                            <button className="img-lb-nav-btn" onClick={prev} title="Previous (←)">
                                <i className="font-icon lni lni-arrow-left"/>
                            </button>
                            <span className="img-lb-counter">{idx + 1} / {count}</span>
                            <button className="img-lb-nav-btn" onClick={next} title="Next (→)">
                                <i className="font-icon lni lni-arrow-right"/>
                            </button>
                        </div>
                    )}

                    <div className="img-lb-actions">
                        <button className="img-lb-download-btn" onClick={() => forceDownload(url, name)}>
                            <i className="font-icon lni lni-download-1"/> Download
                        </button>
                        <button className="img-lb-close-btn" onClick={onClose} title="Close (Esc)">
                            <i className="font-icon lni lni-xmark"/>
                        </button>
                    </div>
                </div>

                {/* ── Image body ── */}
                <div className="img-lb-body">
                    <div className="img-lb-img-wrap">
                        <img
                            key={url}
                            src={url}
                            alt={name}
                            style={{maxWidth: '100%', maxHeight: '100%', width: 'auto', height: 'auto'}}
                            onLoad={(e) => setDimensions({w: e.target.naturalWidth, h: e.target.naturalHeight})}
                        />
                    </div>
                </div>

            </div>
        </div>
    );

    return createPortal(content, document.body);
};

export default ImageLightbox;
