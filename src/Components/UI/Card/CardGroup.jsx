import PropTypes from "prop-types";

export const CardGroup = ({children, className = ''}) => {
    return <div className={"card-body card-group gap-lg " + className}>
        {children}
    </div>
}

CardGroup.propTypes = {
    children: PropTypes.node.isRequired,
    className: PropTypes.string
}
