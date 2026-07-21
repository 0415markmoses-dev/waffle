import {useState, useCallback} from 'react';
import {useTranslation} from 'react-i18next';
import {Button} from '../Buttons/Button.jsx';
import {generatePassword} from './generatePassword.js';

// ── PasswordInput ─────────────────────────────────────────────────────────────

export const PasswordInput = ({value, onChange, placeholder, disabled, id}) => {
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

// ── GeneratorPanel ────────────────────────────────────────────────────────────

export const GeneratorPanel = ({onUse}) => {
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
