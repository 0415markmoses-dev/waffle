import PropTypes from "prop-types";

export const SingleMetricDisplay = ({
                                        value = 0,
                                        label = "",
                                        prefix = '',
                                        suffix = '',
                                    }) => {
    return <div className="metric-display flex-grow-0 d-flex flex-column">
        <div className="metric-value text-center heading fs-3 fw-bolder">
            {prefix}{value}{suffix}
        </div>
        <div className="metric-label text-center text-muted heading fs-6">
            {label}
        </div>
    </div>
}

SingleMetricDisplay.propTypes = {
    value: PropTypes.number,
    label: PropTypes.string,
    prefix: PropTypes.string,
    suffix: PropTypes.string,
}
