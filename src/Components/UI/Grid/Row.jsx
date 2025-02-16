import PropTypes from "prop-types";

export const Row = ({children}) => {
    return <div className="row row-app">
        {children}
    </div>
}

Row.propTypes = {
    children: PropTypes.node.isRequired,
}
