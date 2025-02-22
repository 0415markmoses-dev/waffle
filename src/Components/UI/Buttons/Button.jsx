import PropTypes from "prop-types";
import classNames from "classnames";


export const Button = ({
                           type = 'primary',
                           fullWidth = false,
                           iconOnly = false,
                           outline = false,
                           icon = '',
                           iconPosition = 'left',
                           size = 'md',
                           onClick = () => {
                           },
                           disabled = false,
                           loading = false,
                           children = "-",
                           ...props
                       }) => {
    const btnOutlineType = outline ? '-outline' : '';

    const buttonClasses = classNames(
        "btn",
        `btn${btnOutlineType}-${type}`,
        `btn-${size}`,
        {
            "w-100": fullWidth,
            "btn-icon": iconOnly,
            "btn-with-icon": icon,
            "btn-with-icon-left": iconPosition === "left",
            "btn-with-icon-right": iconPosition === "right",
            "is-loading": loading,
        }
    );

    const loaderClasses = classNames(
        "btn-loader",
        {
            "is-loading": loading,
        }
    );

    const handleClick = () => {
        if (disabled || loading) {
            return;
        }
        onClick();
    }


    return (
        <button {...props} disabled={disabled} onClick={handleClick} className={buttonClasses}>
            <div data-intent="loader" aria-hidden="true" className={loaderClasses}>
                <div className="w-100">
                    {loading && (
                        <div className="spinner-border spinner-border-sm text-white" role="status">
                        </div>
                    )}
                </div>
            </div>
            {icon !== '' && iconPosition === "left" && (
                <i className={`font-icon lni btn-with-icon-${iconPosition} ${icon}`}></i>
            )}
            {children}
            {icon !== '' && iconPosition === "right" && (
                <i className={`font-icon lni btn-with-icon-${iconPosition} ${icon}`}></i>
            )}
        </button>
    );
}


Button.propTypes = {
    type: PropTypes.oneOf(['primary', 'secondary', 'success', 'danger', 'link',
        'warning', 'info', 'light', 'dark']),
    fullWidth: PropTypes.bool,
    iconOnly: PropTypes.bool,
    outline: PropTypes.bool,
    icon: PropTypes.string,
    iconPosition: PropTypes.oneOf(['left', 'right']),
    size: PropTypes.oneOf(['sm', 'md', 'lg']),
    onClick: PropTypes.func,
    disabled: PropTypes.bool,
    loading: PropTypes.bool,
    children: PropTypes.node.isRequired,
}
