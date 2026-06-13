import {useEffect, useRef, useState} from "react";
import {createPortal} from "react-dom";

// ── Helpers ───────────────────────────────────────────────────────────────────

const formatBytes = (bytes) => {
    if (!bytes) return '';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const formatTime = (secs) => {
    if (!secs || isNaN(secs)) return '0:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
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

// ── Inline SVG icons (lineicons doesn't have these) ───────────────────────────

const IconRewind10 = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
         strokeLinecap="round" strokeLinejoin="round">
        <path d="M11 17a5 5 0 0 0 5-5 5 5 0 0 0-5-5H4"/>
        <polyline points="4 7 1 10 4 13"/>
        <text x="8.5" y="15.5" fontSize="6.5" fontWeight="700" stroke="none" fill="currentColor"
              fontFamily="sans-serif">10
        </text>
    </svg>
);

const IconForward10 = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
         strokeLinecap="round" strokeLinejoin="round">
        <path d="M13 17a5 5 0 0 1-5-5 5 5 0 0 1 5-5h7"/>
        <polyline points="20 7 23 10 20 13"/>
        <text x="7.5" y="15.5" fontSize="6.5" fontWeight="700" stroke="none" fill="currentColor"
              fontFamily="sans-serif">10
        </text>
    </svg>
);

const IconFullscreen = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
         strokeLinecap="round" strokeLinejoin="round">
        <polyline points="15 3 21 3 21 9"/>
        <polyline points="9 21 3 21 3 15"/>
        <line x1="21" y1="3" x2="14" y2="10"/>
        <line x1="3" y1="21" x2="10" y2="14"/>
    </svg>
);

const IconExitFullscreen = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
         strokeLinecap="round" strokeLinejoin="round">
        <polyline points="4 14 10 14 10 20"/>
        <polyline points="20 10 14 10 14 4"/>
        <line x1="10" y1="14" x2="3" y2="21"/>
        <line x1="21" y1="3" x2="14" y2="10"/>
    </svg>
);

// ── Component ─────────────────────────────────────────────────────────────────

/**
 * VideoLightbox
 *
 * Props:
 *   url      — string
 *   name     — string
 *   size     — number | null  (bytes)
 *   onClose  — () => void
 */
