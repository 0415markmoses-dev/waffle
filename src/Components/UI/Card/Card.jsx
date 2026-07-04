import PropTypes from "prop-types";
import classNames from "classnames";

export const Card = ({
                         className = '',
                         onClick = () => {
                         },
                         interractive = false,
                         active = false,
                         isAppCard = false,
                         children,
                         ...props
                     }) => {


    const cardClasses = classNames(
        "card",
        "h-100",
        className,
        {
            "border-1 border-primary": active,
            "cursor-pointer": interractive,
            "card--app": isAppCard,
        }
    );

    return <div {...props} onClick={onClick} className={cardClasses}>
        {children}
    </div>
}

Card.propTypes = {
    className: PropTypes.string,
    onClick: PropTypes.func,
    interractive: PropTypes.bool,
    active: PropTypes.bool,
    isAppCard: PropTypes.bool,
    children: PropTypes.node.isRequired,
}
