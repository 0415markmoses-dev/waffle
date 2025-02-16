import PropTypes from "prop-types";

export const ModalBody = ({children}) => {
    return <div className="modal-body">
        <div className="w-100 h-100">
            {children}
        </div>
    </div>
}

ModalBody.propTypes = {
    children: PropTypes.node.isRequired,
}
