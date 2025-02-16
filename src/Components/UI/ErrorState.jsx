import PropTypes from "prop-types";

export const ErrorState = ({
                               message = "An error occurred",
                               submessage = "",
                           }) => {
    return <div className="error-state-wrapper w-100 d-flex flex-column p-1" role="alert">
        <div className="w-100 error-state-image-wrapper grayscale-content">
            <img src="/assets/error_default.jpg" alt="Error" className="error-state-image"/>
        </div>
        <div className="w-100 error-state-content d-flex flex-column justify-content-center align-items-center gap-sm">
            <div className="heading">
                {message}
            </div>
            {submessage.length > 0 && (
                <div className="error-state-submessage small">
                    {submessage}
                </div>
            )}
        </div>
    </div>
}

ErrorState.propTypes = {
    message: PropTypes.string.isRequired,
    submessage: PropTypes.string,
}
