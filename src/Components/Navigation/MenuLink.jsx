import PropTypes from "prop-types";
import {useNavigate} from "react-router";


export const MenuLink = ({to, children, ...props}) => {
    let navigate = useNavigate();
    const handleClick = e => {
        e.preventDefault();
        console.log('MenuLink::handleClick', e);
        navigate(to);
    }
    return <a onClick={handleClick} href={to} {...props} >{children}</a>
}

MenuLink.propTypes = {
    to: PropTypes.string.isRequired,
    children: PropTypes.node.isRequired,
}
