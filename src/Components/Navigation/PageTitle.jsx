import PropTypes from "prop-types";
import {PageElementWrapper} from "./PageElementWrapper.jsx";
import {NavLink} from "react-router-dom";
import {useCurrentPath} from "../../Router/main.jsx";

export const PageTitle = ({
                              title,
                              noBreadcrumb = false,
                              breadcrumbLabel,    // overrides the active crumb label
                              breadcrumbParents,  // [{label, path}] — fully overrides auto parents when provided
                              children,
                          }) => {
    const currentRoute = useCurrentPath();
    const activeLabel = breadcrumbLabel ?? currentRoute?.label;
    const parents = breadcrumbParents ?? currentRoute?.parents ?? [];

    return (
        <PageElementWrapper>
            <div className="page-title w-100 pb-3 d-flex justify-content-between align-items-center gap-md">
                <div className="top-page-left d-flex flex-column gap-sm">
                    <h1>{title}</h1>
                    {!noBreadcrumb && (breadcrumbParents || currentRoute) && (
                        <div className="d-flex flex-row gap-sm align-items-center">
                            {parents.map((crumb, index) => (
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
    breadcrumbParents: PropTypes.arrayOf(PropTypes.shape({label: PropTypes.string, path: PropTypes.string})),
    children: PropTypes.node,
};
