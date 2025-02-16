import PropTypes from "prop-types";

export const Card = ({children}) => {
    return <div className="card h-100">
        {children}
    </div>
}

Card.propTypes = {
    children: PropTypes.node.isRequired,
}
