import {useContext, useEffect, useState} from "react";
import {FormGroupContext} from "../FormGroupContext.jsx";
import PropTypes from "prop-types";

export const TextInput = ({
                              value = '',
                              onChange = () => {
                              },
                              type = 'text',
                              placeholder = '',
                              required = false,
                              leftIcon = null,   // lni class string, e.g. 'lni-search-1'
                              rightIcon = null,   // lni class string, e.g. 'lni-search-1'
                              clearable = false,  // shows × button when field has content
                              ...props
                          }) => {
    const {id, name} = useContext(FormGroupContext);
    const [value_, setValue] = useState(value);

    // Sync when parent resets the value (e.g. clear from outside)
    useEffect(() => {
        setValue(value);
    }, [value]);

    const handleUpdate = e => {
        setValue(e.target.value);
        onChange(e.target.value);
    };

    const handleClear = () => {
        setValue('');
        onChange('');
    };

    const showClear = clearable && value_.length > 0;
    const hasRight = showClear || rightIcon;
    const hasLeft = !!leftIcon;

    const input = (
        <input
            {...props}
            type={type}
            className={[
                'form-control',
                hasLeft ? 'text-input-has-left' : '',
                hasRight ? 'text-input-has-right' : '',
            ].filter(Boolean).join(' ')}
            id={id}
            name={name}
            value={value_}
            onChange={handleUpdate}
            placeholder={placeholder}
            required={required}
        />
    );

    if (!hasLeft && !hasRight) return input;

    return (
        <div className="text-input-wrapper">
            {hasLeft && (
                <div className="text-input-left">
                    <i className={`font-icon lni ${leftIcon} text-input-icon`}/>
                </div>
            )}
            {input}
            {hasRight && (
                <div className="text-input-right">
                    {showClear ? (
                        <button
                            type="button"
                            className="text-input-clear"
                            onClick={handleClear}
                            tabIndex={-1}
                            aria-label="Clear"
                        >
                            <i className="font-icon lni lni-xmark-circle"/>
                        </button>
                    ) : (
                        <i className={`font-icon lni ${rightIcon} text-input-icon`}/>
                    )}
                </div>
            )}
        </div>
    );
};

TextInput.propTypes = {
    value: PropTypes.string,
    onChange: PropTypes.func,
    type: PropTypes.string,
    placeholder: PropTypes.string,
    required: PropTypes.bool,
    leftIcon: PropTypes.string,
    rightIcon: PropTypes.string,
    clearable: PropTypes.bool,
};
