import PropTypes from "prop-types";

export const ModalFooter = ({children}) => {
    return <div className="modal-footer">
        {children}
    </div>
}

ModalFooter.propTypes = {
    children: PropTypes.node.isRequired,
}
