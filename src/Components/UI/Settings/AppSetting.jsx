import PropTypes from 'prop-types';

/**
 * AppSetting — a single settings row.
 *
 * `value` is always a string (in and out).
 * `type` only affects the UI control rendered:
 *   'string'  → text input
 *   'text'    → textarea
 *   'integer' → number input, step 1,  returns Math.trunc stringified
 *   'decimal' → number input, step 0.5, returns parseFloat stringified
 *   'boolean' → toggle switch, returns 'true' | 'false'
 */
export const AppSetting = ({
                               name,
                               section,
                               label,
                               description,
                               type = 'string',
                               value = '',
                               onChange = () => {
                               },
                           }) => {
    const inputId = `app-setting-${section}-${name}`;

    const handleChange = (raw) => {
        let out = raw;
        if (type === 'integer') {
            const n = parseInt(raw, 10);
            out = isNaN(n) ? '' : String(n);
        } else if (type === 'decimal') {
            const n = parseFloat(raw);
            out = isNaN(n) ? '' : String(n);
        }
        onChange(out);
    };

    const renderInput = () => {
        if (type === 'boolean') {
            return (
                <div className="app-setting-toggle">
                    <div className="form-check form-switch mb-0">
                        <input
                            id={inputId}
                            type="checkbox"
                            className="form-check-input app-setting-toggle-input"
                            checked={value === 'true'}
                            onChange={e => onChange(e.target.checked ? 'true' : 'false')}
                        />
                    </div>
                </div>
            );
        }
        if (type === 'text') {
            return (
                <textarea
                    id={inputId}
                    className="form-control app-setting-textarea"
                    value={value}
                    rows={4}
                    onChange={e => handleChange(e.target.value)}
                />
            );
        }
        if (type === 'integer') {
            return (
                <input
                    id={inputId}
                    type="number"
                    className="form-control app-setting-input"
                    value={value}
                    step={1}
                    onChange={e => handleChange(e.target.value)}
                />
            );
        }
        if (type === 'decimal') {
            return (
                <input
                    id={inputId}
                    type="number"
                    className="form-control app-setting-input"
                    value={value}
                    step={0.5}
                    onChange={e => handleChange(e.target.value)}
                />
            );
        }
        // default: 'string'
        return (
            <input
                id={inputId}
                type="text"
                className="form-control app-setting-input"
                value={value}
                onChange={e => handleChange(e.target.value)}
            />
        );
    };

    return (
        <div className="app-setting">
            <div className="app-setting-meta">
                <label htmlFor={inputId} className="app-setting-label">{label}</label>
                {description && (
                    <p className="app-setting-description">{description}</p>
                )}
            </div>
            <div className="app-setting-control">
                {renderInput()}
            </div>
        </div>
    );
};

AppSetting.propTypes = {
    name: PropTypes.string.isRequired,
    section: PropTypes.string.isRequired,
    label: PropTypes.string.isRequired,
    description: PropTypes.string,
    type: PropTypes.oneOf(['string', 'text', 'integer', 'decimal', 'boolean']),
    value: PropTypes.string,
    onChange: PropTypes.func,
};
