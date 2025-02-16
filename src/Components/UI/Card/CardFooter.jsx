import PropTypes from "prop-types";

export const CardFooter = ({
                               children
                           }) => {
    return <div className="card-footer w-100 gap-lg d-flex heading">
        {children}
    </div>
}

CardFooter.propTypes = {
    children: PropTypes.node.isRequired,
}
