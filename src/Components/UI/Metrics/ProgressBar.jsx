import PropTypes from "prop-types";

export const ProgressBar = ({
                                value = 0,
                                min = 0,
                                max = 100,
                                type = 'primary',
                            }) => {
    const classes = 'progress-bar bg-' + type;
    const computedValueInPercent = (value - min) / (max - min) * 100;
    return <div className="progress">
        <div className={classes} role="progressbar" aria-valuenow={value} aria-valuemin={min}
             style={{width: computedValueInPercent + '%'}}
             aria-valuemax={max}></div>
    </div>
}

ProgressBar.propTypes = {
    value: PropTypes.number,
    min: PropTypes.number,
    max: PropTypes.number,
    // type is enum
    type: PropTypes.oneOf(['primary', 'secondary', 'success', 'danger', 'warning', 'info', 'light', 'dark']),
}
