import PropTypes from "prop-types";

export const Tab = ({
                        title = '',
                        name = '',
                        icon = '',
                        badge = undefined,
                        active = false,
                        children,
                    }) => {
    return <div data-name={name} data-title={title} data-icon={icon} data-default-active={active}
                className={`tab-content`}>
        {children}
    </div>
}

Tab.propTypes = {
    title: PropTypes.string,
    name: PropTypes.string,
    icon: PropTypes.string,
    badge: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    active: PropTypes.bool,
    children: PropTypes.node
}
