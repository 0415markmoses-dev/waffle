import {useState, useEffect} from 'react';
import PropTypes from "prop-types";

const CustomParamValueRange = ({
                                   label,
                                   value,
                                   defaultValue = undefined,
                                   max = 2,
                                   min = 0,
                                   step = 0.05,
                                   onChange = () => {
                                   },
                               }) => {
    const [enabled, setEnabled] = useState(value !== undefined);
    const [internalValue, setInternalValue] = useState(value ?? min);

    // Intentionally excludes `onChange` — it's a prop the caller may pass as a
    // new inline function on every render, and this effect must only fire when
    // the actual value changes, not on every parent re-render.
    useEffect(() => {
        if (!enabled) {
            onChange(undefined);
        } else {
            onChange(internalValue);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [enabled, internalValue]);

    const handleCheckboxChange = (e) => {
        const isChecked = e.target.checked;
        setEnabled(isChecked);
        if (!isChecked) {
            onChange(undefined);
        } else {
            onChange(internalValue);
        }
    };

    const handleInputChange = (e) => {
        const val = parseFloat(e.target.value);
        if (!isNaN(val)) {
            setInternalValue(val);
        }
    };

    const handleSliderChange = (e) => {
        const val = parseFloat(e.target.value);
        setInternalValue(val);
    };

    return (
        <div className="mb-3">
            <label className="form-label d-flex justify-content-between align-items-center">
                <span>{label}</span>
                <div className="form-check form-switch ms-2">
                    <input
                        className="form-check-input"
                        type="checkbox"
                        checked={enabled}
                        onChange={handleCheckboxChange}
                    />
                </div>
                {enabled || defaultValue !== undefined ? (
                    <input
                        type="number"
                        className="form-control form-control-sm ms-2"
                        style={{width: '100px'}}
                        value={enabled ? internalValue : defaultValue}
                        readOnly={!enabled}
                        onChange={enabled ? handleInputChange : undefined}
                    />
                ) : null}
            </label>

            {enabled && (
                <input
                    type="range"
                    className="form-range mt-2"
                    min={min}
                    max={max}
                    step={step}
                    value={internalValue}
                    onChange={handleSliderChange}
                />
            )}
        </div>
    );
};

CustomParamValueRange.propTypes = {
    label: PropTypes.string.isRequired,
    value: PropTypes.number,
    defaultValue: PropTypes.number,
    max: PropTypes.number,
    min: PropTypes.number,
    step: PropTypes.number,
    onChange: PropTypes.func.isRequired,
}

export default CustomParamValueRange;
