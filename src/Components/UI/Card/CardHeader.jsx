import PropTypes from "prop-types";

export const CardHeader = ({
                               title = '',
                               children
                           }) => {
    return <div className="card-header w-100 gap-lg d-flex justify-content-between align-items-center">
        <div className="card-header-left">
            <h3 className="card-title m-0">{title}</h3>
        </div>
        <div className="card-header-right">
            {children}
        </div>
    </div>
}

CardHeader.propTypes = {
    title: PropTypes.string,
    children: PropTypes.node.isRequired,
}
