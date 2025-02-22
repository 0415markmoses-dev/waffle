import PropTypes from "prop-types";


export const FormGroupWrapper = ({
                                     children,
                                     className = ''
                                 }) => {

    return <div className={"form-group-wrapper w-100 d-flex flex-column gap-lg" + className}>
        {children}
    </div>
}

FormGroupWrapper.propTypes = {
    children: PropTypes.node.isRequired,
    className: PropTypes.string
}
