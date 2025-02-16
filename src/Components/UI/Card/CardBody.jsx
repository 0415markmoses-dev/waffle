import PropTypes from "prop-types";

export const CardBody = ({children}) => {
    return <div className="card-body gap-lg">
        {children}
    </div>
}

CardBody.propTypes = {
    children: PropTypes.node.isRequired,
}
