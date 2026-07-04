import {useCallback, useRef, useState} from 'react';
import {createPortal} from 'react-dom';
import Cropper from 'react-easy-crop';
import {useTranslation} from 'react-i18next';
import toast from 'react-hot-toast';
import PropTypes from 'prop-types';
import {useQueryClient} from '@tanstack/react-query';
import ProjectService from '../../Services/PrivateApi/ProjectService.js';
import {projectKeys} from '../../Hooks/queries/useProjectsQuery.js';

const MAX_SIDE = 1024;
const MAX_BYTES = 1024 * 1024;
const BANNER_ASPECT = 16 / 5;

async function getCroppedBlob(imageSrc, pixelCrop) {
    const image = await new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = reject;
        img.src = imageSrc;
    });
    const scale = Math.min(1, MAX_SIDE / Math.max(pixelCrop.width, pixelCrop.height));
    const w = Math.round(pixelCrop.width * scale);
    const h = Math.round(pixelCrop.height * scale);
    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    canvas.getContext('2d').drawImage(
        image,
        pixelCrop.x, pixelCrop.y, pixelCrop.width, pixelCrop.height,
        0, 0, w, h,
    );
    return new Promise((resolve, reject) =>
        canvas.toBlob(blob => blob ? resolve(blob) : reject(new Error('toBlob failed')), 'image/png'),
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
            <div className="dae-crop-modal pbe-crop-modal">
                <div className="dae-crop-area pbe-crop-area">
                    <Cropper
                        image={src}
                        crop={crop}
                        zoom={zoom}
                        aspect={BANNER_ASPECT}
                        onCropChange={setCrop}
                        onZoomChange={setZoom}
                        onCropComplete={onCropComplete}
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

// ── ProjectBannerEditor ───────────────────────────────────────────────────────

export const ProjectBannerEditor = ({projectId, projectBannerUrl}) => {
    const {t} = useTranslation();
    const queryClient = useQueryClient();
    const fileInputRef = useRef(null);
    const [rawSrc, setRawSrc] = useState(null);
    const [loading, setLoading] = useState(false);

    const isEmpty = !projectBannerUrl;

    const invalidate = () => queryClient.invalidateQueries({queryKey: projectKeys.detail(projectId)});

    const handleFileChange = (e) => {
        const file = e.target.files?.[0];
        e.target.value = '';
        if (!file) return;
        if (file.type !== 'image/png') {
            toast.error(t('Only PNG images are accepted for the banner.'));
            return;
        }
        const reader = new FileReader();
        reader.onload = () => setRawSrc(reader.result);
        reader.readAsDataURL(file);
    };

    const handleCropConfirm = async (blob) => {
        setRawSrc(null);
        setLoading(true);
        try {
            const formData = new FormData();
            formData.append('file', blob, 'project-banner.png');
            await ProjectService.uploadProjectBanner(projectId, formData);
            await invalidate();
            toast.success(t('Project banner updated.'));
        } catch (err) {
            toast.error(err?.response?.data?.detail ?? t('Failed to upload banner.'));
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (isEmpty) return;
        setLoading(true);
        try {
            await ProjectService.deleteProjectBanner(projectId);
            await invalidate();
            toast.success(t('Project banner removed.'));
        } catch {
            toast.error(t('Failed to remove project banner.'));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="pbe-root">
            <div className={`pbe-preview${loading ? ' pbe-preview--loading' : ''}`}>
                {projectBannerUrl
                    ? <img src={projectBannerUrl} alt="banner"/>
                    : (
                        <div className="pbe-placeholder">
                            <i className="font-icon lni lni-image"/>
                        </div>
                    )
                }
                {loading && (
                    <div className="pbe-spinner">
                        <span className="spinner-border text-primary"/>
                    </div>
                )}
            </div>

            <div className="pbe-actions">
                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/png"
                    style={{display: 'none'}}
                    onChange={handleFileChange}
                />
                <button
                    className="btn btn-sm btn-light dae-btn"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={loading}
                >
                    <i className="font-icon lni lni-upload-2"/>
                    {t('Upload banner')}
                </button>
                <button
                    className="btn btn-sm btn-light dae-btn dae-btn--danger"
                    onClick={handleDelete}
                    disabled={loading || isEmpty}
                >
                    <i className="font-icon lni lni-trash-3"/>
                    {t('Delete')}
                </button>
            </div>

            <p className="dae-hint">{t('PNG only · Max 1 MB · Max 1024 px on either side')}</p>

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

ProjectBannerEditor.propTypes = {
    projectId: PropTypes.string.isRequired,
    projectBannerUrl: PropTypes.string,
};
