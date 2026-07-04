import PropTypes from "prop-types";
import {ErrorPage} from "./ErrorPage.jsx";
import {Button} from "./Buttons/Button.jsx";
import {useNavigate} from "react-router";

export const Error404 = ({
                             message = 'Page not found',
                             goBackUrl = undefined,
                         }) => {
    let navigate = useNavigate();
    const handleClick = () => {
        navigate(goBackUrl);
    }
    return <ErrorPage pageTitle="Lost in the swamp ?! This page is nowhere to be found."
                      image="error_not_found.png"
                      message={message}>
        {goBackUrl !== undefined && (
            <div className="w-100 d-flex justify-content-center align-items-center gap-md">
                <Button icon="lni-exit" onClick={handleClick}
                        type="primary" size="sm">
                    Go back to safety
                </Button>
            </div>
        )}
    </ErrorPage>
}

Error404.propTypes = {
    message: PropTypes.string,
    goBackUrl: PropTypes.string,
}
