import PropTypes from "prop-types";
import {PageElementWrapper} from "./PageElementWrapper.jsx";
import {NavLink} from "react-router-dom";
import {useCurrentPath} from "../../Router/main.jsx";

export const PageTitle = ({
                              title,
                              noBreadcrumb = false,
                              breadcrumbLabel,   // overrides the active crumb label (e.g. the release name)
                              children,
                          }) => {
    const currentRoute = useCurrentPath();
    const activeLabel = breadcrumbLabel ?? currentRoute?.label;

    return (
        <PageElementWrapper>
            <div className="page-title w-100 pb-3 d-flex justify-content-between align-items-center gap-md">
                <div className="top-page-left d-flex flex-column gap-sm">
                    <h1>{title}</h1>
                    {!noBreadcrumb && currentRoute && (
                        <div className="d-flex flex-row gap-sm align-items-center">
                            {currentRoute.parents.map((crumb, index) => (
                                <NavLink
                                    key={'bcr_' + index}
                                    to={crumb.path}
                                    className="breadcrumb-item"
                                >
                                    {crumb.label}
                                </NavLink>
                            ))}
                            <span className="breadcrumb-item active-item">{activeLabel}</span>
                        </div>
                    )}
                </div>
                <div className="top-page-right d-flex flex-row gap-sm">
                    {children}
                </div>
            </div>
        </PageElementWrapper>
    );
};

PageTitle.propTypes = {
    title: PropTypes.string.isRequired,
    noBreadcrumb: PropTypes.bool,
    breadcrumbLabel: PropTypes.string,
    children: PropTypes.node,
};
