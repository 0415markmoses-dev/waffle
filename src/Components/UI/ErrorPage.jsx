import PropTypes from "prop-types";
import {PageContentWrapper} from "../Navigation/PageContentWrapper.jsx";
import {PageElementWrapper} from "../Navigation/PageElementWrapper.jsx";
import {Row} from "./Grid/Row.jsx";
import {Col} from "./Grid/Col.jsx";
import {ErrorState} from "./ErrorState.jsx";

export const ErrorPage = ({
                              pageTitle = 'Error 404',
                              message = 'Page not found',
                              image = "error_default.jpg",
                              children = undefined,
                          }) => {
    return <PageContentWrapper>
        <PageElementWrapper>
            <Row>
                <Col>
                    <div
                        className="error-page-wrapper w-100 d-flex flex-column justify-content-center align-items-center gap-md mt-4">
                        <div className="w-100">
                            <ErrorState size="lg" image={image} message={''} grayscale={false}/>
                        </div>
                        <h1 className="text-center">{pageTitle}</h1>
                        <h3 className="text-center small text-muted">{message}</h3>
                        <div className="w-100">
                            {children}
                        </div>
                    </div>

                </Col>
            </Row>
        </PageElementWrapper>
    </PageContentWrapper>
}

ErrorPage.propTypes = {
    pageTitle: PropTypes.string,
    message: PropTypes.string,
    image: PropTypes.string,
    children: PropTypes.node,
}
