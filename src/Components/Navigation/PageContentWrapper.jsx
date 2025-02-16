import PropTypes from "prop-types";

export const PageContentWrapper = ({children}) => {
    return <div className="page-content-wrapper">
        {children}
    </div>
}

PageContentWrapper.propTypes = {
    children: PropTypes.node.isRequired,
}
