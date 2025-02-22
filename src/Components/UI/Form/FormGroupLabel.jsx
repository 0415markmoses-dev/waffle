import PropTypes from "prop-types";
import {useContext} from "react";
import {FormGroupContext} from "./FormGroupContext.jsx";

export const FormGroupLabel = ({children, className = ''}) => {
    const {id} = useContext(FormGroupContext);

    return <label htmlFor={id} className={"form-label " + className}>
        {children}
    </label>
}

FormGroupLabel.propTypes = {
    children: PropTypes.node.isRequired,
    className: PropTypes.string
}
