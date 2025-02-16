import PropTypes from "prop-types";
import {PageElementWrapper} from "./PageElementWrapper.jsx";
import {NavLink} from "react-router-dom";
import {useCurrentPath} from "../../Router/main.jsx";

export const PageTitle = ({
                              title,
                              noBreadcrumb = false,
                              children,
                          }) => {
    const currentRoute = useCurrentPath();

    return <PageElementWrapper>
        <div className="page-title w-100 pb-3 d-flex justify-content-between align-items-center gap-md">
            <div className="top-page-left d-flex flex-column gap-sm">
                <h1>{title}</h1>
                {!noBreadcrumb && (
                    <div className="d-flex flex-row gap-sm heading align-items-center">
                        {currentRoute.parents.map((route, index) => {
                            return <NavLink key={'bcr_' + index}
                                            to={route.path}
                                            className="breadcrumb-item">{route.name}</NavLink>
                        })}
                        <span className="breadcrumb-item active-item">{currentRoute.name}</span>
                    </div>
                )}
            </div>
            <div className="top-page-right d-flex flex-row gap-sm">
                {children}
            </div>
        </div>
    </PageElementWrapper>
}

PageTitle.propTypes = {
    title: PropTypes.string.isRequired,
    noBreadcrumb: PropTypes.bool,
    children: PropTypes.node,
}
