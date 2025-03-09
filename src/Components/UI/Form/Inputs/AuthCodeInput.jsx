import PropTypes from "prop-types";
import {useEffect, useState} from "react";

export const AuthCodeInput = ({
                                  codeLength = 1,
                                  onChange = () => {
                                  },
                              }) => {
    const [id, setId] = useState('');
    const [values, setValues] = useState([]);
    const [inputs, setInputs] = useState(null);

    useEffect(() => {
        setId(Math.random().toString(36).substring(7));
    }, []);

    useEffect(() => {
        const newInputs = Array.from({length: codeLength}, (_, i) => ({
            id: i,
            code: Math.random().toString(36).substring(7),
        }));
        setInputs(newInputs); // Correctly setting the inputs
    }, [codeLength]);

    useEffect(() => {
        // call the onChange function with the new code
        onChange(values.join(''));
    }, [onChange, values]);
    const handlePaste = (e) => {
        e.preventDefault();
        let paste = (e.clipboardData || window.clipboardData).getData('text');
        let newValues = [...values];
        let pasteValues = paste.split('');
        for (let i = 0; i < pasteValues.length; i++) {
            //newValues[i] = pasteValues[i];
            // get element by id and set the value
            let input = document.getElementById(id + '-auth-input-' + i);
            if (input !== null) {
                input.value = pasteValues[i];
                newValues[i] = pasteValues[i];
            }
        }
        setValues(newValues);
    }

    if (inputs === null) {
        return <></>
    }

    return <div className="auth-code-input">
        {inputs.map((el) => {
            return <input
                key={'auth-input-' + el.id + el.code}
                data-key={el.code}
                id={id + '-auth-input-' + el.id}
                data-auth-field="true"
                data-auth-code-input={el.id}
                pattern="[0-9]{1}"
                type="text"
                maxLength={1}
                onPaste={handlePaste}
                onFocus={(e) => {
                    // select all content on focus
                    setTimeout(() => {
                        e.target.select();
                    }, 20);

                }}
                onKeyDown={(e) => {
                    // if shift is on, return;
                    if (e.shiftKey) {
                        return;
                    }

                    // if right arrow
                    if (e.keyCode === 39) {
                        let nextInput = document.querySelector(`[data-auth-code-input="${el.id + 1}"]`);
                        if (nextInput !== null) {
                            nextInput.focus();
                        }
                    }
                    // if left arrow
                    if (e.keyCode === 37) {
                        let prevInput = document.querySelector(`[data-auth-code-input="${el.id - 1}"]`);
                        if (prevInput !== null) {
                            prevInput.focus();
                        }
                    }

                }}
                onChange={(e) => {
                    // if the input is empty, focus on the previous input
                    if (e.target.value === '') {
                        if (el.id > 0) {
                            // simulate shift+tab using a selector data-auth-code-input
                            let prevInput = document.querySelector(`[data-auth-code-input="${el.id - 1}"]`);
                            if (prevInput !== null) {
                                prevInput.focus();
                            }
                        }
                    } else {
                        // if the input is not empty, focus on the next input
                        if (el.id < length - 1) {
                            // simulate tab using a selector data-auth-code-input
                            let nextInput = document.querySelector(`[data-auth-code-input="${el.id + 1}"]`);
                            if (nextInput !== null) {
                                nextInput.focus();
                            }
                        }
                    }

                    // update the values state
                    let newValues = [...values];
                    newValues[el.id] = e.target.value;
                    setValues(newValues);
                }}
            />
        })}
    </div>
}

AuthCodeInput.propTypes = {
    codeLength: PropTypes.number,
    onChange: PropTypes.func
}
