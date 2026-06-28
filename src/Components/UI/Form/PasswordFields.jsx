import {useState, useCallback} from 'react';
import {useTranslation} from 'react-i18next';
import {Button} from '../Buttons/Button.jsx';

// ── Password generator ────────────────────────────────────────────────────────

const LOWER = 'abcdefghijklmnopqrstuvwxyz';
const UPPER = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const DIGITS = '0123456789';
const SYMBOLS = '!@#$%^&*()_+-=[]{}|;:,.<>?';

export function generatePassword(length, complexity) {
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
