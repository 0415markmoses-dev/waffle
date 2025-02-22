import PropTypes from "prop-types";
import {useEffect, useState} from "react";
import {FormGroupContext as FormGroupContext1} from "./FormGroupContext.jsx";


export const FormGroup = ({
                              children,
                              className = ''
                          }) => {
    const [id, setId] = useState('');

    useEffect(() => {
        if (id === '') {
            setId('form_element_' + Math.random().toString(36).substring(2));
        }
    }, [id]);

    return <div className={"form-group " + className}>
        <FormGroupContext1 value={{id: id, setId: setId}}>
            {children}
        </FormGroupContext1>
    </div>
}

FormGroup.propTypes = {
    children: PropTypes.node.isRequired,
    className: PropTypes.string
}
