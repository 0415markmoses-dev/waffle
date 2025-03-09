import PropTypes from "prop-types";

export const Alert = ({
                          type = 'info',
                          children
                      }) => {
    return (
        <div className={`alert alert-${type}`}>
            {children}
        </div>
    )
}

Alert.propTypes = {
    type: PropTypes.oneOf(['info', 'success', 'warning', 'danger']),
    children: PropTypes.node
}
