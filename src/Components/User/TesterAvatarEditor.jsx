import {useState} from 'react';
import {createPortal} from 'react-dom';
import {useTranslation} from 'react-i18next';
import toast from 'react-hot-toast';
import PropTypes from 'prop-types';
import TestersService from '../../Services/PrivateApi/TestersService.js';
import {useAuthStore} from '../../Store/auth.js';

const DEFAULT_AVATAR = '/assets/gator_avatar.png';

const AVATARS = [
    '/assets/avatars/bear.png',
    '/assets/avatars/bunny.png',
    '/assets/avatars/cat.png',
    '/assets/avatars/dark_girl.png',
    '/assets/avatars/dark_guy.png',
    '/assets/avatars/dog.png',
    '/assets/avatars/fox.png',
    '/assets/avatars/frog.png',
    '/assets/avatars/green_guy.png',
    '/assets/avatars/green_guy2.png',
    '/assets/avatars/green_white_guy.png',
    '/assets/avatars/hib.png',
    '/assets/avatars/koala.png',
    '/assets/avatars/lion.png',
    '/assets/avatars/monkey.png',
    '/assets/avatars/panda.png',
    '/assets/avatars/pinguin.png',
    '/assets/avatars/pink_girl.png',
    '/assets/avatars/raccoon.png',
    '/assets/avatars/reindeer.png',
    '/assets/avatars/sheep.png',
    '/assets/avatars/tiger.png',
    '/assets/avatars/white_girl.png',
    '/assets/avatars/yellow_girl.png',
];

// ── AvatarPickerModal ─────────────────────────────────────────────────────────

const AvatarPickerModal = ({current, onCancel, onApply}) => {
    const {t} = useTranslation();
    const [selected, setSelected] = useState(current ?? null);

    return createPortal(
        <div className="tae-picker-overlay">
            <div className="tae-picker-modal">
                <div className="tae-picker-header">
                    <span className="tae-picker-title">{t('Choose an avatar')}</span>
                </div>
                <div className="tae-picker-grid">
                    {AVATARS.map(src => (
                        <button
                            key={src}
                            type="button"
                            className={`tae-picker-item${selected === src ? ' tae-picker-item--selected' : ''}`}
                            onClick={() => setSelected(src)}
                        >
                            <img src={src} alt={src.split('/').pop().replace('.png', '')}/>
                            {selected === src && (
                                <div className="tae-picker-check">
                                    <i className="font-icon lni lni-check"/>
                                </div>
                            )}
                        </button>
                    ))}
                </div>
                <div className="tae-picker-footer">
                    <button className="btn btn-light btn-sm" onClick={onCancel}>
                        {t('Cancel')}
                    </button>
                    <button
                        className="btn btn-primary btn-sm"
                        onClick={() => selected && onApply(selected)}
                        disabled={!selected || selected === current}
                    >
                        <i className="font-icon lni lni-check me-1"/>
                        {t('Apply')}
                    </button>
                </div>
            </div>
        </div>,
        document.body,
    );
};

// ── TesterAvatarEditor ────────────────────────────────────────────────────────

export const TesterAvatarEditor = ({profilePictureUrl, onUpdated}) => {
    const {t} = useTranslation();
    const {user, getUserData} = useAuthStore();
    const [pickerOpen, setPickerOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    const isDefault = !profilePictureUrl || profilePictureUrl === DEFAULT_AVATAR;
    const userId = user?.id;

    const handleApply = async (relativePath) => {
        setPickerOpen(false);
        setLoading(true);
        // Build absolute URL as required by the API
        const url = `${window.location.origin}${relativePath}`;
        try {
            await TestersService.setProfilePicture(userId, url);
            await getUserData();
            onUpdated?.(url);
            toast.success(t('Avatar updated.'));
        } catch {
            toast.error(t('Failed to update avatar.'));
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        setLoading(true);
        try {
            await TestersService.deleteProfilePicture(userId);
            await getUserData();
            onUpdated?.(DEFAULT_AVATAR);
            toast.success(t('Avatar removed.'));
        } catch {
            toast.error(t('Failed to remove avatar.'));
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
                <button
                    className="btn btn-sm btn-light dae-btn"
                    onClick={() => setPickerOpen(true)}
                    disabled={loading}
                >
                    <i className="font-icon lni lni-image-gallery"/>
                    {t('Select image')}
                </button>
                <button
                    className="btn btn-sm btn-light dae-btn dae-btn--danger"
                    onClick={handleDelete}
                    disabled={loading || isDefault}
                    title={isDefault ? t('Default avatar cannot be removed') : t('Remove avatar')}
                >
                    <i className="font-icon lni lni-trash-3"/>
                    {t('Delete')}
                </button>
            </div>

            {/* Picker modal */}
            {pickerOpen && (
                <AvatarPickerModal
                    current={profilePictureUrl}
                    onCancel={() => setPickerOpen(false)}
                    onApply={handleApply}
                />
            )}
        </div>
    );
};

TesterAvatarEditor.propTypes = {
    profilePictureUrl: PropTypes.string,
    onUpdated: PropTypes.func,
};
