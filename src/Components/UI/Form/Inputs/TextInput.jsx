import {useContext, useState} from "react";
import {FormGroupContext} from "../FormGroupContext.jsx";
import PropTypes from "prop-types";

export const TextInput = ({
                              value = '',
                              onChange = () => {
                              },
                              type = 'text',
                              placeholder = '',
                              required = false,
                              ...props
                          }) => {
    const {id, name} = useContext(FormGroupContext);
    const [value_, setValue] = useState(value);

    const handleUpdate = e => {
        setValue(e.target.value);
        onChange(e.target.value);
    }

    return <input {...props} type={type} className="form-control" id={id} name={name} onChange={handleUpdate}
                  defaultValue={value}
                  placeholder={placeholder} required={required}/>
}

TextInput.propTypes = {
    value: PropTypes.string,
    onChange: PropTypes.func,
    type: PropTypes.string,
    placeholder: PropTypes.string,
    required: PropTypes.bool
}
