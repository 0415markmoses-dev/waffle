import PropTypes from "prop-types";

export const Row = ({children, className = '', ...props}) => {
    return <div {...props} className={"row row-app " + className}>
        {children}
    </div>
}

Row.propTypes = {
    children: PropTypes.node.isRequired,
    className: PropTypes.string,
}
