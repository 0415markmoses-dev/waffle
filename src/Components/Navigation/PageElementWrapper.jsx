import PropTypes from "prop-types";

export const PageElementWrapper = ({children}) => {
    return <div className="page-element-wrapper page-width">
        {children}
    </div>
}

PageElementWrapper.propTypes = {
    children: PropTypes.node.isRequired,
}
