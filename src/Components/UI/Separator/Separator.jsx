import PropTypes from "prop-types";

export const Separator = ({
                              text = '',
                              className = '',
                          }) => {
    return (
        <div className={"separator d-flex align-items-center gap-sm w-75 mx-auto " + className}>
            <div className="flex-grow-1 border-bottom border-default"></div>
            {text !== '' && (
                <>
                    <span className="heading px-2 pb-1 text-muted">{text}</span>
                    <div className="flex-grow-1 border-bottom border-default"></div>
                </>
            )}
        </div>
    )
}

Separator.propTypes = {
    text: PropTypes.string,
    className: PropTypes.string,
}
