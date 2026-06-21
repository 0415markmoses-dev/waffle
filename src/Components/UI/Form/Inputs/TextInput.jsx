import {useContext, useEffect, useRef, useState} from "react";
import {createPortal} from "react-dom";
import {FormGroupContext} from "../FormGroupContext.jsx";
import PropTypes from "prop-types";

export const TextInput = ({
                              value = '',
                              onChange = () => {
                              },
                              type = 'text',
                              placeholder = '',
                              required = false,
                              leftIcon = null,
                              rightIcon = null,
                              clearable = false,
                              // Autocomplete
                              hasAutocomplete = false,
                              autocompleteList = [],
                              onSelectAutocompleteItem = () => {
                              },
                              maxAutocompleteItemsDisplay = 5,
                              ...props
                          }) => {
    const {id, name} = useContext(FormGroupContext);
    const [value_, setValue] = useState(value);
    const [dropdownRect, setDropdownRect] = useState(null);
    const wrapperRef = useRef(null);

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

    const handleSelect = (item) => {
        onSelectAutocompleteItem(item);
    };

    // Measure input position whenever the dropdown list changes
    const visibleItems = autocompleteList.slice(0, maxAutocompleteItemsDisplay);
    const showDropdown = hasAutocomplete && visibleItems.length > 0;

    useEffect(() => {
        if (showDropdown && wrapperRef.current) {
            const r = wrapperRef.current.getBoundingClientRect();
            setDropdownRect({
                top: r.bottom + window.scrollY + 4,
                left: r.left + window.scrollX,
                width: r.width,
            });
        }
    }, [showDropdown, autocompleteList]);

    const showClear = clearable && value_.length > 0;
    const hasRight = showClear || rightIcon;
    const hasLeft = !!leftIcon;

    const input = (
        <input
            {...props}
            ref={!hasLeft && !hasRight ? wrapperRef : undefined}
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

    const wrappedInput = (!hasLeft && !hasRight) ? input : (
        <div className="text-input-wrapper" ref={wrapperRef}>
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

    // Wrap in a ref div when there are no icons (so we can still measure position)
    const rootEl = (!hasLeft && !hasRight)
        ? <div ref={wrapperRef}>{input}</div>
        : wrappedInput;

    return (
        <>
            {rootEl}
            {showDropdown && dropdownRect && createPortal(
                <div
                    className="text-input-autocomplete"
                    style={{
                        position: 'absolute',
                        top: dropdownRect.top,
                        left: dropdownRect.left,
                        width: dropdownRect.width,
                        zIndex: 99999,
                    }}
                >
                    {visibleItems.map((item, i) => (
                        <div
                            key={item.value ?? i}
                            className="text-input-autocomplete-item"
                            onMouseDown={(e) => e.preventDefault()}
                            onClick={() => handleSelect(item)}
                        >
                            {item.label}
                        </div>
                    ))}
                </div>,
                document.body
            )}
        </>
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
    hasAutocomplete: PropTypes.bool,
    autocompleteList: PropTypes.arrayOf(PropTypes.shape({
        value: PropTypes.any,
        label: PropTypes.node,
    })),
    onSelectAutocompleteItem: PropTypes.func,
    maxAutocompleteItemsDisplay: PropTypes.number,
};
