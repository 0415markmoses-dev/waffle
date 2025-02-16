import PropTypes from "prop-types";
import classNames from "classnames";

export const Col = ({
                        size = 12,
                        sm = 0,
                        md = 0,
                        lg = 0,
                        xl = 0,
                        fullHeight = false,
                        children,
                    }) => {
    const componentClasses = classNames(
        "col",
        `col-${size}`,
        {
            "h-fit": !fullHeight,
        }
    );
    let otherClasses = '';
    if (sm > 0 && sm <= 12) otherClasses += ` col-sm-${sm}`;
    if (md > 0 && md <= 12) otherClasses += ` col-md-${md}`;
    if (lg > 0 && lg <= 12) otherClasses += ` col-lg-${lg}`;
    if (xl > 0 && xl <= 12) otherClasses += ` col-xl-${xl}`;

    return <div className={componentClasses + otherClasses}>
        {children}
    </div>
}

Col.propTypes = {
    size: PropTypes.number,
    sm: PropTypes.number,
    md: PropTypes.number,
    lg: PropTypes.number,
    xl: PropTypes.number,
    fullHeight: PropTypes.bool,
    children: PropTypes.node.isRequired,
}
