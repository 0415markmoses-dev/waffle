import PropTypes from "prop-types";

export const ModalHeader = ({
                                title = '',
                                subtitle = '',
                            }) => {
    return <div className="modal-header gap-sm">
        <h5 className="modal-title">{title}</h5>
        {subtitle !== '' && <div className="modal-subtitle text-muted small">{subtitle}</div>}
    </div>
}

ModalHeader.propTypes = {
    title: PropTypes.string,
    subtitle: PropTypes.string,
}
