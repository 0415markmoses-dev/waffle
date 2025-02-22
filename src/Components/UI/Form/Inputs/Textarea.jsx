import {useContext, useState} from "react";
import {FormGroupContext} from "../FormGroupContext.jsx";
import PropTypes from "prop-types";

export const Textarea = ({
                             value = '',
                             onChange = () => {
                             },
                             placeholder = '',
                             required = false,
                             rows = 6,
                             ...props
                         }) => {
    const {id, name} = useContext(FormGroupContext);
    const [value_, setValue] = useState(value);

    const handleUpdate = e => {
        setValue(e.target.value);
        onChange(e.target.value);
    }

    return <textarea {...props} className="form-control" id={id} name={name} defaultValue={value_}
                     onChange={handleUpdate} rows={rows}
                     placeholder={placeholder} required={required}/>
}

Textarea.propTypes = {
    value: PropTypes.string,
    onChange: PropTypes.func,
    placeholder: PropTypes.string,
    required: PropTypes.bool,
    rows: PropTypes.number
}
