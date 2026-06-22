import {useState, useCallback, useEffect} from 'react';
import {createPortal} from 'react-dom';
import {useTranslation} from 'react-i18next';
import toast from 'react-hot-toast';
import {useUpdateUser} from '../../Hooks/queries/useUsersQuery.js';
import {Button} from '../UI/Buttons/Button.jsx';

// ── Password generator ────────────────────────────────────────────────────────

const LOWER = 'abcdefghijklmnopqrstuvwxyz';
const UPPER = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const DIGITS = '0123456789';
const SYMBOLS = '!@#$%^&*()_+-=[]{}|;:,.<>?';

function generatePassword(length, complexity) {
    // complexity 0 → 0% symbols, complexity 10 → 70% symbols
    const symbolRatio = (complexity / 10) * 0.70;
    const symbolCount = Math.floor(length * symbolRatio);
    const alphanumCount = length - symbolCount;

    const lowerCount = Math.floor(alphanumCount / 3);
    const upperCount = Math.floor(alphanumCount / 3);
    const digitCount = alphanumCount - lowerCount - upperCount;

    const pick = (charset, n) =>
        Array.from({length: n}, () => charset[Math.floor(Math.random() * charset.length)]);

    const chars = [
        ...pick(LOWER, lowerCount),
        ...pick(UPPER, upperCount),
        ...pick(DIGITS, digitCount),
        ...pick(SYMBOLS, symbolCount),
    ];

    // Fisher-Yates shuffle
    for (let i = chars.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [chars[i], chars[j]] = [chars[j], chars[i]];
    }

    return chars.join('');
}

// ── PasswordInput ─────────────────────────────────────────────────────────────

const PasswordInput = ({value, onChange, placeholder, disabled, id}) => {
    const [visible, setVisible] = useState(false);

    return (
        <div className="pwd-input-wrapper">
            <input
                id={id}
                type={visible ? 'text' : 'password'}
                className="form-control"
                placeholder={placeholder}
                value={value}
                onChange={e => onChange(e.target.value)}
                disabled={disabled}
                autoComplete="new-password"
            />
            <button
                type="button"
                className={`pwd-toggle-btn${visible ? ' is-visible' : ''}`}
                onClick={() => setVisible(v => !v)}
                tabIndex={-1}
                title={visible ? 'Hide' : 'Show'}
            >
                <i className="font-icon lni lni-eye"/>
            </button>
        </div>
    );
};

// ── Generator panel ───────────────────────────────────────────────────────────

const GeneratorPanel = ({onUse}) => {
    const {t} = useTranslation();
    const [length, setLength] = useState(16);
    const [complexity, setComplexity] = useState(5);
    const [preview, setPreview] = useState(() => generatePassword(16, 5));

    const regen = useCallback((len, cmp) => {
        setPreview(generatePassword(len, cmp));
    }, []);

    const handleLength = (v) => {
        setLength(v);
        regen(v, complexity);
    };

    const handleComplexity = (v) => {
        setComplexity(v);
        regen(length, v);
    };

    return (
        <div className="pwd-generator-panel">
            <div className="pwd-gen-preview">{preview}</div>

            <div className="pwd-gen-row">
                <label className="pwd-gen-label">
                    {t('Length')}: <strong>{length}</strong>
                </label>
                <input
                    type="range"
                    min={10} max={32} step={1}
                    value={length}
                    onChange={e => handleLength(Number(e.target.value))}
                    className="form-range"
                />
            </div>

            <div className="pwd-gen-row">
                <label className="pwd-gen-label">
                    {t('Complexity')}: <strong>{complexity}</strong>/10
                </label>
                <input
                    type="range"
                    min={0} max={10} step={1}
                    value={complexity}
                    onChange={e => handleComplexity(Number(e.target.value))}
                    className="form-range"
                />
            </div>

            <Button type="primary" size="sm" fullWidth onClick={() => onUse(preview)}>
                {t('Use this password')}
            </Button>
        </div>
    );
};

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
