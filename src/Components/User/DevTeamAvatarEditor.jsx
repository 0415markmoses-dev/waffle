import {useCallback, useRef, useState} from 'react';
import {createPortal} from 'react-dom';
import Cropper from 'react-easy-crop';
import {useTranslation} from 'react-i18next';
import toast from 'react-hot-toast';
import PropTypes from 'prop-types';
import AuthService from '../../Services/Authentication/AuthService.js';
import {useAuthStore} from '../../Store/auth.js';

const DEFAULT_AVATAR = '/assets/gator_avatar.png';
const MAX_PX = 500;
const MAX_BYTES = 500 * 1024; // 500 KB

// ── Canvas helper: crop + resize ──────────────────────────────────────────────

async function getCroppedBlob(imageSrc, pixelCrop) {
    const image = await new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = reject;
        img.src = imageSrc;
    });

    // Target size: cap at MAX_PX
    const size = Math.min(pixelCrop.width, pixelCrop.height, MAX_PX);

    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');

    ctx.drawImage(
        image,
        pixelCrop.x, pixelCrop.y,
        pixelCrop.width, pixelCrop.height,
        0, 0,
        size, size,
    );

    return new Promise((resolve, reject) =>
        canvas.toBlob(blob => blob ? resolve(blob) : reject(new Error('canvas toBlob failed')), 'image/png'),
    );
}

// ── CropModal ─────────────────────────────────────────────────────────────────

const CropModal = ({src, onCancel, onConfirm}) => {
    const {t} = useTranslation();
    const [crop, setCrop] = useState({x: 0, y: 0});
    const [zoom, setZoom] = useState(1);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
    const [processing, setProcessing] = useState(false);

    const onCropComplete = useCallback((_, cap) => setCroppedAreaPixels(cap), []);

    const handleUse = async () => {
        if (!croppedAreaPixels) return;
        setProcessing(true);
        try {
            const blob = await getCroppedBlob(src, croppedAreaPixels);
            if (blob.size > MAX_BYTES) {
                toast.error(t('Image is too large. Please crop a smaller area.'));
                setProcessing(false);
                return;
            }
            onConfirm(blob);
        } catch {
            toast.error(t('Failed to process image.'));
            setProcessing(false);
        }
    };

    return createPortal(
        <div className="dae-crop-overlay">
            <div className="dae-crop-modal">
                <div className="dae-crop-area">
                    <Cropper
                        image={src}
                        crop={crop}
                        zoom={zoom}
                        aspect={1}
                        onCropChange={setCrop}
                        onZoomChange={setZoom}
                        onCropComplete={onCropComplete}
                        cropShape="round"
                        showGrid={false}
                    />
                </div>
                <div className="dae-crop-controls">
                    <label className="dae-zoom-label">
                        <i className="font-icon lni lni-zoom-minus"/>
                        <input
                            type="range"
                            min={1} max={3} step={0.05}
                            value={zoom}
                            onChange={e => setZoom(Number(e.target.value))}
                            className="dae-zoom-slider"
                        />
                        <i className="font-icon lni lni-zoom-plus"/>
                    </label>
                </div>
                <div className="dae-crop-footer">
                    <button className="btn btn-light btn-sm" onClick={onCancel} disabled={processing}>
                        {t('Cancel')}
                    </button>
                    <button className="btn btn-primary btn-sm" onClick={handleUse} disabled={processing}>
                        {processing
                            ? <span className="spinner-border spinner-border-sm me-1"/>
                            : <i className="font-icon lni lni-check me-1"/>
                        }
                        {t('Use this image')}
                    </button>
                </div>
            </div>
        </div>,
        document.body,
    );
};

// ── DevTeamAvatarEditor ───────────────────────────────────────────────────────

export const DevTeamAvatarEditor = ({profilePictureUrl, onProgress, onUpdated}) => {
    const {t} = useTranslation();
    const {user, getUserData} = useAuthStore();
    const fileInputRef = useRef(null);
    const [rawSrc, setRawSrc] = useState(null);   // data URL for crop modal
    const [loading, setLoading] = useState(false);

    const isDefault = !profilePictureUrl || profilePictureUrl === DEFAULT_AVATAR;
    const userId = user?.id;

    // ── File selected → open cropper ──────────────────────────────────────────
    const handleFileChange = (e) => {
        const file = e.target.files?.[0];
        e.target.value = '';
        if (!file) return;
        if (!['image/png', 'image/jpeg'].includes(file.type)) {
            toast.error(t('Only PNG and JPEG images are accepted.'));
            return;
        }
        const reader = new FileReader();
        reader.onload = () => setRawSrc(reader.result);
        reader.readAsDataURL(file);
    };

    // ── Cropper confirmed → upload ────────────────────────────────────────────
    const handleCropConfirm = async (blob) => {
        setRawSrc(null);
        setLoading(true);
        onProgress?.();
        try {
            const formData = new FormData();
            formData.append('file', blob, 'avatar.png');
            const res = await AuthService.uploadProfilePicture(userId, formData);
            await getUserData();
            onUpdated?.(res.data?.profilePictureUrl);
            toast.success(t('Profile picture updated.'));
        } catch (err) {
            const msg = err?.response?.data?.detail ?? t('Failed to upload image.');
            toast.error(msg);
        } finally {
            setLoading(false);
        }
    };

    // ── Delete ────────────────────────────────────────────────────────────────
    const handleDelete = async () => {
        if (isDefault) return;
        setLoading(true);
        onProgress?.();
        try {
            await AuthService.deleteProfilePicture(userId);
            await getUserData();
            onUpdated?.(DEFAULT_AVATAR);
            toast.success(t('Profile picture removed.'));
        } catch {
            toast.error(t('Failed to remove profile picture.'));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="dae-root">
            {/* Avatar circle */}
            <div className={`dae-avatar-wrap${loading ? ' dae-avatar-wrap--loading' : ''}`}>
                <img
                    className="dae-avatar-img"
                    src={profilePictureUrl ?? DEFAULT_AVATAR}
                    alt="avatar"
                />
                {loading && (
                    <div className="dae-avatar-spinner">
                        <span className="spinner-border text-primary"/>
                    </div>
                )}
            </div>

            {/* Actions */}
            <div className="dae-actions">
                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/png,image/jpeg"
                    style={{display: 'none'}}
                    onChange={handleFileChange}
                />
                <button
                    className="btn btn-sm btn-light dae-btn"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={loading}
                >
                    <i className="font-icon lni lni-upload-2"/>
                    {t('Upload image')}
                </button>
                <button
                    className="btn btn-sm btn-light dae-btn dae-btn--danger"
                    onClick={handleDelete}
                    disabled={loading || isDefault}
                    title={isDefault ? t('Default avatar cannot be removed') : t('Remove profile picture')}
                >
                    <i className="font-icon lni lni-trash-3"/>
                    {t('Delete')}
                </button>
            </div>

            <p className="dae-hint">{t('PNG or JPEG · Max 500 KB · Square')}</p>

            {/* Crop modal */}
            {rawSrc && (
                <CropModal
                    src={rawSrc}
                    onCancel={() => setRawSrc(null)}
                    onConfirm={handleCropConfirm}
                />
            )}
        </div>
    );
};

DevTeamAvatarEditor.propTypes = {
    profilePictureUrl: PropTypes.string,
    onProgress: PropTypes.func,
    onUpdated: PropTypes.func,
};
