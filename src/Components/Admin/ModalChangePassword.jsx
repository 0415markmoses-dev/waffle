import {useState, useEffect} from 'react';
import {createPortal} from 'react-dom';
import {useTranslation} from 'react-i18next';
import toast from 'react-hot-toast';
import {useUpdateUser} from '../../Hooks/queries/useUsersQuery.js';
import {Button} from '../UI/Buttons/Button.jsx';
import {PasswordInput, GeneratorPanel} from '../UI/Form/PasswordFields.jsx';

// ── ModalChangePassword ───────────────────────────────────────────────────────

export const ModalChangePassword = ({user, onClose}) => {
    const {t} = useTranslation();
    const updateUser = useUpdateUser();

    const [newPwd, setNewPwd] = useState('');
    const [confirmPwd, setConfirmPwd] = useState('');
    const [genOpen, setGenOpen] = useState(false);

    // Close generator whenever the first field gets a value
    useEffect(() => {
        if (newPwd) setGenOpen(false);
    }, [newPwd]);

    const mismatch = newPwd && confirmPwd && newPwd !== confirmPwd;
    const canSave = newPwd && confirmPwd && newPwd === confirmPwd && !updateUser.isPending;

    const handleSave = () => {
        if (!canSave) return;
        updateUser.mutate(
            {id: user.id, data: {plainPassword: newPwd}},
            {
                onSuccess: () => {
                    toast.success(t('Password updated.'));
                    onClose();
                },
                onError: () => toast.error(t('Failed to update password.')),
            }
        );
    };

    const handleUseGenerated = (pwd) => {
        setNewPwd(pwd);
        setConfirmPwd(pwd);
        setGenOpen(false);
    };

    return createPortal(
        <div className="pwd-modal-overlay" onClick={onClose}>
            <div className="pwd-modal-card" onClick={e => e.stopPropagation()}>

                {/* Header */}
                <div className="pwd-modal-header">
                    <span className="pwd-modal-title">{t('Change password')}</span>
                    <em className="pwd-modal-email">{user.email}</em>
                </div>

                {/* Body */}
                <div className="pwd-modal-body">

                    {/* New password */}
                    <div className="pwd-field-group">
                        <label className="pwd-field-label" htmlFor="pwd-new">
                            {t('New password')}
                        </label>
                        <PasswordInput
                            id="pwd-new"
                            value={newPwd}
                            onChange={setNewPwd}
                            placeholder="••••••••"
                            disabled={updateUser.isPending}
                        />

                        {/* Generate password toggle — only when field is empty */}
                        {!newPwd && (
                            <button
                                type="button"
                                className="pwd-gen-toggle-btn"
                                onClick={() => setGenOpen(o => !o)}
                            >
                                <i className="font-icon lni lni-shuffle"/>
                                {t('Generate password')}
                                <i className={`font-icon lni ${genOpen ? 'lni-chevron-up' : 'lni-chevron-down'}`}/>
                            </button>
                        )}

                        {genOpen && !newPwd && (
                            <GeneratorPanel onUse={handleUseGenerated}/>
                        )}
                    </div>

                    {/* Confirm password */}
                    <div className="pwd-field-group">
                        <label className="pwd-field-label" htmlFor="pwd-confirm">
                            {t('Confirm password')}
                        </label>
                        <PasswordInput
                            id="pwd-confirm"
                            value={confirmPwd}
                            onChange={setConfirmPwd}
                            placeholder="••••••••"
                            disabled={updateUser.isPending}
                        />
                        {mismatch && (
                            <span className="pwd-mismatch-msg">{t('Passwords do not match.')}</span>
                        )}
                    </div>
                </div>

                {/* Footer */}
                <div className="pwd-modal-footer">
                    <Button type="default" onClick={onClose} disabled={updateUser.isPending}>
                        {t('Cancel')}
                    </Button>
                    <Button
                        type="primary"
                        icon="lni-floppy-disk-1"
                        onClick={handleSave}
                        disabled={!canSave}
                        loading={updateUser.isPending}
                    >
                        {t('Save')}
                    </Button>
                </div>
            </div>
        </div>,
        document.body
    );
};