const VideoLightbox = ({url, name, size, onClose}) => {
    const videoRef = useRef(null);
    const bodyRef = useRef(null);
    const overlayRef = useRef(null);

    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [volume, setVolume] = useState(1);
    const [isMuted, setIsMuted] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [showControls, setShowControls] = useState(true);
    const hideTimer = useRef(null);

    // ── Controls visibility (YouTube-style auto-hide) ─────────────────────────

    const revealControls = () => {
        setShowControls(true);
        clearTimeout(hideTimer.current);
        if (isPlaying) {
            hideTimer.current = setTimeout(() => setShowControls(false), 3000);
        }
    };

    // Always show controls when paused; restart hide timer when playing resumes
    useEffect(() => {
        clearTimeout(hideTimer.current);
        if (!isPlaying) {
            setShowControls(true);
        } else {
            hideTimer.current = setTimeout(() => setShowControls(false), 3000);
        }
        return () => clearTimeout(hideTimer.current);
    }, [isPlaying]);

    // ── Playback ──────────────────────────────────────────────────────────────

    const togglePlay = () => {
        const v = videoRef.current;
        if (!v) return;
        v.paused ? v.play() : v.pause();
    };

    const seek = (delta) => {
        const v = videoRef.current;
        if (!v) return;
        v.currentTime = Math.max(0, Math.min(v.duration || 0, v.currentTime + delta));
    };

    // ── Volume ────────────────────────────────────────────────────────────────

    const toggleMute = () => {
        const v = videoRef.current;
        if (!v) return;
        v.muted = !v.muted;
        setIsMuted(v.muted);
    };

    const handleVolumeSlider = (val) => {
        const v = videoRef.current;
        if (!v) return;
        const vol = parseFloat(val);
        v.volume = vol;
        v.muted = vol === 0;
        setVolume(vol);
        setIsMuted(vol === 0);
    };

    // ── Fullscreen ────────────────────────────────────────────────────────────

    const toggleFullscreen = () => {
        if (!document.fullscreenElement) {
            bodyRef.current?.requestFullscreen();
        } else {
            document.exitFullscreen();
        }
    };

    useEffect(() => {
        const onChange = () => setIsFullscreen(!!document.fullscreenElement);
        document.addEventListener('fullscreenchange', onChange);
        return () => document.removeEventListener('fullscreenchange', onChange);
    }, []);

    // ── Body scroll lock ──────────────────────────────────────────────────────

    useEffect(() => {
        const prev = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = prev;
        };
    }, []);

    // ── Esc to close (only when not in native fullscreen) ─────────────────────

    useEffect(() => {
        const onKey = (e) => {
            if (e.key === 'Escape' && !document.fullscreenElement) onClose();
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [onClose]);

    // ── Derived ───────────────────────────────────────────────────────────────

    const progressPct = duration ? (currentTime / duration) * 100 : 0;
    const volumeIcon = (isMuted || volume === 0) ? 'lni-volume-mute' : volume < 0.4 ? 'lni-volume-low' : 'lni-volume-high';

    return createPortal(
        <div
            className="img-lb-overlay"
            ref={overlayRef}
            onClick={(e) => {
                if (e.target === overlayRef.current) onClose();
            }}
        >
            <div className="img-lb vid-lb">

                {/* ── Header (reuses img-lb styles) ── */}
                <div className="img-lb-header">
                    <div className="img-lb-file-info">
                        <span className="img-lb-filename">{name}</span>
                        {size && <span className="img-lb-meta">{formatBytes(size)}</span>}
                    </div>
                    <div className="img-lb-actions">
                        <button className="img-lb-download-btn" onClick={() => forceDownload(url, name)}>
                            <i className="font-icon lni lni-download-1"/> Download
                        </button>
                        <button className="img-lb-close-btn" onClick={onClose} title="Close (Esc)">
                            <i className="font-icon lni lni-xmark"/>
                        </button>
                    </div>
                </div>

                {/* ── Video body ── */}
                <div
                    className={`vid-lb-body${showControls ? ' controls-visible' : ''}`}
                    ref={bodyRef}
                    onMouseMove={revealControls}
                    onMouseLeave={() => isPlaying && setShowControls(false)}
                >
                    <video
                        ref={videoRef}
                        src={url}
                        className="vid-lb-video"
                        onClick={togglePlay}
                        onTimeUpdate={(e) => setCurrentTime(e.target.currentTime)}
                        onLoadedMetadata={(e) => setDuration(e.target.duration)}
                        onPlay={() => setIsPlaying(true)}
                        onPause={() => setIsPlaying(false)}
                        onEnded={() => setIsPlaying(false)}
                    />

                    {/* ── Controls overlay ── */}
                    <div className="vid-lb-controls">

                        {/* Progress bar */}
                        <div className="vid-lb-progress">
                            <div className="vid-lb-progress-track">
                                <div className="vid-lb-progress-fill" style={{width: `${progressPct}%`}}/>
                                <input
                                    type="range"
                                    className="vid-lb-scrubber"
                                    min={0}
                                    max={duration || 0}
                                    step={0.1}
                                    value={currentTime}
                                    onChange={(e) => {
                                        const v = videoRef.current;
                                        if (v) v.currentTime = parseFloat(e.target.value);
                                    }}
                                />
                            </div>
                        </div>

                        {/* Control row */}
                        <div className="vid-lb-ctrl-row">
                            <div className="vid-lb-ctrl-left">
                                <button className="vid-lb-btn" onClick={() => seek(-10)} title="Rewind 10s">
                                    <IconRewind10/>
                                </button>
                                <button className="vid-lb-btn vid-lb-btn--play" onClick={togglePlay}
                                        title={isPlaying ? 'Pause' : 'Play'}>
                                    <i className={`font-icon lni ${isPlaying ? 'lni-pause' : 'lni-play'}`}/>
                                </button>
                                <button className="vid-lb-btn" onClick={() => seek(10)} title="Forward 10s">
                                    <IconForward10/>
                                </button>
                                <span className="vid-lb-time">
                                    {formatTime(currentTime)} / {formatTime(duration)}
                                </span>
                            </div>

                            <div className="vid-lb-ctrl-right">
                                <button className="vid-lb-btn" onClick={toggleMute} title={isMuted ? 'Unmute' : 'Mute'}>
                                    <i className={`font-icon lni ${volumeIcon}`}/>
                                </button>
                                <div className="vid-lb-volume-wrap">
                                    <div className="vid-lb-volume-track">
                                        <div className="vid-lb-volume-fill"
                                             style={{width: `${(isMuted ? 0 : volume) * 100}%`}}/>
                                        <input
                                            type="range"
                                            className="vid-lb-scrubber"
                                            min={0}
                                            max={1}
                                            step={0.02}
                                            value={isMuted ? 0 : volume}
                                            onChange={(e) => handleVolumeSlider(e.target.value)}
                                        />
                                    </div>
                                </div>
                                <button className="vid-lb-btn" onClick={toggleFullscreen}
                                        title={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}>
                                    {isFullscreen ? <IconExitFullscreen/> : <IconFullscreen/>}
                                </button>
                            </div>
                        </div>

                    </div>
                </div>

            </div>
        </div>,
        document.body
    );
};

export default VideoLightbox;
